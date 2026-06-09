const User = require('../models/User');
const Job = require('../models/Job');
const SentJob = require('../models/SentJob');
const { matchJobWithProfile, tailorResumeForJob } = require('./aiMatcher');
const { generateResumePDF } = require('./pdfgen');
const { sendJobDigestEmail } = require('./mailer');
const { ingestJobs } = require('./ingestor');
const { generateDailyRecommendations } = require('./recommendationEngine');

/**
 * Utility to accumulate a PDFKit stream into a single memory Buffer.
 * 
 * @param {PDFDocument} doc - The PDFKit document stream
 * @returns {Promise<Buffer>} - Resolves with the complete PDF Buffer
 */
function compilePdfToBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', err => reject(err));
  });
}

/**
 * Main orchestrator task (Task 7.3)
 * Fetches all Pro users and recent jobs, calculates matches, tailors resumes, and sends digests.
 * 
 * @returns {Promise<Object>} - Run statistics
 */
async function runDailyMatchingAgent() {
  console.log('=== [AGENT] Starting Daily AI Matching & Mailer Agent ===');
  const startTime = Date.now();
  
  const stats = {
    proUsersCount: 0,
    emailsSent: 0,
    jobsProcessed: 0,
    errors: []
  };

  try {
    console.log('[AGENT] Triggering job ingestor to fetch fresh jobs...');
    await ingestJobs();

    // Step 2: Generate daily recommendations for ALL users (fast, no AI, no API)
    console.log('[AGENT] Generating daily recommendations from cached jobs...');
    const recStats = await generateDailyRecommendations();
    console.log(`[AGENT] Recommendations complete: ${recStats.usersProcessed} users, ${recStats.totalRecommendations} total picks.`);

    // Step 3: AI matching + resume tailoring (existing — runs for all onboarded users as freemium)

    // 1. Fetch all users who completed onboarding (making the matching free for all)
    const proUsers = await User.find({ 
      hasCompletedOnboarding: true 
    });

    stats.proUsersCount = proUsers.length;
    console.log(`[AGENT] Found ${proUsers.length} Pro users with completed profiles.`);

    if (proUsers.length === 0) {
      console.log('[AGENT] No active Pro users found. Exiting matching agent.');
      return stats;
    }

    // 2. Fetch recent jobs. (Jobs posted within last 3 days (72 hours), or fall back to all jobs)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    let eligibleJobs = await Job.find({ createdAt: { $gte: threeDaysAgo } });

    if (eligibleJobs.length === 0) {
      console.log('[AGENT] No jobs scraped in the last 3 days. Querying all database jobs as fallback...');
      eligibleJobs = await Job.find({});
    }

    stats.jobsProcessed = eligibleJobs.length;
    console.log(`[AGENT] Found ${eligibleJobs.length} eligible jobs to match against.`);

    if (eligibleJobs.length === 0) {
      console.log('[AGENT] No jobs found in database. Exiting matching agent.');
      return stats;
    }

    // 3. Process each Pro user
    for (const user of proUsers) {
      console.log(`\n--------------------------------------------------`);
      console.log(`[AGENT] Processing candidate: ${user.name} (${user.email})`);
      
      try {
        const matchedJobsList = [];

        // Match profile against each job listing
        for (const job of eligibleJobs) {
          console.log(`- Matching with: "${job.title}" at ${job.company}...`);
          
          const matchResult = await matchJobWithProfile(user.profile, job.description);
          
          if (matchResult.score >= 75) {
            console.log(`  => MATCH! Score: ${matchResult.score}%`);
            matchedJobsList.push({
              title: job.title,
              company: job.company,
              location: job.location,
              applyLink: job.applyLink,
              isDirectLink: job.isDirectLink || false,
              score: matchResult.score,
              reason: matchResult.reason,
              matchedSkills: matchResult.matchedSkills,
              missingSkills: matchResult.missingSkills,
              description: job.description
            });
          } else {
            console.log(`  => Low match (Score: ${matchResult.score}%). Skipping.`);
          }
        }

        if (matchedJobsList.length === 0) {
          console.log(`[AGENT] No matches above 75% found today for user ${user.name}. Skipping email digest.`);
          continue;
        }

        // Sort matches by score descending
        matchedJobsList.sort((a, b) => b.score - a.score);
        console.log(`[AGENT] Found ${matchedJobsList.length} matches. Top score: ${matchedJobsList[0].score}%`);

        // Take top match and perform resume tailoring
        const topJob = matchedJobsList[0];
        console.log(`[AGENT] Tailoring resume for top job: "${topJob.title}" at ${topJob.company}`);
        
        const tailoredProfile = await tailorResumeForJob(user.profile, topJob.description);

        // Compile custom PDF using tailored descriptions
        const docStream = generateResumePDF(user, { tailoredProfile });
        const tailoredResumeBuffer = await compilePdfToBuffer(docStream);

        // Write matched jobs to database (Task 8.2 match persistence)
        console.log(`[AGENT] Logging matched jobs to SentJob database collection...`);
        for (const matchedJob of matchedJobsList) {
          const isTopJob = matchedJob.applyLink === topJob.applyLink;
          await SentJob.updateOne(
            { userId: user._id, applyLink: matchedJob.applyLink },
            {
              $set: {
                title: matchedJob.title,
                company: matchedJob.company,
                location: matchedJob.location,
                isDirectLink: matchedJob.isDirectLink || false,
                score: matchedJob.score,
                reason: matchedJob.reason,
                matchedSkills: matchedJob.matchedSkills,
                missingSkills: matchedJob.missingSkills,
                tailoredProfile: isTopJob ? tailoredProfile : undefined,
                status: 'matched'
              }
            },
            { upsert: true }
          );
        }

        // Email sending deactivated per user pivot (dashboard alert grouping active)
        console.log(`[AGENT] Matches logged. Skipping SMTP email dispatch.`);
      } catch (userError) {
        console.error(`[AGENT ERROR] Failed to process user ${user.name}:`, userError);
        stats.errors.push({ userId: user._id, error: userError.message });
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n==================================================`);
    console.log(`[AGENT SUCCESS] Finished daily matching execution in ${duration}s.`);
    console.log(`- Emails dispatched: ${stats.emailsSent}`);
    console.log(`- Jobs evaluated: ${stats.jobsProcessed}`);
    console.log(`==================================================`);

    return stats;
  } catch (error) {
    console.error('[AGENT CRITICAL] Orchestrator loop failed:', error);
    throw error;
  }
}

module.exports = {
  runDailyMatchingAgent
};
