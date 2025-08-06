import { Router } from 'express';
import { db } from '../db';
import { communities, vendors, vendorServices, hospitals } from '@shared/schema';
import { sql, or, ilike, and } from 'drizzle-orm';

const router = Router();

// Enhanced autocomplete endpoint for predictive search with categories
router.get('/autocomplete/suggestions', async (req, res) => {
  try {
    const query = req.query.query as string;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string; // Optional filter: 'all', 'communities', 'healthcare', 'vendors', 'resources'
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = query.toLowerCase();
    const suggestions: any[] = [];

    // Search individual communities by name (if category is all or communities)
    if (!category || category === 'all' || category === 'communities') {
      const communityResults = await db
        .select({
          id: communities.id,
          name: communities.name,
          city: communities.city,
          state: communities.state,
          communitySubtype: communities.communitySubtype,
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

      communityResults.forEach(c => {
        suggestions.push({
          label: c.name,
          value: c.name,
          type: 'community',
          id: c.id,
          description: `${c.city}, ${c.state}${c.communitySubtype ? ` - ${c.communitySubtype.replace(/_/g, ' ')}` : ''}`
        });
      });
    }

    // Search hospitals/healthcare (if category is all or healthcare)
    if (!category || category === 'all' || category === 'healthcare') {
      const hospitalResults = await db
        .select({
          id: hospitals.id,
          name: hospitals.name,
          city: hospitals.city,
          state: hospitals.state,
          hospitalType: hospitals.hospitalType
        })
        .from(hospitals)
        .where(
          or(
            ilike(hospitals.name, `%${searchTerm}%`),
            ilike(hospitals.city, `%${searchTerm}%`)
          )
        )
        .limit(3);

      hospitalResults.forEach(h => {
        suggestions.push({
          label: h.name,
          value: h.name,
          type: 'healthcare',
          id: h.id,
          description: `${h.city}, ${h.state} - ${h.hospitalType || 'Hospital'}`
        });
      });
    }

    // Search vendors/services (if category is all or vendors)
    if (!category || category === 'all' || category === 'vendors') {
      const vendorResults = await db
        .select({
          id: vendors.id,
          businessName: vendors.businessName,
          businessType: vendors.businessType
        })
        .from(vendors)
        .where(ilike(vendors.businessName, `%${searchTerm}%`))
        .limit(3);

      vendorResults.forEach(v => {
        suggestions.push({
          label: v.businessName,
          value: v.businessName,
          type: 'vendor',
          id: v.id,
          description: v.businessType || 'Service Provider'
        });
      });
    }

    // Search care types/services (if category is all or resources)
    if (!category || category === 'all' || category === 'resources') {
      const serviceResults = await db
        .select({
          id: vendorServices.id,
          serviceName: vendorServices.serviceName,
          categoryId: vendorServices.categoryId
        })
        .from(vendorServices)
        .where(
          ilike(vendorServices.serviceName, `%${searchTerm}%`)
        )
        .limit(3);

      serviceResults.forEach(s => {
        suggestions.push({
          label: s.serviceName,
          value: s.serviceName,
          type: 'care_type',
          id: s.id,
          description: 'Care Service'
        });
      });
    }

    // Add location suggestions (cities, states, counties)
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
      .limit(3);

    cityResults.forEach(c => {
      suggestions.push({
        label: `${c.city}, ${c.state}`,
        value: `${c.city}, ${c.state}`,
        type: 'city',
        count: c.count
      });
    });

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
      .limit(2);

    stateResults.forEach(s => {
      suggestions.push({
        label: s.state,
        value: s.state,
        type: 'state',
        count: s.count
      });
    });

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
      .limit(2);

    countyResults.forEach(c => {
      if (c.county) {
        suggestions.push({
          label: `${c.county} County, ${c.state}`,
          value: `${c.county} County, ${c.state}`,
          type: 'county',
          count: c.count
        });
      }
    });

    // Sort by relevance and type priority
    suggestions.sort((a, b) => {
      // Exact matches first
      const aExact = a.label.toLowerCase() === searchTerm;
      const bExact = b.label.toLowerCase() === searchTerm;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then by type priority: community > city > healthcare > vendor > care_type > state > county
      const typePriority: Record<string, number> = { 
        community: 1, 
        city: 2, 
        healthcare: 3, 
        vendor: 4, 
        care_type: 5, 
        state: 6, 
        county: 7 
      };
      return (typePriority[a.type] || 8) - (typePriority[b.type] || 8);
    });

    res.json({ 
      suggestions: suggestions.slice(0, limit),
      _version: 'v4_enhanced_autocomplete_1754491863456',
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Legacy endpoint for compatibility - returns simple string array
router.get('/autocomplete', async (req, res) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 6;
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Call the enhanced endpoint and convert to legacy format
    const response = await fetch(`http://localhost:5000/api/autocomplete/suggestions?query=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await response.json();
    
    res.json({ 
      suggestions: data.suggestions || [],
      _version: 'v4_legacy_wrapper_1754491863456'
    });
  } catch (error) {
    console.error('Legacy autocomplete error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

export default router;