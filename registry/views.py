from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from drf_spectacular.utils import extend_schema

from .models import Model, ModelVersion, ModelEndpoint, ModelTag, ModelDocumentation
from .serializers import (
    ModelSerializer, ModelDetailSerializer, ModelListSerializer,
    ModelVersionSerializer, ModelEndpointSerializer, ModelTagSerializer,
    ModelDocumentationSerializer, ModelPromotionSerializer, ModelDeploymentSerializer
)
from apps.projects.permissions import IsProjectMember, IsProjectAdmin


class ModelListCreateView(ListCreateAPIView):
    """List and create models."""
    
    permission_classes = [IsProjectMember]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        """Filter models by project."""
        project_id = self.kwargs.get('project_id')
        return Model.objects.filter(
            project_id=project_id,
            is_active=True
        ).select_related('project', 'owner')
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ModelListSerializer
        return ModelSerializer
    
    @extend_schema(
        summary="List models",
        description="Get list of models in a project"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @extend_schema(
        summary="Create model",
        description="Register a new model in the project"
    )
    def post(self, request, *args, **kwargs):
        # Add project_id to request data
        project_id = self.kwargs.get('project_id')
        request.data['project'] = project_id
        return super().post(request, *args, **kwargs)


class ModelDetailView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a model."""
    
    serializer_class = ModelDetailSerializer
    permission_classes = [IsProjectMember]
    
    def get_queryset(self):
        return Model.objects.filter(is_active=True).select_related('project', 'owner')
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ModelDetailSerializer
        return ModelSerializer
    
    @extend_schema(
        summary="Get model details",
        description="Get detailed information about a model including versions and endpoints"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @extend_schema(
        summary="Update model",
        description="Update model information"
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)
    
    @extend_schema(
        summary="Delete model",
        description="Delete a model (soft delete)"
    )
    def delete(self, request, *args, **kwargs):
        model = self.get_object()
        model.is_active = False
        model.save()
        return Response(
            {'message': 'Model deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )


class ModelVersionListCreateView(APIView):
    """List and create model versions."""
    
    permission_classes = [IsProjectAdmin]
    
    @extend_schema(
        summary="List model versions",
        description="Get all versions of a model"
    )
    def get(self, request, project_id, model_id):
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
        versions = model.versions.all().order_by('-created_at')
        serializer = ModelVersionSerializer(versions, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Create model version",
        description="Create a new version of a model"
    )
    def post(self, request, project_id, model_id):
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        serializer = ModelVersionSerializer(data=request.data)
        if serializer.is_valid():
            version = serializer.save(model=model)
            return Response(ModelVersionSerializer(version).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ModelPromotionView(APIView):
    """Promote model versions."""
    
    permission_classes = [IsProjectAdmin]
    
    @extend_schema(
        summary="Promote model version",
        description="Promote a model version to production"
    )
    def post(self, request, project_id, model_id):
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        serializer = ModelPromotionSerializer(
            data=request.data,
            context={'model_id': model_id}
        )
        if serializer.is_valid():
            version_str = serializer.validated_data['version']
            changelog = serializer.validated_data.get('changelog', '')
            
            # Get the version
            version = get_object_or_404(ModelVersion, model=model, version=version_str)
            
            # Promote the version
            version.is_promoted = True
            version.promoted_by = request.user
            version.changelog = changelog
            version.save()
            
            # Update model status
            model.is_deployed = True
            model.environment = 'production'
            model.save()
            
            return Response({
                'message': f'Model version {version_str} promoted to production',
                'version': ModelVersionSerializer(version).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ModelDeploymentView(APIView):
    """Deploy models to environments."""
    
    permission_classes = [IsProjectAdmin]
    
    @extend_schema(
        summary="Deploy model",
        description="Deploy a model to a specific environment"
    )
    def post(self, request, project_id, model_id):
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        serializer = ModelDeploymentSerializer(
            data=request.data,
            context={'model': model}
        )
        if serializer.is_valid():
            environment = serializer.validated_data['environment']
            endpoint_url = serializer.validated_data.get('endpoint_url')
            health_check_url = serializer.validated_data.get('health_check_url')
            
            # Update model environment
            model.environment = environment
            if environment == 'production':
                model.is_deployed = True
                from django.utils import timezone
                model.deployed_at = timezone.now()
            model.save()
            
            # Create endpoint if URL provided
            if endpoint_url:
                ModelEndpoint.objects.create(
                    model=model,
                    name=f"{environment}_endpoint",
                    url=endpoint_url,
                    health_check_url=health_check_url or '',
                    method='POST'
                )
            
            return Response({
                'message': f'Model deployed to {environment}',
                'model': ModelSerializer(model).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ModelEndpointListCreateView(APIView):
    """List and create model endpoints."""
    
    permission_classes = [IsProjectAdmin]
    
    @extend_schema(
        summary="List model endpoints",
        description="Get all endpoints for a model"
    )
    def get(self, request, project_id, model_id):
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
        endpoints = model.endpoints.filter(is_active=True)
        serializer = ModelEndpointSerializer(endpoints, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Create model endpoint",
        description="Create a new endpoint for a model"
    )
    def post(self, request, project_id, model_id):
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        serializer = ModelEndpointSerializer(data=request.data)
        if serializer.is_valid():
            endpoint = serializer.save(model=model)
            return Response(ModelEndpointSerializer(endpoint).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ModelDocumentationListCreateView(APIView):
    """List and create model documentation."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="List model documentation",
        description="Get all documentation for a model"
    )
    def get(self, request, project_id, model_id):
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
        docs = model.documentation.all().order_by('-created_at')
        serializer = ModelDocumentationSerializer(docs, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Create model documentation",
        description="Add documentation to a model"
    )
    def post(self, request, project_id, model_id):
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        serializer = ModelDocumentationSerializer(data=request.data)
        if serializer.is_valid():
            doc = serializer.save(model=model, created_by=request.user)
            return Response(ModelDocumentationSerializer(doc).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ModelTagListView(APIView):
    """List and manage model tags."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="List model tags",
        description="Get all available model tags"
    )
    def get(self, request):
        tags = ModelTag.objects.all()
        serializer = ModelTagSerializer(tags, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Create model tag",
        description="Create a new model tag"
    )
    def post(self, request):
        serializer = ModelTagSerializer(data=request.data)
        if serializer.is_valid():
            tag = serializer.save()
            return Response(ModelTagSerializer(tag).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@extend_schema(
    summary="Get user models",
    description="Get all models where the user is a project member"
)
def user_models(request):
    """Get all models for the current user."""
    models = Model.objects.filter(
        project__members__user=request.user,
        is_active=True
    ).distinct().select_related('project', 'owner')
    
    serializer = ModelListSerializer(models, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsProjectAdmin])
@extend_schema(
    summary="Clone model",
    description="Clone a model to create a new version"
)
def clone_model(request, project_id, model_id):
    """Clone a model to create a new version."""
    model = get_object_or_404(Model, id=model_id, project_id=project_id)
    
    new_version = request.data.get('version')
    if not new_version:
        return Response(
            {'error': 'Version is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if version already exists
    if Model.objects.filter(project=model.project, name=model.name, version=new_version).exists():
        return Response(
            {'error': 'Version already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Clone the model
    new_model = Model.objects.create(
        project=model.project,
        name=model.name,
        version=new_version,
        display_name=model.display_name,
        description=model.description,
        model_type=model.model_type,
        environment='development',  # Start in development
        dataset_name=model.dataset_name,
        training_date=model.training_date,
        features=model.features,
        target=model.target,
        protected_attributes=model.protected_attributes,
        tags=model.tags,
        model_card=model.model_card,
        baseline_metrics=model.baseline_metrics,
        owner=request.user
    )
    
    return Response(
        ModelSerializer(new_model).data,
        status=status.HTTP_201_CREATED
    )
