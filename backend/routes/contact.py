"""Contact route – handles contact form submissions.

Target email: thanvikreddy2@gmail.com
Target phone: 8790505507
"""

import urllib.parse
from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from lib.mongodb import get_db

bp = Blueprint("contact", __name__, url_prefix="/api/contact")

TARGET_EMAIL = "thanvikreddy2@gmail.com"
TARGET_PHONE = "8790505507"
TARGET_PHONE_INTL = "+918790505507"

@bp.route("", methods=["POST"])
def submit_contact():
    try:
        body = request.get_json(force=True)
        name = (body.get("name") or "").strip()
        email = (body.get("email") or "").strip()
        phone = (body.get("phone") or "").strip()
        organization = (body.get("organization") or "").strip()
        inquiry_type = (body.get("inquiryType") or "General Question").strip()
        message = (body.get("message") or "").strip()

        if not name or not email or not message:
            return jsonify({"error": "Name, email, and message are required"}), 400

        now = datetime.now(timezone.utc)
        contact_doc = {
            "name": name,
            "email": email,
            "userPhone": phone,
            "organization": organization,
            "inquiryType": inquiry_type,
            "message": message,
            "recipientEmail": TARGET_EMAIL,
            "recipientPhone": TARGET_PHONE,
            "status": "DELIVERED",
            "createdAt": now,
        }

        db = get_db()
        result = db.contact_messages.insert_one(contact_doc)

        formatted_text = (
            f"Hello NeuroCloak Support Team,\n\n"
            f"New Contact Inquiry:\n"
            f"• Name: {name}\n"
            f"• Sender Email: {email}\n"
            f"• Sender Phone: {phone or 'N/A'}\n"
            f"• Organization: {organization or 'N/A'}\n"
            f"• Subject: {inquiry_type}\n"
            f"• Message: {message}\n"
        )

        mailto_url = f"mailto:{TARGET_EMAIL}?subject={urllib.parse.quote('NeuroCloak Inquiry: ' + inquiry_type)}&body={urllib.parse.quote(formatted_text)}"
        whatsapp_url = f"https://wa.me/{TARGET_PHONE_INTL.replace('+', '')}?text={urllib.parse.quote(formatted_text)}"

        return jsonify({
            "message": "Contact message received and logged successfully",
            "id": str(result.inserted_id),
            "mailtoUrl": mailto_url,
            "whatsappUrl": whatsapp_url
        }), 201

    except Exception as e:
        print(f"Contact submit error: {e}")
        return jsonify({"error": "Internal server error"}), 500
