// MongoDB initialization script
db = db.getSiblingDB('neurocloak');

// Create collections and indexes
db.createCollection('audit_logs');
db.audit_logs.createIndex({ "project_id": 1, "model_id": 1, "timestamp": -1 });
db.audit_logs.createIndex({ "user_id": 1, "timestamp": -1 });
db.audit_logs.createIndex({ "action": 1, "timestamp": -1 });
db.audit_logs.createIndex({ "resource_type": 1, "timestamp": -1 });
db.audit_logs.createIndex({ "compliance_category": 1, "timestamp": -1 });
db.audit_logs.createIndex({ "risk_level": 1, "timestamp": -1 });

db.createCollection('ingestion_batches');
db.ingestion_batches.createIndex({ "project_id": 1, "model_id": 1, "batch_id": 1 });
db.ingestion_batches.createIndex({ "status": 1, "created_at": -1 });

db.createCollection('predictions');
db.predictions.createIndex({ "project_id": 1, "model_id": 1, "prediction_id": 1 });
db.predictions.createIndex({ "timestamp": -1 });
db.predictions.createIndex({ "project_id": 1, "model_id": 1, "timestamp": -1 });

db.createCollection('feature_importance');
db.feature_importance.createIndex({ "project_id": 1, "model_id": 1, "prediction_id": 1 });
db.feature_importance.createIndex({ "method": 1, "timestamp": -1 });

db.createCollection('data_streams');
db.data_streams.createIndex({ "project_id": 1, "model_id": 1, "stream_type": 1 });
db.data_streams.createIndex({ "is_active": 1, "last_received_at": -1 });

db.createCollection('ingestion_metrics');
db.ingestion_metrics.createIndex({ "project_id": 1, "model_id": 1, "timestamp": -1 });
db.ingestion_metrics.createIndex({ "window_minutes": 1, "timestamp": -1 });

db.createCollection('data_quality_reports');
db.data_quality_reports.createIndex({ "project_id": 1, "model_id": 1, "report_type": 1 });
db.data_quality_reports.createIndex({ "timestamp": -1 });
db.data_quality_reports.createIndex({ "period_start": 1, "period_end": 1 });

db.createCollection('fairness_evaluations');
db.fairness_evaluations.createIndex({ "project_id": 1, "model_id": 1, "evaluation_id": 1 });
db.fairness_evaluations.createIndex({ "status": 1, "timestamp": -1 });
db.fairness_evaluations.createIndex({ "overall_fairness_score": -1, "timestamp": -1 });

db.createCollection('drift_evaluations');
db.drift_evaluations.createIndex({ "project_id": 1, "model_id": 1, "evaluation_id": 1 });
db.drift_evaluations.createIndex({ "status": 1, "timestamp": -1 });
db.drift_evaluations.createIndex({ "overall_drift_score": -1, "timestamp": -1 });

db.createCollection('robustness_evaluations');
db.robustness_evaluations.createIndex({ "project_id": 1, "model_id": 1, "evaluation_id": 1 });
db.robustness_evaluations.createIndex({ "status": 1, "timestamp": -1 });
db.robustness_evaluations.createIndex({ "overall_robustness_score": -1, "timestamp": -1 });

db.createCollection('explainability_evaluations');
db.explainability_evaluations.createIndex({ "project_id": 1, "model_id": 1, "evaluation_id": 1 });
db.explainability_evaluations.createIndex({ "method": 1, "status": 1, "timestamp": -1 });
db.explainability_evaluations.createIndex({ "overall_explainability_score": -1, "timestamp": -1 });

db.createCollection('trust_scores');
db.trust_scores.createIndex({ "project_id": 1, "model_id": 1, "timestamp": -1 });
db.trust_scores.createIndex({ "score": -1, "timestamp": -1 });
db.trust_scores.createIndex({ "alert_triggered": 1, "timestamp": -1 });

db.createCollection('evaluation_schedules');
db.evaluation_schedules.createIndex({ "project_id": 1, "model_id": 1, "evaluation_type": 1 });
db.evaluation_schedules.createIndex({ "is_active": 1, "next_run": -1 });

db.createCollection('evaluation_reports');
db.evaluation_reports.createIndex({ "project_id": 1, "model_id": 1, "report_id": 1 });
db.evaluation_reports.createIndex({ "report_type": 1, "status": 1, "created_at": -1 });

db.createCollection('alerts');
db.alerts.createIndex({ "project_id": 1, "model_id": 1, "alert_id": 1 });
db.alerts.createIndex({ "alert_type": 1, "severity": 1, "status": 1, "timestamp": -1 });
db.alerts.createIndex({ "is_suppressed": 1, "timestamp": -1 });

db.createCollection('alert_rule_configs');
db.alert_rule_configs.createIndex({ "project_id": 1, "model_id": 1, "alert_type": 1 });
db.alert_rule_configs.createIndex({ "is_active": 1, "last_triggered": -1 });

db.createCollection('alert_notifications');
db.alert_notifications.createIndex({ "alert_id": 1, "channel_type": 1 });
db.alert_notifications.createIndex({ "status": 1, "created_at": -1 });

db.createCollection('alert_dashboards');
db.alert_dashboards.createIndex({ "project_id": 1, "is_public": 1, "created_by": 1 });

db.createCollection('alert_statistics');
db.alert_statistics.createIndex({ "project_id": 1, "model_id": 1, "timestamp": -1 });
db.alert_statistics.createIndex({ "window_minutes": 1, "timestamp": -1 });

db.createCollection('compliance_reports');
db.compliance_reports.createIndex({ "project_id": 1, "report_id": 1, "report_type": 1 });
db.compliance_reports.createIndex({ "status": 1, "created_at": -1 });

db.createCollection('data_access_logs');
db.data_access_logs.createIndex({ "project_id": 1, "model_id": 1, "access_type": 1 });
db.data_access_logs.createIndex({ "user_id": 1, "timestamp": -1 });
db.data_access_logs.createIndex({ "resource_type": 1, "timestamp": -1 });
db.data_access_logs.createIndex({ "legal_basis": 1, "timestamp": -1 });

db.createCollection('security_events');
db.security_events.createIndex({ "project_id": 1, "event_type": 1, "severity": 1 });
db.security_events.createIndex({ "timestamp": -1 });
db.security_events.createIndex({ "investigation_status": 1, "timestamp": -1 });
db.security_events.createIndex({ "blocked": 1, "timestamp": -1 });

db.createCollection('retention_policies');
db.retention_policies.createIndex({ "project_id": 1, "resource_type": 1 });
db.retention_policies.createIndex({ "is_active": 1, "last_applied": -1 });

print('MongoDB collections and indexes created successfully');
