"""Chat routes – powered by Gemini Conversational Intelligence.

POST /api/chat
"""

import logging
from flask import Blueprint, request, jsonify, g
from middleware.auth import login_required
from services.gemini_governance_agent import query_governance_officer

logger = logging.getLogger(__name__)

bp = Blueprint("chat", __name__, url_prefix="/api/chat")


@bp.route("/", methods=["POST"])
@login_required
def chat():
    """Handle conversational AI governance inquiries with Gemini tool calling."""
    try:
        body = request.get_json(force=True) if request.data else {}
        message = body.get("message", "").strip()
        history = body.get("history", [])

        if not message:
            return jsonify({
                "response": "Please provide a query or question regarding your AI systems, decisions, or governance policies.",
                "engine": "validation"
            }), 400

        result = query_governance_officer(message=message, history=history)
        return jsonify({
            "response": result["response"],
            "engine": result.get("engine", "gemini"),
            "status": "success"
        })
    except Exception as e:
        logger.error(f"Chat route error: {e}", exc_info=True)
        return jsonify({"error": "Assistant logic error", "details": str(e)}), 500
