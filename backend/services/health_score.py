"""Health score calculator – replaces services/healthScore.ts."""


def calculate_health_score(metrics: dict) -> float:
    """Calculate a weighted health score (0-100).

    Weights: 40% compliance, 30% transparency, 20% consistency, 10% repair.
    """
    comp = metrics.get("ethicalComplianceRate", 0)
    trans = metrics.get("transparencyIndex", 0)
    cog = metrics.get("cognitiveConsistency", 0)
    repair = metrics.get("selfRepairEfficiency", 0)

    return (comp * 40) + (trans * 30) + (cog * 20) + (repair * 10)
