import uuid
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Project, ProjectMember, ProjectAPIKey, ProjectConfiguration
from apps.orgs.serializers import OrganizationSerializer

User = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for projects."""
    
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    member_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Project
        fields = ('id', 'organization', 'organization_name', 'name', 'slug', 'description',
                 'is_active', 'trust_score_weights', 'alert_thresholds', 'protected_attributes',
                 'evaluation_schedule', 'member_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'member_count', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        """Create project and add creator as owner."""
        user = self.context['request'].user
        project = super().create(validated_data)
        project.add_member(user, 'owner')
        return project


class ProjectDetailSerializer(ProjectSerializer):
    """Detailed serializer for projects with members."""
    
    members = serializers.SerializerMethodField()
    api_keys = serializers.SerializerMethodField()
    active_configuration = serializers.SerializerMethodField()
    
    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ('members', 'api_keys', 'active_configuration')
    
    def get_members(self, obj):
        """Get project members with user details."""
        members = obj.members.all().select_related('user', 'user__profile', 'added_by')
        return ProjectMemberSerializer(members, many=True).data
    
    def get_api_keys(self, obj):
        """Get project API keys."""
        api_keys = obj.api_keys.filter(is_active=True)
        return ProjectAPIKeySerializer(api_keys, many=True).data
    
    def get_active_configuration(self, obj):
        """Get active project configuration."""
        config = obj.configurations.filter(is_active=True).first()
        return ProjectConfigurationSerializer(config).data if config else None


class ProjectMemberSerializer(serializers.ModelSerializer):
    """Serializer for project members."""
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.CharField(source='user.full_name', read_only=True)
    user_avatar = serializers.ImageField(source='user.profile.avatar', read_only=True)
    added_by_email = serializers.CharField(source='added_by.email', read_only=True)
    
    class Meta:
        model = ProjectMember
        fields = ('id', 'user', 'user_email', 'user_full_name', 'user_avatar',
                 'role', 'added_by', 'added_by_email', 'joined_at', 'updated_at')
        read_only_fields = ('id', 'joined_at', 'updated_at')


class ProjectAPIKeySerializer(serializers.ModelSerializer):
    """Serializer for project API keys."""
    
    class Meta:
        model = ProjectAPIKey
        fields = ('id', 'name', 'key', 'is_active', 'permissions', 'rate_limit',
                 'expires_at', 'last_used_at', 'created_at', 'updated_at')
        read_only_fields = ('id', 'key', 'last_used_at', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        """Generate a unique API key."""
        validated_data['key'] = uuid.uuid4().hex + uuid.uuid4().hex[:16]
        return super().create(validated_data)


class ProjectConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for project configurations."""
    
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    
    class Meta:
        model = ProjectConfiguration
        fields = ('id', 'project', 'version', 'name', 'description',
                 'trust_score_weights', 'trust_score_threshold',
                 'evaluation_frequency', 'evaluation_batch_size', 'evaluation_timeout',
                 'alert_thresholds', 'alert_channels',
                 'protected_attributes', 'fairness_metrics',
                 'drift_threshold', 'drift_metrics',
                 'robustness_tests', 'noise_levels',
                 'explainability_method', 'explainability_samples',
                 'is_active', 'created_by', 'created_by_email', 'created_at')
        read_only_fields = ('id', 'version', 'created_by', 'created_at')
    
    def create(self, validated_data):
        """Create configuration with user context."""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class AddProjectMemberSerializer(serializers.Serializer):
    """Serializer for adding members to a project."""
    
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=Project.ROLE_CHOICES, default='member')
    
    def validate_email(self, value):
        """Validate email and check if user exists."""
        try:
            user = User.objects.get(email=value)
            # Check if user is already a member
            project_id = self.context['project_id']
            if ProjectMember.objects.filter(project_id=project_id, user=user).exists():
                raise serializers.ValidationError("User is already a member of this project")
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist")
        return value


class UpdateProjectMemberRoleSerializer(serializers.Serializer):
    """Serializer for updating project member roles."""
    
    role = serializers.ChoiceField(choices=Project.ROLE_CHOICES)
    
    def validate_role(self, value):
        """Validate role change."""
        member = self.context['member']
        current_user = self.context['request'].user
        
        # Check if current user can change this role
        project_member = ProjectMember.objects.get(
            project=member.project,
            user=current_user
        )
        
        if not project_member.can_manage_members():
            raise serializers.ValidationError("You don't have permission to manage members")
        
        # Only owners can assign owner role
        if value == 'owner' and project_member.role != 'owner':
            raise serializers.ValidationError("Only owners can assign owner role")
        
        return value


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for project lists."""
    
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    model_count = serializers.SerializerMethodField()
    latest_trust_score = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ('id', 'name', 'slug', 'organization_name', 'description',
                 'is_active', 'model_count', 'latest_trust_score', 'created_at')
    
    def get_model_count(self, obj):
        """Get number of models in the project."""
        from apps.registry.models import Model
        return Model.objects.filter(project=obj).count()
    
    def get_latest_trust_score(self, obj):
        """Get latest trust score for the project."""
        from apps.evaluations.models import TrustScore
        latest_score = TrustScore.objects.filter(project=obj).order_by('-created_at').first()
        return latest_score.score if latest_score else None
