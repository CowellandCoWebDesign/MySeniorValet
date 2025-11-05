import { Request, Response } from 'express';
import { db } from '../db';
import { communities } from '@shared/schema';
import { generateCommunitySlug } from '../utils/generate-slug';
import { sql } from 'drizzle-orm';

export function registerSEOCommunityUrls(app: any) {
  // Get SEO URL for a specific community
  app.get('/api/communities/:id/seo-url', async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.id);
      
      const [community] = await db
        .select({
          id: communities.id,
          name: communities.name,
          city: communities.city,
          state: communities.state
        })
        .from(communities)
        .where(sql`${communities.id} = ${communityId}`)
        .limit(1);
      
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }
      
      const slug = generateCommunitySlug(community);
      const statePath = community.state.toLowerCase();
      const cityPath = community.city.toLowerCase().replace(/\s+/g, '-');
      
      res.json({
        id: community.id,
        name: community.name,
        seoUrl: `/senior-living/${statePath}/${cityPath}/${slug}`,
        legacyUrl: `/community/${community.id}`
      });
    } catch (error) {
      console.error('Error generating SEO URL:', error);
      res.status(500).json({ error: 'Failed to generate SEO URL' });
    }
  });

  // Bulk generate SEO URLs for sitemap
  app.get('/api/communities/seo-urls', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const allCommunities = await db
        .select({
          id: communities.id,
          name: communities.name,
          city: communities.city,
          state: communities.state,
          country: communities.country
        })
        .from(communities)
        .limit(limit)
        .offset(offset);
      
      const urls = allCommunities.map(community => {
        const slug = generateCommunitySlug(community);
        const statePath = community.state.toLowerCase();
        const cityPath = community.city.toLowerCase().replace(/\s+/g, '-');
        
        return {
          id: community.id,
          name: community.name,
          location: `${community.city}, ${community.state}`,
          country: community.country || 'US',
          seoUrl: `/senior-living/${statePath}/${cityPath}/${slug}`,
          absoluteUrl: `https://www.myseniorvalet.com/senior-living/${statePath}/${cityPath}/${slug}`
        };
      });
      
      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(communities);
      
      res.json({
        urls,
        pagination: {
          limit,
          offset,
          total: Number(total[0]?.count || 0),
          hasMore: offset + limit < Number(total[0]?.count || 0)
        }
      });
    } catch (error) {
      console.error('Error generating SEO URLs:', error);
      res.status(500).json({ error: 'Failed to generate SEO URLs' });
    }
  });
}