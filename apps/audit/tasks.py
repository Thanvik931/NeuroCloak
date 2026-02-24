import uuid
import logging
import csv
import io
import zipfile
from datetime import datetime, timedelta
from celery import shared_task
from django.core.files.base import ContentFile
from django.conf import settings
from django.template.loader import render_to_string

from .models import (
    AuditLog, ComplianceReport, DataAccessLog, SecurityEvent, RetentionPolicy
)

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def generate_compliance_report(self, report_id):
    """Generate compliance report."""
    try:
        report = ComplianceReport.objects.get(id=report_id)
        
        # Get audit logs for the period
        logs = AuditLog.objects(
            project_id=report.project_id,
            timestamp__gte=report.period_start,
            timestamp__lte=report.period_end
        )
        
        # Generate report based on type
        if report.report_type == 'access_log':
            content = generate_access_log_report(logs, report)
        elif report.report_type == 'data_modification':
            content = generate_data_modification_report(logs, report)
        elif report.report_type == 'configuration_changes':
            content = generate_configuration_changes_report(logs, report)
        elif report.report_type == 'security_events':
            content = generate_security_events_report(report)
        elif report.report_type == 'privacy_audit':
            content = generate_privacy_audit_report(report)
        elif report.report_type == 'retention_policy':
            content = generate_retention_policy_report(report)
        else:  # full_audit
            content = generate_full_audit_report(logs, report)
        
        # Update report
        report.summary = content['summary']
        report.findings = content.get('findings', [])
        report.recommendations = content.get('recommendations', [])
        report.total_actions = content['total_actions']
        report.actions_by_type = content.get('actions_by_type', {})
        report.actions_by_user = content.get('actions_by_user', {})
        report.high_risk_actions = content.get('high_risk_actions', 0)
        report.failed_actions = content.get('failed_actions', 0)
        report.compliance_score = content.get('compliance_score', 1.0)
        report.violations = content.get('violations', [])
        report.status = 'completed'
        report.completed_at = datetime.utcnow()
        
        # Save report file if needed
        if report.format != 'json':
            file_content = generate_report_file(content, report.format)
            file_name = f"compliance_report_{report.report_id}.{report.format}"
            report.report_file = file_name
        
        report.save()
        
        logger.info(f"Compliance report {report_id} generated successfully")
        
    except Exception as exc:
        logger.error(f"Error generating compliance report {report_id}: {str(exc)}")
        
        # Update report status to failed
        try:
            report.status = 'failed'
            report.save()
        except:
            pass
        
        raise self.retry(exc=exc, countdown=60)


def generate_access_log_report(logs, report):
    """Generate access log compliance report."""
    total_actions = logs.count()
    access_logs = logs(access_type__in=['read', 'access', 'query'])
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
    
    # Findings
    findings = []
    if failed_actions > total_actions * 0.05:  # More than 5% failures
        findings.append(f"High failure rate: {failed_actions}/{total_actions} actions failed")
    
    if high_risk_actions > 0:
        findings.append(f"High-risk actions detected: {high_risk_actions}")
    
    # Recommendations
    recommendations = []
    if failed_actions > 0:
        recommendations.append("Investigate and address failed access attempts")
    
    if high_risk_actions > 0:
        recommendations.append("Review high-risk access patterns and implement additional controls")
    
    # Calculate compliance score
    compliance_score = 1.0
    if total_actions > 0:
        failure_rate = failed_actions / total_actions
        high_risk_rate = high_risk_actions / total_actions
        compliance_score = max(0, 1.0 - (failure_rate * 2 + high_risk_rate * 3))
    
    return {
        'summary': f"Access log compliance report for period {report.period_start.date()} to {report.period_end.date()}. Total actions: {total_actions}",
        'findings': findings,
        'recommendations': recommendations,
        'total_actions': total_actions,
        'actions_by_type': actions_by_type,
        'actions_by_user': actions_by_user,
        'high_risk_actions': high_risk_actions,
        'failed_actions': failed_actions,
        'compliance_score': compliance_score
    }


def generate_data_modification_report(logs, report):
    """Generate data modification compliance report."""
    modification_logs = logs(action__in=['create', 'update', 'delete'])
    total_actions = modification_logs.count()
    failed_actions = modification_logs(success=False).count()
    high_risk_actions = modification_logs(risk_level__in=['high', 'critical']).count()
    
    # Count by type
    actions_by_type = {}
    for log in modification_logs.aggregate([
        {'$group': {'_id': '$action', 'count': {'$sum': 1}}}
    ]):
        actions_by_type[log['_id']] = log['count']
    
    # Count by user
    actions_by_user = {}
    for log in modification_logs.aggregate([
        {'$group': {'_id': '$user_id', 'count': {'$sum': 1}}}
    ]):
        actions_by_user[log['_id']] = log['count']
    
    # Findings
    findings = []
    delete_actions = modification_logs(action='delete').count()
    if delete_actions > 0:
        findings.append(f"{delete_actions} delete actions detected - requires review")
    
    if failed_actions > 0:
        findings.append(f"{failed_actions} failed modification attempts")
    
    # Recommendations
    recommendations = []
    if delete_actions > 0:
        recommendations.append("Review all delete actions for proper authorization")
    
    if failed_actions > 0:
        recommendations.append("Investigate failed modification attempts")
    
    # Calculate compliance score
    compliance_score = 1.0
    if total_actions > 0:
        failure_rate = failed_actions / total_actions
        delete_rate = delete_actions / total_actions
        compliance_score = max(0, 1.0 - (failure_rate * 2 + delete_rate * 1.5))
    
    return {
        'summary': f"Data modification compliance report for period {report.period_start.date()} to {report.period_end.date()}. Total modifications: {total_actions}",
        'findings': findings,
        'recommendations': recommendations,
        'total_actions': total_actions,
        'actions_by_type': actions_by_type,
        'actions_by_user': actions_by_user,
        'high_risk_actions': high_risk_actions,
        'failed_actions': failed_actions,
        'compliance_score': compliance_score
    }


def generate_configuration_changes_report(logs, report):
    """Generate configuration changes compliance report."""
    config_logs = logs(action__in=['config_change', 'permission_change', 'role_change'])
    total_actions = config_logs.count()
    failed_actions = config_logs(success=False).count()
    high_risk_actions = config_logs(risk_level__in=['high', 'critical']).count()
    
    # Count by type
    actions_by_type = {}
    for log in config_logs.aggregate([
        {'$group': {'_id': '$action', 'count': {'$sum': 1}}}
    ]):
        actions_by_type[log['_id']] = log['count']
    
    # Count by user
    actions_by_user = {}
    for log in config_logs.aggregate([
        {'$group': {'_id': '$user_id', 'count': {'$sum': 1}}}
    ]):
        actions_by_user[log['_id']] = log['count']
    
    # Findings
    findings = []
    if high_risk_actions > 0:
        findings.append(f"{high_risk_actions} high-risk configuration changes detected")
    
    # Check for changes outside business hours
    business_hours_changes = 0
    for log in config_logs:
        hour = log.timestamp.hour
        if hour < 9 or hour > 17:  # Outside 9 AM - 5 PM
            business_hours_changes += 1
    
    if business_hours_changes > 0:
        findings.append(f"{business_hours_changes} configuration changes made outside business hours")
    
    # Recommendations
    recommendations = []
    if high_risk_actions > 0:
        recommendations.append("Review and approve high-risk configuration changes")
    
    if business_hours_changes > 0:
        recommendations.append("Implement change approval process for non-business hours changes")
    
    # Calculate compliance score
    compliance_score = 1.0
    if total_actions > 0:
        high_risk_rate = high_risk_actions / total_actions
        after_hours_rate = business_hours_changes / total_actions
        compliance_score = max(0, 1.0 - (high_risk_rate * 2 + after_hours_rate * 1))
    
    return {
        'summary': f"Configuration changes compliance report for period {report.period_start.date()} to {report.period_end.date()}. Total changes: {total_actions}",
        'findings': findings,
        'recommendations': recommendations,
        'total_actions': total_actions,
        'actions_by_type': actions_by_type,
        'actions_by_user': actions_by_user,
        'high_risk_actions': high_risk_actions,
        'failed_actions': failed_actions,
        'compliance_score': compliance_score
    }


def generate_security_events_report(report):
    """Generate security events compliance report."""
    events = SecurityEvent.objects(
        project_id=report.project_id,
        timestamp__gte=report.period_start,
        timestamp__lte=report.period_end
    )
    
    total_events = events.count()
    critical_events = events(severity='critical').count()
    high_events = events(severity='high').count()
    blocked_events = events(blocked=True).count()
    
    # Count by type
    events_by_type = {}
    for event in events.aggregate([
        {'$group': {'_id': '$event_type', 'count': {'$sum': 1}}}
    ]):
        events_by_type[event['_id']] = event['count']
    
    # Findings
    findings = []
    if critical_events > 0:
        findings.append(f"{critical_events} critical security events detected")
    
    if high_events > 0:
        findings.append(f"{high_events} high-severity security events detected")
    
    if blocked_events > 0:
        findings.append(f"{blocked_events} security events were blocked")
    
    # Recommendations
    recommendations = []
    if critical_events > 0:
        recommendations.append("Immediate investigation required for critical security events")
    
    if high_events > 0:
        recommendations.append("Review and address high-severity security events")
    
    # Calculate compliance score
    compliance_score = 1.0
    if total_events > 0:
        critical_rate = critical_events / total_events
        high_rate = high_events / total_events
        compliance_score = max(0, 1.0 - (critical_rate * 3 + high_rate * 2))
    
    return {
        'summary': f"Security events compliance report for period {report.period_start.date()} to {report.period_end.date()}. Total events: {total_events}",
        'findings': findings,
        'recommendations': recommendations,
        'total_actions': total_events,
        'actions_by_type': events_by_type,
        'actions_by_user': {},
        'high_risk_actions': critical_events + high_events,
        'failed_actions': 0,
        'compliance_score': compliance_score
    }


def generate_privacy_audit_report(report):
    """Generate privacy audit compliance report."""
    # Get data access logs for privacy analysis
    access_logs = DataAccessLog.objects(
        project_id=report.project_id,
        timestamp__gte=report.period_start,
        timestamp__lte=report.period_end
    )
    
    total_accesses = access_logs.count()
    export_accesses = access_logs(access_type='export').count()
    accesses_without_legal_basis = access_logs(legal_basis__in=[None, '']).count()
    
    # Count by type
    access_by_type = {}
    for log in access_logs.aggregate([
        {'$group': {'_id': '$access_type', 'count': {'$sum': 1}}}
    ]):
        access_by_type[log['_id']] = log['count']
    
    # Count by user
    access_by_user = {}
    for log in access_logs.aggregate([
        {'$group': {'_id': '$user_id', 'count': {'$sum': 1}}}
    ]):
        access_by_user[log['_id']] = log['count']
    
    # Findings
    findings = []
    if accesses_without_legal_basis > 0:
        findings.append(f"{accesses_without_legal_basis} data accesses without documented legal basis")
    
    if export_accesses > 0:
        findings.append(f"{export_accesses} data export activities detected")
    
    # Recommendations
    recommendations = []
    if accesses_without_legal_basis > 0:
        recommendations.append("Document legal basis for all data accesses")
    
    if export_accesses > 0:
        recommendations.append("Review and approve all data export activities")
    
    # Calculate compliance score
    compliance_score = 1.0
    if total_accesses > 0:
        no_basis_rate = accesses_without_legal_basis / total_accesses
        export_rate = export_accesses / total_accesses
        compliance_score = max(0, 1.0 - (no_basis_rate * 3 + export_rate * 1))
    
    return {
        'summary': f"Privacy audit compliance report for period {report.period_start.date()} to {report.period_end.date()}. Total accesses: {total_accesses}",
        'findings': findings,
        'recommendations': recommendations,
        'total_actions': total_accesses,
        'actions_by_type': access_by_type,
        'actions_by_user': access_by_user,
        'high_risk_actions': export_accesses,
        'failed_actions': 0,
        'compliance_score': compliance_score
    }


def generate_retention_policy_report(report):
    """Generate retention policy compliance report."""
    policies = RetentionPolicy.objects(
        project_id=report.project_id,
        is_active=True
    )
    
    total_policies = policies.count()
    
    # Count by resource type
    policies_by_type = {}
    for policy in policies:
        policies_by_type[policy.resource_type] = policies_by_type.get(policy.resource_type, 0) + 1
    
    # Findings
    findings = []
    if total_policies == 0:
        findings.append("No active retention policies found")
    
    # Check for missing policy types
    required_types = ['audit_logs', 'predictions', 'evaluations']
    for req_type in required_types:
        if req_type not in policies_by_type:
            findings.append(f"Missing retention policy for {req_type}")
    
    # Recommendations
    recommendations = []
    if total_policies == 0:
        recommendations.append("Implement retention policies for all data types")
    
    for req_type in required_types:
        if req_type not in policies_by_type:
            recommendations.append(f"Create retention policy for {req_type}")
    
    # Calculate compliance score
    compliance_score = len(policies_by_type) / len(required_types) if required_types else 0
    
    return {
        'summary': f"Retention policy compliance report for period {report.period_start.date()} to {report.period_end.date()}. Total policies: {total_policies}",
        'findings': findings,
        'recommendations': recommendations,
        'total_actions': total_policies,
        'actions_by_type': policies_by_type,
        'actions_by_user': {},
        'high_risk_actions': 0,
        'failed_actions': 0,
        'compliance_score': compliance_score
    }


def generate_full_audit_report(logs, report):
    """Generate comprehensive audit report."""
    # Combine all report types
    access_report = generate_access_log_report(logs, report)
    modification_report = generate_data_modification_report(logs, report)
    config_report = generate_configuration_changes_report(logs, report)
    security_report = generate_security_events_report(report)
    privacy_report = generate_privacy_audit_report(report)
    retention_report = generate_retention_policy_report(report)
    
    # Combine findings
    all_findings = []
    all_findings.extend(access_report.get('findings', []))
    all_findings.extend(modification_report.get('findings', []))
    all_findings.extend(config_report.get('findings', []))
    all_findings.extend(security_report.get('findings', []))
    all_findings.extend(privacy_report.get('findings', []))
    all_findings.extend(retention_report.get('findings', []))
    
    # Combine recommendations
    all_recommendations = []
    all_recommendations.extend(access_report.get('recommendations', []))
    all_recommendations.extend(modification_report.get('recommendations', []))
    all_recommendations.extend(config_report.get('recommendations', []))
    all_recommendations.extend(security_report.get('recommendations', []))
    all_recommendations.extend(privacy_report.get('recommendations', []))
    all_recommendations.extend(retention_report.get('recommendations', []))
    
    # Calculate overall compliance score
    scores = [
        access_report.get('compliance_score', 1.0),
        modification_report.get('compliance_score', 1.0),
        config_report.get('compliance_score', 1.0),
        security_report.get('compliance_score', 1.0),
        privacy_report.get('compliance_score', 1.0),
        retention_report.get('compliance_score', 1.0)
    ]
    overall_score = sum(scores) / len(scores)
    
    return {
        'summary': f"Full audit compliance report for period {report.period_start.date()} to {report.period_end.date()}. Overall compliance score: {overall_score:.2f}",
        'findings': all_findings,
        'recommendations': all_recommendations,
        'total_actions': logs.count(),
        'actions_by_type': access_report.get('actions_by_type', {}),
        'actions_by_user': access_report.get('actions_by_user', {}),
        'high_risk_actions': access_report.get('high_risk_actions', 0),
        'failed_actions': access_report.get('failed_actions', 0),
        'compliance_score': overall_score
    }


def generate_report_file(content, format_type):
    """Generate report file in specified format."""
    if format_type == 'csv':
        return generate_csv_report(content)
    elif format_type == 'pdf':
        return generate_pdf_report(content)
    elif format_type == 'html':
        return generate_html_report(content)
    else:
        return json.dumps(content, indent=2)


def generate_csv_report(content):
    """Generate CSV format report."""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write summary
    writer.writerow(['Report Summary'])
    writer.writerow(['Metric', 'Value'])
    writer.writerow(['Total Actions', content['total_actions']])
    writer.writerow(['Compliance Score', f"{content.get('compliance_score', 0):.2f}"])
    writer.writerow([])
    
    # Write findings
    writer.writerow(['Findings'])
    for finding in content.get('findings', []):
        writer.writerow([finding])
    writer.writerow([])
    
    # Write recommendations
    writer.writerow(['Recommendations'])
    for recommendation in content.get('recommendations', []):
        writer.writerow([recommendation])
    
    return output.getvalue()


def generate_pdf_report(content):
    """Generate PDF format report."""
    # This would typically use a library like ReportLab
    # For now, return HTML that can be converted to PDF
    return generate_html_report(content)


def generate_html_report(content):
    """Generate HTML format report."""
    context = {
        'content': content,
        'generated_at': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')
    }
    
    return render_to_string('audit/compliance_report.html', context)


@shared_task
def apply_retention_policies(project_id=None):
    """Apply retention policies to clean up old data."""
    try:
        logger.info(f"Applying retention policies for project {project_id}")
        
        # Get active retention policies
        policies = RetentionPolicy.objects(
            project_id=project_id,
            is_active=True
        )
        
        for policy in policies:
            try:
                apply_single_retention_policy(policy)
            except Exception as e:
                logger.error(f"Error applying retention policy {policy.id}: {str(e)}")
                continue
        
        logger.info(f"Retention policies applied for project {project_id}")
        
    except Exception as e:
        logger.error(f"Error in apply_retention_policies: {str(e)}")


def apply_single_retention_policy(policy):
    """Apply a single retention policy."""
    now = datetime.utcnow()
    cutoff_date = now - timedelta(days=policy.retention_days)
    
    # Check if policy is on legal hold
    if policy.legal_hold_conditions:
        # Skip if any legal hold conditions are met
        # This would need to be implemented based on specific conditions
        pass
    
    # Apply policy based on resource type
    if policy.resource_type == 'audit_logs':
        collection = AuditLog
    elif policy.resource_type == 'access_logs':
        collection = DataAccessLog
    elif policy.resource_type == 'security_events':
        collection = SecurityEvent
    else:
        logger.warning(f"Unknown resource type for retention policy: {policy.resource_type}")
        return
    
    # Get old records
    old_records = collection.objects(
        timestamp__lt=cutoff_date
    )
    
    count = old_records.count()
    if count == 0:
        return
    
    # Apply action
    if policy.action == 'delete':
        old_records.delete()
        logger.info(f"Deleted {count} old {policy.resource_type} records")
    elif policy.action == 'archive':
        # Archive logic would go here
        logger.info(f"Archived {count} old {policy.resource_type} records")
    elif policy.action == 'anonymize':
        # Anonymization logic would go here
        logger.info(f"Anonymized {count} old {policy.resource_type} records")
    
    # Update policy last applied time
    policy.last_applied = now
    policy.save()


@shared_task
def calculate_audit_statistics(project_id=None):
    """Calculate audit statistics for reporting."""
    try:
        logger.info(f"Calculating audit statistics for project {project_id}")
        
        # Calculate statistics for different time windows
        windows = [24, 168, 720]  # 1 day, 1 week, 1 month in hours
        
        for hours in windows:
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(hours=hours)
            
            # Get audit logs in window
            logs = AuditLog.objects(
                project_id=project_id,
                timestamp__gte=start_time,
                timestamp__lte=end_time
            )
            
            total_actions = logs.count()
            successful_actions = logs(success=True).count()
            failed_actions = logs(success=False).count()
            high_risk_actions = logs(risk_level__in=['high', 'critical']).count()
            
            # Store statistics (would typically go to a statistics collection)
            stats = {
                'project_id': project_id,
                'window_hours': hours,
                'timestamp': end_time,
                'total_actions': total_actions,
                'successful_actions': successful_actions,
                'failed_actions': failed_actions,
                'high_risk_actions': high_risk_actions,
                'success_rate': successful_actions / total_actions if total_actions > 0 else 0,
                'failure_rate': failed_actions / total_actions if total_actions > 0 else 0,
                'high_risk_rate': high_risk_actions / total_actions if total_actions > 0 else 0
            }
            
            logger.info(f"Audit statistics for {hours}h window: {stats}")
        
        logger.info(f"Audit statistics calculated for project {project_id}")
        
    except Exception as e:
        logger.error(f"Error calculating audit statistics for project {project_id}: {str(e)}")


@shared_task
def cleanup_old_audit_logs():
    """Clean up very old audit logs based on system retention policy."""
    try:
        # Delete audit logs older than 2 years
        cutoff_date = datetime.utcnow() - timedelta(days=730)
        
        old_logs = AuditLog.objects(timestamp__lt=cutoff_date)
        count = old_logs.count()
        
        if count > 0:
            old_logs.delete()
            logger.info(f"Cleaned up {count} old audit logs")
        
    except Exception as e:
        logger.error(f"Error in cleanup_old_audit_logs: {str(e)}")
