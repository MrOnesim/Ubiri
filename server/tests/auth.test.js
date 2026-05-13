process.env.NODE_ENV = 'test';
const request = require('supertest');
const { app, initializeDb } = require('../index');

beforeAll(async () => {
  await initializeDb();
});

describe('Auth API', () => {
  it('should signup a new user', async () => {
    const res = await request(app)
      .post('/api/signup')
      .send({
        name: 'Test User',
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        role: 'client'
      });
    
    if (res.statusCode !== 201) {
      console.log('Signup Error Body:', res.body);
    }
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should not signup with existing email', async () => {
    const email = `duplicate_${Date.now()}@example.com`;
    await request(app)
      .post('/api/signup')
      .send({
        name: 'User 1',
        email,
        password: 'password123',
        role: 'client'
      });
    
    const res = await request(app)
      .post('/api/signup')
      .send({
        name: 'User 2',
        email,
        password: 'password123',
        role: 'client'
      });
    expect(res.statusCode).toEqual(400);
  });
});
