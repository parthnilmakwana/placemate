const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../server');
const dbHandler = require('./setup');
const User = require('../models/User');
const Job = require('../models/Job');
const SentJob = require('../models/SentJob');

// Increase timeout for downloading MongoDB binaries if running for the first time
jest.setTimeout(60000);

// Setup test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'supersecret_test_key_123';

describe('Jobs API (Integration Tests)', () => {
  let testUser;
  let anotherUser;
  let testUserToken;
  let activeFrontendJob;
  let activeBackendJob;
  let inactiveAndroidJob;
  let userSentJobRecord;
  let otherSentJobRecord;

  beforeAll(async () => {
    // 1. Connect to in-memory database
    await dbHandler.connect();

    // 2. Create test users
    testUser = await User.create({
      name: 'Job Test User',
      email: 'jobtest@example.com',
      password: 'Password123!',
      hasCompletedOnboarding: true
    });

    anotherUser = await User.create({
      name: 'Other User',
      email: 'otheruser@example.com',
      password: 'Password123!',
      hasCompletedOnboarding: true
    });

    // 3. Generate JWT token for testUser
    testUserToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // 4. Create sample job documents
    activeFrontendJob = await Job.create({
      title: 'Frontend React Developer',
      company: 'TechCorp',
      location: 'Remote',
      category: 'Frontend',
      skills: ['React', 'JavaScript', 'CSS'],
      description: 'Build awesome user interfaces using React.',
      applyLink: 'https://techcorp.example.com/apply',
      isActive: true,
      postedDate: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
    });

    activeBackendJob = await Job.create({
      title: 'Node.js Backend Engineer',
      company: 'DataSystems',
      location: 'New York',
      category: 'Backend',
      skills: ['Node.js', 'Express', 'MongoDB'],
      description: 'Design highly scalable REST APIs with Node and Express.',
      applyLink: 'https://datasystems.example.com/apply',
      isActive: true,
      postedDate: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    });

    inactiveAndroidJob = await Job.create({
      title: 'Android Mobile Developer',
      company: 'AppWorks',
      location: 'San Francisco',
      category: 'Android',
      skills: ['Kotlin', 'Java'],
      description: 'Create premium native Android experiences.',
      applyLink: 'https://appworks.example.com/apply',
      isActive: false // Inactive!
    });

    // Mongoose builds text indexes, but on MongoMemoryServer we must force it to ensure text queries work
    await Job.ensureIndexes();

    // 5. Create sample SentJob (user match/application history) records
    userSentJobRecord = await SentJob.create({
      userId: testUser._id,
      title: 'Junior Frontend Developer',
      company: 'StartCo',
      location: 'Remote',
      applyLink: 'https://startco.example.com/apply',
      score: 85,
      status: 'matched'
    });

    await SentJob.create({
      userId: testUser._id,
      title: 'Senior React Developer',
      company: 'StartCo',
      location: 'Remote',
      applyLink: 'https://startco.example.com/apply-senior',
      score: 90,
      status: 'applied'
    });

    otherSentJobRecord = await SentJob.create({
      userId: anotherUser._id,
      title: 'Data Science Intern',
      company: 'DataCorp',
      location: 'Boston',
      applyLink: 'https://datacorp.example.com/apply',
      score: 80,
      status: 'matched'
    });
  });

  afterAll(async () => {
    // Clean up and close DB connection
    await dbHandler.closeDatabase();
  });

  describe('Authorization Checks', () => {
    it('should reject requests without a token', async () => {
      const response = await request(app).get('/api/jobs/search');
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('no token provided');
    });

    it('should reject requests with invalid token formats', async () => {
      const response = await request(app)
        .get('/api/jobs/search')
        .set('Authorization', 'Bearer invalidtoken123');
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/jobs/search', () => {
    it('should return all active jobs when no search query is specified', async () => {
      const response = await request(app)
        .get('/api/jobs/search')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.count).toBe(2); // activeFrontendJob and activeBackendJob
      
      // Check that inactive job is excluded
      const ids = response.body.data.map(job => job._id.toString());
      expect(ids).toContain(activeFrontendJob._id.toString());
      expect(ids).toContain(activeBackendJob._id.toString());
      expect(ids).not.toContain(inactiveAndroidJob._id.toString());
    });

    it('should filter jobs by category correctly', async () => {
      const response = await request(app)
        .get('/api/jobs/search')
        .query({ category: 'Backend' })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].title).toBe('Node.js Backend Engineer');
    });

    it('should filter jobs by skills correctly', async () => {
      const response = await request(app)
        .get('/api/jobs/search')
        .query({ skills: 'React' })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].title).toBe('Frontend React Developer');
    });

    it('should search jobs by text query correctly', async () => {
      const response = await request(app)
        .get('/api/jobs/search')
        .query({ q: 'TechCorp' })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].company).toBe('TechCorp');
    });
  });

  describe('GET /api/jobs/history', () => {
    it('should return job matching history only for the authenticated user', async () => {
      const response = await request(app)
        .get('/api/jobs/history')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.count).toBe(2); // user's 2 sent jobs
      
      // Assert that none of the history records belong to anotherUser
      const userIds = response.body.data.map(record => record.userId.toString());
      expect(userIds).toContain(testUser._id.toString());
      expect(userIds).not.toContain(anotherUser._id.toString());
    });

    it('should filter history by status correctly', async () => {
      const response = await request(app)
        .get('/api/jobs/history')
        .query({ status: 'applied' })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].status).toBe('applied');
      expect(response.body.data[0].title).toBe('Senior React Developer');
    });

    it('should filter history by search keywords correctly', async () => {
      const response = await request(app)
        .get('/api/jobs/history')
        .query({ search: 'Junior' })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].title).toBe('Junior Frontend Developer');
    });
  });

  describe('PATCH /api/jobs/:id/status', () => {
    it('should successfully update matched job status to applied', async () => {
      const response = await request(app)
        .patch(`/api/jobs/${userSentJobRecord._id}/status`)
        .send({ status: 'applied' })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.status).toBe('applied');

      // Double-check the database directly
      const updatedJob = await SentJob.findById(userSentJobRecord._id);
      expect(updatedJob.status).toBe('applied');
    });

    it('should reject status updates with invalid status values', async () => {
      const response = await request(app)
        .patch(`/api/jobs/${userSentJobRecord._id}/status`)
        .send({ status: 'invalid_status_value' })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Invalid application status value');
    });

    it('should forbid user from updating another user\'s matched job status', async () => {
      const response = await request(app)
        .patch(`/api/jobs/${otherSentJobRecord._id}/status`)
        .send({ status: 'applied' })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Not authorized to modify this record');
    });

    it('should return 400 for invalid mongo object ID format', async () => {
      const response = await request(app)
        .patch('/api/jobs/not_a_valid_mongo_id/status')
        .send({ status: 'applied' })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Invalid job record ID format');
    });

    it('should return 404 if recommendation record does not exist', async () => {
      const randomObjectId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/api/jobs/${randomObjectId}/status`)
        .send({ status: 'applied' })
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Recommendation record not found');
    });
  });
});
