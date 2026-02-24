from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from drf_spectacular.utils import extend_schema

from .models import Project, ProjectMember, ProjectAPIKey, ProjectConfiguration
from .serializers import (
    ProjectSerializer, ProjectDetailSerializer, ProjectListSerializer,
    ProjectMemberSerializer, ProjectAPIKeySerializer, ProjectConfigurationSerializer,
    AddProjectMemberSerializer, UpdateProjectMemberRoleSerializer
)
from .permissions import IsProjectMember, IsProjectAdmin


class ProjectListCreateView(ListCreateAPIView):
    """List and create projects."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only show projects where user is a member."""
        return Project.objects.filter(
            members__user=self.request.user,
            is_active=True
        ).distinct().select_related('organization')
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ProjectListSerializer
        return ProjectSerializer
    
    @extend_schema(
        summary="List projects",
        description="Get list of projects where the user is a member"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @extend_schema(
        summary="Create project",
        description="Create a new project and become its owner"
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class ProjectDetailView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a project."""
    
    serializer_class = ProjectDetailSerializer
    permission_classes = [IsProjectMember]
    
    def get_queryset(self):
        return Project.objects.filter(is_active=True).select_related('organization')
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ProjectDetailSerializer
        return ProjectSerializer
    
    @extend_schema(
        summary="Get project details",
        description="Get detailed information about a project including members and configurations"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @extend_schema(
        summary="Update project",
        description="Update project information"
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)
    
    @extend_schema(
        summary="Delete project",
        description="Delete a project (owners only)"
    )
    def delete(self, request, *args, **kwargs):
        project = self.get_object()
        member = ProjectMember.objects.get(project=project, user=request.user)
        
        if not member.can_delete_project():
            return Response(
                {'error': 'Only project owners can delete projects'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().delete(request, *args, **kwargs)


class ProjectMemberListView(APIView):
    """List and add members to a project."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="List project members",
        description="Get list of all members in a project"
    )
    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        members = project.members.all().select_related('user', 'user__profile', 'added_by')
        serializer = ProjectMemberSerializer(members, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Add member to project",
        description="Add a new member to the project"
    )
    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        
        # Check if user can manage members
        member = ProjectMember.objects.get(project=project, user=request.user)
        if not member.can_manage_members():
            return Response(
                {'error': 'You don\'t have permission to manage members'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AddProjectMemberSerializer(
            data=request.data,
            context={'project_id': project_id}
        )
        if serializer.is_valid():
            email = serializer.validated_data['email']
            role = serializer.validated_data['role']
            
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.get(email=email)
            
            # Add user to project
            project.add_member(user, role)
            
            return Response(
                {'message': f'{email} has been added to {project.name}'},
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectMemberDetailView(APIView):
    """Update or remove project members."""
    
    permission_classes = [IsProjectAdmin]
    
    def get_member(self, project_id, member_id):
        project = get_object_or_404(Project, id=project_id)
        return get_object_or_404(ProjectMember, id=member_id, project=project)
    
    @extend_schema(
        summary="Update member role",
        description="Update the role of a project member"
    )
    def patch(self, request, project_id, member_id):
        member = self.get_member(project_id, member_id)
        
        serializer = UpdateProjectMemberRoleSerializer(
            data=request.data,
            context={'member': member, 'request': request}
        )
        if serializer.is_valid():
            member.role = serializer.validated_data['role']
            member.save()
            return Response(ProjectMemberSerializer(member).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        summary="Remove member",
        description="Remove a member from the project"
    )
    def delete(self, request, project_id, member_id):
        member = self.get_member(project_id, member_id)
        
        # Prevent removing the last owner
        if member.role == 'owner':
            owner_count = ProjectMember.objects.filter(
                project=member.project,
                role='owner'
            ).count()
            if owner_count <= 1:
                return Response(
                    {'error': 'Cannot remove the last owner of the project'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Allow users to remove themselves
        if member.user != request.user:
            # Check if current user can manage members
            current_member = ProjectMember.objects.get(
                project=member.project,
                user=request.user
            )
            if not current_member.can_manage_members():
                return Response(
                    {'error': 'You don\'t have permission to remove members'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        member.delete()
        return Response(
            {'message': 'Member removed successfully'},
            status=status.HTTP_204_NO_CONTENT
        )


class ProjectAPIKeyListCreateView(APIView):
    """List and create project API keys."""
    
    permission_classes = [IsProjectAdmin]
    
    @extend_schema(
        summary="List project API keys",
        description="Get all API keys for a project"
    )
    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        api_keys = project.api_keys.filter(is_active=True)
        serializer = ProjectAPIKeySerializer(api_keys, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Create project API key",
        description="Create a new API key for model ingestion"
    )
    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        
        serializer = ProjectAPIKeySerializer(data=request.data)
        if serializer.is_valid():
            api_key = serializer.save(project=project)
            return Response(ProjectAPIKeySerializer(api_key).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectAPIKeyDetailView(APIView):
    """Retrieve, update, or delete project API keys."""
    
    permission_classes = [IsProjectAdmin]
    
    def get_api_key(self, project_id, api_key_id):
        project = get_object_or_404(Project, id=project_id)
        return get_object_or_404(ProjectAPIKey, id=api_key_id, project=project)
    
    @extend_schema(
        summary="Get API key",
        description="Retrieve details of a specific API key"
    )
    def get(self, request, project_id, api_key_id):
        api_key = self.get_api_key(project_id, api_key_id)
        serializer = ProjectAPIKeySerializer(api_key)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Update API key",
        description="Update API key settings"
    )
    def patch(self, request, project_id, api_key_id):
        api_key = self.get_api_key(project_id, api_key_id)
        
        # Only allow updating certain fields
        allowed_fields = ['name', 'is_active', 'permissions', 'rate_limit']
        for field in allowed_fields:
            if field in request.data:
                setattr(api_key, field, request.data[field])
        
        api_key.save()
        serializer = ProjectAPIKeySerializer(api_key)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Delete API key",
        description="Delete an API key"
    )
    def delete(self, request, project_id, api_key_id):
        api_key = self.get_api_key(project_id, api_key_id)
        api_key.delete()
        return Response(
            {'message': 'API key deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )


class ProjectConfigurationListCreateView(APIView):
    """List and create project configurations."""
    
    permission_classes = [IsProjectAdmin]
    
    @extend_schema(
        summary="List project configurations",
        description="Get all configurations for a project"
    )
    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        configurations = project.configurations.all().order_by('-version')
        serializer = ProjectConfigurationSerializer(configurations, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Create project configuration",
        description="Create a new project configuration"
    )
    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        
        serializer = ProjectConfigurationSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            config = serializer.save(project=project)
            return Response(ProjectConfigurationSerializer(config).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectConfigurationDetailView(APIView):
    """Retrieve, update, or delete project configurations."""
    
    permission_classes = [IsProjectAdmin]
    
    def get_configuration(self, project_id, config_id):
        project = get_object_or_404(Project, id=project_id)
        return get_object_or_404(ProjectConfiguration, id=config_id, project=project)
    
    @extend_schema(
        summary="Get configuration",
        description="Retrieve details of a specific configuration"
    )
    def get(self, request, project_id, config_id):
        config = self.get_configuration(project_id, config_id)
        serializer = ProjectConfigurationSerializer(config)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Activate configuration",
        description="Activate a specific configuration"
    )
    def post(self, request, project_id, config_id):
        config = self.get_configuration(project_id, config_id)
        config.is_active = True
        config.save()
        return Response(ProjectConfigurationSerializer(config).data)
    
    @extend_schema(
        summary="Delete configuration",
        description="Delete a configuration"
    )
    def delete(self, request, project_id, config_id):
        config = self.get_configuration(project_id, config_id)
        
        # Prevent deleting active configuration
        if config.is_active:
            return Response(
                {'error': 'Cannot delete active configuration'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        config.delete()
        return Response(
            {'message': 'Configuration deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@extend_schema(
    summary="Get user projects",
    description="Get all projects where the user is a member"
)
def user_projects(request):
    """Get all projects for the current user."""
    projects = Project.objects.filter(
        members__user=request.user,
        is_active=True
    ).distinct().select_related('organization')
    
    serializer = ProjectListSerializer(projects, many=True)
    return Response(serializer.data)
