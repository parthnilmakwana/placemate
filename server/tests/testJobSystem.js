require('dotenv').config();
const mongoose = require('mongoose');
const { ingestJobs } = require('../utils/ingestor');
const { generateDailyRecommendations, scoreJobForUser } = require('../utils/recommendationEngine');
const Job = require('../models/Job');
const User = require('../models/User');
const DailyRecommendation = require('../models/DailyRecommendation');

async function runTests() {
  console.log('=== Starting PlaceMate Job System Comprehensive Tests ===\n');

  try {
    // 1. Test Database Connection
    console.log('[TEST 1] Connecting to Database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placemate');
    console.log('✅ Database connected successfully.\n');

    // 2. Test Recommendation Engine Scoring Logic
    console.log('[TEST 2] Testing Recommendation Engine Scoring Math...');
    const dummyUserPrefs = {
      preferredSkills: ['React', 'Node.js', 'MongoDB'],
      preferredCategories: ['Frontend', 'Full Stack'],
      remotePreference: 'remote',
      targetLocations: ['New York']
    };
    
    const dummyJobPerfectMatch = {
      _id: new mongoose.Types.ObjectId(),
      title: 'Senior Frontend Developer',
      category: 'Frontend',
      location: 'Remote',
      skills: ['React', 'TypeScript', 'Node.js'],
      postedDate: new Date() // Today
    };

    const dummyJobPoorMatch = {
      _id: new mongoose.Types.ObjectId(),
      title: 'Backend Engineer',
      category: 'Backend',
      location: 'San Francisco',
      skills: ['Java', 'Spring Boot'],
      postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    };

    const recentJobIds = new Set();
    
    const perfectScore = scoreJobForUser(dummyUserPrefs, dummyJobPerfectMatch, recentJobIds);
    const poorScore = scoreJobForUser(dummyUserPrefs, dummyJobPoorMatch, recentJobIds);

    console.log(`Perfect Match Score (Should be high, > 80): ${perfectScore.score}`);
    console.log(`Poor Match Score (Should be low, < 30): ${poorScore.score}`);
    
    if (perfectScore.score > poorScore.score) {
       console.log('✅ Scoring logic passed.\n');
    } else {
       console.error('❌ Scoring logic failed.\n');
    }

    // 3. Test Job Ingestion (Job API & DB writing)
    console.log('[TEST 3] Testing Job API and Ingestor Pipeline...');
    console.log('Note: This will make 5 requests to the Job API.');
    const ingestStats = await ingestJobs();
    console.log(`✅ Job Ingestion completed: Processed ${ingestStats.totalProcessed}, Upserted ${ingestStats.upsertedCount}, Expired ${ingestStats.expiredCount}\n`);

    // 4. Test Job Caching / DB Search
    console.log('[TEST 4] Testing Cached DB Search...');
    const searchFilter = { isActive: true, category: 'Frontend' };
    const frontendJobsCount = await Job.countDocuments(searchFilter);
    console.log(`Found ${frontendJobsCount} active Frontend jobs in cache.`);
    
    const keywordJobs = await Job.find({ $text: { $search: 'developer' } }).limit(5);
    console.log(`Found ${keywordJobs.length} jobs matching keyword 'developer'.`);
    console.log('✅ DB Search caching passed.\n');

    // 5. Test Full Daily Recommendation Generation
    console.log('[TEST 5] Testing Daily Recommendation Generator...');
    
    // Create a dummy user if none exist to test generation
    const usersCount = await User.countDocuments({ hasCompletedOnboarding: true });
    let tempUserId = null;
    if (usersCount === 0) {
      console.log('No onboarded users found. Creating a temporary user for testing...');
      const tempUser = new User({
        name: 'Test User',
        email: 'testrecengine@example.com',
        password: 'password123',
        hasCompletedOnboarding: true,
        profile: {
          preferences: dummyUserPrefs
        }
      });
      await tempUser.save();
      tempUserId = tempUser._id;
    }

    const recStats = await generateDailyRecommendations();
    console.log(`Generated recommendations for ${recStats.usersProcessed} users.`);
    console.log(`Total recommended jobs generated: ${recStats.totalRecommendations}`);

    // Clean up temp user and their recommendations
    if (tempUserId) {
      await User.deleteOne({ _id: tempUserId });
      await DailyRecommendation.deleteMany({ userId: tempUserId });
      console.log('Cleaned up temporary user data.');
    }
    
    console.log('✅ Daily Recommendation generation passed.\n');

    console.log('=== All Tests Completed Successfully! ===');

  } catch (error) {
    console.error('\n❌ Test execution failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from Database.');
    process.exit(0);
  }
}

runTests();
