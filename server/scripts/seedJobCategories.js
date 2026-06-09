const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('../models/Job');
const { inferCategory } = require('../utils/scrapers/normalize');

// Load env config
dotenv.config();

/**
 * Migration Script: Backfill Job Categories & Skills
 * 
 * Run this ONCE to update existing jobs in the database that were scraped
 * before the category and skills fields were added to the schema.
 * 
 * Usage: node seedJobCategories.js
 */
async function backfillJobs() {
  console.log('--- Starting Job Category & Skills Backfill ---');
  
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placemate');
    console.log('Connected to MongoDB.');

    // Find all active jobs that have the default 'Other' category 
    // OR empty skills array (but might have requirements)
    const jobsToUpdate = await Job.find({
      isActive: true,
      $or: [
        { category: 'Other' },
        { category: { $exists: false } },
        { skills: { $size: 0 } },
        { skills: { $exists: false } }
      ]
    });

    console.log(`Found ${jobsToUpdate.length} jobs needing updates.`);

    if (jobsToUpdate.length === 0) {
      console.log('No jobs to update. Exiting.');
      process.exit(0);
    }

    let updatedCount = 0;
    const bulkOps = [];

    for (const job of jobsToUpdate) {
      const updates = {};
      
      // 1. Infer category from title if it's currently 'Other' or missing
      if (!job.category || job.category === 'Other') {
        const newCategory = inferCategory(job.title);
        updates.category = newCategory;
      }

      // 2. Migrate existing requirements to skills if skills array is empty
      if (!job.skills || job.skills.length === 0) {
        if (job.requirements && job.requirements.length > 0) {
           updates.skills = job.requirements;
        }
      }
      
      // If we found something to update, add it to bulk ops
      if (Object.keys(updates).length > 0) {
        bulkOps.push({
          updateOne: {
            filter: { _id: job._id },
            update: { $set: updates }
          }
        });
        updatedCount++;
      }
    }

    if (bulkOps.length > 0) {
      console.log(`Executing ${bulkOps.length} updates...`);
      const result = await Job.bulkWrite(bulkOps);
      console.log(`Successfully updated ${result.modifiedCount} jobs.`);
    } else {
      console.log('Analyzed jobs, but no updates were needed.');
    }

  } catch (err) {
    console.error('Error during backfill:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

backfillJobs();
