"""GovernanceRule collection – replaces models/GovernanceRule.ts."""

from lib.mongodb import get_db
from datetime import datetime, timezone
from bson import ObjectId


VALID_CATEGORIES = ["ethics", "legal", "safety", "fairness"]


def collection():
    return get_db()["governancerules"]


def ensure_indexes():
    col = collection()
    col.create_index("aiSystemId")


def create(data: dict) -> dict:
    doc = {
        "aiSystemId": ObjectId(data["aiSystemId"]) if isinstance(data["aiSystemId"], str) else data["aiSystemId"],
        "name": data["name"],
        "description": data.get("description", ""),
        "category": data["category"],
        "isActive": data.get("isActive", True),
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    }
    result = collection().insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def insert_many(rules: list[dict]) -> list:
    if not rules:
        return []
    docs = []
    for r in rules:
        docs.append({
            "aiSystemId": ObjectId(r["aiSystemId"]) if isinstance(r["aiSystemId"], str) else r["aiSystemId"],
            "name": r["name"],
            "description": r.get("description", ""),
            "category": r["category"],
            "isActive": r.get("isActive", True),
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc),
        })
    result = collection().insert_many(docs)
    for doc, oid in zip(docs, result.inserted_ids):
        doc["_id"] = oid
    return docs


def find_active_by_system(system_id) -> list[dict]:
    oid = ObjectId(system_id) if isinstance(system_id, str) else system_id
    return list(collection().find({"aiSystemId": oid, "isActive": True}))


def find_by_ids(rule_ids: list) -> list[dict]:
    oids = [ObjectId(r) if isinstance(r, str) else r for r in rule_ids]
    return list(collection().find({"_id": {"$in": oids}}))
