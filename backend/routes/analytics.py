"""Analytics routes – replaces routes/analytics.ts.

GET /api/analytics/summary
GET /api/analytics/metrics
GET /api/analytics/bias-types
GET /api/analytics/heatmap
"""

import json
from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from middleware.auth import login_required
from models import decision as DecisionModel
from models import bias_flag as BiasFlagModel
from lib.redis_client import cache_get, cache_set

bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")


@bp.route("/summary", methods=["GET"])
@login_required
def summary():
    try:
        system_id = request.args.get("systemId")

        # Check redis cache if no specific systemId
        if not system_id:
            cached = cache_get("analytics:summary")
            if cached:
                return jsonify(json.loads(cached))

        match_stage: dict = {}
        if system_id:
            match_stage["aiSystemId"] = ObjectId(system_id)

        pipeline = [
            {"$match": match_stage},
            {
                "$group": {
                    "_id": None,
                    "totalDecisions": {"$sum": 1},
                    "avgCompliance": {"$avg": "$ethicalComplianceRate"},
                    "avgTransparency": {"$avg": "$transparencyIndex"},
                    "flaggedCount": {
                        "$sum": {
                            "$cond": [
                                {"$in": ["$status", ["FLAGGED", "BLOCKED"]]},
                                1,
                                0,
                            ]
                        }
                    },
                }
            },
        ]

        results = DecisionModel.aggregate(pipeline)
        s = results[0] if results else {}

        result = {
            "totalDecisions": s.get("totalDecisions", 0),
            "avgComplianceRate": s.get("avgCompliance", 0),
            "avgTransparencyIndex": s.get("avgTransparency", 0),
            "activeFlags": s.get("flaggedCount", 0),
        }

        if not system_id:
            cache_set("analytics:summary", json.dumps(result), 300)

        return jsonify(result)
    except Exception as e:
        print(f"Analytics summary error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@bp.route("/metrics", methods=["GET"])
@login_required
def metrics():
    try:
        system_id = request.args.get("systemId")
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)

        match_stage: dict = {"createdAt": {"$gte": thirty_days_ago}}
        if system_id:
            match_stage["aiSystemId"] = ObjectId(system_id)

        pipeline = [
            {"$match": match_stage},
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}},
                    "avgCompliance": {"$avg": "$ethicalComplianceRate"},
                    "count": {"$sum": 1},
                }
            },
            {"$sort": {"_id": 1}},
        ]

        raw = DecisionModel.aggregate(pipeline)
        time_series = [
            {
                "date": m["_id"],
                "complianceRate": m["avgCompliance"],
                "decisionsCount": m["count"],
            }
            for m in raw
        ]

        return jsonify({"timeSeries": time_series})
    except Exception as e:
        print(f"Analytics metrics error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@bp.route("/bias-types", methods=["GET"])
@login_required
def bias_types():
    try:
        pipeline = [
            {"$group": {"_id": "$biasType", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]
        raw = BiasFlagModel.aggregate(pipeline)
        distribution = [{"type": b["_id"], "count": b["count"]} for b in raw]
        return jsonify({"distribution": distribution})
    except Exception as e:
        print(f"Bias types error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@bp.route("/heatmap", methods=["GET"])
@login_required
def heatmap():
    try:
        system_id = request.args.get("systemId")
        days = int(request.args.get("days", 365))
        start_date = datetime.now(timezone.utc) - timedelta(days=days)

        match_stage: dict = {"createdAt": {"$gte": start_date}}
        if system_id:
            match_stage["aiSystemId"] = ObjectId(system_id)

        pipeline = [
            {"$match": match_stage},
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}},
                    "value": {"$avg": "$ethicalComplianceRate"},
                    "count": {"$sum": 1},
                }
            },
            {
                "$project": {
                    "date": "$_id",
                    "complianceRate": {"$round": ["$value", 3]},
                    "count": 1,
                    "_id": 0,
                }
            },
            {"$sort": {"date": 1}},
        ]

        raw = DecisionModel.aggregate(pipeline)
        return jsonify({"heatmapData": raw})
    except Exception as e:
        print(f"Heatmap error: {e}")
        return jsonify({"error": "Internal server error"}), 500
