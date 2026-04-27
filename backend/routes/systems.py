"""Systems routes – replaces routes/systems.ts.

GET    /api/systems
POST   /api/systems
GET    /api/systems/:id
PATCH  /api/systems/:id
GET    /api/systems/:id/rules
POST   /api/systems/:id/rules
GET    /api/systems/:id/health
"""

from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from middleware.auth import login_required, require_role
from models import serialize_doc, serialize_docs
from models import ai_system as SystemModel
from models import governance_rule as GovModel
from models import decision as DecisionModel
from models import bias_flag as BiasFlagModel
from services.health_score import calculate_health_score

bp = Blueprint("systems", __name__, url_prefix="/api/systems")


@bp.route("/", methods=["GET"])
@login_required
def list_systems():
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        systems, total = SystemModel.find_active(page, limit)
        return jsonify({
            "data": serialize_docs(systems),
            "meta": {
                "total": total,
                "page": page,
                "limit": limit,
                "totalPages": -(-total // limit),
            },
        })
    except Exception as e:
        print(f"List systems error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@bp.route("/", methods=["POST"])
@login_required
@require_role(["ADMIN"])
def create_system():
    try:
        body = request.get_json(force=True)
        system = SystemModel.create(body)
        return jsonify(serialize_doc(system)), 201
    except Exception:
        return jsonify({"error": "Internal server error"}), 500


@bp.route("/<system_id>", methods=["GET"])
@login_required
def get_system(system_id):
    try:
        system = SystemModel.find_by_id(system_id)
        if not system:
            return jsonify({"error": "System not found"}), 404
        rules = GovModel.find_active_by_system(system_id)
        doc = serialize_doc(system)
        doc["rules"] = serialize_docs(rules)
        return jsonify(doc)
    except Exception:
        return jsonify({"error": "Internal server error"}), 500


@bp.route("/<system_id>", methods=["PATCH"])
@login_required
@require_role(["ADMIN"])
def update_system(system_id):
    try:
        body = request.get_json(force=True)
        updates = {}
        for key in ["name", "domain", "description", "isActive",
                     "accuracy", "precision", "recall", "fairnessScore",
                     "trainingDatasetSize"]:
            if key in body:
                updates[key] = body[key]

        system = SystemModel.update_by_id(system_id, updates)
        if not system:
            return jsonify({"error": "System not found"}), 404
        return jsonify(serialize_doc(system))
    except Exception:
        return jsonify({"error": "Internal server error"}), 500


@bp.route("/<system_id>/rules", methods=["GET"])
@login_required
def get_rules(system_id):
    try:
        rules = GovModel.find_active_by_system(system_id)
        return jsonify(serialize_docs(rules))
    except Exception:
        return jsonify({"error": "Internal server error"}), 500


@bp.route("/<system_id>/rules", methods=["POST"])
@login_required
@require_role(["ADMIN"])
def create_rule(system_id):
    try:
        body = request.get_json(force=True)
        rule = GovModel.create({
            "aiSystemId": system_id,
            "name": body["name"],
            "description": body.get("description", ""),
            "category": body["category"],
        })
        return jsonify(serialize_doc(rule)), 201
    except Exception:
        return jsonify({"error": "Internal server error"}), 500


@bp.route("/<system_id>/health", methods=["GET"])
@login_required
def get_health(system_id):
    try:
        decisions = DecisionModel.find_by_system(system_id, limit=50)
        if not decisions:
            return jsonify({"score": 0, "grade": "Needs Data", "trend": "stable", "metrics": None})

        decision_ids = [d["_id"] for d in decisions]
        bias_flags = BiasFlagModel.find_by_decisions(decision_ids)

        total_compliance = sum(d["ethicalComplianceRate"] for d in decisions)
        total_transparency = sum(d["transparencyIndex"] for d in decisions)
        blocked_count = sum(1 for d in decisions if d["status"] == "BLOCKED")
        total_bias = len(bias_flags)
        corrected_bias = sum(1 for b in bias_flags if b.get("corrected"))

        n = len(decisions)
        avg_compliance = total_compliance / n
        avg_transparency = total_transparency / n
        avg_cog = sum(d.get("cognitiveConsistency", 0) for d in decisions) / n
        not_blocked_ratio = 1 - (blocked_count / n)
        corrected_ratio = 1 if total_bias == 0 else corrected_bias / total_bias

        score = calculate_health_score({
            "ethicalComplianceRate": avg_compliance,
            "transparencyIndex": avg_transparency,
            "cognitiveConsistency": avg_cog,
            "selfRepairEfficiency": corrected_ratio,
        })

        if score >= 90:
            grade = "Excellent"
        elif score >= 75:
            grade = "Good"
        elif score < 50:
            grade = "Critical"
        else:
            grade = "Needs Review"

        trend = "improving" if score >= 85 else ("declining" if score < 60 else "stable")

        return jsonify({
            "score": round(score),
            "grade": grade,
            "trend": trend,
            "metrics": {
                "avgCompliance": round(avg_compliance * 100),
                "avgTransparency": round(avg_transparency * 100),
                "notBlockedRatio": round(not_blocked_ratio * 100),
                "correctedRatio": round(corrected_ratio * 100),
            },
        })
    except Exception as e:
        print(f"Health error: {e}")
        return jsonify({"error": "Internal server error"}), 500
