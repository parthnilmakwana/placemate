const mongoose = require('mongoose');

/**
 * DailyRecommendation Model
 * 
 * PURPOSE: Store exactly 5 recommended jobs per user per day.
 * 
 * WHY SEPARATE FROM SentJob?
 *   - SentJob = AI-matched results with tailored resumes (heavy, premium feature)
 *   - DailyRecommendation = lightweight "today's picks" from cached DB (fast, free)
 * 
 * DESIGN DECISIONS:
 *   - `date` is stored as 'YYYY-MM-DD' string for easy day-based queries
 *   - Job fields are denormalized (copied from Job collection) so reading
 *     recommendations is a single query with zero joins/populates
 *   - Compound unique index on {userId, date} guarantees one entry per user per day
 */
const DailyRecommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Date in 'YYYY-MM-DD' format — simplifies "today/yesterday/2 days ago" queries
  date: {
    type: String,
    required: true,
    index: true
  },
  // Array of exactly 5 recommended jobs (denormalized for fast reads)
  recommendedJobs: [{
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: 'Remote' },
    category: { type: String, default: 'Other' },
    skills: { type: [String], default: [] },
    salary: { type: String, default: 'Not Specified' },
    applyUrl: { type: String, required: true },
    isDirectLink: { type: Boolean, default: false },
    // Score computed by the recommendation algorithm (0-100)
    matchScore: { type: Number, default: 0 },
    // Human-readable reasons why this job was recommended
    matchReasons: { type: [String], default: [] }
  }],
  // Timestamp of when the engine generated these recommendations
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

// Guarantee exactly one recommendation set per user per day
DailyRecommendationSchema.index({ userId: 1, date: 1 }, { unique: true });

// Fast lookup for "show me last 3 days" queries
DailyRecommendationSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('DailyRecommendation', DailyRecommendationSchema);
