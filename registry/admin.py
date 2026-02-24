from django.contrib import admin
from .models import Model, ModelVersion, ModelEndpoint, ModelTag, ModelDocumentation


class ModelVersionInline(admin.TabularInline):
    model = ModelVersion
    extra = 0
    readonly_fields = ('created_at',)


class ModelEndpointInline(admin.TabularInline):
    model = ModelEndpoint
    extra = 0
    readonly_fields = ('created_at', 'updated_at', 'last_health_check')


class ModelDocumentationInline(admin.TabularInline):
    model = ModelDocumentation
    extra = 0
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Model)
class ModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'version', 'project', 'model_type', 'environment', 'owner', 'is_active', 'is_deployed', 'created_at')
    list_filter = ('model_type', 'environment', 'is_active', 'is_deployed', 'created_at', 'project')
    search_fields = ('name', 'version', 'display_name', 'description', 'project__name', 'owner__email')
    readonly_fields = ('id', 'created_at', 'updated_at', 'deployed_at')
    inlines = [ModelVersionInline, ModelEndpointInline, ModelDocumentationInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('project', 'owner')


@admin.register(ModelVersion)
class ModelVersionAdmin(admin.ModelAdmin):
    list_display = ('model', 'version', 'is_promoted', 'promoted_by', 'promoted_at', 'created_at')
    list_filter = ('is_promoted', 'created_at', 'model__project')
    search_fields = ('model__name', 'version', 'changelog')
    readonly_fields = ('id', 'created_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('model', 'promoted_by')


@admin.register(ModelEndpoint)
class ModelEndpointAdmin(admin.ModelAdmin):
    list_display = ('name', 'model', 'url', 'method', 'is_healthy', 'is_active', 'created_at')
    list_filter = ('is_healthy', 'is_active', 'method', 'auth_type', 'created_at')
    search_fields = ('name', 'model__name', 'url')
    readonly_fields = ('id', 'created_at', 'updated_at', 'last_health_check')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('model')


@admin.register(ModelTag)
class ModelTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'color', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('id', 'created_at')


@admin.register(ModelDocumentation)
class ModelDocumentationAdmin(admin.ModelAdmin):
    list_display = ('title', 'model', 'document_type', 'created_by', 'created_at')
    list_filter = ('document_type', 'created_at', 'model__project')
    search_fields = ('title', 'model__name', 'content')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('model', 'created_by')
