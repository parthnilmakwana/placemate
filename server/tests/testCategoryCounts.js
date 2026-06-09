require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('../models/Job');

async function testCategoryCounts() {
  console.log('=== Checking Job Database Category Counts ===\n');

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placemate');
    console.log('✅ Connected to Database.\n');

    const totalJobs = await Job.countDocuments({ isActive: true });
    console.log(`Total Active Jobs in Database: ${totalJobs}\n`);

    // Group active jobs by category and count them
    const categoryCounts = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('--- Jobs Breakdown by Category ---');
    if (categoryCounts.length === 0) {
      console.log('No active jobs found in the database.');
    } else {
      categoryCounts.forEach(cat => {
        const categoryName = cat._id || 'Unknown / Uncategorized';
        console.log(`${categoryName.padEnd(20, ' ')} : ${cat.count} jobs`);
      });
    }
    console.log('----------------------------------\n');

    // Run a quick cache search test to prove DB fetching works
    console.log('--- Testing DB Search Fetching ---');
    
    // Pick the top category to search for
    const topCategory = categoryCounts[0]?._id || 'Frontend';
    const sampleSearch = await Job.find({ category: topCategory, isActive: true }).limit(3).select('title company category');
    
    console.log(`Successfully fetched 3 sample jobs from the "${topCategory}" category directly from the database cache:`);
    sampleSearch.forEach(job => {
      console.log(`- [${job.category}] ${job.title} at ${job.company}`);
    });
    
    console.log('\n✅ All checks complete.');

  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testCategoryCounts();
