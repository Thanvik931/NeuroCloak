from django.contrib.auth import login, logout
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from .models import User, UserProfile, APIKey
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    UserProfileSerializer, APIKeySerializer, PasswordChangeSerializer
)
from .permissions import IsOwnerOrReadOnly


class RegisterView(APIView):
    """User registration endpoint."""
    
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        summary="Register a new user",
        description="Create a new user account with email and password",
        responses={201: UserSerializer}
    )
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT token view with additional user data."""
    
    serializer_class = UserLoginSerializer
    
    @extend_schema(
        summary="Obtain JWT token",
        description="Authenticate user and return JWT tokens"
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        # Update last login IP
        user.last_login_ip = request.META.get('REMOTE_ADDR')
        user.save(update_fields=['last_login_ip'])
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class LogoutView(APIView):
    """Logout endpoint to blacklist refresh token."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Logout user",
        description="Blacklist the refresh token to logout user"
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(RetrieveUpdateAPIView):
    """Get or update user profile."""
    
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class APIKeyListCreateView(APIView):
    """List and create API keys for the authenticated user."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="List API keys",
        description="Get all API keys belonging to the authenticated user"
    )
    def get(self, request):
        api_keys = APIKey.objects.filter(user=request.user, is_active=True)
        serializer = APIKeySerializer(api_keys, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Create API key",
        description="Create a new API key for programmatic access",
        responses={201: APIKeySerializer}
    )
    def post(self, request):
        serializer = APIKeySerializer(data=request.data)
        if serializer.is_valid():
            api_key = serializer.save(user=request.user)
            return Response(APIKeySerializer(api_key).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class APIKeyDetailView(APIView):
    """Retrieve, update, or delete an API key."""
    
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_object(self, pk):
        try:
            return APIKey.objects.get(pk=pk, user=self.request.user)
        except APIKey.DoesNotExist:
            return None
    
    @extend_schema(
        summary="Get API key",
        description="Retrieve details of a specific API key"
    )
    def get(self, request, pk):
        api_key = self.get_object(pk)
        if not api_key:
            return Response({'error': 'API key not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = APIKeySerializer(api_key)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Update API key",
        description="Update API key name or status"
    )
    def patch(self, request, pk):
        api_key = self.get_object(pk)
        if not api_key:
            return Response({'error': 'API key not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Only allow updating name and is_active fields
        allowed_fields = ['name', 'is_active']
        for field in allowed_fields:
            if field in request.data:
                setattr(api_key, field, request.data[field])
        
        api_key.save()
        serializer = APIKeySerializer(api_key)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Delete API key",
        description="Delete an API key"
    )
    def delete(self, request, pk):
        api_key = self.get_object(pk)
        if not api_key:
            return Response({'error': 'API key not found'}, status=status.HTTP_404_NOT_FOUND)
        
        api_key.delete()
        return Response({'message': 'API key deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


class PasswordChangeView(APIView):
    """Change user password."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Change password",
        description="Change the authenticated user's password"
    )
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@extend_schema(
    summary="Get current user",
    description="Get information about the currently authenticated user"
)
def current_user(request):
    """Get current user information."""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
