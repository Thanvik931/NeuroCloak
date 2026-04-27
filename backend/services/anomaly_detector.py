"""Anomaly Detector – replaces services/anomalyDetector.ts."""

from models import decision as DecisionModel
from models import bias_flag as BiasFlagModel
from models import anomaly_alert as AnomalyAlertModel
from services.socket_service import emit_event


def detect_anomalies(new_decision: dict, ai_system_id: str) -> None:
    """Run anomaly detection checks against recent history.

    Checks:
      A – Compliance Drop (>15% below baseline)
      B – Bias Spike after clean run
      C – First BLOCKED after 10 APPROVED
    """
    try:
        # Fetch last 20 decisions for baseline
        history = DecisionModel.find_by_system(
            ai_system_id,
            exclude_id=new_decision["_id"],
            limit=20,
        )

        # Need at least 5 historical decisions
        if len(history) < 5:
            return

        anomalies: list[dict] = []

        # CHECK A — Compliance Drop
        baseline = sum(d["ethicalComplianceRate"] for d in history) / len(history)
        if new_decision["ethicalComplianceRate"] < (baseline - 0.15):
            anomalies.append({
                "type": "compliance_drop",
                "message": (
                    f"Compliance dropped below baseline "
                    f"(baseline: {baseline * 100:.1f}%, "
                    f"current: {new_decision['ethicalComplianceRate'] * 100:.1f}%)"
                ),
                "severity": "critical",
            })

        # CHECK B — Unexpected Bias Spike
        last5 = history[:5]
        last5_ids = [d["_id"] for d in last5]
        recent_bias_count = BiasFlagModel.count_by_decisions(last5_ids)
        new_decision_bias = BiasFlagModel.count_by_decision(new_decision["_id"])

        if recent_bias_count == 0 and new_decision_bias > 0:
            anomalies.append({
                "type": "bias_spike",
                "message": "Bias detected after 5 consecutive clean decisions",
                "severity": "warning",
            })

        # CHECK C — First Block in Clean Run
        last10_statuses = [d["status"] for d in history[:10]]
        all_approved = all(s == "APPROVED" for s in last10_statuses)
        if all_approved and new_decision["status"] == "BLOCKED":
            anomalies.append({
                "type": "unexpected_block",
                "message": "First BLOCKED decision after 10 consecutive APPROVED decisions",
                "severity": "critical",
            })

        # Save and emit each anomaly
        for anomaly in anomalies:
            AnomalyAlertModel.create({
                "aiSystemId": ai_system_id,
                "decisionId": new_decision["_id"],
                "type": anomaly["type"],
                "message": anomaly["message"],
                "severity": anomaly["severity"],
            })

            emit_event("anomaly_detected", {
                "systemName": str(new_decision.get("aiSystemId", "")),
                "type": anomaly["type"],
                "message": anomaly["message"],
                "severity": anomaly["severity"],
                "decisionId": str(new_decision["_id"]),
            })

    except Exception as e:
        print(f"Anomaly detection error: {e}")
