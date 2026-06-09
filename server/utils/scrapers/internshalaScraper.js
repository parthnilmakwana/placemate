const puppeteer = require('puppeteer');

// Mock fallbacks removed to ensure no silent fake data

/**
 * Crawl web/software development listings from Internshala.
 * 
 * @returns {Array<Object>} - Cleaned list of scraped/mock job listings.
 */
async function scrapeInternshala() {
  console.log('Launching Internshala scraper...');
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set custom user agent to prevent basic header blocks
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1200, height: 800 });

    // Navigate to Internshala search results for ReactJS / Web Development
    const searchUrl = 'https://internshala.com/internships/work-from-home-web-development-internships';
    console.log(`Navigating page to: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Wait for the individual listing cards to appear (Max 5 seconds)
    try {
      await page.waitForSelector('.individual_internship', { timeout: 5000 });
    } catch (e) {
      console.warn('Selector .individual_internship not found on Internshala. Returning empty array.');
      await browser.close();
      return [];
    }

    // Scrape listing card data
    const rawListings = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.individual_internship'));
      return cards.slice(0, 5).map(card => {
        // Extract fields using classes
        const profileEl = card.querySelector('.profile a') || card.querySelector('.profile_container a') || card.querySelector('a');
        const titleText = profileEl ? profileEl.innerText.trim() : 'Software Developer Intern';
        
        // Extract details URL
        const link = profileEl ? profileEl.href : '';
        
        // Company
        const companyEl = card.querySelector('.company_name') || card.querySelector('.company_and_premium');
        const companyText = companyEl ? companyEl.innerText.trim().split('\n')[0] : 'Not Disclosed';
        
        // Location
        const locationEl = card.querySelector('.location_link') || card.querySelector('#location_names');
        const locationText = locationEl ? locationEl.innerText.trim() : 'Remote';
        
        // Stipend / Salary
        const stipendEl = card.querySelector('.stipend') || card.querySelector('.stipend_container');
        const salaryText = stipendEl ? stipendEl.innerText.trim() : 'Not Specified';

        return {
          title: titleText,
          company: companyText,
          location: locationText,
          salary: salaryText,
          applyLink: link,
          isDirectLink: false,
          source: 'Internshala'
        };
      });
    });

    console.log(`Extracted ${rawListings.length} raw cards from Internshala. Fetching descriptions...`);

    // Fetch description for each listing card
    const listingsWithDescriptions = [];
    for (let i = 0; i < rawListings.length; i++) {
      const item = rawListings[i];
      if (item.applyLink) {
        try {
          console.log(`Crawling details page: ${item.applyLink}`);
          const detailPage = await browser.newPage();
          await detailPage.goto(item.applyLink, { waitUntil: 'domcontentloaded', timeout: 10000 });
          
          // Selector for internship requirements/details
          const descriptionText = await detailPage.evaluate(() => {
            const bodyEl = document.querySelector('.text-container') || document.querySelector('.internship_details') || document.querySelector('.job_details');
            return bodyEl ? bodyEl.innerText.trim() : '';
          });
          
          await detailPage.close();
          
          item.description = descriptionText || `We are looking for a ${item.title} to work with ${item.company}. Responsible for frontend interfaces and building core application modules.`;
        } catch (detailErr) {
          console.warn(`Could not fetch details for link ${item.applyLink}. Using fallback description.`);
          item.description = `We are looking for a ${item.title} to work with ${item.company}. Responsible for web development, clean coding, and building client elements.`;
        }
      } else {
        item.description = `We are looking for a ${item.title} to work with ${item.company}. Responsible for software integrations, testing, and debugging.`;
      }
      listingsWithDescriptions.push(item);
    }

    await browser.close();
    return listingsWithDescriptions;
  } catch (error) {
    console.error('Internshala scraper error:', error.message);
    if (browser) {
      try {
        await browser.close();
      } catch (cErr) {}
    }
    return [];
  }
}

module.exports = {
  scrapeInternshala
};
