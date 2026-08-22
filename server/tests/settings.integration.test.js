const request = require('supertest');
const app = require('../server');
const db = require('./setup');
const User = require('../models/User');

describe('Settings API (Integration Tests)', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await db.connect();
  }, 30000);

  afterAll(async () => {
    await db.closeDatabase();
  }, 30000);

  beforeEach(async () => {
    await db.clearDatabase();

    const user = await User.create({
      name: 'Test Settings User',
      email: 'settings@example.com',
      password: 'Password123!',
      username: 'settingsuser'
    });

    userId = user._id;

    // Login to get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'settings@example.com', password: 'Password123!' });

    token = res.body.token;
  });

  describe('GET /api/settings', () => {
    it('should fetch user settings correctly', async () => {
      const res = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.account.email).toBe('settings@example.com');
      expect(res.body.data.notifications.jobRecommendations).toBe(true);
    });
  });

  describe('PATCH /api/settings/job-preferences', () => {
    it('should update job preferences successfully', async () => {
      const res = await request(app)
        .patch('/api/settings/job-preferences')
        .set('Authorization', `Bearer ${token}`)
        .send({
          preferredRoles: 'Frontend Developer, Full Stack',
          workMode: 'remote',
          minSalary: 80000,
          maxSalary: 120000
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.minSalary).toBe(80000);
    });

    it('should reject invalid salary ranges', async () => {
      const res = await request(app)
        .patch('/api/settings/job-preferences')
        .set('Authorization', `Bearer ${token}`)
        .send({
          minSalary: 150000,
          maxSalary: 100000
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Minimum salary cannot be greater than maximum salary');
    });
  });

  describe('PATCH /api/settings/appearance', () => {
    it('should save theme preference', async () => {
      const res = await request(app)
        .patch('/api/settings/appearance')
        .set('Authorization', `Bearer ${token}`)
        .send({ theme: 'light', language: 'en' });

      expect(res.status).toBe(200);
      expect(res.body.data.theme).toBe('light');
    });
  });
});
