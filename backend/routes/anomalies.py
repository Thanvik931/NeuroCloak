"""Anomalies routes – replaces routes/anomalies.ts.

GET   /api/anomalies
PATCH /api/anomalies/:id/resolve
"""

from flask import Blueprint, jsonify, g
from middleware.auth import login_required, require_role
from models import serialize_doc, serialize_docs
from models import anomaly_alert as AlertModel
from models import ai_system as SystemModel

bp = Blueprint("anomalies", __name__, url_prefix="/api/anomalies")


@bp.route("/", methods=["GET"])
@login_required
def list_anomalies():
    try:
        anomalies = AlertModel.find_unresolved()

        # Populate aiSystemId with system name
        formatted = []
        for a in anomalies:
            doc = serialize_doc(a)
            sys_info = SystemModel.find_by_id(a.get("aiSystemId"))
            if sys_info:
                doc["aiSystemId"] = serialize_doc(sys_info)
            formatted.append(doc)

        return jsonify(formatted)
    except Exception as e:
        print(f"List anomalies error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@bp.route("/<alert_id>/resolve", methods=["PATCH"])
@login_required
@require_role(["ADMIN", "AUDITOR"])
def resolve_anomaly(alert_id):
    try:
        anomaly = AlertModel.resolve(alert_id)
        return jsonify(serialize_doc(anomaly))
    except Exception:
        return jsonify({"error": "Internal server error"}), 500
