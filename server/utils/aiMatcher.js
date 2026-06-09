const { generateContent } = require('./aiClient');

/**
 * JSON Schema for Job Matching response
 */
const matchingResponseSchema = {
  type: 'OBJECT',
  properties: {
    score: { 
      type: 'INTEGER',
      description: 'A matching score between 0 and 100 indicating how well the candidate profile matches the job requirements.'
    },
    reason: { 
      type: 'STRING',
      description: 'A detailed 2-3 sentence explanation summarizing why this score was given, focusing on key alignments or missing requirements.' 
    },
    matchedSkills: { 
      type: 'ARRAY', 
      items: { type: 'STRING' },
      description: 'Skills explicitly requested in the JD that are present in the candidate profile.'
    },
    missingSkills: { 
      type: 'ARRAY', 
      items: { type: 'STRING' },
      description: 'Key skills or keywords requested in the JD that are not mentioned or implied in the candidate profile.'
    }
  },
  required: ['score', 'reason', 'matchedSkills', 'missingSkills']
};

/**
 * JSON Schema for Resume Tailoring response
 */
const tailoringResponseSchema = {
  type: 'OBJECT',
  properties: {
    bio: { 
      type: 'STRING',
      description: 'A tailored professional summary statement highlighting alignment with the job position.'
    },
    experience: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          company: { type: 'STRING', description: 'Must match the original company name exactly. Do NOT change.' },
          position: { type: 'STRING', description: 'Must match the original job title/position exactly. Do NOT change.' },
          description: { 
            type: 'STRING', 
            description: 'Optimized experience description using active action verbs and incorporating keywords from the JD. Bullet points must be separated by newlines.'
          }
        },
        required: ['company', 'position', 'description']
      },
      description: 'Tailored bullet points for each past work experience. Order must match original.'
    },
    projects: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING', description: 'Must match the original project title exactly. Do NOT change.' },
          description: { 
            type: 'STRING', 
            description: 'Optimized project description focusing on technical outcomes and technologies matching the JD requirements. Bullet points separated by newlines.'
          }
        },
        required: ['title', 'description']
      },
      description: 'Tailored bullet points for projects. Order must match original.'
    }
  },
  required: ['bio', 'experience', 'projects']
};

/**
 * JSON Schema for General Resume Enhancement response
 */
const generalEnhancementSchema = {
  type: 'OBJECT',
  properties: {
    bio: { 
      type: 'STRING',
      description: 'An enhanced, highly professional summary statement. Fix grammar and improve phrasing.'
    },
    experience: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          company: { type: 'STRING', description: 'Must match the original company name exactly. Do NOT change.' },
          position: { type: 'STRING', description: 'Must match the original job title/position exactly. Do NOT change.' },
          description: { 
            type: 'STRING', 
            description: 'Professionally enhanced experience description using active action verbs. Bullet points must be separated by newlines.'
          }
        },
        required: ['company', 'position', 'description']
      },
      description: 'Enhanced bullet points for each past work experience. Order must match original.'
    },
    projects: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING', description: 'Must match the original project title exactly. Do NOT change.' },
          description: { 
            type: 'STRING', 
            description: 'Professionally enhanced project description focusing on technical outcomes. Bullet points separated by newlines.'
          }
        },
        required: ['title', 'description']
      },
      description: 'Enhanced bullet points for projects. Order must match original.'
    }
  },
  required: ['bio', 'experience', 'projects']
};

/**
 * Helper to format user profile data into a clean, readable text block for LLM parsing.
 */
function serializeProfile(profile) {
  return `
TITLE: ${profile.title || 'Software Engineer'}
BIO/SUMMARY: ${profile.bio || ''}
SKILLS: ${profile.skills ? profile.skills.join(', ') : ''}

WORK EXPERIENCE:
${profile.experience ? profile.experience.map(exp => `
- Company: ${exp.company}
  Position: ${exp.position}
  Description: ${exp.description}
`).join('\n') : 'None'}

PROJECTS:
${profile.projects ? profile.projects.map(proj => `
- Title: ${proj.title}
  Tech Stack: ${proj.technologies ? proj.technologies.join(', ') : ''}
  Description: ${proj.description}
`).join('\n') : 'None'}
  `.trim();
}

/**
 * Task 6.2: Match a User Profile against a Job Description.
 * 
 * @param {Object} profile - User profile data (e.g. from req.user.profile)
 * @param {string} jobDescription - Full text of target job listing
 * @returns {Promise<Object>} - Structured match analytics
 */
async function matchJobWithProfile(profile, jobDescription) {
  if (!profile || !jobDescription) {
    throw new Error('Profile and Job Description are required for matching.');
  }

  const systemInstruction = `
You are an expert ATS (Applicant Tracking System) parser and technical recruiter.
Your task is to analyze the candidate's Profile against the provided Job Description (JD).
Evaluate the match quality based on skills, experience levels, and projects.
Be objective and realistic. Return your feedback as a structured JSON object.
  `.trim();

  const prompt = `
=== CANDIDATE PROFILE ===
${serializeProfile(profile)}

=== TARGET JOB DESCRIPTION ===
${jobDescription}

Please compute the matching score (0-100), draft a short justification, and list matched and missing skills.
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
          responseSchema: matchingResponseSchema,
          temperature: 0.1 // Low temperature for deterministic scoring
        }
      });

      try {
        return JSON.parse(response.text);
      } catch (parseError) {
        attempt++;
        console.warn(`[aiMatcher] JSON parse failed (attempt ${attempt}/3). AI response was: ${response.text}`);
        if (attempt >= 3) throw new Error('Failed to parse AI response as JSON after 3 attempts');
      }
    } catch (error) {
      console.error('Error in matchJobWithProfile AI helper:', error);
      throw error;
    }
  }
}

/**
 * Task 6.3: Tailor Resume experience and bio sections to fit a target job description.
 * 
 * @param {Object} profile - User profile data
 * @param {string} jobDescription - Full text of target job listing
 * @param {string} [modelOverride] - Override model (e.g. 'gemini-3.1-pro')
 * @returns {Promise<Object>} - Rewritten professional summary, experiences, and projects
 */
async function tailorResumeForJob(profile, jobDescription, modelOverride = 'gemini-3.5-flash') {
  if (!profile || !jobDescription) {
    throw new Error('Profile and Job Description are required for tailoring.');
  }

  const systemInstruction = `
You are a professional resume writer and ATS optimization specialist.
Your task is to tailor the candidate's Resume Summary (bio), Experience bullet points, and Project bullet points to align with the provided Job Description.
RULES:
1. Improve phrasing using strong action verbs (e.g. "Developed", "Optimized", "Architected").
2. Align descriptions to naturally integrate keywords from the job description.
3. NEVER change or exaggerate company names, job titles, project names, dates, or credentials. Keep those EXACTLY as they are.
4. Keep the descriptions structured with bullet points. Separate bullet points strictly with newline characters (\\n). Do NOT use markdown symbols (like - or *) for bullets in the output string; just separate each point with a newline.
5. If some experiences/projects are completely unrelated, you may refine their presentation slightly, but do not make up fake responsibilities.
  `.trim();

  const prompt = `
=== CANDIDATE PROFILE ===
${serializeProfile(profile)}

=== TARGET JOB DESCRIPTION ===
${jobDescription}

Rewrite the profile details to make it highly tailored for this JD. Format the response according to the JSON schema.
  `.trim();

  let attempt = 0;
  while (attempt < 3) {
    try {
      const response = await generateContent({
        model: modelOverride,
        contents: [
          { text: prompt }
        ],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: tailoringResponseSchema,
          temperature: 0.3 // Medium-low temperature to balance creativity and safety
        }
      });

      try {
        return JSON.parse(response.text);
      } catch (parseError) {
        attempt++;
        console.warn(`[aiMatcher] JSON parse failed for tailoring (attempt ${attempt}/3). AI response was: ${response.text}`);
        if (attempt >= 3) throw new Error('Failed to parse tailored profile as JSON after 3 attempts');
      }
    } catch (error) {
      console.error('Error in tailorResumeForJob AI helper:', error);
      throw error;
    }
  }
}

/**
 * Task 6.4: Generally enhance a Resume's experience and bio sections without a specific job description.
 * 
 * @param {Object} profile - User profile data
 * @param {string} [modelOverride] - Override model (e.g. 'gemini-3.5-flash')
 * @returns {Promise<Object>} - Rewritten professional summary, experiences, and projects
 */
async function enhanceResumeGeneral(profile, modelOverride = 'gemini-3.5-flash') {
  if (!profile) {
    throw new Error('Profile is required for enhancement.');
  }

  const systemInstruction = `
You are a professional resume writer and career coach.
Your task is to generally enhance the candidate's Resume Summary (bio), Experience bullet points, and Project bullet points.
RULES:
1. Fix any grammatical errors or awkward phrasing.
2. Elevate the vocabulary to sound highly professional and impactful.
3. Start bullet points with strong action verbs (e.g. "Spearheaded", "Optimized", "Architected").
4. NEVER change or exaggerate company names, job titles, project names, dates, or credentials. Keep those EXACTLY as they are.
5. Keep the descriptions structured with bullet points. Separate bullet points strictly with newline characters (\\n). Do NOT use markdown symbols (like - or *) for bullets in the output string; just separate each point with a newline.
  `.trim();

  const prompt = `
=== CURRENT CANDIDATE PROFILE ===
${serializeProfile(profile)}

Please rewrite the profile details to make them highly professional and impactful. Format the response according to the JSON schema.
  `.trim();

  let attempt = 0;
  while (attempt < 3) {
    try {
      const response = await generateContent({
        model: modelOverride,
        contents: [
          { text: prompt }
        ],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: generalEnhancementSchema,
          temperature: 0.3 // Medium-low temperature to balance creativity and safety
        }
      });

      try {
        return JSON.parse(response.text);
      } catch (parseError) {
        attempt++;
        console.warn(`[aiMatcher] JSON parse failed for general enhancement (attempt ${attempt}/3). AI response was: ${response.text}`);
        if (attempt >= 3) throw new Error('Failed to parse enhanced profile as JSON after 3 attempts');
      }
    } catch (error) {
      console.error('Error in enhanceResumeGeneral AI helper:', error);
      throw error;
    }
  }
}

module.exports = {
  matchJobWithProfile,
  tailorResumeForJob,
  enhanceResumeGeneral
};
