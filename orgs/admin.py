from django.contrib import admin
from .models import Organization, OrganizationMember, OrganizationInvitation


class OrganizationMemberInline(admin.TabularInline):
    model = OrganizationMember
    extra = 0
    readonly_fields = ('joined_at', 'updated_at')


class OrganizationInvitationInline(admin.TabularInline):
    model = OrganizationInvitation
    extra = 0
    readonly_fields = ('token', 'created_at', 'expires_at')


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'member_count', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'slug', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [OrganizationMemberInline, OrganizationInvitationInline]
    
    def member_count(self, obj):
        return obj.member_count
    member_count.short_description = 'Members'


@admin.register(OrganizationMember)
class OrganizationMemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'organization', 'role', 'joined_at')
    list_filter = ('role', 'joined_at', 'organization')
    search_fields = ('user__email', 'organization__name', 'role')
    readonly_fields = ('joined_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'organization')


@admin.register(OrganizationInvitation)
class OrganizationInvitationAdmin(admin.ModelAdmin):
    list_display = ('email', 'organization', 'role', 'invited_by', 'is_accepted', 'is_expired', 'created_at')
    list_filter = ('role', 'is_accepted', 'is_expired', 'created_at')
    search_fields = ('email', 'organization__name', 'invited_by__email')
    readonly_fields = ('id', 'token', 'created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('organization', 'invited_by')
