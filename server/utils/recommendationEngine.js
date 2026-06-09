const Job = require('../models/Job');
const User = require('../models/User');
const DailyRecommendation = require('../models/DailyRecommendation');

/**
 * Recommendation Engine — Pure Database, No AI, No External APIs
 * 
 * ARCHITECTURE:
 *   This engine replaces the need for AI scoring for daily job picks.
 *   It uses a simple point-based scoring system that runs entirely on
 *   data already in MongoDB.
 * 
 * PERFORMANCE:
 *   - 50 jobs × 100 users = 5,000 score calculations
 *   - Each calculation is pure JS math (no I/O)
 *   - Total time: ~50ms for 100 users
 *   - Scales to 10,000 users: ~5 seconds (still very fast)
 * 
 * SCORING FORMULA:
 *   Score = SkillScore(40) + CategoryScore(25) + LocationScore(15) + RecencyScore(20)
 *   Jobs shown to user in last 7 days get -100 penalty (effectively excluded)
 */

// ═══════════════════════════════════════════════════════════════
// SCORING WEIGHTS — tune these to change recommendation quality
// ═══════════════════════════════════════════════════════════════
const WEIGHTS = {
  SKILLS: 30,      // How important is skill match?
  EXPERIENCE: 20,  // How important is experience match?
  CATEGORY: 20,    // How important is job category match?
  LOCATION: 10,    // How important is location match?
  EDUCATION: 10,   // How important is education match?
  RECENCY: 10,     // How important is job freshness?
};

const REPEAT_PENALTY = -100; // Exclude recently shown jobs
const REPEAT_LOOKBACK_DAYS = 7; // How far back to check for repeats
const RECOMMENDATIONS_PER_USER = 5; // Exactly 5 picks per user per day

/**
 * Gets today's date as 'YYYY-MM-DD' string (for consistent day-based queries)
 */
function getDateString(date = new Date()) {
  return date.toISOString().split('T')[0];
}

/**
 * SKILL SCORING (0 to 40 points)
 * 
 * HOW IT WORKS:
 *   Compares the user's preferredSkills against the job's skills array.
 *   Score = (number of matching skills / total user skills) × 40
 * 
 * EXAMPLE:
 *   User skills: ['React', 'Node.js', 'MongoDB']
 *   Job skills: ['React', 'TypeScript', 'MongoDB']
 *   Matched: 2 out of 3 → (2/3) × 40 = 26.7 points
 * 
 * EDGE CASE:
 *   If user has no preferred skills, every job gets 20 points (neutral)
 *   This prevents new users from getting zero recommendations
 */
function computeSkillScore(userSkills, jobSkills) {
  if (!userSkills || userSkills.length === 0) return WEIGHTS.SKILLS / 2; // Neutral

  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  const jobSkillsLower = (jobSkills || []).map(s => s.toLowerCase());

  let matchCount = 0;
  for (const skill of userSkillsLower) {
    if (jobSkillsLower.includes(skill)) {
      matchCount++;
    }
  }

  return (matchCount / userSkills.length) * WEIGHTS.SKILLS;
}

/**
 * CATEGORY SCORING (0 or 25 points)
 * 
 * HOW IT WORKS:
 *   If user has preferred categories and the job matches one → full 25 points
 *   If user has no category preference → 10 points (neutral-ish, doesn't dominate)
 *   If user has preferences but this job doesn't match → 0 points
 */
function computeCategoryScore(userCategories, jobCategory) {
  if (!userCategories || userCategories.length === 0) return 10; // No pref = mild boost

  if (userCategories.includes(jobCategory)) {
    return WEIGHTS.CATEGORY;
  }
  return 0;
}

/**
 * LOCATION SCORING (0 or 15 points)
 * 
 * HOW IT WORKS:
 *   Matches based on two dimensions:
 *   1. Remote preference: if user wants remote and job IS remote → match
 *   2. Target locations: if job location contains any of user's target locations → match
 *   If user has 'any' preference and no target locations → 8 points (neutral)
 */
function computeLocationScore(userPrefs, jobLocation) {
  const remotePreference = userPrefs?.remotePreference || 'any';
  const targetLocations = userPrefs?.targetLocations || [];
  const jobLoc = (jobLocation || '').toLowerCase();
  const isRemote = jobLoc === 'remote';

  // Remote preference matching
  if (remotePreference === 'remote' && isRemote) return WEIGHTS.LOCATION;
  if (remotePreference === 'onsite' && !isRemote) {
    // Check if location matches any target
    if (targetLocations.length > 0) {
      const matches = targetLocations.some(loc => jobLoc.includes(loc.toLowerCase()));
      return matches ? WEIGHTS.LOCATION : 0;
    }
    return WEIGHTS.LOCATION / 2;
  }

  // 'any' or 'hybrid' — check target locations if available
  if (targetLocations.length > 0) {
    const matches = targetLocations.some(loc => jobLoc.includes(loc.toLowerCase()));
    if (matches || isRemote) return WEIGHTS.LOCATION;
    return 0;
  }

  // No location preference at all → neutral
  return WEIGHTS.LOCATION / 2;
}

/**
 * RECENCY SCORING (4 to 20 points)
 * 
 * HOW IT WORKS:
 *   Jobs posted today get maximum points (20).
 *   Points decrease linearly with age.
 *   Oldest jobs (>7 days) still get 4 points — they're not worthless,
 *   just less exciting than fresh listings.
 * 
 * WHY NOT ZERO FOR OLD JOBS?
 *   A 10-day-old job with perfect skill match is better than
 *   a 1-day-old job with zero skill match. The 4-point minimum
 *   prevents recency from completely overriding relevance.
 */
function computeRecencyScore(postedDate) {
  const now = Date.now();
  const posted = new Date(postedDate).getTime();
  const ageInDays = Math.max(0, (now - posted) / (1000 * 60 * 60 * 24));

  if (ageInDays <= 1) return WEIGHTS.RECENCY;        // 10 pts — today
  if (ageInDays <= 2) return WEIGHTS.RECENCY * 0.8;   // 8 pts — yesterday
  if (ageInDays <= 3) return WEIGHTS.RECENCY * 0.6;   // 6 pts — 2 days ago
  if (ageInDays <= 5) return WEIGHTS.RECENCY * 0.4;   // 4 pts — 3-5 days ago
  return WEIGHTS.RECENCY * 0.2;                        // 2 pts — older
}

/**
 * EXPERIENCE SCORING (0 to 20 points)
 */
function computeExperienceScore(userPrefs, jobExperienceLevel) {
  const userExp = userPrefs?.experienceLevel || 'any';
  const jobExp = jobExperienceLevel || 'any';

  if (userExp === 'any' || jobExp === 'any') return WEIGHTS.EXPERIENCE / 2; // Neutral
  if (userExp === jobExp) return WEIGHTS.EXPERIENCE; // Perfect match
  
  // Close matches (user has more experience than required)
  if (userExp === 'senior' && (jobExp === 'mid' || jobExp === 'junior')) return WEIGHTS.EXPERIENCE * 0.8;
  if (userExp === 'mid' && jobExp === 'junior') return WEIGHTS.EXPERIENCE * 0.8;
  
  // User applying for roles slightly above their level
  if (userExp === 'mid' && jobExp === 'senior') return WEIGHTS.EXPERIENCE * 0.4;
  if (userExp === 'junior' && jobExp === 'mid') return WEIGHTS.EXPERIENCE * 0.4;
  if (userExp === 'fresher' && jobExp === 'junior') return WEIGHTS.EXPERIENCE * 0.4;

  return 0; // Way underqualified or way overqualified
}

/**
 * EDUCATION SCORING (0 to 10 points)
 */
function computeEducationScore(userEducationLevel, jobEducationLevel) {
  const jobEd = jobEducationLevel || 'any';
  if (jobEd === 'any') return WEIGHTS.EDUCATION; // Job doesn't require specific education -> Fully accessible
  
  const userEd = userEducationLevel || 'any';
  if (userEd === 'any') return WEIGHTS.EDUCATION / 2; // Neutral if user hasn't specified
  
  if (userEd === jobEd) return WEIGHTS.EDUCATION;
  
  // Hierarchy: PhD > Masters > Bachelors
  const edLevels = ['bachelors', 'masters', 'phd'];
  const userIdx = edLevels.indexOf(userEd);
  const jobIdx = edLevels.indexOf(jobEd);
  
  if (userIdx >= jobIdx && jobIdx !== -1) return WEIGHTS.EDUCATION; // User has higher or equal education
  
  return 0; // User lacks required education
}

/**
 * Extracts normalized education level from a user's education array
 */
function extractUserEducationLevel(educationArray) {
  if (!educationArray || educationArray.length === 0) return 'any';
  const degrees = educationArray.map(e => (e.degree || '').toLowerCase());
  if (degrees.some(d => d.includes('phd') || d.includes('doctorate'))) return 'phd';
  if (degrees.some(d => d.match(/\b(master|masters|m\.tech|m\.sc|mca)\b/))) return 'masters';
  if (degrees.some(d => d.match(/\b(bachelor|bachelors|b\.tech|b\.sc|bca|b\.e)\b/))) return 'bachelors';
  return 'any';
}

/**
 * Compute total match score for a single job against a single user.
 * 
 * @param {Object} userPrefs - The user's profile.preferences object + top-level skills + derived education
 * @param {Object} job - A Job document from the database
 * @param {Set<string>} recentJobIds - Set of job IDs already shown to this user recently
 * @returns {{ score: number, reasons: string[] }}
 */
function scoreJobForUser(userPrefs, job, recentJobIds) {
  const reasons = [];

  // Check repeat penalty first (early exit for efficiency)
  if (recentJobIds.has(job._id.toString())) {
    return { score: REPEAT_PENALTY, reasons: ['Already recommended recently'] };
  }

  // 1. Skill match
  const allUserSkills = [
    ...(userPrefs?.preferredSkills || []),
    ...(userPrefs?.skills || [])
  ];
  const uniqueSkills = [...new Set(allUserSkills)];
  const skillScore = computeSkillScore(uniqueSkills, job.skills);
  if (skillScore > WEIGHTS.SKILLS * 0.5) {
    const matched = (job.skills || []).filter(s => 
      uniqueSkills.map(u => u.toLowerCase()).includes(s.toLowerCase())
    );
    if (matched.length > 0) reasons.push(`Skill match: ${matched.join(', ')}`);
  }

  // 2. Experience match
  const experienceScore = computeExperienceScore(userPrefs, job.experienceLevel);
  if (experienceScore >= WEIGHTS.EXPERIENCE * 0.8 && job.experienceLevel && job.experienceLevel !== 'any') {
    reasons.push(`Experience level match: ${job.experienceLevel}`);
  }

  // 3. Category match
  const categoryScore = computeCategoryScore(userPrefs?.preferredCategories, job.category);
  if (categoryScore === WEIGHTS.CATEGORY) {
    reasons.push(`Category match: ${job.category}`);
  }

  // 4. Location match
  const locationScore = computeLocationScore(userPrefs, job.location);
  if (locationScore === WEIGHTS.LOCATION) {
    reasons.push(`Location match: ${job.location}`);
  }

  // 5. Education match
  const educationScore = computeEducationScore(userPrefs?.derivedEducationLevel, job.educationLevel);
  if (educationScore === WEIGHTS.EDUCATION && job.educationLevel && job.educationLevel !== 'any') {
    reasons.push(`Education requirements met`);
  }

  // 6. Recency
  const recencyScore = computeRecencyScore(job.postedDate);
  if (recencyScore >= WEIGHTS.RECENCY * 0.8) {
    reasons.push('Recently posted');
  }

  const totalScore = Math.round(skillScore + experienceScore + categoryScore + locationScore + educationScore + recencyScore);

  return { score: Math.min(totalScore, 100), reasons };
}

/**
 * MAIN ENTRY POINT — Generate daily recommendations for all users.
 * 
 * FLOW:
 *   1. Load all active jobs from DB
 *   2. Load all onboarded users
 *   3. For each user, load their recent recommendations (for repeat avoidance)
 *   4. Score every job against the user
 *   5. Pick top 5
 *   6. Write to DailyRecommendation collection
 * 
 * COST: Zero API calls. Pure database reads + JS math + one write per user.
 */
async function generateDailyRecommendations() {
  console.log('[RECOMMENDATION ENGINE] Starting daily recommendation generation...');
  const startTime = Date.now();

  try {
    // 1. Fetch all active jobs
    const activeJobs = await Job.find({ isActive: true }).lean();
    console.log(`[RECOMMENDATION ENGINE] Found ${activeJobs.length} active jobs in database.`);

    if (activeJobs.length === 0) {
      console.log('[RECOMMENDATION ENGINE] No active jobs found. Skipping recommendations.');
      return { usersProcessed: 0, totalRecommendations: 0 };
    }

    // 2. Fetch all onboarded users
    const users = await User.find({ hasCompletedOnboarding: true })
      .select('profile.preferences profile.skills profile.education')
      .lean();

    console.log(`[RECOMMENDATION ENGINE] Found ${users.length} onboarded users.`);

    if (users.length === 0) {
      console.log('[RECOMMENDATION ENGINE] No onboarded users found. Skipping.');
      return { usersProcessed: 0, totalRecommendations: 0 };
    }

    const todayStr = getDateString();
    let totalRecommendations = 0;

    // 3. Process each user
    for (const user of users) {
      try {
        // 3a. Check if today's recommendations already exist (idempotent)
        const existing = await DailyRecommendation.findOne({
          userId: user._id,
          date: todayStr
        });

        if (existing) {
          console.log(`[RECOMMENDATION ENGINE] User ${user._id} already has today's recommendations. Skipping.`);
          continue;
        }

        // 3b. Get recently recommended job IDs to avoid repeats
        const lookbackDate = getDateString(new Date(Date.now() - REPEAT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000));
        const recentRecs = await DailyRecommendation.find({
          userId: user._id,
          date: { $gte: lookbackDate }
        }).lean();

        const recentJobIds = new Set();
        for (const rec of recentRecs) {
          for (const job of rec.recommendedJobs) {
            recentJobIds.add(job.jobId.toString());
          }
        }

        // 3c. Score every active job for this user
        const userPrefs = user.profile?.preferences || {};
        const userSkills = user.profile?.skills || [];
        const derivedEducationLevel = extractUserEducationLevel(user.profile?.education || []);
        
        // Merge profile info into preferences object for the scoring engine
        const mergedPrefs = { 
          ...userPrefs, 
          skills: userSkills,
          derivedEducationLevel
        };

        const scoredJobs = activeJobs.map(job => {
          const { score, reasons } = scoreJobForUser(mergedPrefs, job, recentJobIds);
          return { job, score, reasons };
        });

        // 3d. Sort by score descending, take top 5
        scoredJobs.sort((a, b) => b.score - a.score);
        const topJobs = scoredJobs
          .filter(sj => sj.score > 0) // Exclude negative scores (repeat penalty)
          .slice(0, RECOMMENDATIONS_PER_USER);

        if (topJobs.length === 0) {
          console.log(`[RECOMMENDATION ENGINE] No suitable jobs found for user ${user._id}. Skipping.`);
          continue;
        }

        // 3e. Build and save the recommendation document
        const recommendation = new DailyRecommendation({
          userId: user._id,
          date: todayStr,
          recommendedJobs: topJobs.map(({ job, score, reasons }) => ({
            jobId: job._id,
            title: job.title,
            company: job.company,
            location: job.location,
            category: job.category || 'Other',
            skills: job.skills || [],
            salary: job.salary || 'Not Specified',
            applyUrl: job.applyLink,
            isDirectLink: job.isDirectLink || false,
            matchScore: score,
            matchReasons: reasons
          })),
          generatedAt: new Date()
        });

        await recommendation.save();
        totalRecommendations += topJobs.length;
        console.log(`[RECOMMENDATION ENGINE] Generated ${topJobs.length} recommendations for user ${user._id} (top score: ${topJobs[0].score}).`);

      } catch (userError) {
        console.error(`[RECOMMENDATION ENGINE ERROR] Failed for user ${user._id}:`, userError.message);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[RECOMMENDATION ENGINE] Completed in ${duration}s. Users: ${users.length}, Total recommendations: ${totalRecommendations}.`);

    return { usersProcessed: users.length, totalRecommendations };
  } catch (error) {
    console.error('[RECOMMENDATION ENGINE CRITICAL] Failed:', error);
    throw error;
  }
}

module.exports = {
  generateDailyRecommendations,
  scoreJobForUser, // Exported for testing
  getDateString
};
