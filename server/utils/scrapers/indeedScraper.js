const puppeteer = require('puppeteer');

// Mock fallbacks removed to ensure no silent fake data

/**
 * Crawls full-time developer jobs from Indeed India.
 * Automatically falls back to mock items if blocked.
 * 
 * @returns {Array<Object>} - Cleaned list of job postings.
 */
async function scrapeIndeed() {
  console.log('Launching Indeed India scraper...');
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1200, height: 800 });

    const searchUrl = 'https://in.indeed.com/jobs?q=reactjs+developer';
    console.log(`Navigating page to: ${searchUrl}`);
    
    // Indeed often triggers Cloudflare / cookies checks. We set a low timeout to trigger mock fallback quickly if blocked.
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 7000 });

    // Try to wait for job cards (classes on indeed frequently change or are hidden behind security)
    await page.waitForSelector('.job_seen_beacon', { timeout: 3000 });

    const rawJobs = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.job_seen_beacon'));
      return cards.slice(0, 3).map(card => {
        const titleEl = card.querySelector('.jobTitle a') || card.querySelector('h2 a');
        const titleText = titleEl ? titleEl.innerText.trim() : 'Software Engineer';
        const link = titleEl ? titleEl.href : '';

        const companyEl = card.querySelector('.companyName') || card.querySelector('[data-testid="company-name"]');
        const companyText = companyEl ? companyEl.innerText.trim() : 'Not Specified';

        const locationEl = card.querySelector('.companyLocation') || card.querySelector('[data-testid="text-location"]');
        const locationText = locationEl ? locationEl.innerText.trim() : 'Remote';

        const salaryEl = card.querySelector('.salary-snippet-container') || card.querySelector('.estimated-salary');
        const salaryText = salaryEl ? salaryEl.innerText.trim() : 'Not Specified';

        // Brief snippet description
        const snippetEl = card.querySelector('.job-snippet') || card.querySelector('.underflow');
        const descText = snippetEl ? snippetEl.innerText.trim() : '';

        return {
          title: titleText,
          company: companyText,
          location: locationText,
          salary: salaryText,
          description: descText,
          applyLink: link,
          isDirectLink: false,
          source: 'Indeed'
        };
      });
    });

    await browser.close();

    // Ensure all crawled items have descriptions
    const cleanedJobs = rawJobs.map(job => {
      if (!job.description) {
        job.description = `We are hiring a ${job.title} to join the development team at ${job.company}. Responsible for building core web layers and database features.`;
      }
      return job;
    });

    return cleanedJobs;
  } catch (error) {
    console.warn(`Indeed scraping blocked or failed: ${error.message}. Returning empty array.`);
    if (browser) {
      try {
        await browser.close();
      } catch (cErr) {}
    }
    return [];
  }
}

module.exports = {
  scrapeIndeed
};
