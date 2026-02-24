import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Organization(models.Model):
    """Organization model for multi-tenant architecture."""
    
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('member', 'Member'),
        ('viewer', 'Viewer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='org_logos/', null=True, blank=True)
    website = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'orgs_organizations'
        verbose_name = 'Organization'
        verbose_name_plural = 'Organizations'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def member_count(self):
        return self.members.count()
    
    def add_member(self, user, role='member'):
        """Add a user to the organization with a specific role."""
        membership, created = OrganizationMember.objects.get_or_create(
            organization=self,
            user=user,
            defaults={'role': role}
        )
        if not created:
            membership.role = role
            membership.save()
        return membership
    
    def remove_member(self, user):
        """Remove a user from the organization."""
        OrganizationMember.objects.filter(organization=self, user=user).delete()
    
    def get_member_role(self, user):
        """Get the role of a user in the organization."""
        try:
            return OrganizationMember.objects.get(organization=self, user=user).role
        except OrganizationMember.DoesNotExist:
            return None
    
    def is_member(self, user):
        """Check if a user is a member of the organization."""
        return OrganizationMember.objects.filter(organization=self, user=user).exists()


class OrganizationMember(models.Model):
    """Organization membership model."""
    
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organizations')
    role = models.CharField(max_length=20, choices=Organization.ROLE_CHOICES, default='member')
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='invited_members')
    joined_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'orgs_members'
        verbose_name = 'Organization Member'
        verbose_name_plural = 'Organization Members'
        unique_together = ['organization', 'user']
        indexes = [
            models.Index(fields=['organization', 'role']),
            models.Index(fields=['user', 'role']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.organization.name} ({self.role})"
    
    def can_manage_members(self):
        """Check if this member can manage other members."""
        return self.role in ['owner', 'admin']
    
    def can_delete_organization(self):
        """Check if this member can delete the organization."""
        return self.role == 'owner'


class OrganizationInvitation(models.Model):
    """Organization invitation model."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='invitations')
    email = models.EmailField()
    role = models.CharField(max_length=20, choices=Organization.ROLE_CHOICES, default='member')
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    message = models.TextField(blank=True)
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    is_accepted = models.BooleanField(default=False)
    is_expired = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'orgs_invitations'
        verbose_name = 'Organization Invitation'
        verbose_name_plural = 'Organization Invitations'
        unique_together = ['organization', 'email']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['email', 'is_accepted']),
        ]
    
    def __str__(self):
        return f"Invitation to {self.email} for {self.organization.name}"
    
    def is_valid(self):
        """Check if the invitation is still valid."""
        from django.utils import timezone
        return not self.is_accepted and not self.is_expired and self.expires_at > timezone.now()
    
    def accept(self, user):
        """Accept the invitation and add user to organization."""
        if self.is_valid():
            self.organization.add_member(user, self.role)
            self.is_accepted = True
            self.save()
            return True
        return False
