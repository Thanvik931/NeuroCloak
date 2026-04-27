"""Decision collection – replaces models/Decision.ts."""

from lib.mongodb import get_db
from datetime import datetime, timezone
from bson import ObjectId


VALID_STATUSES = ["PENDING", "APPROVED", "FLAGGED", "BLOCKED"]


def collection():
    return get_db()["decisions"]


def ensure_indexes():
    col = collection()
    col.create_index([("aiSystemId", 1), ("createdAt", -1)])
    col.create_index("userId")
    col.create_index([("createdAt", -1)])
    col.create_index("status")


def create(data: dict) -> dict:
    doc = {
        "aiSystemId": ObjectId(data["aiSystemId"]) if isinstance(data["aiSystemId"], str) else data["aiSystemId"],
        "userId": data.get("userId"),
        "inputData": data.get("inputData", {}),
        "outputDecision": data["outputDecision"],
        "confidenceScore": data["confidenceScore"],
        "cognitiveConsistency": data["cognitiveConsistency"],
        "transparencyIndex": data["transparencyIndex"],
        "ethicalComplianceRate": data["ethicalComplianceRate"],
        "adaptationSpeed": data["adaptationSpeed"],
        "selfRepairEfficiency": data.get("selfRepairEfficiency"),
        "status": data.get("status", "PENDING"),
        "createdAt": data.get("createdAt", datetime.now(timezone.utc)),
        "updatedAt": datetime.now(timezone.utc),
    }
    result = collection().insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def find_paginated(filter_dict: dict, page: int = 1, limit: int = 10) -> tuple[list[dict], int]:
    col = collection()
    total = col.count_documents(filter_dict)
    docs = list(
        col.find(filter_dict)
        .sort("createdAt", -1)
        .skip((page - 1) * limit)
        .limit(limit)
    )
    return docs, total


def find_by_id(decision_id) -> dict | None:
    try:
        return collection().find_one({"_id": ObjectId(decision_id)})
    except Exception:
        return None


def find_by_system(system_id, exclude_id=None, sort_dir=-1, limit=20) -> list[dict]:
    query = {"aiSystemId": ObjectId(system_id) if isinstance(system_id, str) else system_id}
    if exclude_id:
        query["_id"] = {"$ne": ObjectId(exclude_id) if isinstance(exclude_id, str) else exclude_id}
    return list(
        collection().find(query)
        .sort("createdAt", sort_dir)
        .limit(limit)
    )


def update_status(decision_id, status: str) -> dict | None:
    return collection().find_one_and_update(
        {"_id": ObjectId(decision_id)},
        {"$set": {"status": status, "updatedAt": datetime.now(timezone.utc)}},
        return_document=True,
    )


def aggregate(pipeline: list) -> list:
    return list(collection().aggregate(pipeline))
