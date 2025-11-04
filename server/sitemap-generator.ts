import { Request, Response } from "express";
import { db } from './db';
import { communities } from '../shared/schema';
import { sql } from 'drizzle-orm';
import * as fs from 'fs/promises';
import * as path from 'path';

const SITEMAP_LIMIT = 50000;
const BASE_URL = process.env.SITE_URL || 'https://www.myseniorvalet.com';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_DIR = path.join(process.cwd(), '.cache', 'sitemaps');

// Cache interface
interface CacheEntry {
  content: string;
  timestamp: number;
  etag: string;
}

// Initialize cache directory
async function initCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create cache directory:', error);
  }
}

// Get cached sitemap if fresh
async function getCachedSitemap(cacheKey: string): Promise<string | null> {
  try {
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    const cacheData = await fs.readFile(cachePath, 'utf-8');
    const cache: CacheEntry = JSON.parse(cacheData);
    
    if (Date.now() - cache.timestamp < CACHE_DURATION) {
      return cache.content;
    }
  } catch (error) {
    // Cache miss or error, return null
  }
  return null;
}

// Save sitemap to cache
async function saveSitemapCache(cacheKey: string, content: string) {
  await initCacheDir();
  try {
    const cache: CacheEntry = {
      content,
      timestamp: Date.now(),
      etag: `"${Buffer.from(content).toString('base64').substring(0, 16)}"`
    };
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    await fs.writeFile(cachePath, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save sitemap cache:', error);
  }
}

// Clear all sitemap caches (call when database updates)
export async function clearSitemapCache() {
  try {
    const files = await fs.readdir(CACHE_DIR);
    await Promise.all(
      files.filter(f => f.endsWith('.json')).map(f => 
        fs.unlink(path.join(CACHE_DIR, f))
      )
    );
    console.log('✅ Sitemap cache cleared');
  } catch (error) {
    console.error('Failed to clear sitemap cache:', error);
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Main sitemap index generator
export async function generateSitemapIndex(req: Request, res: Response) {
  try {
    const cacheKey = 'sitemap-index';
    
    // Check cache first
    const cached = await getCachedSitemap(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Cache', 'HIT');
      res.send(cached);
      return;
    }
    
    // Generate fresh sitemap
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(communities);
    
    const totalCommunities = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(totalCommunities / SITEMAP_LIMIT);
    const today = new Date().toISOString().split('T')[0];
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages sitemap
    xml += '  <sitemap>\n';
    xml += '    <loc>' + BASE_URL + '/sitemap-static.xml</loc>\n';
    xml += '    <lastmod>' + today + '</lastmod>\n';
    xml += '  </sitemap>\n';
    
    // Add location sitemaps
    xml += '  <sitemap>\n';
    xml += '    <loc>' + BASE_URL + '/sitemap-locations.xml</loc>\n';
    xml += '    <lastmod>' + today + '</lastmod>\n';
    xml += '  </sitemap>\n';
    
    // Add community sitemaps
    for (let i = 1; i <= totalPages; i++) {
      xml += '  <sitemap>\n';
      xml += '    <loc>' + BASE_URL + '/sitemap-communities-' + i + '.xml</loc>\n';
      xml += '    <lastmod>' + today + '</lastmod>\n';
      xml += '  </sitemap>\n';
    }
    
    xml += '</sitemapindex>';
    
    // Save to cache
    await saveSitemapCache(cacheKey, xml);
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Cache', 'MISS');
    res.send(xml);
    
    console.log('✅ Generated sitemap index with ' + totalPages + ' community sitemaps');
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    res.status(500).send('Error generating sitemap index');
  }
}

// Static pages sitemap
export async function generateStaticSitemap(req: Request, res: Response) {
  try {
    const cacheKey = 'sitemap-static';
    
    // Check cache first
    const cached = await getCachedSitemap(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=604800');
      res.setHeader('X-Cache', 'HIT');
      res.send(cached);
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Core pages with updated priorities
    const staticPages = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/map-search', priority: 0.9, changefreq: 'daily' },
      { url: '/community-directory', priority: 0.95, changefreq: 'daily' },
      { url: '/about', priority: 0.8, changefreq: 'weekly' },
      { url: '/contact', priority: 0.7, changefreq: 'monthly' },
      { url: '/pricing', priority: 0.8, changefreq: 'weekly' },
      { url: '/tourmate', priority: 0.7, changefreq: 'weekly' },
      { url: '/vendors', priority: 0.7, changefreq: 'weekly' },
      { url: '/emergency-contact', priority: 0.6, changefreq: 'monthly' },
      { url: '/senior-news', priority: 0.8, changefreq: 'daily' },
      { url: '/privacy', priority: 0.5, changefreq: 'monthly' },
      { url: '/terms', priority: 0.5, changefreq: 'monthly' },
      { url: '/accessibility', priority: 0.5, changefreq: 'monthly' },
      { url: '/ai-intelligence', priority: 0.8, changefreq: 'weekly' },
      { url: '/senior-services', priority: 0.7, changefreq: 'weekly' },
      { url: '/veteran-housing', priority: 0.7, changefreq: 'weekly' },
      { url: '/affordable-housing', priority: 0.8, changefreq: 'weekly' },
      { url: '/marketplace', priority: 0.7, changefreq: 'daily' },
      { url: '/healthcare-directory', priority: 0.8, changefreq: 'weekly' },
      { url: '/care-spectrum', priority: 0.8, changefreq: 'weekly' },
    ];
    
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += '    <loc>' + BASE_URL + page.url + '</loc>\n';
      xml += '    <lastmod>' + today + '</lastmod>\n';
      xml += '    <changefreq>' + page.changefreq + '</changefreq>\n';
      xml += '    <priority>' + page.priority + '</priority>\n';
      xml += '  </url>\n';
    }
    
    xml += '</urlset>';
    
    // Save to cache
    await saveSitemapCache(cacheKey, xml);
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=604800');
    res.setHeader('X-Cache', 'MISS');
    res.send(xml);
    
  } catch (error) {
    console.error('Error generating static sitemap:', error);
    res.status(500).send('Error generating static sitemap');
  }
}

// Location-based sitemaps (countries, states, cities)
export async function generateLocationsSitemap(req: Request, res: Response) {
  try {
    const cacheKey = 'sitemap-locations';
    
    // Check cache first
    const cached = await getCachedSitemap(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Cache', 'HIT');
      res.send(cached);
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Track international locations for higher priority
    const internationalPriorities: Record<string, number> = {
      'ON': 0.88, 'QC': 0.88, 'BC': 0.87, 'AB': 0.86, // Canadian provinces
      'NS': 0.85, 'SK': 0.85, 'NB': 0.85, 'MB': 0.85,
      'NL': 0.84, 'NT': 0.83, 'PE': 0.83, 'NU': 0.82, 'YT': 0.82,
      'NSW': 0.87, 'QLD': 0.87, 'VIC': 0.86, 'SA': 0.85, // Australian states
      'TAS': 0.84, 'ACT': 0.84, 'WA': 0.83,
    };
    
    // REMOVED directoryPages array to eliminate duplicate /directory/ URLs
    // All location pages now use canonical /senior-living/{state}/{city} URLs only
    
    // Add all states/provinces from database as SEO location pages
    const states = await db
      .select({ 
        state: communities.state,
        count: sql<number>`COUNT(*)`
      })
      .from(communities)
      .where(sql`${communities.state} IS NOT NULL`)
      .groupBy(communities.state)
      .orderBy(sql`COUNT(*) DESC`);
    
    // Add state-level SEO pages (canonical URLs only)
    for (const { state, count } of states) {
      if (state && count >= 5) { // Lowered from 10 to 5 to include more states/provinces globally
        const priority = internationalPriorities[state] || 0.8;
        
        // Add ONLY the canonical SEO location page URL (removed duplicate /directory/ URLs)
        xml += '  <url>\n';
        xml += '    <loc>' + BASE_URL + '/senior-living/' + state.toLowerCase() + '</loc>\n';
        xml += '    <lastmod>' + today + '</lastmod>\n';
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>' + priority + '</priority>\n';
        xml += '  </url>\n';
      }
    }
    
    // Add top cities as SEO location pages (expanded to 5000+ for competitive coverage)
    const cities = await db
      .select({ 
        city: communities.city,
        state: communities.state,
        country: communities.country,
        count: sql<number>`COUNT(*)`,
      })
      .from(communities)
      .where(sql`${communities.city} IS NOT NULL AND ${communities.state} IS NOT NULL`)
      .groupBy(communities.city, communities.state, communities.country)
      .having(sql`COUNT(*) >= 2`) // Lowered threshold to 2+ communities for better coverage
      .orderBy(sql`COUNT(*) DESC`)
      .limit(5000); // Increased from 500 to 5000 for competitive parity with major players
    
    for (const { city, state, country, count } of cities) {
      if (city && state) {
        // Calculate priority based on community count
        let priority = 0.7;
        if (count >= 100) priority = 0.85;
        else if (count >= 50) priority = 0.8;
        else if (count >= 20) priority = 0.75;
        else if (count >= 10) priority = 0.72;
        
        const citySlug = city.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        const stateSlug = state.toLowerCase();
        
        // Add ONLY the canonical SEO location page URL (removed duplicate /directory/ URLs)
        xml += '  <url>\n';
        xml += '    <loc>' + BASE_URL + '/senior-living/' + stateSlug + '/' + citySlug + '</loc>\n';
        xml += '    <lastmod>' + today + '</lastmod>\n';
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>' + priority + '</priority>\n';
        xml += '  </url>\n';
      }
    }
    
    xml += '</urlset>';
    
    // Save to cache
    await saveSitemapCache(cacheKey, xml);
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Cache', 'MISS');
    res.send(xml);
    
    const internationalCount = states.filter(s => s.state && 
      (s.state.length > 2 || Object.keys(internationalPriorities).includes(s.state))).length;
    
    console.log('✅ Generated locations sitemap with ' + cities.length + ' cities, ' + 
                states.length + ' states, ' + internationalCount + ' international locations');
    
  } catch (error) {
    console.error('Error generating locations sitemap:', error);
    res.status(500).send('Error generating locations sitemap');
  }
}

// Communities sitemap with pagination
export async function generateCommunitiesSitemap(req: Request, res: Response) {
  try {
    const page = parseInt(req.params.page) || 1;
    const cacheKey = 'sitemap-communities-' + page;
    
    // Check cache first
    const cached = await getCachedSitemap(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Cache', 'HIT');
      res.send(cached);
      return;
    }
    
    const offset = (page - 1) * SITEMAP_LIMIT;
    
    // Fetch communities with pagination
    const communitiesData = await db
      .select({
        id: communities.id,
        name: communities.name,
        updatedAt: communities.updatedAt,
      })
      .from(communities)
      .limit(SITEMAP_LIMIT)
      .offset(offset)
      .orderBy(communities.id);
    
    if (communitiesData.length === 0) {
      return res.status(404).send('No communities found for this page');
    }
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    for (const community of communitiesData) {
      xml += '  <url>\n';
      xml += '    <loc>' + BASE_URL + '/community/' + community.id + '</loc>\n';
      xml += '    <lastmod>' + (community.updatedAt ? 
        new Date(community.updatedAt).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0]) + '</lastmod>\n';
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    }
    
    xml += '</urlset>';
    
    // Save to cache
    await saveSitemapCache(cacheKey, xml);
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Cache', 'MISS');
    res.send(xml);
    
  } catch (error) {
    console.error('Error generating communities sitemap:', error);
    res.status(500).send('Error generating communities sitemap');
  }
}

// Legacy generateSitemap - redirect to index
export async function generateSitemap(req: Request, res: Response) {
  // Redirect to the new sitemap index
  res.redirect(301, '/sitemap-index.xml');
}