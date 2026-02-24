import uuid
from django.db import models
from django.contrib.auth import get_user_model

from apps.orgs.models import Organization

User = get_user_model()


class Project(models.Model):
    """Project model for organizing models and evaluations."""
    
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('member', 'Member'),
        ('viewer', 'Viewer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    # Project configuration
    trust_score_weights = models.JSONField(default=dict)
    alert_thresholds = models.JSONField(default=dict)
    protected_attributes = models.JSONField(default=list)
    evaluation_schedule = models.CharField(max_length=50, default='*/5 * * * *')  # Cron expression
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'projects'
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
        unique_together = ['organization', 'slug']
        ordering = ['name']
        indexes = [
            models.Index(fields=['organization', 'is_active']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        return f"{self.organization.name} - {self.name}"
    
    @property
    def member_count(self):
        return self.members.count()
    
    def add_member(self, user, role='member'):
        """Add a user to the project with a specific role."""
        membership, created = ProjectMember.objects.get_or_create(
            project=self,
            user=user,
            defaults={'role': role}
        )
        if not created:
            membership.role = role
            membership.save()
        return membership
    
    def remove_member(self, user):
        """Remove a user from the project."""
        ProjectMember.objects.filter(project=self, user=user).delete()
    
    def get_member_role(self, user):
        """Get the role of a user in the project."""
        try:
            return ProjectMember.objects.get(project=self, user=user).role
        except ProjectMember.DoesNotExist:
            return None
    
    def is_member(self, user):
        """Check if a user is a member of the project."""
        return ProjectMember.objects.filter(project=self, user=user).exists()


class ProjectMember(models.Model):
    """Project membership model."""
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    role = models.CharField(max_length=20, choices=Project.ROLE_CHOICES, default='member')
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='added_project_members')
    joined_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'project_members'
        verbose_name = 'Project Member'
        verbose_name_plural = 'Project Members'
        unique_together = ['project', 'user']
        indexes = [
            models.Index(fields=['project', 'role']),
            models.Index(fields=['user', 'role']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.project.name} ({self.role})"
    
    def can_manage_members(self):
        """Check if this member can manage other members."""
        return self.role in ['owner', 'admin']
    
    def can_delete_project(self):
        """Check if this member can delete the project."""
        return self.role == 'owner'


class ProjectAPIKey(models.Model):
    """API keys specific to projects for model ingestion."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=100)
    key = models.CharField(max_length=32, unique=True, editable=False)
    is_active = models.BooleanField(default=True)
    permissions = models.JSONField(default=list)  # List of allowed actions
    rate_limit = models.IntegerField(default=1000)  # Requests per hour
    expires_at = models.DateTimeField(null=True, blank=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'project_api_keys'
        verbose_name = 'Project API Key'
        verbose_name_plural = 'Project API Keys'
        indexes = [
            models.Index(fields=['key']),
            models.Index(fields=['project', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.project.name}"
    
    def is_valid(self):
        """Check if API key is valid and not expired."""
        from django.utils import timezone
        if not self.is_active:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        return True
    
    def update_last_used(self):
        """Update the last used timestamp."""
        from django.utils import timezone
        self.last_used_at = timezone.now()
        self.save(update_fields=['last_used_at'])


class ProjectConfiguration(models.Model):
    """Versioned project configuration for trust score and evaluation settings."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='configurations')
    version = models.IntegerField()
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    # Trust Score Configuration
    trust_score_weights = models.JSONField(default=dict)
    trust_score_threshold = models.FloatField(default=0.7)
    
    # Evaluation Configuration
    evaluation_frequency = models.CharField(max_length=50, default='*/5 * * * *')
    evaluation_batch_size = models.IntegerField(default=1000)
    evaluation_timeout = models.IntegerField(default=300)  # seconds
    
    # Alert Configuration
    alert_thresholds = models.JSONField(default=dict)
    alert_channels = models.JSONField(default=list)
    
    # Fairness Configuration
    protected_attributes = models.JSONField(default=list)
    fairness_metrics = models.JSONField(default=list)
    
    # Drift Configuration
    drift_threshold = models.FloatField(default=0.2)
    drift_metrics = models.JSONField(default=list)
    
    # Robustness Configuration
    robustness_tests = models.JSONField(default=list)
    noise_levels = models.JSONField(default=list)
    
    # Explainability Configuration
    explainability_method = models.CharField(max_length=50, default='shap')
    explainability_samples = models.IntegerField(default=100)
    
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'project_configurations'
        verbose_name = 'Project Configuration'
        verbose_name_plural = 'Project Configurations'
        unique_together = ['project', 'version']
        ordering = ['-version']
        indexes = [
            models.Index(fields=['project', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.project.name} - v{self.version} ({self.name})"
    
    def save(self, *args, **kwargs):
        if not self.version:
            # Auto-increment version
            last_version = ProjectConfiguration.objects.filter(project=self.project).order_by('-version').first()
            self.version = (last_version.version + 1) if last_version else 1
        
        # Deactivate other configurations if this one is active
        if self.is_active:
            ProjectConfiguration.objects.filter(project=self.project).exclude(pk=self.pk).update(is_active=False)
        
        super().save(*args, **kwargs)
