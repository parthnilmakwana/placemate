// Load environment variables from .env
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { matchJobWithProfile, tailorResumeForJob } = require('../utils/aiMatcher');
const { generateResumePDF } = require('../utils/pdfgen');

// Mock candidate profile (Jane Tester)
const mockUser = {
  name: 'Jane Tester',
  email: 'jane.tester@example.com',
  profile: {
    title: 'Fullstack Software Engineer',
    bio: 'I was in charge of building web platforms and was responsible for handling database scaling solutions.',
    githubUrl: 'https://github.com/janetester',
    linkedinUrl: 'https://linkedin.com/in/janetester',
    skills: ['JavaScript', 'Node.js', 'Express', 'React', 'MongoDB', 'Tailwind CSS'],
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
  }
};

// Target Job Description we are applying to
const targetJobDescription = `
We are looking for a Node.js Backend Developer.
Responsibilities:
- Build and optimize server-side REST API endpoints using Express and Node.js.
- Handle database design and query optimization with MongoDB.
- Knowledge of AWS deployment, Docker, and containerization is a plus.
- Collaborate with frontend engineers to integrate responsive interfaces.
Requirements:
- Strong experience with JavaScript/Node.js.
- Familiarity with database optimization (MongoDB indexes).
- Experience with testing suites and code quality tools.
`;

async function executeTest() {
  console.log('==================================================');
  console.log('   STARTING PHASE 6 AI INTEGRATION VERIFICATION   ');
  console.log('==================================================');
  console.log(`Current API Key state: ${process.env.GEMINI_API_KEY ? 'Present' : 'Not Found'}`);
  console.log(`Operating Mode: ${process.env.GEMINI_API_KEY === 'mock_mode' ? 'Mock Mode (Local Mocks)' : 'Production Mode (Gemini API)'}`);
  console.log('--------------------------------------------------\n');

  try {
    // 1. Test Job Matching (Task 6.2)
    console.log('[STEP 1] Running Job Matching Analytics...');
    const matchingResult = await matchJobWithProfile(mockUser.profile, targetJobDescription);
    console.log('Matching Score:', matchingResult.score);
    console.log('Reasoning:', matchingResult.reason);
    console.log('Matched Skills:', matchingResult.matchedSkills);
    console.log('Missing Skills:', matchingResult.missingSkills);
    console.log('--------------------------------------------------\n');

    // 2. Test Resume Tailoring (Task 6.3)
    console.log('[STEP 2] Tailoring Resume bullet points for JD...');
    const tailoredProfile = await tailorResumeForJob(mockUser.profile, targetJobDescription);
    console.log('Tailored Bio/Summary:\n', tailoredProfile.bio);
    console.log('\nTailored Experiences:');
    tailoredProfile.experience.forEach(exp => {
      console.log(`- ${exp.company} (${exp.position}):`);
      console.log(exp.description.split('\n').map(line => `    ${line}`).join('\n'));
    });
    console.log('\nTailored Projects:');
    tailoredProfile.projects.forEach(proj => {
      console.log(`- ${proj.title}:`);
      console.log(proj.description.split('\n').map(line => `    ${line}`).join('\n'));
    });
    console.log('--------------------------------------------------\n');

    // 3. Test Tailored PDF Generation (Task 6.4)
    console.log('[STEP 3] Compiling Tailored PDF Resume...');
    const outputPath = path.join(__dirname, 'test-resume-tailored.pdf');
    const doc = generateResumePDF(mockUser, { tailoredProfile });
    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    writeStream.on('finish', () => {
      console.log(`[SUCCESS] Tailored PDF resume compiled successfully!`);
      console.log(`Saved output file to: ${outputPath}`);
      console.log('==================================================');
    });

    writeStream.on('error', (err) => {
      console.error('[ERROR] Failed to write PDF file:', err);
    });

  } catch (error) {
    console.error('[FATAL] Verification test failed:', error);
  }
}

executeTest();
