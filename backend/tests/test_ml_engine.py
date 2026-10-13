"""Tests for Real ML Engine inference, feature attributions, and AutoRepair calibration."""

import pytest
from services import real_ml_engine as real_ml
from services.cdt_simulator import cdt_simulate


def test_real_models_loaded():
    """All domain ML models and metadata must be loaded and operational."""
    domains = ["finance", "healthcare", "industrial"]
    for d in domains:
        pipeline = real_ml.get_model(d)
        assert pipeline is not None, f"Model pipeline for domain {d} failed to load"
        assert hasattr(pipeline, "predict_proba") or hasattr(pipeline, "predict")
        assert hasattr(pipeline, "named_steps") or hasattr(pipeline, "steps")


def test_predict_probability_finance():
    """Finance loan risk model returns valid calibrated probabilities and imputations."""
    sample_features = {
        "age": 45,
        "credit_amount": 5000,
        "duration_months": 24,
        "checking_account_status": "good",
    }
    prob, raw_pred, imputed = real_ml.predict_probability("finance", sample_features)
    assert isinstance(prob, float)
    assert 0.0 <= prob <= 1.0
    assert raw_pred in (0, 1)
    assert "age_years" in imputed
    assert imputed["age_years"] == 45


def test_predict_probability_healthcare():
    """Healthcare triage model returns valid clinical risk probabilities."""
    sample_features = {
        "patient_age": 62,
        "symptom_severity": 8,
        "historical_risk": 0.85,
    }
    prob, raw_pred, imputed = real_ml.predict_probability("healthcare", sample_features)
    assert isinstance(prob, float)
    assert 0.0 <= prob <= 1.0
    assert raw_pred in (0, 1)


def test_compute_feature_attributions():
    """Feature attributions compute deterministic marginal impacts with labels."""
    sample_features = {
        "age": 22,
        "credit_amount": 12000,
        "duration_months": 48,
        "foreign_worker": "yes",
    }
    attrs = real_ml.compute_feature_attributions("finance", sample_features)
    assert isinstance(attrs, list)
    assert len(attrs) > 0
    first = attrs[0]
    assert "feature" in first
    assert "label" in first
    assert "impact_pct" in first
    assert "delta" in first
    assert "description" in first


def test_cdt_autorepair_threshold_calibration():
    """AutoRepair dynamically recalibrates decision threshold for protected cohorts."""
    protected_input = {
        "age": 21,
        "foreign_worker": "yes",
        "credit_amount": 3500,
        "duration_months": 18,
        "_auto_repair_enabled": True,
        "_threshold_calibration": 0.50,
    }

    # Simulation with AutoRepair ON
    result_repaired = cdt_simulate("test-sys-01", "finance", protected_input)
    assert result_repaired["status"] in ("APPROVED", "FLAGGED", "BLOCKED")
    assert result_repaired["disparityReduction"] > 0.20  # +29.86% reduction

    # Check Metacognitive layer step in reasoning trace
    meta_step = next(s for s in result_repaired["reasoningTrace"] if s["layer"] == "metacognitive")
    assert "theta = 0.4910" in meta_step["description"] or "AutoRepair active" in meta_step["description"]

    # Simulation with AutoRepair OFF
    unrepaired_input = dict(protected_input)
    unrepaired_input["_auto_repair_enabled"] = False
    result_baseline = cdt_simulate("test-sys-01", "finance", unrepaired_input)
    assert result_baseline["disparityReduction"] == 0.0

    meta_baseline = next(s for s in result_baseline["reasoningTrace"] if s["layer"] == "metacognitive")
    assert "theta = 0.5000" in meta_baseline["description"]
