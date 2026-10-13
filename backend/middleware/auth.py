"""Authentication middleware – replaces middleware/auth.ts.

Provides a ``login_required`` decorator and a ``require_role`` decorator
that mirror the Express middleware exactly:
  1. Try verifying as an internal JWT
  2. Fall back to decoding (without verification) a Firebase ID token
"""

from functools import wraps
from flask import request, jsonify, g
import jwt as pyjwt
from config import Config


def _extract_user_from_token(token: str) -> dict | None:
    """Attempt to decode the bearer token and return user info."""
    # 1. Try internal JWT (verified)
    try:
        decoded = pyjwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
        return {
            "userId": str(decoded["userId"]),
            "role": decoded.get("role", "VIEWER"),
        }
    except (pyjwt.InvalidTokenError, KeyError):
        pass

    # 2. Try Firebase ID token (decoded)
    try:
        decoded = pyjwt.decode(token, options={"verify_signature": False})
        if not decoded:
            return None

        iss = decoded.get("iss", "")
        aud = decoded.get("aud", "")
        is_firebase = (
            "firebase" in iss
            or "google.com" in iss
            or "neurocloak" in str(aud)
        )

        if is_firebase:
            user_id = decoded.get("sub") or decoded.get("user_id")
            email = (decoded.get("email") or "").strip().lower()

            # Enforce least-privilege: check DB or strict admin email whitelist
            from models import user as UserModel
            user_doc = None
            if email:
                user_doc = UserModel.find_by_email(email)
            if not user_doc and user_id:
                user_doc = UserModel.find_by_id(user_id)

            if user_doc and "role" in user_doc:
                role = user_doc["role"]
            elif email and email in Config.ADMIN_EMAILS:
                role = "ADMIN"
            else:
                role = "VIEWER"

            return {
                "userId": str(user_doc["_id"]) if user_doc else user_id,
                "email": email,
                "role": role,
            }

        print(f"Rejected Auth Token Structure: iss={iss}, aud={aud}")
        return None
    except Exception as e:
        print(f"Token decoding error: {e}")
        return None


def login_required(f):
    """Decorator that enforces authentication on a Flask route."""

    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401

        token = auth_header.split(" ", 1)[1]
        user = _extract_user_from_token(token)
        if user is None:
            return jsonify({"error": "Unauthorized"}), 401

        g.user = user
        return f(*args, **kwargs)

    return decorated


def require_role(roles: list[str]):
    """Decorator factory that checks user role after authentication."""

    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = getattr(g, "user", None)
            if not user or user.get("role") not in roles:
                return jsonify({"error": "Forbidden"}), 403
            return f(*args, **kwargs)

        return decorated

    return decorator
