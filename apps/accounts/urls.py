from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, CustomTokenObtainPairView, LogoutView, UserProfileView,
    APIKeyListCreateView, APIKeyDetailView, PasswordChangeView, current_user
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', current_user, name='current_user'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('password/change/', PasswordChangeView.as_view(), name='password_change'),
    path('api-keys/', APIKeyListCreateView.as_view(), name='api_key_list_create'),
    path('api-keys/<uuid:pk>/', APIKeyDetailView.as_view(), name='api_key_detail'),
]
