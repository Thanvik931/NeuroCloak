from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/ingest/(?P<project_id>[^/]+)/(?P<model_id>[^/]+)/$', consumers.PredictionConsumer.as_asgi()),
]
