import { Router } from 'express';
import { db } from '../db';
import { communities, vendors, services } from '@shared/schema';
import { sql, or, ilike } from 'drizzle-orm';

const router = Router();

// Autocomplete endpoint for predictive search
router.get('/autocomplete/suggestions', async (req, res) => {
  try {
    const query = req.query.query as string; // Changed from 'q' to 'query'
    const limit = parseInt(req.query.limit as string) || 6;
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = query.toLowerCase();
    const suggestions: any[] = [];

    // Search communities by name
    const communityResults = await db
      .select({
        id: communities.id,
        name: communities.name,
        city: communities.city,
        state: communities.state,
        type: sql`'community'`.as('type')
      })
      .from(communities)
      .where(
        or(
          ilike(communities.name, `%${searchTerm}%`),
          ilike(communities.city, `%${searchTerm}%`)
        )
      )
      .limit(5);

    // Get unique cities
    const cityResults = await db
      .selectDistinct({
        city: communities.city,
        state: communities.state,
        count: sql<number>`COUNT(*)`.as('count')
      })
      .from(communities)
      .where(ilike(communities.city, `%${searchTerm}%`))
      .groupBy(communities.city, communities.state)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(5);

    // Get unique states
    const stateResults = await db
      .selectDistinct({
        state: communities.state,
        count: sql<number>`COUNT(*)`.as('count')
      })
      .from(communities)
      .where(
        or(
          ilike(communities.state, `%${searchTerm}%`),
          sql`LOWER(${communities.state}) = LOWER(${searchTerm})`
        )
      )
      .groupBy(communities.state)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(3);

    // Get unique counties
    const countyResults = await db
      .selectDistinct({
        county: communities.county,
        state: communities.state,
        count: sql<number>`COUNT(*)`.as('count')
      })
      .from(communities)
      .where(
        sql`${communities.county} IS NOT NULL AND LOWER(${communities.county}) LIKE LOWER(${'%' + searchTerm + '%'})`
      )
      .groupBy(communities.county, communities.state)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(3);

    // Format suggestions as simple strings for autocomplete
    const suggestionStrings: string[] = [];
    
    // Add city suggestions
    cityResults.forEach(c => {
      suggestionStrings.push(`${c.city}, ${c.state}`);
    });

    // Add state suggestions  
    stateResults.forEach(s => {
      suggestionStrings.push(s.state);
    });

    // Add county suggestions
    countyResults.forEach(c => {
      if (c.county) {
        suggestionStrings.push(`${c.county} County, ${c.state}`);
      }
    });

    // Remove duplicates and sort by relevance
    const uniqueSuggestions = [...new Set(suggestionStrings)];
    
    // Sort by exact matches first
    uniqueSuggestions.sort((a, b) => {
      const aExact = a.toLowerCase() === searchTerm;
      const bExact = b.toLowerCase() === searchTerm;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    res.json({ suggestions: uniqueSuggestions.slice(0, limit) });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

export default router;