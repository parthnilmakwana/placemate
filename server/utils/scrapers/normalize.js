const TECH_KEYWORDS = require('./tech_keywords');

/**
 * Category inference rules — maps keywords in job titles to our fixed categories.
 */
const CATEGORY_RULES = [
  {
    category: 'Full Stack',
    keywords: ['full stack', 'fullstack', 'full-stack', 'mern', 'mean']
  },
  {
    category: 'Frontend',
    keywords: ['frontend', 'front-end', 'front end', 'react', 'angular', 'vue', 'ui developer', 'ui engineer']
  },
  {
    category: 'Backend',
    keywords: ['backend', 'back-end', 'back end', 'node.js', 'django', 'spring', 'api developer', 'server-side']
  },
  {
    category: 'Android',
    keywords: ['android', 'kotlin', 'mobile developer', 'mobile engineer', 'flutter', 'react native', 'ios']
  },
  {
    category: 'Data Science',
    keywords: ['data science', 'data scientist', 'machine learning', 'ml engineer', 'data analyst', 'deep learning', 'ai engineer', 'data engineer']
  },
  {
    category: 'DevOps',
    keywords: ['devops', 'sre', 'site reliability', 'cloud engineer', 'infrastructure', 'kubernetes', 'docker']
  }
];

function inferCategory(title) {
  const lowerTitle = (title || '').toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => lowerTitle.includes(kw))) {
      return rule.category;
    }
  }
  return 'Other';
}

/**
 * Extracts experience level from job title or description.
 */
function extractExperienceLevel(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  if (text.match(/\b(senior|lead|architect|principal|manager|5\+ years|6\+ years|7\+ years|8\+ years|10\+ years)\b/)) return 'senior';
  if (text.match(/\b(mid-level|mid level|2\+ years|3\+ years|4\+ years|2-5 years|3-5 years)\b/)) return 'mid';
  if (text.match(/\b(junior|jr|1\+ years|1-3 years|1-2 years)\b/)) return 'junior';
  if (text.match(/\b(fresher|entry level|entry-level|intern|internship|0-1 year|0-2 years|no experience)\b/)) return 'fresher';
  return 'any';
}

/**
 * Extracts education requirements from job description.
 */
function extractEducationLevel(description) {
  const text = (description || '').toLowerCase();
  if (text.match(/\b(phd|doctorate)\b/)) return 'phd';
  if (text.match(/\b(master|masters|master's|m\.tech|m\.e|m\.sc|mca|postgraduate)\b/)) return 'masters';
  if (text.match(/\b(bachelor|bachelors|bachelor's|b\.tech|b\.e|b\.sc|bca|undergraduate|degree)\b/)) return 'bachelors';
  return 'any';
}

/**
 * Standardizes locations, stipulates stipends, and extracts skills keywords.
 * 
 * @param {Object} rawJob - Scraped job object.
 * @param {string} [categoryOverride] - Optional category to force (from sync strategy).
 * @returns {Object} - Normalized job object.
 */
function normalizeJob(rawJob, categoryOverride) {
  if (!rawJob) return null;

  // 1. Clean Title and Company
  const title = (rawJob.title || 'Software Developer').trim();
  const company = (rawJob.company || 'Not Specified').trim();

  // 2. Standardize Location
  let location = (rawJob.location || 'Remote').trim();
  const lowerLocation = location.toLowerCase();
  if (
    lowerLocation.includes('work from home') || 
    lowerLocation.includes('wfh') || 
    lowerLocation.includes('remote') ||
    lowerLocation === ''
  ) {
    location = 'Remote';
  }

  // 3. Extract requirements/skills keywords from description
  const description = rawJob.description || '';
  const extractedSkills = [];

  TECH_KEYWORDS.forEach(tech => {
    const matches = tech.patterns.some(pattern => pattern.test(description) || pattern.test(title));
    if (matches) {
      extractedSkills.push(tech.name);
    }
  });

  // 4. Stipulate stipend/salary values
  let salary = (rawJob.salary || 'Not Specified').trim();
  if (salary.toLowerCase() === 'not specified' || salary === '') {
    salary = 'Not Specified';
  }

  // 5. Determine category, experience, and education
  const category = categoryOverride || inferCategory(title);
  const experienceLevel = extractExperienceLevel(title, description);
  const educationLevel = extractEducationLevel(description);

  return {
    title,
    company,
    location,
    category,
    skills: extractedSkills,
    description,
    requirements: extractedSkills, // backward compat
    experienceLevel,
    educationLevel,
    salary,
    applyLink: rawJob.applyLink,
    isDirectLink: rawJob.isDirectLink || false,
    source: rawJob.source || 'Scraped',
    postedDate: rawJob.postedDate || new Date(),
    fetchedDate: new Date(),
    isActive: true
  };
}

module.exports = {
  normalizeJob,
  inferCategory,
  extractExperienceLevel,
  extractEducationLevel
};
