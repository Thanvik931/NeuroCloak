import json
import asyncio
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist

from .models import Prediction
from apps.registry.models import Model
from apps.projects.models import Project


class PredictionConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time prediction ingestion."""
    
    async def connect(self):
        """Handle WebSocket connection."""
        self.project_id = self.scope['url_route']['kwargs']['project_id']
        self.model_id = self.scope['url_route']['kwargs']['model_id']
        self.room_group_name = f'predictions_{self.project_id}_{self.model_id}'
        
        # Validate project and model access
        if not await self.validate_access():
            await self.close(code=4003)
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send welcome message
        await self.send(text_data=json.dumps({
            'type': 'connection',
            'message': 'Connected to prediction stream',
            'project_id': self.project_id,
            'model_id': self.model_id,
            'timestamp': datetime.utcnow().isoformat()
        }))
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'prediction':
                await self.handle_prediction(data)
            elif message_type == 'batch':
                await self.handle_batch(data)
            elif message_type == 'ping':
                await self.handle_ping()
            else:
                await self.send_error(f'Unknown message type: {message_type}')
                
        except json.JSONDecodeError:
            await self.send_error('Invalid JSON format')
        except Exception as e:
            await self.send_error(f'Error processing message: {str(e)}')
    
    async def handle_prediction(self, data):
        """Handle single prediction submission."""
        try:
            # Validate required fields
            required_fields = ['prediction_id', 'features', 'prediction']
            for field in required_fields:
                if field not in data:
                    await self.send_error(f'Missing required field: {field}')
                    return
            
            # Create prediction record
            prediction = await self.create_prediction(data)
            
            # Send confirmation
            await self.send(text_data=json.dumps({
                'type': 'prediction_ack',
                'prediction_id': prediction.id,
                'status': 'success',
                'timestamp': datetime.utcnow().isoformat()
            }))
            
            # Trigger async processing
            from .tasks import process_single_prediction
            process_single_prediction.delay(str(prediction.id))
            
        except Exception as e:
            await self.send_error(f'Error processing prediction: {str(e)}')
    
    async def handle_batch(self, data):
        """Handle batch prediction submission."""
        try:
            predictions = data.get('predictions', [])
            if not predictions:
                await self.send_error('No predictions provided in batch')
                return
            
            batch_id = data.get('batch_id', f'ws_batch_{datetime.utcnow().timestamp()}')
            
            # Process batch asynchronously
            from .tasks import process_batch_predictions
            process_batch_predictions.delay(
                batch_id=batch_id,
                predictions=predictions,
                project_id=self.project_id,
                model_id=self.model_id
            )
            
            # Send batch acknowledgment
            await self.send(text_data=json.dumps({
                'type': 'batch_ack',
                'batch_id': batch_id,
                'total_predictions': len(predictions),
                'status': 'queued',
                'timestamp': datetime.utcnow().isoformat()
            }))
            
        except Exception as e:
            await self.send_error(f'Error processing batch: {str(e)}')
    
    async def handle_ping(self):
        """Handle ping message for connection health check."""
        await self.send(text_data=json.dumps({
            'type': 'pong',
            'timestamp': datetime.utcnow().isoformat()
        }))
    
    async def send_error(self, error_message):
        """Send error message to client."""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'error': error_message,
            'timestamp': datetime.utcnow().isoformat()
        }))
    
    @database_sync_to_async
    def validate_access(self):
        """Validate user has access to the project and model."""
        try:
            user = self.scope['user']
            if not user.is_authenticated:
                return False
            
            # Check project access
            project = Project.objects.get(id=self.project_id)
            if not project.is_member(user):
                return False
            
            # Check model exists in project
            Model.objects.get(id=self.model_id, project_id=self.project_id)
            return True
            
        except ObjectDoesNotExist:
            return False
    
    @database_sync_to_async
    def create_prediction(self, data):
        """Create prediction record in database."""
        prediction = Prediction(
            project_id=self.project_id,
            model_id=self.model_id,
            prediction_id=data['prediction_id'],
            timestamp=datetime.utcnow(),
            features=data['features'],
            prediction=data['prediction'],
            confidence=data.get('confidence'),
            prediction_proba=data.get('prediction_proba'),
            true_label=data.get('true_label'),
            true_label_timestamp=data.get('true_label_timestamp'),
            request_id=data.get('request_id'),
            user_id=data.get('user_id'),
            session_id=data.get('session_id'),
            context=data.get('context', {})
        )
        prediction.save()
        return prediction


class MetricsConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time metrics updates."""
    
    async def connect(self):
        """Handle WebSocket connection for metrics."""
        self.project_id = self.scope['url_route']['kwargs']['project_id']
        self.model_id = self.scope['url_route']['kwargs'].get('model_id')
        
        # Validate access
        if not await self.validate_access():
            await self.close(code=4003)
            return
        
        # Set room group name
        if self.model_id:
            self.room_group_name = f'metrics_{self.project_id}_{self.model_id}'
        else:
            self.room_group_name = f'metrics_{self.project_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send initial metrics
        await self.send_initial_metrics()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Handle incoming messages."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'subscribe':
                await self.handle_subscribe(data)
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': datetime.utcnow().isoformat()
                }))
            else:
                await self.send_error(f'Unknown message type: {message_type}')
                
        except Exception as e:
            await self.send_error(f'Error processing message: {str(e)}')
    
    async def handle_subscribe(self, data):
        """Handle subscription to specific metrics."""
        # Implementation for metric subscriptions
        await self.send(text_data=json.dumps({
            'type': 'subscription_ack',
            'subscribed': True,
            'timestamp': datetime.utcnow().isoformat()
        }))
    
    async def send_initial_metrics(self):
        """Send initial metrics data."""
        try:
            # Get recent metrics
            from .models import IngestionMetrics
            from datetime import timedelta
            
            now = datetime.utcnow()
            hour_ago = now - timedelta(hours=1)
            
            metrics = IngestionMetrics.objects(
                project_id=self.project_id,
                model_id=self.model_id if self.model_id else None,
                timestamp__gte=hour_ago
            ).order_by('-timestamp').first()
            
            if metrics:
                await self.send(text_data=json.dumps({
                    'type': 'metrics_update',
                    'data': {
                        'total_predictions': metrics.total_predictions,
                        'anomaly_count': metrics.anomaly_count,
                        'avg_processing_time_ms': metrics.avg_processing_time_ms,
                        'error_rate': metrics.error_rate
                    },
                    'timestamp': now.isoformat()
                }))
            
        except Exception as e:
            await self.send_error(f'Error sending initial metrics: {str(e)}')
    
    async def send_error(self, error_message):
        """Send error message to client."""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'error': error_message,
            'timestamp': datetime.utcnow().isoformat()
        }))
    
    @database_sync_to_async
    def validate_access(self):
        """Validate user has access to the project."""
        try:
            user = self.scope['user']
            if not user.is_authenticated:
                return False
            
            project = Project.objects.get(id=self.project_id)
            return project.is_member(user)
            
        except ObjectDoesNotExist:
            return False
