import request from 'supertest';
import { app } from '../index';
import mongoose from 'mongoose';
import { MongoMemoryServer, MongoMemoryReplSet } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import { User, AiSystem, GovernanceRule } from '../models';

let mongoServer: MongoMemoryReplSet;

describe('Simulate Endpoint', () => {
  let token: string;
  let aiSystemId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    await mongoose.connect(mongoServer.getUri());

    const passwordHash = await bcrypt.hash('Admin123!', 10);
    await User.create({ email: 'admin@neurocloak.ai', passwordHash, role: 'ADMIN' });

    const system = await AiSystem.create({
      name: 'TestSystem',
      domain: 'healthcare',
      description: 'Test'
    } as any);
    aiSystemId = system.id;

    await GovernanceRule.create({
      aiSystemId,
      name: 'Test Rule',
      category: 'ethics',
      description: 'test'
    } as any);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@neurocloak.ai',
        password: 'Admin123!'
      });
    token = loginRes.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('POST /api/decisions/simulate returns full decision', async () => {
    const response = await request(app)
      .post('/api/decisions/simulate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        aiSystemId,
        inputData: { test: 'data' }
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('outputDecision');
    expect(response.body.reasoningTrace).toBeDefined();
    expect(response.body.reasoningTrace.length).toBeGreaterThan(0);
    expect(response.body.ethicsChecks).toBeDefined();
  });
});
