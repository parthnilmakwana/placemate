const request = require('supertest');
const app = require('../server');
const dbHandler = require('./setup');
const User = require('../models/User');

// Increase timeout for the first run (MongoDB binary download)
jest.setTimeout(60000);

// Set the environment to 'test' so server.js doesn't start the real DB or port
process.env.NODE_ENV = 'test';
// Dummy JWT secret for testing
process.env.JWT_SECRET = 'supersecret_test_key_123';

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => {
  await dbHandler.connect();
});

/**
 * Clear all test data after every test.
 */
afterEach(async () => {
  await dbHandler.clearDatabase();
});

/**
 * Remove and close the db and server.
 */
afterAll(async () => {
  await dbHandler.closeDatabase();
});

describe('Authentication API (Integration Tests)', () => {

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return a token', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Integration Test User',
          email: 'integration@example.com',
          password: 'Password123!' // Valid password
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();

      // Verify user was actually saved in DB
      const userInDb = await User.findOne({ email: 'integration@example.com' });
      expect(userInDb).not.toBeNull();
      expect(userInDb.name).toBe('Integration Test User');
    });

    it('should not register a user with an existing email', async () => {
      // Create user first
      await User.create({
        name: 'Existing User',
        email: 'integration@example.com',
        password: 'Password123!'
      });

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'integration@example.com',
          password: 'Password456!'
        });

      expect(response.status).toBe(400); 
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user to login with using valid password
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login User',
          email: 'login@example.com',
          password: 'MyPassword123!'
        });
    });

    it('should return a token for valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'MyPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });

});
