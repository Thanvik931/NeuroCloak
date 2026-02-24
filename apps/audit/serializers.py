import uuid
from datetime import datetime, timedelta
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    AuditLog, ComplianceReport, DataAccessLog, SecurityEvent, RetentionPolicy
)

User = get_user_model()


class AuditLogSerializer(serializers.Serializer):
    """Serializer for audit logs."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField(required=False, allow_null=True)
    model_id = serializers.CharField(required=False, allow_null=True)
    
    action = serializers.CharField(max_length=100)
    resource_type = serializers.CharField(max_length=50)
    resource_id = serializers.CharField(required=False, allow_null=True)
    
    user_id = serializers.CharField()
    user_email = serializers.CharField(required=False, allow_null=True)
    user_role = serializers.CharField(required=False, allow_null=True)
    
    ip_address = serializers.IPAddressField(required=False, allow_null=True)
    user_agent = serializers.CharField(required=False, allow_null=True)
    request_id = serializers.CharField(required=False, allow_null=True)
    session_id = serializers.CharField(required=False, allow_null=True)
    
    description = serializers.CharField()
    changes = serializers.ListField(child=serializers.DictField(), required=False)
    
    metadata = serializers.DictField(required=False)
    tags = serializers.ListField(child=serializers.CharField(), required=False)
    
    success = serializers.BooleanField()
    error_message = serializers.CharField(required=False, allow_null=True)
    
    compliance_category = serializers.ChoiceField(choices=[
        'data_access', 'data_modification', 'configuration_change',
        'user_management', 'security', 'privacy', 'export', 'delete'
    ], required=False)
    
    risk_level = serializers.ChoiceField(choices=['low', 'medium', 'high', 'critical'], default='low')
    
    timestamp = serializers.DateTimeField(read_only=True)
    duration_ms = serializers.IntegerField(required=False, allow_null=True)
    
    service = serializers.CharField(required=False, allow_null=True)
    version = serializers.CharField(required=False, allow_null=True)
    checksum = serializers.CharField(read_only=True, allow_null=True)


class ComplianceReportSerializer(serializers.Serializer):
    """Serializer for compliance reports."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField(required=False, allow_null=True)
    
    report_id = serializers.CharField(read_only=True)
    report_type = serializers.ChoiceField(choices=[
        'access_log', 'data_modification', 'configuration_changes',
        'security_events', 'privacy_audit', 'retention_policy', 'full_audit'
    ])
    
    period_start = serializers.DateTimeField()
    period_end = serializers.DateTimeField()
    
    summary = serializers.CharField()
    findings = serializers.ListField(child=serializers.CharField(), required=False)
    recommendations = serializers.ListField(child=serializers.CharField(), required=False)
    
    total_actions = serializers.IntegerField()
    actions_by_type = serializers.DictField(required=False)
    actions_by_user = serializers.DictField(required=False)
    high_risk_actions = serializers.IntegerField(default=0)
    failed_actions = serializers.IntegerField(default=0)
    
    compliance_score = serializers.FloatField(min_value=0, max_value=1)
    violations = serializers.ListField(child=serializers.DictField(), required=False)
    
    report_file = serializers.CharField(read_only=True, allow_null=True)
    raw_data_file = serializers.CharField(read_only=True, allow_null=True)
    
    status = serializers.CharField(read_only=True, choices=[
        'generating', 'completed', 'failed'
    ])
    
    created_at = serializers.DateTimeField(read_only=True)
    completed_at = serializers.DateTimeField(read_only=True, allow_null=True)
    
    generated_by = serializers.CharField(read_only=True, allow_null=True)
    parameters = serializers.DictField(required=False)
    format = serializers.ChoiceField(choices=['pdf', 'csv', 'json', 'html'], default='json')


class DataAccessLogSerializer(serializers.Serializer):
    """Serializer for data access logs."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField()
    model_id = serializers.CharField(required=False, allow_null=True)
    
    access_type = serializers.ChoiceField(choices=[
        'read', 'export', 'download', 'api_access', 'query'
    ])
    resource_type = serializers.ChoiceField(choices=[
        'predictions', 'evaluations', 'models', 'users', 'projects'
    ])
    
    user_id = serializers.CharField()
    user_email = serializers.CharField(required=False, allow_null=True)
    purpose = serializers.CharField(required=False, allow_null=True)
    
    record_count = serializers.IntegerField(required=False, min_value=0)
    fields_accessed = serializers.ListField(child=serializers.CharField(), required=False)
    filters_applied = serializers.DictField(required=False)
    
    ip_address = serializers.IPAddressField(required=False, allow_null=True)
    user_agent = serializers.CharField(required=False, allow_null=True)
    api_endpoint = serializers.CharField(required=False, allow_null=True)
    request_id = serializers.CharField(required=False, allow_null=True)
    
    legal_basis = serializers.ChoiceField(choices=[
        'consent', 'contract', 'legal_obligation', 'vital_interests', 
        'public_task', 'legitimate_interests'
    ], required=False)
    data_retention_days = serializers.IntegerField(required=False, min_value=1)
    
    success = serializers.BooleanField()
    error_message = serializers.CharField(required=False, allow_null=True)
    
    timestamp = serializers.DateTimeField(read_only=True)
    duration_ms = serializers.IntegerField(required=False, allow_null=True)
    
    metadata = serializers.DictField(required=False)


class SecurityEventSerializer(serializers.Serializer):
    """Serializer for security events."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField(required=False, allow_null=True)
    
    event_type = serializers.ChoiceField(choices=[
        'login_success', 'login_failure', 'unauthorized_access',
        'privilege_escalation', 'data_breach', 'suspicious_activity',
        'malicious_request', 'brute_force', 'anomaly_detected'
    ])
    severity = serializers.ChoiceField(choices=['low', 'medium', 'high', 'critical'], default='medium')
    
    user_id = serializers.CharField(required=False, allow_null=True)
    user_email = serializers.CharField(required=False, allow_null=True)
    session_id = serializers.CharField(required=False, allow_null=True)
    
    description = serializers.CharField()
    source_ip = serializers.IPAddressField(required=False, allow_null=True)
    target_resource = serializers.CharField(required=False, allow_null=True)
    
    detection_method = serializers.ChoiceField(choices=[
        'manual', 'automated', 'rule_based', 'ml_detection', 'user_report'
    ], required=False)
    confidence_score = serializers.FloatField(required=False, min_value=0, max_value=1)
    
    response_action = serializers.ChoiceField(choices=[
        'none', 'alert', 'block', 'quarantine', 'investigate', 'escalate'
    ], required=False)
    blocked = serializers.BooleanField(default=False)
    
    request_details = serializers.DictField(required=False)
    user_agent = serializers.CharField(required=False, allow_null=True)
    geo_location = serializers.DictField(required=False)
    
    investigation_status = serializers.ChoiceField(choices=[
        'new', 'investigating', 'resolved', 'false_positive'
    ], default='new')
    investigation_notes = serializers.CharField(required=False, allow_null=True)
    
    timestamp = serializers.DateTimeField(read_only=True)
    resolved_at = serializers.DateTimeField(read_only=True, allow_null=True)
    
    tags = serializers.ListField(child=serializers.CharField(), required=False)
    related_events = serializers.ListField(child=serializers.CharField(), required=False)


class RetentionPolicySerializer(serializers.Serializer):
    """Serializer for retention policies."""
    
    id = serializers.CharField(read_only=True)
    project_id = serializers.CharField(required=False, allow_null=True)
    
    policy_name = serializers.CharField(max_length=100)
    resource_type = serializers.ChoiceField(choices=[
        'audit_logs', 'predictions', 'evaluations', 'alerts', 'access_logs', 'security_events'
    ])
    
    retention_days = serializers.IntegerField(min_value=1)
    retention_after_days = serializers.IntegerField(required=False, min_value=1)
    retention_condition = serializers.ChoiceField(choices=[
        'time_based', 'event_based', 'manual', 'legal_hold'
    ], required=False)
    
    action = serializers.ChoiceField(choices=[
        'delete', 'archive', 'anonymize', 'redact'
    ])
    archive_location = serializers.CharField(required=False, allow_null=True)
    
    exceptions = serializers.ListField(child=serializers.DictField(), required=False)
    legal_hold_conditions = serializers.ListField(child=serializers.CharField(), required=False)
    
    is_active = serializers.BooleanField(default=True)
    
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    last_applied = serializers.DateTimeField(read_only=True, allow_null=True)
    
    created_by = serializers.CharField(read_only=True, allow_null=True)
    compliance_framework = serializers.ChoiceField(choices=[
        'GDPR', 'CCPA', 'HIPAA', 'SOX', 'custom'
    ], required=False)


class AuditQuerySerializer(serializers.Serializer):
    """Serializer for querying audit logs."""
    
    action = serializers.CharField(required=False)
    resource_type = serializers.CharField(required=False)
    user_id = serializers.CharField(required=False)
    
    start_date = serializers.DateTimeField(required=False)
    end_date = serializers.DateTimeField(required=False)
    
    compliance_category = serializers.ChoiceField(choices=[
        'data_access', 'data_modification', 'configuration_change',
        'user_management', 'security', 'privacy', 'export', 'delete'
    ], required=False)
    
    risk_level = serializers.ChoiceField(choices=['low', 'medium', 'high', 'critical'], required=False)
    success = serializers.BooleanField(required=False)
    
    ip_address = serializers.IPAddressField(required=False)
    tags = serializers.ListField(child=serializers.CharField(), required=False)
    
    limit = serializers.IntegerField(default=100, min_value=1, max_value=1000)
    offset = serializers.IntegerField(default=0, min_value=0)
    
    def validate(self, attrs):
        """Validate date range."""
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError("start_date must be before end_date")
        
        return attrs


class ComplianceReportRequestSerializer(serializers.Serializer):
    """Serializer for requesting compliance reports."""
    
    report_type = serializers.ChoiceField(choices=[
        'access_log', 'data_modification', 'configuration_changes',
        'security_events', 'privacy_audit', 'retention_policy', 'full_audit'
    ])
    
    period_start = serializers.DateTimeField()
    period_end = serializers.DateTimeField()
    
    format = serializers.ChoiceField(choices=['pdf', 'csv', 'json', 'html'], default='json')
    include_raw_data = serializers.BooleanField(default=False)
    
    filters = serializers.DictField(required=False)
    parameters = serializers.DictField(required=False)
    
    def validate(self, attrs):
        """Validate date range."""
        start_date = attrs.get('period_start')
        end_date = attrs.get('period_end')
        
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError("period_start must be before period_end")
        
        # Limit report period to 1 year
        if start_date and end_date:
            max_period = timedelta(days=365)
            if end_date - start_date > max_period:
                raise serializers.ValidationError("Report period cannot exceed 1 year")
        
        return attrs


class AuditSummarySerializer(serializers.Serializer):
    """Serializer for audit summaries."""
    
    total_actions = serializers.IntegerField()
    successful_actions = serializers.IntegerField()
    failed_actions = serializers.IntegerField()
    high_risk_actions = serializers.IntegerField()
    
    actions_by_type = serializers.DictField()
    actions_by_user = serializers.DictField()
    actions_by_compliance_category = serializers.DictField()
    
    recent_actions = serializers.ListField(child=serializers.DictField())
    
    top_resources = serializers.ListField(child=serializers.DictField())
    security_events_count = serializers.IntegerField()
    compliance_score = serializers.FloatField()


class DataAccessSummarySerializer(serializers.Serializer):
    """Serializer for data access summaries."""
    
    total_access_requests = serializers.IntegerField()
    successful_accesses = serializers.IntegerField()
    failed_accesses = serializers.IntegerField()
    
    access_by_type = serializers.DictField()
    access_by_user = serializers.DictField()
    access_by_resource = serializers.DictField()
    
    total_records_accessed = serializers.IntegerField()
    unique_fields_accessed = serializers.ListField(child=serializers.CharField())
    
    export_requests = serializers.IntegerField()
    average_response_time_ms = serializers.FloatField()
