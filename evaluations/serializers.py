import uuid
from datetime import datetime, timedelta
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    FairnessEvaluation, DriftEvaluation, RobustnessEvaluation,
    ExplainabilityEvaluation, TrustScore, EvaluationSchedule, EvaluationReport
)

User = get_user_model()


class EvaluationResultSerializer(serializers.Serializer):
    """Serializer for individual evaluation results."""
    
    metric_name = serializers.CharField(max_length=100)
    metric_value = serializers.FloatField(min_value=0, max_value=1)
    threshold = serializers.FloatField(required=False, allow_null=True)
    status = serializers.ChoiceField(choices=['pass', 'fail', 'warning'])
    details = serializers.DictField(required=False)


class FairnessEvaluationSerializer(serializers.Serializer):
    """Serializer for fairness evaluations."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField()
    model_id = serializers.CharField()
    evaluation_id = serializers.CharField(read_only=True)
    timestamp = serializers.DateTimeField(read_only=True)
    
    protected_attributes = serializers.ListField(child=serializers.CharField())
    demographic_parity = serializers.DictField(required=False)
    equal_opportunity = serializers.DictField(required=False)
    disparate_impact = serializers.DictField(required=False)
    equalized_odds = serializers.DictField(required=False)
    
    overall_fairness_score = serializers.FloatField(min_value=0, max_value=1)
    results = EvaluationResultSerializer(many=True, required=False)
    
    sample_size = serializers.IntegerField(min_value=1)
    confidence_level = serializers.FloatField(default=0.95, min_value=0, max_value=1)
    
    status = serializers.CharField(read_only=True, choices=['pending', 'running', 'completed', 'failed'])
    error_message = serializers.CharField(read_only=True, allow_null=True)
    
    configuration = serializers.DictField(required=False)
    created_by = serializers.CharField(read_only=True, allow_null=True)


class DriftEvaluationSerializer(serializers.Serializer):
    """Serializer for drift evaluations."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField()
    model_id = serializers.CharField()
    evaluation_id = serializers.CharField(read_only=True)
    timestamp = serializers.DateTimeField(read_only=True)
    
    reference_period_start = serializers.DateTimeField()
    reference_period_end = serializers.DateTimeField()
    current_period_start = serializers.DateTimeField()
    current_period_end = serializers.DateTimeField()
    
    population_stability_index = serializers.DictField(required=False)
    kl_divergence = serializers.DictField(required=False)
    wasserstein_distance = serializers.DictField(required=False)
    kolmogorov_smirnov = fields.DictField(required=False)
    
    overall_drift_score = serializers.FloatField(min_value=0, max_value=1)
    feature_drift_scores = serializers.DictField(required=False)
    prediction_distribution_drift = serializers.FloatField(required=False)
    confidence_drift = serializers.FloatField(required=False)
    
    results = EvaluationResultSerializer(many=True, required=False)
    
    reference_sample_size = serializers.IntegerField(min_value=1)
    current_sample_size = serializers.IntegerField(min_value=1)
    significance_level = serializers.FloatField(default=0.05, min_value=0, max_value=1)
    
    status = serializers.CharField(read_only=True, choices=['pending', 'running', 'completed', 'failed'])
    error_message = serializers.CharField(read_only=True, allow_null=True)
    
    configuration = serializers.DictField(required=False)
    created_by = serializers.CharField(read_only=True, allow_null=True)


class RobustnessEvaluationSerializer(serializers.Serializer):
    """Serializer for robustness evaluations."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField()
    model_id = serializers.CharField()
    evaluation_id = serializers.CharField(read_only=True)
    timestamp = serializers.DateTimeField(read_only=True)
    
    noise_robustness = serializers.DictField(required=False)
    adversarial_robustness = serializers.DictField(required=False)
    outlier_robustness = serializers.DictField(required=False)
    
    overall_robustness_score = serializers.FloatField(min_value=0, max_value=1)
    accuracy_degradation = serializers.DictField(required=False)
    confidence_stability = serializers.DictField(required=False)
    prediction_consistency = serializers.FloatField(required=False)
    
    results = EvaluationResultSerializer(many=True, required=False)
    
    test_samples = serializers.IntegerField(min_value=1)
    noise_levels = serializers.ListField(child=serializers.FloatField(), required=False)
    adversarial_methods = serializers.ListField(child=serializers.CharField(), required=False)
    
    status = serializers.CharField(read_only=True, choices=['pending', 'running', 'completed', 'failed'])
    error_message = serializers.CharField(read_only=True, allow_null=True)
    
    configuration = serializers.DictField(required=False)
    created_by = serializers.CharField(read_only=True, allow_null=True)


class ExplainabilityEvaluationSerializer(serializers.Serializer):
    """Serializer for explainability evaluations."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField()
    model_id = serializers.CharField()
    evaluation_id = serializers.CharField(read_only=True)
    timestamp = serializers.DateTimeField(read_only=True)
    
    method = serializers.CharField(max_length=50)
    feature_importance_stability = serializers.FloatField(required=False, min_value=0, max_value=1)
    feature_coverage = serializers.FloatField(required=False, min_value=0, max_value=1)
    explanation_fidelity = serializers.FloatField(required=False, min_value=0, max_value=1)
    
    overall_explainability_score = serializers.FloatField(min_value=0, max_value=1)
    feature_importance = serializers.DictField(required=False)
    feature_consistency = serializers.DictField(required=False)
    sample_explanations = serializers.ListField(child=serializers.DictField(), required=False)
    
    results = EvaluationResultSerializer(many=True, required=False)
    
    sample_size = serializers.IntegerField(min_value=1)
    explanation_samples = serializers.IntegerField(default=100, min_value=1)
    
    status = serializers.CharField(read_only=True, choices=['pending', 'running', 'completed', 'failed'])
    error_message = serializers.CharField(read_only=True, allow_null=True)
    
    configuration = serializers.DictField(required=False)
    created_by = serializers.CharField(read_only=True, allow_null=True)


class TrustScoreSerializer(serializers.Serializer):
    """Serializer for trust scores."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField()
    model_id = serializers.CharField(required=False, allow_null=True)
    
    fairness_score = serializers.FloatField(min_value=0, max_value=1)
    robustness_score = serializers.FloatField(min_value=0, max_value=1)
    stability_score = serializers.FloatField(min_value=0, max_value=1)
    explainability_score = serializers.FloatField(min_value=0, max_value=1)
    
    score = serializers.FloatField(min_value=0, max_value=1)
    weights = serializers.DictField()
    components = serializers.DictField(required=False)
    
    trend_direction = serializers.ChoiceField(choices=['improving', 'declining', 'stable'])
    trend_percentage = serializers.FloatField(default=0.0)
    
    threshold = serializers.FloatField()
    alert_triggered = serializers.BooleanField()
    
    timestamp = serializers.DateTimeField(read_only=True)
    period_start = serializers.DateTimeField(read_only=True)
    period_end = serializers.DateTimeField(read_only=True)
    
    fairness_evaluation_id = serializers.CharField(read_only=True, allow_null=True)
    robustness_evaluation_id = serializers.CharField(read_only=True, allow_null=True)
    explainability_evaluation_id = serializers.CharField(read_only=True, allow_null=True)
    drift_evaluation_id = serializers.CharField(read_only=True, allow_null=True)
    
    configuration = serializers.DictField(required=False)
    created_by = serializers.CharField(read_only=True, allow_null=True)


class TrustScoreTrendSerializer(serializers.Serializer):
    """Serializer for trust score trends."""
    
    date = serializers.DateField()
    score = serializers.FloatField(min_value=0, max_value=1)
    fairness_score = serializers.FloatField(min_value=0, max_value=1)
    robustness_score = serializers.FloatField(min_value=0, max_value=1)
    stability_score = serializers.FloatField(min_value=0, max_value=1)
    explainability_score = serializers.FloatField(min_value=0, max_value=1)


class EvaluationScheduleSerializer(serializers.Serializer):
    """Serializer for evaluation schedules."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField()
    model_id = serializers.CharField(required=False, allow_null=True)
    
    evaluation_type = serializers.ChoiceField(choices=[
        'fairness', 'drift', 'robustness', 'explainability', 'all'
    ])
    schedule = serializers.CharField()  # Cron expression
    is_active = serializers.BooleanField(default=True)
    
    last_run = serializers.DateTimeField(read_only=True, allow_null=True)
    next_run = serializers.DateTimeField(read_only=True, allow_null=True)
    
    total_runs = serializers.IntegerField(read_only=True)
    successful_runs = serializers.IntegerField(read_only=True)
    failed_runs = serializers.IntegerField(read_only=True)
    
    parameters = serializers.DictField(required=False)
    thresholds = serializers.DictField(required=False)
    
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    created_by = serializers.CharField(read_only=True, allow_null=True)


class EvaluationReportSerializer(serializers.Serializer):
    """Serializer for evaluation reports."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField()
    model_id = serializers.CharField(required=False, allow_null=True)
    
    report_id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=200)
    report_type = serializers.ChoiceField(choices=[
        'comprehensive', 'fairness', 'drift', 'robustness', 'explainability', 'trust_score'
    ])
    
    summary = serializers.CharField()
    findings = serializers.ListField(child=serializers.CharField(), required=False)
    recommendations = serializers.ListField(child=serializers.CharField(), required=False)
    
    overall_score = serializers.FloatField(required=False, min_value=0, max_value=1)
    detailed_metrics = serializers.DictField(required=False)
    charts = serializers.ListField(child=serializers.DictField(), required=False)
    
    period_start = serializers.DateTimeField()
    period_end = serializers.DateTimeField()
    
    status = serializers.CharField(read_only=True, choices=['generating', 'completed', 'failed'])
    report_file = serializers.CharField(read_only=True, allow_null=True)
    file_format = serializers.CharField(read_only=True, choices=['pdf', 'html', 'json'])
    
    created_at = serializers.DateTimeField(read_only=True)
    completed_at = serializers.DateTimeField(read_only=True, allow_null=True)
    
    configuration = serializers.DictField(required=False)
    created_by = serializers.CharField(read_only=True, allow_null=True)


class TriggerEvaluationSerializer(serializers.Serializer):
    """Serializer for triggering evaluations."""
    
    evaluation_type = serializers.ChoiceField(choices=[
        'fairness', 'drift', 'robustness', 'explainability', 'all'
    ])
    parameters = serializers.DictField(required=False)
    force_run = serializers.BooleanField(default=False)


class EvaluationQuerySerializer(serializers.Serializer):
    """Serializer for querying evaluations."""
    
    evaluation_type = serializers.ChoiceField(choices=[
        'fairness', 'drift', 'robustness', 'explainability', 'trust_score'
    ], required=False)
    
    start_date = serializers.DateTimeField(required=False)
    end_date = serializers.DateTimeField(required=False)
    status = serializers.ChoiceField(choices=[
        'pending', 'running', 'completed', 'failed'
    ], required=False)
    
    limit = serializers.IntegerField(default=20, min_value=1, max_value=100)
    offset = serializers.IntegerField(default=0, min_value=0)
    
    def validate(self, attrs):
        """Validate date range."""
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError("start_date must be before end_date")
        
        return attrs


class ModelEvaluationSummarySerializer(serializers.Serializer):
    """Serializer for model evaluation summaries."""
    
    model_id = serializers.CharField()
    latest_trust_score = serializers.FloatField()
    trust_score_trend = serializers.ChoiceField(choices=['improving', 'declining', 'stable'])
    
    latest_evaluations = serializers.DictField()
    evaluation_counts = serializers.DictField()
    
    last_evaluation = serializers.DateTimeField(allow_null=True)
    next_scheduled_evaluation = serializers.DateTimeField(allow_null=True)
    
    active_alerts = serializers.IntegerField(default=0)
    recommendations = serializers.ListField(child=serializers.CharField(), default=list)


class ProjectEvaluationSummarySerializer(serializers.Serializer):
    """Serializer for project evaluation summaries."""
    
    project_id = serializers.CharField()
    overall_trust_score = serializers.FloatField()
    trust_score_trend = serializers.ChoiceField(choices=['improving', 'declining', 'stable'])
    
    model_count = serializers.IntegerField()
    models_with_issues = serializers.IntegerField()
    models_needing_attention = serializers.IntegerField()
    
    evaluation_counts = serializers.DictField()
    latest_evaluations = serializers.DictField()
    
    active_alerts = serializers.IntegerField(default=0)
    recommendations = serializers.ListField(child=serializers.CharField(), default=list)
    
    top_issues = serializers.ListField(child=serializers.DictField(), default=list)
