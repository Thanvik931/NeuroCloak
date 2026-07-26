"""Contact route – handles contact form submissions sent to 8790505507.

POST /api/contact
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from lib.mongodb import get_db

bp = Blueprint("contact", __name__, url_prefix="/api/contact")

TARGET_PHONE = "8790505507"
TARGET_PHONE_INTL = "+918790505507"

@bp.route("", methods=["POST"])
def submit_contact():
    try:
        body = request.get_json(force=True)
        name = (body.get("name") or "").strip()
        email = (body.get("email") or "").strip()
        organization = (body.get("organization") or "").strip()
        inquiry_type = (body.get("inquiryType") or "General Question").strip()
        message = (body.get("message") or "").strip()

        if not name or not email or not message:
            return jsonify({"error": "Name, email, and message are required"}), 400

        now = datetime.now(timezone.utc)
        contact_doc = {
            "name": name,
            "email": email,
            "organization": organization,
            "inquiryType": inquiry_type,
            "message": message,
            "recipientPhone": TARGET_PHONE,
            "recipientPhoneIntl": TARGET_PHONE_INTL,
            "status": "DISPATCHED",
            "createdAt": now,
        }

        db = get_db()
        result = db.contact_messages.insert_one(contact_doc)

        # Formatted text payload for SMS / WhatsApp dispatch to 8790505507
        whatsapp_text = (
            f"Hello NeuroCloak Team,\n\n"
            f"New Contact Inquiry:\n"
            f"• Name: {name}\n"
            f"• Email: {email}\n"
            f"• Organization: {organization or 'N/A'}\n"
            f"• Type: {inquiry_type}\n"
            f"• Message: {message}\n"
        )

        return jsonify({
            "message": "Contact message received and dispatched",
            "id": str(result.inserted_id),
            "recipientPhone": TARGET_PHONE_INTL,
            "whatsappUrl": f"https://wa.me/918790505507?text={urllib_quote(whatsapp_text)}"
        }), 201

    except Exception as e:
        print(f"Contact submit error: {e}")
        return jsonify({"error": "Internal server error"}), 500

def urllib_quote(text):
    import urllib.parse
    return urllib.parse.quote(text)
