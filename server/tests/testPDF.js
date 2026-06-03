const fs = require('fs');
const path = require('path');
const { generateResumePDF } = require('../utils/pdfgen');

// Mock user document matching user schema
const mockUser = {
  name: 'Jane Tester',
  email: 'jane.tester@example.com',
  profile: {
    title: 'Fullstack Software Engineer',
    bio: 'I was in charge of building web platforms and was responsible for handling database scaling solutions.',
    githubUrl: 'https://github.com/janetester',
    linkedinUrl: 'https://linkedin.com/in/janetester',
    skills: ['JavaScript', 'Node.js', 'Express', 'React', 'MongoDB', 'Tailwind CSS', 'Docker'],
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

function runTest() {
  console.log('Starting PDF Generation verification test...');

  const outputPathRegular = path.join(__dirname, 'test-resume.pdf');
  const outputPathOptimized = path.join(__dirname, 'test-resume-optimized.pdf');

  // 1. Regular PDF Generation
  console.log('Generating regular resume...');
  const docRegular = generateResumePDF(mockUser, { optimize: false });
  const writeStreamRegular = fs.createWriteStream(outputPathRegular);
  docRegular.pipe(writeStreamRegular);

  writeStreamRegular.on('finish', () => {
    console.log(`Regular resume saved to: ${outputPathRegular}`);
  });

  // 2. Optimized PDF Generation
  console.log('Generating optimized resume (AI phrasing enhancements)...');
  const docOptimized = generateResumePDF(mockUser, { optimize: true });
  const writeStreamOptimized = fs.createWriteStream(outputPathOptimized);
  docOptimized.pipe(writeStreamOptimized);

  writeStreamOptimized.on('finish', () => {
    console.log(`Optimized resume saved to: ${outputPathOptimized}`);
    console.log('Verification test completed successfully.');
  });
}

runTest();
