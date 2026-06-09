const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/seo/sitemap.xml
// Generates a dynamic sitemap for Googlebots
router.get('/sitemap.xml', async (req, res) => {
  try {
    // Get all users who have completed onboarding and have a public profile
    const users = await User.find({ 
      hasCompletedOnboarding: true,
      'profile.isPublic': true 
    }).select('username profile.updatedAt');

    const baseUrl = process.env.CLIENT_URL || 'https://www.placemate.me';
    
    // Start XML string
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/register</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

    // Add portfolio links dynamically
    users.forEach(user => {
      if (user.username) {
        xml += `
  <url>
    <loc>${baseUrl}/portfolio/${user.username}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
      }
    });

    xml += '\n</urlset>';

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);

  } catch (error) {
    console.error('Sitemap Generation Error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
