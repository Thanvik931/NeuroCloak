"""PyMongo connection manager – replaces lib/mongodb.ts."""

from pymongo import MongoClient
from pymongo.database import Database
from config import Config

_client: MongoClient | None = None
_db: Database | None = None


def connect_mongodb() -> Database:
    """Connect to MongoDB and return the database handle."""
    global _client, _db
    if _db is not None:
        return _db

    uri = Config.MONGODB_URI
    masked = uri.split("@")[-1] if "@" in uri else uri
    print(f"Connecting to MongoDB: ...@{masked}")

    _client = MongoClient(
        uri,
        maxPoolSize=10,
        serverSelectionTimeoutMS=10000,
        socketTimeoutMS=45000,
    )
    # Force a connection check
    _client.admin.command("ping")
    # Extract database name from URI, fallback to 'neurocloak'
    db_name = uri.rsplit("/", 1)[-1].split("?")[0] if "/" in uri else "neurocloak"
    _db = _client[db_name]
    print("MongoDB connected successfully")
    return _db


def get_db() -> Database:
    """Return the current database handle, connecting if needed."""
    global _db
    if _db is None:
        return connect_mongodb()
    return _db


def disconnect_mongodb() -> None:
    """Gracefully close the MongoDB connection."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        print("MongoDB disconnected")
