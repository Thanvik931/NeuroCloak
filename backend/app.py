"""NeuroCloak Flask Backend – Production Hardened API Entrypoint.

This is the main entry point. It creates the Flask app, registers all
blueprints, sets up strict CORS, rate limiting, security headers, and Socket.io.
"""

import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from lib.mongodb import connect_mongodb
from lib.redis_client import get_redis
from lib.limiter import limiter
from services.socket_service import socketio

# ── Validate Configuration ───────────────────────────────────────────
Config.validate()

# ── Create Flask app ─────────────────────────────────────────────────
app = Flask(__name__)
app.config["SECRET_KEY"] = Config.JWT_SECRET
app.config["DEBUG"] = False
app.config["TESTING"] = False

# ── CORS ─────────────────────────────────────────────────────────────
cors_origins = [
    re.compile(r"^https://.*\.vercel\.app$"),
    re.compile(r"^https://.*\.onrender\.com$"),
    re.compile(r"^https://.*\.neurocloak\.ai$"),
    re.compile(r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"),
    "https://neuro-cloak.vercel.app",
    "https://neurocloak.vercel.app",
    "https://neurocloak.ai",
    "https://www.neurocloak.ai",
]
if Config.FRONTEND_URL and Config.FRONTEND_URL not in cors_origins:
    cors_origins.append(Config.FRONTEND_URL)

CORS(
    app,
    origins=cors_origins,
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
)

# ── Rate Limiting ────────────────────────────────────────────────────
_redis_available = get_redis() is not None
storage_uri = Config.REDIS_URL if (Config.REDIS_URL and _redis_available) else "memory://"
app.config["RATELIMIT_STORAGE_URI"] = storage_uri
limiter.init_app(app)


@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "error": "Rate limit exceeded. Too many requests, please try again later."
    }), 429


# ── HTTP Security Headers ────────────────────────────────────────────
@app.after_request
def apply_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    # Prevent caching of sensitive API data
    if "Cache-Control" not in response.headers:
        response.headers["Cache-Control"] = "no-store, max-age=0"
    return response


# ── Register Blueprints ──────────────────────────────────────────────
from routes.auth import bp as auth_bp
from routes.decisions import bp as decisions_bp
from routes.systems import bp as systems_bp
from routes.analytics import bp as analytics_bp
from routes.anomalies import bp as anomalies_bp
from routes.chat import bp as chat_bp
from routes.utils import bp as utils_bp
from routes.contact import bp as contact_bp

app.register_blueprint(auth_bp)
app.register_blueprint(decisions_bp)
app.register_blueprint(systems_bp)
app.register_blueprint(analytics_bp)
app.register_blueprint(anomalies_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(utils_bp)
app.register_blueprint(contact_bp)


# ── Health Check ─────────────────────────────────────────────────────
@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "NeuroCloak API",
        "security": "hardened",
        "debug": False,
    })


# ── Ensure indexes on startup ────────────────────────────────────────
def _ensure_indexes():
    from models.user import ensure_indexes as user_idx
    from models.decision import ensure_indexes as dec_idx
    from models.reasoning_step import ensure_indexes as step_idx
    from models.bias_flag import ensure_indexes as bias_idx
    from models.ethics_check import ensure_indexes as ethics_idx
    from models.governance_rule import ensure_indexes as gov_idx
    from models.anomaly_alert import ensure_indexes as anomaly_idx

    user_idx()
    dec_idx()
    step_idx()
    bias_idx()
    ethics_idx()
    gov_idx()
    anomaly_idx()


# ── Initialize Socket.io ─────────────────────────────────────────────
socketio.init_app(app)


# ── Startup ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    connect_mongodb()
    _ensure_indexes()
    print(f"Server is running on port {Config.PORT} (debug=False)")
    socketio.run(app, host="0.0.0.0", port=Config.PORT, debug=False)
