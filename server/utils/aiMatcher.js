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
 * JSON Schema for Parsing Raw Resume Text into Profile
 */
const profileParserSchema = {
  type: 'OBJECT',
  properties: {
    fullName: { type: 'STRING' },
    email: { type: 'STRING' },
    phone: { type: 'STRING' },
    location: { type: 'STRING' },
    bio: { type: 'STRING', description: 'Professional summary' },
    skills: { type: 'ARRAY', items: { type: 'STRING' } },
    experience: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          company: { type: 'STRING' },
          position: { type: 'STRING' },
          location: { type: 'STRING' },
          startDate: { type: 'STRING', description: 'e.g. Jan 2020' },
          endDate: { type: 'STRING', description: 'e.g. Present or Dec 2022' },
          description: { type: 'STRING', description: 'Bullet points separated by newlines' }
        },
        required: ['company', 'position']
      }
    },
    education: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          institution: { type: 'STRING' },
          degree: { type: 'STRING' },
          fieldOfStudy: { type: 'STRING' },
          startYear: { type: 'INTEGER' },
          endYear: { type: 'INTEGER' },
          description: { type: 'STRING' }
        },
        required: ['institution', 'degree']
      }
    },
    projects: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          description: { type: 'STRING', description: 'Bullet points separated by newlines' },
          technologies: { type: 'ARRAY', items: { type: 'STRING' } }
        },
        required: ['title', 'description']
      }
    }
  },
  required: ['fullName']
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

/**
 * Task 6.5: Parse raw text from a document into a structured Profile schema.
 * 
 * @param {string} rawText - The extracted raw text from PDF/DOCX
 * @param {string} [modelOverride] - Override model (e.g. 'gemini-3.5-flash')
 * @returns {Promise<Object>} - The structured JSON representing the Profile
 */
async function parseResumeTextToProfile(rawText, modelOverride = 'gemini-3.5-flash') {
  if (!rawText) {
    throw new Error('Raw text is required for parsing.');
  }

  const systemInstruction = `
You are an expert ATS (Applicant Tracking System) parser.
Your task is to take raw, unstructured text extracted from a resume document and map it perfectly into a structured JSON schema.
RULES:
1. Extract the candidate's full name, email, and phone number accurately.
2. Group experience, education, and projects into the correct arrays.
3. For descriptions (experience/projects), separate bullet points strictly with newline characters (\\n). Do not use bullet symbols like - or *.
4. Do not invent information. If a field like 'location' or 'endDate' is missing in the text, leave it empty or omit it.
5. Extract all identifiable technical skills into the skills array.
  `.trim();

  const prompt = `
=== RAW RESUME TEXT ===
${rawText}

Parse this resume text into the requested JSON schema format.
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
          responseSchema: profileParserSchema,
          temperature: 0.1 // Very low temperature for accurate data extraction
        }
      });

      try {
        return JSON.parse(response.text);
      } catch (parseError) {
        attempt++;
        console.warn(`[aiMatcher] JSON parse failed for resume parsing (attempt ${attempt}/3). AI response was: ${response.text}`);
        if (attempt >= 3) throw new Error('Failed to parse resume text as JSON after 3 attempts');
      }
    } catch (error) {
      console.error('Error in parseResumeTextToProfile AI helper:', error);
      throw error;
    }
  }
}

/**
 * Task 6.6: Enhance a single text snippet (used for Tiptap Floating Toolbar).
 * 
 * @param {string} text - The text to enhance
 * @param {string} mode - 'professional' | 'action_verbs' | 'grammar'
 * @param {string} [modelOverride] - Override model (e.g. 'gemini-3.5-flash')
 * @returns {Promise<string>} - The enhanced text
 */
async function enhanceTextSnippet(text, mode, modelOverride = 'gemini-3.5-flash') {
  if (!text) throw new Error('Text is required');

  let instruction = '';
  if (mode === 'professional') {
    instruction = 'Make this text sound more professional and impactful. Fix any grammatical errors.';
  } else if (mode === 'action_verbs') {
    instruction = 'Rewrite this text to start with strong, active action verbs (e.g., Spearheaded, Architected, Engineered). Keep it punchy.';
  } else if (mode === 'grammar') {
    instruction = 'Fix any grammatical, spelling, or punctuation errors in this text. Do not change the underlying meaning.';
  } else if (mode === 'concise') {
    instruction = 'Make this text concise and eliminate fluff, wordiness, and redundant adjectives while keeping all key technical facts intact.';
  } else if (mode === 'impact') {
    instruction = 'Reframe this bullet point to emphasize results, problem-solving, and technical impact. Do NOT invent fake percentages or metrics.';
  } else if (mode === 'ats_optimize') {
    instruction = 'Optimize this bullet point for ATS parsers by using standard industry keywords, clear technical terminology, and active phrasing.';
  } else {
    instruction = 'Enhance this text for a professional developer resume.';
  }

  const systemInstruction = `
You are an expert resume writer and career coach.
Your task is to rewrite the user's text according to their request.
RULES:
1. Return ONLY the rewritten text. No conversational filler, no explanations, no quotes around the result.
2. Do not use Markdown formatting (like ** or *) unless the original text had it.
3. Keep the original intent and factual information intact.
4. CRITICAL FABRICATION RULE: NEVER fabricate numbers, percentages, metrics, company names, technologies, or achievements that were not in the original text. If a metric is missing, do not invent one.
  `.trim();

  const prompt = `
Instruction: ${instruction}

Original text:
${text}
  `.trim();

  try {
    const response = await generateContent({
      model: modelOverride,
      contents: [{ text: prompt }],
      config: {
        systemInstruction,
        temperature: 0.2
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error('Error in enhanceTextSnippet:', error);
    throw error;
  }
}

module.exports = {
  matchJobWithProfile,
  tailorResumeForJob,
  enhanceResumeGeneral,
  parseResumeTextToProfile,
  enhanceTextSnippet
};
