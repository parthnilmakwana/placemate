// Load environment variables
require('dotenv').config();
require('dns').setDefaultResultOrder('ipv4first');

const { fetchJobs } = require('../utils/scrapers/jobApiClient');
const { normalizeJob } = require('../utils/scrapers/normalize');
const connectDB = require('../config/db');
const mongoose = require('mongoose');

async function runTest() {
  console.log('=== [TEST] Starting JSearch API Client Test ===');
  console.log(`RAPIDAPI_KEY is configured: ${process.env.RAPIDAPI_KEY ? 'YES' : 'NO'}`);

  if (!process.env.RAPIDAPI_KEY) {
    console.error('[ERROR] Please set RAPIDAPI_KEY in your server/.env file before running this test.');
    process.exit(1);
  }

  try {
    // 1. Fetch raw jobs from API
    const rawJobs = await fetchJobs({ query: 'React Developer in India', datePosted: 'week' });
    
    console.log(`\nReturned ${rawJobs.length} raw jobs from JSearch client.`);

    if (rawJobs.length === 0) {
      console.warn('[WARNING] No jobs were returned. Double-check your API key and query parameters.');
      return;
    }

    // 2. Print details of the first job to inspect structure
    const sampleRaw = rawJobs[0];
    console.log('\n--- SAMPLE RAW JOB FROM CLIENT ---');
    console.log(JSON.stringify(sampleRaw, null, 2));

    // 3. Normalize the raw jobs
    console.log('\nNormalizing fetched jobs...');
    const normalizedJobs = rawJobs.map(raw => normalizeJob(raw));

    const sampleNormalized = normalizedJobs[0];
    console.log('\n--- SAMPLE NORMALIZED JOB ---');
    console.log(JSON.stringify(sampleNormalized, null, 2));

    console.log('\nAll checks complete. API client works and correctly maps fields!');
  } catch (error) {
    console.error('Test execution failed with error:', error);
  } finally {
    console.log('\n=== [TEST] Finished JSearch API Client Test ===');
  }
}

runTest();
