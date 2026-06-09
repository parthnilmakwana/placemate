const path = require('path');
const dotenv = require('dotenv');
// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Force mock mode for scraper test to ensure deterministic duplicate assertions and avoid API credits usage
process.env.RAPIDAPI_KEY = 'mock_mode';

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { ingestJobs } = require('../utils/ingestor');
const Job = require('../models/Job');

async function runTest() {
  console.log('=== Scraper & Ingestion Integration Test ===');
  
  try {
    // 1. Establish MongoDB Connection
    await connectDB();

    // Clear existing jobs to ensure clean starting state for the test
    console.log('Clearing existing test jobs from collection...');
    await Job.deleteMany({});
    console.log('Jobs collection cleared.');

    // 2. First Ingestion Run (Should insert all items)
    console.log('\n--- FIRST INGESTION RUN ---');
    const firstRunStats = await ingestJobs();
    
    if (firstRunStats.totalProcessed === 0) {
      throw new Error('No jobs processed in the first run.');
    }
    console.log(`First Run Complete. Upserted ${firstRunStats.upsertedCount} new jobs.`);

    // 3. Second Ingestion Run (Should result in 0 new upserts)
    console.log('\n--- SECOND INGESTION RUN (DUPLICATE DETECTION CHECK) ---');
    const secondRunStats = await ingestJobs();
    
    console.log(`Second Run Complete. Upserted ${secondRunStats.upsertedCount} new jobs.`);
    
    // Assertions
    if (secondRunStats.upsertedCount !== 0) {
      console.error('FAIL: Duplicate job postings were created in the database.');
      process.exitCode = 1;
    } else {
      console.log('SUCCESS: Duplicate postings were caught and duplicate creation was prevented.');
    }

    // Verify count in database
    const dbCount = await Job.countDocuments({});
    console.log(`\nVerified: Total job postings currently in MongoDB: ${dbCount}`);

  } catch (error) {
    console.error('Scraper/Ingestion integration test failed:', error);
    process.exitCode = 1;
  } finally {
    // Close connection
    console.log('Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('Connection closed. Test finished.');
  }
}

runTest();
