"""AiSystem collection – replaces models/AiSystem.ts."""

from lib.mongodb import get_db
from datetime import datetime, timezone
from bson import ObjectId


VALID_DOMAINS = ["healthcare", "finance", "defense", "industrial", "logistics", "cybersecurity"]


def collection():
    return get_db()["aisystems"]


def ensure_indexes():
    pass  # No special indexes beyond _id


def create(data: dict) -> dict:
    doc = {
        "name": data["name"],
        "domain": data["domain"],
        "description": data.get("description", ""),
        "isActive": data.get("isActive", True),
        "accuracy": data.get("accuracy", 0),
        "precision": data.get("precision", 0),
        "recall": data.get("recall", 0),
        "fairnessScore": data.get("fairnessScore", 0),
        "trainingDatasetSize": data.get("trainingDatasetSize", 0),
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    }
    result = collection().insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def find_active(page: int = 1, limit: int = 10) -> tuple[list[dict], int]:
    col = collection()
    total = col.count_documents({"isActive": True})
    docs = list(
        col.find({"isActive": True})
        .sort("createdAt", -1)
        .skip((page - 1) * limit)
        .limit(limit)
    )
    return docs, total


def find_by_id(system_id) -> dict | None:
    try:
        return collection().find_one({"_id": ObjectId(system_id)})
    except Exception:
        return None


def update_by_id(system_id, updates: dict) -> dict | None:
    updates["updatedAt"] = datetime.now(timezone.utc)
    result = collection().find_one_and_update(
        {"_id": ObjectId(system_id)},
        {"$set": updates},
        return_document=True,
    )
    return result


def count_active() -> int:
    return collection().count_documents({"isActive": True})


def find_one_sorted(sort_field: str, direction: int = -1) -> dict | None:
    return collection().find_one(sort=[(sort_field, direction)])


def find_by_name_regex(pattern: str) -> dict | None:
    import re
    return collection().find_one({"name": re.compile(pattern, re.IGNORECASE)})
