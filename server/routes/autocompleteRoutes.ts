import { Router } from 'express';
import { db } from '../db';
import { communities, vendors, services } from '@shared/schema';
import { sql, or, ilike } from 'drizzle-orm';

const router = Router();

// Autocomplete endpoint for predictive search
router.get('/autocomplete', async (req, res) => {
  try {
    const query = req.query.q as string;
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

    // Format suggestions
    communityResults.forEach(c => {
      suggestions.push({
        label: `${c.name} - ${c.city}, ${c.state}`,
        value: c.name,
        type: 'community',
        id: c.id
      });
    });

    cityResults.forEach(c => {
      suggestions.push({
        label: `${c.city}, ${c.state} (${c.count} communities)`,
        value: `${c.city}, ${c.state}`,
        type: 'city',
        count: c.count
      });
    });

    stateResults.forEach(s => {
      suggestions.push({
        label: `${s.state} (${s.count} communities)`,
        value: s.state,
        type: 'state',
        count: s.count
      });
    });

    countyResults.forEach(c => {
      if (c.county) {
        suggestions.push({
          label: `${c.county} County, ${c.state} (${c.count} communities)`,
          value: `${c.county} County, ${c.state}`,
          type: 'county',
          count: c.count
        });
      }
    });

    // Common care types
    const careTypes = [
      'Independent Living',
      'Assisted Living', 
      'Memory Care',
      'Skilled Nursing',
      'Home Care',
      'Adult Day Care',
      'Continuing Care'
    ];
    
    const matchingCareTypes = careTypes.filter(ct => 
      ct.toLowerCase().includes(searchTerm)
    );
    
    matchingCareTypes.forEach(ct => {
      suggestions.push({
        label: ct,
        value: ct,
        type: 'care_type'
      });
    });

    // Sort by relevance (exact matches first)
    suggestions.sort((a, b) => {
      const aExact = a.value.toLowerCase() === searchTerm;
      const bExact = b.value.toLowerCase() === searchTerm;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    res.json({ suggestions: suggestions.slice(0, 10) });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

export default router;