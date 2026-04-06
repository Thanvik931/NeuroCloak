import { cdtSimulator as runCDTSimulation } from '../services/cdtSimulator';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

describe('cdtSimulator', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('returns all 5 required metrics', async () => {
    const result = await runCDTSimulation({
      aiSystemId: new mongoose.Types.ObjectId().toString(),
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
