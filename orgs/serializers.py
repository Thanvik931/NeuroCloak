import uuid
from django.utils import timezone
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Organization, OrganizationMember, OrganizationInvitation

User = get_user_model()


class OrganizationSerializer(serializers.ModelSerializer):
    """Serializer for organizations."""
    
    member_count = serializers.ReadOnlyField()
    created_by = serializers.SerializerMethodField()
    
    class Meta:
        model = Organization
        fields = ('id', 'name', 'slug', 'description', 'logo', 'website', 'is_active',
                 'member_count', 'created_by', 'created_at', 'updated_at')
        read_only_fields = ('id', 'slug', 'member_count', 'created_by', 'created_at', 'updated_at')
    
    def get_created_by(self, obj):
        """Get the creator of the organization."""
        owner_member = obj.members.filter(role='owner').first()
        return owner_member.user.email if owner_member else None
    
    def create(self, validated_data):
        """Create organization and add creator as owner."""
        user = self.context['request'].user
        organization = super().create(validated_data)
        organization.add_member(user, 'owner')
        return organization


class OrganizationMemberSerializer(serializers.ModelSerializer):
    """Serializer for organization members."""
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.CharField(source='user.full_name', read_only=True)
    user_avatar = serializers.ImageField(source='user.profile.avatar', read_only=True)
    
    class Meta:
        model = OrganizationMember
        fields = ('id', 'user', 'user_email', 'user_full_name', 'user_avatar',
                 'role', 'joined_at', 'updated_at')
        read_only_fields = ('id', 'joined_at', 'updated_at')


class OrganizationInvitationSerializer(serializers.ModelSerializer):
    """Serializer for organization invitations."""
    
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    invited_by_email = serializers.CharField(source='invited_by.email', read_only=True)
    
    class Meta:
        model = OrganizationInvitation
        fields = ('id', 'organization', 'organization_name', 'email', 'role',
                 'invited_by', 'invited_by_email', 'message', 'token',
                 'is_accepted', 'is_expired', 'created_at', 'expires_at')
        read_only_fields = ('id', 'token', 'is_accepted', 'is_expired', 'created_at')
    
    def create(self, validated_data):
        """Create invitation with expiration date."""
        validated_data['expires_at'] = timezone.now() + timezone.timedelta(days=7)
        return super().create(validated_data)


class OrganizationDetailSerializer(OrganizationSerializer):
    """Detailed serializer for organizations with members."""
    
    members = OrganizationMemberSerializer(source='members.all', many=True, read_only=True)
    pending_invitations = OrganizationInvitationSerializer(
        source='invitations.filter(is_accepted=False, is_expired=False)',
        many=True,
        read_only=True
    )
    
    class Meta(OrganizationSerializer.Meta):
        fields = OrganizationSerializer.Meta.fields + ('members', 'pending_invitations')


class AddMemberSerializer(serializers.Serializer):
    """Serializer for adding members to an organization."""
    
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=Organization.ROLE_CHOICES, default='member')
    message = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_email(self, value):
        """Validate email and check if user exists."""
        try:
            user = User.objects.get(email=value)
            # Check if user is already a member
            org_id = self.context['organization_id']
            if OrganizationMember.objects.filter(organization_id=org_id, user=user).exists():
                raise serializers.ValidationError("User is already a member of this organization")
        except User.DoesNotExist:
            # User doesn't exist, will create invitation
            pass
        return value


class UpdateMemberRoleSerializer(serializers.Serializer):
    """Serializer for updating member roles."""
    
    role = serializers.ChoiceField(choices=Organization.ROLE_CHOICES)
    
    def validate_role(self, value):
        """Validate role change."""
        member = self.context['member']
        current_user = self.context['request'].user
        
        # Check if current user can change this role
        org_member = OrganizationMember.objects.get(
            organization=member.organization,
            user=current_user
        )
        
        if not org_member.can_manage_members():
            raise serializers.ValidationError("You don't have permission to manage members")
        
        # Only owners can assign owner role
        if value == 'owner' and org_member.role != 'owner':
            raise serializers.ValidationError("Only owners can assign owner role")
        
        return value
