"""Decisions routes – replaces routes/decisions.ts.

POST /api/decisions/simulate
POST /api/decisions/:id/verify
GET  /api/decisions
GET  /api/decisions/:id
GET  /api/decisions/:id/trace
PATCH /api/decisions/:id/flag
"""

import threading
from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from middleware.auth import login_required, require_role
from models import serialize_doc, serialize_docs
from models import decision as DecisionModel
from models import reasoning_step as StepModel
from models import bias_flag as BiasFlagModel
from models import ethics_check as EthicsModel
from models import ai_system as SystemModel
from services.cdt_simulator import cdt_simulate
from services.socket_service import emit_event
from services.anomaly_detector import detect_anomalies
from services import ai_service
from lib.redis_client import cache_delete

bp = Blueprint("decisions", __name__, url_prefix="/api/decisions")


# 1. Audit a decision with AI
@bp.route("/<decision_id>/verify", methods=["POST"])
@login_required
def verify_decision(decision_id):
    try:
        decision = DecisionModel.find_by_id(decision_id)
        if not decision:
            return jsonify({"error": "Decision not found"}), 404

        trace = StepModel.find_by_decision(decision_id)
        audit_result = ai_service.audit_decision(
            serialize_doc(decision),
            serialize_docs(trace),
        )
        return jsonify({"data": audit_result})
    except Exception as e:
        print(f"Verify error: {e}")
        return jsonify({"error": "Internal server error during audit"}), 500


# 2. Simulate Decision
@bp.route("/simulate", methods=["POST"])
@login_required
def simulate():
    try:
        body = request.get_json(force=True)
        ai_system_id = body.get("aiSystemId")
        input_data = body.get("inputData")

        if not ai_system_id:
            return jsonify({"error": "aiSystemId is required"}), 400

        system = SystemModel.find_by_id(ai_system_id)
        if not system:
            return jsonify({"error": "AI System not found"}), 404

        sim_result = cdt_simulate(ai_system_id, system["domain"], input_data)

        # 1. Create Decision
        decision = DecisionModel.create({
            "aiSystemId": ai_system_id,
            "userId": g.user.get("userId"),
            "inputData": input_data,
            "outputDecision": sim_result["outputDecision"],
            "confidenceScore": sim_result["confidenceScore"],
            "cognitiveConsistency": sim_result["cognitiveConsistency"],
            "transparencyIndex": sim_result["transparencyIndex"],
            "ethicalComplianceRate": sim_result["ethicalComplianceRate"],
            "adaptationSpeed": sim_result["adaptationSpeed"],
            "selfRepairEfficiency": sim_result["selfRepairEfficiency"],
            "status": sim_result["status"],
        })
        decision_id = decision["_id"]

        # 2. Insert Trace Steps
        if sim_result.get("reasoningTrace"):
            for s in sim_result["reasoningTrace"]:
                s["decisionId"] = decision_id
            StepModel.insert_many(sim_result["reasoningTrace"])

        # 3. Insert Bias Flags
        if sim_result.get("biasFlags"):
            for b in sim_result["biasFlags"]:
                b["decisionId"] = decision_id
            BiasFlagModel.insert_many(sim_result["biasFlags"])

        # 4. Insert Ethics Checks
        if sim_result.get("ethicsChecks"):
            for e in sim_result["ethicsChecks"]:
                e["decisionId"] = decision_id
            EthicsModel.insert_many(sim_result["ethicsChecks"])

        # Populate the system info
        populated = serialize_doc(decision)
        populated["aiSystem"] = serialize_doc(system)

        emit_event("new_decision", populated)

        # Async anomaly detection
        threading.Thread(
            target=detect_anomalies,
            args=(decision, ai_system_id),
            daemon=True,
        ).start()

        # Invalidate Redis cache
        cache_delete("analytics:summary")
        cache_delete("analytics:metrics")

        # Build response matching original shape
        response = {
            **populated,
            "reasoningTrace": sim_result["reasoningTrace"],
            "ethicsChecks": sim_result["ethicsChecks"],
            "biasFlags": sim_result["biasFlags"],
        }
        return jsonify(response), 201

    except Exception as e:
        print(f"Simulation error: {e}")
        return jsonify({"error": "Internal server error"}), 500


# 3. GET all decisions (paginated)
@bp.route("/", methods=["GET"])
@login_required
def list_decisions():
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        system_id = request.args.get("systemId")
        status = request.args.get("status")
        date_from = request.args.get("dateFrom")
        date_to = request.args.get("dateTo")

        filter_dict: dict = {}
        if system_id:
            filter_dict["aiSystemId"] = ObjectId(system_id)
        if status:
            filter_dict["status"] = status
        if date_from or date_to:
            filter_dict["createdAt"] = {}
            if date_from:
                from datetime import datetime
                filter_dict["createdAt"]["$gte"] = datetime.fromisoformat(date_from)
            if date_to:
                from datetime import datetime
                filter_dict["createdAt"]["$lte"] = datetime.fromisoformat(date_to)

        decisions_raw, total = DecisionModel.find_paginated(filter_dict, page, limit)

        # Populate aiSystemId with system name/domain
        decisions = []
        for d in decisions_raw:
            doc = serialize_doc(d)
            sys_info = SystemModel.find_by_id(d.get("aiSystemId"))
            doc["aiSystem"] = serialize_doc(sys_info) if sys_info else d.get("aiSystemId")
            decisions.append(doc)

        return jsonify({
            "data": decisions,
            "meta": {
                "total": total,
                "page": page,
                "limit": limit,
                "totalPages": -(-total // limit),  # ceiling division
            },
        })
    except Exception as e:
        print(f"List decisions error: {e}")
        return jsonify({"error": "Internal server error"}), 500


# 4. GET single decision detail
@bp.route("/<decision_id>", methods=["GET"])
@login_required
def get_decision(decision_id):
    try:
        decision = DecisionModel.find_by_id(decision_id)
        if not decision:
            return jsonify({"error": "Decision not found"}), 404

        sys_info = SystemModel.find_by_id(decision.get("aiSystemId"))
        reasoning_steps = StepModel.find_by_decision(decision_id)
        bias_flags = BiasFlagModel.find_by_decisions([decision_id])
        ethics_raw = EthicsModel.find_by_decision(decision_id)

        # Populate rule info on ethics checks
        from models import governance_rule as GovModel
        ethics_checks = []
        for e in ethics_raw:
            ec = serialize_doc(e)
            rule = GovModel.collection().find_one({"_id": e.get("ruleId")})
            ec["rule"] = serialize_doc(rule) if rule else e.get("ruleId")
            ethics_checks.append(ec)

        doc = serialize_doc(decision)
        doc["aiSystem"] = serialize_doc(sys_info) if sys_info else None
        doc["reasoningTrace"] = serialize_docs(reasoning_steps)
        doc["biasFlags"] = serialize_docs(bias_flags)
        doc["ethicsChecks"] = ethics_checks

        return jsonify(doc)
    except Exception as e:
        print(f"Get decision error: {e}")
        return jsonify({"error": "Internal server error"}), 500


# 5. GET trace only
@bp.route("/<decision_id>/trace", methods=["GET"])
@login_required
def get_trace(decision_id):
    try:
        steps = StepModel.find_by_decision(decision_id)
        return jsonify(serialize_docs(steps))
    except Exception:
        return jsonify({"error": "Internal server error"}), 500


# 6. PATCH flag decision
@bp.route("/<decision_id>/flag", methods=["PATCH"])
@login_required
@require_role(["ADMIN", "AUDITOR"])
def flag_decision(decision_id):
    try:
        decision = DecisionModel.update_status(decision_id, "FLAGGED")
        return jsonify(serialize_doc(decision))
    except Exception:
        return jsonify({"error": "Internal server error"}), 500
