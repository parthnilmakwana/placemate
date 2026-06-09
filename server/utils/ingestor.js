const Job = require('../models/Job');
const { fetchJobs } = require('./scrapers/jobApiClient');
const { normalizeJob } = require('./scrapers/normalize');

/**
 * SYNC STRATEGY — Fixed 5 Categories
 * 
 * WHY FIXED CATEGORIES INSTEAD OF USER PREFERENCES?
 *   Old approach: gather all user targetRoles+locations → build queries → cap at 5
 *   Problem: as users grow, some preferences get excluded by the cap
 *   
 *   New approach: always query the same 5 job families
 *   Benefit: API usage is O(1) — always exactly 5 calls, regardless of user count
 *   
 *   5 calls/day × 30 days = 150/month (safely under the 200 limit)
 *   Remaining 50 requests are preserved as buffer for retries/failures
 */
const SYNC_CATEGORIES = [
  { category: 'Frontend',     query: 'Frontend Developer in India' },
  { category: 'Backend',      query: 'Backend Developer in India' },
  { category: 'Full Stack',   query: 'Full Stack Developer in India' },
  { category: 'Android',      query: 'Android Developer in India' },
  { category: 'Data Science', query: 'Data Science in India' },
];

/**
 * JOB EXPIRATION POLICY
 * Jobs older than this many days are marked isActive: false
 * They stay in the database (for historical recommendation references)
 * but are excluded from new recommendations and search results
 */
const EXPIRATION_DAYS = 14;

/**
 * Runs the daily job sync: fetches from fixed categories, normalizes, upserts,
 * and cleans up expired jobs.
 * 
 * @returns {Object} - Stats detailing the results of the run.
 */
async function ingestJobs() {
  console.log('--- Starting Job Ingestion Process (Category-Based Sync) ---');
  
  try {
    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Fetch jobs from each fixed category
    // ═══════════════════════════════════════════════════════════════
    const allRawJobs = [];

    for (const { category, query } of SYNC_CATEGORIES) {
      console.log(`[INGESTOR] Fetching category "${category}" with query: "${query}"...`);
      try {
        const jobs = await fetchJobs({ query, datePosted: 'week' });
        console.log(`  Found ${jobs.length} jobs for "${category}".`);
        
        // Tag each raw job with its category before normalization
        for (const job of jobs) {
          job._syncCategory = category;
        }
        allRawJobs.push(...jobs);
      } catch (err) {
        // If one category fails, continue with the others (use the 50 buffer)
        console.error(`  Error fetching "${category}":`, err.message);
      }
      
      // Delay for 3 seconds between requests to avoid rate-limiting from RapidAPI
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log(`[INGESTOR] Gathered ${allRawJobs.length} total raw listings from ${SYNC_CATEGORIES.length} categories.`);

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Normalize and validate
    // ═══════════════════════════════════════════════════════════════
    const normalizedJobs = allRawJobs
      .map(raw => normalizeJob(raw, raw._syncCategory))
      .filter(job => job && job.applyLink); // Must have a valid apply link

    // Deduplicate by applyLink in memory to prevent bulkWrite errors
    const seenLinks = new Set();
    const uniqueNormalizedJobs = [];
    for (const job of normalizedJobs) {
      if (!seenLinks.has(job.applyLink)) {
        seenLinks.add(job.applyLink);
        uniqueNormalizedJobs.push(job);
      }
    }

    if (uniqueNormalizedJobs.length === 0) {
      console.log('[INGESTOR] No valid unique listings found after deduplication.');
      return { totalProcessed: 0, upsertedCount: 0, matchedCount: 0, expiredCount: 0 };
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Bulk upsert into Job collection (using applyLink as unique key)
    // ═══════════════════════════════════════════════════════════════
    const operations = uniqueNormalizedJobs.map(job => ({
      updateOne: {
        filter: { 
          applyLink: job.applyLink
        },
        update: { 
          $set: { ...job, updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date() }
        },
        upsert: true
      }
    }));

    console.log('[INGESTOR] Executing MongoDB bulk write (upserts)...');
    const result = await Job.bulkWrite(operations);

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Expire old jobs (14-day policy)
    // ═══════════════════════════════════════════════════════════════
    const expirationDate = new Date(Date.now() - EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
    const expireResult = await Job.updateMany(
      { 
        postedDate: { $lt: expirationDate }, 
        isActive: true 
      },
      { 
        $set: { isActive: false, updatedAt: new Date() } 
      }
    );

    const expiredCount = expireResult.modifiedCount || 0;
    if (expiredCount > 0) {
      console.log(`[INGESTOR] Marked ${expiredCount} jobs as inactive (older than ${EXPIRATION_DAYS} days).`);
    }

    // ═══════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════
    const stats = {
      totalProcessed: normalizedJobs.length,
      upsertedCount: result.upsertedCount || 0,
      matchedCount: result.matchedCount || 0,
      modifiedCount: result.modifiedCount || 0,
      expiredCount
    };

    console.log('--- Job Ingestion Summary ---');
    console.log(`Total listings processed: ${stats.totalProcessed}`);
    console.log(`New jobs inserted (upserted): ${stats.upsertedCount}`);
    console.log(`Existing jobs matched: ${stats.matchedCount}`);
    console.log(`Existing jobs updated: ${stats.modifiedCount}`);
    console.log(`Jobs expired (marked inactive): ${stats.expiredCount}`);
    console.log('-----------------------------');

    return stats;
  } catch (error) {
    console.error('Job Ingestion Process Failed:', error);
    throw error;
  }
}

module.exports = {
  ingestJobs
};

