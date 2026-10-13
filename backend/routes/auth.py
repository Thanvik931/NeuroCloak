"""Auth routes – secure authentication with JWT expiration and rate limiting.

POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
"""

from datetime import datetime, timezone, timedelta
import re
from flask import Blueprint, request, jsonify, g
import bcrypt
import jwt as pyjwt
from config import Config
from models import user as UserModel
from models import serialize_doc
from middleware.auth import login_required
from lib.limiter import limiter

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


@bp.route("/register", methods=["POST"])
@limiter.limit("10 per minute")
def register():
    try:
        body = request.get_json(force=True) or {}
        email = (body.get("email") or "").strip().lower()
        password = body.get("password", "")

        if not email or len(email) > 255 or not EMAIL_REGEX.match(email):
            return jsonify({"error": "Valid email address is required"}), 400
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        if len(password) > 128:
            return jsonify({"error": "Password cannot exceed 128 characters"}), 400

        existing = UserModel.find_by_email(email)
        if existing:
            return jsonify({"error": "User already exists"}), 400

        # Assign ADMIN role if email matches Config.ADMIN_EMAILS, otherwise VIEWER
        assigned_role = "ADMIN" if email in Config.ADMIN_EMAILS else "VIEWER"

        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")
        user = UserModel.create_user(email, password_hash, assigned_role)

        exp_time = datetime.now(timezone.utc) + timedelta(days=7)
        token = pyjwt.encode(
            {
                "userId": str(user["_id"]),
                "role": user["role"],
                "exp": exp_time,
                "iat": datetime.now(timezone.utc),
            },
            Config.JWT_SECRET,
            algorithm="HS256",
        )

        return jsonify({
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "role": user["role"],
                "createdAt": user["createdAt"].isoformat(),
            },
        }), 201

    except Exception as e:
        print(f"Register error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@bp.route("/login", methods=["POST"])
@limiter.limit("10 per minute")
def login():
    try:
        body = request.get_json(force=True) or {}
        email = (body.get("email") or "").strip().lower()
        password = body.get("password", "")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        if len(password) > 128:
            return jsonify({"error": "Invalid credentials"}), 401

        user = UserModel.find_by_email(email)
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        if not bcrypt.checkpw(password.encode("utf-8"), user["passwordHash"].encode("utf-8")):
            return jsonify({"error": "Invalid credentials"}), 401

        exp_time = datetime.now(timezone.utc) + timedelta(days=7)
        token = pyjwt.encode(
            {
                "userId": str(user["_id"]),
                "role": user["role"],
                "exp": exp_time,
                "iat": datetime.now(timezone.utc),
            },
            Config.JWT_SECRET,
            algorithm="HS256",
        )

        return jsonify({
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "role": user["role"],
                "createdAt": user["createdAt"].isoformat(),
            },
        })

    except Exception as e:
        print(f"Login internal error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@bp.route("/me", methods=["GET"])
@login_required
def me():
    try:
        user = UserModel.find_by_id(g.user["userId"])
        if not user:
            return jsonify({"error": "User not found"}), 404

        user_dict = serialize_doc(user)
        user_dict.pop("passwordHash", None)
        return jsonify({"user": user_dict})

    except Exception:
        return jsonify({"error": "Internal server error"}), 500
