import uuid
import csv
import io
import json
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from drf_spectacular.utils import extend_schema
from django.db import transaction
from django.utils import timezone

from .models import (
    Prediction, IngestionBatch, FeatureImportance, DataStream,
    IngestionMetrics, DataQualityReport
)
from .serializers import (
    PredictionSerializer, BatchPredictionSerializer, CSVUploadSerializer,
    IngestionBatchSerializer, FeatureImportanceSerializer, DataStreamSerializer,
    GroundTruthUpdateSerializer, PredictionQuerySerializer, ModelIngestionStatsSerializer
)
from apps.registry.models import Model
from apps.projects.permissions import IsProjectMember, IsProjectAdmin
from .tasks import process_batch_predictions, calculate_ingestion_metrics


class PredictionPagination(PageNumberPagination):
    """Custom pagination for predictions."""
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000


class PredictionIngestionView(APIView):
    """Handle individual and batch prediction ingestion."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="Ingest predictions",
        description="Submit predictions for monitoring and evaluation"
    )
    def post(self, request, project_id, model_id):
        """Handle prediction ingestion."""
        # Validate model exists and user has access
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        # Handle batch vs single prediction
        if 'predictions' in request.data:
            return self._handle_batch_ingestion(request, project_id, model_id)
        else:
            return self._handle_single_ingestion(request, project_id, model_id)
    
    def _handle_single_ingestion(self, request, project_id, model_id):
        """Handle single prediction ingestion."""
        serializer = PredictionSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Create prediction record
            prediction = Prediction(
                project_id=project_id,
                model_id=model_id,
                prediction_id=data['prediction_id'],
                timestamp=data.get('timestamp', datetime.utcnow()),
                features=data['features'],
                prediction=data['prediction'],
                confidence=data.get('confidence'),
                prediction_proba=data.get('prediction_proba'),
                true_label=data.get('true_label'),
                true_label_timestamp=data.get('true_label_timestamp'),
                request_id=data.get('request_id'),
                user_id=data.get('user_id'),
                session_id=data.get('session_id'),
                context=data.get('context', {})
            )
            prediction.save()
            
            # Trigger async processing for anomaly detection, etc.
            from .tasks import process_single_prediction
            process_single_prediction.delay(str(prediction.id))
            
            return Response(
                {'message': 'Prediction ingested successfully', 'prediction_id': prediction.id},
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _handle_batch_ingestion(self, request, project_id, model_id):
        """Handle batch prediction ingestion."""
        serializer = BatchPredictionSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            predictions = data['predictions']
            batch_id = data.get('batch_id', str(uuid.uuid4()))
            metadata = data.get('metadata', {})
            
            # Create batch record
            batch = IngestionBatch(
                project_id=project_id,
                model_id=model_id,
                batch_id=batch_id,
                source='api',
                format='json',
                total_records=len(predictions),
                metadata=metadata
            )
            batch.save()
            
            # Queue batch processing
            process_batch_predictions.delay(
                batch_id=str(batch.id),
                predictions=predictions,
                project_id=project_id,
                model_id=model_id
            )
            
            return Response(
                {
                    'message': f'Batch {batch_id} queued for processing',
                    'batch_id': batch.id,
                    'total_records': len(predictions)
                },
                status=status.HTTP_202_ACCEPTED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CSVUploadView(APIView):
    """Handle CSV file uploads for prediction ingestion."""
    
    permission_classes = [IsProjectMember]
    parser_classes = [MultiPartParser, FormParser]
    
    @extend_schema(
        summary="Upload CSV predictions",
        description="Upload predictions from a CSV file"
    )
    def post(self, request, project_id, model_id):
        """Handle CSV file upload."""
        # Validate model exists
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        serializer = CSVUploadSerializer(data=request.data)
        if serializer.is_valid():
            csv_file = serializer.validated_data['file']
            batch_id = serializer.validated_data.get('batch_id', str(uuid.uuid4()))
            column_mapping = serializer.validated_data.get('column_mapping', {})
            has_header = serializer.validated_data.get('has_header', True)
            
            try:
                # Parse CSV file
                predictions = self._parse_csv_file(
                    csv_file, column_mapping, has_header
                )
                
                # Create batch record
                batch = IngestionBatch(
                    project_id=project_id,
                    model_id=model_id,
                    batch_id=batch_id,
                    source='csv_upload',
                    format='csv',
                    total_records=len(predictions),
                    metadata={
                        'filename': csv_file.name,
                        'file_size': csv_file.size,
                        'column_mapping': column_mapping,
                        'has_header': has_header
                    }
                )
                batch.save()
                
                # Queue batch processing
                process_batch_predictions.delay(
                    batch_id=str(batch.id),
                    predictions=predictions,
                    project_id=project_id,
                    model_id=model_id
                )
                
                return Response(
                    {
                        'message': f'CSV file uploaded and batch {batch_id} queued for processing',
                        'batch_id': batch.id,
                        'total_records': len(predictions)
                    },
                    status=status.HTTP_202_ACCEPTED
                )
                
            except Exception as e:
                return Response(
                    {'error': f'Error processing CSV file: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _parse_csv_file(self, csv_file, column_mapping, has_header):
        """Parse CSV file and convert to prediction format."""
        predictions = []
        
        # Read CSV content
        csv_content = csv_file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_content)) if has_header else csv.reader(io.StringIO(csv_content))
        
        # Default column mapping if not provided
        default_mapping = {
            'prediction_id': 'prediction_id',
            'features': 'features',
            'prediction': 'prediction',
            'confidence': 'confidence',
            'true_label': 'true_label'
        }
        mapping = {**default_mapping, **column_mapping}
        
        for row_num, row in enumerate(csv_reader, 1):
            try:
                # Parse features (JSON string or comma-separated)
                features_str = row.get(mapping['features'], '{}')
                try:
                    features = json.loads(features_str) if features_str.startswith('{') else {}
                except:
                    # Handle comma-separated features
                    features = {f'feature_{i}': val for i, val in enumerate(features_str.split(','))}
                
                # Parse prediction
                prediction_str = row.get(mapping['prediction'], '')
                try:
                    prediction = json.loads(prediction_str)
                except:
                    prediction = prediction_str
                
                # Parse confidence
                confidence = None
                if mapping['confidence'] in row:
                    try:
                        confidence = float(row[mapping['confidence']])
                    except:
                        pass
                
                # Parse true label
                true_label = None
                if mapping['true_label'] in row:
                    try:
                        true_label = json.loads(row[mapping['true_label']])
                    except:
                        true_label = row[mapping['true_label']]
                
                predictions.append({
                    'prediction_id': row.get(mapping['prediction_id'], f'csv_{row_num}'),
                    'features': features,
                    'prediction': prediction,
                    'confidence': confidence,
                    'true_label': true_label
                })
                
            except Exception as e:
                raise Exception(f"Error parsing row {row_num}: {str(e)}")
        
        return predictions


class GroundTruthUpdateView(APIView):
    """Update ground truth labels for predictions."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="Update ground truth",
        description="Update ground truth labels for existing predictions"
    )
    def post(self, request, project_id, model_id):
        """Handle ground truth updates."""
        # Validate model exists
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        serializer = GroundTruthUpdateSerializer(data=request.data)
        if serializer.is_valid():
            updates = serializer.validated_data['predictions']
            updated_count = 0
            
            for update in updates:
                prediction_id = update['prediction_id']
                true_label = update['true_label']
                true_label_timestamp = update.get('true_label_timestamp', datetime.utcnow())
                
                # Update prediction
                result = Prediction.objects(
                    project_id=project_id,
                    model_id=model_id,
                    prediction_id=prediction_id
                ).update(
                    true_label=true_label,
                    true_label_timestamp=true_label_timestamp
                )
                
                if result:
                    updated_count += 1
            
            # Trigger evaluation if ground truth was updated
            if updated_count > 0:
                from .tasks import trigger_evaluation_for_ground_truth
                trigger_evaluation_for_ground_truth.delay(project_id, model_id)
            
            return Response({
                'message': f'Updated ground truth for {updated_count} predictions',
                'updated_count': updated_count
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PredictionQueryView(APIView):
    """Query predictions with filters."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="Query predictions",
        description="Query predictions with various filters"
    )
    def get(self, request, project_id, model_id):
        """Handle prediction queries."""
        # Validate model exists
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        serializer = PredictionQuerySerializer(data=request.query_params)
        if serializer.is_valid():
            filters = serializer.validated_data
            
            # Build query
            query_filter = {
                'project_id': project_id,
                'model_id': model_id
            }
            
            if filters.get('start_date'):
                query_filter['timestamp__gte'] = filters['start_date']
            
            if filters.get('end_date'):
                query_filter['timestamp__lte'] = filters['end_date']
            
            if 'has_ground_truth' in filters:
                if filters['has_ground_truth']:
                    query_filter['true_label__ne'] = None
                else:
                    query_filter['true_label'] = None
            
            if 'is_anomaly' in filters:
                query_filter['is_anomaly'] = filters['is_anomaly']
            
            if filters.get('user_id'):
                query_filter['user_id'] = filters['user_id']
            
            if filters.get('session_id'):
                query_filter['session_id'] = filters['session_id']
            
            # Execute query
            predictions = Prediction.objects(**query_filter).order_by('-timestamp')
            
            # Apply pagination
            limit = filters.get('limit', 100)
            offset = filters.get('offset', 0)
            
            total = predictions.count()
            predictions = predictions.skip(offset).limit(limit)
            
            # Convert to list and serialize
            predictions_data = []
            for pred in predictions:
                pred_dict = pred.to_mongo().to_dict()
                pred_dict['id'] = pred_dict.pop('_id')
                predictions_data.append(pred_dict)
            
            return Response({
                'predictions': predictions_data,
                'total': total,
                'limit': limit,
                'offset': offset
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FeatureImportanceView(APIView):
    """Handle feature importance data."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="Submit feature importance",
        description="Submit feature importance/explanation data"
    )
    def post(self, request, project_id, model_id):
        """Handle feature importance submission."""
        # Validate model exists
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        serializer = FeatureImportanceSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Create feature importance record
            feature_importance = FeatureImportance(
                project_id=project_id,
                model_id=model_id,
                prediction_id=data['prediction_id'],
                method=data['method'],
                feature_values=data['feature_values'],
                baseline_value=data.get('baseline_value'),
                is_global=data.get('is_global', False),
                global_feature_importance=data.get('global_feature_importance'),
                computation_time_ms=data.get('computation_time_ms'),
                parameters=data.get('parameters', {}),
                timestamp=data.get('timestamp', datetime.utcnow())
            )
            feature_importance.save()
            
            return Response(
                {'message': 'Feature importance data saved successfully'},
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IngestionBatchView(APIView):
    """View and manage ingestion batches."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="List ingestion batches",
        description="Get list of ingestion batches for a model"
    )
    def get(self, request, project_id, model_id):
        """List ingestion batches."""
        # Validate model exists
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        # Get batches
        batches = IngestionBatch.objects(
            project_id=project_id,
            model_id=model_id
        ).order_by('-created_at')
        
        # Convert to list and serialize
        batches_data = []
        for batch in batches:
            batch_dict = batch.to_mongo().to_dict()
            batch_dict['id'] = batch_dict.pop('_id')
            batches_data.append(batch_dict)
        
        return Response({'batches': batches_data})


class ModelIngestionStatsView(APIView):
    """Get ingestion statistics for a model."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="Get ingestion statistics",
        description="Get ingestion statistics for a model"
    )
    def get(self, request, project_id, model_id):
        """Get model ingestion statistics."""
        # Validate model exists
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        # Calculate statistics
        now = datetime.utcnow()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Total predictions
        total_predictions = Prediction.objects(
            project_id=project_id,
            model_id=model_id
        ).count()
        
        # Time-based counts
        predictions_today = Prediction.objects(
            project_id=project_id,
            model_id=model_id,
            timestamp__gte=today
        ).count()
        
        predictions_this_week = Prediction.objects(
            project_id=project_id,
            model_id=model_id,
            timestamp__gte=week_ago
        ).count()
        
        predictions_this_month = Prediction.objects(
            project_id=project_id,
            model_id=model_id,
            timestamp__gte=month_ago
        ).count()
        
        # Ground truth rate
        predictions_with_gt = Prediction.objects(
            project_id=project_id,
            model_id=model_id,
            true_label__ne=None
        ).count()
        
        ground_truth_rate = predictions_with_gt / total_predictions if total_predictions > 0 else 0
        
        # Anomaly rate
        anomaly_count = Prediction.objects(
            project_id=project_id,
            model_id=model_id,
            is_anomaly=True
        ).count()
        
        anomaly_rate = anomaly_count / total_predictions if total_predictions > 0 else 0
        
        # Average confidence
        avg_confidence = 0
        if total_predictions > 0:
            confidence_sum = Prediction.objects(
                project_id=project_id,
                model_id=model_id,
                confidence__ne=None
            ).sum('confidence') or 0
            confidence_count = Prediction.objects(
                project_id=project_id,
                model_id=model_id,
                confidence__ne=None
            ).count()
            avg_confidence = confidence_sum / confidence_count if confidence_count > 0 else 0
        
        # Last prediction
        last_prediction = Prediction.objects(
            project_id=project_id,
            model_id=model_id
        ).order_by('-timestamp').first()
        
        last_prediction_time = last_prediction.timestamp if last_prediction else None
        
        # Calculate daily average (last 30 days)
        days_30_ago = now - timedelta(days=30)
        daily_avg = predictions_this_month / 30 if predictions_this_month > 0 else 0
        
        # Get top features (simplified - would need aggregation pipeline)
        top_features = []  # TODO: Implement feature frequency analysis
        
        # Get prediction trend (last 7 days)
        prediction_trend = []
        for i in range(7):
            day = today - timedelta(days=i)
            day_end = day + timedelta(days=1)
            count = Prediction.objects(
                project_id=project_id,
                model_id=model_id,
                timestamp__gte=day,
                timestamp__lt=day_end
            ).count()
            prediction_trend.append({
                'date': day.isoformat(),
                'count': count
            })
        
        stats = {
            'model_id': model_id,
            'total_predictions': total_predictions,
            'predictions_today': predictions_today,
            'predictions_this_week': predictions_this_week,
            'predictions_this_month': predictions_this_month,
            'avg_predictions_per_day': daily_avg,
            'ground_truth_rate': ground_truth_rate,
            'anomaly_rate': anomaly_rate,
            'avg_confidence': avg_confidence,
            'last_prediction': last_prediction_time.isoformat() if last_prediction_time else None,
            'top_features': top_features,
            'prediction_trend': list(reversed(prediction_trend))
        }
        
        serializer = ModelIngestionStatsSerializer(stats)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsProjectAdmin])
@extend_schema(
    summary="Trigger metrics calculation",
    description="Manually trigger ingestion metrics calculation"
)
def trigger_metrics_calculation(request, project_id, model_id):
    """Trigger metrics calculation for a model."""
    # Validate model exists
    model = get_object_or_404(Model, id=model_id, project_id=project_id)
    
    # Trigger async task
    calculate_ingestion_metrics.delay(project_id, model_id)
    
    return Response({
        'message': 'Metrics calculation triggered',
        'project_id': project_id,
        'model_id': model_id
    })
