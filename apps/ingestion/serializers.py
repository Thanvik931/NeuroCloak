import uuid
import csv
import io
from datetime import datetime
from rest_framework import serializers
from django.core.files.uploadedfile import UploadedFile
from django.contrib.auth import get_user_model

from .models import (
    Prediction, IngestionBatch, FeatureImportance, DataStream,
    IngestionMetrics, DataQualityReport
)
from apps.registry.models import Model

User = get_user_model()


class PredictionSerializer(serializers.Serializer):
    """Serializer for individual predictions."""
    
    prediction_id = serializers.CharField(max_length=255)
    features = serializers.DictField()
    prediction = serializers.JSONField()
    confidence = serializers.FloatField(required=False, allow_null=True)
    prediction_proba = serializers.DictField(required=False, allow_null=True)
    true_label = serializers.JSONField(required=False, allow_null=True)
    true_label_timestamp = serializers.DateTimeField(required=False, allow_null=True)
    request_id = serializers.CharField(max_length=255, required=False, allow_null=True)
    user_id = serializers.CharField(max_length=255, required=False, allow_null=True)
    session_id = serializers.CharField(max_length=255, required=False, allow_null=True)
    context = serializers.DictField(required=False)
    timestamp = serializers.DateTimeField(required=False, allow_null=True)
    
    def validate_features(self, value):
        """Validate features dictionary."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Features must be a dictionary")
        if not value:
            raise serializers.ValidationError("Features cannot be empty")
        return value
    
    def validate_confidence(self, value):
        """Validate confidence score."""
        if value is not None and (value < 0 or value > 1):
            raise serializers.ValidationError("Confidence must be between 0 and 1")
        return value


class BatchPredictionSerializer(serializers.Serializer):
    """Serializer for batch prediction uploads."""
    
    predictions = serializers.ListField(
        child=PredictionSerializer(),
        min_length=1,
        max_length=10000  # Limit batch size
    )
    batch_id = serializers.CharField(max_length=255, required=False)
    metadata = serializers.DictField(required=False)
    
    def validate_predictions(self, value):
        """Validate predictions list."""
        if len(value) > 10000:
            raise serializers.ValidationError("Batch size cannot exceed 10,000 predictions")
        return value


class CSVUploadSerializer(serializers.Serializer):
    """Serializer for CSV file uploads."""
    
    file = serializers.FileField()
    batch_id = serializers.CharField(max_length=255, required=False)
    column_mapping = serializers.DictField(required=False)
    has_header = serializers.BooleanField(default=True)
    
    def validate_file(self, value):
        """Validate uploaded CSV file."""
        if not value.name.endswith('.csv'):
            raise serializers.ValidationError("File must be a CSV")
        if value.size > 50 * 1024 * 1024:  # 50MB limit
            raise serializers.ValidationError("File size cannot exceed 50MB")
        return value
    
    def validate_column_mapping(self, value):
        """Validate column mapping."""
        if value and not isinstance(value, dict):
            raise serializers.ValidationError("Column mapping must be a dictionary")
        return value


class IngestionBatchSerializer(serializers.Serializer):
    """Serializer for ingestion batch records."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField()
    model_id = serializers.CharField()
    batch_id = serializers.CharField()
    source = serializers.CharField()
    format = serializers.CharField()
    total_records = serializers.IntegerField()
    processed_records = serializers.IntegerField(read_only=True)
    failed_records = serializers.IntegerField(read_only=True)
    status = serializers.CharField(read_only=True)
    error_message = serializers.CharField(read_only=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    started_at = serializers.DateTimeField(read_only=True, allow_null=True)
    completed_at = serializers.DateTimeField(read_only=True, allow_null=True)
    metadata = serializers.DictField(read_only=True)


class FeatureImportanceSerializer(serializers.Serializer):
    """Serializer for feature importance data."""
    
    prediction_id = serializers.CharField(max_length=255)
    method = serializers.CharField(max_length=50)
    feature_values = serializers.DictField()
    baseline_value = serializers.FloatField(required=False, allow_null=True)
    is_global = serializers.BooleanField(default=False)
    global_feature_importance = serializers.DictField(required=False)
    computation_time_ms = serializers.IntegerField(required=False, allow_null=True)
    parameters = serializers.DictField(required=False)
    timestamp = serializers.DateTimeField(required=False, allow_null=True)


class DataStreamSerializer(serializers.Serializer):
    """Serializer for data stream configuration."""
    
    name = serializers.CharField(max_length=100)
    stream_type = serializers.ChoiceField(choices=[
        'websocket', 'kafka', 'rabbitmq', 'http_webhook', 'file_watch'
    ])
    connection_config = serializers.DictField()
    field_mapping = serializers.DictField(required=False)
    timestamp_field = serializers.CharField(max_length=100, required=False)
    batch_size = serializers.IntegerField(default=100, min_value=1, max_value=10000)
    batch_timeout_seconds = serializers.IntegerField(default=30, min_value=1, max_value=300)
    is_active = serializers.BooleanField(default=True)


class GroundTruthUpdateSerializer(serializers.Serializer):
    """Serializer for updating ground truth labels."""
    
    predictions = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )
    
    def validate_predictions(self, value):
        """Validate ground truth updates."""
        for item in value:
            if 'prediction_id' not in item:
                raise serializers.ValidationError("Each item must have a prediction_id")
            if 'true_label' not in item:
                raise serializers.ValidationError("Each item must have a true_label")
        return value


class IngestionMetricsSerializer(serializers.Serializer):
    """Serializer for ingestion metrics."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField()
    model_id = serializers.CharField()
    timestamp = serializers.DateTimeField()
    window_minutes = serializers.IntegerField()
    total_predictions = serializers.IntegerField()
    unique_predictions = serializers.IntegerField()
    predictions_with_ground_truth = serializers.IntegerField()
    anomaly_count = serializers.IntegerField()
    high_drift_count = serializers.IntegerField()
    avg_processing_time_ms = serializers.FloatField()
    max_processing_time_ms = serializers.IntegerField()
    avg_data_lag_seconds = serializers.FloatField()
    max_data_lag_seconds = serializers.IntegerField()
    error_rate = serializers.FloatField()
    timeout_count = serializers.IntegerField()


class DataQualityReportSerializer(serializers.Serializer):
    """Serializer for data quality reports."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField()
    model_id = serializers.CharField()
    report_type = serializers.ChoiceField(choices=[
        'feature_drift', 'data_quality', 'schema_validation', 'completeness'
    ])
    overall_score = serializers.FloatField(min_value=0, max_value=1)
    issues = serializers.ListField(child=serializers.DictField(), required=False)
    recommendations = serializers.ListField(child=serializers.CharField(), required=False)
    metrics = serializers.DictField()
    timestamp = serializers.DateTimeField()
    period_start = serializers.DateTimeField()
    period_end = serializers.DateTimeField()


class PredictionQuerySerializer(serializers.Serializer):
    """Serializer for querying predictions."""
    
    start_date = serializers.DateTimeField(required=False)
    end_date = serializers.DateTimeField(required=False)
    limit = serializers.IntegerField(default=100, min_value=1, max_value=10000)
    offset = serializers.IntegerField(default=0, min_value=0)
    has_ground_truth = serializers.BooleanField(required=False)
    is_anomaly = serializers.BooleanField(required=False)
    user_id = serializers.CharField(max_length=255, required=False)
    session_id = serializers.CharField(max_length=255, required=False)
    
    def validate(self, attrs):
        """Validate date range."""
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError("start_date must be before end_date")
        
        return attrs


class ModelIngestionStatsSerializer(serializers.Serializer):
    """Serializer for model ingestion statistics."""
    
    model_id = serializers.CharField()
    total_predictions = serializers.IntegerField()
    predictions_today = serializers.IntegerField()
    predictions_this_week = serializers.IntegerField()
    predictions_this_month = serializers.IntegerField()
    avg_predictions_per_day = serializers.FloatField()
    ground_truth_rate = serializers.FloatField()
    anomaly_rate = serializers.FloatField()
    avg_confidence = serializers.FloatField()
    last_prediction = serializers.DateTimeField(allow_null=True)
    top_features = serializers.ListField(child=serializers.DictField())
    prediction_trend = serializers.ListField(child=serializers.DictField())
