const { generateContent } = require('../utils/aiClient');

/**
 * Deterministic Regex logic for ATS scanning (Ported from frontend)
 * Scores basic section completeness and keywords.
 * @param {string} text - The raw text of the resume
 * @returns {Object} - The deterministic score and feedback
 */
function analyzeResumeDeterministically(text) {
  if (!text || typeof text !== 'string') {
    return { score: 0, feedback: [] };
  }

  const lowercaseText = text.toLowerCase();
  
  const criteria = [
    { name: 'Education Section', regex: /\b(education|university|college|degree)\b/i, weight: 20 },
    { name: 'Experience Section', regex: /\b(experience|employment|work history|career)\b/i, weight: 30 },
    { name: 'Skills Section', regex: /\b(skills|technologies|proficiencies|tools)\b/i, weight: 20 },
    { name: 'Projects Section', regex: /\b(projects|portfolio|personal work)\b/i, weight: 15 },
    { name: 'Contact Info', regex: /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|phone|email|linkedin|github)\b/i, weight: 15 },
  ];

  let currentScore = 0;
  const feedback = [];

  criteria.forEach(item => {
    const passed = item.regex.test(lowercaseText);
    if (passed) {
      currentScore += item.weight;
      feedback.push({ name: item.name, passed: true, message: 'Found' });
    } else {
      feedback.push({ name: item.name, passed: false, message: 'Missing' });
    }
  });

  return { score: currentScore, feedback };
}

/**
 * Serializes the candidate profile (similar to aiMatcher.js)
 */
function serializeProfile(profile) {
  return `
TITLE: ${profile.title || 'Candidate'}
BIO/SUMMARY: ${profile.bio || ''}
SKILLS: ${profile.skills ? profile.skills.join(', ') : ''}

WORK EXPERIENCE:
${profile.experience && profile.experience.length > 0 ? profile.experience.map(exp => `
- Company: ${exp.company}
  Position: ${exp.position}
  Description: ${exp.description}
`).join('\n') : 'None'}

PROJECTS:
${profile.projects && profile.projects.length > 0 ? profile.projects.map(proj => `
- Title: ${proj.title}
  Tech Stack: ${proj.technologies ? proj.technologies.join(', ') : ''}
  Description: ${proj.description}
`).join('\n') : 'None'}

EDUCATION:
${profile.education && profile.education.length > 0 ? profile.education.map(edu => `
- Institution: ${edu.institution}
  Degree: ${edu.degree}
  Field of Study: ${edu.fieldOfStudy}
`).join('\n') : 'None'}
  `.trim();
}

/**
 * JSON Schema for ATS Checker AI output
 */
const atsAnalysisSchema = {
  type: 'OBJECT',
  properties: {
    overallScore: { type: 'INTEGER', description: 'Overall AI-assigned ATS matching score (0-100).' },
    keywordMatch: {
      type: 'OBJECT',
      properties: {
        percentage: { type: 'INTEGER', description: 'Percentage of critical keywords matched (0-100).' },
        matched: { type: 'ARRAY', items: { type: 'STRING' } },
        missing: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: ['percentage', 'matched', 'missing']
    },
    skills: {
      type: 'OBJECT',
      properties: {
        matched: { type: 'ARRAY', items: { type: 'STRING' } },
        missing: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: ['matched', 'missing']
    },
    sections: {
      type: 'OBJECT',
      properties: {
        contact: { type: 'STRING', description: 'Feedback on contact info (e.g. Present, Missing, Needs Improvement)' },
        summary: { type: 'STRING', description: 'Feedback on summary' },
        skills: { type: 'STRING', description: 'Feedback on skills section structure' },
        experience: { type: 'STRING', description: 'Feedback on experience section' },
        projects: { type: 'STRING', description: 'Feedback on projects' },
        education: { type: 'STRING', description: 'Feedback on education' }
      },
      required: ['contact', 'summary', 'skills', 'experience', 'projects', 'education']
    },
    jobMatch: {
      type: 'OBJECT',
      properties: {
        score: { type: 'INTEGER', description: 'Alignment with the specific job description (0-100).' },
        strengths: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Key alignments with JD' },
        gaps: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Key gaps vs JD requirements' }
      },
      required: ['score', 'strengths', 'gaps']
    },
    suggestions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          priority: { type: 'STRING', enum: ['high', 'medium', 'low'] },
          category: { type: 'STRING', description: 'e.g., Keywords, Formatting, Content' },
          message: { type: 'STRING', description: 'Actionable suggestion for improvement.' }
        },
        required: ['priority', 'category', 'message']
      }
    }
  },
  required: ['overallScore', 'keywordMatch', 'skills', 'sections', 'jobMatch', 'suggestions']
};

/**
 * Analyzes a resume against a job description using Gemini.
 * @param {Object} profile - User profile data.
 * @param {string} jobDescription - Target Job Description.
 * @returns {Promise<Object>} - Structured AI analysis.
 */
async function analyzeResumeWithAI(profile, jobDescription) {
  if (!profile || !jobDescription) {
    throw new Error('Profile and Job Description are required for AI analysis.');
  }

  const systemInstruction = `
You are an expert ATS (Applicant Tracking System) parser and technical recruiter.
Your task is to analyze the candidate's Profile against the provided Job Description (JD).
Evaluate the match quality realistically based on semantic understanding, not just exact keyword matches (e.g., "RESTful API" matches "REST API development").
Never fabricate qualifications or encourage the user to lie.
Return your comprehensive feedback exactly adhering to the provided JSON schema.
  `.trim();

  const prompt = `
=== CANDIDATE PROFILE ===
${serializeProfile(profile)}

=== TARGET JOB DESCRIPTION ===
${jobDescription}

Please perform a comprehensive ATS analysis of this resume against the JD.
Provide scores, keyword analysis, skills gap analysis, section-by-section structural feedback, and actionable improvement suggestions.
  `.trim();

  let attempt = 0;
  while (attempt < 3) {
    try {
      const response = await generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          { text: prompt }
        ],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: atsAnalysisSchema,
          temperature: 0.1 // Low temperature for consistent, deterministic scoring
        }
      });

      try {
        return JSON.parse(response.text);
      } catch (parseError) {
        attempt++;
        console.warn(`[atsService] JSON parse failed (attempt ${attempt}/3). AI response was: ${response.text}`);
        if (attempt >= 3) throw new Error('Failed to parse ATS AI response as JSON after 3 attempts');
      }
    } catch (error) {
      console.error('Error in analyzeResumeWithAI AI helper:', error);
      throw error;
    }
  }
}

module.exports = {
  analyzeResumeDeterministically,
  analyzeResumeWithAI
};
