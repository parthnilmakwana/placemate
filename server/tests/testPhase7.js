// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Job = require('../models/Job');
const { runDailyMatchingAgent } = require('../utils/agent');

// Sample candidate details matching Jane Tester
const candidateProfile = {
  title: 'Fullstack Software Engineer',
  bio: 'I specialize in building full-stack web platforms using React and Node.js. Experienced in database design and server side Express optimization.',
  githubUrl: 'https://github.com/janetester',
  linkedinUrl: 'https://linkedin.com/in/janetester',
  skills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
  education: [
    {
      institution: 'Stanford University',
      degree: 'B.Tech',
      fieldOfStudy: 'Computer Science',
      startYear: 2022,
      endYear: 2026
    }
  ],
  experience: [
    {
      company: 'CodeCrafters',
      position: 'Junior Developer',
      location: 'San Francisco, CA',
      startDate: 'Jun 2024',
      endDate: 'Present',
      current: true,
      description: 'Worked on building frontend features and helped build the authentication system.\nCreated REST APIs and tested core endpoints.'
    }
  ],
  projects: [
    {
      title: 'PlaceMate Dashboard',
      description: 'Made a job matching dashboard that saved some time for applicants.\nTested UI and solved bugs.',
      technologies: ['React', 'Express', 'MongoDB'],
      githubLink: 'https://github.com/janetester/placemate',
      liveLink: 'https://placemate.tech'
    }
  ]
};

// Seed Jobs to verify match filters
const mockJobsList = [
  {
    title: 'React Node Developer (High Match Job)',
    company: 'Innovate Tech Labs',
    location: 'Remote',
    description: `
We are looking for a Node.js Backend Developer.
Responsibilities:
- Build and optimize server-side REST API endpoints using Express and Node.js.
- Handle database design and query optimization with MongoDB.
- Knowledge of AWS deployment, Docker, and containerization is a plus.
- Collaborate with frontend engineers to integrate responsive React interfaces.
Requirements:
- Strong experience with JavaScript/Node.js.
- Familiarity with database optimization (MongoDB indexes).
    `,
    requirements: ['React', 'Node.js', 'Express', 'MongoDB'],
    salary: '$80,000 - $100,000',
    applyLink: 'https://innovatelabs.com/careers/react-node-dev',
    source: 'Seeded Test'
  },
  {
    title: 'Django Python Specialist (Low Match Job)',
    company: 'PyData Corp',
    location: 'New York, NY',
    description: `
We are looking for a Python Django expert to build statistics processing scripts.
Requirements:
- Expert level experience in Python 3.10 and Django.
- Experience with pandas, numpy, and scientific math packages.
- Understanding of Postgres database optimizations.
- No frontend React or Node.js skills required.
    `,
    requirements: ['Python', 'Django', 'PostgreSQL'],
    salary: 'Not Specified',
    applyLink: 'https://pydatacorp.com/careers/django-spec',
    source: 'Seeded Test'
  }
];

async function runIntegrationTest() {
  console.log('Connecting to MongoDB...');
  await connectDB();

  try {
    // 1. Seed or update Pro user in DB
    console.log('\n[TEST SETUP] Upserting mock Pro user in database...');
    let user = await User.findOne({ email: 'jne@example.com' });
    
    if (user) {
      user.plan = 'pro';
      user.hasCompletedOnboarding = true;
      user.profile = candidateProfile;
      await user.save();
      console.log(`Updated existing user: ${user.name}`);
    } else {
      user = await User.create({
        name: 'Jane Tester',
        email: 'jne@example.com',
        password: 'SecurePass123!',
        plan: 'pro',
        hasCompletedOnboarding: true,
        profile: candidateProfile
      });
      console.log(`Created new mock Pro user: ${user.name}`);
    }

    // 2. Seed mock jobs into DB
    console.log('\n[TEST SETUP] Injecting test jobs (upserting via applyLink)...');
    for (const jobData of mockJobsList) {
      await Job.updateOne(
        { applyLink: jobData.applyLink },
        { $set: jobData },
        { upsert: true }
      );
    }
    console.log('Seeded job listings injected successfully.');

    // 3. Trigger orchestrator matching loop
    console.log('\n[TEST EXECUTION] Invoking matching agent loop...');
    const results = await runDailyMatchingAgent();

    console.log('\n[TEST VERIFICATION] Verification outcomes:');
    console.log(`- Pro users found: ${results.proUsersCount}`);
    console.log(`- Matches found & emails sent: ${results.emailsSent}`);
    console.log(`- Failures recorded: ${results.errors.length}`);
    
    if (results.emailsSent > 0) {
      console.log('\n[SUCCESS] Mock email sent. Check server/tests/mock-email-log.html to view the final digest!');
    } else {
      console.warn('\n[WARNING] Matching loop completed, but no emails were dispatched. Check candidate settings or job score criteria.');
    }

  } catch (error) {
    console.error('Integration test failed with error:', error);
  } finally {
    console.log('\nDisconnecting from MongoDB...');
    await mongoose.connection.close();
    console.log('Database connection closed safely.');
  }
}

runIntegrationTest();
