"""
Real ML Engine Service for NeuroCloak AI Governance.
Loads scikit-learn models (finance, healthcare, industrial) via joblib,
provides intelligent dynamic imputation for partial payloads,
and extracts directional feature attribution deltas.
"""

import os
import logging
from typing import Dict, Any, Tuple, List, Optional
import numpy as np
import pandas as pd
import joblib

logger = logging.getLogger("neurocloak.ml_engine")

# Schema defaults based on empirical dataset medians and modes
FINANCE_DEFAULTS = {
    "checking_account_status": "A14",
    "duration_months": 18.0,
    "credit_history": "A32",
    "purpose": "A43",
    "credit_amount": 2319.5,
    "savings_account": "A61",
    "employment_since": "A73",
    "installment_rate": 3.0,
    "personal_status_sex": "A93",
    "other_debtors": "A101",
    "residence_since": 3.0,
    "property": "A123",
    "age_years": 33.0,
    "other_installment_plans": "A143",
    "housing": "A152",
    "existing_credits": 1.0,
    "job": "A173",
    "people_liable": 1.0,
    "telephone": "A191",
    "foreign_worker": "A201",
    "age_group": 1.0,
}

HEALTHCARE_DEFAULTS = {
    "patient_age": 55.0,
    "symptom_severity": 4.0,
    "historical_risk": 0.35,
    "autonomy_consent_flag": 1.0,
}

INDUSTRIAL_DEFAULTS = {
    "sensor_temp": 85.0,
    "vibration_freq": 60.0,
    "pressure_psi": 120.0,
}

FINANCE_ALIASES = {
    "age": "age_years",
    "patient_age": "age_years",
    "amount": "credit_amount",
    "loan_amount": "credit_amount",
    "duration": "duration_months",
    "months": "duration_months",
    "checking_status": "checking_account_status",
    "checking_account": "checking_account_status",
    "checking": "checking_account_status",
    "savings": "savings_account",
    "savings_status": "savings_account",
    "employment": "employment_since",
    "sex": "personal_status_sex",
    "gender": "personal_status_sex",
    "foreign": "foreign_worker",
}

HEALTHCARE_ALIASES = {
    "age": "patient_age",
    "age_years": "patient_age",
    "severity": "symptom_severity",
    "symptoms": "symptom_severity",
    "risk": "historical_risk",
    "risk_score": "historical_risk",
    "consent": "autonomy_consent_flag",
    "consent_flag": "autonomy_consent_flag",
}

INDUSTRIAL_ALIASES = {
    "temp": "sensor_temp",
    "temperature": "sensor_temp",
    "vibration": "vibration_freq",
    "freq": "vibration_freq",
    "frequency": "vibration_freq",
    "pressure": "pressure_psi",
    "psi": "pressure_psi",
}

_MODELS_CACHE: Dict[str, Any] = {}


def _get_artifacts_dir() -> str:
    """Resolve directory containing .pkl model files."""
    candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "trained_models")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "dataset taken to train the model")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "dataset taken to train the model", "trained_models")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models")),
        os.path.abspath(os.path.join(os.getcwd(), "dataset taken to train the model")),
        os.path.abspath(os.path.join(os.getcwd(), "NeuroCloak-main", "dataset taken to train the model")),
    ]
    for c in candidates:
        if os.path.isdir(c):
            return c
    return candidates[0]


def load_model(domain: str) -> Optional[Any]:
    """Load and cache the trained pipeline for a given domain."""
    d = domain.lower().strip()
    if d in _MODELS_CACHE:
        return _MODELS_CACHE[d]

    model_files = {
        "finance": "finance_model.pkl",
        "healthcare": "healthcare_model.pkl",
        "industrial": "industrial_model.pkl",
    }

    if d not in model_files:
        return None

    filename = model_files[d]
    artifacts_dir = _get_artifacts_dir()
    filepath = os.path.join(artifacts_dir, filename)

    if not os.path.exists(filepath):
        logger.warning(f"Model file not found at {filepath}")
        return None

    try:
        model = joblib.load(filepath)
        _MODELS_CACHE[d] = model
        logger.info(f"Loaded {d} model successfully from {filepath}")
        return model
    except Exception as e:
        logger.error(f"Failed to load {d} model from {filepath}: {e}")
        return None


get_model = load_model


def normalize_value(key: str, val: Any) -> Any:
    """Normalize common values to match trained categorical codes."""
    if key == "foreign_worker":
        if isinstance(val, bool):
            return "A201" if val else "A202"
        s = str(val).lower().strip()
        if s in ["yes", "y", "true", "1", "foreign", "a201"]:
            return "A201"
        elif s in ["no", "n", "false", "0", "domestic", "a202"]:
            return "A202"
    elif key == "checking_account_status":
        s = str(val).lower().strip()
        if "good" in s or "high" in s or ">=" in s or "a13" in s:
            return "A13"
        elif "moderate" in s or "avg" in s or "< 200" in s or "a12" in s:
            return "A12"
        elif "low" in s or "bad" in s or "negative" in s or "< 0" in s or "a11" in s:
            return "A11"
        elif "none" in s or "no account" in s or "a14" in s:
            return "A14"
    elif key == "autonomy_consent_flag":
        if isinstance(val, bool):
            return 1.0 if val else 0.0
        s = str(val).lower().strip()
        return 1.0 if s in ["1", "true", "yes"] else 0.0
    return val


def impute_features(domain: str, raw_input: Dict[str, Any]) -> Dict[str, Any]:
    """
    Intelligently merge user input with schema defaults and alias mappings.
    Guarantees no missing feature crash when calling model.predict_proba.
    """
    d = domain.lower().strip()
    clean_input: Dict[str, Any] = {}

    # Strip private/control keys like _auto_repair_enabled
    for k, v in raw_input.items():
        if not k.startswith("_"):
            clean_input[k] = v

    if d == "finance":
        base = dict(FINANCE_DEFAULTS)
        aliases = FINANCE_ALIASES
    elif d == "healthcare":
        base = dict(HEALTHCARE_DEFAULTS)
        aliases = HEALTHCARE_ALIASES
    elif d == "industrial":
        base = dict(INDUSTRIAL_DEFAULTS)
        aliases = INDUSTRIAL_ALIASES
    else:
        # Fallback dictionary for unmodeled domains
        base = {"risk_factor": 0.35, "complexity": 1.0, "compliance_score": 0.9}
        aliases = {}

    # Map user inputs and aliases onto base schema
    for k, v in clean_input.items():
        target_k = aliases.get(k.lower(), k)
        if target_k in base:
            val = normalize_value(target_k, v)
            # Ensure numeric conversion where appropriate
            if isinstance(base[target_k], (int, float)) and not isinstance(val, (int, float)):
                try:
                    val = float(val)
                except (ValueError, TypeError):
                    pass
            base[target_k] = val
        else:
            base[target_k] = v

    if d == "finance":
        try:
            age_val = float(base.get("age_years", 33.0))
            base["age_group"] = 1.0 if age_val >= 25.0 else 0.0
        except (ValueError, TypeError):
            base["age_group"] = 1.0

    return base


def predict_probability(domain: str, input_data: Dict[str, Any]) -> Tuple[float, int, Dict[str, Any]]:
    """
    Predict probability of positive outcome P(approval/safe) using real ML models.
    Returns: (probability, binary_pred, imputed_features)
    """
    d = domain.lower().strip()
    imputed = impute_features(d, input_data)
    model = load_model(d)

    if model is not None:
        try:
            # Order features correctly for DataFrame
            if d == "finance":
                cols = list(FINANCE_DEFAULTS.keys())
            elif d == "healthcare":
                cols = list(HEALTHCARE_DEFAULTS.keys())
            elif d == "industrial":
                cols = list(INDUSTRIAL_DEFAULTS.keys())
            else:
                cols = list(imputed.keys())

            row = {c: imputed.get(c) for c in cols}
            df = pd.DataFrame([row])
            probs = model.predict_proba(df)[0]
            # Convention: index 1 is favorable/positive outcome
            prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
            pred = int(prob >= 0.5)
            return prob, pred, imputed
        except Exception as e:
            logger.error(f"Prediction failed for domain {d}: {e}")

    # Fallback heuristic calculation for unmodeled or errored domains
    if d == "healthcare":
        age = float(imputed.get("patient_age", 55))
        severity = float(imputed.get("symptom_severity", 4))
        risk = float(imputed.get("historical_risk", 0.35))
        consent = float(imputed.get("autonomy_consent_flag", 1))
        # Positive outcome = diagnosis passed / low risk
        score = 1.0 - (0.25 * (age / 100.0) + 0.35 * (severity / 10.0) + 0.30 * risk + 0.10 * (1 - consent))
        prob = max(0.01, min(0.99, score))
    elif d == "industrial":
        temp = float(imputed.get("sensor_temp", 85))
        vib = float(imputed.get("vibration_freq", 60))
        psi = float(imputed.get("pressure_psi", 120))
        # Failure risk
        fail_risk = (max(0, temp - 70) / 50.0) * 0.4 + (max(0, vib - 50) / 30.0) * 0.3 + (max(0, psi - 100) / 80.0) * 0.3
        prob = max(0.01, min(0.99, 1.0 - fail_risk))
    elif d == "defense":
        prob = 0.82
    elif d == "logistics":
        prob = 0.88
    elif d == "cybersecurity":
        prob = 0.79
    else:
        prob = 0.75

    pred = int(prob >= 0.5)
    return float(prob), pred, imputed


def compute_feature_attributions(domain: str, input_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Calculate directional impact deltas for each feature relative to baseline defaults.
    Produces plain English attribution rules for Layer 2 neuro-symbolic reasoning.
    """
    d = domain.lower().strip()
    imputed = impute_features(d, input_data)
    model = load_model(d)

    attributions: List[Dict[str, Any]] = []

    if d == "finance":
        defaults = FINANCE_DEFAULTS
        labels = {
            "checking_account_status": "Checking Account Status",
            "credit_amount": "Credit Loan Amount",
            "duration_months": "Loan Duration",
            "credit_history": "Credit History Rating",
            "age_years": "Applicant Age",
            "savings_account": "Savings Account Tier",
            "employment_since": "Employment Length",
            "foreign_worker": "Foreign Worker Status",
            "housing": "Housing Status",
            "installment_rate": "Installment Rate",
        }
    elif d == "healthcare":
        defaults = HEALTHCARE_DEFAULTS
        labels = {
            "patient_age": "Patient Age",
            "symptom_severity": "Symptom Severity Index",
            "historical_risk": "Historical Risk Score",
            "autonomy_consent_flag": "Autonomy Consent Verification",
        }
    elif d == "industrial":
        defaults = INDUSTRIAL_DEFAULTS
        labels = {
            "sensor_temp": "Sensor Operating Temperature",
            "vibration_freq": "Vibration Frequency",
            "pressure_psi": "Chamber Pressure (PSI)",
        }
    else:
        defaults = {}
        labels = {}

    baseline_prob, _, _ = predict_probability(d, defaults)
    actual_prob, _, _ = predict_probability(d, imputed)

    for feature_name, friendly_label in labels.items():
        actual_val = imputed.get(feature_name)
        default_val = defaults.get(feature_name)

        # Perturb single feature against baseline
        perturbed = dict(defaults)
        perturbed[feature_name] = actual_val
        p_perturbed, _, _ = predict_probability(d, perturbed)
        delta = p_perturbed - baseline_prob

        impact_pct = round(delta * 100.0, 2)
        direction = "favorable impact towards approval" if impact_pct >= 0 else "risk impact towards denial"
        sign = "+" if impact_pct >= 0 else ""

        # Format display value
        if feature_name == "credit_amount":
            val_str = f"${actual_val:,.0f}" if isinstance(actual_val, (int, float)) else str(actual_val)
        elif feature_name == "duration_months":
            val_str = f"{actual_val:.0f} months" if isinstance(actual_val, (int, float)) else str(actual_val)
        elif feature_name == "age_years" or feature_name == "patient_age":
            val_str = f"{actual_val:.0f} years" if isinstance(actual_val, (int, float)) else str(actual_val)
        elif feature_name == "sensor_temp":
            val_str = f"{actual_val:.1f} °C" if isinstance(actual_val, (int, float)) else str(actual_val)
        elif feature_name == "foreign_worker":
            val_str = "Foreign National" if actual_val == "A201" else "Domestic Resident"
        else:
            val_str = str(actual_val)

        desc = f"{friendly_label} is {val_str} ({sign}{impact_pct}% {direction})"

        attributions.append({
            "feature": feature_name,
            "label": friendly_label,
            "value": val_str,
            "raw_value": actual_val,
            "delta": delta,
            "impact_pct": impact_pct,
            "description": desc,
        })

    # Sort attributions by absolute impact magnitude
    attributions.sort(key=lambda x: abs(x["delta"]), reverse=True)
    return attributions
