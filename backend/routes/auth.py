"""Auth routes – replaces routes/auth.ts.

POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
"""

from flask import Blueprint, request, jsonify, g
import bcrypt
import jwt as pyjwt
from config import Config
from models import user as UserModel
from models import serialize_doc
from middleware.auth import login_required

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.route("/register", methods=["POST"])
def register():
    try:
        body = request.get_json(force=True)
        email = (body.get("email") or "").strip().lower()
        password = body.get("password", "")

        if not email or "@" not in email:
            return jsonify({"error": "Valid email is required"}), 400
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400

        existing = UserModel.find_by_email(email)
        if existing:
            return jsonify({"error": "User already exists"}), 400

        password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(12)).decode()
        user = UserModel.create_user(email, password_hash, "VIEWER")

        token = pyjwt.encode(
            {"userId": str(user["_id"]), "role": user["role"]},
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
def login():
    try:
        body = request.get_json(force=True)
        email = (body.get("email") or "").strip().lower()
        password = body.get("password", "")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        user = UserModel.find_by_email(email)
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        if not bcrypt.checkpw(password.encode(), user["passwordHash"].encode()):
            return jsonify({"error": "Invalid credentials"}), 401

        token = pyjwt.encode(
            {"userId": str(user["_id"]), "role": user["role"]},
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
        print(f"Login error: {e}")
        return jsonify({"error": str(e)}), 500


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
