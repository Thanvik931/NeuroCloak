from django.urls import path
from .views import (
    PredictionIngestionView, CSVUploadView, GroundTruthUpdateView,
    PredictionQueryView, FeatureImportanceView, IngestionBatchView,
    ModelIngestionStatsView, trigger_metrics_calculation
)

urlpatterns = [
    path('predictions/', PredictionIngestionView.as_view(), name='prediction_ingestion'),
    path('predictions/upload/', CSVUploadView.as_view(), name='csv_upload'),
    path('predictions/query/', PredictionQueryView.as_view(), name='prediction_query'),
    path('predictions/ground-truth/', GroundTruthUpdateView.as_view(), name='ground_truth_update'),
    path('feature-importance/', FeatureImportanceView.as_view(), name='feature_importance'),
    path('batches/', IngestionBatchView.as_view(), name='ingestion_batches'),
    path('stats/', ModelIngestionStatsView.as_view(), name='ingestion_stats'),
    path('metrics/trigger/', trigger_metrics_calculation, name='trigger_metrics'),
]
