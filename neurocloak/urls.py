from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/orgs/', include('apps.orgs.urls')),
    path('api/v1/projects/', include('apps.projects.urls')),
    path('api/v1/registry/', include('apps.registry.urls')),
    path('api/v1/ingest/', include('apps.ingestion.urls')),
    path('api/v1/evaluations/', include('apps.evaluations.urls')),
    path('api/v1/alerts/', include('apps.alerts.urls')),
    path('api/v1/audit/', include('apps.audit.urls')),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
