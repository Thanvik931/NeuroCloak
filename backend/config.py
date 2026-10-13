import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Central configuration loaded from environment variables."""
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/neurocloak")
    REDIS_URL = os.getenv("REDIS_URL", os.getenv("RDB_URL", ""))
    JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-in-prod")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    PORT = int(os.getenv("PORT", "4000"))
    ENV = os.getenv("NODE_ENV", os.getenv("FLASK_ENV", "development"))
    ADMIN_EMAILS = [
        email.strip().lower()
        for email in os.getenv("ADMIN_EMAILS", "thanvikreddy2@gmail.com,admin@neurocloak.com").split(",")
        if email.strip()
    ]

    @classmethod
    def validate(cls):
        """Validate critical production constraints."""
        if cls.ENV == "production":
            if not cls.JWT_SECRET or cls.JWT_SECRET == "super-secret-key-change-in-prod":
                raise ValueError(
                    "SECURITY ERROR: Insecure default JWT_SECRET detected in production. "
                    "You must provide a strong, non-default JWT_SECRET in your environment."
                )
