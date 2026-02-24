from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from .models import Organization, OrganizationMember, OrganizationInvitation
from .serializers import (
    OrganizationSerializer, OrganizationDetailSerializer, OrganizationMemberSerializer,
    OrganizationInvitationSerializer, AddMemberSerializer, UpdateMemberRoleSerializer
)
from .permissions import IsOrganizationMember, IsOrganizationAdmin


class OrganizationListCreateView(ListCreateAPIView):
    """List and create organizations."""
    
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only show organizations where user is a member."""
        return Organization.objects.filter(
            members__user=self.request.user,
            is_active=True
        ).distinct()
    
    @extend_schema(
        summary="List organizations",
        description="Get list of organizations where the user is a member"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @extend_schema(
        summary="Create organization",
        description="Create a new organization and become its owner"
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class OrganizationDetailView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete an organization."""
    
    serializer_class = OrganizationDetailSerializer
    permission_classes = [IsOrganizationMember]
    
    def get_queryset(self):
        return Organization.objects.filter(is_active=True)
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return OrganizationDetailSerializer
        return OrganizationSerializer
    
    @extend_schema(
        summary="Get organization details",
        description="Get detailed information about an organization including members"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @extend_schema(
        summary="Update organization",
        description="Update organization information"
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)
    
    @extend_schema(
        summary="Delete organization",
        description="Delete an organization (owners only)"
    )
    def delete(self, request, *args, **kwargs):
        org = self.get_object()
        member = OrganizationMember.objects.get(organization=org, user=request.user)
        
        if not member.can_delete_organization():
            return Response(
                {'error': 'Only organization owners can delete organizations'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().delete(request, *args, **kwargs)


class OrganizationMemberListView(APIView):
    """List and add members to an organization."""
    
    permission_classes = [IsOrganizationMember]
    
    @extend_schema(
        summary="List organization members",
        description="Get list of all members in an organization"
    )
    def get(self, request, org_id):
        org = get_object_or_404(Organization, id=org_id)
        members = org.members.all().select_related('user', 'user__profile')
        serializer = OrganizationMemberSerializer(members, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Add member to organization",
        description="Add a new member to the organization or send invitation"
    )
    def post(self, request, org_id):
        org = get_object_or_404(Organization, id=org_id)
        
        # Check if user can manage members
        member = OrganizationMember.objects.get(organization=org, user=request.user)
        if not member.can_manage_members():
            return Response(
                {'error': 'You don\'t have permission to manage members'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AddMemberSerializer(
            data=request.data,
            context={'organization_id': org_id}
        )
        if serializer.is_valid():
            email = serializer.validated_data['email']
            role = serializer.validated_data['role']
            message = serializer.validated_data.get('message', '')
            
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user = User.objects.get(email=email)
                
                # Add user directly to organization
                org.add_member(user, role)
                
                return Response(
                    {'message': f'{email} has been added to {org.name}'},
                    status=status.HTTP_201_CREATED
                )
                
            except User.DoesNotExist:
                # Create invitation
                invitation = OrganizationInvitation.objects.create(
                    organization=org,
                    email=email,
                    role=role,
                    invited_by=request.user,
                    message=message
                )
                
                # TODO: Send invitation email
                
                return Response(
                    {'message': f'Invitation sent to {email}'},
                    status=status.HTTP_201_CREATED
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrganizationMemberDetailView(APIView):
    """Update or remove organization members."""
    
    permission_classes = [IsOrganizationAdmin]
    
    def get_member(self, org_id, member_id):
        org = get_object_or_404(Organization, id=org_id)
        return get_object_or_404(OrganizationMember, id=member_id, organization=org)
    
    @extend_schema(
        summary="Update member role",
        description="Update the role of an organization member"
    )
    def patch(self, request, org_id, member_id):
        member = self.get_member(org_id, member_id)
        
        serializer = UpdateMemberRoleSerializer(
            data=request.data,
            context={'member': member, 'request': request}
        )
        if serializer.is_valid():
            member.role = serializer.validated_data['role']
            member.save()
            return Response(OrganizationMemberSerializer(member).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        summary="Remove member",
        description="Remove a member from the organization"
    )
    def delete(self, request, org_id, member_id):
        member = self.get_member(org_id, member_id)
        
        # Prevent removing the last owner
        if member.role == 'owner':
            owner_count = OrganizationMember.objects.filter(
                organization=member.organization,
                role='owner'
            ).count()
            if owner_count <= 1:
                return Response(
                    {'error': 'Cannot remove the last owner of the organization'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Allow users to remove themselves
        if member.user != request.user:
            # Check if current user can manage members
            current_member = OrganizationMember.objects.get(
                organization=member.organization,
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


class OrganizationInvitationListView(APIView):
    """List and manage organization invitations."""
    
    permission_classes = [IsOrganizationAdmin]
    
    @extend_schema(
        summary="List pending invitations",
        description="Get list of pending invitations for an organization"
    )
    def get(self, request, org_id):
        org = get_object_or_404(Organization, id=org_id)
        invitations = org.invitations.filter(is_accepted=False, is_expired=False)
        serializer = OrganizationInvitationSerializer(invitations, many=True)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@extend_schema(
    summary="Accept organization invitation",
    description="Accept an organization invitation by token"
)
def accept_invitation(request, token):
    """Accept an organization invitation."""
    try:
        invitation = OrganizationInvitation.objects.get(token=token)
    except OrganizationInvitation.DoesNotExist:
        return Response(
            {'error': 'Invalid invitation token'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if invitation.email != request.user.email:
        return Response(
            {'error': 'This invitation is not for your email address'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if invitation.accept(request.user):
        return Response(
            {'message': f'You have joined {invitation.organization.name}'},
            status=status.HTTP_200_OK
        )
    else:
        return Response(
            {'error': 'Invitation is no longer valid'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@extend_schema(
    summary="Get user organizations",
    description="Get all organizations where the user is a member"
)
def user_organizations(request):
    """Get all organizations for the current user."""
    organizations = Organization.objects.filter(
        members__user=request.user,
        is_active=True
    ).distinct()
    
    serializer = OrganizationSerializer(organizations, many=True)
    return Response(serializer.data)
