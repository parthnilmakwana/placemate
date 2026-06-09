const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../server');
const dbHandler = require('./setup');
const User = require('../models/User');
const AIPortfolioUsage = require('../models/AIPortfolioUsage');
const PortfolioDraft = require('../models/PortfolioDraft');
const { generateContent } = require('../utils/aiClient');

// Mock the AI client to control AI generation in testing
jest.mock('../utils/aiClient', () => ({
  generateContent: jest.fn()
}));

// Increase Jest timeout for database operations
jest.setTimeout(60000);

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'supersecret_test_key_123';

describe('Portfolio API (Integration Tests)', () => {
  let publicUser;
  let privateUser;
  let anotherUser;
  let publicUserToken;

  beforeAll(async () => {
    // 1. Connect to testing in-memory database
    await dbHandler.connect();

    // 2. Create sample users
    publicUser = await User.create({
      name: 'Public Developer',
      email: 'public@example.com',
      password: 'Password123!',
      username: 'public-slug',
      hasCompletedOnboarding: true,
      profile: {
        bio: 'Hello world, I am a public developer.',
        title: 'Frontend Engineer',
        theme: 'minimal',
        isPublic: true,
        skills: ['React', 'CSS'],
        experience: [{ company: 'WebCorp', position: 'Developer', description: 'Built UIs.' }]
      }
    });

    privateUser = await User.create({
      name: 'Private Developer',
      email: 'private@example.com',
      password: 'Password123!',
      username: 'private-slug',
      hasCompletedOnboarding: true,
      profile: {
        bio: 'Private profile details.',
        title: 'Backend Engineer',
        theme: 'dark',
        isPublic: false
      }
    });

    anotherUser = await User.create({
      name: 'Another Developer',
      email: 'another@example.com',
      password: 'Password123!',
      username: 'another-slug',
      hasCompletedOnboarding: true
    });

    // 3. Generate token for publicUser
    publicUserToken = jwt.sign({ id: publicUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
  });

  afterAll(async () => {
    // Teardown database
    await dbHandler.closeDatabase();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    // Clean up daily usage and draft documents after each test to ensure test isolation
    await AIPortfolioUsage.deleteMany({});
    await PortfolioDraft.deleteMany({});
  });

  describe('GET /api/portfolio/:username (Public Route)', () => {
    it('should allow anyone to view a user\'s public portfolio with sanitized data', async () => {
      const response = await request(app).get('/api/portfolio/public-slug');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe('Public Developer');
      expect(response.body.data.bio).toBe('Hello world, I am a public developer.');
      expect(response.body.data.skills).toContain('React');
      expect(response.body.data.theme).toBe('minimal');

      // CRITICAL: Ensure sensitive account info is sanitized and NEVER leaked
      expect(response.body.data.email).toBeUndefined();
      expect(response.body.data.password).toBeUndefined();
      expect(response.body.data.role).toBeUndefined();
      expect(response.body.data._id).toBeUndefined();
    });

    it('should return 404 and block access if user portfolio is set to private', async () => {
      const response = await request(app).get('/api/portfolio/private-slug');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Portfolio not found or has been set to private');
    });

    it('should return 404 for a non-existent username slug', async () => {
      const response = await request(app).get('/api/portfolio/non-existent-user-slug');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/portfolio/settings (Private Route)', () => {
    it('should reject unauthenticated settings updates', async () => {
      const response = await request(app)
        .put('/api/portfolio/settings')
        .send({ theme: 'dark' });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should successfully update theme settings and visibility preferences', async () => {
      const response = await request(app)
        .put('/api/portfolio/settings')
        .send({ theme: 'dark', isPublic: false })
        .set('Authorization', `Bearer ${publicUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.user.profile.theme).toBe('dark');
      expect(response.body.user.profile.isPublic).toBe(false);

      // Verify the changes saved in the database
      const updatedUser = await User.findById(publicUser._id);
      expect(updatedUser.profile.theme).toBe('dark');
      expect(updatedUser.profile.isPublic).toBe(false);

      // Restore settings for next tests
      updatedUser.profile.theme = 'minimal';
      updatedUser.profile.isPublic = true;
      await updatedUser.save();
    });

    it('should reject invalid theme enums with 400', async () => {
      const response = await request(app)
        .put('/api/portfolio/settings')
        .send({ theme: 'invalid-nonexistent-theme-layout' })
        .set('Authorization', `Bearer ${publicUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Invalid theme choice');
    });

    it('should successfully update username slug with valid string format', async () => {
      const response = await request(app)
        .put('/api/portfolio/settings')
        .send({ username: 'new-valid-username-slug' })
        .set('Authorization', `Bearer ${publicUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.user.username).toBe('new-valid-username-slug');

      // Verify the change in DB
      const updatedUser = await User.findById(publicUser._id);
      expect(updatedUser.username).toBe('new-valid-username-slug');

      // Restore username slug for subsequent tests
      updatedUser.username = 'public-slug';
      await updatedUser.save();
    });

    it('should reject invalid username formats with 400', async () => {
      const response = await request(app)
        .put('/api/portfolio/settings')
        .send({ username: 'Invalid_Slug_With_Uppercase_And_Underscores!' })
        .set('Authorization', `Bearer ${publicUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject username updates if username is already taken by another user', async () => {
      const response = await request(app)
        .put('/api/portfolio/settings')
        .send({ username: 'another-slug' }) // already claimed by anotherUser
        .set('Authorization', `Bearer ${publicUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('claimed');
    });
  });

  describe('AI Generation & Limit Tracking', () => {
    it('should generate portfolio draft via AI, save it to DB, and increment usage count', async () => {
      const mockGeneratedData = {
        bio: 'AI designed professional bio.',
        title: 'Full Stack Master',
        theme: 'bold',
        skills: ['React', 'Node.js'],
        experience: [],
        projects: [],
        education: []
      };

      generateContent.mockResolvedValue({
        text: JSON.stringify(mockGeneratedData)
      });

      const response = await request(app)
        .post('/api/portfolio/generate')
        .send({ profession: 'Full Stack Engineer', style: 'bold' })
        .set('Authorization', `Bearer ${publicUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.draftId).toBeDefined();
      expect(response.body.data.draft.bio).toBe(mockGeneratedData.bio);

      // Verify the draft was actually saved in the database
      const savedDraft = await PortfolioDraft.findById(response.body.data.draftId);
      expect(savedDraft).not.toBeNull();
      expect(savedDraft.userId.toString()).toBe(publicUser._id.toString());
      expect(savedDraft.profileDraft.title).toBe('Full Stack Master');

      // Verify daily usage was tracked and set to 1
      const usage = await AIPortfolioUsage.findOne({ userId: publicUser._id });
      expect(usage.generationCount).toBe(1);
    });

    it('should handle malformed JSON from AI gracefully and return 500 error', async () => {
      generateContent.mockResolvedValue({
        text: 'not-valid-json-string-from-ai'
      });

      const response = await request(app)
        .post('/api/portfolio/generate')
        .send({ profession: 'Developer' })
        .set('Authorization', `Bearer ${publicUserToken}`);

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('AI generated invalid data');
    });

    it('should block users who exceed their daily generation limit with 429', async () => {
      // Seed daily usage already containing 2 generation counts (the free plan limit)
      await AIPortfolioUsage.create({
        userId: publicUser._id,
        generationCount: 2,
        lastResetDate: new Date()
      });

      const response = await request(app)
        .post('/api/portfolio/generate')
        .send({ profession: 'Developer' })
        .set('Authorization', `Bearer ${publicUserToken}`);

      expect(response.status).toBe(429);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Daily AI generation limit reached');

      // Confirm generateContent was never triggered
      expect(generateContent).not.toHaveBeenCalled();
    });
  });

  describe('Draft Apply & Discard Actions', () => {
    let mockDraft;

    beforeEach(async () => {
      mockDraft = await PortfolioDraft.create({
        userId: publicUser._id,
        profileDraft: {
          bio: 'AI-written bio.',
          title: 'Senior Engineer',
          theme: 'developer',
          skills: ['Express', 'Redis'],
          experience: [],
          projects: [],
          education: []
        }
      });
    });

    it('should successfully apply generated draft layout to active profile', async () => {
      const response = await request(app)
        .post(`/api/portfolio/draft/${mockDraft._id}/apply`)
        .set('Authorization', `Bearer ${publicUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.user.profile.bio).toBe('AI-written bio.');
      expect(response.body.user.profile.title).toBe('Senior Engineer');
      expect(response.body.user.profile.theme).toBe('developer');

      // Verify active user document in DB contains the applied fields
      const updatedUser = await User.findById(publicUser._id);
      expect(updatedUser.profile.bio).toBe('AI-written bio.');
      expect(updatedUser.profile.theme).toBe('developer');

      // Verify draft status updated to isApplied: true
      const updatedDraft = await PortfolioDraft.findById(mockDraft._id);
      expect(updatedDraft.isApplied).toBe(true);

      // Clean up user profile
      updatedUser.profile = {
        bio: 'Hello world, I am a public developer.',
        title: 'Frontend Engineer',
        theme: 'minimal',
        isPublic: true,
        skills: ['React', 'CSS'],
        experience: [{ company: 'WebCorp', position: 'Developer', description: 'Built UIs.' }]
      };
      await updatedUser.save();
    });

    it('should return 400 if draft is already applied', async () => {
      mockDraft.isApplied = true;
      await mockDraft.save();

      const response = await request(app)
        .post(`/api/portfolio/draft/${mockDraft._id}/apply`)
        .set('Authorization', `Bearer ${publicUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('already been applied');
    });

    it('should successfully discard and delete a draft', async () => {
      const response = await request(app)
        .delete(`/api/portfolio/draft/${mockDraft._id}`)
        .set('Authorization', `Bearer ${publicUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('discarded successfully');

      // Verify draft deleted from DB
      const checkDraft = await PortfolioDraft.findById(mockDraft._id);
      expect(checkDraft).toBeNull();
    });

    it('should return 404 if trying to apply or discard non-existent drafts', async () => {
      const randomId = new mongoose.Types.ObjectId();
      
      const responseApply = await request(app)
        .post(`/api/portfolio/draft/${randomId}/apply`)
        .set('Authorization', `Bearer ${publicUserToken}`);
      expect(responseApply.status).toBe(404);

      const responseDiscard = await request(app)
        .delete(`/api/portfolio/draft/${randomId}`)
        .set('Authorization', `Bearer ${publicUserToken}`);
      expect(responseDiscard.status).toBe(404);
    });
  });
});
