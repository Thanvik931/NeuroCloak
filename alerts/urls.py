from django.urls import path
from .views import (
    AlertListView, AlertDetailView, AlertActionView, AlertRuleConfigListView,
    AlertRuleConfigDetailView, AlertNotificationView, AlertSummaryView,
    AlertTrendView, trigger_alert_processing, trigger_alert_statistics
)

urlpatterns = [
    path('', AlertListView.as_view(), name='alert_list'),
    path('<uuid:alert_id>/', AlertDetailView.as_view(), name='alert_detail'),
    path('<uuid:alert_id>/action/', AlertActionView.as_view(), name='alert_action'),
    path('<uuid:alert_id>/notifications/', AlertNotificationView.as_view(), name='alert_notifications'),
    path('rules/', AlertRuleConfigListView.as_view(), name='alert_rule_list'),
    path('rules/<uuid:rule_id>/', AlertRuleConfigDetailView.as_view(), name='alert_rule_detail'),
    path('summary/', AlertSummaryView.as_view(), name='alert_summary'),
    path('trends/', AlertTrendView.as_view(), name='alert_trends'),
    path('trigger/', trigger_alert_processing, name='trigger_alert_processing'),
    path('statistics/trigger/', trigger_alert_statistics, name='trigger_alert_statistics'),
]
