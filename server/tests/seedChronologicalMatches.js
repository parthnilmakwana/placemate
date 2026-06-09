// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const SentJob = require('../models/SentJob');

// Helper to subtract days from current date
const getPastDate = (daysAgo) => {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
};

// Simulated Tailored Resume Payload
const mockTailoredProfile = {
  bio: 'Accomplished Fullstack Developer with specialized experience in React, Node.js, and MongoDB optimization.',
  experience: [
    {
      company: 'CodeCrafters',
      position: 'Junior Developer',
      description: 'Engineered high-performance REST APIs in Node.js/Express. Integrated tailored user session tracking components using React.'
    }
  ],
  projects: [
    {
      title: 'PlaceMate Dashboard',
      description: 'Designed and deployed an automated job-matching platform using React and MongoDB.'
    }
  ]
};

async function seedChronologicalMatches() {
  console.log('Connecting to MongoDB...');
  await connectDB();

  try {
    // 1. Fetch Jane Tester
    const user = await User.findOne({ email: 'jne@example.com' });
    if (!user) {
      console.error('[ERROR] Jane Tester (jne@example.com) not found in database. Please run testPhase7.js first to create the user.');
      process.exit(1);
    }

    console.log(`Found candidate: ${user.name} (${user._id})`);

    // 2. Clear out existing matched records for this user
    console.log('Clearing existing SentJob records for this candidate...');
    await SentJob.deleteMany({ userId: user._id });

    // 3. Define 8 custom mock matched jobs
    const mockMatches = [
      // TODAY'S MATCHES (3 matches)
      {
        userId: user._id,
        title: 'Senior React Developer',
        company: 'Innovate Tech Labs',
        location: 'Remote',
        applyLink: 'https://innovatelabs.com/careers/sr-react',
        score: 95,
        reason: 'Outstanding match with frontend specifications. Candidate shows deep React experience and project leadership.',
        matchedSkills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
        missingSkills: ['TypeScript'],
        tailoredProfile: mockTailoredProfile, // This top job gets the tailored resume
        status: 'matched',
        createdAt: getPastDate(0) // Today
      },
      {
        userId: user._id,
        title: 'Backend Node.js Engineer',
        company: 'CloudScale Labs',
        location: 'Bangalore, India',
        applyLink: 'https://cloudscale.com/careers/backend-node',
        score: 88,
        reason: 'Strong Express and MongoDB design compatibility. Lacks experience with containerization technologies.',
        matchedSkills: ['JavaScript', 'Node.js', 'Express', 'MongoDB'],
        missingSkills: ['Docker', 'AWS'],
        status: 'matched',
        createdAt: getPastDate(0) // Today
      },
      {
        userId: user._id,
        title: 'Fullstack Intern',
        company: 'Launchpad Software',
        location: 'Mumbai, India',
        applyLink: 'https://launchpad.io/careers/intern',
        score: 80,
        reason: 'Excellent academic background and project work fits the internship profile.',
        matchedSkills: ['JavaScript', 'React', 'Node.js', 'Express'],
        missingSkills: ['Tailwind CSS'],
        status: 'matched',
        createdAt: getPastDate(0) // Today
      },

      // YESTERDAY'S MATCHES (3 matches)
      {
        userId: user._id,
        title: 'Node.js API Specialist',
        company: 'HyperStream Tech',
        location: 'Remote',
        applyLink: 'https://hyperstream.io/node-spec',
        score: 91,
        reason: 'High expertise in API architecture and DB modeling aligns with the backend team structure.',
        matchedSkills: ['JavaScript', 'Node.js', 'Express', 'MongoDB'],
        missingSkills: ['Redis'],
        status: 'matched',
        createdAt: getPastDate(1) // Yesterday
      },
      {
        userId: user._id,
        title: 'Frontend Engineer (React)',
        company: 'WebFlow Studios',
        location: 'Remote',
        applyLink: 'https://webflow.co/frontend-react',
        score: 84,
        reason: 'Great UI/UX skills. Candidate would benefit from adding testing framework experiences.',
        matchedSkills: ['JavaScript', 'React', 'Tailwind CSS'],
        missingSkills: ['Jest', 'Cypress'],
        status: 'applied', // Let's mark one as applied to check applied stats
        createdAt: getPastDate(1) // Yesterday
      },
      {
        userId: user._id,
        title: 'Junior Software Engineer',
        company: 'Delta Solutions',
        location: 'Delhi, India',
        applyLink: 'https://deltasolutions.in/jr-eng',
        score: 78,
        reason: 'Fits the junior profile well, though lacking deep backend architecture exposure.',
        matchedSkills: ['JavaScript', 'React', 'Node.js'],
        missingSkills: ['MongoDB', 'Express'],
        status: 'matched',
        createdAt: getPastDate(1) // Yesterday
      },

      // OLDER MATCHES (2 matches)
      {
        userId: user._id,
        title: 'MERN Stack Developer',
        company: 'StackBuilders Corp',
        location: 'Remote',
        applyLink: 'https://stackbuilders.com/mern-dev',
        score: 89,
        reason: 'Perfect overlap with candidate\'s core project technologies (MERN stack).',
        matchedSkills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
        missingSkills: [],
        status: 'matched',
        createdAt: getPastDate(2) // 2 Days Ago
      },
      {
        userId: user._id,
        title: 'Javascript Developer',
        company: 'CodeBase LLC',
        location: 'Pune, India',
        applyLink: 'https://codebase.com/js-dev',
        score: 76,
        reason: 'Good foundational javascript knowledge, but candidate needs to expand on backend frameworks.',
        matchedSkills: ['JavaScript'],
        missingSkills: ['React', 'Node.js'],
        status: 'matched',
        createdAt: getPastDate(3) // 3 Days Ago
      }
    ];

    console.log('Inserting mock chronological matched records...');
    const inserted = await SentJob.insertMany(mockMatches);
    console.log(`Successfully seeded ${inserted.length} mock matches!`);

  } catch (error) {
    console.error('[CRITICAL] Seeding failed:', error);
  } finally {
    console.log('Disconnecting database...');
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seedChronologicalMatches();
