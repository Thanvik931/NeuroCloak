import request from 'supertest';
import { app } from '../index';

describe('Auth Endpoints', () => {
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
