import uuid
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from drf_spectacular.utils import extend_schema

from .models import (
    FairnessEvaluation, DriftEvaluation, RobustnessEvaluation,
    ExplainabilityEvaluation, TrustScore, EvaluationSchedule, EvaluationReport
)
from .serializers import (
    FairnessEvaluationSerializer, DriftEvaluationSerializer,
    RobustnessEvaluationSerializer, ExplainabilityEvaluationSerializer,
    TrustScoreSerializer, TrustScoreTrendSerializer,
    EvaluationScheduleSerializer, EvaluationReportSerializer,
    TriggerEvaluationSerializer, EvaluationQuerySerializer,
    ModelEvaluationSummarySerializer, ProjectEvaluationSummarySerializer
)
from apps.registry.models import Model
from apps.projects.permissions import IsProjectMember, IsProjectAdmin
from .tasks import (
    run_fairness_evaluation, run_drift_evaluation, run_robustness_evaluation,
    run_explainability_evaluation, calculate_trust_score, generate_evaluation_report
)


class EvaluationListView(APIView):
    """List and trigger evaluations."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="List evaluations",
        description="Get list of evaluations for a project or model"
    )
    def get(self, request, project_id, model_id=None):
        """List evaluations."""
        # Validate access
        if model_id:
            model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        # Parse query parameters
        serializer = EvaluationQuerySerializer(data=request.query_params)
        if serializer.is_valid():
            filters = serializer.validated_data
            
            # Build base query
            evaluations = []
            
            # Get fairness evaluations
            if not filters.get('evaluation_type') or filters.get('evaluation_type') == 'fairness':
                fairness_evals = FairnessEvaluation.objects(
                    project_id=project_id,
                    model_id=model_id or None
                )
                if filters.get('status'):
                    fairness_evals = fairness_evals.filter(status=filters['status'])
                if filters.get('start_date'):
                    fairness_evals = fairness_evals.filter(timestamp__gte=filters['start_date'])
                if filters.get('end_date'):
                    fairness_evals = fairness_evals.filter(timestamp__lte=filters['end_date'])
                
                for eval in fairness_evals.order_by('-timestamp'):
                    eval_dict = eval.to_mongo().to_dict()
                    eval_dict['id'] = eval_dict.pop('_id')
                    eval_dict['evaluation_type'] = 'fairness'
                    evaluations.append(eval_dict)
            
            # Get drift evaluations
            if not filters.get('evaluation_type') or filters.get('evaluation_type') == 'drift':
                drift_evals = DriftEvaluation.objects(
                    project_id=project_id,
                    model_id=model_id or None
                )
                if filters.get('status'):
                    drift_evals = drift_evals.filter(status=filters['status'])
                if filters.get('start_date'):
                    drift_evals = drift_evals.filter(timestamp__gte=filters['start_date'])
                if filters.get('end_date'):
                    drift_evals = drift_evals.filter(timestamp__lte=filters['end_date'])
                
                for eval in drift_evals.order_by('-timestamp'):
                    eval_dict = eval.to_mongo().to_dict()
                    eval_dict['id'] = eval_dict.pop('_id')
                    eval_dict['evaluation_type'] = 'drift'
                    evaluations.append(eval_dict)
            
            # Get robustness evaluations
            if not filters.get('evaluation_type') or filters.get('evaluation_type') == 'robustness':
                robust_evals = RobustnessEvaluation.objects(
                    project_id=project_id,
                    model_id=model_id or None
                )
                if filters.get('status'):
                    robust_evals = robust_evals.filter(status=filters['status'])
                if filters.get('start_date'):
                    robust_evals = robust_evals.filter(timestamp__gte=filters['start_date'])
                if filters.get('end_date'):
                    robust_evals = robust_evals.filter(timestamp__lte=filters['end_date'])
                
                for eval in robust_evals.order_by('-timestamp'):
                    eval_dict = eval.to_mongo().to_dict()
                    eval_dict['id'] = eval_dict.pop('_id')
                    eval_dict['evaluation_type'] = 'robustness'
                    evaluations.append(eval_dict)
            
            # Get explainability evaluations
            if not filters.get('evaluation_type') or filters.get('evaluation_type') == 'explainability':
                explain_evals = ExplainabilityEvaluation.objects(
                    project_id=project_id,
                    model_id=model_id or None
                )
                if filters.get('status'):
                    explain_evals = explain_evals.filter(status=filters['status'])
                if filters.get('start_date'):
                    explain_evals = explain_evals.filter(timestamp__gte=filters['start_date'])
                if filters.get('end_date'):
                    explain_evals = explain_evals.filter(timestamp__lte=filters['end_date'])
                
                for eval in explain_evals.order_by('-timestamp'):
                    eval_dict = eval.to_mongo().to_dict()
                    eval_dict['id'] = eval_dict.pop('_id')
                    eval_dict['evaluation_type'] = 'explainability'
                    evaluations.append(eval_dict)
            
            # Sort by timestamp
            evaluations.sort(key=lambda x: x['timestamp'], reverse=True)
            
            # Apply pagination
            limit = filters.get('limit', 20)
            offset = filters.get('offset', 0)
            
            total = len(evaluations)
            evaluations = evaluations[offset:offset + limit]
            
            return Response({
                'evaluations': evaluations,
                'total': total,
                'limit': limit,
                'offset': offset
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        summary="Trigger evaluation",
        description="Trigger a new evaluation for a project or model"
    )
    def post(self, request, project_id, model_id=None):
        """Trigger evaluation."""
        # Validate access
        if model_id:
            model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        serializer = TriggerEvaluationSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            evaluation_type = data['evaluation_type']
            parameters = data.get('parameters', {})
            force_run = data.get('force_run', False)
            
            # Trigger appropriate evaluation(s)
            if evaluation_type in ['fairness', 'all']:
                run_fairness_evaluation.delay(
                    project_id, model_id, parameters, force_run
                )
            
            if evaluation_type in ['drift', 'all']:
                run_drift_evaluation.delay(
                    project_id, model_id, parameters, force_run
                )
            
            if evaluation_type in ['robustness', 'all']:
                run_robustness_evaluation.delay(
                    project_id, model_id, parameters, force_run
                )
            
            if evaluation_type in ['explainability', 'all']:
                run_explainability_evaluation.delay(
                    project_id, model_id, parameters, force_run
                )
            
            # Calculate trust score if all evaluations were triggered
            if evaluation_type == 'all':
                calculate_trust_score.delay(project_id, model_id)
            
            return Response({
                'message': f'{evaluation_type} evaluation triggered',
                'project_id': project_id,
                'model_id': model_id,
                'parameters': parameters
            }, status=status.HTTP_202_ACCEPTED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TrustScoreView(APIView):
    """View and manage trust scores."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="Get trust scores",
        description="Get trust scores for a project or model"
    )
    def get(self, request, project_id, model_id=None):
        """Get trust scores."""
        # Validate access
        if model_id:
            model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        # Get trust scores
        scores = TrustScore.objects(
            project_id=project_id,
            model_id=model_id or None
        ).order_by('-timestamp')
        
        # Convert to list
        scores_data = []
        for score in scores:
            score_dict = score.to_mongo().to_dict()
            score_dict['id'] = score_dict.pop('_id')
            scores_data.append(score_dict)
        
        return Response({'trust_scores': scores_data})
    
    @extend_schema(
        summary="Calculate trust score",
        description="Manually trigger trust score calculation"
    )
    def post(self, request, project_id, model_id=None):
        """Trigger trust score calculation."""
        # Validate access
        if model_id:
            model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        # Trigger trust score calculation
        calculate_trust_score.delay(project_id, model_id)
        
        return Response({
            'message': 'Trust score calculation triggered',
            'project_id': project_id,
            'model_id': model_id
        }, status=status.HTTP_202_ACCEPTED)


class TrustScoreTrendView(APIView):
    """Get trust score trends."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="Get trust score trends",
        description="Get trust score trends over time"
    )
    def get(self, request, project_id, model_id=None):
        """Get trust score trends."""
        # Validate access
        if model_id:
            model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        # Get date range from query params
        days = int(request.query_params.get('days', 30))
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get daily trust scores
        scores = TrustScore.objects(
            project_id=project_id,
            model_id=model_id or None,
            timestamp__gte=start_date,
            timestamp__lte=end_date
        ).order_by('timestamp')
        
        # Aggregate by day
        daily_scores = {}
        for score in scores:
            date_key = score.timestamp.date()
            if date_key not in daily_scores:
                daily_scores[date_key] = []
            daily_scores[date_key].append(score)
        
        # Calculate daily averages
        trend_data = []
        for date in sorted(daily_scores.keys()):
            day_scores = daily_scores[date]
            avg_score = sum(s.score for s in day_scores) / len(day_scores)
            avg_fairness = sum(s.fairness_score for s in day_scores) / len(day_scores)
            avg_robustness = sum(s.robustness_score for s in day_scores) / len(day_scores)
            avg_stability = sum(s.stability_score for s in day_scores) / len(day_scores)
            avg_explainability = sum(s.explainability_score for s in day_scores) / len(day_scores)
            
            trend_data.append({
                'date': date.isoformat(),
                'score': avg_score,
                'fairness_score': avg_fairness,
                'robustness_score': avg_robustness,
                'stability_score': avg_stability,
                'explainability_score': avg_explainability
            })
        
        serializer = TrustScoreTrendSerializer(trend_data, many=True)
        return Response(serializer.data)


class EvaluationScheduleView(APIView):
    """Manage evaluation schedules."""
    
    permission_classes = [IsProjectAdmin]
    
    @extend_schema(
        summary="List evaluation schedules",
        description="Get evaluation schedules for a project or model"
    )
    def get(self, request, project_id, model_id=None):
        """List evaluation schedules."""
        # Validate access
        if model_id:
            model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        # Get schedules
        schedules = EvaluationSchedule.objects(
            project_id=project_id,
            model_id=model_id or None
        ).order_by('-created_at')
        
        # Convert to list
        schedules_data = []
        for schedule in schedules:
            schedule_dict = schedule.to_mongo().to_dict()
            schedule_dict['id'] = schedule_dict.pop('_id')
            schedules_data.append(schedule_dict)
        
        return Response({'schedules': schedules_data})
    
    @extend_schema(
        summary="Create evaluation schedule",
        description="Create a new evaluation schedule"
    )
    def post(self, request, project_id, model_id=None):
        """Create evaluation schedule."""
        # Validate access
        if model_id:
            model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        serializer = EvaluationScheduleSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Create schedule
            schedule = EvaluationSchedule(
                project_id=project_id,
                model_id=model_id,
                evaluation_type=data['evaluation_type'],
                schedule=data['schedule'],
                is_active=data.get('is_active', True),
                parameters=data.get('parameters', {}),
                thresholds=data.get('thresholds', {}),
                created_by=str(request.user.id)
            )
            schedule.save()
            
            return Response(
                EvaluationScheduleSerializer(schedule).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EvaluationReportView(APIView):
    """Manage evaluation reports."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="List evaluation reports",
        description="Get evaluation reports for a project or model"
    )
    def get(self, request, project_id, model_id=None):
        """List evaluation reports."""
        # Validate access
        if model_id:
            model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        # Get reports
        reports = EvaluationReport.objects(
            project_id=project_id,
            model_id=model_id or None
        ).order_by('-created_at')
        
        # Convert to list
        reports_data = []
        for report in reports:
            report_dict = report.to_mongo().to_dict()
            report_dict['id'] = report_dict.pop('_id')
            reports_data.append(report_dict)
        
        return Response({'reports': reports_data})
    
    @extend_schema(
        summary="Generate evaluation report",
        description="Generate a new evaluation report"
    )
    def post(self, request, project_id, model_id=None):
        """Generate evaluation report."""
        # Validate access
        if model_id:
            model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        report_type = request.data.get('report_type', 'comprehensive')
        title = request.data.get('title', f'{report_type.title()} Report')
        period_start = request.data.get('period_start')
        period_end = request.data.get('period_end')
        
        # Set default period if not provided
        if not period_start:
            period_start = datetime.utcnow() - timedelta(days=30)
        if not period_end:
            period_end = datetime.utcnow()
        
        # Create report
        report = EvaluationReport(
            project_id=project_id,
            model_id=model_id,
            report_id=str(uuid.uuid4()),
            title=title,
            report_type=report_type,
            period_start=period_start,
            period_end=period_end,
            created_by=str(request.user.id)
        )
        report.save()
        
        # Trigger report generation
        generate_evaluation_report.delay(str(report.id))
        
        return Response(
            EvaluationReportSerializer(report).data,
            status=status.HTTP_201_CREATED
        )


class ModelEvaluationSummaryView(APIView):
    """Get evaluation summary for a model."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="Get model evaluation summary",
        description="Get comprehensive evaluation summary for a model"
    )
    def get(self, request, project_id, model_id):
        """Get model evaluation summary."""
        # Validate access
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        # Get latest trust score
        latest_trust_score = TrustScore.objects(
            project_id=project_id,
            model_id=model_id
        ).order_by('-timestamp').first()
        
        # Get latest evaluations
        latest_fairness = FairnessEvaluation.objects(
            project_id=project_id,
            model_id=model_id,
            status='completed'
        ).order_by('-timestamp').first()
        
        latest_drift = DriftEvaluation.objects(
            project_id=project_id,
            model_id=model_id,
            status='completed'
        ).order_by('-timestamp').first()
        
        latest_robustness = RobustnessEvaluation.objects(
            project_id=project_id,
            model_id=model_id,
            status='completed'
        ).order_by('-timestamp').first()
        
        latest_explainability = ExplainabilityEvaluation.objects(
            project_id=project_id,
            model_id=model_id,
            status='completed'
        ).order_by('-timestamp').first()
        
        # Get evaluation counts
        fairness_count = FairnessEvaluation.objects(
            project_id=project_id,
            model_id=model_id
        ).count()
        
        drift_count = DriftEvaluation.objects(
            project_id=project_id,
            model_id=model_id
        ).count()
        
        robustness_count = RobustnessEvaluation.objects(
            project_id=project_id,
            model_id=model_id
        ).count()
        
        explainability_count = ExplainabilityEvaluation.objects(
            project_id=project_id,
            model_id=model_id
        ).count()
        
        # Build summary
        summary = {
            'model_id': model_id,
            'latest_trust_score': latest_trust_score.score if latest_trust_score else 0,
            'trust_score_trend': latest_trust_score.trend_direction if latest_trust_score else 'stable',
            
            'latest_evaluations': {
                'fairness': {
                    'score': latest_fairness.overall_fairness_score if latest_fairness else None,
                    'timestamp': latest_fairness.timestamp.isoformat() if latest_fairness else None
                },
                'drift': {
                    'score': latest_drift.overall_drift_score if latest_drift else None,
                    'timestamp': latest_drift.timestamp.isoformat() if latest_drift else None
                },
                'robustness': {
                    'score': latest_robustness.overall_robustness_score if latest_robustness else None,
                    'timestamp': latest_robustness.timestamp.isoformat() if latest_robustness else None
                },
                'explainability': {
                    'score': latest_explainability.overall_explainability_score if latest_explainability else None,
                    'timestamp': latest_explainability.timestamp.isoformat() if latest_explainability else None
                }
            },
            
            'evaluation_counts': {
                'fairness': fairness_count,
                'drift': drift_count,
                'robustness': robustness_count,
                'explainability': explainability_count
            },
            
            'last_evaluation': max([
                latest_fairness.timestamp if latest_fairness else datetime.min,
                latest_drift.timestamp if latest_drift else datetime.min,
                latest_robustness.timestamp if latest_robustness else datetime.min,
                latest_explainability.timestamp if latest_explainability else datetime.min
            ]).isoformat() if any([latest_fairness, latest_drift, latest_robustness, latest_explainability]) else None,
            
            'active_alerts': 0,  # TODO: Implement alert counting
            'recommendations': []  # TODO: Generate recommendations
        }
        
        serializer = ModelEvaluationSummarySerializer(summary)
        return Response(serializer.data)


class ProjectEvaluationSummaryView(APIView):
    """Get evaluation summary for a project."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="Get project evaluation summary",
        description="Get comprehensive evaluation summary for a project"
    )
    def get(self, request, project_id):
        """Get project evaluation summary."""
        # Validate project exists
        from apps.projects.models import Project
        project = get_object_or_404(Project, id=project_id)
        
        # Get models in project
        models = Model.objects(project_id=project_id, is_active=True)
        model_count = models.count()
        
        # Get project-level trust score
        latest_trust_score = TrustScore.objects(
            project_id=project_id,
            model_id=None
        ).order_by('-timestamp').first()
        
        # Count models with issues (trust score < threshold)
        models_with_issues = 0
        models_needing_attention = 0
        
        for model in models:
            model_trust_score = TrustScore.objects(
                project_id=project_id,
                model_id=str(model.id)
            ).order_by('-timestamp').first()
            
            if model_trust_score:
                if model_trust_score.score < 0.5:
                    models_with_issues += 1
                elif model_trust_score.score < 0.7:
                    models_needing_attention += 1
        
        # Get evaluation counts
        fairness_count = FairnessEvaluation.objects(project_id=project_id).count()
        drift_count = DriftEvaluation.objects(project_id=project_id).count()
        robustness_count = RobustnessEvaluation.objects(project_id=project_id).count()
        explainability_count = ExplainabilityEvaluation.objects(project_id=project_id).count()
        
        # Build summary
        summary = {
            'project_id': project_id,
            'overall_trust_score': latest_trust_score.score if latest_trust_score else 0,
            'trust_score_trend': latest_trust_score.trend_direction if latest_trust_score else 'stable',
            
            'model_count': model_count,
            'models_with_issues': models_with_issues,
            'models_needing_attention': models_needing_attention,
            
            'evaluation_counts': {
                'fairness': fairness_count,
                'drift': drift_count,
                'robustness': robustness_count,
                'explainability': explainability_count
            },
            
            'active_alerts': 0,  # TODO: Implement alert counting
            'recommendations': [],  # TODO: Generate recommendations
            'top_issues': []  # TODO: Identify top issues
        }
        
        serializer = ProjectEvaluationSummarySerializer(summary)
        return Response(serializer.data)
