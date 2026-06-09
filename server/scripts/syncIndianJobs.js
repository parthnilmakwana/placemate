require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('../models/Job');
const DailyRecommendation = require('../models/DailyRecommendation');
const { ingestJobs } = require('../utils/ingestor');
const { generateDailyRecommendations } = require('../utils/recommendationEngine');

async function run() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placemate');
    console.log('Connected to MongoDB');

    // Clear existing jobs (US-based)
    console.log('Clearing old job listings...');
    const jobDeleteResult = await Job.deleteMany({});
    console.log(`Cleared ${jobDeleteResult.deletedCount} old jobs.`);
    
    // Clear old daily recommendations
    console.log('Clearing old daily recommendations...');
    const recDeleteResult = await DailyRecommendation.deleteMany({});
    console.log(`Cleared ${recDeleteResult.deletedCount} old recommendations.`);

    // Pull Indian jobs
    console.log('Triggering ingestion for Indian jobs...');
    const ingestStats = await ingestJobs();
    console.log('Ingest completed:', ingestStats);

    // Regenerate daily recommendations
    console.log('Generating fresh daily recommendations...');
    const recStats = await generateDailyRecommendations();
    console.log('Recommendations generated:', recStats);

    console.log('Database successfully migrated to Indian data.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

run();
