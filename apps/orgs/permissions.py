from rest_framework import permissions
from .models import OrganizationMember


class IsOrganizationMember(permissions.BasePermission):
    """
    Custom permission to only allow organization members to access resources.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Get organization_id from URL kwargs
        org_id = view.kwargs.get('org_id')
        if not org_id:
            return True  # Skip check for views that don't require org_id
        
        return OrganizationMember.objects.filter(
            organization_id=org_id,
            user=request.user
        ).exists()


class IsOrganizationAdmin(permissions.BasePermission):
    """
    Custom permission to only allow organization admins or owners to manage resources.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Get organization_id from URL kwargs
        org_id = view.kwargs.get('org_id')
        if not org_id:
            return True  # Skip check for views that don't require org_id
        
        try:
            member = OrganizationMember.objects.get(
                organization_id=org_id,
                user=request.user
            )
            return member.role in ['admin', 'owner']
        except OrganizationMember.DoesNotExist:
            return False


class IsOrganizationOwner(permissions.BasePermission):
    """
    Custom permission to only allow organization owners.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Get organization_id from URL kwargs
        org_id = view.kwargs.get('org_id')
        if not org_id:
            return True  # Skip check for views that don't require org_id
        
        try:
            member = OrganizationMember.objects.get(
                organization_id=org_id,
                user=request.user
            )
            return member.role == 'owner'
        except OrganizationMember.DoesNotExist:
            return False
