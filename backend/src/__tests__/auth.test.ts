import request from 'supertest';
import { app } from '../index';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import { User } from '../models';

let mongoServer: MongoMemoryServer;

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    await User.create({ email: 'admin@neurocloak.ai', passwordHash, role: 'ADMIN' });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('POST /api/auth/login returns token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@neurocloak.ai',
        password: 'Admin123!'
      });
      
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
  });
});
