"""Pytest fixtures for NeuroCloak Backend API & ML Services."""

import os
import sys
from datetime import datetime, timezone, timedelta
import pytest
import jwt as pyjwt

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import app
from config import Config
from lib.mongodb import connect_mongodb


@pytest.fixture(scope="session")
def flask_app():
    """Session-scoped Flask application instance."""
    app.config["TESTING"] = True
    connect_mongodb()
    return app


@pytest.fixture
def client(flask_app):
    """Provides test HTTP client."""
    with flask_app.test_client() as test_client:
        yield test_client


@pytest.fixture
def admin_token():
    """Generates a verified JWT token with ADMIN role."""
    exp = datetime.now(timezone.utc) + timedelta(hours=2)
    return pyjwt.encode(
        {
            "userId": "test-admin-uid-001",
            "role": "ADMIN",
            "exp": exp,
            "iat": datetime.now(timezone.utc),
        },
        Config.JWT_SECRET,
        algorithm="HS256",
    )


@pytest.fixture
def viewer_token():
    """Generates a verified JWT token with VIEWER role."""
    exp = datetime.now(timezone.utc) + timedelta(hours=2)
    return pyjwt.encode(
        {
            "userId": "test-viewer-uid-002",
            "role": "VIEWER",
            "exp": exp,
            "iat": datetime.now(timezone.utc),
        },
        Config.JWT_SECRET,
        algorithm="HS256",
    )


@pytest.fixture
def admin_headers(admin_token):
    return {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json",
    }


@pytest.fixture
def viewer_headers(viewer_token):
    return {
        "Authorization": f"Bearer {viewer_token}",
        "Content-Type": "application/json",
    }
