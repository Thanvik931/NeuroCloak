"""Socket.io service – replaces services/socketService.ts.

Uses Flask-SocketIO.  The ``init_socketio`` function is called from ``app.py``
to bind to the Flask app.  ``emit_event`` broadcasts to all connected clients.
"""

from flask_socketio import SocketIO
import jwt as pyjwt
from config import Config

socketio = SocketIO(cors_allowed_origins="*", async_mode="eventlet")


@socketio.on("connect")
def handle_connect(auth=None):
    """Authenticate socket connections using the same JWT/Firebase logic."""
    from flask import request as flask_request

    token = None
    if auth and isinstance(auth, dict):
        token = auth.get("token")
    if not token:
        # Try query string fallback
        token = flask_request.args.get("token")
    if not token:
        return False  # reject connection

    # 1. Try internal JWT
    try:
        pyjwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
        print(f"Client connected: {flask_request.sid}")
        return True
    except Exception:
        pass

    # 2. Try Firebase decode
    try:
        decoded = pyjwt.decode(token, options={"verify_signature": False})
        iss = decoded.get("iss", "")
        aud = str(decoded.get("aud", ""))
        is_firebase = "firebase" in iss or "google.com" in iss or "neurocloak" in aud
        if is_firebase:
            print(f"Client connected (Firebase): {flask_request.sid}")
            return True
    except Exception:
        pass

    print("Socket Auth Rejected")
    return False  # reject


def emit_event(event: str, data: dict):
    """Broadcast an event to all connected clients."""
    socketio.emit(event, data)
