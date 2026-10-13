"""Tests for AI Systems routes and role permissions."""

import uuid
import pytest


def test_list_systems_authenticated(client, viewer_headers):
    """Authenticated users can list active AI systems."""
    res = client.get("/api/systems/", headers=viewer_headers)
    assert res.status_code == 200
    body = res.get_json()
    assert "data" in body
    assert isinstance(body["data"], list)
    assert len(body["data"]) > 0
    # Verify core system properties
    first = body["data"][0]
    assert "id" in first or "_id" in first
    assert "name" in first
    assert "domain" in first


def test_get_system_invalid_id(client, viewer_headers):
    """Retrieving a non-existent or malformed system ID returns 404."""
    res = client.get("/api/systems/000000000000000000000000", headers=viewer_headers)
    assert res.status_code == 404


def test_create_system_admin_success(client, admin_headers):
    """Admin users can register a new AI system."""
    sys_name = f"Test Autonomous System {uuid.uuid4().hex[:6]}"
    res = client.post(
        "/api/systems/",
        headers=admin_headers,
        json={
            "name": sys_name,
            "domain": "finance",
            "version": "1.0.0",
            "description": "Integration testing system",
        },
    )
    assert res.status_code == 201
    created = res.get_json()
    assert created["name"] == sys_name
    assert created["domain"] == "finance"


def test_create_system_missing_fields(client, admin_headers):
    """Attempting to create a system without required name or domain returns 400."""
    res = client.post(
        "/api/systems/",
        headers=admin_headers,
        json={"description": "Missing name and domain"},
    )
    assert res.status_code == 400
