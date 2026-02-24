from django.urls import path
from .views import (
    ModelListCreateView, ModelDetailView,
    ModelVersionListCreateView, ModelPromotionView, ModelDeploymentView,
    ModelEndpointListCreateView, ModelDocumentationListCreateView,
    ModelTagListView, user_models, clone_model
)

urlpatterns = [
    path('', ModelListCreateView.as_view(), name='model_list_create'),
    path('<uuid:model_id>/', ModelDetailView.as_view(), name='model_detail'),
    path('<uuid:model_id>/versions/', ModelVersionListCreateView.as_view(), name='model_versions'),
    path('<uuid:model_id>/promote/', ModelPromotionView.as_view(), name='model_promotion'),
    path('<uuid:model_id>/deploy/', ModelDeploymentView.as_view(), name='model_deployment'),
    path('<uuid:model_id>/endpoints/', ModelEndpointListCreateView.as_view(), name='model_endpoints'),
    path('<uuid:model_id>/documentation/', ModelDocumentationListCreateView.as_view(), name='model_documentation'),
    path('<uuid:model_id>/clone/', clone_model, name='model_clone'),
    path('tags/', ModelTagListView.as_view(), name='model_tags'),
    path('my-models/', user_models, name='user_models'),
]
