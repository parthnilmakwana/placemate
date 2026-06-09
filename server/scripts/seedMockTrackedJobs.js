require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const SentJob = require('../models/SentJob');

async function run() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placemate');
    console.log('Connected to MongoDB');

    // 1. Get all onboarded users
    const onboardedUsers = await User.find({ hasCompletedOnboarding: true }).lean();
    if (onboardedUsers.length === 0) {
      console.log('No onboarded users found in the database. Please complete onboarding first.');
      process.exit(0);
    }

    // 2. Clean out the sentjobs collection
    console.log('Cleaning old tracking items...');
    await SentJob.deleteMany({});

    // 3. Define mock jobs
    const mockTrackedJobs = [
      {
        title: 'Frontend Developer Intern',
        company: 'Paytm',
        location: 'Noida, Uttar Pradesh, IN',
        applyLink: 'https://careers.paytm.com/jobs/frontend-intern-1',
        score: 88,
        reason: 'Matches HTML5, React, and Tailwind CSS preferences.',
        matchedSkills: ['React', 'HTML5', 'CSS3', 'JavaScript'],
        status: 'matched'
      },
      {
        title: 'React Software Engineer',
        company: 'Flipkart',
        location: 'Bengaluru, Karnataka, IN',
        applyLink: 'https://careers.flipkart.com/jobs/react-dev-2',
        score: 92,
        reason: 'Excellent match for React, Redux, and Node.js skills.',
        matchedSkills: ['React', 'Redux', 'JavaScript', 'Node.js'],
        status: 'applied'
      },
      {
        title: 'Node.js Backend Engineer',
        company: 'Zomato',
        location: 'Gurugram, Haryana, IN',
        applyLink: 'https://careers.zomato.com/jobs/node-backend-3',
        score: 79,
        reason: 'Good match for Node.js and MongoDB.',
        matchedSkills: ['Node.js', 'Express', 'MongoDB'],
        status: 'rejected'
      }
    ];

    // 4. Seed for each user
    console.log(`Seeding ${mockTrackedJobs.length} mock jobs for ${onboardedUsers.length} users...`);
    for (const user of onboardedUsers) {
      const docs = mockTrackedJobs.map(job => ({
        ...job,
        userId: user._id
      }));
      await SentJob.insertMany(docs);
      console.log(`Seeded mock tracker cards for user: ${user.name} (${user.email})`);
    }

    console.log('Successfully seeded database preview items.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

run();
