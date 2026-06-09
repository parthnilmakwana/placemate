/**
 * JSearch API Client for PlaceMate.
 * Fetches real, structured jobs from the JSearch API via RapidAPI.
 */

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com';

const mockJobsList = [
  {
    job_title: 'ReactJS Web Developer',
    employer_name: 'AlphaTech Solutions',
    job_is_remote: true,
    job_description: 'We are seeking a ReactJS Developer responsible for building frontend interfaces and collaborating on the development of client-facing dashboards. You will work on optimizing responsiveness and writing clean reusable components.',
    job_min_salary: 15000,
    job_max_salary: 20000,
    job_salary_currency: 'INR',
    job_salary_period: 'MONTH',
    job_apply_link: 'https://jsearch-mock-apply-link.com/reactjs-web-developer-mock-1',
    apply_options: [
      {
        publisher: 'AlphaTech Careers',
        apply_link: 'https://careers.alphatech.com/jobs/react-dev-1',
        is_direct: true
      }
    ],
    job_posted_at_datetime_utc: new Date().toISOString()
  },
  {
    job_title: 'Backend Node.js Developer',
    employer_name: 'CloudScale Labs',
    job_is_remote: false,
    job_city: 'Bangalore',
    job_country: 'IN',
    job_description: 'Looking for a Backend Developer in charge of building REST APIs using Node.js and Express. You will be responsible for database schemas design in MongoDB and testing core routes.',
    job_min_salary: 20000,
    job_max_salary: null,
    job_salary_currency: 'INR',
    job_salary_period: 'MONTH',
    job_apply_link: 'https://jsearch-mock-apply-link.com/node-js-developer-mock-2',
    job_posted_at_datetime_utc: new Date().toISOString()
  },
  {
    job_title: 'Fullstack MERN Intern',
    employer_name: 'Launchpad Labs',
    job_is_remote: true,
    job_description: 'Collaborate with the dev team to build features from scratch. You will work on React frontend elements, Node.js API logic, and test core flows.',
    job_min_salary: 12000,
    job_max_salary: 18000,
    job_salary_currency: 'INR',
    job_salary_period: 'MONTH',
    job_apply_link: 'https://jsearch-mock-apply-link.com/fullstack-mern-intern-mock-3',
    apply_options: [
      {
        publisher: 'Indeed',
        apply_link: 'https://in.indeed.com/rc/clk?jk=internship-mock-3',
        is_direct: false
      }
    ],
    job_posted_at_datetime_utc: new Date().toISOString()
  }
];

/**
 * Format salary into a friendly display string from JSearch raw data.
 */
function formatSalary(job) {
  if (job.job_min_salary && job.job_max_salary) {
    const currency = job.job_salary_currency || 'INR';
    const period = job.job_salary_period ? `/${job.job_salary_period.toLowerCase()}` : '';
    return `${currency} ${job.job_min_salary.toLocaleString()} - ${job.job_max_salary.toLocaleString()}${period}`;
  } else if (job.job_min_salary) {
    const currency = job.job_salary_currency || 'INR';
    const period = job.job_salary_period ? `/${job.job_salary_period.toLowerCase()}` : '';
    return `${currency} ${job.job_min_salary.toLocaleString()}${period}`;
  }
  return 'Not Specified';
}

/**
 * Resolves the optimal application URL from job options, prioritizing direct career portals.
 * Excludes main aggregator portals that trigger redirects and CAPTCHAs where possible.
 *
 * @param {Object} job - Raw job listing from JSearch
 * @returns {Object} - An object containing { applyLink, isDirectLink }
 */
function getBestApplyLink(job) {
  if (!job.apply_options || job.apply_options.length === 0) {
    return { applyLink: job.job_apply_link, isDirectLink: false };
  }

  // 1. Check if any option is explicitly direct
  let bestOption = job.apply_options.find(opt => opt.is_direct === true);
  if (bestOption) {
    return { applyLink: bestOption.apply_link, isDirectLink: true };
  }

  // 2. Check for option that matches employer/company name or common direct ATS platforms
  const companyLower = (job.employer_name || '').toLowerCase();
  bestOption = job.apply_options.find(opt => {
    const pubLower = (opt.publisher || '').toLowerCase();
    return pubLower && (
      pubLower.includes(companyLower) || 
      pubLower.includes('careers') || 
      pubLower.includes('workday') || 
      pubLower.includes('greenhouse') || 
      pubLower.includes('lever')
    );
  });
  if (bestOption) {
    return { applyLink: bestOption.apply_link, isDirectLink: true };
  }

  // 3. Filter out known aggregators to find a direct site alternative
  const aggregators = [
    'linkedin', 'indeed', 'ziprecruiter', 'glassdoor', 'monster', 
    'naukri', 'internshala', 'careerbuilder', 'simplyhired', 'lensa', 
    'jooble', 'grabjobs', 'adzuna', 'upwork', 'fiverr', 'freelancer', 
    'toptal'
  ];
  bestOption = job.apply_options.find(opt => {
    const pubLower = (opt.publisher || '').toLowerCase();
    return pubLower && !aggregators.some(agg => pubLower.includes(agg));
  });
  if (bestOption) {
    return { applyLink: bestOption.apply_link, isDirectLink: true };
  }

  // 4. Default fallback: use the primary apply link from the API (usually redirect link)
  return { applyLink: job.job_apply_link, isDirectLink: false };
}

/**
 * Fetches jobs from JSearch RapidAPI.
 * 
 * @param {Object} options 
 * @param {string} options.query - Search query string (default: 'Web Developer in India')
 * @param {string} options.datePosted - Date posted filter (default: 'week')
 * @returns {Promise<Array<Object>>} - Array of normalized-ready raw job objects.
 */
async function fetchJobs(options = {}) {
  const query = options.query || 'Web Developer in India';
  const datePosted = options.datePosted || 'week';

  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
    console.warn('[JSEARCH API] RAPIDAPI_KEY is not set or is using placeholder. Skipping API fetch.');
    return [];
  }

  if (RAPIDAPI_KEY === 'mock_mode') {
    console.log('[JSEARCH API] Operating in Mock Mode. Returning high-quality mock job listings.');
    return mockJobsList.map(job => {
      let location = 'Remote';
      if (!job.job_is_remote) {
        const parts = [job.job_city, job.job_state, job.job_country].filter(Boolean);
        location = parts.length > 0 ? parts.join(', ') : 'India';
      }

      const { applyLink, isDirectLink } = getBestApplyLink(job);

      return {
        title: job.job_title,
        company: job.employer_name,
        location: location,
        description: job.job_description,
        salary: formatSalary(job),
        applyLink: applyLink,
        isDirectLink: isDirectLink,
        source: 'JSearch (Mock)',
        postedDate: new Date(job.job_posted_at_datetime_utc)
      };
    });
  }

  console.log(`[JSEARCH API] Fetching jobs for query: "${query}" (posted: ${datePosted})...`);

  const url = new URL('https://jsearch.p.rapidapi.com/search');
  url.searchParams.append('query', query);
  url.searchParams.append('page', '1');
  url.searchParams.append('num_pages', '1');
  url.searchParams.append('date_posted', datePosted);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn(`[JSEARCH API] Request timed out for query: "${query}" after 20000ms. Aborting.`);
    controller.abort();
  }, 20000);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`JSearch API responded with status ${response.status}: ${errorText}`);
    }

    const payload = await response.json();

    if (payload.status !== 'OK') {
      throw new Error(`JSearch API status is not OK: ${payload.status}`);
    }

    const data = (payload.data || []).slice(0, 10);
    console.log(`[JSEARCH API] Successfully retrieved ${data.length} job listings.`);

    // Map JSearch response fields to the standard raw fields expected by normalize.js
    return data.map(job => {
      // Formulate location
      let location = 'Remote';
      if (!job.job_is_remote) {
        const parts = [job.job_city, job.job_state, job.job_country].filter(Boolean);
        location = parts.length > 0 ? parts.join(', ') : 'India';
      }

      const { applyLink, isDirectLink } = getBestApplyLink(job);

      return {
        title: job.job_title,
        company: job.employer_name,
        location: location,
        description: job.job_description,
        salary: formatSalary(job),
        applyLink: applyLink,
        isDirectLink: isDirectLink,
        source: 'JSearch',
        postedDate: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : new Date()
      };
    });
  } catch (error) {
    console.error('[JSEARCH API ERROR] Failed to fetch jobs:', error);
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
    return [];
  }
}

module.exports = {
  fetchJobs
};
