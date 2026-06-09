const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../server');
const dbHandler = require('./setup');
const User = require('../models/User');
const SentJob = require('../models/SentJob');
const { enhanceResumeGeneral } = require('../utils/aiMatcher');

// Mock the AI Matcher module to prevent actual Gemini API calls
jest.mock('../utils/aiMatcher', () => ({
  enhanceResumeGeneral: jest.fn()
}));

// Increase Jest timeout for MongoDB memory setup
jest.setTimeout(60000);

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'supersecret_test_key_123';

describe('Resume API (Integration Tests)', () => {
  let testUser;
  let emptyProfileUser;
  let testUserToken;
  let emptyUserToken;
  let userSentJobRecord;

  beforeAll(async () => {
    // 1. Connect to testing in-memory database
    await dbHandler.connect();

    // 2. Create test user with populated profile
    testUser = await User.create({
      name: 'Resume Test User',
      email: 'resumetest@example.com',
      password: 'Password123!',
      hasCompletedOnboarding: true,
      profile: {
        bio: 'Passionate full-stack developer with 3 years of industry experience.',
        title: 'Full Stack Engineer',
        githubUrl: 'https://github.com/resumetest',
        linkedinUrl: 'https://linkedin.com/in/resumetest',
        skills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
        experience: [{
          company: 'CodeForge',
          position: 'Software Developer',
          location: 'Remote',
          startDate: 'Jan 2023',
          endDate: 'Present',
          current: true,
          description: 'Worked on building robust APIs and responsive web pages.'
        }],
        projects: [{
          title: 'E-commerce API',
          description: 'Created a secure shopping cart payment system.',
          technologies: ['Node.js', 'Express', 'Stripe'],
          githubLink: 'https://github.com/resumetest/shop'
        }],
        education: [{
          institution: 'Tech University',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          startYear: 2019,
          endYear: 2023
        }]
      }
    });

    // 3. Create test user with empty profile
    emptyProfileUser = await User.create({
      name: 'Empty Profile User',
      email: 'emptyprofile@example.com',
      password: 'Password123!',
      hasCompletedOnboarding: false,
      profile: {
        bio: '',
        title: '',
        skills: [],
        experience: [],
        projects: [],
        education: []
      }
    });

    // 4. Generate JWT tokens
    testUserToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    emptyUserToken = jwt.sign({ id: emptyProfileUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // 5. Seed a SentJob to test tailored resume download
    userSentJobRecord = await SentJob.create({
      userId: testUser._id,
      title: 'Senior Frontend Developer',
      company: 'InnovateCorp',
      location: 'Remote',
      applyLink: 'https://innovatecorp.example.com/apply',
      score: 95,
      status: 'matched',
      tailoredProfile: {
        bio: 'Tailored summary focusing strictly on React UI design for InnovateCorp.',
        experience: [{
          company: 'CodeForge',
          position: 'Software Developer',
          description: 'Engineered high-performance React user interfaces for InnovateCorp workflows.'
        }],
        projects: [{
          title: 'E-commerce API',
          description: 'Developed and optimized custom React frontends for payment workflows.'
        }]
      }
    });
  });

  afterAll(async () => {
    // Teardown database
    await dbHandler.closeDatabase();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization Checks', () => {
    it('should reject resume download request if unauthenticated', async () => {
      const response = await request(app).get('/api/resume/download');
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should reject resume enhancement request if unauthenticated', async () => {
      const response = await request(app).post('/api/resume/enhance');
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/resume/download', () => {
    it('should successfully generate and download standard PDF resume', async () => {
      const response = await request(app)
        .get('/api/resume/download')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
      
      // Verify the filename matches standard profile formatting
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename="Resume_Test_User_Resume.pdf"'
      );
      
      // Verify body is a valid PDF buffer (starts with PDF signature: %PDF)
      const isPdf = response.body.toString('utf-8', 0, 4) === '%PDF';
      expect(isPdf).toBe(true);
    });

    it('should successfully download tailored PDF resume when valid sentJobId is supplied', async () => {
      const response = await request(app)
        .get('/api/resume/download')
        .query({ sentJobId: userSentJobRecord._id.toString() })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
      
      // Verify tailored filename
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename="Resume_Test_User_Tailored_InnovateCorp_Resume.pdf"'
      );

      // Verify PDF buffer signature
      const isPdf = response.body.toString('utf-8', 0, 4) === '%PDF';
      expect(isPdf).toBe(true);
    });

    it('should return 400 Bad Request for malformed sentJobId', async () => {
      const response = await request(app)
        .get('/api/resume/download')
        .query({ sentJobId: 'invalid-object-id' })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Invalid sentJobId format');
    });
  });

  describe('POST /api/resume/enhance', () => {
    it('should successfully enhance resume when profile has details', async () => {
      // Mock the AI generator's response
      const mockEnhancedDraft = {
        bio: 'Highly experienced and enthusiastic engineer with a background in Node APIs.',
        experience: [{
          company: 'CodeForge',
          position: 'Software Developer',
          description: 'Spearheaded and engineered robust backend services and optimized frontend views.'
        }],
        projects: [{
          title: 'E-commerce API',
          description: 'Architected Stripe checkout functions handling payments securely.'
        }]
      };
      
      enhanceResumeGeneral.mockResolvedValue(mockEnhancedDraft);

      const response = await request(app)
        .post('/api/resume/enhance')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.draft).toBeDefined();
      expect(response.body.draft.bio).toBe(mockEnhancedDraft.bio);
      expect(response.body.draft.experience[0].description).toBe(
        mockEnhancedDraft.experience[0].description
      );

      // Verify helper was called once
      expect(enhanceResumeGeneral).toHaveBeenCalledTimes(1);
    });

    it('should reject enhancement with 400 if user profile is empty', async () => {
      const response = await request(app)
        .post('/api/resume/enhance')
        .set('Authorization', `Bearer ${emptyUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Profile is too empty to enhance');

      // AI should not be called
      expect(enhanceResumeGeneral).not.toHaveBeenCalled();
    });
  });
});
