from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    OrganizationListCreateView, OrganizationDetailView,
    OrganizationMemberListView, OrganizationMemberDetailView,
    OrganizationInvitationListView, accept_invitation, user_organizations
)

urlpatterns = [
    path('', OrganizationListCreateView.as_view(), name='organization_list_create'),
    path('<uuid:org_id>/', OrganizationDetailView.as_view(), name='organization_detail'),
    path('<uuid:org_id>/members/', OrganizationMemberListView.as_view(), name='organization_members'),
    path('<uuid:org_id>/members/<uuid:member_id>/', OrganizationMemberDetailView.as_view(), name='organization_member_detail'),
    path('<uuid:org_id>/invitations/', OrganizationInvitationListView.as_view(), name='organization_invitations'),
    path('invitations/<uuid:token>/accept/', accept_invitation, name='accept_invitation'),
    path('my-orgs/', user_organizations, name='user_organizations'),
]
