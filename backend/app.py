"""NeuroCloak Flask Backend – replaces index.ts.

This is the main entry point. It creates the Flask app, registers all
blueprints, sets up CORS, rate limiting, and Socket.io.
"""

import os
import sys

# Ensure backend/ is on sys.path so imports like `from config import ...` work
# regardless of the working directory.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import Config
from lib.mongodb import connect_mongodb
from services.socket_service import socketio

# ── Create Flask app ─────────────────────────────────────────────────
app = Flask(__name__)
app.config["SECRET_KEY"] = Config.JWT_SECRET

# ── CORS ─────────────────────────────────────────────────────────────
allowed_origins = [
    Config.FRONTEND_URL,
    "http://localhost:5173",
    "https://neuro-cloak.vercel.app",
]
CORS(
    app,
    origins=allowed_origins,
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
)

# ── Rate Limiting ────────────────────────────────────────────────────
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["1000 per 15 minutes"],
    storage_uri="memory://",
)

# Apply stricter limit to auth login
@limiter.limit("10 per 15 minutes")
@app.route("/api/auth/login_limiter_dummy")
def _login_limiter():
    pass  # limiter applied via blueprint decoration below

# ── Register Blueprints ──────────────────────────────────────────────
from routes.auth import bp as auth_bp
from routes.decisions import bp as decisions_bp
from routes.systems import bp as systems_bp
from routes.analytics import bp as analytics_bp
from routes.anomalies import bp as anomalies_bp
from routes.chat import bp as chat_bp
from routes.utils import bp as utils_bp

app.register_blueprint(auth_bp)
app.register_blueprint(decisions_bp)
app.register_blueprint(systems_bp)
app.register_blueprint(analytics_bp)
app.register_blueprint(anomalies_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(utils_bp)


# ── Health Check ─────────────────────────────────────────────────────
@app.route("/health")
def health():
    return jsonify({"status": "ok"})


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
    print(f"Server is running on port {Config.PORT}")
    socketio.run(app, host="0.0.0.0", port=Config.PORT, debug=(Config.ENV != "production"))
