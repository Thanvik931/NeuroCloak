import uuid
from django.db import models
from django.contrib.auth import get_user_model

from apps.projects.models import Project

User = get_user_model()


class Model(models.Model):
    """Model registry for ML models."""
    
    MODEL_TYPES = [
        ('classification', 'Classification'),
        ('regression', 'Regression'),
        ('llm', 'Large Language Model'),
        ('clustering', 'Clustering'),
        ('anomaly_detection', 'Anomaly Detection'),
        ('time_series', 'Time Series'),
        ('recommendation', 'Recommendation'),
        ('computer_vision', 'Computer Vision'),
        ('nlp', 'Natural Language Processing'),
        ('other', 'Other'),
    ]
    
    ENVIRONMENTS = [
        ('development', 'Development'),
        ('staging', 'Staging'),
        ('production', 'Production'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='models')
    name = models.CharField(max_length=200)
    version = models.CharField(max_length=50)
    display_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    model_type = models.CharField(max_length=50, choices=MODEL_TYPES)
    environment = models.CharField(max_length=20, choices=ENVIRONMENTS, default='development')
    
    # Model metadata
    dataset_name = models.CharField(max_length=200, blank=True)
    training_date = models.DateField(null=True, blank=True)
    features = models.JSONField(default=list)  # List of feature names
    target = models.CharField(max_length=100, blank=True)  # Target variable name
    protected_attributes = models.JSONField(default=list)  # Protected attributes for fairness
    tags = models.JSONField(default=list)  # Tags for categorization
    
    # Model files and artifacts
    model_file = models.FileField(upload_to='models/', null=True, blank=True)
    model_card = models.TextField(blank=True)  # Markdown model card
    attachments = models.JSONField(default=list)  # List of attachment URLs
    
    # Performance metrics (baseline)
    baseline_metrics = models.JSONField(default=dict)
    
    # Status and ownership
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_models')
    is_active = models.BooleanField(default=True)
    is_deployed = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deployed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'registry_models'
        verbose_name = 'Model'
        verbose_name_plural = 'Models'
        unique_together = ['project', 'name', 'version']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['project', 'is_active']),
            models.Index(fields=['model_type']),
            models.Index(fields=['environment']),
            models.Index(fields=['owner']),
        ]
    
    def __str__(self):
        return f"{self.name} v{self.version} ({self.project.name})"
    
    @property
    def full_name(self):
        return f"{self.name}:{self.version}"
    
    @property
    def prediction_count(self):
        """Get total number of predictions for this model."""
        from apps.ingestion.models import Prediction
        return Prediction.objects.filter(model=self).count()


class ModelVersion(models.Model):
    """Model version tracking for model lifecycle management."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model = models.ForeignKey(Model, on_delete=models.CASCADE, related_name='versions')
    version = models.CharField(max_length=50)
    changelog = models.TextField(blank=True)
    
    # Version metadata
    file_hash = models.CharField(max_length=64, blank=True)  # SHA-256 hash
    file_size = models.BigIntegerField(null=True, blank=True)
    file_path = models.CharField(max_length=500, blank=True)
    
    # Performance comparison with previous version
    performance_comparison = models.JSONField(default=dict)
    
    # Promotion status
    is_promoted = models.BooleanField(default=False)
    promoted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    promoted_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'registry_model_versions'
        verbose_name = 'Model Version'
        verbose_name_plural = 'Model Versions'
        unique_together = ['model', 'version']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['model', 'is_promoted']),
        ]
    
    def __str__(self):
        return f"{self.model.name} v{self.version}"


class ModelEndpoint(models.Model):
    """Model endpoint configuration for deployed models."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model = models.ForeignKey(Model, on_delete=models.CASCADE, related_name='endpoints')
    name = models.CharField(max_length=100)
    url = models.URLField()
    method = models.CharField(max_length=10, default='POST')
    
    # Authentication
    auth_type = models.CharField(max_length=20, choices=[
        ('none', 'None'),
        ('api_key', 'API Key'),
        ('bearer', 'Bearer Token'),
        ('basic', 'Basic Auth'),
    ], default='none')
    auth_credentials = models.JSONField(default=dict)  # Encrypted credentials
    
    # Request/Response format
    request_format = models.JSONField(default=dict)
    response_format = models.JSONField(default=dict)
    
    # Health check
    health_check_url = models.URLField(blank=True)
    health_check_interval = models.IntegerField(default=300)  # seconds
    is_healthy = models.BooleanField(default=True)
    last_health_check = models.DateTimeField(null=True, blank=True)
    
    # Rate limiting
    rate_limit = models.IntegerField(default=1000)  # requests per minute
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'registry_model_endpoints'
        verbose_name = 'Model Endpoint'
        verbose_name_plural = 'Model Endpoints'
        unique_together = ['model', 'name']
        indexes = [
            models.Index(fields=['model', 'is_active']),
            models.Index(fields=['is_healthy']),
        ]
    
    def __str__(self):
        return f"{self.model.name} - {self.name}"


class ModelTag(models.Model):
    """Tags for categorizing models."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#007bff')  # Hex color code
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'registry_model_tags'
        verbose_name = 'Model Tag'
        verbose_name_plural = 'Model Tags'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class ModelDocumentation(models.Model):
    """Documentation and attachments for models."""
    
    DOCUMENT_TYPES = [
        ('model_card', 'Model Card'),
        ('technical_doc', 'Technical Documentation'),
        ('user_guide', 'User Guide'),
        ('api_doc', 'API Documentation'),
        ('performance_report', 'Performance Report'),
        ('fairness_report', 'Fairness Report'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model = models.ForeignKey(Model, on_delete=models.CASCADE, related_name='documentation')
    title = models.CharField(max_length=200)
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    content = models.TextField(blank=True)  # Markdown content
    file = models.FileField(upload_to='model_docs/', null=True, blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'registry_model_documentation'
        verbose_name = 'Model Documentation'
        verbose_name_plural = 'Model Documentation'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['model', 'document_type']),
        ]
    
    def __str__(self):
        return f"{self.model.name} - {self.title}"
