import uuid
from datetime import datetime
from mongoengine import Document, EmbeddedDocument, fields, DynamicDocument
from django.contrib.auth import get_user_model

User = get_user_model()


class AuditChange(EmbeddedDocument):
    """Embedded document for tracking specific changes."""
    
    field_name = fields.StringField(required=True)
    old_value = fields.DynamicField(required=False)
    new_value = fields.DynamicField(required=False)
    change_type = fields.StringField(
        required=True,
        choices=['create', 'update', 'delete', 'access', 'export', 'config_change']
    )
    
    meta = {
        'indexes': [
            ('field_name',),
            ('change_type',),
        ]
    }


class AuditLog(DynamicDocument):
    """Comprehensive audit logging for compliance and security."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=False)  # Optional for system-level actions
    model_id = fields.StringField(required=False)    # Optional for project-level actions
    
    # Action details
    action = fields.StringField(required=True)
    resource_type = fields.StringField(required=True)  # user, project, model, alert, etc.
    resource_id = fields.StringField(required=False)
    
    # User information
    user_id = fields.StringField(required=True)
    user_email = fields.StringField(required=False)
    user_role = fields.StringField(required=False)  # Role at time of action
    
    # Request context
    ip_address = fields.StringField(required=False)
    user_agent = fields.StringField(required=False)
    request_id = fields.StringField(required=False)
    session_id = fields.StringField(required=False)
    
    # Action details
    description = fields.StringField(required=True)
    changes = fields.ListField(fields.EmbeddedDocumentField(AuditChange), required=False)
    
    # Metadata
    metadata = fields.DictField(required=False)  # Additional context
    tags = fields.ListField(fields.StringField(), required=False)
    
    # Result
    success = fields.BooleanField(required=True)
    error_message = fields.StringField(required=False)
    
    # Compliance and security
    compliance_category = fields.StringField(
        required=False,
        choices=[
            'data_access', 'data_modification', 'configuration_change',
            'user_management', 'security', 'privacy', 'export', 'delete'
        ]
    )
    risk_level = fields.StringField(
        required=False,
        choices=['low', 'medium', 'high', 'critical'],
        default='low'
    )
    
    # Timestamps
    timestamp = fields.DateTimeField(required=True, default=datetime.utcnow)
    duration_ms = fields.IntField(required=False)  # Action duration in milliseconds
    
    # System information
    service = fields.StringField(required=False)  # Service/component
    version = fields.StringField(required=False)  # Service version
    
    # Immutable fields
    checksum = fields.StringField(required=False)  # For integrity verification
    
    meta = {
        'collection': 'audit_logs',
        'indexes': [
            ('project_id', 'model_id'),
            ('user_id',),
            ('action',),
            ('resource_type',),
            ('timestamp',),
            ('compliance_category',),
            ('risk_level',),
            ('success',),
            ('request_id',),
        ],
        'ordering': ['-timestamp'],
    }
    
    def __str__(self):
        return f"Audit Log {self.id}: {self.action} on {self.resource_type}"
    
    @property
    def is_high_risk(self):
        """Check if this is a high-risk action."""
        return self.risk_level in ['high', 'critical']
    
    @property
    def requires_review(self):
        """Check if this action requires review."""
        high_risk_actions = [
            'delete_project', 'delete_model', 'promote_model',
            'export_sensitive_data', 'change_permissions', 'delete_user'
        ]
        return self.action in high_risk_actions or self.is_high_risk


class ComplianceReport(DynamicDocument):
    """Compliance reports for auditing and regulatory requirements."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=False)  # Optional for system-wide reports
    
    # Report identification
    report_id = fields.StringField(required=True, unique_with=['project_id'])
    report_type = fields.StringField(
        required=True,
        choices=[
            'access_log', 'data_modification', 'configuration_changes',
            'security_events', 'privacy_audit', 'retention_policy', 'full_audit'
        ]
    )
    
    # Report period
    period_start = fields.DateTimeField(required=True)
    period_end = fields.DateTimeField(required=True)
    
    # Report content
    summary = fields.StringField(required=True)
    findings = fields.ListField(fields.StringField(), required=False)
    recommendations = fields.ListField(fields.StringField(), required=False)
    
    # Statistics
    total_actions = fields.IntField(required=True)
    actions_by_type = fields.DictField(required=False)
    actions_by_user = fields.DictField(required=False)
    high_risk_actions = fields.IntField(default=0)
    failed_actions = fields.IntField(default=0)
    
    # Compliance metrics
    compliance_score = fields.FloatField(required=True, min_value=0, max_value=1)
    violations = fields.ListField(fields.DictField(), required=False)
    
    # Report files
    report_file = fields.StringField(required=False)  # File path or URL
    raw_data_file = fields.StringField(required=False)  # Raw audit data
    
    # Status
    status = fields.StringField(
        required=True,
        choices=['generating', 'completed', 'failed'],
        default='generating'
    )
    
    # Timestamps
    created_at = fields.DateTimeField(required=True, default=datetime.utcnow)
    completed_at = fields.DateTimeField(required=False)
    
    # Metadata
    generated_by = fields.StringField(required=False)  # User ID
    parameters = fields.DictField(required=False)
    format = fields.StringField(
        required=False,
        choices=['pdf', 'csv', 'json', 'html'],
        default='json'
    )
    
    meta = {
        'collection': 'compliance_reports',
        'indexes': [
            ('project_id', 'report_id'),
            ('report_type',),
            ('period_start', 'period_end'),
            ('status',),
            ('created_at',),
        ],
        'ordering': ['-created_at'],
    }
    
    def __str__(self):
        return f"Compliance Report {self.report_id}: {self.report_type}"


class DataAccessLog(DynamicDocument):
    """Detailed data access logging for privacy compliance."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    model_id = fields.StringField(required=False)
    
    # Access details
    access_type = fields.StringField(
        required=True,
        choices=['read', 'export', 'download', 'api_access', 'query']
    )
    resource_type = fields.StringField(
        required=True,
        choices=['predictions', 'evaluations', 'models', 'users', 'projects']
    )
    
    # User information
    user_id = fields.StringField(required=True)
    user_email = fields.StringField(required=False)
    purpose = fields.StringField(required=False)  # Purpose of access
    
    # Data details
    record_count = fields.IntField(required=False)
    fields_accessed = fields.ListField(fields.StringField(), required=False)
    filters_applied = fields.DictField(required=False)
    
    # Request context
    ip_address = fields.StringField(required=False)
    user_agent = fields.StringField(required=False)
    api_endpoint = fields.StringField(required=False)
    request_id = fields.StringField(required=False)
    
    # Legal basis (for GDPR compliance)
    legal_basis = fields.StringField(
        required=False,
        choices=['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests']
    )
    data_retention_days = fields.IntField(required=False)
    
    # Result
    success = fields.BooleanField(required=True)
    error_message = fields.StringField(required=False)
    
    # Timestamps
    timestamp = fields.DateTimeField(required=True, default=datetime.utcnow)
    duration_ms = fields.IntField(required=False)
    
    # Metadata
    metadata = fields.DictField(required=False)
    
    meta = {
        'collection': 'data_access_logs',
        'indexes': [
            ('project_id', 'model_id'),
            ('user_id',),
            ('access_type',),
            ('resource_type',),
            ('timestamp',),
            ('success',),
            ('legal_basis',),
        ],
        'ordering': ['-timestamp'],
    }
    
    def __str__(self):
        return f"Data Access {self.id}: {self.access_type} by {self.user_id}"


class SecurityEvent(DynamicDocument):
    """Security events and incidents tracking."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=False)  # Optional for system-wide events
    
    # Event details
    event_type = fields.StringField(
        required=True,
        choices=[
            'login_success', 'login_failure', 'unauthorized_access',
            'privilege_escalation', 'data_breach', 'suspicious_activity',
            'malicious_request', 'brute_force', 'anomaly_detected'
        ]
    )
    severity = fields.StringField(
        required=True,
        choices=['low', 'medium', 'high', 'critical'],
        default='medium'
    )
    
    # User information
    user_id = fields.StringField(required=False)
    user_email = fields.StringField(required=False)
    session_id = fields.StringField(required=False)
    
    # Event details
    description = fields.StringField(required=True)
    source_ip = fields.StringField(required=False)
    target_resource = fields.StringField(required=False)
    
    # Detection details
    detection_method = fields.StringField(
        required=False,
        choices=['manual', 'automated', 'rule_based', 'ml_detection', 'user_report']
    )
    confidence_score = fields.FloatField(required=False, min_value=0, max_value=1)
    
    # Response
    response_action = fields.StringField(
        required=False,
        choices=['none', 'alert', 'block', 'quarantine', 'investigate', 'escalate']
    )
    blocked = fields.BooleanField(default=False)
    
    # Context
    request_details = fields.DictField(required=False)
    user_agent = fields.StringField(required=False)
    geo_location = fields.DictField(required=False)
    
    # Investigation
    investigation_status = fields.StringField(
        required=False,
        choices=['new', 'investigating', 'resolved', 'false_positive'],
        default='new'
    )
    investigation_notes = fields.StringField(required=False)
    
    # Timestamps
    timestamp = fields.DateTimeField(required=True, default=datetime.utcnow)
    resolved_at = fields.DateTimeField(required=False)
    
    # Metadata
    tags = fields.ListField(fields.StringField(), required=False)
    related_events = fields.ListField(fields.StringField(), required=False)
    
    meta = {
        'collection': 'security_events',
        'indexes': [
            ('project_id',),
            ('event_type',),
            ('severity',),
            ('timestamp',),
            ('user_id',),
            ('investigation_status',),
            ('blocked',),
        ],
        'ordering': ['-timestamp'],
    }
    
    def __str__(self):
        return f"Security Event {self.id}: {self.event_type}"


class RetentionPolicy(DynamicDocument):
    """Data retention policies for compliance."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=False)  # Optional for system-wide policies
    
    # Policy details
    policy_name = fields.StringField(required=True, unique_with=['project_id'])
    resource_type = fields.StringField(
        required=True,
        choices=['audit_logs', 'predictions', 'evaluations', 'alerts', 'access_logs', 'security_events']
    )
    
    # Retention rules
    retention_days = fields.IntField(required=True, min_value=1)
    retention_after_days = fields.IntField(required=False)  # Alternative retention condition
    retention_condition = fields.StringField(
        required=False,
        choices=['time_based', 'event_based', 'manual', 'legal_hold']
    )
    
    # Actions after retention
    action = fields.StringField(
        required=True,
        choices=['delete', 'archive', 'anonymize', 'redact']
    )
    archive_location = fields.StringField(required=False)
    
    # Exceptions
    exceptions = fields.ListField(fields.DictField(), required=False)
    legal_hold_conditions = fields.ListField(fields.StringField(), required=False)
    
    # Status
    is_active = fields.BooleanField(default=True)
    
    # Timestamps
    created_at = fields.DateTimeField(required=True, default=datetime.utcnow)
    updated_at = fields.DateTimeField(required=True, default=datetime.utcnow)
    last_applied = fields.DateTimeField(required=False)
    
    # Metadata
    created_by = fields.StringField(required=False)  # User ID
    compliance_framework = fields.StringField(
        required=False,
        choices=['GDPR', 'CCPA', 'HIPAA', 'SOX', 'custom']
    )
    
    meta = {
        'collection': 'retention_policies',
        'indexes': [
            ('project_id', 'policy_name'),
            ('resource_type',),
            ('is_active',),
            ('last_applied',),
        ],
        'ordering': ['-created_at'],
    }
    
    def __str__(self):
        return f"Retention Policy {self.policy_name}: {self.resource_type}"
