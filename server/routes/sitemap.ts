import { Request, Response } from 'express';
import { db } from '../db';
import { communities } from '../../shared/schema';
import { sql } from 'drizzle-orm';

// Cache sitemap for performance
let sitemapCache: { xml: string; generated: Date } | null = null;
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

export async function generateSitemap(req: Request, res: Response) {
  try {
    // Check cache
    if (sitemapCache && (Date.now() - sitemapCache.generated.getTime()) < CACHE_DURATION) {
      res.header('Content-Type', 'application/xml');
      res.header('Content-Encoding', 'gzip');
      return res.send(sitemapCache.xml);
    }
    
    const baseUrl = 'https://www.myseniorvalet.com';
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Static pages with priority
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/community-directory', priority: '0.9', changefreq: 'daily' },
      { url: '/map-search', priority: '0.9', changefreq: 'weekly' },
      { url: '/search', priority: '0.9', changefreq: 'weekly' },
      { url: '/senior-marketplace', priority: '0.8', changefreq: 'weekly' },
      { url: '/vendors-marketplace', priority: '0.8', changefreq: 'weekly' },
      { url: '/assisted-living', priority: '0.8', changefreq: 'weekly' },
      { url: '/senior-living-worldwide', priority: '0.7', changefreq: 'weekly' },
      { url: '/senior-living-san-francisco', priority: '0.7', changefreq: 'weekly' },
      { url: '/senior-living-san-diego', priority: '0.7', changefreq: 'weekly' },
      { url: '/competitive-analysis', priority: '0.6', changefreq: 'monthly' },
      { url: '/about', priority: '0.5', changefreq: 'monthly' },
      { url: '/contact', priority: '0.5', changefreq: 'monthly' },
      { url: '/privacy', priority: '0.4', changefreq: 'yearly' },
      { url: '/terms', priority: '0.4', changefreq: 'yearly' },
    ];
    
    // Location-specific directory pages
    const locationPages = [
      { url: '/community-directory?location=oakmont', priority: '0.8', changefreq: 'weekly' },
      { url: '/community-directory?location=puerto-rico', priority: '0.7', changefreq: 'weekly' },
      { url: '/community-directory?location=peru', priority: '0.7', changefreq: 'weekly' },
      { url: '/community-directory?location=hawaii', priority: '0.8', changefreq: 'weekly' },
      { url: '/community-directory?location=fort-worth', priority: '0.8', changefreq: 'weekly' },
      { url: '/community-directory?location=new-york', priority: '0.8', changefreq: 'weekly' },
      { url: '/community-directory?location=cuba', priority: '0.6', changefreq: 'weekly' },
      { url: '/community-directory?location=costa-rica', priority: '0.7', changefreq: 'weekly' },
      { url: '/community-directory?location=panama', priority: '0.7', changefreq: 'weekly' },
      { url: '/community-directory?location=japan', priority: '0.6', changefreq: 'weekly' },
      { url: '/community-directory?location=singapore', priority: '0.6', changefreq: 'weekly' },
      { url: '/community-directory?location=scotland', priority: '0.6', changefreq: 'weekly' },
      { url: '/community-directory?location=canada', priority: '0.8', changefreq: 'weekly' },
      { url: '/community-directory?location=australia', priority: '0.7', changefreq: 'weekly' },
    ];
    
    // Get total count of communities for pagination
    const countResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(communities)
      .limit(1);
    
    const totalCommunities = countResult[0]?.count || 0;
    const BATCH_SIZE = 1000; // Fetch communities in batches
    
    // Start XML sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;
    
    // Add static pages
    for (const page of staticPages) {
      xml += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }
    
    // Add location pages
    for (const page of locationPages) {
      xml += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }
    
    // Add community detail pages in batches
    for (let offset = 0; offset < totalCommunities; offset += BATCH_SIZE) {
      const communityBatch = await db.select({
        id: communities.id,
        name: communities.name,
        city: communities.city,
        state: communities.state,
        updatedAt: communities.updatedAt,
        photos: communities.photos
      })
      .from(communities)
      .limit(BATCH_SIZE)
      .offset(offset);
      
      for (const community of communityBatch) {
        const communityUrl = `${baseUrl}/community/${community.id}`;
        const lastMod = community.updatedAt 
          ? new Date(community.updatedAt).toISOString().split('T')[0]
          : currentDate;
        
        xml += `
  <url>
    <loc>${communityUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`;
        
        // Add image information if available
        if (community.photos && community.photos.length > 0) {
          const imageUrl = community.photos[0];
          if (imageUrl && !imageUrl.includes('placeholder')) {
            xml += `
    <image:image>
      <image:loc>${imageUrl.startsWith('http') ? imageUrl : baseUrl + imageUrl}</image:loc>
      <image:title>${community.name} - ${community.city}, ${community.state}</image:title>
      <image:caption>${community.name} senior living community in ${community.city}, ${community.state}</image:caption>
    </image:image>`;
          }
        }
        
        xml += `
  </url>`;
      }
    }
    
    // Add state-specific search pages
    const states = await db.selectDistinct({ state: communities.state })
      .from(communities)
      .where(sql`${communities.state} IS NOT NULL`);
    
    for (const { state } of states) {
      if (state) {
        xml += `
  <url>
    <loc>${baseUrl}/search?location=${encodeURIComponent(state)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    }
    
    // Close sitemap
    xml += `
</urlset>`;
    
    // Update cache
    sitemapCache = { xml, generated: new Date() };
    
    // Send response
    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(xml);
    
    console.log(`✅ Generated sitemap with ${totalCommunities} communities and ${staticPages.length + locationPages.length} static pages`);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}

// Robots.txt endpoint
export function robotsTxt(req: Request, res: Response) {
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /admin-mega-dashboard
Disallow: /login
Disallow: /register
Disallow: /onboarding
Disallow: /family-groups

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Sitemap location
Sitemap: https://www.myseniorvalet.com/sitemap.xml

# Special rules for major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 0

User-agent: Slurp
Allow: /
Crawl-delay: 1

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: DotBot
Disallow: /
`;

  res.header('Content-Type', 'text/plain');
  res.header('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  res.send(robots);
}