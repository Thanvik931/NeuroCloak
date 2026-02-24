from rest_framework import permissions
from .models import ProjectMember


class IsProjectMember(permissions.BasePermission):
    """
    Custom permission to only allow project members to access resources.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Get project_id from URL kwargs
        project_id = view.kwargs.get('project_id')
        if not project_id:
            return True  # Skip check for views that don't require project_id
        
        return ProjectMember.objects.filter(
            project_id=project_id,
            user=request.user
        ).exists()


class IsProjectAdmin(permissions.BasePermission):
    """
    Custom permission to only allow project admins or owners to manage resources.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Get project_id from URL kwargs
        project_id = view.kwargs.get('project_id')
        if not project_id:
            return True  # Skip check for views that don't require project_id
        
        try:
            member = ProjectMember.objects.get(
                project_id=project_id,
                user=request.user
            )
            return member.role in ['admin', 'owner']
        except ProjectMember.DoesNotExist:
            return False


class IsProjectOwner(permissions.BasePermission):
    """
    Custom permission to only allow project owners.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Get project_id from URL kwargs
        project_id = view.kwargs.get('project_id')
        if not project_id:
            return True  # Skip check for views that don't require project_id
        
        try:
            member = ProjectMember.objects.get(
                project_id=project_id,
                user=request.user
            )
            return member.role == 'owner'
        except ProjectMember.DoesNotExist:
            return False
