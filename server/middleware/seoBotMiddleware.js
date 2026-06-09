const User = require('../models/User');

// Common search engine and social media crawler user-agents
const isBot = (userAgent) => {
  const bots = [
    'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'slurp',
    'twitterbot', 'facebookexternalhit', 'linkedinbot', 'embedly',
    'baiduspider', 'pinterest', 'slackbot', 'vkshare', 'facebot', 'whatsapp'
  ];
  const agent = userAgent ? userAgent.toLowerCase() : '';
  return bots.some(bot => agent.includes(bot));
};

/**
 * Dynamic rendering middleware for crawlers.
 * If a search engine bot requests a portfolio page, we intercept the request
 * and send back raw HTML with pre-populated metadata. 
 * Normal users pass through to the React SPA.
 */
const seoBotMiddleware = async (req, res, next) => {
  const userAgent = req.headers['user-agent'];
  
  if (!isBot(userAgent)) {
    return next(); // Let normal users pass through to React
  }

  // Intercept Portfolio Routes for Bots
  if (req.path.startsWith('/portfolio/')) {
    const username = req.path.split('/')[2];
    if (username) {
      try {
        const user = await User.findOne({ username: username.toLowerCase() });
        
        if (user && user.profile.isPublic) {
          const title = `${user.name} | ${user.profile.title || 'Developer'}`;
          const description = user.profile.bio || `View the professional portfolio of ${user.name}.`;
          const url = `${process.env.CLIENT_URL || 'https://www.placemate.me'}/portfolio/${username}`;
          
          // Generate raw HTML for the bot to parse instantly
          const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <title>${title}</title>
              <meta name="description" content="${description}">
              
              <!-- OpenGraph / Social Media -->
              <meta property="og:title" content="${title}">
              <meta property="og:description" content="${description}">
              <meta property="og:url" content="${url}">
              <meta property="og:type" content="profile">
              <meta name="twitter:card" content="summary_large_image">
              
              <!-- JSON-LD Profile Schema -->
              <script type="application/ld+json">
                ${JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "ProfilePage",
                  "mainEntity": {
                    "@type": "Person",
                    "name": user.name,
                    "jobTitle": user.profile.title,
                    "description": user.profile.bio,
                    "url": url,
                    "sameAs": [user.profile.githubUrl, user.profile.linkedinUrl].filter(Boolean)
                  }
                })}
              </script>
            </head>
            <body>
              <header>
                <h1>${user.name}</h1>
                <h2>${user.profile.title}</h2>
              </header>
              <main>
                <p>${description}</p>
                <h3>Skills</h3>
                <ul>${user.profile.skills.map(s => `<li>${s}</li>`).join('')}</ul>
              </main>
            </body>
            </html>
          `;
          return res.status(200).send(html);
        }
      } catch (err) {
        console.error('Bot rendering error:', err);
      }
    }
  }

  next(); // Pass to default static handler if not a specific SEO route
};

module.exports = seoBotMiddleware;
