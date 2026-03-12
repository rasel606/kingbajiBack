const request = require('supertest');
const { app } = require('../app');

describe('Health Check', () => {
  test('should respond with status 200', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });

  test('should return a JSON response', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
  });

  test('should include status and uptime fields', async () => {
    const response = await request(app).get('/health');
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('uptime');
  });
});
