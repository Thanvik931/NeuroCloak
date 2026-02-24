import uuid
from datetime import datetime
from mongoengine import Document, EmbeddedDocument, fields, DynamicDocument
from django.contrib.auth import get_user_model

from apps.registry.models import Model

User = get_user_model()


class EvaluationResult(EmbeddedDocument):
    """Embedded document for individual evaluation results."""
    
    metric_name = fields.StringField(required=True)
    metric_value = fields.FloatField(required=True)
    threshold = fields.FloatField(required=False)
    status = fields.StringField(
        required=True,
        choices=['pass', 'fail', 'warning'],
        default='pass'
    )
    details = fields.DictField(required=False)
    
    meta = {
        'indexes': [
            ('metric_name',),
            ('status',),
        ]
    }


class FairnessEvaluation(DynamicDocument):
    """Fairness evaluation results for models."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    model_id = fields.StringField(required=True)
    
    # Evaluation metadata
    evaluation_id = fields.StringField(required=True, unique_with=['project_id', 'model_id'])
    timestamp = fields.DateTimeField(required=True, default=datetime.utcnow)
    
    # Protected attributes evaluated
    protected_attributes = fields.ListField(fields.StringField(), required=True)
    
    # Fairness metrics
    demographic_parity = fields.DictField(required=False)  # By attribute
    equal_opportunity = fields.DictField(required=False)  # By attribute
    disparate_impact = fields.DictField(required=False)  # By attribute
    equalized_odds = fields.DictField(required=False)  # By attribute
    
    # Overall fairness score
    overall_fairness_score = fields.FloatField(required=True, min_value=0, max_value=1)
    
    # Detailed results
    results = fields.ListField(fields.EmbeddedDocumentField(EvaluationResult), required=False)
    
    # Evaluation parameters
    sample_size = fields.IntField(required=True)
    confidence_level = fields.FloatField(default=0.95)
    
    # Status
    status = fields.StringField(
        required=True,
        choices=['pending', 'running', 'completed', 'failed'],
        default='pending'
    )
    error_message = fields.StringField(required=False)
    
    # Metadata
    configuration = fields.DictField(required=False)
    created_by = fields.StringField(required=False)  # User ID
    
    meta = {
        'collection': 'fairness_evaluations',
        'indexes': [
            ('project_id', 'model_id'),
            ('evaluation_id',),
            ('timestamp',),
            ('status',),
            ('overall_fairness_score',),
        ],
        'ordering': ['-timestamp'],
    }
    
    def __str__(self):
        return f"Fairness Eval {self.evaluation_id} - {self.overall_fairness_score:.3f}"


class DriftEvaluation(DynamicDocument):
    """Data drift evaluation results."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    model_id = fields.StringField(required=True)
    
    # Evaluation metadata
    evaluation_id = fields.StringField(required=True, unique_with=['project_id', 'model_id'])
    timestamp = fields.DateTimeField(required=True, default=datetime.utcnow)
    
    # Reference and current data periods
    reference_period_start = fields.DateTimeField(required=True)
    reference_period_end = fields.DateTimeField(required=True)
    current_period_start = fields.DateTimeField(required=True)
    current_period_end = fields.DateTimeField(required=True)
    
    # Drift metrics
    population_stability_index = fields.DictField(required=False)  # PSI by feature
    kl_divergence = fields.DictField(required=False)  # KL divergence by feature
    wasserstein_distance = fields.DictField(required=False)  # By feature
    kolmogorov_smirnov = fields.DictField(required=False)  # KS test by feature
    
    # Overall drift scores
    overall_drift_score = fields.FloatField(required=True, min_value=0, max_value=1)
    feature_drift_scores = fields.DictField(required=False)  # By feature
    
    # Prediction drift
    prediction_distribution_drift = fields.FloatField(required=False)
    confidence_drift = fields.FloatField(required=False)
    
    # Detailed results
    results = fields.ListField(fields.EmbeddedDocumentField(EvaluationResult), required=False)
    
    # Evaluation parameters
    reference_sample_size = fields.IntField(required=True)
    current_sample_size = fields.IntField(required=True)
    significance_level = fields.FloatField(default=0.05)
    
    # Status
    status = fields.StringField(
        required=True,
        choices=['pending', 'running', 'completed', 'failed'],
        default='pending'
    )
    error_message = fields.StringField(required=False)
    
    # Metadata
    configuration = fields.DictField(required=False)
    created_by = fields.StringField(required=False)
    
    meta = {
        'collection': 'drift_evaluations',
        'indexes': [
            ('project_id', 'model_id'),
            ('evaluation_id',),
            ('timestamp',),
            ('status',),
            ('overall_drift_score',),
        ],
        'ordering': ['-timestamp'],
    }
    
    def __str__(self):
        return f"Drift Eval {self.evaluation_id} - {self.overall_drift_score:.3f}"


class RobustnessEvaluation(DynamicDocument):
    """Robustness evaluation results."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    model_id = fields.StringField(required=True)
    
    # Evaluation metadata
    evaluation_id = fields.StringField(required=True, unique_with=['project_id', 'model_id'])
    timestamp = fields.DateTimeField(required=True, default=datetime.utcnow)
    
    # Robustness tests
    noise_robustness = fields.DictField(required=False)  # By noise level
    adversarial_robustness = fields.DictField(required=False)  # By attack type
    outlier_robustness = fields.DictField(required=False)  # By outlier type
    
    # Overall robustness score
    overall_robustness_score = fields.FloatField(required=True, min_value=0, max_value=1)
    
    # Test results
    accuracy_degradation = fields.DictField(required=False)  # By perturbation
    confidence_stability = fields.DictField(required=False)
    prediction_consistency = fields.FloatField(required=False)
    
    # Detailed results
    results = fields.ListField(fields.EmbeddedDocumentField(EvaluationResult), required=False)
    
    # Evaluation parameters
    test_samples = fields.IntField(required=True)
    noise_levels = fields.ListField(fields.FloatField(), required=False)
    adversarial_methods = fields.ListField(fields.StringField(), required=False)
    
    # Status
    status = fields.StringField(
        required=True,
        choices=['pending', 'running', 'completed', 'failed'],
        default='pending'
    )
    error_message = fields.StringField(required=False)
    
    # Metadata
    configuration = fields.DictField(required=False)
    created_by = fields.StringField(required=False)
    
    meta = {
        'collection': 'robustness_evaluations',
        'indexes': [
            ('project_id', 'model_id'),
            ('evaluation_id',),
            ('timestamp',),
            ('status',),
            ('overall_robustness_score',),
        ],
        'ordering': ['-timestamp'],
    }
    
    def __str__(self):
        return f"Robustness Eval {self.evaluation_id} - {self.overall_robustness_score:.3f}"


class ExplainabilityEvaluation(DynamicDocument):
    """Explainability evaluation results."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    model_id = fields.StringField(required=True)
    
    # Evaluation metadata
    evaluation_id = fields.StringField(required=True, unique_with=['project_id', 'model_id'])
    timestamp = fields.DateTimeField(required=True, default=datetime.utcnow)
    
    # Explainability methods
    method = fields.StringField(required=True)  # shap, lime, etc.
    
    # Feature importance metrics
    feature_importance_stability = fields.FloatField(required=False)  # Stability of explanations
    feature_coverage = fields.FloatField(required=False)  # How many features are used
    explanation_fidelity = fields.FloatField(required=False)  # How well explanations predict model behavior
    
    # Overall explainability score
    overall_explainability_score = fields.FloatField(required=True, min_value=0, max_value=1)
    
    # Feature-level results
    feature_importance = fields.DictField(required=False)  # Global feature importance
    feature_consistency = fields.DictField(required=False)  # Consistency across samples
    
    # Sample explanations
    sample_explanations = fields.ListField(fields.DictField(), required=False)
    
    # Detailed results
    results = fields.ListField(fields.EmbeddedDocumentField(EvaluationResult), required=False)
    
    # Evaluation parameters
    sample_size = fields.IntField(required=True)
    explanation_samples = fields.IntField(default=100)
    
    # Status
    status = fields.StringField(
        required=True,
        choices=['pending', 'running', 'completed', 'failed'],
        default='pending'
    )
    error_message = fields.StringField(required=False)
    
    # Metadata
    configuration = fields.DictField(required=False)
    created_by = fields.StringField(required=False)
    
    meta = {
        'collection': 'explainability_evaluations',
        'indexes': [
            ('project_id', 'model_id'),
            ('evaluation_id',),
            ('timestamp',),
            ('status',),
            ('method',),
            ('overall_explainability_score',),
        ],
        'ordering': ['-timestamp'],
    }
    
    def __str__(self):
        return f"Explainability Eval {self.evaluation_id} - {self.overall_explainability_score:.3f}"


class TrustScore(DynamicDocument):
    """Trust Score calculation and tracking."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    model_id = fields.StringField(required=True, required=False)  # Optional for project-level scores
    
    # Score components
    fairness_score = fields.FloatField(required=True, min_value=0, max_value=1)
    robustness_score = fields.FloatField(required=True, min_value=0, max_value=1)
    stability_score = fields.FloatField(required=True, min_value=0, max_value=1)
    explainability_score = fields.FloatField(required=True, min_value=0, max_value=1)
    
    # Overall trust score
    score = fields.FloatField(required=True, min_value=0, max_value=1)
    
    # Weights used for calculation
    weights = fields.DictField(required=True)
    
    # Component details
    components = fields.DictField(required=False)  # Detailed breakdown
    
    # Trend data
    trend_direction = fields.StringField(
        required=True,
        choices=['improving', 'declining', 'stable'],
        default='stable'
    )
    trend_percentage = fields.FloatField(default=0.0)
    
    # Thresholds and alerts
    threshold = fields.FloatField(required=True)
    alert_triggered = fields.BooleanField(default=False)
    
    # Timestamps
    timestamp = fields.DateTimeField(required=True, default=datetime.utcnow)
    period_start = fields.DateTimeField(required=True)
    period_end = fields.DateTimeField(required=True)
    
    # Evaluation references
    fairness_evaluation_id = fields.StringField(required=False)
    robustness_evaluation_id = fields.StringField(required=False)
    explainability_evaluation_id = fields.StringField(required=False)
    drift_evaluation_id = fields.StringField(required=False)
    
    # Metadata
    configuration = fields.DictField(required=False)
    created_by = fields.StringField(required=False)
    
    meta = {
        'collection': 'trust_scores',
        'indexes': [
            ('project_id', 'model_id'),
            ('timestamp',),
            ('score',),
            ('alert_triggered',),
            ('trend_direction',),
        ],
        'ordering': ['-timestamp'],
    }
    
    def __str__(self):
        model_suffix = f" - {self.model_id}" if self.model_id else ""
        return f"Trust Score {self.project_id}{model_suffix}: {self.score:.3f}"


class EvaluationSchedule(DynamicDocument):
    """Scheduled evaluation configuration."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    model_id = fields.StringField(required=True, required=False)  # Optional for project-level
    
    # Schedule configuration
    evaluation_type = fields.StringField(
        required=True,
        choices=['fairness', 'drift', 'robustness', 'explainability', 'all']
    )
    schedule = fields.StringField(required=True)  # Cron expression
    is_active = fields.BooleanField(default=True)
    
    # Last execution
    last_run = fields.DateTimeField(required=False)
    next_run = fields.DateTimeField(required=False)
    
    # Execution history
    total_runs = fields.IntField(default=0)
    successful_runs = fields.IntField(default=0)
    failed_runs = fields.IntField(default=0)
    
    # Configuration
    parameters = fields.DictField(required=False)
    thresholds = fields.DictField(required=False)
    
    # Timestamps
    created_at = fields.DateTimeField(required=True, default=datetime.utcnow)
    updated_at = fields.DateTimeField(required=True, default=datetime.utcnow)
    
    # Metadata
    created_by = fields.StringField(required=False)
    
    meta = {
        'collection': 'evaluation_schedules',
        'indexes': [
            ('project_id', 'model_id'),
            ('evaluation_type',),
            ('is_active',),
            ('next_run',),
        ],
        'ordering': ['-created_at'],
    }
    
    def __str__(self):
        model_suffix = f" - {self.model_id}" if self.model_id else ""
        return f"Evaluation Schedule {self.project_id}{model_suffix}: {self.evaluation_type}"


class EvaluationReport(DynamicDocument):
    """Comprehensive evaluation reports."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    model_id = fields.StringField(required=True, required=False)
    
    # Report metadata
    report_id = fields.StringField(required=True, unique_with=['project_id', 'model_id'])
    title = fields.StringField(required=True)
    report_type = fields.StringField(
        required=True,
        choices=['comprehensive', 'fairness', 'drift', 'robustness', 'explainability', 'trust_score']
    )
    
    # Report content
    summary = fields.StringField(required=True)
    findings = fields.ListField(fields.StringField(), required=False)
    recommendations = fields.ListField(fields.StringField(), required=False)
    
    # Scores and metrics
    overall_score = fields.FloatField(required=False)
    detailed_metrics = fields.DictField(required=False)
    
    # Visualizations and charts
    charts = fields.ListField(fields.DictField(), required=False)
    
    # Time period
    period_start = fields.DateTimeField(required=True)
    period_end = fields.DateTimeField(required=True)
    
    # Status
    status = fields.StringField(
        required=True,
        choices=['generating', 'completed', 'failed'],
        default='generating'
    )
    
    # File attachments
    report_file = fields.StringField(required=False)  # File path or URL
    file_format = fields.StringField(
        required=False,
        choices=['pdf', 'html', 'json']
    )
    
    # Timestamps
    created_at = fields.DateTimeField(required=True, default=datetime.utcnow)
    completed_at = fields.DateTimeField(required=False)
    
    # Metadata
    configuration = fields.DictField(required=False)
    created_by = fields.StringField(required=False)
    
    meta = {
        'collection': 'evaluation_reports',
        'indexes': [
            ('project_id', 'model_id'),
            ('report_id',),
            ('report_type',),
            ('status',),
            ('created_at',),
        ],
        'ordering': ['-created_at'],
    }
    
    def __str__(self):
        return f"Report {self.report_id}: {self.title}"
