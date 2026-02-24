from django.contrib import admin
from .models import Project, ProjectMember, ProjectAPIKey, ProjectConfiguration


class ProjectMemberInline(admin.TabularInline):
    model = ProjectMember
    extra = 0
    readonly_fields = ('joined_at', 'updated_at')


class ProjectAPIKeyInline(admin.TabularInline):
    model = ProjectAPIKey
    extra = 0
    readonly_fields = ('key', 'created_at', 'updated_at', 'last_used_at')


class ProjectConfigurationInline(admin.TabularInline):
    model = ProjectConfiguration
    extra = 0
    readonly_fields = ('version', 'created_at')


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'is_active', 'member_count', 'created_at')
    list_filter = ('is_active', 'created_at', 'organization')
    search_fields = ('name', 'slug', 'description', 'organization__name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProjectMemberInline, ProjectAPIKeyInline, ProjectConfigurationInline]
    
    def member_count(self, obj):
        return obj.member_count
    member_count.short_description = 'Members'


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'project', 'role', 'joined_at')
    list_filter = ('role', 'joined_at', 'project__organization')
    search_fields = ('user__email', 'project__name', 'role')
    readonly_fields = ('joined_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'project', 'added_by')


@admin.register(ProjectAPIKey)
class ProjectAPIKeyAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'is_active', 'rate_limit', 'last_used_at', 'created_at')
    list_filter = ('is_active', 'created_at', 'project')
    search_fields = ('name', 'project__name', 'key')
    readonly_fields = ('id', 'key', 'created_at', 'updated_at', 'last_used_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('project')


@admin.register(ProjectConfiguration)
class ProjectConfigurationAdmin(admin.ModelAdmin):
    list_display = ('project', 'version', 'name', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at', 'project')
    search_fields = ('project__name', 'name', 'description')
    readonly_fields = ('id', 'version', 'created_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('project', 'created_by')
