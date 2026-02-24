import uuid
from datetime import datetime
from mongoengine import Document, EmbeddedDocument, fields, DynamicDocument
from django.contrib.auth import get_user_model

from apps.registry.models import Model

User = get_user_model()


class PredictionEvent(EmbeddedDocument):
    """Embedded document for individual prediction events."""
    
    prediction_id = fields.StringField(required=True)
    timestamp = fields.DateTimeField(required=True)
    features = fields.DictField(required=True)
    prediction = fields.DynamicField(required=True)
    confidence = fields.FloatField(required=False)
    prediction_proba = fields.DictField(required=False)
    true_label = fields.DynamicField(required=False)
    metadata = fields.DictField(required=False)
    
    meta = {
        'indexes': [
            ('prediction_id',),
            ('timestamp',),
        ]
    }


class IngestionBatch(DynamicDocument):
    """Batch ingestion record for tracking bulk uploads."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    model_id = fields.StringField(required=True)
    batch_id = fields.StringField(required=True, unique=True)
    
    # Batch metadata
    source = fields.StringField(required=True)  # API, file upload, websocket, etc.
    format = fields.StringField(required=True)  # JSON, CSV, etc.
    total_records = fields.IntField(required=True)
    processed_records = fields.IntField(default=0)
    failed_records = fields.IntField(default=0)
    
    # Processing status
    status = fields.StringField(
        required=True,
        choices=['pending', 'processing', 'completed', 'failed', 'cancelled'],
        default='pending'
    )
    
    # Error tracking
    error_message = fields.StringField(required=False)
    error_details = fields.DictField(required=False)
    
    # Timestamps
    created_at = fields.DateTimeField(required=True, default=datetime.utcnow)
    started_at = fields.DateTimeField(required=False)
    completed_at = fields.DateTimeField(required=False)
    
    # Additional metadata
    metadata = fields.DictField(required=False)
    
    meta = {
        'collection': 'ingestion_batches',
        'indexes': [
            ('project_id', 'model_id'),
            ('batch_id',),
            ('status',),
            ('created_at',),
        ]
    }
    
    def __str__(self):
        return f"Batch {self.batch_id} - {self.status}"


class Prediction(DynamicDocument):
    """Individual prediction record with features and outcomes."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    model_id = fields.StringField(required=True)
    
    # Prediction data
    prediction_id = fields.StringField(required=True, unique_with=['project_id', 'model_id'])
    timestamp = fields.DateTimeField(required=True, default=datetime.utcnow)
    
    # Input features
    features = fields.DictField(required=True)
    
    # Model output
    prediction = fields.DynamicField(required=True)
    confidence = fields.FloatField(required=False)
    prediction_proba = fields.DictField(required=False)  # For classification models
    
    # Ground truth (if available)
    true_label = fields.DynamicField(required=False)
    true_label_timestamp = fields.DateTimeField(required=False)
    
    # Metadata
    request_id = fields.StringField(required=False)  # For tracing
    user_id = fields.StringField(required=False)  # End user identifier
    session_id = fields.StringField(required=False)
    context = fields.DictField(required=False)  # Additional context
    
    # Data quality flags
    is_anomaly = fields.BooleanField(default=False)
    anomaly_score = fields.FloatField(required=False)
    data_drift_score = fields.FloatField(required=False)
    
    # Processing metadata
    processing_time_ms = fields.IntField(required=False)
    model_version = fields.StringField(required=False)
    endpoint_id = fields.StringField(required=False)
    
    # Batch reference
    batch_id = fields.StringField(required=False)
    
    meta = {
        'collection': 'predictions',
        'indexes': [
            ('project_id', 'model_id'),
            ('prediction_id',),
            ('timestamp',),
            ('true_label_timestamp',),  # For when labels arrive later
            ('batch_id',),
            ('is_anomaly',),
            ('user_id',),
        ],
        'ordering': ['-timestamp'],
    }
    
    def __str__(self):
        return f"Prediction {self.prediction_id} - {self.model_id}"
    
    @property
    def has_ground_truth(self):
        """Check if ground truth is available."""
        return self.true_label is not None
    
    @property
    def is_correct(self):
        """Check if prediction matches ground truth."""
        if not self.has_ground_truth:
            return None
        return self.prediction == self.true_label


class FeatureImportance(DynamicDocument):
    """Feature importance/explanation data for predictions."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    model_id = fields.StringField(required=True)
    prediction_id = fields.StringField(required=True)
    
    # Explanation data
    method = fields.StringField(required=True)  # shap, lime, etc.
    feature_values = fields.DictField(required=True)  # Feature contributions
    baseline_value = fields.FloatField(required=False)
    
    # Global explanations (for model-level explanations)
    is_global = fields.BooleanField(default=False)
    global_feature_importance = fields.DictField(required=False)
    
    # Metadata
    timestamp = fields.DateTimeField(required=True, default=datetime.utcnow)
    computation_time_ms = fields.IntField(required=False)
    parameters = fields.DictField(required=False)
    
    meta = {
        'collection': 'feature_importance',
        'indexes': [
            ('project_id', 'model_id'),
            ('prediction_id',),
            ('method',),
            ('is_global',),
            ('timestamp',),
        ]
    }
    
    def __str__(self):
        return f"Feature Importance {self.prediction_id} - {self.method}"


class DataStream(DynamicDocument):
    """Configuration for real-time data streams."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    model_id = fields.StringField(required=True)
    
    # Stream configuration
    name = fields.StringField(required=True)
    stream_type = fields.StringField(
        required=True,
        choices=['websocket', 'kafka', 'rabbitmq', 'http_webhook', 'file_watch']
    )
    
    # Connection details
    connection_config = fields.DictField(required=True)
    
    # Data mapping
    field_mapping = fields.DictField(required=False)  # Map incoming fields to model features
    timestamp_field = fields.StringField(required=False)
    
    # Stream status
    is_active = fields.BooleanField(default=True)
    last_received_at = fields.DateTimeField(required=False)
    total_messages = fields.IntField(default=0)
    error_count = fields.IntField(default=0)
    last_error = fields.StringField(required=False)
    
    # Processing configuration
    batch_size = fields.IntField(default=100)
    batch_timeout_seconds = fields.IntField(default=30)
    
    # Timestamps
    created_at = fields.DateTimeField(required=True, default=datetime.utcnow)
    updated_at = fields.DateTimeField(required=True, default=datetime.utcnow)
    
    meta = {
        'collection': 'data_streams',
        'indexes': [
            ('project_id', 'model_id'),
            ('stream_type',),
            ('is_active',),
            ('last_received_at',),
        ]
    }
    
    def __str__(self):
        return f"Stream {self.name} - {self.stream_type}"


class IngestionMetrics(DynamicDocument):
    """Aggregated ingestion metrics for monitoring."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    model_id = fields.StringField(required=True)
    
    # Time window
    timestamp = fields.DateTimeField(required=True)
    window_minutes = fields.IntField(required=True, default=60)  # 1 hour default
    
    # Volume metrics
    total_predictions = fields.IntField(required=True)
    unique_predictions = fields.IntField(required=True)
    predictions_with_ground_truth = fields.IntField(default=0)
    
    # Quality metrics
    anomaly_count = fields.IntField(default=0)
    high_drift_count = fields.IntField(default=0)
    
    # Performance metrics
    avg_processing_time_ms = fields.FloatField(default=0)
    max_processing_time_ms = fields.IntField(default=0)
    
    # Data freshness
    avg_data_lag_seconds = fields.FloatField(default=0)
    max_data_lag_seconds = fields.IntField(default=0)
    
    # Error metrics
    error_rate = fields.FloatField(default=0)
    timeout_count = fields.IntField(default=0)
    
    meta = {
        'collection': 'ingestion_metrics',
        'indexes': [
            ('project_id', 'model_id', 'timestamp'),
            ('timestamp',),
            ('window_minutes',),
        ],
        'ordering': ['-timestamp'],
    }
    
    def __str__(self):
        return f"Metrics {self.project_id}:{self.model_id} - {self.timestamp}"


class DataQualityReport(DynamicDocument):
    """Data quality assessment reports."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    model_id = fields.StringField(required=True)
    
    # Report metadata
    report_type = fields.StringField(
        required=True,
        choices=['feature_drift', 'data_quality', 'schema_validation', 'completeness']
    )
    
    # Assessment results
    overall_score = fields.FloatField(required=True)  # 0-1 scale
    issues = fields.ListField(fields.DictField(), required=False)
    recommendations = fields.ListField(fields.StringField(), required=False)
    
    # Detailed metrics
    metrics = fields.DictField(required=True)
    
    # Timestamps
    timestamp = fields.DateTimeField(required=True, default=datetime.utcnow)
    period_start = fields.DateTimeField(required=True)
    period_end = fields.DateTimeField(required=True)
    
    meta = {
        'collection': 'data_quality_reports',
        'indexes': [
            ('project_id', 'model_id'),
            ('report_type',),
            ('timestamp',),
            ('period_start', 'period_end'),
        ],
        'ordering': ['-timestamp'],
    }
    
    def __str__(self):
        return f"Quality Report {self.report_type} - {self.overall_score}"
