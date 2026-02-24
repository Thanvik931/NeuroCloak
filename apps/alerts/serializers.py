import uuid
from datetime import datetime, timedelta
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    Alert, AlertRuleConfig, AlertNotification, AlertDashboard, AlertStatistics
)

User = get_user_model()


class AlertSerializer(serializers.Serializer):
    """Serializer for alert records."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField()
    model_id = serializers.CharField(required=False, allow_null=True)
    
    alert_id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=200)
    description = serializers.CharField()
    
    alert_type = serializers.ChoiceField(choices=[
        'trust_score', 'fairness', 'drift', 'robustness', 'explainability',
        'data_quality', 'model_performance', 'system_health', 'custom'
    ])
    severity = serializers.ChoiceField(choices=['low', 'medium', 'high', 'critical'])
    
    status = serializers.CharField(read_only=True, choices=[
        'active', 'acknowledged', 'resolved', 'suppressed'
    ])
    
    metric_value = serializers.FloatField(required=False, allow_null=True)
    threshold = serializers.FloatField(required=False, allow_null=True)
    rule_name = serializers.CharField(required=False, allow_null=True)
    
    context = serializers.DictField(required=False)
    details = serializers.DictField(required=False)
    affected_entities = serializers.ListField(child=serializers.CharField(), required=False)
    
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    acknowledged_at = serializers.DateTimeField(read_only=True, allow_null=True)
    resolved_at = serializers.DateTimeField(read_only=True, allow_null=True)
    
    acknowledged_by = serializers.CharField(read_only=True, allow_null=True)
    resolved_by = serializers.CharField(read_only=True, allow_null=True)
    resolution_notes = serializers.CharField(required=False, allow_null=True)
    
    notifications_sent = serializers.ListField(child=serializers.DictField(), read_only=True)
    last_notification_at = serializers.DateTimeField(read_only=True, allow_null=True)
    
    is_suppressed = serializers.BooleanField(read_only=True)
    suppression_until = serializers.DateTimeField(read_only=True, allow_null=True)
    suppression_reason = serializers.CharField(read_only=True, allow_null=True)
    
    source = serializers.CharField(required=False, allow_null=True)
    tags = serializers.ListField(child=serializers.CharField(), required=False)


class AlertActionSerializer(serializers.Serializer):
    """Serializer for alert actions (acknowledge, resolve, suppress)."""
    
    action = serializers.ChoiceField(choices=['acknowledge', 'resolve', 'suppress'])
    notes = serializers.CharField(required=False, allow_null=True)
    suppression_minutes = serializers.IntegerField(required=False, min_value=1)
    suppression_reason = serializers.CharField(required=False, allow_null=True)


class AlertRuleConfigSerializer(serializers.Serializer):
    """Serializer for alert rule configurations."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField()
    model_id = serializers.CharField(required=False, allow_null=True)
    
    name = serializers.CharField(max_length=100)
    description = serializers.CharField(required=False, allow_null=True)
    alert_type = serializers.ChoiceField(choices=[
        'trust_score', 'fairness', 'drift', 'robustness', 'explainability',
        'data_quality', 'model_performance', 'system_health', 'custom'
    ])
    
    rules = serializers.ListField(child=serializers.DictField(), min_length=1)
    channels = serializers.ListField(child=serializers.DictField(), required=False)
    
    is_active = serializers.BooleanField(default=True)
    evaluation_frequency = serializers.CharField(default='*/5 * * * *')
    cooldown_minutes = serializers.IntegerField(default=60, min_value=1)
    auto_resolve_minutes = serializers.IntegerField(required=False, min_value=1)
    
    conditions = serializers.DictField(required=False)
    
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    last_triggered = serializers.DateTimeField(read_only=True, allow_null=True)
    created_by = serializers.CharField(read_only=True, allow_null=True)


class AlertNotificationSerializer(serializers.Serializer):
    """Serializer for alert notifications."""
    
    id = serializers.CharField(read_only=True)
    alert_id = serializers.CharField(read_only=True)
    
    channel_type = serializers.ChoiceField(choices=[
        'email', 'webhook', 'slack', 'teams', 'in_app'
    ])
    recipient = serializers.CharField()
    
    status = serializers.CharField(read_only=True, choices=[
        'pending', 'sent', 'failed', 'retry'
    ])
    
    subject = serializers.CharField(read_only=True, allow_null=True)
    message = serializers.CharField(read_only=True, allow_null=True)
    payload = serializers.DictField(read_only=True)
    
    created_at = serializers.DateTimeField(read_only=True)
    sent_at = serializers.DateTimeField(read_only=True, allow_null=True)
    
    error_message = serializers.CharField(read_only=True, allow_null=True)
    retry_count = serializers.IntegerField(read_only=True)
    max_retries = serializers.IntegerField(read_only=True)
    
    external_id = serializers.CharField(read_only=True, allow_null=True)


class AlertDashboardSerializer(serializers.Serializer):
    """Serializer for alert dashboards."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField()
    
    name = serializers.CharField(max_length=100)
    description = serializers.CharField(required=False, allow_null=True)
    layout = serializers.DictField(required=False)
    widgets = serializers.ListField(child=serializers.DictField(), required=False)
    
    default_filters = serializers.DictField(required=False)
    refresh_interval = serializers.IntegerField(default=300, min_value=10)
    
    is_public = serializers.BooleanField(default=False)
    shared_with = serializers.ListField(child=serializers.CharField(), required=False)
    
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    created_by = serializers.CharField(read_only=True, allow_null=True)


class AlertStatisticsSerializer(serializers.Serializer):
    """Serializer for alert statistics."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField()
    model_id = serializers.CharField(required=False, allow_null=True)
    
    timestamp = serializers.DateTimeField()
    window_minutes = serializers.IntegerField()
    
    total_alerts = serializers.IntegerField()
    active_alerts = serializers.IntegerField()
    resolved_alerts = serializers.IntegerField()
    acknowledged_alerts = serializers.IntegerField()
    
    alerts_by_severity = serializers.DictField(required=False)
    alerts_by_type = serializers.DictField(required=False)
    
    avg_resolution_time_minutes = serializers.FloatField()
    resolution_rate = serializers.FloatField()
    
    notifications_sent = serializers.IntegerField()
    notifications_failed = serializers.IntegerField()


class AlertQuerySerializer(serializers.Serializer):
    """Serializer for querying alerts."""
    
    alert_type = serializers.ChoiceField(choices=[
        'trust_score', 'fairness', 'drift', 'robustness', 'explainability',
        'data_quality', 'model_performance', 'system_health', 'custom'
    ], required=False)
    
    severity = serializers.ChoiceField(choices=['low', 'medium', 'high', 'critical'], required=False)
    status = serializers.ChoiceField(choices=[
        'active', 'acknowledged', 'resolved', 'suppressed'
    ], required=False)
    
    start_date = serializers.DateTimeField(required=False)
    end_date = serializers.DateTimeField(required=False)
    
    acknowledged_by = serializers.CharField(required=False)
    resolved_by = serializers.CharField(required=False)
    
    tags = serializers.ListField(child=serializers.CharField(), required=False)
    
    limit = serializers.IntegerField(default=20, min_value=1, max_value=100)
    offset = serializers.IntegerField(default=0, min_value=0)
    
    def validate(self, attrs):
        """Validate date range."""
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError("start_date must be before end_date")
        
        return attrs


class AlertSummarySerializer(serializers.Serializer):
    """Serializer for alert summaries."""
    
    total_alerts = serializers.IntegerField()
    active_alerts = serializers.IntegerField()
    critical_alerts = serializers.IntegerField()
    high_alerts = serializers.IntegerField()
    medium_alerts = serializers.IntegerField()
    low_alerts = serializers.IntegerField()
    
    alerts_by_type = serializers.DictField()
    recent_alerts = serializers.ListField(child=serializers.DictField())
    
    avg_resolution_time_minutes = serializers.FloatField()
    resolution_rate = serializers.FloatField()
    
    top_alert_sources = serializers.ListField(child=serializers.DictField())


class AlertTrendSerializer(serializers.Serializer):
    """Serializer for alert trends over time."""
    
    date = serializers.DateField()
    total_alerts = serializers.IntegerField()
    active_alerts = serializers.IntegerField()
    resolved_alerts = serializers.IntegerField()
    
    alerts_by_severity = serializers.DictField()
    alerts_by_type = serializers.DictField()


class AlertEscalationSerializer(serializers.Serializer):
    """Serializer for alert escalation rules."""
    
    escalation_minutes = serializers.IntegerField(min_value=1)
    escalation_level = serializers.IntegerField(min_value=1)
    new_severity = serializers.ChoiceField(choices=['low', 'medium', 'high', 'critical'])
    additional_channels = serializers.ListField(child=serializers.DictField())
    notification_message = serializers.CharField(required=False)
