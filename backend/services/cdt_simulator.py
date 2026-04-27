"""CDT Simulator – replaces services/cdtSimulator.ts.

This is a 1:1 port of the original TypeScript simulation engine.
Every constant, threshold, and random-distribution is preserved exactly.
"""

import random
import json
from models import governance_rule as GovRule


# ── Domain step definitions ──────────────────────────────────────────
DOMAIN_STEPS: dict[str, list[dict]] = {
    "healthcare": [
        {"layer": "perception",    "description": "Symptom pattern recognition"},
        {"layer": "reasoning",     "description": "Differential diagnosis formation"},
        {"layer": "symbolic",      "description": "Evidence-based guideline lookup"},
        {"layer": "reasoning",     "description": "Confidence calibration"},
        {"layer": "symbolic",      "description": "Ethics check: patient autonomy"},
        {"layer": "metacognitive", "description": "Metacognitive self-evaluation"},
    ],
    "finance": [
        {"layer": "perception",    "description": "Transaction pattern analysis"},
        {"layer": "reasoning",     "description": "Risk score calculation"},
        {"layer": "symbolic",      "description": "Regulatory compliance check"},
        {"layer": "reasoning",     "description": "Fraud signal detection"},
        {"layer": "symbolic",      "description": "Equal opportunity verification"},
        {"layer": "metacognitive", "description": "Decision justification audit"},
    ],
    "defense": [
        {"layer": "perception",    "description": "Threat classification"},
        {"layer": "symbolic",      "description": "ROE compliance check"},
        {"layer": "reasoning",     "description": "Collateral damage assessment"},
        {"layer": "symbolic",      "description": "Command authority verification"},
        {"layer": "metacognitive", "description": "Action ethical validation"},
    ],
    "industrial": [
        {"layer": "perception",    "description": "Anomaly detection"},
        {"layer": "reasoning",     "description": "Root cause analysis"},
        {"layer": "symbolic",      "description": "Safety constraint verification"},
        {"layer": "reasoning",     "description": "Optimization recommendation"},
        {"layer": "metacognitive", "description": "Self-correction audit"},
    ],
}

BIAS_TYPES = ["demographic_bias", "selection_bias", "anchoring", "distributional_shift"]
SEVERITIES = ["low", "medium", "high", "critical"]

DOMAIN_KEYWORDS: dict[str, list[str]] = {
    "healthcare": ["patient", "medical", "diagnosis", "symptom", "hospital", "disease", "scan", "treatment", "blood", "anatomy", "oncology"],
    "finance": ["loan", "bank", "credit", "interest", "money", "mortgage", "investment", "stock", "transaction", "currency", "asset"],
    "defense": ["tactical", "threat", "aerial", "missile", "combat", "reconnaissance", "pilot", "mission", "target", "stealth"],
    "industrial": ["factory", "machine", "sensor", "production", "robotics", "warehouse", "pipeline", "efficiency", "assembly"],
    "logistics": ["route", "shipment", "delivery", "fleet", "inventory", "warehouse", "parcel", "logistics", "tracking"],
    "cybersecurity": ["dns", "firewall", "malware", "attack", "intrusion", "botnet", "ddos", "exploit", "vulnerability"],
}


def _random_float(lo: float, hi: float) -> float:
    return random.uniform(lo, hi)


def _random_int(lo: int, hi: int) -> int:
    return random.randint(lo, hi)


# ── Main simulator ───────────────────────────────────────────────────
def cdt_simulate(ai_system_id: str, domain: str, input_data) -> dict:
    """Run a full CDT simulation and return the result dict."""

    # 0. Domain Validation
    input_text = (
        input_data.lower()
        if isinstance(input_data, str)
        else json.dumps(input_data).lower()
    )
    selected_domain = domain.lower()

    matching_domains = [
        (dom, kws)
        for dom, kws in DOMAIN_KEYWORDS.items()
        if any(k in input_text for k in kws) and dom != selected_domain
    ]

    if matching_domains and len(input_text) > 5:
        return {
            "aiSystemId": ai_system_id,
            "inputData": input_data,
            "outputDecision": (
                f"FATAL: Domain Mismatch detected. System trained for "
                f"'{selected_domain}', but input represents "
                f"'{matching_domains[0][0]}'. Processing halted for safety."
            ),
            "confidenceScore": 0.1,
            "cognitiveConsistency": 0.05,
            "transparencyIndex": 1.0,
            "ethicalComplianceRate": 0,
            "adaptationSpeed": 0,
            "selfRepairEfficiency": 0,
            "status": "BLOCKED",
            "reasoningTrace": [
                {
                    "stepNumber": 1,
                    "layer": "perception",
                    "description": "Input domain classification failure",
                    "confidence": 0.1,
                    "isInterpretable": True,
                }
            ],
            "ethicsChecks": [],
            "biasFlags": [],
        }

    # 1. Generate Reasoning Steps
    available_steps = DOMAIN_STEPS.get(selected_domain)

    if not available_steps:
        keys = list(input_data.keys()) if isinstance(input_data, dict) else []
        if keys:
            available_steps = [
                {"layer": "perception",    "description": f"Ingesting custom payload vector: [{', '.join(keys)}]"},
                {"layer": "reasoning",     "description": f"Correlating historical baselines for parameter '{keys[0]}'"},
                {"layer": "symbolic",      "description": "Normalizing statistical variance across custom inputs"},
                {"layer": "reasoning",     "description": "Executing speculative semantic inference layer"},
                {"layer": "symbolic",      "description": "Applying generalized domain safety constraints"},
                {"layer": "metacognitive", "description": "Calibrating multidimensional confidence bounds"},
            ]
        else:
            available_steps = [
                {"layer": "perception",    "description": "Initializing generic neural processor"},
                {"layer": "reasoning",     "description": "Parsing unknown schema topology"},
                {"layer": "symbolic",      "description": "Applying universal constraints"},
                {"layer": "metacognitive", "description": "Generating tentative heuristics"},
            ]

    num_steps = min(len(available_steps), _random_int(3, 6))
    selected_steps = available_steps[:num_steps]

    reasoning_trace = []
    for idx, step in enumerate(selected_steps):
        is_interpretable = random.random() > 0.1  # 90% interpretable
        reasoning_trace.append({
            "stepNumber": idx + 1,
            "layer": step["layer"],
            "description": step["description"],
            "inputValue": f"Input data batch {idx}",
            "outputValue": f"Processed output {idx}",
            "confidence": _random_float(0.7, 0.99),
            "isInterpretable": is_interpretable,
            "durationMs": _random_int(10, 100),
        })

    interpretable_count = sum(1 for s in reasoning_trace if s["isInterpretable"])
    transparency_index = interpretable_count / len(reasoning_trace)

    # 2. Fetch Rules and Run Ethics Checks
    rules = GovRule.find_active_by_system(ai_system_id)

    pass_reasons = {
        "safety": "Decision maintains safety thresholds within accepted operational bounds",
        "fairness": "No demographic or protected-attribute variance detected in the reasoning pathway",
        "legal": "Decision satisfies all applicable regulatory requirements and citation standards",
        "ethics": "Autonomy, consent, and ethical principles verified throughout the reasoning chain",
    }
    fail_reasons = {
        "safety": "Decision risk profile exceeds the acceptable safety threshold for this domain",
        "fairness": "Reasoning pathway shows statistically significant protected-attribute variance",
        "legal": "Insufficient regulatory compliance evidence detected in the reasoning chain",
        "ethics": "Consent or autonomy constraint violated during metacognitive evaluation",
    }

    ethics_checks = []
    for rule in rules:
        passed = random.random() > 0.15  # 85% pass rate
        cat = rule.get("category", "")
        ethics_checks.append({
            "ruleId": rule["_id"],
            "passed": passed,
            "reason": pass_reasons.get(cat, "Constraint satisfied") if passed else fail_reasons.get(cat, "Constraint violated — flagged for review"),
        })

    passed_checks = sum(1 for c in ethics_checks if c["passed"])
    ethical_compliance_rate = passed_checks / len(rules) if rules else 1.0

    # 3. Inject Bias Flags
    bias_flags: list[dict] = []
    inject_bias = random.random() < 0.30
    self_repair_efficiency = None

    if inject_bias:
        num_flags = _random_int(1, 2)
        total_corrected = 0
        for _ in range(num_flags):
            is_corrected = random.random() < 0.70
            if is_corrected:
                total_corrected += 1
            bias_flags.append({
                "biasType": BIAS_TYPES[_random_int(0, len(BIAS_TYPES) - 1)],
                "severity": SEVERITIES[_random_int(0, len(SEVERITIES) - 1)],
                "description": "Detected systemic deviation in evaluation weights",
                "corrected": is_corrected,
                "correctionNote": "MCM adjusted weights" if is_corrected else None,
            })
        self_repair_efficiency = total_corrected / num_flags

    # Calculate Metrics
    cognitive_consistency = _random_float(0.75, 0.98)
    adaptation_speed = _random_float(120, 850)
    status_roll = random.random()
    confidence_score = sum(s["confidence"] for s in reasoning_trace) / len(reasoning_trace)

    # Status Logic (exact same thresholds as original)
    uncorrected_critical = any(
        not f["corrected"] and f["severity"] in ("critical", "high")
        for f in bias_flags
    )
    has_uncorrected = any(not f["corrected"] for f in bias_flags)
    bias_threshold_trigger = any(
        f["severity"] in ("medium", "high", "critical") for f in bias_flags
    )

    status = "APPROVED"
    if ethical_compliance_rate <= 0.85 or uncorrected_critical or status_roll < 0.05:
        status = "BLOCKED"
    elif ethical_compliance_rate < 0.95 or has_uncorrected or bias_threshold_trigger or confidence_score < 0.85:
        status = "FLAGGED"

    output_decision = (
        "Rejected post-audit"
        if status == "BLOCKED"
        else ("Approved with bias warnings" if status == "FLAGGED" else "Approved user scenario")
    )

    return {
        "aiSystemId": ai_system_id,
        "inputData": input_data,
        "outputDecision": output_decision,
        "confidenceScore": confidence_score,
        "cognitiveConsistency": cognitive_consistency,
        "transparencyIndex": transparency_index,
        "ethicalComplianceRate": ethical_compliance_rate,
        "adaptationSpeed": adaptation_speed,
        "selfRepairEfficiency": self_repair_efficiency,
        "status": status,
        "reasoningTrace": reasoning_trace,
        "ethicsChecks": ethics_checks,
        "biasFlags": bias_flags,
    }
