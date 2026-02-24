import uuid
import hashlib
import json
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView
from drf_spectacular.utils import extend_schema

from .models import (
    AuditLog, ComplianceReport, DataAccessLog, SecurityEvent, RetentionPolicy
)
from .serializers import (
    AuditLogSerializer, ComplianceReportSerializer, ComplianceReportRequestSerializer,
    DataAccessLogSerializer, SecurityEventSerializer, RetentionPolicySerializer,
    AuditQuerySerializer, AuditSummarySerializer, DataAccessSummarySerializer
)
from apps.registry.models import Model
from apps.projects.permissions import IsProjectMember, IsProjectAdmin
from .tasks import (
    generate_compliance_report, apply_retention_policies,
    calculate_audit_statistics, cleanup_old_audit_logs
)


class AuditLogListView(APIView):
    """List and query audit logs."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="List audit logs",
        description="Get audit logs for a project or system-wide"
    )
    def get(self, request, project_id=None):
        """List audit logs."""
        # Parse query parameters
        serializer = AuditQuerySerializer(data=request.query_params)
        if serializer.is_valid():
            filters = serializer.validated_data
            
            # Build query
            query_filter = {}
            
            if project_id:
                query_filter['project_id'] = project_id
            
            if filters.get('action'):
                query_filter['action'] = filters['action']
            
            if filters.get('resource_type'):
                query_filter['resource_type'] = filters['resource_type']
            
            if filters.get('user_id'):
                query_filter['user_id'] = filters['user_id']
            
            if filters.get('compliance_category'):
                query_filter['compliance_category'] = filters['compliance_category']
            
            if filters.get('risk_level'):
                query_filter['risk_level'] = filters['risk_level']
            
            if filters.get('success') is not None:
                query_filter['success'] = filters['success']
            
            if filters.get('ip_address'):
                query_filter['ip_address'] = filters['ip_address']
            
            if filters.get('tags'):
                query_filter['tags__all'] = filters['tags']
            
            if filters.get('start_date'):
                query_filter['timestamp__gte'] = filters['start_date']
            
            if filters.get('end_date'):
                query_filter['timestamp__lte'] = filters['end_date']
            
            # Execute query
            logs = AuditLog.objects(**query_filter).order_by('-timestamp')
            
            # Apply pagination
            limit = filters.get('limit', 100)
            offset = filters.get('offset', 0)
            
            total = logs.count()
            logs = logs.skip(offset).limit(limit)
            
            # Convert to list and serialize
            logs_data = []
            for log in logs:
                log_dict = log.to_mongo().to_dict()
                log_dict['id'] = log_dict.pop('_id')
                logs_data.append(log_dict)
            
            return Response({
                'audit_logs': logs_data,
                'total': total,
                'limit': limit,
                'offset': offset
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        summary="Create audit log",
        description="Create a new audit log entry"
    )
    def post(self, request, project_id=None):
        """Create audit log."""
        serializer = AuditLogSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Create audit log
            audit_log = AuditLog(
                project_id=project_id,
                action=data['action'],
                resource_type=data['resource_type'],
                resource_id=data.get('resource_id'),
                user_id=data['user_id'],
                user_email=data.get('user_email'),
                user_role=data.get('user_role'),
                ip_address=data.get('ip_address'),
                user_agent=data.get('user_agent'),
                request_id=data.get('request_id'),
                session_id=data.get('session_id'),
                description=data['description'],
                changes=data.get('changes', []),
                metadata=data.get('metadata', {}),
                tags=data.get('tags', []),
                success=data['success'],
                error_message=data.get('error_message'),
                compliance_category=data.get('compliance_category'),
                risk_level=data.get('risk_level', 'low'),
                duration_ms=data.get('duration_ms'),
                service=data.get('service'),
                version=data.get('version')
            )
            
            # Calculate checksum for integrity
            audit_log.checksum = calculate_checksum(audit_log)
            audit_log.save()
            
            return Response(
                AuditLogSerializer(audit_log).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ComplianceReportListView(APIView):
    """List and generate compliance reports."""
    
    permission_classes = [IsProjectAdmin]
    
    @extend_schema(
        summary="List compliance reports",
        description="Get compliance reports for a project or system-wide"
    )
    def get(self, request, project_id=None):
        """List compliance reports."""
        # Get reports
        reports = ComplianceReport.objects(
            project_id=project_id
        ).order_by('-created_at')
        
        # Convert to list
        reports_data = []
        for report in reports:
            report_dict = report.to_mongo().to_dict()
            report_dict['id'] = report_dict.pop('_id')
            reports_data.append(report_dict)
        
        return Response({'reports': reports_data})
    
    @extend_schema(
        summary="Generate compliance report",
        description="Generate a new compliance report"
    )
    def post(self, request, project_id=None):
        """Generate compliance report."""
        serializer = ComplianceReportRequestSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Create report
            report = ComplianceReport(
                project_id=project_id,
                report_id=str(uuid.uuid4()),
                report_type=data['report_type'],
                period_start=data['period_start'],
                period_end=data['period_end'],
                format=data.get('format', 'json'),
                parameters=data.get('parameters', {}),
                generated_by=str(request.user.id)
            )
            report.save()
            
            # Trigger report generation
            generate_compliance_report.delay(str(report.id))
            
            return Response(
                ComplianceReportSerializer(report).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DataAccessLogListView(APIView):
    """List data access logs."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="List data access logs",
        description="Get data access logs for privacy compliance"
    )
    def get(self, request, project_id):
        """List data access logs."""
        # Parse query parameters
        access_type = request.query_params.get('access_type')
        user_id = request.query_params.get('user_id')
        resource_type = request.query_params.get('resource_type')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Build query
        query_filter = {'project_id': project_id}
        
        if access_type:
            query_filter['access_type'] = access_type
        
        if user_id:
            query_filter['user_id'] = user_id
        
        if resource_type:
            query_filter['resource_type'] = resource_type
        
        if start_date:
            query_filter['timestamp__gte'] = datetime.fromisoformat(start_date)
        
        if end_date:
            query_filter['timestamp__lte'] = datetime.fromisoformat(end_date)
        
        # Execute query
        logs = DataAccessLog.objects(**query_filter).order_by('-timestamp')
        
        # Apply pagination
        limit = int(request.query_params.get('limit', 100))
        offset = int(request.query_params.get('offset', 0))
        
        total = logs.count()
        logs = logs.skip(offset).limit(limit)
        
        # Convert to list
        logs_data = []
        for log in logs:
            log_dict = log.to_mongo().to_dict()
            log_dict['id'] = log_dict.pop('_id')
            logs_data.append(log_dict)
        
        return Response({
            'access_logs': logs_data,
            'total': total,
            'limit': limit,
            'offset': offset
        })


class SecurityEventListView(APIView):
    """List and manage security events."""
    
    permission_classes = [IsProjectAdmin]
    
    @extend_schema(
        summary="List security events",
        description="Get security events and incidents"
    )
    def get(self, request, project_id=None):
        """List security events."""
        # Parse query parameters
        event_type = request.query_params.get('event_type')
        severity = request.query_params.get('severity')
        investigation_status = request.query_params.get('investigation_status')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Build query
        query_filter = {}
        
        if project_id:
            query_filter['project_id'] = project_id
        
        if event_type:
            query_filter['event_type'] = event_type
        
        if severity:
            query_filter['severity'] = severity
        
        if investigation_status:
            query_filter['investigation_status'] = investigation_status
        
        if start_date:
            query_filter['timestamp__gte'] = datetime.fromisoformat(start_date)
        
        if end_date:
            query_filter['timestamp__lte'] = datetime.fromisoformat(end_date)
        
        # Execute query
        events = SecurityEvent.objects(**query_filter).order_by('-timestamp')
        
        # Apply pagination
        limit = int(request.query_params.get('limit', 100))
        offset = int(request.query_params.get('offset', 0))
        
        total = events.count()
        events = events.skip(offset).limit(limit)
        
        # Convert to list
        events_data = []
        for event in events:
            event_dict = event.to_mongo().to_dict()
            event_dict['id'] = event_dict.pop('_id')
            events_data.append(event_dict)
        
        return Response({
            'security_events': events_data,
            'total': total,
            'limit': limit,
            'offset': offset
        })
    
    @extend_schema(
        summary="Create security event",
        description="Create a new security event"
    )
    def post(self, request, project_id=None):
        """Create security event."""
        serializer = SecurityEventSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Create security event
            event = SecurityEvent(
                project_id=project_id,
                event_type=data['event_type'],
                severity=data.get('severity', 'medium'),
                user_id=data.get('user_id'),
                user_email=data.get('user_email'),
                session_id=data.get('session_id'),
                description=data['description'],
                source_ip=data.get('source_ip'),
                target_resource=data.get('target_resource'),
                detection_method=data.get('detection_method'),
                confidence_score=data.get('confidence_score'),
                response_action=data.get('response_action'),
                blocked=data.get('blocked', False),
                request_details=data.get('request_details', {}),
                user_agent=data.get('user_agent'),
                geo_location=data.get('geo_location'),
                tags=data.get('tags', [])
            )
            event.save()
            
            return Response(
                SecurityEventSerializer(event).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RetentionPolicyListView(APIView):
    """List and manage retention policies."""
    
    permission_classes = [IsProjectAdmin]
    
    @extend_schema(
        summary="List retention policies",
        description="Get data retention policies"
    )
    def get(self, request, project_id=None):
        """List retention policies."""
        policies = RetentionPolicy.objects(
            project_id=project_id
        ).order_by('-created_at')
        
        # Convert to list
        policies_data = []
        for policy in policies:
            policy_dict = policy.to_mongo().to_dict()
            policy_dict['id'] = policy_dict.pop('_id')
            policies_data.append(policy_dict)
        
        return Response({'policies': policies_data})
    
    @extend_schema(
        summary="Create retention policy",
        description="Create a new data retention policy"
    )
    def post(self, request, project_id=None):
        """Create retention policy."""
        serializer = RetentionPolicySerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Create policy
            policy = RetentionPolicy(
                project_id=project_id,
                policy_name=data['policy_name'],
                resource_type=data['resource_type'],
                retention_days=data['retention_days'],
                retention_after_days=data.get('retention_after_days'),
                retention_condition=data.get('retention_condition', 'time_based'),
                action=data['action'],
                archive_location=data.get('archive_location'),
                exceptions=data.get('exceptions', []),
                legal_hold_conditions=data.get('legal_hold_conditions', []),
                is_active=data.get('is_active', True),
                created_by=str(request.user.id),
                compliance_framework=data.get('compliance_framework')
            )
            policy.save()
            
            return Response(
                RetentionPolicySerializer(policy).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AuditSummaryView(APIView):
    """Get audit summary statistics."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="Get audit summary",
        description="Get comprehensive audit summary for a project"
    )
    def get(self, request, project_id):
        """Get audit summary."""
        # Get date range from query params
        days = int(request.query_params.get('days', 30))
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get audit logs in period
        logs = AuditLog.objects(
            project_id=project_id,
            timestamp__gte=start_date,
            timestamp__lte=end_date
        )
        
        total_actions = logs.count()
        successful_actions = logs(success=True).count()
        failed_actions = logs(success=False).count()
        high_risk_actions = logs(risk_level__in=['high', 'critical']).count()
        
        # Count by type
        actions_by_type = {}
        for log in logs.aggregate([
            {'$group': {'_id': '$action', 'count': {'$sum': 1}}}
        ]):
            actions_by_type[log['_id']] = log['count']
        
        # Count by user
        actions_by_user = {}
        for log in logs.aggregate([
            {'$group': {'_id': '$user_id', 'count': {'$sum': 1}}}
        ]):
            actions_by_user[log['_id']] = log['count']
        
        # Count by compliance category
        actions_by_compliance_category = {}
        for log in logs.aggregate([
            {'$match': {'compliance_category': {'$ne': None}}},
            {'$group': {'_id': '$compliance_category', 'count': {'$sum': 1}}}
        ]):
            actions_by_compliance_category[log['_id']] = log['count']
        
        # Get recent actions
        recent_actions = logs.order_by('-timestamp').limit(10)
        recent_actions_data = []
        for action in recent_actions:
            action_dict = action.to_mongo().to_dict()
            action_dict['id'] = action_dict.pop('_id')
            recent_actions_data.append(action_dict)
        
        # Get top resources
        top_resources = []
        for log in logs.aggregate([
            {'$group': {'_id': {'resource_type': '$resource_type', 'resource_id': '$resource_id'}, 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ]):
            top_resources.append({
                'resource_type': log['_id']['resource_type'],
                'resource_id': log['_id']['resource_id'],
                'count': log['count']
            })
        
        # Get security events count
        security_events_count = SecurityEvent.objects(
            project_id=project_id,
            timestamp__gte=start_date,
            timestamp__lte=end_date
        ).count()
        
        # Calculate compliance score (simplified)
        compliance_score = 1.0
        if total_actions > 0:
            violation_rate = high_risk_actions / total_actions
            compliance_score = max(0, 1 - violation_rate * 2)  # Simple scoring
        
        summary = {
            'total_actions': total_actions,
            'successful_actions': successful_actions,
            'failed_actions': failed_actions,
            'high_risk_actions': high_risk_actions,
            'actions_by_type': actions_by_type,
            'actions_by_user': actions_by_user,
            'actions_by_compliance_category': actions_by_compliance_category,
            'recent_actions': recent_actions_data,
            'top_resources': top_resources,
            'security_events_count': security_events_count,
            'compliance_score': compliance_score
        }
        
        serializer = AuditSummarySerializer(summary)
        return Response(serializer.data)


class DataAccessSummaryView(APIView):
    """Get data access summary."""
    
    permission_classes = [IsProjectMember]
    
    @extend_schema(
        summary="Get data access summary",
        description="Get data access statistics for privacy compliance"
    )
    def get(self, request, project_id):
        """Get data access summary."""
        # Get date range from query params
        days = int(request.query_params.get('days', 30))
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get access logs in period
        logs = DataAccessLog.objects(
            project_id=project_id,
            timestamp__gte=start_date,
            timestamp__lte=end_date
        )
        
        total_requests = logs.count()
        successful_accesses = logs(success=True).count()
        failed_accesses = logs(success=False).count()
        
        # Count by type
        access_by_type = {}
        for log in logs.aggregate([
            {'$group': {'_id': '$access_type', 'count': {'$sum': 1}}}
        ]):
            access_by_type[log['_id']] = log['count']
        
        # Count by user
        access_by_user = {}
        for log in logs.aggregate([
            {'$group': {'_id': '$user_id', 'count': {'$sum': 1}}}
        ]):
            access_by_user[log['_id']] = log['count']
        
        # Count by resource
        access_by_resource = {}
        for log in logs.aggregate([
            {'$group': {'_id': '$resource_type', 'count': {'$sum': 1}}}
        ]):
            access_by_resource[log['_id']] = log['count']
        
        # Calculate total records accessed
        total_records = logs.aggregate([
            {'$group': {'_id': None, 'total': {'$sum': '$record_count'}}}
        ])
        total_records_accessed = total_records[0]['total'] if total_records else 0
        
        # Get unique fields accessed
        unique_fields = set()
        for log in logs:
            if log.fields_accessed:
                unique_fields.update(log.fields_accessed)
        
        # Count export requests
        export_requests = logs(access_type='export').count()
        
        # Calculate average response time
        avg_response_time = logs.aggregate([
            {'$match': {'duration_ms': {'$ne': None}}},
            {'$group': {'_id': None, 'avg': {'$avg': '$duration_ms'}}}
        ])
        average_response_time_ms = avg_response_time[0]['avg'] if avg_response_time else 0
        
        summary = {
            'total_access_requests': total_requests,
            'successful_accesses': successful_accesses,
            'failed_accesses': failed_accesses,
            'access_by_type': access_by_type,
            'access_by_user': access_by_user,
            'access_by_resource': access_by_resource,
            'total_records_accessed': total_records_accessed,
            'unique_fields_accessed': list(unique_fields),
            'export_requests': export_requests,
            'average_response_time_ms': average_response_time_ms
        }
        
        serializer = DataAccessSummarySerializer(summary)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsProjectAdmin])
@extend_schema(
    summary="Trigger retention policy application",
    description="Manually trigger retention policy application"
)
def trigger_retention_policy(request, project_id=None):
    """Trigger retention policy application."""
    # Trigger retention policy processing
    apply_retention_policies.delay(project_id)
    
    return Response({
        'message': 'Retention policy application triggered',
        'project_id': project_id
    }, status=status.HTTP_202_ACCEPTED)


@api_view(['POST'])
@permission_classes([IsProjectAdmin])
@extend_schema(
    summary="Trigger audit statistics calculation",
    description="Manually trigger audit statistics calculation"
)
def trigger_audit_statistics(request, project_id=None):
    """Trigger audit statistics calculation."""
    # Trigger statistics calculation
    calculate_audit_statistics.delay(project_id)
    
    return Response({
        'message': 'Audit statistics calculation triggered',
        'project_id': project_id
    }, status=status.HTTP_202_ACCEPTED)


def calculate_checksum(audit_log):
    """Calculate checksum for audit log integrity."""
    # Create a string representation of the audit log
    data_string = json.dumps({
        'action': audit_log.action,
        'resource_type': audit_log.resource_type,
        'resource_id': audit_log.resource_id,
        'user_id': audit_log.user_id,
        'timestamp': audit_log.timestamp.isoformat(),
        'description': audit_log.description,
        'success': audit_log.success
    }, sort_keys=True)
    
    # Calculate SHA-256 hash
    return hashlib.sha256(data_string.encode()).hexdigest()
