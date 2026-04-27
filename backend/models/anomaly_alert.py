"""AnomalyAlert collection – replaces models/AnomalyAlert.ts."""

from lib.mongodb import get_db
from datetime import datetime, timezone
from bson import ObjectId


def collection():
    return get_db()["anomalyalerts"]


def ensure_indexes():
    col = collection()
    col.create_index("aiSystemId")
    col.create_index("resolved")


def create(data: dict) -> dict:
    doc = {
        "aiSystemId": ObjectId(data["aiSystemId"]) if isinstance(data["aiSystemId"], str) else data["aiSystemId"],
        "decisionId": ObjectId(data["decisionId"]) if isinstance(data["decisionId"], str) else data["decisionId"],
        "type": data["type"],
        "message": data["message"],
        "severity": data["severity"],
        "resolved": data.get("resolved", False),
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    }
    result = collection().insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def find_unresolved() -> list[dict]:
    return list(
        collection()
        .find({"resolved": False})
        .sort("createdAt", -1)
    )


def resolve(alert_id) -> dict | None:
    return collection().find_one_and_update(
        {"_id": ObjectId(alert_id)},
        {"$set": {"resolved": True, "updatedAt": datetime.now(timezone.utc)}},
        return_document=True,
    )


def count_unresolved() -> int:
    return collection().count_documents({"resolved": False})
