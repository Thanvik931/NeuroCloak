"""Chat routes – replaces routes/chat.ts.

POST /api/chat
"""

from flask import Blueprint, request, jsonify, g
from middleware.auth import login_required
from models import ai_system as SystemModel
from models import anomaly_alert as AlertModel

bp = Blueprint("chat", __name__, url_prefix="/api/chat")


@bp.route("/", methods=["POST"])
@login_required
def chat():
    try:
        body = request.get_json(force=True)
        message = body.get("message", "")
        query = message.lower()

        response = (
            "I'm sorry, I couldn't find specific data on that. "
            "Try asking about 'accuracy', 'anomalies', or a specific model name."
        )

        if "hello" in query or "hi" in query:
            response = (
                "Hello! I am the NeuroCloak Assistant. I am connected to your "
                "master-trained AI models. How can I help you audit them today?"
            )

        elif "accuracy" in query or "performing best" in query or "highest" in query:
            best = SystemModel.find_one_sorted("accuracy", -1)
            if best:
                response = (
                    f"The highest performing system is currently **{best['name']}** "
                    f"with a training accuracy of **{best['accuracy']}%**. "
                    f"It operates in the {best['domain']} domain."
                )

        elif "anomaly" in query or "anomalies" in query or "issues" in query:
            count = AlertModel.count_unresolved()
            response = (
                f"I have detected **{count} unresolved anomalies** across your systems. "
                "You should check the Anomalies panel for critical alerts."
            )

        elif "how many systems" in query or "models" in query:
            count = SystemModel.count_active()
            response = (
                f"There are currently **{count} active AI systems** being monitored "
                "in your NeuroCloak dashboard."
            )

        elif "credit" in query or "finance" in query:
            sys = SystemModel.find_by_name_regex("credit")
            if sys:
                response = (
                    f"The **{sys['name']}** is a perfection-mode model with "
                    f"**{sys['accuracy']}% accuracy**. It has processed several "
                    "decisions today with 100% ethical compliance."
                )

        elif "medical" in query or "healthcare" in query:
            sys = SystemModel.find_by_name_regex("med")
            if sys:
                response = (
                    f"The **{sys['name']}** healthcare model is operating at "
                    f"**{sys['accuracy']}% precision**. Master-level training "
                    "verified for oncology diagnostics."
                )

        return jsonify({"response": response})
    except Exception:
        return jsonify({"error": "Assistant logic error"}), 500
