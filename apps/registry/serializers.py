import uuid
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Model, ModelVersion, ModelEndpoint, ModelTag, ModelDocumentation
from apps.projects.serializers import ProjectListSerializer

User = get_user_model()


class ModelSerializer(serializers.ModelSerializer):
    """Serializer for ML models."""
    
    project_name = serializers.CharField(source='project.name', read_only=True)
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    prediction_count = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Model
        fields = ('id', 'project', 'project_name', 'name', 'version', 'display_name',
                 'description', 'model_type', 'environment', 'dataset_name', 'training_date',
                 'features', 'target', 'protected_attributes', 'tags', 'model_file',
                 'model_card', 'attachments', 'baseline_metrics', 'owner', 'owner_email',
                 'is_active', 'is_deployed', 'prediction_count', 'full_name',
                 'created_at', 'updated_at', 'deployed_at')
        read_only_fields = ('id', 'prediction_count', 'full_name', 'created_at', 'updated_at', 'deployed_at')
    
    def create(self, validated_data):
        """Create model with current user as owner if not specified."""
        if 'owner' not in validated_data:
            validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class ModelDetailSerializer(ModelSerializer):
    """Detailed serializer for models with related data."""
    
    versions = serializers.SerializerMethodField()
    endpoints = serializers.SerializerMethodField()
    documentation = serializers.SerializerMethodField()
    latest_evaluations = serializers.SerializerMethodField()
    
    class Meta(ModelSerializer.Meta):
        fields = ModelSerializer.Meta.fields + ('versions', 'endpoints', 'documentation', 'latest_evaluations')
    
    def get_versions(self, obj):
        """Get model versions."""
        versions = obj.versions.all().order_by('-created_at')
        return ModelVersionSerializer(versions, many=True).data
    
    def get_endpoints(self, obj):
        """Get model endpoints."""
        endpoints = obj.endpoints.filter(is_active=True)
        return ModelEndpointSerializer(endpoints, many=True).data
    
    def get_documentation(self, obj):
        """Get model documentation."""
        docs = obj.documentation.all().order_by('-created_at')
        return ModelDocumentationSerializer(docs, many=True).data
    
    def get_latest_evaluations(self, obj):
        """Get latest evaluation results."""
        from apps.evaluations.models import Evaluation
        latest_evals = Evaluation.objects.filter(model=obj).order_by('-created_at')[:5]
        from apps.evaluations.serializers import EvaluationSerializer
        return EvaluationSerializer(latest_evals, many=True).data


class ModelVersionSerializer(serializers.ModelSerializer):
    """Serializer for model versions."""
    
    promoted_by_email = serializers.CharField(source='promoted_by.email', read_only=True)
    
    class Meta:
        model = ModelVersion
        fields = ('id', 'model', 'version', 'changelog', 'file_hash', 'file_size',
                 'file_path', 'performance_comparison', 'is_promoted', 'promoted_by',
                 'promoted_by_email', 'promoted_at', 'created_at')
        read_only_fields = ('id', 'file_hash', 'file_size', 'promoted_by', 'promoted_at', 'created_at')


class ModelEndpointSerializer(serializers.ModelSerializer):
    """Serializer for model endpoints."""
    
    class Meta:
        model = ModelEndpoint
        fields = ('id', 'model', 'name', 'url', 'method', 'auth_type', 'auth_credentials',
                 'request_format', 'response_format', 'health_check_url', 'health_check_interval',
                 'is_healthy', 'last_health_check', 'rate_limit', 'is_active',
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'is_healthy', 'last_health_check', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        """Create endpoint and perform initial health check."""
        endpoint = super().create(validated_data)
        # TODO: Perform initial health check
        return endpoint


class ModelTagSerializer(serializers.ModelSerializer):
    """Serializer for model tags."""
    
    model_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ModelTag
        fields = ('id', 'name', 'description', 'color', 'model_count', 'created_at')
        read_only_fields = ('id', 'model_count', 'created_at')
    
    def get_model_count(self, obj):
        """Get number of models with this tag."""
        return Model.objects.filter(tags__contains=[obj.name]).count()


class ModelDocumentationSerializer(serializers.ModelSerializer):
    """Serializer for model documentation."""
    
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = ModelDocumentation
        fields = ('id', 'model', 'title', 'document_type', 'content', 'file',
                 'file_size', 'created_by', 'created_by_email', 'created_at', 'updated_at')
        read_only_fields = ('id', 'file_size', 'created_by', 'created_at', 'updated_at')
    
    def get_file_size(self, obj):
        """Get file size in human-readable format."""
        if obj.file:
            size = obj.file.size
            for unit in ['B', 'KB', 'MB', 'GB']:
                if size < 1024:
                    return f"{size:.1f} {unit}"
                size /= 1024
            return f"{size:.1f} TB"
        return None


class ModelListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for model lists."""
    
    project_name = serializers.CharField(source='project.name', read_only=True)
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    prediction_count = serializers.ReadOnlyField()
    latest_trust_score = serializers.SerializerMethodField()
    
    class Meta:
        model = Model
        fields = ('id', 'name', 'version', 'display_name', 'model_type', 'environment',
                 'project_name', 'owner_email', 'is_active', 'is_deployed',
                 'prediction_count', 'latest_trust_score', 'created_at')
    
    def get_latest_trust_score(self, obj):
        """Get latest trust score for the model."""
        from apps.evaluations.models import TrustScore
        latest_score = TrustScore.objects.filter(model=obj).order_by('-created_at').first()
        return latest_score.score if latest_score else None


class ModelPromotionSerializer(serializers.Serializer):
    """Serializer for promoting model versions."""
    
    version = serializers.CharField(max_length=50)
    changelog = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    
    def validate_version(self, value):
        """Validate version exists."""
        model_id = self.context['model_id']
        if not ModelVersion.objects.filter(model_id=model_id, version=value).exists():
            raise serializers.ValidationError("Model version does not exist")
        return value


class ModelDeploymentSerializer(serializers.Serializer):
    """Serializer for deploying models."""
    
    environment = serializers.ChoiceField(choices=Model.ENVIRONMENTS)
    endpoint_url = serializers.URLField(required=False)
    health_check_url = serializers.URLField(required=False)
    
    def validate_environment(self, value):
        """Validate deployment environment."""
        model = self.context['model']
        if value == 'production' and model.environment != 'staging':
            raise serializers.ValidationError(
                "Models must be in staging environment before deploying to production"
            )
        return value
