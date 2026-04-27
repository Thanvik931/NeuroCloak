"""User collection – replaces models/User.ts."""

from lib.mongodb import get_db
from datetime import datetime, timezone


def collection():
    return get_db()["users"]


def ensure_indexes():
    col = collection()
    col.create_index("email", unique=True)


def create_user(email: str, password_hash: str, role: str = "VIEWER") -> dict:
    doc = {
        "email": email.lower().strip(),
        "passwordHash": password_hash,
        "role": role,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    }
    result = collection().insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def find_by_email(email: str) -> dict | None:
    return collection().find_one({"email": email.lower().strip()})


def find_by_id(user_id) -> dict | None:
    from bson import ObjectId
    try:
        return collection().find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None
