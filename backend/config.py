import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Central configuration loaded from environment variables."""
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/neurocloak")
    REDIS_URL = os.getenv("REDIS_URL", os.getenv("RDB_URL", ""))
    JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-in-prod")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    PORT = int(os.getenv("PORT", "4000"))
    ENV = os.getenv("NODE_ENV", os.getenv("FLASK_ENV", "development"))
