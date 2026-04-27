"""Database seeder – replaces seed.ts.

Run with:  python seed.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bcrypt
import random
from datetime import datetime, timezone, timedelta
from config import Config
from lib.mongodb import connect_mongodb, get_db


def clear_db():
    db = get_db()
    for name in ["users", "aisystems", "governancerules", "decisions",
                  "reasoningsteps", "biasflags", "ethicschecks", "anomalyalerts"]:
        db[name].delete_many({})


def run_seed():
    connect_mongodb()
    print("🌱 Connected to MongoDB. Clearing database...")
    clear_db()
    db = get_db()

    # 1. Create Users
    print("👥 Creating Users...")
    pw = bcrypt.hashpw(b"password123", bcrypt.gensalt(12)).decode()
    now = datetime.now(timezone.utc)

    admin = db.users.insert_one({"email": "admin@neurocloak.ai", "passwordHash": pw, "role": "ADMIN", "createdAt": now, "updatedAt": now})
    db.users.insert_one({"email": "auditor@neurocloak.ai", "passwordHash": pw, "role": "AUDITOR", "createdAt": now, "updatedAt": now})
    db.users.insert_one({"email": "viewer@neurocloak.ai", "passwordHash": pw, "role": "VIEWER", "createdAt": now, "updatedAt": now})

    # 2. Create AI Systems
    print("💎 Creating PERFECTION-MODE AI Systems (100% Efficiency)...")
    systems_data = [
        {"name": "CreditApproval-AI", "domain": "finance", "description": "Ultra-precision mortgage assessment. Verified zero-error boundary.", "accuracy": 99.9, "fairnessScore": 100, "trainingDatasetSize": 1500000},
        {"name": "MedDiag-Vision", "domain": "healthcare", "description": "Perfect oncology diagnostic imaging. Master-level precision.", "accuracy": 100, "fairnessScore": 100, "trainingDatasetSize": 2200000},
        {"name": "HireBot-Recruiter", "domain": "industrial", "description": "Bias-free cognitive candidate ranking. Perfect demographic parity.", "accuracy": 99.8, "fairnessScore": 100, "trainingDatasetSize": 1100000},
        {"name": "LogiRoute-Core", "domain": "logistics", "description": "Global supply chain master. 100% optimization efficiency.", "accuracy": 100, "fairnessScore": 100, "trainingDatasetSize": 4500000},
        {"name": "CyberGuard-DNS", "domain": "cybersecurity", "description": "Omniscient threat detection. Zero false negatives at scale.", "accuracy": 100, "fairnessScore": 100, "trainingDatasetSize": 8900000},
        {"name": "AutoPilot-Astra", "domain": "defense", "description": "Absolute flight mastery. 0ms latency cognitive response.", "accuracy": 99.9, "fairnessScore": 100, "trainingDatasetSize": 12500000},
    ]

    systems = []
    for sd in systems_data:
        sd.update({"isActive": True, "precision": 0, "recall": 0, "createdAt": now, "updatedAt": now})
        result = db.aisystems.insert_one(sd)
        sd["_id"] = result.inserted_id
        systems.append(sd)

    # 3. Create Governance Rules
    print("⚖️ Creating Governance Rules...")
    all_rules = []
    for sys in systems:
        for name, cat, desc in [
            ("Fairness Check", "fairness", "Ensure output is statistically fair across demographics"),
            ("Ethics Check", "ethics", "Output logic must be ethical and transparent"),
            ("Safety Constraint", "safety", "Ensure the output does not violate basic safety bounds"),
        ]:
            all_rules.append({
                "aiSystemId": sys["_id"], "name": name, "category": cat,
                "description": desc, "isActive": True,
                "createdAt": now, "updatedAt": now,
            })
    result = db.governancerules.insert_many(all_rules)
    for rule, oid in zip(all_rules, result.inserted_ids):
        rule["_id"] = oid

    # 4. Create Decisions (500 total)
    print("⚡ Generating 500 Ultra-Strict decisions for Analytics Dashboard...")
    for i in range(500):
        target = systems[i % len(systems)]
        status_roll = random.random()
        status = "BLOCKED" if status_roll > 0.95 else ("FLAGGED" if status_roll > 0.90 else "APPROVED")
        compliance = 0.88 if status == "BLOCKED" else (0.94 if status == "FLAGGED" else 1.0)

        created_at = now - timedelta(days=random.randint(0, 90))

        decision_doc = {
            "aiSystemId": target["_id"],
            "userId": str(admin.inserted_id),
            "inputData": {"sequence": f"Cognitive pattern {i}"},
            "outputDecision": "Rejected post-audit" if status == "BLOCKED" else ("Approved with warnings" if status == "FLAGGED" else "Accept"),
            "confidenceScore": (0.992 + random.random() * 0.008) if status == "APPROVED" else (0.82 + random.random() * 0.05),
            "cognitiveConsistency": 0.998,
            "transparencyIndex": 0.99,
            "ethicalComplianceRate": compliance,
            "adaptationSpeed": 0.999,
            "selfRepairEfficiency": 1.0,
            "status": status,
            "createdAt": created_at,
            "updatedAt": created_at,
        }
        dec_result = db.decisions.insert_one(decision_doc)
        dec_id = dec_result.inserted_id

        # Reasoning Steps
        db.reasoningsteps.insert_many([
            {"decisionId": dec_id, "stepNumber": 1, "description": "Data preprocessing and normalization", "layer": "Input Layer", "confidence": 0.95, "durationMs": 12, "inputValue": "", "outputValue": "", "isInterpretable": True, "createdAt": created_at, "updatedAt": created_at},
            {"decisionId": dec_id, "stepNumber": 2, "description": "Feature extraction and embedding generation", "layer": "Hidden Layer 1", "confidence": 0.88, "durationMs": 45, "inputValue": "", "outputValue": "", "isInterpretable": True, "createdAt": created_at, "updatedAt": created_at},
            {"decisionId": dec_id, "stepNumber": 3, "description": "Final classification mapping", "layer": "Output Layer", "confidence": decision_doc["confidenceScore"], "durationMs": 8, "inputValue": "", "outputValue": "", "isInterpretable": True, "createdAt": created_at, "updatedAt": created_at},
        ])

        # Ethics Checks
        sys_rules = [r for r in all_rules if r["aiSystemId"] == target["_id"]]
        ethics = []
        for rule in sys_rules:
            passed = (status != "BLOCKED") or (random.random() > 0.5)
            ethics.append({
                "decisionId": dec_id, "ruleId": rule["_id"],
                "passed": passed,
                "reason": "Check passed normally" if passed else "Violation detected in layer activations",
                "checkedAt": created_at, "createdAt": created_at, "updatedAt": created_at,
            })
        if ethics:
            db.ethicschecks.insert_many(ethics)

        # Bias Flags
        if status != "APPROVED":
            db.biasflags.insert_one({
                "decisionId": dec_id,
                "biasType": "Demographic Skew" if i % 2 == 0 else "Historical Data Bias",
                "severity": "critical" if status == "BLOCKED" else "medium",
                "description": "Detected a potential shift in decision boundary affecting marginalized groups.",
                "corrected": status == "FLAGGED",
                "correctionNote": "Applied reweighing algorithm to dataset prior." if status == "FLAGGED" else None,
                "detectedAt": created_at, "createdAt": created_at, "updatedAt": created_at,
            })

    print("✅ Seed complete!")


if __name__ == "__main__":
    run_seed()
