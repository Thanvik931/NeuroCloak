"""EthicsCheck collection – replaces models/EthicsCheck.ts."""

from lib.mongodb import get_db
from datetime import datetime, timezone
from bson import ObjectId


def collection():
    return get_db()["ethicschecks"]


def ensure_indexes():
    col = collection()
    col.create_index("decisionId")


def insert_many(checks: list[dict]) -> list:
    if not checks:
        return []
    docs = []
    for c in checks:
        docs.append({
            "decisionId": ObjectId(c["decisionId"]) if isinstance(c["decisionId"], str) else c["decisionId"],
            "ruleId": ObjectId(c["ruleId"]) if isinstance(c["ruleId"], str) else c["ruleId"],
            "passed": c["passed"],
            "reason": c["reason"],
            "checkedAt": c.get("checkedAt", datetime.now(timezone.utc)),
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc),
        })
    result = collection().insert_many(docs)
    for doc, oid in zip(docs, result.inserted_ids):
        doc["_id"] = oid
    return docs


def find_by_decision(decision_id) -> list[dict]:
    oid = ObjectId(decision_id) if isinstance(decision_id, str) else decision_id
    return list(collection().find({"decisionId": oid}))
