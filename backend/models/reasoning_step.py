"""ReasoningStep collection – replaces models/ReasoningStep.ts."""

from lib.mongodb import get_db
from datetime import datetime, timezone
from bson import ObjectId


def collection():
    return get_db()["reasoningsteps"]


def ensure_indexes():
    col = collection()
    col.create_index([("decisionId", 1), ("stepNumber", 1)])
    col.create_index([("createdAt", -1)])


def insert_many(steps: list[dict]) -> list:
    if not steps:
        return []
    docs = []
    for s in steps:
        docs.append({
            "decisionId": ObjectId(s["decisionId"]) if isinstance(s["decisionId"], str) else s["decisionId"],
            "stepNumber": s["stepNumber"],
            "layer": s["layer"],
            "description": s["description"],
            "inputValue": s.get("inputValue", ""),
            "outputValue": s.get("outputValue", ""),
            "confidence": s["confidence"],
            "isInterpretable": s.get("isInterpretable", True),
            "durationMs": s["durationMs"],
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc),
        })
    result = collection().insert_many(docs)
    for doc, oid in zip(docs, result.inserted_ids):
        doc["_id"] = oid
    return docs


def find_by_decision(decision_id) -> list[dict]:
    return list(
        collection()
        .find({"decisionId": ObjectId(decision_id) if isinstance(decision_id, str) else decision_id})
        .sort("stepNumber", 1)
    )
