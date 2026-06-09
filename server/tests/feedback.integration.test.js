const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const dbHandler = require('./setup');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

// Increase Jest timeout for database setup
jest.setTimeout(60000);

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'supersecret_test_key_123';

describe('Feedback API (Integration Tests)', () => {
  let testUser;
  let testUserToken;

  beforeAll(async () => {
    // 1. Connect to testing in-memory database
    await dbHandler.connect();

    // 2. Create sample user
    testUser = await User.create({
      name: 'Feedback Tester',
      email: 'feedbacktest@example.com',
      password: 'Password123!',
      hasCompletedOnboarding: true
    });

    // 3. Generate JWT token
    testUserToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
  });

  afterAll(async () => {
    // Teardown database
    await dbHandler.closeDatabase();
  });

  afterEach(async () => {
    // Clear feedback documents after each test
    await Feedback.deleteMany({});
  });

  describe('POST /api/feedback (Private Route)', () => {
    it('should reject unauthenticated feedback submissions', async () => {
      const response = await request(app)
        .post('/api/feedback')
        .send({
          category: 'Bug Report',
          rating: 4,
          text: 'This is a sample bug report details.'
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should successfully submit and store valid feedback', async () => {
      const payload = {
        category: 'Bug Report',
        rating: 4,
        text: 'Found a styling alignment bug on the dashboard page.'
      };

      const response = await request(app)
        .post('/api/feedback')
        .send(payload)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('Feedback submitted successfully');
      expect(response.body.data.category).toBe(payload.category);
      expect(response.body.data.rating).toBe(payload.rating);
      expect(response.body.data.text).toBe(payload.text);

      // Verify the record exists in the database
      const feedbackInDb = await Feedback.findOne({ userId: testUser._id });
      expect(feedbackInDb).not.toBeNull();
      expect(feedbackInDb.category).toBe(payload.category);
      expect(feedbackInDb.rating).toBe(payload.rating);
      expect(feedbackInDb.text).toBe(payload.text);
    });

    it('should return 400 Bad Request if required parameters are missing', async () => {
      const response = await request(app)
        .post('/api/feedback')
        .send({
          category: 'Suggestion'
          // rating and text are missing
        })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Please provide category, rating, and feedback text');
    });

    it('should reject ratings out of bounds (greater than 5 or less than 1) at DB validation level', async () => {
      // 1. Rating too high (6)
      const responseHigh = await request(app)
        .post('/api/feedback')
        .send({
          category: 'Feature Request',
          rating: 6,
          text: 'Can we add a dark mode theme to the portfolios?'
        })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(responseHigh.status).toBe(500); // Mongoose validation error maps to 500
      expect(responseHigh.body.status).toBe('error');
      expect(responseHigh.body.message).toContain('Rating cannot exceed 5');

      // 2. Rating too low (0)
      const responseLow = await request(app)
        .post('/api/feedback')
        .send({
          category: 'Feature Request',
          rating: 0,
          text: 'Can we add a dark mode theme to the portfolios?'
        })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(responseLow.status).toBe(500);
      expect(responseLow.body.status).toBe('error');
      expect(responseLow.body.message).toContain('Rating must be at least 1');
    });

    it('should reject feedback descriptions shorter than 10 characters at DB validation level', async () => {
      const response = await request(app)
        .post('/api/feedback')
        .send({
          category: 'Other',
          rating: 3,
          text: 'Short' // Only 5 characters, schema requires 10
        })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Feedback description must be at least 10 characters');
    });
  });
});
