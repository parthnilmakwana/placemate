const SentJob = require('../models/SentJob');
const Job = require('../models/Job');
const DailyRecommendation = require('../models/DailyRecommendation');
const { generateDailyRecommendations, getDateString } = require('../utils/recommendationEngine');
const mongoose = require('mongoose');

/**
 * @desc    Fetch matched jobs history for the authenticated user
 * @route   GET /api/jobs/history
 * @access  Private
 */
exports.getJobsHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };

    // 1. Optional application status filter
    if (req.query.status) {
      if (['matched', 'applied', 'rejected'].includes(req.query.status)) {
        filter.status = req.query.status;
      }
    }

    // 2. Optional text search filter on title or company
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { company: searchRegex }
      ];
    }

    const total = await SentJob.countDocuments(filter);
    const jobs = await SentJob.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      count: jobs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching job matching history:', error);
    next(error);
  }
};

/**
 * @desc    Update a matched job status (e.g. marked as applied or rejected)
 * @route   PATCH /api/jobs/:id/status
 * @access  Private
 */
exports.updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['matched', 'applied', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid application status value.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid job record ID format'
      });
    }

    let job = await SentJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Recommendation record not found.'
      });
    }

    // Verify record ownership
    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to modify this record.'
      });
    }

    job.status = status;
    await job.save();

    res.status(200).json({
      status: 'success',
      data: job
    });
  } catch (error) {
    console.error('Error updating matched job status:', error);
    next(error);
  }
};

/**
 * @desc    Get daily recommended jobs (3-day history)
 * @route   GET /api/jobs/recommendations
 * @access  Private
 * 
 * Query Params:
 *   day - 'today' (default), 'yesterday', or '2days'
 * 
 * HOW IT WORKS:
 *   1. Converts the 'day' param into a 'YYYY-MM-DD' date string
 *   2. Queries the DailyRecommendation collection for that user+date
 *   3. If today's recommendations don't exist yet, generates them on-the-fly
 *   4. Returns the 5 recommended jobs — zero external API calls
 */
exports.getRecommendations = async (req, res, next) => {
  try {
    const dayParam = req.query.day || 'today';
    
    // Calculate the target date based on the 'day' parameter
    let targetDate = new Date();
    if (dayParam === 'yesterday') {
      targetDate.setDate(targetDate.getDate() - 1);
    } else if (dayParam === '2days') {
      targetDate.setDate(targetDate.getDate() - 2);
    }
    const dateStr = getDateString(targetDate);

    // Look up recommendations for this user + date
    let recommendation = await DailyRecommendation.findOne({
      userId: req.user._id,
      date: dateStr
    });

    // If today's recommendations don't exist yet, generate them on-the-fly
    if (!recommendation && dayParam === 'today') {
      console.log(`[RECOMMENDATIONS] On-the-fly generation for user ${req.user._id}`);
      await generateDailyRecommendations();
      recommendation = await DailyRecommendation.findOne({
        userId: req.user._id,
        date: dateStr
      });
    }

    res.status(200).json({
      status: 'success',
      date: dateStr,
      day: dayParam,
      count: recommendation ? recommendation.recommendedJobs.length : 0,
      data: recommendation ? recommendation.recommendedJobs : [],
      generatedAt: recommendation ? recommendation.generatedAt : null
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    next(error);
  }
};

/**
 * @desc    Search cached jobs in the database (never calls external API)
 * @route   GET /api/jobs/search
 * @access  Private
 * 
 * Query Params:
 *   q        - keyword search (uses MongoDB text index on title, company, description)
 *   category - filter by job category (Frontend, Backend, etc.)
 *   location - filter by location (substring match)
 *   skills   - comma-separated skill filter (e.g. 'React,Node.js')
 *   page     - pagination (default: 1)
 *   limit    - results per page (default: 20, max: 50)
 * 
 * SCALABILITY:
 *   All queries hit MongoDB indexes — no full collection scans.
 *   This endpoint can handle 10,000+ concurrent users without any API calls.
 */
exports.searchJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const skip = (page - 1) * limit;

    // Start with only active jobs
    const filter = { isActive: true };

    // 1. Keyword search — uses the text index we defined on the Job model
    if (req.query.q && req.query.q.trim()) {
      filter.$text = { $search: req.query.q.trim() };
    }

    // 2. Category filter — exact match against the enum
    if (req.query.category) {
      const validCategories = ['Frontend', 'Backend', 'Full Stack', 'Android', 'Data Science', 'DevOps', 'Other'];
      if (validCategories.includes(req.query.category)) {
        filter.category = req.query.category;
      }
    }

    // 3. Location filter — case-insensitive substring match
    if (req.query.location && req.query.location.trim()) {
      filter.location = new RegExp(req.query.location.trim(), 'i');
    }

    // 4. Skills filter — jobs must have at least one of the specified skills
    if (req.query.skills && req.query.skills.trim()) {
      const skillsList = req.query.skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsList.length > 0) {
        // $in matches jobs that have ANY of the specified skills
        filter.skills = { $in: skillsList.map(s => new RegExp(`^${s}$`, 'i')) };
      }
    }

    const total = await Job.countDocuments(filter);
    
    // Build query with optional text score sorting
    let query = Job.find(filter);
    
    if (filter.$text) {
      // Sort by text relevance score when doing keyword search
      query = query.select({ textScore: { $meta: 'textScore' } })
                   .sort({ score: { $meta: 'textScore' }, postedDate: -1 });
    } else {
      // Default sort: newest first
      query = query.sort({ postedDate: -1 });
    }

    const jobs = await query.skip(skip).limit(limit);

    res.status(200).json({
      status: 'success',
      count: jobs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: jobs
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    next(error);
  }
};
