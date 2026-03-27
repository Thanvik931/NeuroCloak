import { cdtSimulator as runCDTSimulation } from '../services/cdtSimulator';

// Mock Prisma so the test doesn't fail trying to read from the DB without a real system ID
jest.mock('../lib/prisma', () => ({
  prisma: {
    governanceRule: {
      findMany: jest.fn().mockResolvedValue([])
    }
  }
}));

describe('cdtSimulator', () => {
  it('returns all 5 required metrics', async () => {
    // Adapter for the requested test signature
    const result = await runCDTSimulation({
      aiSystemId: 'test-system',
      domain: 'healthcare',
      inputData: 'test input'
    });

    expect(result).toHaveProperty('cognitiveConsistency');
    expect(result).toHaveProperty('transparencyIndex');
    expect(result).toHaveProperty('ethicalComplianceRate');
    expect(result).toHaveProperty('adaptationSpeed');
    expect(result).toHaveProperty('selfRepairEfficiency');
    expect(result.reasoningTrace.length).toBeGreaterThan(0);
    expect(result.status).toMatch(/APPROVED|FLAGGED|BLOCKED/);
  });
});
