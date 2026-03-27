import { calculateHealthScore } from '../services/healthScore';

describe('Health Score Calculation', () => {
  it('computes correctly from known inputs', () => {
    const metrics = {
      cognitiveConsistency: 0.90,
      transparencyIndex: 0.85,
      ethicalComplianceRate: 0.92,
      selfRepairEfficiency: 0.88,
      adaptationSpeed: 200
    };

    const score = calculateHealthScore(metrics);
    
    expect(score).toBeGreaterThanOrEqual(85);
    expect(score).toBeLessThanOrEqual(100);
    expect(typeof score).toBe('number');
  });
});
