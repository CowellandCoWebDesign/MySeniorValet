import { Router } from 'express';
import { MAJOR_LOCATIONS } from '@shared/location-seo';

const router = Router();

// Generate location page URLs for SEO
router.get('/api/location-urls', (req, res) => {
  const baseUrl = 'https://www.myseniorvalet.com';
  
  const locationUrls = MAJOR_LOCATIONS.map(location => ({
    url: `${baseUrl}/ai-search-intelligence?location=${location.slug}&tab=simplified`,
    city: location.city,
    state: location.state,
    slug: location.slug,
    priority: 0.8,
    changeFreq: 'weekly'
  }));
  
  res.json(locationUrls);
});

// Generate sitemap for location pages
router.get('/sitemap-locations.xml', (req, res) => {
  const baseUrl = 'https://www.myseniorvalet.com';
  
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add each location page to sitemap
  MAJOR_LOCATIONS.forEach(location => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/ai-search-intelligence?location=${location.slug}&tab=simplified</loc>\n`;
    sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    sitemap += '    <changefreq>weekly</changefreq>\n';
    sitemap += '    <priority>0.8</priority>\n';
    sitemap += '  </url>\n';
  });
  
  sitemap += '</urlset>';
  
  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});

// Redirect old location URLs to new SEO-friendly ones
router.get('/location/:slug', (req, res) => {
  const { slug } = req.params;
  
  // Check if this is a valid location
  const location = MAJOR_LOCATIONS.find(loc => loc.slug === slug);
  
  if (location) {
    // Redirect to the AI search intelligence page with location parameter
    res.redirect(301, `/ai-search-intelligence?location=${slug}&tab=simplified`);
  } else {
    // If not found, redirect to main search page
    res.redirect(301, '/ai-search-intelligence?tab=simplified');
  }
});

// API endpoint to get location data
router.get('/api/location/:slug', async (req, res) => {
  const { slug } = req.params;
  
  const location = MAJOR_LOCATIONS.find(loc => loc.slug === slug);
  
  if (!location) {
    return res.status(404).json({ error: 'Location not found' });
  }
  
  // In a real implementation, you would query the database here
  // to get actual community counts and pricing data
  const locationData = {
    ...location,
    communityCount: Math.floor(Math.random() * 200) + 50, // Placeholder
    priceRange: {
      min: 2000 + Math.floor(Math.random() * 1000),
      max: 6000 + Math.floor(Math.random() * 2000)
    },
    neighborhoods: [
      'Downtown',
      'North Side',
      'South District',
      'East End',
      'West Village'
    ].slice(0, Math.floor(Math.random() * 3) + 2)
  };
  
  res.json(locationData);
});

export default router;