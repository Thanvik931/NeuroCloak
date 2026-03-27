import { prisma } from '../lib/prisma';
import { emitEvent } from './socketService';

export const detectAnomalies = async (decision: any, mockHistory?: any[]) => {
  const anomalies = [];

  // We only look at recent history for the same AI system
  const recentHistory = mockHistory || await prisma.decision.findMany({
    where: {
      aiSystemId: decision.aiSystemId,
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 100 // Limit to 100 recent decisions
  });

  // 1. High Severity Bias Spike
  const severeBiases = decision.biasFlags?.filter((b: any) => b.severity === 'high' || b.severity === 'critical') || [];
  if (severeBiases.length >= 2) {
    anomalies.push({
      type: 'severe_bias',
      decisionId: decision.id,
      severity: 'critical',
      description: 'Multiple critical biases detected in a single decision trace.'
    });
  }

  // 2. Sudden Compliance Drop
  if (decision.ethicalComplianceRate <= 0.6) {
    const past10 = recentHistory.slice(0, 10);
    const last10Avg = past10.reduce((acc: any, d: any) => acc + d.ethicalComplianceRate, 0) / (past10.length || 1);
    
    if (last10Avg - decision.ethicalComplianceRate > 0.15) {
      anomalies.push({
        type: 'compliance_drop',
        decisionId: decision.id,
        severity: 'critical',
        description: `Sudden compliance drop detected (${last10Avg.toFixed(2)} -> ${decision.ethicalComplianceRate})`
      });
    }
  }

  // 3. Unexpected System Block
  if (decision.status === 'BLOCKED') {
    anomalies.push({
      type: 'system_blocked',
      decisionId: decision.id,
      severity: 'high',
      description: 'AI System blocked a decision due to governance rule violation.'
    });
  }

  if (anomalies.length > 0) {
    // Create in DB
    const createdAnomalies = await Promise.all(anomalies.map(({ type, ...data }) => {
      // @ts-ignore
      return prisma.anomalyAlert.create({ data });
    }));

    // Broadcast over WebSockets
    createdAnomalies.forEach(alert => {
      emitEvent('anomaly_detected', alert);
    });
  }

  return anomalies;
};
