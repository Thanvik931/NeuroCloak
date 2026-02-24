from django.urls import path
from .views import (
    AuditLogListView, ComplianceReportListView, DataAccessLogListView,
    SecurityEventListView, RetentionPolicyListView, AuditSummaryView,
    DataAccessSummaryView, trigger_retention_policy, trigger_audit_statistics
)

urlpatterns = [
    path('logs/', AuditLogListView.as_view(), name='audit_logs'),
    path('logs/summary/', AuditSummaryView.as_view(), name='audit_summary'),
    path('compliance/', ComplianceReportListView.as_view(), name='compliance_reports'),
    path('data-access/', DataAccessLogListView.as_view(), name='data_access_logs'),
    path('data-access/summary/', DataAccessSummaryView.as_view(), name='data_access_summary'),
    path('security-events/', SecurityEventListView.as_view(), name='security_events'),
    path('retention/', RetentionPolicyListView.as_view(), name='retention_policies'),
    path('retention/trigger/', trigger_retention_policy, name='trigger_retention_policy'),
    path('statistics/trigger/', trigger_audit_statistics, name='trigger_audit_statistics'),
]
