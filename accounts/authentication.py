from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import APIKey

User = get_user_model()


class APIKeyAuthentication(BaseAuthentication):
    """
    Custom authentication using API keys.
    """
    
    def authenticate(self, request):
        api_key = request.META.get('HTTP_X_API_KEY')
        if not api_key:
            return None
        
        try:
            key_obj = APIKey.objects.get(key=api_key, is_active=True)
            if not key_obj.is_valid():
                raise AuthenticationFailed('API key has expired')
            
            # Update last used timestamp
            key_obj.update_last_used()
            
            return (key_obj.user, key_obj)
        except APIKey.DoesNotExist:
            raise AuthenticationFailed('Invalid API key')
    
    def authenticate_header(self, request):
        return 'API-Key'
