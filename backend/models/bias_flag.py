"""BiasFlag collection – replaces models/BiasFlag.ts."""

from lib.mongodb import get_db
from datetime import datetime, timezone
from bson import ObjectId


VALID_SEVERITIES = ["low", "medium", "high", "critical"]


def collection():
    return get_db()["biasflags"]


def ensure_indexes():
    col = collection()
    col.create_index("decisionId")


def create(data: dict) -> dict:
    doc = {
        "decisionId": ObjectId(data["decisionId"]) if isinstance(data["decisionId"], str) else data["decisionId"],
        "biasType": data["biasType"],
        "severity": data["severity"],
        "description": data["description"],
        "corrected": data.get("corrected", False),
        "correctionNote": data.get("correctionNote"),
        "detectedAt": data.get("detectedAt", datetime.now(timezone.utc)),
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    }
    result = collection().insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def insert_many(flags: list[dict]) -> list:
    if not flags:
        return []
    docs = []
    for f in flags:
        docs.append({
            "decisionId": ObjectId(f["decisionId"]) if isinstance(f["decisionId"], str) else f["decisionId"],
            "biasType": f["biasType"],
            "severity": f["severity"],
            "description": f["description"],
            "corrected": f.get("corrected", False),
            "correctionNote": f.get("correctionNote"),
            "detectedAt": f.get("detectedAt", datetime.now(timezone.utc)),
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc),
        })
    result = collection().insert_many(docs)
    for doc, oid in zip(docs, result.inserted_ids):
        doc["_id"] = oid
    return docs


def count_by_decisions(decision_ids: list) -> int:
    oids = [ObjectId(d) if isinstance(d, str) else d for d in decision_ids]
    return collection().count_documents({"decisionId": {"$in": oids}})


def count_by_decision(decision_id) -> int:
    oid = ObjectId(decision_id) if isinstance(decision_id, str) else decision_id
    return collection().count_documents({"decisionId": oid})


def find_by_decisions(decision_ids: list) -> list[dict]:
    oids = [ObjectId(d) if isinstance(d, str) else d for d in decision_ids]
    return list(collection().find({"decisionId": {"$in": oids}}))


def aggregate(pipeline: list) -> list:
    return list(collection().aggregate(pipeline))
