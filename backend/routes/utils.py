"""Utils routes – replaces routes/utils.ts.

POST /api/utils/parse-scenario
"""

from flask import Blueprint, request, jsonify, g
from middleware.auth import login_required
from services import ai_service

bp = Blueprint("utils", __name__, url_prefix="/api/utils")


@bp.route("/parse-scenario", methods=["POST"])
@login_required
def parse_scenario():
    try:
        body = request.get_json(force=True)
        text = body.get("text")
        if not text:
            return jsonify({"error": "Text is required"}), 400

        data = ai_service.parse_scenario(text)
        return jsonify({"data": data})
    except Exception:
        return jsonify({"error": "Internal server error during parsing"}), 500
