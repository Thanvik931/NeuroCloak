"""Contact route – handles contact form submissions with strict sanitization.

Target email: thanvikreddy2@gmail.com
Target phone: 8790505507
"""

import html
import re
import urllib.parse
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from lib.mongodb import get_db
from lib.limiter import limiter

bp = Blueprint("contact", __name__, url_prefix="/api/contact")

TARGET_EMAIL = "thanvikreddy2@gmail.com"
TARGET_PHONE = "8790505507"
TARGET_PHONE_INTL = "+918790505507"

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def sanitize_text(text: str, max_length: int) -> str:
    """Strip, truncate, and HTML-escape text to prevent XSS and injection."""
    if not text:
        return ""
    truncated = text.strip()[:max_length]
    return html.escape(truncated, quote=True)


@bp.route("", methods=["POST"])
@limiter.limit("5 per minute")
def submit_contact():
    try:
        body = request.get_json(force=True) or {}
        raw_name = (body.get("name") or "").strip()
        raw_email = (body.get("email") or "").strip()
        raw_phone = (body.get("phone") or "").strip()
        raw_org = (body.get("organization") or "").strip()
        raw_type = (body.get("inquiryType") or "General Question").strip()
        raw_message = (body.get("message") or "").strip()

        if not raw_name or not raw_email or not raw_message:
            return jsonify({"error": "Name, valid email, and message are required"}), 400

        if not EMAIL_REGEX.match(raw_email):
            return jsonify({"error": "A valid email address is required"}), 400

        # Sanitize against XSS and buffer abuse
        name = sanitize_text(raw_name, 100)
        email = sanitize_text(raw_email, 255)
        phone = sanitize_text(raw_phone, 30)
        organization = sanitize_text(raw_org, 150)
        inquiry_type = sanitize_text(raw_type, 100)
        message = sanitize_text(raw_message, 5000)

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
            "whatsappUrl": whatsapp_url,
        }), 201

    except Exception as e:
        print(f"Contact submit error: {e}")
        return jsonify({"error": "Internal server error"}), 500
