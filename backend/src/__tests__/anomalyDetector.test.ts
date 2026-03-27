import { detectAnomalies } from '../services/anomalyDetector';

describe('Anomaly Detector', () => {
  it('fires when compliance drops 15%+', async () => {
    const mockHistory = Array.from({ length: 20 }).map((_, i) => ({
      id: `hist-${i}`,
      aiSystemId: 'test-system',
      ethicalComplianceRate: 0.90,
      createdAt: new Date()
    }));

    const newDecision = {
      id: 'new-1',
      aiSystemId: 'test-system',
      ethicalComplianceRate: 0.60,
      biasFlags: [],
      status: 'APPROVED'
    };

    const anomalies = await detectAnomalies(newDecision, mockHistory);
    
    expect(anomalies.length).toBeGreaterThan(0);
    expect(anomalies[0].type).toBe('compliance_drop');
  });
});
