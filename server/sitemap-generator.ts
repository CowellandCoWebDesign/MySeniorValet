import { Request, Response } from "express";
import { db } from './db';
import { communities } from '../shared/schema';
import { sql } from 'drizzle-orm';

export async function generateSitemap(req: Request, res: Response) {
  try {
    const domain = process.env.PRODUCTION_URL || `https://${req.hostname}`;
    
    // Start XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
    xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';
    
    // Add static pages with high priority
    const staticPages = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
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
    
    // Add location landing pages (states)
    const states = await db
      .selectDistinct({ state: communities.state })
      .from(communities)
      .where(sql`${communities.state} IS NOT NULL`);
    
    for (const { state } of states) {
      if (state) {
        const stateSlug = state.toLowerCase().replace(/ /g, '-');
        xml += '  <url>\n';
        xml += `    <loc>${domain}/senior-living/${stateSlug}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += '  </url>\n';
      }
    }
    
    // Add top 1000 city landing pages
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
    
    console.log(`✅ Generated sitemap with ${totalCommunities} communities and location pages`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}