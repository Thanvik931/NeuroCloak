"""Tests for authentication routes, JWT tokens, and RBAC privilege separation."""

import uuid
import pytest


def test_register_invalid_email(client):
    """Registration with invalid email format must be rejected with 400."""
    res = client.post(
        "/api/auth/register",
        json={"email": "not-an-email", "password": "securepassword123"},
    )
    assert res.status_code == 400
    data = res.get_json()
    assert "error" in data


def test_register_short_password(client):
    """Registration with password shorter than 6 characters must be rejected with 400."""
    res = client.post(
        "/api/auth/register",
        json={"email": "valid@example.com", "password": "123"},
    )
    assert res.status_code == 400
    data = res.get_json()
    assert "Password must be at least 6 characters" in data["error"]


def test_register_success(client):
    """Successful registration creates user and returns JWT token."""
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    res = client.post(
        "/api/auth/register",
        json={"email": unique_email, "password": "supersecretpassword123"},
    )
    assert res.status_code == 201
    data = res.get_json()
    assert "token" in data
    assert "user" in data
    assert data["user"]["email"] == unique_email


def test_login_invalid_credentials(client):
    """Login with non-existent credentials must return 401."""
    res = client.post(
        "/api/auth/login",
        json={"email": "nonexistent_user_999@example.com", "password": "wrongpassword"},
    )
    assert res.status_code == 401
    data = res.get_json()
    assert "error" in data


def test_auth_me_unauthorized(client):
    """Unauthenticated call to /api/auth/me must return 401."""
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_auth_me_authorized(client):
    """Authenticated call to /api/auth/me returns caller details."""
    unique_email = f"me_test_{uuid.uuid4().hex[:8]}@example.com"
    reg_res = client.post(
        "/api/auth/register",
        json={"email": unique_email, "password": "supersecurepassword123"},
    )
    assert reg_res.status_code == 201
    token = reg_res.get_json()["token"]

    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert "user" in data
    assert data["user"]["email"] == unique_email
    assert data["user"]["role"] in ("VIEWER", "ADMIN")


def test_privilege_escalation_viewer_blocked_from_admin(client, viewer_headers):
    """Users with VIEWER role must be blocked (403) from accessing admin routes."""
    res = client.post(
        "/api/systems/",
        headers=viewer_headers,
        json={"name": "Attacker System", "domain": "finance"},
    )
    assert res.status_code == 403
    data = res.get_json()
    assert "error" in data
