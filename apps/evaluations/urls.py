from django.urls import path
from .views import (
    EvaluationListView, TrustScoreView, TrustScoreTrendView,
    EvaluationScheduleView, EvaluationReportView,
    ModelEvaluationSummaryView, ProjectEvaluationSummaryView
)

urlpatterns = [
    path('', EvaluationListView.as_view(), name='evaluation_list'),
    path('trust-scores/', TrustScoreView.as_view(), name='trust_scores'),
    path('trust-scores/trend/', TrustScoreTrendView.as_view(), name='trust_score_trend'),
    path('schedules/', EvaluationScheduleView.as_view(), name='evaluation_schedules'),
    path('reports/', EvaluationReportView.as_view(), name='evaluation_reports'),
    path('summary/', ProjectEvaluationSummaryView.as_view(), name='project_evaluation_summary'),
    path('models/<uuid:model_id>/summary/', ModelEvaluationSummaryView.as_view(), name='model_evaluation_summary'),
]
