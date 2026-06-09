const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const dbHandler = require('./setup');
const User = require('../models/User');

// Increase Jest timeout for database operations
jest.setTimeout(60000);

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'supersecret_test_key_123';

describe('Profile API (Integration Tests)', () => {
  let testUser;
  let testUserToken;

  beforeAll(async () => {
    // 1. Connect to testing in-memory database
    await dbHandler.connect();

    // 2. Create sample user
    testUser = await User.create({
      name: 'Profile Tester',
      email: 'profiletest@example.com',
      password: 'Password123!',
      hasCompletedOnboarding: false,
      profile: {
        bio: 'Original biography.',
        title: 'Junior Engineer',
        theme: 'minimal'
      }
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

  describe('PUT /api/profile (Private Route)', () => {
    it('should reject unauthenticated profile updates', async () => {
      const response = await request(app)
        .put('/api/profile')
        .send({ profile: { bio: 'New bio.' } });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should successfully update user profile and onboarding completion flag', async () => {
      const updatedProfilePayload = {
        bio: 'Updated biography with more experience.',
        title: 'Senior Engineer',
        skills: ['React', 'Node.js', 'TypeScript']
      };

      const response = await request(app)
        .put('/api/profile')
        .send({
          profile: updatedProfilePayload,
          hasCompletedOnboarding: true
        })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('updated successfully');
      expect(response.body.user.profile.bio).toBe(updatedProfilePayload.bio);
      expect(response.body.user.profile.title).toBe(updatedProfilePayload.title);
      expect(response.body.user.profile.skills).toContain('TypeScript');
      expect(response.body.user.hasCompletedOnboarding).toBe(true);

      // Verify DB updates
      const userInDb = await User.findById(testUser._id);
      expect(userInDb.profile.bio).toBe(updatedProfilePayload.bio);
      expect(userInDb.profile.skills).toContain('React');
      expect(userInDb.hasCompletedOnboarding).toBe(true);
    });

    it('should return 400 Bad Request if profile object is missing in body', async () => {
      const response = await request(app)
        .put('/api/profile')
        .send({ hasCompletedOnboarding: false }) // missing "profile" key
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Please provide profile details to update');
    });

    it('should sanitize request inputs and ignore unauthorized fields', async () => {
      const response = await request(app)
        .put('/api/profile')
        .send({
          profile: {
            bio: 'Sanitized bio update.',
            role: 'admin', // hacker inject inside profile
            plan: 'pro', // hacker inject inside profile
            adminAccessCode: 'hacked_code_123'
          },
          role: 'admin', // hacker inject at root level
          plan: 'pro' // hacker inject at root level
        })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      // Verify response sanitizes and does not leak hacker values
      expect(response.body.user.role).toBe('user');
      expect(response.body.user.plan).toBe('free');
      expect(response.body.user.profile.role).toBeUndefined();
      expect(response.body.user.profile.plan).toBeUndefined();

      // Verify the database was safe
      const userInDb = await User.findById(testUser._id);
      expect(userInDb.role).toBe('user');
      expect(userInDb.plan).toBe('free');
      expect(userInDb.profile.bio).toBe('Sanitized bio update.');
    });

    it('should reject invalid Mongoose validation constraints with 500 error', async () => {
      const response = await request(app)
        .put('/api/profile')
        .send({
          profile: {
            preferences: {
              remotePreference: 'invalid-nonexistent-remote-preference-value' // invalid enum value
            }
          }
        })
        .set('Authorization', `Bearer ${testUserToken}`);

      // Centralized error handler catches mongoose validation errors and returns 500
      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('remotePreference');
    });
  });
});
