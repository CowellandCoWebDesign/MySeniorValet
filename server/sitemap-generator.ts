import { Request, Response } from "express";
import { db } from './db';
import { communities } from '../shared/schema';
import { sql } from 'drizzle-orm';

const SITEMAP_LIMIT = 50000;
const BASE_URL = process.env.SITE_URL || 'https://www.myseniorvalet.com';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function generateSitemapIndex(req: Request, res: Response) {
  try {
    // Get total community count
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
    xml += `    <loc>${BASE_URL}/api/sitemap-static.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '  </sitemap>\n';
    
    // Add community sitemaps
    for (let i = 1; i <= totalPages; i++) {
      xml += '  <sitemap>\n';
      xml += `    <loc>${BASE_URL}/api/sitemap-communities-${i}.xml</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += '  </sitemap>\n';
    }
    
    xml += '</sitemapindex>';
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(xml);
    
    console.log(`✅ Generated sitemap index with ${totalPages} community sitemaps`);
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    res.status(500).send('Error generating sitemap index');
  }
}

export async function generateStaticSitemap(req: Request, res: Response) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Core pages
    const staticPages = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/map-search', priority: 0.9, changefreq: 'daily' },
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
    ];
    
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}${page.url}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }
    
    xml += '</urlset>';
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=604800'); // Cache for 7 days
    res.send(xml);
    
  } catch (error) {
    console.error('Error generating static sitemap:', error);
    res.status(500).send('Error generating static sitemap');
  }
}

export async function generateCommunitiesSitemap(req: Request, res: Response) {
  try {
    const page = parseInt(req.params.page) || 1;
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
      // Generate URL-safe slug from name
      const slug = community.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/community/${community.id}/${escapeXml(slug)}</loc>\n`;
      xml += `    <lastmod>${community.updatedAt ? new Date(community.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    }
    
    xml += '</urlset>';
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(xml);
    
  } catch (error) {
    console.error('Error generating communities sitemap:', error);
    res.status(500).send('Error generating communities sitemap');
  }
}

export async function generateSitemap(req: Request, res: Response) {
  // Generate comprehensive WORLDWIDE sitemap for MySeniorValet
  // Includes: USA (50 states), Canada (13 provinces/territories), Australia (7 states/territories),
  // Japan, Singapore, Scotland, Mexico, Peru, Cuba, Costa Rica, Panama, and more!
  try {
    // Always use production domain for sitemap generation
    const domain = process.env.PRODUCTION_URL || 'https://www.myseniorvalet.com';
    
    // Start XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
    xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';
    
    // Add static pages with high priority
    const staticPages = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/community-directory', priority: 0.95, changefreq: 'daily' }, // CRITICAL for SEO!
      { url: '/map-search', priority: 0.9, changefreq: 'daily' },
      { url: '/simplified-search', priority: 0.9, changefreq: 'daily' },
      { url: '/ai-intelligence', priority: 0.8, changefreq: 'weekly' },
      { url: '/about', priority: 0.7, changefreq: 'monthly' },
      { url: '/contact', priority: 0.7, changefreq: 'monthly' },
      { url: '/mission', priority: 0.6, changefreq: 'monthly' },
      { url: '/services', priority: 0.7, changefreq: 'weekly' },
      { url: '/senior-services', priority: 0.7, changefreq: 'weekly' },
      { url: '/veteran-housing', priority: 0.7, changefreq: 'weekly' },
      { url: '/affordable-housing', priority: 0.8, changefreq: 'weekly' },
      { url: '/canada', priority: 0.7, changefreq: 'weekly' },
      { url: '/marketplace', priority: 0.7, changefreq: 'daily' },
      { url: '/hospitals', priority: 0.7, changefreq: 'weekly' },
    ];
    
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${domain}${page.url}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }
    
    // Add WORLDWIDE location landing pages (states, provinces, territories, countries!)
    const states = await db
      .selectDistinct({ state: communities.state })
      .from(communities)
      .where(sql`${communities.state} IS NOT NULL`);
    
    // Track international locations for higher priority
    const internationalPriorities: Record<string, number> = {
      'ON': 0.88, 'QC': 0.88, 'BC': 0.87, 'AB': 0.86, // Canadian provinces - HIGHEST priority
      'NS': 0.85, 'SK': 0.85, 'NB': 0.85, 'MB': 0.85, 'NL': 0.84, 'NT': 0.83, 'PE': 0.83, 'NU': 0.82, 'YT': 0.82,
      'NSW': 0.87, 'QLD': 0.87, 'VIC': 0.86, 'SA': 0.85, 'TAS': 0.84, 'ACT': 0.84, 'WA': 0.83, // Australian states
      'Tokyo': 0.85, 'Singapore': 0.85, 'Scotland': 0.85, // International cities
      'PR': 0.82, // Puerto Rico
    };
    
    // Add all states/provinces/territories
    for (const { state } of states) {
      if (state) {
        const priority = internationalPriorities[state] || 0.8;
        
        // International location - use search URL for better SEO
        if (state.length > 2 || internationalPriorities[state]) {
          xml += '  <url>\n';
          xml += `    <loc>${domain}/search?location=${encodeURIComponent(state)}</loc>\n`;
          xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>${priority}</priority>\n`;
          xml += '  </url>\n';
        } else {
          // US state - use traditional URL
          const stateSlug = state.toLowerCase().replace(/ /g, '-');
          xml += '  <url>\n';
          xml += `    <loc>${domain}/senior-living/${stateSlug}</loc>\n`;
          xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;
          xml += '  </url>\n';
        }
      }
    }
    
    // Add country-level and major region search pages for SEO dominance
    const countrySearchPages = [
      // Canadian provinces
      { location: 'Canada', priority: 0.92 },
      { location: 'Ontario', priority: 0.9 },
      { location: 'Quebec', priority: 0.9 },
      { location: 'British Columbia', priority: 0.89 },
      { location: 'Alberta', priority: 0.88 },
      { location: 'Nova Scotia', priority: 0.87 },
      { location: 'Saskatchewan', priority: 0.87 },
      { location: 'Manitoba', priority: 0.86 },
      { location: 'New Brunswick', priority: 0.86 },
      // Australian states
      { location: 'Australia', priority: 0.92 },
      { location: 'New South Wales', priority: 0.89 },
      { location: 'Queensland', priority: 0.89 },
      { location: 'Victoria Australia', priority: 0.88 },
      { location: 'South Australia', priority: 0.87 },
      { location: 'Tasmania', priority: 0.86 },
      // Asia Pacific
      { location: 'Japan', priority: 0.88 },
      { location: 'Tokyo Japan', priority: 0.87 },
      { location: 'Singapore', priority: 0.88 },
      // Europe
      { location: 'Scotland', priority: 0.87 },
      { location: 'Italy', priority: 0.85 },
      { location: 'France', priority: 0.85 },
      { location: 'Spain', priority: 0.84 },
      { location: 'Germany', priority: 0.84 },
      { location: 'United Kingdom', priority: 0.85 },
      // Latin America
      { location: 'Mexico', priority: 0.86 },
      { location: 'Peru', priority: 0.85 },
      { location: 'Cuba', priority: 0.84 },
      { location: 'Costa Rica', priority: 0.84 },
      { location: 'Panama', priority: 0.84 },
      { location: 'Puerto Rico', priority: 0.85 },
    ];
    
    for (const { location, priority } of countrySearchPages) {
      xml += '  <url>\n';
      xml += `    <loc>${domain}/search?location=${encodeURIComponent(location)}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      xml += '  </url>\n';
    }
    
    // Add top 1000 city landing pages (including international cities!)
    const cities = await db
      .select({ 
        city: communities.city,
        state: communities.state,
        count: sql<number>`COUNT(*)`,
      })
      .from(communities)
      .where(sql`${communities.city} IS NOT NULL AND ${communities.state} IS NOT NULL`)
      .groupBy(communities.city, communities.state)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(1000);
    
    for (const { city, state } of cities) {
      if (city && state) {
        const stateSlug = state.toLowerCase().replace(/ /g, '-');
        const citySlug = city.toLowerCase().replace(/ /g, '-');
        xml += '  <url>\n';
        xml += `    <loc>${domain}/senior-living/${stateSlug}/${citySlug}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += '  </url>\n';
      }
    }
    
    // Add all community detail pages (in batches for performance)
    const batchSize = 5000;
    let offset = 0;
    let hasMore = true;
    let totalCommunities = 0;
    
    while (hasMore) {
      const batch = await db
        .select({ 
          id: communities.id,
          updatedAt: communities.updatedAt,
        })
        .from(communities)
        .orderBy(communities.id)
        .limit(batchSize)
        .offset(offset);
      
      if (batch.length === 0) {
        hasMore = false;
        break;
      }
      
      for (const community of batch) {
        xml += '  <url>\n';
        xml += `    <loc>${domain}/community/${community.id}</loc>\n`;
        xml += `    <lastmod>${community.updatedAt ? new Date(community.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += '  </url>\n';
        totalCommunities++;
      }
      
      offset += batchSize;
      if (batch.length < batchSize) {
        hasMore = false;
      }
    }
    
    // Close XML
    xml += '</urlset>';
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    res.send(xml);
    
    // Count international locations
    const internationalCount = states.filter(s => s.state && (s.state.length > 2 || ['ON','QC','BC','AB','NSW','QLD','VIC','SA','Tokyo','Singapore','Scotland','PR'].includes(s.state))).length;
    
    console.log(`✅ Generated WORLDWIDE sitemap with ${totalCommunities} communities, ${internationalCount} international locations, and ${countrySearchPages.length} country search pages`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}