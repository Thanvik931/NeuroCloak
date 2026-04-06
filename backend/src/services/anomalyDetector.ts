import { Decision, BiasFlag, AnomalyAlert } from '../models';
import { IDecision } from '../models/Decision';
import { emitEvent } from './socketService';

export async function detectAnomalies(
  newDecision: IDecision,
  aiSystemId: string
): Promise<void> {

  // Fetch last 20 decisions for baseline
  const history = await Decision
    .find({
      aiSystemId,
      _id: { $ne: newDecision._id }
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  // Need at least 5 historical decisions
  if (history.length < 5) return;

  const anomalies = [];

  // CHECK A — Compliance Drop
  const baseline = history.reduce((sum, d) => sum + d.ethicalComplianceRate, 0) / history.length;

  if (newDecision.ethicalComplianceRate < (baseline - 0.15)) {
    anomalies.push({
      type: 'compliance_drop',
      message: `Compliance dropped below baseline (baseline: ${(baseline * 100).toFixed(1)}%, current: ${(newDecision.ethicalComplianceRate * 100).toFixed(1)}%)`,
      severity: 'critical'
    });
  }

  // CHECK B — Unexpected Bias Spike
  const last5 = history.slice(0, 5);
  const recentBiasCount = await BiasFlag.countDocuments({
    decisionId: { $in: last5.map(d => d._id) }
  });

  const newDecisionHasBias = await BiasFlag.countDocuments({ decisionId: newDecision._id });

  if (recentBiasCount === 0 && newDecisionHasBias > 0) {
    anomalies.push({
      type: 'bias_spike',
      message: 'Bias detected after 5 consecutive clean decisions',
      severity: 'warning'
    });
  }

  // CHECK C — First Block in Clean Run
  const last10Statuses = history.slice(0, 10).map(d => d.status);
  const allApproved = last10Statuses.every(s => s === 'APPROVED');

  if (allApproved && newDecision.status === 'BLOCKED') {
    anomalies.push({
      type: 'unexpected_block',
      message: 'First BLOCKED decision after 10 consecutive APPROVED decisions',
      severity: 'critical'
    });
  }

  // Save and emit each anomaly
  for (const anomaly of anomalies) {
    const alert = await AnomalyAlert.create({
      aiSystemId,
      decisionId: newDecision._id,
      type:       anomaly.type,
      message:    anomaly.message,
      severity:   anomaly.severity
    });

    emitEvent('anomaly_detected', {
      systemName: newDecision.aiSystemId,
      type:       anomaly.type,
      message:    anomaly.message,
      severity:   anomaly.severity,
      decisionId: newDecision._id.toString()
    });
  }
}
