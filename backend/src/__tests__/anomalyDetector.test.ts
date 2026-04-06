import { detectAnomalies } from '../services/anomalyDetector';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Decision, AnomalyAlert } from '../models';

let mongoServer: MongoMemoryServer;

describe('Anomaly Detector', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Decision.deleteMany({});
    await AnomalyAlert.deleteMany({});
  });

  it('fires when compliance drops 15%+', async () => {
    const aiSystemId = new mongoose.Types.ObjectId();
    const mockHistory = Array.from({ length: 20 }).map((_, i) => ({
      aiSystemId,
      inputData: {},
      outputDecision: "ACCEPT",
      confidenceScore: 0.9,
      cognitiveConsistency: 0.9,
      transparencyIndex: 0.9,
      ethicalComplianceRate: 0.90, // Baseline will be 0.90
      adaptationSpeed: 0.9,
      status: 'APPROVED',
      createdAt: new Date()
    }));

    await Decision.insertMany(mockHistory);

    const newDecision: any = {
      _id: new mongoose.Types.ObjectId(),
      aiSystemId,
      ethicalComplianceRate: 0.60,
      status: 'APPROVED'
    };

    await detectAnomalies(newDecision, aiSystemId.toString());
    
    const anomalies = await AnomalyAlert.find({ aiSystemId });
    expect(anomalies.length).toBeGreaterThan(0);
    expect(anomalies[0].type).toBe('compliance_drop');
  });
});
