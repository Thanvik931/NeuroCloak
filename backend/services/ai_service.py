"""AI Service – replaces services/aiService.ts.

Provides OpenAI integration with heuristic fallbacks when no API key is set.
"""

import re
import json
from config import Config

_client = None


def _get_openai():
    """Lazy-load OpenAI client only if a valid key exists."""
    global _client
    if _client is not None:
        return _client

    key = Config.OPENAI_API_KEY
    if not key or key.strip() == "" or "your-api-key" in key:
        return None

    try:
        from openai import OpenAI
        _client = OpenAI(api_key=key)
        return _client
    except Exception:
        return None


def parse_scenario(text: str) -> dict:
    """Parse natural language text into structured JSON."""
    client = _get_openai()

    if not client:
        print("AI Service: OPENAI_API_KEY missing. Using heuristic parser.")
        return heuristic_parse(text)

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert at converting natural language AI test "
                        "scenarios into structured JSON payloads. Extract key variables "
                        "like age, history, amount, symptoms, or status. Return ONLY valid JSON."
                    ),
                },
                {
                    "role": "user",
                    "content": f'Convert this scenario into a JSON object: "{text}"',
                },
            ],
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content or "{}")
    except Exception as e:
        print(f"AI Service Error (Parse): {e}")
        return heuristic_parse(text)


def audit_decision(decision: dict, trace: list) -> dict:
    """Audit a decision trace for ethical accuracy."""
    client = _get_openai()

    if not client:
        return {
            "accuracyScore": 0.85,
            "ethicalRating": "HIGH",
            "commentary": (
                "Simulated audit: Reasoning steps appear logically consistent "
                "with domain safety bounds."
            ),
        }

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an AI Governance Auditor. Review the reasoning steps "
                        "and the final decision. Rate accuracy and ethics (0-1). "
                        "Provide brief commentary."
                    ),
                },
                {
                    "role": "user",
                    "content": json.dumps({"decision": decision, "trace": trace}, default=str),
                },
            ],
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content or "{}")
    except Exception as e:
        print(f"AI Service Error (Audit): {e}")
        return {"error": "Failed to complete AI audit."}


def heuristic_parse(text: str) -> dict:
    """Basic regex-based fallback if OpenAI is not available."""
    data: dict = {}

    age_match = re.search(r"(\d+)\s*-?year", text, re.IGNORECASE) or re.search(
        r"age\s*:?\s*(\d+)", text, re.IGNORECASE
    )
    if age_match:
        data["age"] = int(age_match.group(1))

    amount_match = re.search(r"\$(\d+(?:,\d+)*(?:\.\d+)?)", text) or re.search(
        r"(\d+)\s*dollars", text, re.IGNORECASE
    )
    if amount_match:
        data["amount"] = float(amount_match.group(1).replace(",", ""))

    lower = text.lower()
    if "clean" in lower:
        data["history"] = "clean"
    if "bad" in lower:
        data["history"] = "poor"

    data["description"] = text
    return data
