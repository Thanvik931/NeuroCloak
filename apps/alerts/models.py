import uuid
from datetime import datetime
from mongoengine import Document, EmbeddedDocument, fields, DynamicDocument
from django.contrib.auth import get_user_model

User = get_user_model()


class AlertRule(EmbeddedDocument):
    """Embedded document for alert rule definitions."""
    
    metric_name = fields.StringField(required=True)
    operator = fields.StringField(
        required=True,
        choices=['>', '<', '>=', '<=', '==', '!=', 'in', 'not_in']
    )
    threshold = fields.FloatField(required=True)
    severity = fields.StringField(
        required=True,
        choices=['low', 'medium', 'high', 'critical'],
        default='medium'
    )
    enabled = fields.BooleanField(default=True)
    
    meta = {
        'indexes': [
            ('metric_name',),
            ('severity',),
        ]
    }


class AlertChannel(EmbeddedDocument):
    """Embedded document for alert notification channels."""
    
    channel_type = fields.StringField(
        required=True,
        choices=['email', 'webhook', 'slack', 'teams', 'in_app']
    )
    config = fields.DictField(required=True)
    enabled = fields.BooleanField(default=True)
    
    meta = {
        'indexes': [
            ('channel_type',),
        ]
    }


class Alert(DynamicDocument):
    """Alert records for monitoring and notifications."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    model_id = fields.StringField(required=False)  # Optional for project-level alerts
    
    # Alert identification
    alert_id = fields.StringField(required=True, unique_with=['project_id', 'model_id'])
    title = fields.StringField(required=True)
    description = fields.StringField(required=True)
    
    # Alert classification
    alert_type = fields.StringField(
        required=True,
        choices=[
            'trust_score', 'fairness', 'drift', 'robustness', 'explainability',
            'data_quality', 'model_performance', 'system_health', 'custom'
        ]
    )
    severity = fields.StringField(
        required=True,
        choices=['low', 'medium', 'high', 'critical']
    )
    
    # Alert status
    status = fields.StringField(
        required=True,
        choices=['active', 'acknowledged', 'resolved', 'suppressed'],
        default='active'
    )
    
    # Alert data
    metric_value = fields.FloatField(required=False)
    threshold = fields.FloatField(required=False)
    rule_name = fields.StringField(required=False)
    
    # Context and details
    context = fields.DictField(required=False)
    details = fields.DictField(required=False)
    affected_entities = fields.ListField(fields.StringField(), required=False)
    
    # Timestamps
    created_at = fields.DateTimeField(required=True, default=datetime.utcnow)
    updated_at = fields.DateTimeField(required=True, default=datetime.utcnow)
    acknowledged_at = fields.DateTimeField(required=False)
    resolved_at = fields.DateTimeField(required=False)
    
    # User actions
    acknowledged_by = fields.StringField(required=False)  # User ID
    resolved_by = fields.StringField(required=False)  # User ID
    resolution_notes = fields.StringField(required=False)
    
    # Notification tracking
    notifications_sent = fields.ListField(fields.DictField(), required=False)
    last_notification_at = fields.DateTimeField(required=False)
    
    # Suppression
    is_suppressed = fields.BooleanField(default=False)
    suppression_until = fields.DateTimeField(required=False)
    suppression_reason = fields.StringField(required=False)
    
    # Metadata
    source = fields.StringField(required=False)  # Source system/component
    tags = fields.ListField(fields.StringField(), required=False)
    
    meta = {
        'collection': 'alerts',
        'indexes': [
            ('project_id', 'model_id'),
            ('alert_id',),
            ('alert_type',),
            ('severity',),
            ('status',),
            ('created_at',),
            ('is_suppressed',),
        ],
        'ordering': ['-created_at'],
    }
    
    def __str__(self):
        return f"Alert {self.alert_id}: {self.title}"
    
    @property
    def is_active(self):
        """Check if alert is currently active."""
        return self.status == 'active' and not self.is_suppressed
    
    def acknowledge(self, user_id, notes=None):
        """Acknowledge the alert."""
        self.status = 'acknowledged'
        self.acknowledged_by = user_id
        self.acknowledged_at = datetime.utcnow()
        if notes:
            self.resolution_notes = notes
        self.save()
    
    def resolve(self, user_id, notes=None):
        """Resolve the alert."""
        self.status = 'resolved'
        self.resolved_by = user_id
        self.resolved_at = datetime.utcnow()
        if notes:
            self.resolution_notes = notes
        self.save()
    
    def suppress(self, until=None, reason=None):
        """Suppress the alert."""
        self.is_suppressed = True
        self.suppression_until = until
        self.suppression_reason = reason
        self.save()


class AlertRuleConfig(DynamicDocument):
    """Alert rule configurations for projects and models."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    model_id = fields.StringField(required=False)  # Optional for project-level rules
    
    # Rule configuration
    name = fields.StringField(required=True)
    description = fields.StringField(required=False)
    alert_type = fields.StringField(
        required=True,
        choices=[
            'trust_score', 'fairness', 'drift', 'robustness', 'explainability',
            'data_quality', 'model_performance', 'system_health', 'custom'
        ]
    )
    
    # Rules
    rules = fields.ListField(fields.EmbeddedDocumentField(AlertRule), required=True)
    
    # Notification channels
    channels = fields.ListField(fields.EmbeddedDocumentField(AlertChannel), required=False)
    
    # Status and scheduling
    is_active = fields.BooleanField(default=True)
    evaluation_frequency = fields.StringField(default='*/5 * * * *')  # Cron expression
    
    # Suppression and cooldown
    cooldown_minutes = fields.IntField(default=60)  # Minimum time between alerts
    auto_resolve_minutes = fields.IntField(required=False)  # Auto-resolve after X minutes
    
    # Conditions
    conditions = fields.DictField(required=False)  # Additional conditions
    
    # Timestamps
    created_at = fields.DateTimeField(required=True, default=datetime.utcnow)
    updated_at = fields.DateTimeField(required=True, default=datetime.utcnow)
    last_triggered = fields.DateTimeField(required=False)
    
    # Metadata
    created_by = fields.StringField(required=False)  # User ID
    
    meta = {
        'collection': 'alert_rule_configs',
        'indexes': [
            ('project_id', 'model_id'),
            ('alert_type',),
            ('is_active',),
            ('last_triggered',),
        ],
        'ordering': ['-created_at'],
    }
    
    def __str__(self):
        return f"Alert Rule {self.name} - {self.alert_type}"


class AlertNotification(DynamicDocument):
    """Alert notification tracking."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    alert_id = fields.StringField(required=True)
    
    # Notification details
    channel_type = fields.StringField(
        required=True,
        choices=['email', 'webhook', 'slack', 'teams', 'in_app']
    )
    recipient = fields.StringField(required=True)  # Email, webhook URL, user ID, etc.
    
    # Status
    status = fields.StringField(
        required=True,
        choices=['pending', 'sent', 'failed', 'retry'],
        default='pending'
    )
    
    # Content
    subject = fields.StringField(required=False)
    message = fields.StringField(required=False)
    payload = fields.DictField(required=False)  # Raw notification payload
    
    # Timestamps
    created_at = fields.DateTimeField(required=True, default=datetime.utcnow)
    sent_at = fields.DateTimeField(required=False)
    
    # Error handling
    error_message = fields.StringField(required=False)
    retry_count = fields.IntField(default=0)
    max_retries = fields.IntField(default=3)
    
    # Metadata
    external_id = fields.StringField(required=False)  # External notification ID
    
    meta = {
        'collection': 'alert_notifications',
        'indexes': [
            ('alert_id',),
            ('channel_type',),
            ('status',),
            ('created_at',),
            ('recipient',),
        ],
        'ordering': ['-created_at'],
    }
    
    def __str__(self):
        return f"Notification {self.id}: {self.channel_type} to {self.recipient}"


class AlertDashboard(DynamicDocument):
    """Alert dashboard configuration and widgets."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    
    # Dashboard configuration
    name = fields.StringField(required=True)
    description = fields.StringField(required=False)
    layout = fields.DictField(required=False)  # Dashboard layout configuration
    
    # Widgets
    widgets = fields.ListField(fields.DictField(), required=False)  # Widget configurations
    
    # Filters and settings
    default_filters = fields.DictField(required=False)
    refresh_interval = fields.IntField(default=300)  # seconds
    
    # Sharing and permissions
    is_public = fields.BooleanField(default=False)
    shared_with = fields.ListField(fields.StringField(), required=False)  # User IDs
    
    # Timestamps
    created_at = fields.DateTimeField(required=True, default=datetime.utcnow)
    updated_at = fields.DateTimeField(required=True, default=datetime.utcnow)
    
    # Metadata
    created_by = fields.StringField(required=False)  # User ID
    
    meta = {
        'collection': 'alert_dashboards',
        'indexes': [
            ('project_id',),
            ('is_public',),
            ('created_by',),
        ],
        'ordering': ['-updated_at'],
    }
    
    def __str__(self):
        return f"Dashboard {self.name} - {self.project_id}"


class AlertStatistics(DynamicDocument):
    """Aggregated alert statistics for reporting."""
    
    id = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = fields.StringField(required=True)
    model_id = fields.StringField(required=False)
    
    # Time window
    timestamp = fields.DateTimeField(required=True)
    window_minutes = fields.IntField(required=True, default=60)  # 1 hour default
    
    # Alert counts
    total_alerts = fields.IntField(required=True)
    active_alerts = fields.IntField(required=True)
    resolved_alerts = fields.IntField(required=True)
    acknowledged_alerts = fields.IntField(required=True)
    
    # By severity
    alerts_by_severity = fields.DictField(required=False)
    
    # By type
    alerts_by_type = fields.DictField(required=False)
    
    # Resolution metrics
    avg_resolution_time_minutes = fields.FloatField(default=0)
    resolution_rate = fields.FloatField(default=0)
    
    # Notification metrics
    notifications_sent = fields.IntField(default=0)
    notifications_failed = fields.IntField(default=0)
    
    meta = {
        'collection': 'alert_statistics',
        'indexes': [
            ('project_id', 'model_id', 'timestamp'),
            ('timestamp',),
            ('window_minutes',),
        ],
        'ordering': ['-timestamp'],
    }
    
    def __str__(self):
        return f"Alert Stats {self.project_id}: {self.total_alerts} alerts"
