import json
import logging
from datetime import datetime, timedelta
from celery import shared_task
from django.utils import timezone
from mongoengine import Q

from .models import Prediction, IngestionBatch, IngestionMetrics, DataQualityReport
from apps.registry.models import Model

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_batch_predictions(self, batch_id, predictions, project_id, model_id):
    """Process a batch of predictions asynchronously."""
    try:
        # Get batch record
        batch = IngestionBatch.objects.get(id=batch_id)
        batch.status = 'processing'
        batch.started_at = datetime.utcnow()
        batch.save()
        
        processed_count = 0
        failed_count = 0
        
        # Process each prediction
        for pred_data in predictions:
            try:
                prediction = Prediction(
                    project_id=project_id,
                    model_id=model_id,
                    prediction_id=pred_data['prediction_id'],
                    timestamp=pred_data.get('timestamp', datetime.utcnow()),
                    features=pred_data['features'],
                    prediction=pred_data['prediction'],
                    confidence=pred_data.get('confidence'),
                    prediction_proba=pred_data.get('prediction_proba'),
                    true_label=pred_data.get('true_label'),
                    true_label_timestamp=pred_data.get('true_label_timestamp'),
                    request_id=pred_data.get('request_id'),
                    user_id=pred_data.get('user_id'),
                    session_id=pred_data.get('session_id'),
                    context=pred_data.get('context', {}),
                    batch_id=batch_id
                )
                prediction.save()
                processed_count += 1
                
                # Trigger individual prediction processing
                process_single_prediction.delay(str(prediction.id))
                
            except Exception as e:
                failed_count += 1
                logger.error(f"Error processing prediction {pred_data.get('prediction_id', 'unknown')}: {str(e)}")
        
        # Update batch status
        batch.processed_records = processed_count
        batch.failed_records = failed_count
        batch.status = 'completed'
        batch.completed_at = datetime.utcnow()
        batch.save()
        
        logger.info(f"Batch {batch_id} processed: {processed_count} successful, {failed_count} failed")
        
        # Trigger metrics calculation
        calculate_ingestion_metrics.delay(project_id, model_id)
        
    except Exception as exc:
        logger.error(f"Error processing batch {batch_id}: {str(exc)}")
        
        # Update batch status to failed
        try:
            batch = IngestionBatch.objects.get(id=batch_id)
            batch.status = 'failed'
            batch.error_message = str(exc)
            batch.completed_at = datetime.utcnow()
            batch.save()
        except:
            pass
        
        # Retry the task
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def process_single_prediction(self, prediction_id):
    """Process a single prediction for anomaly detection and quality checks."""
    try:
        prediction = Prediction.objects.get(id=prediction_id)
        
        # Perform anomaly detection
        detect_anomalies(prediction)
        
        # Perform data quality checks
        check_data_quality(prediction)
        
        # Calculate processing time if not set
        if not prediction.processing_time_ms:
            # Estimate based on timestamp difference
            if prediction.timestamp:
                time_diff = datetime.utcnow() - prediction.timestamp
                prediction.processing_time_ms = int(time_diff.total_seconds() * 1000)
                prediction.save()
        
    except Exception as exc:
        logger.error(f"Error processing prediction {prediction_id}: {str(exc)}")
        raise self.retry(exc=exc, countdown=30)


def detect_anomalies(prediction):
    """Detect anomalies in prediction data."""
    try:
        # Simple anomaly detection based on feature values
        # This is a placeholder - in production, you'd use more sophisticated methods
        
        features = prediction.features
        anomaly_score = 0
        is_anomaly = False
        
        # Check for missing values
        missing_count = sum(1 for v in features.values() if v is None or v == '')
        if missing_count > len(features) * 0.5:  # More than 50% missing
            anomaly_score += 0.5
            is_anomaly = True
        
        # Check for extreme values (simplified)
        for key, value in features.items():
            if isinstance(value, (int, float)):
                # Simple outlier detection using IQR method
                # In production, you'd use precomputed statistics
                if abs(value) > 1000:  # Arbitrary threshold
                    anomaly_score += 0.1
        
        # Update prediction with anomaly information
        prediction.is_anomaly = is_anomaly
        prediction.anomaly_score = min(anomaly_score, 1.0)
        prediction.save()
        
    except Exception as e:
        logger.error(f"Error in anomaly detection for prediction {prediction.id}: {str(e)}")


def check_data_quality(prediction):
    """Check data quality for prediction."""
    try:
        # Simple data quality checks
        quality_issues = []
        
        # Check feature completeness
        features = prediction.features
        if not features:
            quality_issues.append("No features provided")
        else:
            missing_features = [k for k, v in features.items() if v is None or v == '']
            if missing_features:
                quality_issues.append(f"Missing features: {missing_features}")
        
        # Check prediction validity
        if prediction.prediction is None:
            quality_issues.append("No prediction provided")
        
        # Check confidence range
        if prediction.confidence is not None and (prediction.confidence < 0 or prediction.confidence > 1):
            quality_issues.append("Confidence out of range [0,1]")
        
        # Store quality issues in context
        if quality_issues:
            if not prediction.context:
                prediction.context = {}
            prediction.context['quality_issues'] = quality_issues
            prediction.save()
        
    except Exception as e:
        logger.error(f"Error in data quality check for prediction {prediction.id}: {str(e)}")


@shared_task
def calculate_ingestion_metrics(project_id, model_id):
    """Calculate and store ingestion metrics for a model."""
    try:
        now = datetime.utcnow()
        
        # Calculate metrics for different time windows
        windows = [60, 360, 1440]  # 1 hour, 6 hours, 24 hours
        
        for window_minutes in windows:
            window_start = now - timedelta(minutes=window_minutes)
            
            # Get predictions in window
            predictions = Prediction.objects(
                project_id=project_id,
                model_id=model_id,
                timestamp__gte=window_start,
                timestamp__lte=now
            )
            
            total_predictions = predictions.count()
            
            if total_predictions == 0:
                continue
            
            # Calculate metrics
            unique_predictions = predictions.distinct('prediction_id').count()
            predictions_with_gt = predictions(true_label__ne=None).count()
            anomaly_count = predictions(is_anomaly=True).count()
            
            # Processing time metrics
            processing_times = [p.processing_time_ms for p in predictions if p.processing_time_ms]
            avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0
            max_processing_time = max(processing_times) if processing_times else 0
            
            # Data lag (time between prediction and ground truth)
            data_lags = []
            for p in predictions:
                if p.true_label_timestamp and p.timestamp:
                    lag = (p.true_label_timestamp - p.timestamp).total_seconds()
                    if lag >= 0:
                        data_lags.append(lag)
            
            avg_data_lag = sum(data_lags) / len(data_lags) if data_lags else 0
            max_data_lag = max(data_lags) if data_lags else 0
            
            # Error rate (simplified - based on processing failures)
            error_rate = 0  # Would need to track actual errors
            
            # Create or update metrics record
            metrics = IngestionMetrics.objects(
                project_id=project_id,
                model_id=model_id,
                timestamp=now,
                window_minutes=window_minutes
            ).modify(
                upsert=True,
                new=True,
                set__total_predictions=total_predictions,
                set__unique_predictions=unique_predictions,
                set__predictions_with_ground_truth=predictions_with_gt,
                set__anomaly_count=anomaly_count,
                set__high_drift_count=0,  # Would need drift detection
                set__avg_processing_time_ms=avg_processing_time,
                set__max_processing_time_ms=max_processing_time,
                set__avg_data_lag_seconds=avg_data_lag,
                set__max_data_lag_seconds=max_data_lag,
                set__error_rate=error_rate,
                set__timeout_count=0
            )
        
        logger.info(f"Calculated ingestion metrics for model {model_id}")
        
    except Exception as e:
        logger.error(f"Error calculating ingestion metrics for model {model_id}: {str(e)}")


@shared_task
def trigger_evaluation_for_ground_truth(project_id, model_id):
    """Trigger evaluation when new ground truth is available."""
    try:
        # Get recent predictions with new ground truth
        recent_time = datetime.utcnow() - timedelta(hours=1)
        predictions_with_gt = Prediction.objects(
            project_id=project_id,
            model_id=model_id,
            true_label__ne=None,
            true_label_timestamp__gte=recent_time
        )
        
        if predictions_with_gt.count() > 0:
            # Trigger evaluation tasks
            from apps.evaluations.tasks import run_fairness_evaluation, run_drift_evaluation, run_robustness_evaluation
            
            run_fairness_evaluation.delay(project_id, model_id)
            run_drift_evaluation.delay(project_id, model_id)
            run_robustness_evaluation.delay(project_id, model_id)
            
            logger.info(f"Triggered evaluation for model {model_id} due to new ground truth")
        
    except Exception as e:
        logger.error(f"Error triggering evaluation for model {model_id}: {str(e)}")


@shared_task
def cleanup_old_data():
    """Clean up old prediction data to manage storage."""
    try:
        # Delete predictions older than 1 year
        cutoff_date = datetime.utcnow() - timedelta(days=365)
        
        old_predictions = Prediction.objects(timestamp__lt=cutoff_date)
        count = old_predictions.count()
        
        if count > 0:
            # Delete in batches to avoid memory issues
            batch_size = 10000
            deleted_count = 0
            
            while deleted_count < count:
                batch = old_predictions.limit(batch_size)
                batch.delete()
                deleted_count += batch_size
                logger.info(f"Deleted {min(batch_size, count - deleted_count)} old predictions")
            
            logger.info(f"Cleanup completed: deleted {count} old predictions")
        
    except Exception as e:
        logger.error(f"Error in cleanup_old_data: {str(e)}")


@shared_task
def generate_data_quality_report(project_id, model_id, report_type='data_quality'):
    """Generate data quality report for a model."""
    try:
        now = datetime.utcnow()
        period_start = now - timedelta(days=7)  # Last 7 days
        
        # Get predictions in period
        predictions = Prediction.objects(
            project_id=project_id,
            model_id=model_id,
            timestamp__gte=period_start,
            timestamp__lte=now
        )
        
        total_predictions = predictions.count()
        
        if total_predictions == 0:
            logger.info(f"No predictions found for model {model_id} in the last 7 days")
            return
        
        # Calculate quality metrics
        issues = []
        recommendations = []
        overall_score = 1.0
        
        # Check missing data rate
        predictions_with_missing = 0
        for pred in predictions:
            if any(v is None or v == '' for v in pred.features.values()):
                predictions_with_missing += 1
        
        missing_rate = predictions_with_missing / total_predictions
        if missing_rate > 0.1:  # More than 10% missing
            issues.append({
                'type': 'high_missing_rate',
                'severity': 'warning',
                'message': f'High missing data rate: {missing_rate:.2%}',
                'value': missing_rate
            })
            recommendations.append('Implement data validation and imputation')
            overall_score -= 0.2
        
        # Check anomaly rate
        anomaly_count = predictions(is_anomaly=True).count()
        anomaly_rate = anomaly_count / total_predictions
        if anomaly_rate > 0.05:  # More than 5% anomalies
            issues.append({
                'type': 'high_anomaly_rate',
                'severity': 'warning',
                'message': f'High anomaly rate: {anomaly_rate:.2%}',
                'value': anomaly_rate
            })
            recommendations.append('Investigate data sources and preprocessing pipeline')
            overall_score -= 0.15
        
        # Check ground truth availability
        gt_count = predictions(true_label__ne=None).count()
        gt_rate = gt_count / total_predictions
        if gt_rate < 0.5:  # Less than 50% ground truth
            issues.append({
                'type': 'low_ground_truth_rate',
                'severity': 'info',
                'message': f'Low ground truth rate: {gt_rate:.2%}',
                'value': gt_rate
            })
            recommendations.append('Improve ground truth collection processes')
            overall_score -= 0.1
        
        # Create report
        metrics = {
            'total_predictions': total_predictions,
            'missing_rate': missing_rate,
            'anomaly_rate': anomaly_rate,
            'ground_truth_rate': gt_rate,
            'unique_features': len(set().union(*[p.features.keys() for p in predictions])),
            'avg_feature_count': sum(len(p.features) for p in predictions) / total_predictions
        }
        
        report = DataQualityReport(
            project_id=project_id,
            model_id=model_id,
            report_type=report_type,
            overall_score=max(0, overall_score),
            issues=issues,
            recommendations=recommendations,
            metrics=metrics,
            timestamp=now,
            period_start=period_start,
            period_end=now
        )
        report.save()
        
        logger.info(f"Generated data quality report for model {model_id}: score {overall_score:.2f}")
        
    except Exception as e:
        logger.error(f"Error generating data quality report for model {model_id}: {str(e)}")
