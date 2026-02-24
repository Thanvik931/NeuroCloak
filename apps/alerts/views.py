import uuid
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from drf_spectacular.utils import extend_schema

from .models import (
    Alert, AlertRuleConfig, AlertNotification, AlertDashboard, AlertStatistics
)
from .serializers import (
    AlertSerializer, AlertActionSerializer, AlertRuleConfigSerializer,
    AlertNotificationSerializer, AlertDashboardSerializer, AlertStatisticsSerializer,
    AlertQuerySerializer, AlertSummarySerializer, AlertTrendSerializer
)
from apps.registry.models import Model
from apps.projects.permissions import IsProjectMember, IsProjectAdmin
from .tasks import (
    process_alert_rules, send_alert_notification, check_alert_escalations,
    calculate_alert_statistics
)


class AlertListView(APIView):
    """List and manage alerts."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="List alerts",
        description="Get list of alerts for a project or model"
    )
    def get(self, request, project_id, model_id=None):
        """List alerts."""
        # Validate access
        if model_id:
            model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        # Parse query parameters
        serializer = AlertQuerySerializer(data=request.query_params)
        if serializer.is_valid():
            filters = serializer.validated_data
            
            # Build query
            query_filter = {
                'project_id': project_id,
                'model_id': model_id or None
            }
            
            if filters.get('alert_type'):
                query_filter['alert_type'] = filters['alert_type']
            
            if filters.get('severity'):
                query_filter['severity'] = filters['severity']
            
            if filters.get('status'):
                query_filter['status'] = filters['status']
            
            if filters.get('acknowledged_by'):
                query_filter['acknowledged_by'] = filters['acknowledged_by']
            
            if filters.get('resolved_by'):
                query_filter['resolved_by'] = filters['resolved_by']
            
            if filters.get('tags'):
                query_filter['tags__all'] = filters['tags']
            
            if filters.get('start_date'):
                query_filter['created_at__gte'] = filters['start_date']
            
            if filters.get('end_date'):
                query_filter['created_at__lte'] = filters['end_date']
            
            # Execute query
            alerts = Alert.objects(**query_filter).order_by('-created_at')
            
            # Apply pagination
            limit = filters.get('limit', 20)
            offset = filters.get('offset', 0)
            
            total = alerts.count()
            alerts = alerts.skip(offset).limit(limit)
            
            # Convert to list and serialize
            alerts_data = []
            for alert in alerts:
                alert_dict = alert.to_mongo().to_dict()
                alert_dict['id'] = alert_dict.pop('_id')
                alerts_data.append(alert_dict)
            
            return Response({
                'alerts': alerts_data,
                'total': total,
                'limit': limit,
                'offset': offset
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        summary="Create alert",
        description="Create a new alert (usually triggered by system)"
    )
    def post(self, request, project_id, model_id=None):
        """Create alert."""
        # Validate access
        if model_id:
            model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        serializer = AlertSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Create alert
            alert = Alert(
                project_id=project_id,
                model_id=model_id,
                alert_id=str(uuid.uuid4()),
                title=data['title'],
                description=data['description'],
                alert_type=data['alert_type'],
                severity=data['severity'],
                metric_value=data.get('metric_value'),
                threshold=data.get('threshold'),
                rule_name=data.get('rule_name'),
                context=data.get('context', {}),
                details=data.get('details', {}),
                affected_entities=data.get('affected_entities', []),
                source=data.get('source'),
                tags=data.get('tags', [])
            )
            alert.save()
            
            # Trigger notification processing
            from .tasks import process_alert_notifications
            process_alert_notifications.delay(str(alert.id))
            
            return Response(
                AlertSerializer(alert).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AlertDetailView(APIView):
    """View and manage individual alerts."""
    
    permission_classes = [IsProjectMember]
    
    def get_alert(self, project_id, alert_id):
        """Get alert by ID."""
        return get_object_or_404(Alert, project_id=project_id, alert_id=alert_id)
    
    @extend_schema(
        summary="Get alert details",
        description="Get detailed information about a specific alert"
    )
    def get(self, request, project_id, alert_id):
        """Get alert details."""
        alert = self.get_alert(project_id, alert_id)
        serializer = AlertSerializer(alert)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Update alert",
        description="Update alert information"
    )
    def patch(self, request, project_id, alert_id):
        """Update alert."""
        alert = self.get_alert(project_id, alert_id)
        
        # Only allow updating certain fields
        allowed_fields = ['title', 'description', 'context', 'details', 'tags']
        for field in allowed_fields:
            if field in request.data:
                setattr(alert, field, request.data[field])
        
        alert.save()
        serializer = AlertSerializer(alert)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Delete alert",
        description="Delete an alert"
    )
    def delete(self, request, project_id, alert_id):
        """Delete alert."""
        alert = self.get_alert(project_id, alert_id)
        alert.delete()
        return Response(
            {'message': 'Alert deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )


class AlertActionView(APIView):
    """Perform actions on alerts (acknowledge, resolve, suppress)."""
    
    permission_classes = [IsProjectMember]
    
    def get_alert(self, project_id, alert_id):
        """Get alert by ID."""
        return get_object_or_404(Alert, project_id=project_id, alert_id=alert_id)
    
    @extend_schema(
        summary="Perform alert action",
        description="Acknowledge, resolve, or suppress an alert"
    )
    def post(self, request, project_id, alert_id):
        """Perform alert action."""
        alert = self.get_alert(project_id, alert_id)
        
        serializer = AlertActionSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            action = data['action']
            notes = data.get('notes')
            user_id = str(request.user.id)
            
            if action == 'acknowledge':
                alert.acknowledge(user_id, notes)
                message = 'Alert acknowledged'
            elif action == 'resolve':
                alert.resolve(user_id, notes)
                message = 'Alert resolved'
            elif action == 'suppress':
                suppression_until = None
                if data.get('suppression_minutes'):
                    suppression_until = datetime.utcnow() + timedelta(minutes=data['suppression_minutes'])
                alert.suppress(suppression_until, data.get('suppression_reason'))
                message = 'Alert suppressed'
            else:
                return Response(
                    {'error': 'Invalid action'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response({
                'message': message,
                'alert': AlertSerializer(alert).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AlertRuleConfigListView(APIView):
    """List and create alert rule configurations."""
    
    permission_classes = [IsProjectAdmin]
    
    @extend_schema(
        summary="List alert rules",
        description="Get alert rule configurations for a project or model"
    )
    def get(self, request, project_id, model_id=None):
        """List alert rules."""
        # Validate access
        if model_id:
            model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        # Get rules
        rules = AlertRuleConfig.objects(
            project_id=project_id,
            model_id=model_id or None
        ).order_by('-created_at')
        
        # Convert to list
        rules_data = []
        for rule in rules:
            rule_dict = rule.to_mongo().to_dict()
            rule_dict['id'] = rule_dict.pop('_id')
            rules_data.append(rule_dict)
        
        return Response({'rules': rules_data})
    
    @extend_schema(
        summary="Create alert rule",
        description="Create a new alert rule configuration"
    )
    def post(self, request, project_id, model_id=None):
        """Create alert rule."""
        # Validate access
        if model_id:
            model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        serializer = AlertRuleConfigSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Create rule
            rule = AlertRuleConfig(
                project_id=project_id,
                model_id=model_id,
                name=data['name'],
                description=data.get('description'),
                alert_type=data['alert_type'],
                rules=data['rules'],
                channels=data.get('channels', []),
                is_active=data.get('is_active', True),
                evaluation_frequency=data.get('evaluation_frequency', '*/5 * * * *'),
                cooldown_minutes=data.get('cooldown_minutes', 60),
                auto_resolve_minutes=data.get('auto_resolve_minutes'),
                conditions=data.get('conditions', {}),
                created_by=str(request.user.id)
            )
            rule.save()
            
            return Response(
                AlertRuleConfigSerializer(rule).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AlertRuleConfigDetailView(APIView):
    """View and manage alert rule configurations."""
    
    permission_classes = [IsProjectAdmin]
    
    def get_rule(self, project_id, rule_id):
        """Get rule by ID."""
        return get_object_or_404(AlertRuleConfig, project_id=project_id, id=rule_id)
    
    @extend_schema(
        summary="Get alert rule details",
        description="Get detailed information about an alert rule"
    )
    def get(self, request, project_id, rule_id):
        """Get rule details."""
        rule = self.get_rule(project_id, rule_id)
        serializer = AlertRuleConfigSerializer(rule)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Update alert rule",
        description="Update alert rule configuration"
    )
    def patch(self, request, project_id, rule_id):
        """Update rule."""
        rule = self.get_rule(project_id, rule_id)
        
        # Update allowed fields
        allowed_fields = ['name', 'description', 'rules', 'channels', 'is_active', 
                        'evaluation_frequency', 'cooldown_minutes', 'auto_resolve_minutes', 'conditions']
        for field in allowed_fields:
            if field in request.data:
                setattr(rule, field, request.data[field])
        
        rule.save()
        serializer = AlertRuleConfigSerializer(rule)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Delete alert rule",
        description="Delete an alert rule"
    )
    def delete(self, request, project_id, rule_id):
        """Delete rule."""
        rule = self.get_rule(project_id, rule_id)
        rule.delete()
        return Response(
            {'message': 'Alert rule deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )


class AlertNotificationView(APIView):
    """View alert notifications."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="List alert notifications",
        description="Get notifications for a specific alert"
    )
    def get(self, request, project_id, alert_id):
        """Get alert notifications."""
        # Validate alert exists
        alert = get_object_or_404(Alert, project_id=project_id, alert_id=alert_id)
        
        # Get notifications
        notifications = AlertNotification.objects(
            alert_id=alert_id
        ).order_by('-created_at')
        
        # Convert to list
        notifications_data = []
        for notification in notifications:
            notif_dict = notification.to_mongo().to_dict()
            notif_dict['id'] = notif_dict.pop('_id')
            notifications_data.append(notif_dict)
        
        return Response({'notifications': notifications_data})


class AlertSummaryView(APIView):
    """Get alert summary for a project or model."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="Get alert summary",
        description="Get comprehensive alert summary for a project or model"
    )
    def get(self, request, project_id, model_id=None):
        """Get alert summary."""
        # Validate access
        if model_id:
            model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        # Get alert counts
        total_alerts = Alert.objects(
            project_id=project_id,
            model_id=model_id or None
        ).count()
        
        active_alerts = Alert.objects(
            project_id=project_id,
            model_id=model_id or None,
            status='active',
            is_suppressed=False
        ).count()
        
        # Count by severity
        critical_alerts = Alert.objects(
            project_id=project_id,
            model_id=model_id or None,
            severity='critical',
            status='active',
            is_suppressed=False
        ).count()
        
        high_alerts = Alert.objects(
            project_id=project_id,
            model_id=model_id or None,
            severity='high',
            status='active',
            is_suppressed=False
        ).count()
        
        medium_alerts = Alert.objects(
            project_id=project_id,
            model_id=model_id or None,
            severity='medium',
            status='active',
            is_suppressed=False
        ).count()
        
        low_alerts = Alert.objects(
            project_id=project_id,
            model_id=model_id or None,
            severity='low',
            status='active',
            is_suppressed=False
        ).count()
        
        # Count by type
        alerts_by_type = {}
        alert_types = ['trust_score', 'fairness', 'drift', 'robustness', 'explainability',
                      'data_quality', 'model_performance', 'system_health', 'custom']
        
        for alert_type in alert_types:
            count = Alert.objects(
                project_id=project_id,
                model_id=model_id or None,
                alert_type=alert_type,
                status='active',
                is_suppressed=False
            ).count()
            alerts_by_type[alert_type] = count
        
        # Get recent alerts
        recent_alerts = Alert.objects(
            project_id=project_id,
            model_id=model_id or None
        ).order_by('-created_at').limit(10)
        
        recent_alerts_data = []
        for alert in recent_alerts:
            alert_dict = alert.to_mongo().to_dict()
            alert_dict['id'] = alert_dict.pop('_id')
            recent_alerts_data.append(alert_dict)
        
        # Calculate resolution metrics
        resolved_alerts = Alert.objects(
            project_id=project_id,
            model_id=model_id or None,
            status='resolved'
        )
        
        resolution_rate = 0
        avg_resolution_time = 0
        
        if total_alerts > 0:
            resolution_rate = resolved_alerts.count() / total_alerts
            
            # Calculate average resolution time
            resolution_times = []
            for alert in resolved_alerts:
                if alert.created_at and alert.resolved_at:
                    resolution_time = (alert.resolved_at - alert.created_at).total_seconds() / 60
                    resolution_times.append(resolution_time)
            
            if resolution_times:
                avg_resolution_time = sum(resolution_times) / len(resolution_times)
        
        # Build summary
        summary = {
            'total_alerts': total_alerts,
            'active_alerts': active_alerts,
            'critical_alerts': critical_alerts,
            'high_alerts': high_alerts,
            'medium_alerts': medium_alerts,
            'low_alerts': low_alerts,
            'alerts_by_type': alerts_by_type,
            'recent_alerts': recent_alerts_data,
            'avg_resolution_time_minutes': avg_resolution_time,
            'resolution_rate': resolution_rate,
            'top_alert_sources': []  # TODO: Implement top sources analysis
        }
        
        serializer = AlertSummarySerializer(summary)
        return Response(serializer.data)


class AlertTrendView(APIView):
    """Get alert trends over time."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="Get alert trends",
        description="Get alert trends over time for analysis"
    )
    def get(self, request, project_id, model_id=None):
        """Get alert trends."""
        # Validate access
        if model_id:
            model = get_object_or_404(Model, id=model_id, project_id=project_id)
        
        # Get date range from query params
        days = int(request.query_params.get('days', 30))
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get daily alert counts
        daily_alerts = {}
        
        for i in range(days):
            date = (start_date + timedelta(days=i)).date()
            date_start = datetime.combine(date, datetime.min.time())
            date_end = datetime.combine(date, datetime.max.time())
            
            # Get alerts for this day
            total_count = Alert.objects(
                project_id=project_id,
                model_id=model_id or None,
                created_at__gte=date_start,
                created_at__lte=date_end
            ).count()
            
            active_count = Alert.objects(
                project_id=project_id,
                model_id=model_id or None,
                created_at__gte=date_start,
                created_at__lte=date_end,
                status='active',
                is_suppressed=False
            ).count()
            
            resolved_count = Alert.objects(
                project_id=project_id,
                model_id=model_id or None,
                resolved_at__gte=date_start,
                resolved_at__lte=date_end,
                status='resolved'
            ).count()
            
            # Count by severity
            alerts_by_severity = {}
            for severity in ['low', 'medium', 'high', 'critical']:
                count = Alert.objects(
                    project_id=project_id,
                    model_id=model_id or None,
                    created_at__gte=date_start,
                    created_at__lte=date_end,
                    severity=severity
                ).count()
                alerts_by_severity[severity] = count
            
            # Count by type
            alerts_by_type = {}
            alert_types = ['trust_score', 'fairness', 'drift', 'robustness', 'explainability']
            for alert_type in alert_types:
                count = Alert.objects(
                    project_id=project_id,
                    model_id=model_id or None,
                    created_at__gte=date_start,
                    created_at__lte=date_end,
                    alert_type=alert_type
                ).count()
                alerts_by_type[alert_type] = count
            
            daily_alerts[date.isoformat()] = {
                'total_alerts': total_count,
                'active_alerts': active_count,
                'resolved_alerts': resolved_count,
                'alerts_by_severity': alerts_by_severity,
                'alerts_by_type': alerts_by_type
            }
        
        # Convert to list format
        trend_data = []
        for date_str, data in daily_alerts.items():
            trend_item = {
                'date': date_str,
                **data
            }
            trend_data.append(trend_item)
        
        serializer = AlertTrendSerializer(trend_data, many=True)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsProjectAdmin])
@extend_schema(
    summary="Trigger alert rule processing",
    description="Manually trigger alert rule processing"
)
def trigger_alert_processing(request, project_id, model_id=None):
    """Trigger alert rule processing."""
    # Validate access
    if model_id:
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
    
    # Trigger alert processing
    process_alert_rules.delay(project_id, model_id)
    
    return Response({
        'message': 'Alert rule processing triggered',
        'project_id': project_id,
        'model_id': model_id
    }, status=status.HTTP_202_ACCEPTED)


@api_view(['POST'])
@permission_classes([IsProjectAdmin])
@extend_schema(
    summary="Trigger alert statistics calculation",
    description="Manually trigger alert statistics calculation"
)
def trigger_alert_statistics(request, project_id, model_id=None):
    """Trigger alert statistics calculation."""
    # Validate access
    if model_id:
        model = get_object_or_404(Model, id=model_id, project_id=project_id)
    
    # Trigger statistics calculation
    calculate_alert_statistics.delay(project_id, model_id)
    
    return Response({
        'message': 'Alert statistics calculation triggered',
        'project_id': project_id,
        'model_id': model_id
    }, status=status.HTTP_202_ACCEPTED)
