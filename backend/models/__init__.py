"""MongoDB collection accessor helpers.

With PyMongo we don't have Mongoose schemas, so each model module exposes:
  - A function to get the collection reference
  - Helper functions for serialisation (converting ObjectId → str "id")
  - Index-creation functions called once at startup
"""

from lib.mongodb import get_db
from bson import ObjectId
from datetime import datetime, timezone


def serialize_doc(doc: dict | None) -> dict | None:
    """Convert a MongoDB document to a JSON-safe dict.
    
    - Converts ``_id`` → string ``id`` field  
    - Converts any nested ObjectId values to strings
    - Converts datetime objects to ISO strings
    """
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == "_id":
            result["_id"] = str(value)
            result["id"] = str(value)
        elif isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, dict):
            result[key] = serialize_doc(value)
        elif isinstance(value, list):
            result[key] = [
                serialize_doc(v) if isinstance(v, dict) else
                str(v) if isinstance(v, ObjectId) else
                v.isoformat() if isinstance(v, datetime) else v
                for v in value
            ]
        else:
            result[key] = value
    return result


def serialize_docs(docs: list[dict]) -> list[dict]:
    """Serialize a list of MongoDB documents."""
    return [serialize_doc(d) for d in docs]
