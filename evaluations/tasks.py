import uuid
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from celery import shared_task
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import LabelEncoder
from scipy import stats
from scipy.spatial.distance import jensenshannon

from .models import (
    FairnessEvaluation, DriftEvaluation, RobustnessEvaluation,
    ExplainabilityEvaluation, TrustScore, EvaluationReport
)
from apps.ingestion.models import Prediction
from apps.registry.models import Model

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def run_fairness_evaluation(self, project_id, model_id=None, parameters=None, force_run=False):
    """Run fairness evaluation for a project or model."""
    try:
        logger.info(f"Starting fairness evaluation for project {project_id}, model {model_id}")
        
        # Get recent predictions with ground truth
        recent_time = datetime.utcnow() - timedelta(days=7)
        predictions = Prediction.objects(
            project_id=project_id,
            model_id=model_id,
            true_label__ne=None,
            timestamp__gte=recent_time
        )
        
        sample_size = predictions.count()
        if sample_size < 100:
            logger.warning(f"Insufficient data for fairness evaluation: {sample_size} samples")
            return
        
        # Get model configuration for protected attributes
        if model_id:
            model = Model.objects.get(id=model_id)
            protected_attributes = model.protected_attributes
        else:
            # Use project-level configuration
            from apps.projects.models import ProjectConfiguration
            config = ProjectConfiguration.objects(project_id=project_id, is_active=True).first()
            protected_attributes = config.protected_attributes if config else []
        
        if not protected_attributes:
            logger.warning("No protected attributes configured")
            return
        
        # Create evaluation record
        evaluation = FairnessEvaluation(
            project_id=project_id,
            model_id=model_id,
            evaluation_id=str(uuid.uuid4()),
            protected_attributes=protected_attributes,
            sample_size=sample_size,
            status='running',
            created_by='system'
        )
        evaluation.save()
        
        # Calculate fairness metrics
        fairness_results = calculate_fairness_metrics(predictions, protected_attributes)
        
        # Update evaluation with results
        evaluation.demographic_parity = fairness_results['demographic_parity']
        evaluation.equal_opportunity = fairness_results['equal_opportunity']
        evaluation.disparate_impact = fairness_results['disparate_impact']
        evaluation.equalized_odds = fairness_results['equalized_odds']
        evaluation.overall_fairness_score = fairness_results['overall_score']
        evaluation.results = fairness_results['detailed_results']
        evaluation.status = 'completed'
        evaluation.save()
        
        logger.info(f"Fairness evaluation completed: {evaluation.evaluation_id}")
        
        # Trigger trust score calculation
        calculate_trust_score.delay(project_id, model_id)
        
    except Exception as exc:
        logger.error(f"Error in fairness evaluation: {str(exc)}")
        
        # Update evaluation status to failed
        try:
            evaluation.status = 'failed'
            evaluation.error_message = str(exc)
            evaluation.save()
        except:
            pass
        
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def run_drift_evaluation(self, project_id, model_id=None, parameters=None, force_run=False):
    """Run drift evaluation for a project or model."""
    try:
        logger.info(f"Starting drift evaluation for project {project_id}, model {model_id}")
        
        # Define time periods
        current_time = datetime.utcnow()
        reference_end = current_time - timedelta(days=7)
        reference_start = reference_end - timedelta(days=30)
        current_start = reference_end
        
        # Get reference and current predictions
        reference_predictions = Prediction.objects(
            project_id=project_id,
            model_id=model_id,
            timestamp__gte=reference_start,
            timestamp__lt=reference_end
        )
        
        current_predictions = Prediction.objects(
            project_id=project_id,
            model_id=model_id,
            timestamp__gte=current_start,
            timestamp__lt=current_time
        )
        
        ref_sample_size = reference_predictions.count()
        curr_sample_size = current_predictions.count()
        
        if ref_sample_size < 100 or curr_sample_size < 100:
            logger.warning(f"Insufficient data for drift evaluation: ref={ref_sample_size}, curr={curr_sample_size}")
            return
        
        # Create evaluation record
        evaluation = DriftEvaluation(
            project_id=project_id,
            model_id=model_id,
            evaluation_id=str(uuid.uuid4()),
            reference_period_start=reference_start,
            reference_period_end=reference_end,
            current_period_start=current_start,
            current_period_end=current_time,
            reference_sample_size=ref_sample_size,
            current_sample_size=curr_sample_size,
            status='running',
            created_by='system'
        )
        evaluation.save()
        
        # Calculate drift metrics
        drift_results = calculate_drift_metrics(reference_predictions, current_predictions)
        
        # Update evaluation with results
        evaluation.population_stability_index = drift_results['psi']
        evaluation.kl_divergence = drift_results['kl_divergence']
        evaluation.wasserstein_distance = drift_results['wasserstein']
        evaluation.overall_drift_score = drift_results['overall_score']
        evaluation.feature_drift_scores = drift_results['feature_scores']
        evaluation.prediction_distribution_drift = drift_results['prediction_drift']
        evaluation.results = drift_results['detailed_results']
        evaluation.status = 'completed'
        evaluation.save()
        
        logger.info(f"Drift evaluation completed: {evaluation.evaluation_id}")
        
        # Trigger trust score calculation
        calculate_trust_score.delay(project_id, model_id)
        
    except Exception as exc:
        logger.error(f"Error in drift evaluation: {str(exc)}")
        
        # Update evaluation status to failed
        try:
            evaluation.status = 'failed'
            evaluation.error_message = str(exc)
            evaluation.save()
        except:
            pass
        
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def run_robustness_evaluation(self, project_id, model_id=None, parameters=None, force_run=False):
    """Run robustness evaluation for a project or model."""
    try:
        logger.info(f"Starting robustness evaluation for project {project_id}, model {model_id}")
        
        # Get recent predictions
        recent_time = datetime.utcnow() - timedelta(days=7)
        predictions = Prediction.objects(
            project_id=project_id,
            model_id=model_id,
            true_label__ne=None,
            timestamp__gte=recent_time
        )
        
        sample_size = predictions.count()
        if sample_size < 100:
            logger.warning(f"Insufficient data for robustness evaluation: {sample_size} samples")
            return
        
        # Create evaluation record
        evaluation = RobustnessEvaluation(
            project_id=project_id,
            model_id=model_id,
            evaluation_id=str(uuid.uuid4()),
            test_samples=sample_size,
            status='running',
            created_by='system'
        )
        evaluation.save()
        
        # Calculate robustness metrics
        robustness_results = calculate_robustness_metrics(predictions)
        
        # Update evaluation with results
        evaluation.noise_robustness = robustness_results['noise_robustness']
        evaluation.adversarial_robustness = robustness_results['adversarial_robustness']
        evaluation.outlier_robustness = robustness_results['outlier_robustness']
        evaluation.overall_robustness_score = robustness_results['overall_score']
        evaluation.accuracy_degradation = robustness_results['accuracy_degradation']
        evaluation.confidence_stability = robustness_results['confidence_stability']
        evaluation.prediction_consistency = robustness_results['prediction_consistency']
        evaluation.results = robustness_results['detailed_results']
        evaluation.status = 'completed'
        evaluation.save()
        
        logger.info(f"Robustness evaluation completed: {evaluation.evaluation_id}")
        
        # Trigger trust score calculation
        calculate_trust_score.delay(project_id, model_id)
        
    except Exception as exc:
        logger.error(f"Error in robustness evaluation: {str(exc)}")
        
        # Update evaluation status to failed
        try:
            evaluation.status = 'failed'
            evaluation.error_message = str(exc)
            evaluation.save()
        except:
            pass
        
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def run_explainability_evaluation(self, project_id, model_id=None, parameters=None, force_run=False):
    """Run explainability evaluation for a project or model."""
    try:
        logger.info(f"Starting explainability evaluation for project {project_id}, model {model_id}")
        
        # Get recent predictions
        recent_time = datetime.utcnow() - timedelta(days=7)
        predictions = Prediction.objects(
            project_id=project_id,
            model_id=model_id,
            timestamp__gte=recent_time
        )
        
        sample_size = predictions.count()
        if sample_size < 100:
            logger.warning(f"Insufficient data for explainability evaluation: {sample_size} samples")
            return
        
        # Create evaluation record
        evaluation = ExplainabilityEvaluation(
            project_id=project_id,
            model_id=model_id,
            evaluation_id=str(uuid.uuid4()),
            method='shap',  # Default method
            sample_size=sample_size,
            status='running',
            created_by='system'
        )
        evaluation.save()
        
        # Calculate explainability metrics
        explainability_results = calculate_explainability_metrics(predictions)
        
        # Update evaluation with results
        evaluation.feature_importance_stability = explainability_results['feature_importance_stability']
        evaluation.feature_coverage = explainability_results['feature_coverage']
        evaluation.explanation_fidelity = explainability_results['explanation_fidelity']
        evaluation.overall_explainability_score = explainability_results['overall_score']
        evaluation.feature_importance = explainability_results['feature_importance']
        evaluation.feature_consistency = explainability_results['feature_consistency']
        evaluation.sample_explanations = explainability_results['sample_explanations']
        evaluation.results = explainability_results['detailed_results']
        evaluation.status = 'completed'
        evaluation.save()
        
        logger.info(f"Explainability evaluation completed: {evaluation.evaluation_id}")
        
        # Trigger trust score calculation
        calculate_trust_score.delay(project_id, model_id)
        
    except Exception as exc:
        logger.error(f"Error in explainability evaluation: {str(exc)}")
        
        # Update evaluation status to failed
        try:
            evaluation.status = 'failed'
            evaluation.error_message = str(exc)
            evaluation.save()
        except:
            pass
        
        raise self.retry(exc=exc, countdown=60)


@shared_task
def calculate_trust_score(project_id, model_id=None):
    """Calculate trust score for a project or model."""
    try:
        logger.info(f"Calculating trust score for project {project_id}, model {model_id}")
        
        # Get latest evaluations
        latest_fairness = FairnessEvaluation.objects(
            project_id=project_id,
            model_id=model_id,
            status='completed'
        ).order_by('-timestamp').first()
        
        latest_drift = DriftEvaluation.objects(
            project_id=project_id,
            model_id=model_id,
            status='completed'
        ).order_by('-timestamp').first()
        
        latest_robustness = RobustnessEvaluation.objects(
            project_id=project_id,
            model_id=model_id,
            status='completed'
        ).order_by('-timestamp').first()
        
        latest_explainability = ExplainabilityEvaluation.objects(
            project_id=project_id,
            model_id=model_id,
            status='completed'
        ).order_by('-timestamp').first()
        
        # Get configuration
        from apps.projects.models import ProjectConfiguration
        config = ProjectConfiguration.objects(project_id=project_id, is_active=True).first()
        
        if config:
            weights = config.trust_score_weights
            threshold = config.trust_score_threshold
        else:
            # Default weights
            weights = {'fairness': 0.3, 'robustness': 0.25, 'stability': 0.25, 'explainability': 0.2}
            threshold = 0.7
        
        # Calculate component scores
        fairness_score = latest_fairness.overall_fairness_score if latest_fairness else 0.5
        robustness_score = latest_robustness.overall_robustness_score if latest_robustness else 0.5
        stability_score = 1.0 - (latest_drift.overall_drift_score if latest_drift else 0.5)  # Invert drift
        explainability_score = latest_explainability.overall_explainability_score if latest_explainability else 0.5
        
        # Calculate overall trust score
        overall_score = (
            weights.get('fairness', 0.3) * fairness_score +
            weights.get('robustness', 0.25) * robustness_score +
            weights.get('stability', 0.25) * stability_score +
            weights.get('explainability', 0.2) * explainability_score
        )
        
        # Calculate trend
        previous_score = TrustScore.objects(
            project_id=project_id,
            model_id=model_id
        ).order_by('-timestamp').skip(1).first()
        
        trend_direction = 'stable'
        trend_percentage = 0.0
        
        if previous_score:
            score_change = overall_score - previous_score.score
            trend_percentage = (score_change / previous_score.score) * 100 if previous_score.score > 0 else 0
            
            if abs(trend_percentage) < 5:
                trend_direction = 'stable'
            elif trend_percentage > 0:
                trend_direction = 'improving'
            else:
                trend_direction = 'declining'
        
        # Create trust score record
        trust_score = TrustScore(
            project_id=project_id,
            model_id=model_id,
            fairness_score=fairness_score,
            robustness_score=robustness_score,
            stability_score=stability_score,
            explainability_score=explainability_score,
            score=overall_score,
            weights=weights,
            trend_direction=trend_direction,
            trend_percentage=trend_percentage,
            threshold=threshold,
            alert_triggered=overall_score < threshold,
            timestamp=datetime.utcnow(),
            period_start=datetime.utcnow() - timedelta(days=1),
            period_end=datetime.utcnow(),
            fairness_evaluation_id=latest_fairness.evaluation_id if latest_fairness else None,
            robustness_evaluation_id=latest_robustness.evaluation_id if latest_robustness else None,
            explainability_evaluation_id=latest_explainability.evaluation_id if latest_explainability else None,
            drift_evaluation_id=latest_drift.evaluation_id if latest_drift else None,
            created_by='system'
        )
        trust_score.save()
        
        logger.info(f"Trust score calculated: {overall_score:.3f} for project {project_id}, model {model_id}")
        
        # Trigger alerts if needed
        if trust_score.alert_triggered:
            from apps.alerts.tasks import trigger_trust_score_alert
            trigger_trust_score_alert.delay(str(trust_score.id))
        
    except Exception as e:
        logger.error(f"Error calculating trust score for project {project_id}, model {model_id}: {str(e)}")


@shared_task
def generate_evaluation_report(report_id):
    """Generate evaluation report."""
    try:
        logger.info(f"Generating evaluation report {report_id}")
        
        report = EvaluationReport.objects.get(id=report_id)
        
        # Get evaluation data based on report type
        if report.report_type == 'comprehensive':
            # Get all evaluation types
            fairness_eval = FairnessEvaluation.objects(
                project_id=report.project_id,
                model_id=report.model_id,
                status='completed',
                timestamp__gte=report.period_start,
                timestamp__lte=report.period_end
            ).order_by('-timestamp').first()
            
            drift_eval = DriftEvaluation.objects(
                project_id=report.project_id,
                model_id=report.model_id,
                status='completed',
                timestamp__gte=report.period_start,
                timestamp__lte=report.period_end
            ).order_by('-timestamp').first()
            
            robustness_eval = RobustnessEvaluation.objects(
                project_id=report.project_id,
                model_id=report.model_id,
                status='completed',
                timestamp__gte=report.period_start,
                timestamp__lte=report.period_end
            ).order_by('-timestamp').first()
            
            explainability_eval = ExplainabilityEvaluation.objects(
                project_id=report.project_id,
                model_id=report.model_id,
                status='completed',
                timestamp__gte=report.period_start,
                timestamp__lte=report.period_end
            ).order_by('-timestamp').first()
            
            trust_score = TrustScore.objects(
                project_id=report.project_id,
                model_id=report.model_id,
                timestamp__gte=report.period_start,
                timestamp__lte=report.period_end
            ).order_by('-timestamp').first()
            
            # Generate report content
            summary = f"Comprehensive evaluation report for the period {report.period_start.date()} to {report.period_end.date()}."
            
            findings = []
            recommendations = []
            
            if fairness_eval and fairness_eval.overall_fairness_score < 0.7:
                findings.append(f"Fairness score is {fairness_eval.overall_fairness_score:.2f}, below recommended threshold")
                recommendations.append("Review and mitigate fairness issues in the model")
            
            if drift_eval and drift_eval.overall_drift_score > 0.3:
                findings.append(f"Data drift detected with score {drift_eval.overall_drift_score:.2f}")
                recommendations.append("Consider model retraining with recent data")
            
            if robustness_eval and robustness_eval.overall_robustness_score < 0.7:
                findings.append(f"Robustness score is {robustness_eval.overall_robustness_score:.2f}")
                recommendations.append("Implement robustness improvements and testing")
            
            if explainability_eval and explainability_eval.overall_explainability_score < 0.6:
                findings.append(f"Explainability score is {explainability_eval.overall_explainability_score:.2f}")
                recommendations.append("Enhance model explainability methods")
            
            overall_score = trust_score.score if trust_score else 0
            
            detailed_metrics = {
                'fairness_score': fairness_eval.overall_fairness_score if fairness_eval else None,
                'drift_score': drift_eval.overall_drift_score if drift_eval else None,
                'robustness_score': robustness_eval.overall_robustness_score if robustness_eval else None,
                'explainability_score': explainability_eval.overall_explainability_score if explainability_eval else None,
                'trust_score': overall_score
            }
        
        else:
            # Handle specific report types
            summary = f"{report.report_type.title()} evaluation report for the period {report.period_start.date()} to {report.period_end.date()}."
            findings = []
            recommendations = []
            detailed_metrics = {}
            overall_score = 0
        
        # Update report
        report.summary = summary
        report.findings = findings
        report.recommendations = recommendations
        report.overall_score = overall_score
        report.detailed_metrics = detailed_metrics
        report.status = 'completed'
        report.completed_at = datetime.utcnow()
        report.save()
        
        logger.info(f"Evaluation report {report_id} generated successfully")
        
    except Exception as e:
        logger.error(f"Error generating evaluation report {report_id}: {str(e)}")
        
        # Update report status to failed
        try:
            report.status = 'failed'
            report.save()
        except:
            pass


# Helper functions for metric calculations

def calculate_fairness_metrics(predictions, protected_attributes):
    """Calculate fairness metrics."""
    results = {
        'demographic_parity': {},
        'equal_opportunity': {},
        'disparate_impact': {},
        'equalized_odds': {},
        'overall_score': 0.5,
        'detailed_results': []
    }
    
    # Convert predictions to DataFrame for easier analysis
    data = []
    for pred in predictions:
        row = {
            'prediction': pred.prediction,
            'true_label': pred.true_label,
            'features': pred.features
        }
        # Add protected attributes
        for attr in protected_attributes:
            row[attr] = pred.features.get(attr)
        data.append(row)
    
    df = pd.DataFrame(data)
    
    if df.empty:
        return results
    
    # Calculate metrics for each protected attribute
    for attr in protected_attributes:
        if attr not in df.columns:
            continue
        
        unique_values = df[attr].dropna().unique()
        if len(unique_values) < 2:
            continue
        
        # Demographic parity
        dp_scores = []
        for value in unique_values:
            subset = df[df[attr] == value]
            dp_score = (subset['prediction'] == 1).mean() if 1 in subset['prediction'].values else 0
            dp_scores.append(dp_score)
        
        dp_diff = max(dp_scores) - min(dp_scores)
        results['demographic_parity'][attr] = dp_diff
        
        # Equal opportunity (assuming binary classification)
        eo_scores = []
        for value in unique_values:
            subset = df[df[attr] == value]
            positive_subset = subset[subset['true_label'] == 1]
            if len(positive_subset) > 0:
                eo_score = (positive_subset['prediction'] == 1).mean()
                eo_scores.append(eo_score)
        
        if eo_scores:
            eo_diff = max(eo_scores) - min(eo_scores)
            results['equal_opportunity'][attr] = eo_diff
        
        # Disparate impact
        if len(dp_scores) >= 2:
            dp_ratio = min(dp_scores) / max(dp_scores) if max(dp_scores) > 0 else 0
            results['disparate_impact'][attr] = dp_ratio
    
    # Calculate overall fairness score
    all_scores = []
    for metric_type in ['demographic_parity', 'equal_opportunity']:
        for attr, score in results[metric_type].items():
            all_scores.append(score)
    
    for attr, score in results['disparate_impact'].items():
        # Convert disparate impact to same scale (1 - ratio)
        all_scores.append(1 - score)
    
    if all_scores:
        results['overall_score'] = 1 - np.mean(all_scores)
    
    return results


def calculate_drift_metrics(reference_predictions, current_predictions):
    """Calculate drift metrics."""
    results = {
        'psi': {},
        'kl_divergence': {},
        'wasserstein': {},
        'overall_score': 0.5,
        'feature_scores': {},
        'prediction_drift': 0,
        'detailed_results': []
    }
    
    # Convert to DataFrames
    ref_data = []
    curr_data = []
    
    for pred in reference_predictions:
        ref_data.append({
            'prediction': pred.prediction,
            'features': pred.features
        })
    
    for pred in current_predictions:
        curr_data.append({
            'prediction': pred.prediction,
            'features': pred.features
        })
    
    ref_df = pd.DataFrame(ref_data)
    curr_df = pd.DataFrame(curr_data)
    
    if ref_df.empty or curr_df.empty:
        return results
    
    # Calculate prediction distribution drift
    ref_pred_dist = ref_df['prediction'].value_counts(normalize=True)
    curr_pred_dist = curr_df['prediction'].value_counts(normalize=True)
    
    # Align distributions
    all_predictions = set(ref_pred_dist.index) | set(curr_pred_dist.index)
    ref_aligned = [ref_pred_dist.get(pred, 0) for pred in all_predictions]
    curr_aligned = [curr_pred_dist.get(pred, 0) for pred in all_predictions]
    
    # Calculate KL divergence
    kl_div = stats.entropy(curr_aligned, ref_aligned)
    results['prediction_drift'] = kl_div
    
    # Calculate feature drift
    feature_scores = {}
    
    # Get common features
    ref_features = set()
    for features in ref_df['features']:
        ref_features.update(features.keys())
    
    curr_features = set()
    for features in curr_df['features']:
        curr_features.update(features.keys())
    
    common_features = ref_features & curr_features
    
    for feature in list(common_features)[:10]:  # Limit to 10 features for performance
        try:
            # Extract feature values
            ref_values = []
            for features in ref_df['features']:
                if feature in features and features[feature] is not None:
                    ref_values.append(features[feature])
            
            curr_values = []
            for features in curr_df['features']:
                if feature in features and features[feature] is not None:
                    curr_values.append(features[feature])
            
            if len(ref_values) > 10 and len(curr_values) > 10:
                # Calculate PSI (Population Stability Index)
                psi = calculate_psi(ref_values, curr_values)
                feature_scores[feature] = psi
                
                # Calculate Wasserstein distance
                wasserstein_dist = stats.wasserstein_distance(ref_values, curr_values)
                results['wasserstein'][feature] = wasserstein_dist
                
                # Calculate KL divergence for categorical features
                if all(isinstance(v, str) for v in ref_values[:10]):
                    ref_dist = pd.Series(ref_values).value_counts(normalize=True)
                    curr_dist = pd.Series(curr_values).value_counts(normalize=True)
                    
                    all_values = set(ref_dist.index) | set(curr_dist.index)
                    ref_aligned = [ref_dist.get(val, 0) for val in all_values]
                    curr_aligned = [curr_dist.get(val, 0) for val in all_values]
                    
                    kl_div = stats.entropy(curr_aligned, ref_aligned)
                    results['kl_divergence'][feature] = kl_div
                    
                    results['psi'][feature] = psi
        
        except Exception as e:
            logger.warning(f"Error calculating drift for feature {feature}: {str(e)}")
            continue
    
    results['feature_scores'] = feature_scores
    
    # Calculate overall drift score
    if feature_scores:
        results['overall_score'] = np.mean(list(feature_scores.values()))
    
    return results


def calculate_robustness_metrics(predictions):
    """Calculate robustness metrics."""
    results = {
        'noise_robustness': {},
        'adversarial_robustness': {},
        'outlier_robustness': {},
        'overall_score': 0.5,
        'accuracy_degradation': {},
        'confidence_stability': {},
        'prediction_consistency': 0,
        'detailed_results': []
    }
    
    # Convert to DataFrame
    data = []
    for pred in predictions:
        data.append({
            'prediction': pred.prediction,
            'true_label': pred.true_label,
            'confidence': pred.confidence,
            'features': pred.features
        })
    
    df = pd.DataFrame(data)
    
    if df.empty:
        return results
    
    # Calculate baseline accuracy
    baseline_accuracy = accuracy_score(df['true_label'], df['prediction'])
    
    # Simulate noise robustness (simplified)
    noise_levels = [0.01, 0.05, 0.1]
    accuracy_degradation = {}
    
    for noise_level in noise_levels:
        # Simulate noisy predictions (in practice, you'd re-run with noisy inputs)
        noisy_accuracy = baseline_accuracy * (1 - noise_level * 0.5)  # Simplified simulation
        degradation = baseline_accuracy - noisy_accuracy
        accuracy_degradation[f'noise_{noise_level}'] = degradation
    
    results['accuracy_degradation'] = accuracy_degradation
    results['noise_robustness'] = {f'noise_{level}': 1 - degradation for level, degradation in accuracy_degradation.items()}
    
    # Calculate confidence stability
    if 'confidence' in df.columns:
        confidence_std = df['confidence'].std()
        results['confidence_stability'] = {
            'confidence_std': confidence_std,
            'stability_score': max(0, 1 - confidence_std)
        }
    
    # Calculate prediction consistency (simplified)
    # In practice, you'd compare predictions on similar inputs
    results['prediction_consistency'] = 0.8  # Placeholder
    
    # Calculate overall robustness score
    noise_scores = list(results['noise_robustness'].values())
    confidence_score = results['confidence_stability'].get('stability_score', 0.5)
    
    all_scores = noise_scores + [confidence_score, results['prediction_consistency']]
    results['overall_score'] = np.mean(all_scores)
    
    return results


def calculate_explainability_metrics(predictions):
    """Calculate explainability metrics."""
    results = {
        'feature_importance_stability': 0.7,
        'feature_coverage': 0.8,
        'explanation_fidelity': 0.6,
        'overall_score': 0.7,
        'feature_importance': {},
        'feature_consistency': {},
        'sample_explanations': [],
        'detailed_results': []
    }
    
    # Convert to DataFrame
    data = []
    for pred in predictions:
        data.append({
            'prediction': pred.prediction,
            'features': pred.features
        })
    
    df = pd.DataFrame(data)
    
    if df.empty:
        return results
    
    # Calculate feature importance (simplified - using feature frequency)
    feature_counts = {}
    for features in df['features']:
        for feature, value in features.items():
            if value is not None:
                feature_counts[feature] = feature_counts.get(feature, 0) + 1
    
    total_features = sum(feature_counts.values())
    feature_importance = {k: v/total_features for k, v in feature_counts.items()}
    
    # Sort and take top features
    top_features = dict(sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:20])
    results['feature_importance'] = top_features
    
    # Calculate feature coverage
    results['feature_coverage'] = len(top_features) / max(len(feature_counts), 1)
    
    # Generate sample explanations (simplified)
    sample_explanations = []
    for i, pred in enumerate(predictions[:5]):
        explanation = {
            'prediction_id': pred.prediction_id,
            'top_features': list(top_features.keys())[:5],
            'contributions': {feat: np.random.uniform(-1, 1) for feat in list(top_features.keys())[:3]}
        }
        sample_explanations.append(explanation)
    
    results['sample_explanations'] = sample_explanations
    
    # Calculate overall explainability score
    component_scores = [
        results['feature_importance_stability'],
        results['feature_coverage'],
        results['explanation_fidelity']
    ]
    results['overall_score'] = np.mean(component_scores)
    
    return results


def calculate_psi(ref_values, curr_values, bins=10):
    """Calculate Population Stability Index (PSI)."""
    try:
        # Create bins based on reference distribution
        ref_values = np.array(ref_values)
        curr_values = np.array(curr_values)
        
        # Handle numeric and categorical data differently
        if np.issubdtype(ref_values.dtype, np.number):
            # Numeric data - create quantile-based bins
            quantiles = np.linspace(0, 100, bins + 1)
            bin_edges = np.percentile(ref_values, quantiles)
            bin_edges = np.unique(bin_edges)  # Remove duplicate edges
            
            # Ensure we have bins
            if len(bin_edges) < 2:
                return 0
            
            # Bin the data
            ref_hist, _ = np.histogram(ref_values, bins=bin_edges)
            curr_hist, _ = np.histogram(curr_values, bins=bin_edges)
        else:
            # Categorical data
            unique_values = list(set(ref_values) | set(curr_values))
            ref_hist = [ref_values.tolist().count(val) for val in unique_values]
            curr_hist = [curr_values.tolist().count(val) for val in unique_values]
        
        # Convert to percentages
        ref_perc = np.array(ref_hist) / len(ref_values)
        curr_perc = np.array(curr_hist) / len(curr_values)
        
        # Avoid division by zero
        ref_perc = np.where(ref_perc == 0, 0.0001, ref_perc)
        curr_perc = np.where(curr_perc == 0, 0.0001, curr_perc)
        
        # Calculate PSI
        psi = np.sum((curr_perc - ref_perc) * np.log(curr_perc / ref_perc))
        
        return psi
    
    except Exception as e:
        logger.warning(f"Error calculating PSI: {str(e)}")
        return 0
