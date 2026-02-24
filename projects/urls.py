from django.urls import path
from .views import (
    ProjectListCreateView, ProjectDetailView,
    ProjectMemberListView, ProjectMemberDetailView,
    ProjectAPIKeyListCreateView, ProjectAPIKeyDetailView,
    ProjectConfigurationListCreateView, ProjectConfigurationDetailView,
    user_projects
)

urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project_list_create'),
    path('<uuid:project_id>/', ProjectDetailView.as_view(), name='project_detail'),
    path('<uuid:project_id>/members/', ProjectMemberListView.as_view(), name='project_members'),
    path('<uuid:project_id>/members/<uuid:member_id>/', ProjectMemberDetailView.as_view(), name='project_member_detail'),
    path('<uuid:project_id>/api-keys/', ProjectAPIKeyListCreateView.as_view(), name='project_api_keys'),
    path('<uuid:project_id>/api-keys/<uuid:api_key_id>/', ProjectAPIKeyDetailView.as_view(), name='project_api_key_detail'),
    path('<uuid:project_id>/configurations/', ProjectConfigurationListCreateView.as_view(), name='project_configurations'),
    path('<uuid:project_id>/configurations/<uuid:config_id>/', ProjectConfigurationDetailView.as_view(), name='project_configuration_detail'),
    path('my-projects/', user_projects, name='user_projects'),
]
