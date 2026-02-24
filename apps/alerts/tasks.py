import uuid
import logging
import json
import requests
from datetime import datetime, timedelta
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string

from .models import Alert, AlertRuleConfig, AlertNotification, AlertStatistics
from apps.evaluations.models import TrustScore

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_alert_rules(self, project_id, model_id=None):
    """Process alert rules and create alerts if conditions are met."""
    try:
        logger.info(f"Processing alert rules for project {project_id}, model {model_id}")
        
        # Get active alert rules
        rules = AlertRuleConfig.objects(
            project_id=project_id,
            model_id=model_id or None,
            is_active=True
        )
        
        for rule in rules:
            try:
                process_single_alert_rule(rule)
            except Exception as e:
                logger.error(f"Error processing alert rule {rule.id}: {str(e)}")
                continue
        
        logger.info(f"Alert rule processing completed for project {project_id}")
        
    except Exception as exc:
        logger.error(f"Error in alert rule processing: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)


def process_single_alert_rule(rule):
    """Process a single alert rule."""
    # Check cooldown
    if rule.last_triggered:
        cooldown_until = rule.last_triggered + timedelta(minutes=rule.cooldown_minutes)
        if datetime.utcnow() < cooldown_until:
            return
    
    # Get latest metrics based on alert type
    metrics = get_metrics_for_alert_type(rule.alert_type, rule.project_id, rule.model_id)
    
    if not metrics:
        return
    
    # Check each rule condition
    alerts_triggered = []
    
    for rule_condition in rule.rules:
        metric_name = rule_condition.get('metric_name')
        operator = rule_condition.get('operator')
        threshold = rule_condition.get('threshold')
        severity = rule_condition.get('severity', 'medium')
        
        if not all([metric_name, operator, threshold is not None]):
            continue
        
        # Get metric value
        metric_value = metrics.get(metric_name)
        if metric_value is None:
            continue
        
        # Evaluate condition
        if evaluate_condition(metric_value, operator, threshold):
            # Check if similar alert already exists and is active
            existing_alert = Alert.objects(
                project_id=rule.project_id,
                model_id=rule.model_id,
                alert_type=rule.alert_type,
                status='active',
                rule_name=rule.name
            ).first()
            
            if existing_alert:
                # Update existing alert
                existing_alert.metric_value = metric_value
                existing_alert.threshold = threshold
                existing_alert.updated_at = datetime.utcnow()
                existing_alert.save()
            else:
                # Create new alert
                alert = Alert(
                    project_id=rule.project_id,
                    model_id=rule.model_id,
                    alert_id=str(uuid.uuid4()),
                    title=f"{rule.alert_type.title()} Alert: {rule.name}",
                    description=f"{metric_name} is {metric_value} {operator} {threshold}",
                    alert_type=rule.alert_type,
                    severity=severity,
                    metric_value=metric_value,
                    threshold=threshold,
                    rule_name=rule.name,
                    context={
                        'rule_id': str(rule.id),
                        'rule_name': rule.name,
                        'metric_name': metric_name,
                        'operator': operator,
                        'threshold': threshold
                    },
                    source='alert_rule'
                )
                alert.save()
                alerts_triggered.append(alert)
    
    # Update rule last triggered time
    if alerts_triggered:
        rule.last_triggered = datetime.utcnow()
        rule.save()
        
        # Process notifications for new alerts
        for alert in alerts_triggered:
            process_alert_notifications.delay(str(alert.id))


def get_metrics_for_alert_type(alert_type, project_id, model_id):
    """Get latest metrics for a specific alert type."""
    metrics = {}
    
    try:
        if alert_type == 'trust_score':
            # Get latest trust score
            trust_score = TrustScore.objects(
                project_id=project_id,
                model_id=model_id
            ).order_by('-timestamp').first()
            
            if trust_score:
                metrics.update({
                    'trust_score': trust_score.score,
                    'fairness_score': trust_score.fairness_score,
                    'robustness_score': trust_score.robustness_score,
                    'stability_score': trust_score.stability_score,
                    'explainability_score': trust_score.explainability_score
                })
        
        elif alert_type == 'fairness':
            # Get latest fairness evaluation
            from apps.evaluations.models import FairnessEvaluation
            fairness_eval = FairnessEvaluation.objects(
                project_id=project_id,
                model_id=model_id,
                status='completed'
            ).order_by('-timestamp').first()
            
            if fairness_eval:
                metrics['fairness_score'] = fairness_eval.overall_fairness_score
        
        elif alert_type == 'drift':
            # Get latest drift evaluation
            from apps.evaluations.models import DriftEvaluation
            drift_eval = DriftEvaluation.objects(
                project_id=project_id,
                model_id=model_id,
                status='completed'
            ).order_by('-timestamp').first()
            
            if drift_eval:
                metrics['drift_score'] = drift_eval.overall_drift_score
        
        elif alert_type == 'robustness':
            # Get latest robustness evaluation
            from apps.evaluations.models import RobustnessEvaluation
            robustness_eval = RobustnessEvaluation.objects(
                project_id=project_id,
                model_id=model_id,
                status='completed'
            ).order_by('-timestamp').first()
            
            if robustness_eval:
                metrics['robustness_score'] = robustness_eval.overall_robustness_score
        
        elif alert_type == 'explainability':
            # Get latest explainability evaluation
            from apps.evaluations.models import ExplainabilityEvaluation
            explainability_eval = ExplainabilityEvaluation.objects(
                project_id=project_id,
                model_id=model_id,
                status='completed'
            ).order_by('-timestamp').first()
            
            if explainability_eval:
                metrics['explainability_score'] = explainability_eval.overall_explainability_score
        
        # Add data quality metrics
        elif alert_type == 'data_quality':
            from apps.ingestion.models import IngestionMetrics
            latest_metrics = IngestionMetrics.objects(
                project_id=project_id,
                model_id=model_id
            ).order_by('-timestamp').first()
            
            if latest_metrics:
                metrics.update({
                    'anomaly_rate': latest_metrics.anomaly_count / latest_metrics.total_predictions if latest_metrics.total_predictions > 0 else 0,
                    'error_rate': latest_metrics.error_rate,
                    'avg_processing_time_ms': latest_metrics.avg_processing_time_ms
                })
    
    except Exception as e:
        logger.error(f"Error getting metrics for alert type {alert_type}: {str(e)}")
    
    return metrics


def evaluate_condition(value, operator, threshold):
    """Evaluate a condition."""
    try:
        if operator == '>':
            return value > threshold
        elif operator == '<':
            return value < threshold
        elif operator == '>=':
            return value >= threshold
        elif operator == '<=':
            return value <= threshold
        elif operator == '==':
            return value == threshold
        elif operator == '!=':
            return value != threshold
        elif operator == 'in':
            return value in threshold if isinstance(threshold, (list, tuple)) else False
        elif operator == 'not_in':
            return value not in threshold if isinstance(threshold, (list, tuple)) else True
        else:
            return False
    except Exception:
        return False


@shared_task(bind=True, max_retries=3)
def process_alert_notifications(self, alert_id):
    """Process notifications for an alert."""
    try:
        alert = Alert.objects.get(id=alert_id)
        
        # Get alert rule for notification channels
        rule = None
        if alert.rule_name:
            rule = AlertRuleConfig.objects(
                project_id=alert.project_id,
                model_id=alert.model_id,
                name=alert.rule_name
            ).first()
        
        # Default channels if no rule or no channels specified
        channels = rule.channels if rule and rule.channels else []
        
        # Add in-app notification by default
        if not any(c.get('channel_type') == 'in_app' for c in channels):
            channels.append({'channel_type': 'in_app', 'config': {}, 'enabled': True})
        
        # Process each channel
        for channel in channels:
            if not channel.get('enabled', True):
                continue
            
            try:
                send_alert_notification.delay(alert_id, channel)
            except Exception as e:
                logger.error(f"Error queuing notification for alert {alert_id}: {str(e)}")
        
        # Update alert with notification tracking
        alert.notifications_sent = [{'channel': c.get('channel_type'), 'status': 'queued'} for c in channels]
        alert.last_notification_at = datetime.utcnow()
        alert.save()
        
    except Exception as exc:
        logger.error(f"Error processing alert notifications for {alert_id}: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_alert_notification(self, alert_id, channel):
    """Send notification through a specific channel."""
    try:
        alert = Alert.objects.get(id=alert_id)
        channel_type = channel.get('channel_type')
        config = channel.get('config', {})
        
        # Create notification record
        notification = AlertNotification(
            alert_id=alert_id,
            channel_type=channel_type,
            recipient=config.get('recipient', ''),
            status='pending'
        )
        notification.save()
        
        # Send notification based on channel type
        if channel_type == 'email':
            success = send_email_notification(alert, config)
        elif channel_type == 'webhook':
            success = send_webhook_notification(alert, config)
        elif channel_type == 'slack':
            success = send_slack_notification(alert, config)
        elif channel_type == 'teams':
            success = send_teams_notification(alert, config)
        elif channel_type == 'in_app':
            success = send_in_app_notification(alert, config)
        else:
            success = False
            logger.error(f"Unknown notification channel type: {channel_type}")
        
        # Update notification status
        if success:
            notification.status = 'sent'
            notification.sent_at = datetime.utcnow()
        else:
            notification.status = 'failed'
            notification.error_message = "Failed to send notification"
            
            # Retry logic
            if notification.retry_count < notification.max_retries:
                notification.retry_count += 1
                notification.status = 'retry'
                # Schedule retry with exponential backoff
                countdown = 60 * (2 ** notification.retry_count)
                send_alert_notification.apply_async(
                    args=[alert_id, channel],
                    countdown=countdown
                )
        
        notification.save()
        
    except Exception as exc:
        logger.error(f"Error sending notification for alert {alert_id}: {str(exc)}")
        
        # Update notification status
        try:
            notification.status = 'failed'
            notification.error_message = str(exc)
            notification.save()
        except:
            pass
        
        raise self.retry(exc=exc, countdown=60)


def send_email_notification(alert, config):
    """Send email notification."""
    try:
        recipient = config.get('recipient')
        if not recipient:
            return False
        
        # Prepare email content
        subject = f"[NeuroCloak Alert] {alert.title}"
        
        context = {
            'alert': alert,
            'project_id': alert.project_id,
            'model_id': alert.model_id,
            'severity_color': get_severity_color(alert.severity)
        }
        
        # Render email templates
        text_content = render_to_string('alerts/email.txt', context)
        html_content = render_to_string('alerts/email.html', context)
        
        # Send email
        send_mail(
            subject=subject,
            message=text_content,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'alerts@neurocloak.com'),
            recipient_list=[recipient],
            html_message=html_content,
            fail_silently=False
        )
        
        logger.info(f"Email notification sent for alert {alert.alert_id} to {recipient}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending email notification: {str(e)}")
        return False


def send_webhook_notification(alert, config):
    """Send webhook notification."""
    try:
        url = config.get('url')
        if not url:
            return False
        
        # Prepare webhook payload
        payload = {
            'alert_id': alert.alert_id,
            'title': alert.title,
            'description': alert.description,
            'severity': alert.severity,
            'alert_type': alert.alert_type,
            'project_id': alert.project_id,
            'model_id': alert.model_id,
            'metric_value': alert.metric_value,
            'threshold': alert.threshold,
            'created_at': alert.created_at.isoformat(),
            'context': alert.context
        }
        
        # Add custom headers
        headers = config.get('headers', {})
        headers.setdefault('Content-Type', 'application/json')
        
        # Send webhook
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=30
        )
        
        response.raise_for_status()
        
        logger.info(f"Webhook notification sent for alert {alert.alert_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending webhook notification: {str(e)}")
        return False


def send_slack_notification(alert, config):
    """Send Slack notification."""
    try:
        webhook_url = config.get('webhook_url')
        if not webhook_url:
            return False
        
        # Prepare Slack payload
        color = get_severity_color(alert.severity)
        
        payload = {
            'text': f"NeuroCloak Alert: {alert.title}",
            'attachments': [
                {
                    'color': color,
                    'title': alert.title,
                    'text': alert.description,
                    'fields': [
                        {
                            'title': 'Severity',
                            'value': alert.severity.upper(),
                            'short': True
                        },
                        {
                            'title': 'Type',
                            'value': alert.alert_type.replace('_', ' ').title(),
                            'short': True
                        },
                        {
                            'title': 'Project',
                            'value': alert.project_id,
                            'short': True
                        },
                        {
                            'title': 'Model',
                            'value': alert.model_id or 'N/A',
                            'short': True
                        }
                    ],
                    'footer': 'NeuroCloak',
                    'ts': int(alert.created_at.timestamp())
                }
            ]
        }
        
        # Send to Slack
        response = requests.post(webhook_url, json=payload, timeout=30)
        response.raise_for_status()
        
        logger.info(f"Slack notification sent for alert {alert.alert_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending Slack notification: {str(e)}")
        return False


def send_teams_notification(alert, config):
    """Send Microsoft Teams notification."""
    try:
        webhook_url = config.get('webhook_url')
        if not webhook_url:
            return False
        
        # Prepare Teams payload
        color = get_severity_color(alert.severity)
        
        payload = {
            '@type': 'MessageCard',
            '@context': 'http://schema.org/extensions',
            'themeColor': color.replace('#', ''),
            'summary': alert.title,
            'sections': [
                {
                    'activityTitle': alert.title,
                    'activitySubtitle': alert.description,
                    'facts': [
                        {'name': 'Severity', 'value': alert.severity.upper()},
                        {'name': 'Type', 'value': alert.alert_type.replace('_', ' ').title()},
                        {'name': 'Project', 'value': alert.project_id},
                        {'name': 'Model', 'value': alert.model_id or 'N/A'}
                    ],
                    'markdown': True
                }
            ]
        }
        
        # Send to Teams
        response = requests.post(webhook_url, json=payload, timeout=30)
        response.raise_for_status()
        
        logger.info(f"Teams notification sent for alert {alert.alert_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending Teams notification: {str(e)}")
        return False


def send_in_app_notification(alert, config):
    """Send in-app notification."""
    try:
        # In-app notifications would be handled by the frontend
        # Here we just mark it as sent since the frontend will poll for active alerts
        logger.info(f"In-app notification created for alert {alert.alert_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error creating in-app notification: {str(e)}")
        return False


@shared_task
def check_alert_escalations():
    """Check for alert escalations."""
    try:
        # Get active alerts that might need escalation
        active_alerts = Alert.objects(
            status='active',
            is_suppressed=False,
            created_at__lt=datetime.utcnow() - timedelta(minutes=30)  # Older than 30 minutes
        )
        
        for alert in active_alerts:
            # Check if alert should be escalated
            if should_escalate_alert(alert):
                escalate_alert(alert)
        
    except Exception as e:
        logger.error(f"Error checking alert escalations: {str(e)}")


def should_escalate_alert(alert):
    """Check if an alert should be escalated."""
    # Simple escalation logic: escalate critical alerts after 30 minutes
    if alert.severity == 'critical':
        escalation_time = alert.created_at + timedelta(minutes=30)
        return datetime.utcnow() > escalation_time
    
    # Escalate high alerts after 1 hour
    elif alert.severity == 'high':
        escalation_time = alert.created_at + timedelta(hours=1)
        return datetime.utcnow() > escalation_time
    
    return False


def escalate_alert(alert):
    """Escalate an alert."""
    try:
        # Increase severity if possible
        if alert.severity == 'high':
            alert.severity = 'critical'
            alert.title = f"[ESCALATED] {alert.title}"
            alert.description = f"{alert.description}\n\n**This alert has been escalated due to prolonged inactivity.**"
            alert.save()
            
            # Send escalation notification
            process_alert_notifications.delay(str(alert.id))
            
            logger.info(f"Alert {alert.alert_id} escalated to critical")
        
    except Exception as e:
        logger.error(f"Error escalating alert {alert.alert_id}: {str(e)}")


@shared_task
def calculate_alert_statistics(project_id, model_id=None):
    """Calculate alert statistics for reporting."""
    try:
        now = datetime.utcnow()
        
        # Calculate statistics for different time windows
        windows = [60, 360, 1440]  # 1 hour, 6 hours, 24 hours
        
        for window_minutes in windows:
            window_start = now - timedelta(minutes=window_minutes)
            
            # Get alerts in window
            alerts = Alert.objects(
                project_id=project_id,
                model_id=model_id,
                created_at__gte=window_start,
                created_at__lte=now
            )
            
            total_alerts = alerts.count()
            
            if total_alerts == 0:
                continue
            
            # Calculate counts by status
            active_alerts = alerts(status='active', is_suppressed=False).count()
            resolved_alerts = alerts(status='resolved').count()
            acknowledged_alerts = alerts(status='acknowledged').count()
            
            # Count by severity
            alerts_by_severity = {}
            for severity in ['low', 'medium', 'high', 'critical']:
                count = alerts(severity=severity).count()
                alerts_by_severity[severity] = count
            
            # Count by type
            alerts_by_type = {}
            alert_types = ['trust_score', 'fairness', 'drift', 'robustness', 'explainability']
            for alert_type in alert_types:
                count = alerts(alert_type=alert_type).count()
                alerts_by_type[alert_type] = count
            
            # Calculate resolution metrics
            resolved_alerts_query = alerts(status='resolved')
            resolution_times = []
            
            for alert in resolved_alerts_query:
                if alert.created_at and alert.resolved_at:
                    resolution_time = (alert.resolved_at - alert.created_at).total_seconds() / 60
                    resolution_times.append(resolution_time)
            
            avg_resolution_time = sum(resolution_times) / len(resolution_times) if resolution_times else 0
            resolution_rate = resolved_alerts.count() / total_alerts if total_alerts > 0 else 0
            
            # Count notifications
            notifications_sent = AlertNotification.objects(
                alert_id__in=[str(a.id) for a in alerts],
                status='sent'
            ).count()
            
            notifications_failed = AlertNotification.objects(
                alert_id__in=[str(a.id) for a in alerts],
                status='failed'
            ).count()
            
            # Create or update statistics record
            stats = AlertStatistics.objects(
                project_id=project_id,
                model_id=model_id,
                timestamp=now,
                window_minutes=window_minutes
            ).modify(
                upsert=True,
                new=True,
                set__total_alerts=total_alerts,
                set__active_alerts=active_alerts,
                set__resolved_alerts=resolved_alerts,
                set__acknowledged_alerts=acknowledged_alerts,
                set__alerts_by_severity=alerts_by_severity,
                set__alerts_by_type=alerts_by_type,
                set__avg_resolution_time_minutes=avg_resolution_time,
                set__resolution_rate=resolution_rate,
                set__notifications_sent=notifications_sent,
                set__notifications_failed=notifications_failed
            )
        
        logger.info(f"Alert statistics calculated for project {project_id}")
        
    except Exception as e:
        logger.error(f"Error calculating alert statistics for project {project_id}: {str(e)}")


@shared_task
def cleanup_old_alerts():
    """Clean up old resolved alerts."""
    try:
        # Delete alerts older than 90 days
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        
        old_alerts = Alert.objects(
            status='resolved',
            resolved_at__lt=cutoff_date
        )
        
        count = old_alerts.count()
        if count > 0:
            old_alerts.delete()
            logger.info(f"Cleaned up {count} old resolved alerts")
        
    except Exception as e:
        logger.error(f"Error in cleanup_old_alerts: {str(e)}")


def get_severity_color(severity):
    """Get color for alert severity."""
    colors = {
        'low': '#28a745',      # Green
        'medium': '#ffc107',   # Yellow
        'high': '#fd7e14',     # Orange
        'critical': '#dc3545'  # Red
    }
    return colors.get(severity, '#6c757d')  # Gray default


@shared_task
def trigger_trust_score_alert(trust_score_id):
    """Trigger alert for low trust score."""
    try:
        trust_score = TrustScore.objects.get(id=trust_score_id)
        
        if not trust_score.alert_triggered:
            return
        
        # Create alert
        alert = Alert(
            project_id=trust_score.project_id,
            model_id=trust_score.model_id,
            alert_id=str(uuid.uuid4()),
            title=f"Low Trust Score Alert",
            description=f"Trust score has dropped to {trust_score.score:.3f}, below threshold of {trust_score.threshold:.3f}",
            alert_type='trust_score',
            severity='high' if trust_score.score < 0.5 else 'medium',
            metric_value=trust_score.score,
            threshold=trust_score.threshold,
            context={
                'trust_score_id': trust_score_id,
                'components': trust_score.components,
                'trend_direction': trust_score.trend_direction
            },
            source='trust_score_evaluation'
        )
        alert.save()
        
        # Process notifications
        process_alert_notifications.delay(str(alert.id))
        
        logger.info(f"Trust score alert created: {alert.alert_id}")
        
    except Exception as e:
        logger.error(f"Error triggering trust score alert: {str(e)}")
