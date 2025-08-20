import { Router } from 'express';
import { db } from '../db';
import { communities, vendors, vendorServices, hospitals } from '@shared/schema';
import { sql, or, ilike, and } from 'drizzle-orm';

const router = Router();

// Optimized autocomplete endpoint for predictive search
router.get('/autocomplete/suggestions', async (req, res) => {
  try {
    const query = req.query.query as string;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string; // Optional filter
    
    // Allow single character searches for better UX
    if (!query || query.length < 1) {
      return res.json({ 
        suggestions: [],
        _version: 'v5_optimized',
        _timestamp: Date.now()
      });
    }

    const searchTerm = query.toLowerCase().trim();
    
    // Track timing for performance monitoring
    const startTime = Date.now();
    
    // Run all queries in PARALLEL for speed (target: <200ms)
    const queries = [];
    
    // Query 1: Search communities by name (most important)
    if (!category || category === 'all' || category === 'communities') {
      queries.push(
        db
          .select({
            id: communities.id,
            name: communities.name,
            city: communities.city,
            state: communities.state,
            address: communities.address,
            communitySubtype: communities.communitySubtype,
            rating: communities.rating,
            hudPropertyId: communities.hudPropertyId,
            rentPerMonth: communities.rentPerMonth
          })
          .from(communities)
          .where(
            searchTerm.length <= 3 
              ? ilike(communities.name, `${searchTerm}%`)  // Short queries: starts with only
              : or(
                  ilike(communities.name, `${searchTerm}%`),  // Starts with (priority)
                  ilike(communities.name, `%${searchTerm}%`)   // Contains (fallback)
                )
          )
          .limit(5)
          .then(results => ({
            type: 'communities',
            data: results
          }))
      );
    }
    
    // Query 2: Search cities (simplified for speed)
    queries.push(
      db
        .selectDistinct({
          city: communities.city,
          state: communities.state,
          count: sql<number>`COUNT(*)::int`.as('count')
        })
        .from(communities)
        .where(
          searchTerm.length <= 3
            ? ilike(communities.city, `${searchTerm}%`)  // Short queries: starts with only
            : or(
                ilike(communities.city, `${searchTerm}%`),  // Starts with
                ilike(communities.city, `%${searchTerm}%`)  // Contains
              )
        )
        .groupBy(communities.city, communities.state)
        .limit(3)  // Reduced limit for speed
        .then(results => ({
          type: 'cities',
          data: results
        }))
    );
    
    // Execute all queries in parallel
    const results = await Promise.all(queries);
    
    // Process results into suggestions
    const suggestions: any[] = [];
    
    results.forEach(result => {
      if (result.type === 'communities') {
        result.data.forEach((c: any) => {
          suggestions.push({
            label: c.name,
            value: c.name,
            type: 'community',
            id: c.id,
            description: `${c.city}, ${c.state}${c.communitySubtype ? ` - ${c.communitySubtype.replace(/_/g, ' ')}` : ''}`,
            priority: c.name.toLowerCase().startsWith(searchTerm) ? 1 : 2,
            city: c.city,
            state: c.state,
            address: c.address,
            rating: c.rating,
            hudPropertyId: c.hudPropertyId,
            rentPerMonth: c.rentPerMonth
          });
        });
      } else if (result.type === 'cities') {
        result.data.forEach((c: any) => {
          suggestions.push({
            label: `${c.city}, ${c.state}`,
            value: c.city,
            type: 'location',
            id: null,
            description: `City - ${c.count} communities`,
            priority: c.city.toLowerCase().startsWith(searchTerm) ? 3 : 4,
            city: c.city,
            state: c.state
          });
        });
      }
    });
    
    // Sort suggestions by priority
    suggestions.sort((a, b) => (a.priority || 999) - (b.priority || 999));
    
    // Limit to requested number
    const limitedSuggestions = suggestions.slice(0, limit);
    
    // Track response time
    const responseTime = Date.now() - startTime;
    console.log(`⚡ Autocomplete: ${limitedSuggestions.length} results in ${responseTime}ms for "${searchTerm}"`);
    
    // Return optimized results
    return res.json({
      suggestions: limitedSuggestions,
      _version: 'v5_optimized',
      _timestamp: Date.now(),
      _responseTimeMs: responseTime
    });
    
  } catch (error) {
    console.error('Autocomplete error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch suggestions',
      suggestions: [] 
    });
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

    // Call the enhanced endpoint
    const response = await fetch(`http://localhost:5000/api/autocomplete/suggestions?query=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await response.json();
    
    res.json({ 
      suggestions: data.suggestions || [],
      _version: 'v5_legacy_wrapper'
    });
  } catch (error) {
    console.error('Legacy autocomplete error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

export default router;