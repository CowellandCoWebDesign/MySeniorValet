import { Request, Response } from 'express';
import { db } from '../db';
import { communities } from '../../shared/schema';
import { sql } from 'drizzle-orm';

// Get top locations for SEO prioritization
export async function getTopSEOLocations(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const includeInternational = req.query.international === 'true';
    
    // Get top cities by community count
    let topCitiesQuery = db
      .select({
        city: communities.city,
        state: communities.state,
        country: communities.country,
        count: sql<number>`COUNT(*)`,
        avgPriceMin: sql<number>`AVG((${communities.priceRange}->>'min')::numeric)`,
        avgPriceMax: sql<number>`AVG((${communities.priceRange}->>'max')::numeric)`,
        withPricing: sql<number>`COUNT(CASE WHEN ${communities.priceRange} IS NOT NULL THEN 1 END)`
      })
      .from(communities)
      .where(
        sql`${communities.city} IS NOT NULL AND ${communities.state} IS NOT NULL`
      )
      .groupBy(communities.city, communities.state, communities.country)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(limit);
    
    if (!includeInternational) {
      topCitiesQuery = db
        .select({
          city: communities.city,
          state: communities.state,
          country: communities.country,
          count: sql<number>`COUNT(*)`,
          avgPriceMin: sql<number>`AVG((${communities.priceRange}->>'min')::numeric)`,
          avgPriceMax: sql<number>`AVG((${communities.priceRange}->>'max')::numeric)`,
          withPricing: sql<number>`COUNT(CASE WHEN ${communities.priceRange} IS NOT NULL THEN 1 END)`
        })
        .from(communities)
        .where(
          sql`${communities.city} IS NOT NULL AND ${communities.state} IS NOT NULL AND (${communities.country} = 'US' OR ${communities.country} IS NULL)`
        )
        .groupBy(communities.city, communities.state, communities.country)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(limit);
    }
    
    const topCities = await topCitiesQuery;
    
    // Get all states/provinces with counts
    const allStates = await db
      .select({
        state: communities.state,
        country: communities.country,
        count: sql<number>`COUNT(*)`,
        avgPriceMin: sql<number>`AVG((${communities.priceRange}->>'min')::numeric)`,
        avgPriceMax: sql<number>`AVG((${communities.priceRange}->>'max')::numeric)`,
        cities: sql<number>`COUNT(DISTINCT ${communities.city})`
      })
      .from(communities)
      .where(sql`${communities.state} IS NOT NULL`)
      .groupBy(communities.state, communities.country)
      .orderBy(sql`COUNT(*) DESC`);
    
    // Categorize locations by country
    const categorized = {
      us: {
        states: allStates.filter(s => !s.country || s.country === 'US'),
        topCities: topCities.filter(c => !c.country || c.country === 'US').slice(0, 50)
      },
      canada: {
        provinces: allStates.filter(s => s.country === 'CA'),
        topCities: topCities.filter(c => c.country === 'CA').slice(0, 25)
      },
      australia: {
        states: allStates.filter(s => s.country === 'AU'),
        topCities: topCities.filter(c => c.country === 'AU').slice(0, 15)
      },
      mexico: {
        states: allStates.filter(s => s.country === 'MX'),
        topCities: topCities.filter(c => c.country === 'MX').slice(0, 10)
      },
      japan: {
        prefectures: allStates.filter(s => s.country === 'JP'),
        topCities: topCities.filter(c => c.country === 'JP').slice(0, 10)
      },
      other: {
        locations: allStates.filter(s => 
          s.country && !['US', 'CA', 'AU', 'MX', 'JP'].includes(s.country)
        ),
        topCities: topCities.filter(c => 
          c.country && !['US', 'CA', 'AU', 'MX', 'JP'].includes(c.country)
        ).slice(0, 10)
      }
    };
    
    // Generate SEO priority scores
    const seoScores = topCities.map(city => {
      let score = 0;
      
      // Base score from community count (max 40 points)
      score += Math.min(40, city.count * 0.5);
      
      // Pricing data availability (max 20 points)
      const pricingPercent = city.withPricing / city.count;
      score += pricingPercent * 20;
      
      // Country bonus points
      if (!city.country || city.country === 'US') score += 10; // US priority
      else if (city.country === 'CA') score += 8; // Canada second
      else if (city.country === 'AU') score += 6; // Australia third
      else score += 4; // Other countries
      
      // State capitals and major cities bonus
      const majorCities = [
        'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
        'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Ottawa',
        'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide',
        'Mexico City', 'Tokyo', 'Osaka'
      ];
      
      if (majorCities.some(mc => 
        city.city.toLowerCase().includes(mc.toLowerCase())
      )) {
        score += 15;
      }
      
      return {
        ...city,
        seoScore: Math.round(score),
        priority: score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low',
        seoUrl: `/senior-living/${city.state.toLowerCase()}/${city.city.toLowerCase().replace(/\s+/g, '-')}`
      };
    }).sort((a, b) => b.seoScore - a.seoScore);
    
    // Get summary statistics
    const summary = await db
      .select({
        totalCommunities: sql<number>`COUNT(*)`,
        totalCountries: sql<number>`COUNT(DISTINCT ${communities.country})`,
        totalStates: sql<number>`COUNT(DISTINCT ${communities.state})`,
        totalCities: sql<number>`COUNT(DISTINCT ${communities.city})`,
        withPricing: sql<number>`COUNT(CASE WHEN ${communities.priceRange} IS NOT NULL THEN 1 END)`
      })
      .from(communities);
    
    res.json({
      summary: summary[0],
      topLocations: seoScores.slice(0, limit),
      byCountry: categorized,
      metadata: {
        generated: new Date().toISOString(),
        totalLocations: topCities.length,
        limit
      }
    });
    
  } catch (error) {
    console.error('Error fetching top SEO locations:', error);
    res.status(500).json({ error: 'Failed to fetch SEO locations data' });
  }
}

// Generate SEO recommendations for locations
export async function getSEORecommendations(req: Request, res: Response) {
  try {
    // Get locations without good SEO coverage
    const underservedLocations = await db
      .select({
        state: communities.state,
        city: communities.city,
        count: sql<number>`COUNT(*)`
      })
      .from(communities)
      .where(
        sql`${communities.city} IS NOT NULL 
        AND ${communities.state} IS NOT NULL
        AND ${communities.country} = 'US'`
      )
      .groupBy(communities.city, communities.state)
      .having(sql`COUNT(*) >= 10`) // At least 10 communities
      .orderBy(sql`COUNT(*) DESC`)
      .limit(50);
    
    // Get states with highest search potential (many communities, major population centers)
    const highPotentialStates = await db
      .select({
        state: communities.state,
        totalCommunities: sql<number>`COUNT(*)`,
        uniqueCities: sql<number>`COUNT(DISTINCT ${communities.city})`,
        avgCommunitiesPerCity: sql<number>`COUNT(*) / COUNT(DISTINCT ${communities.city})`
      })
      .from(communities)
      .where(sql`${communities.state} IS NOT NULL`)
      .groupBy(communities.state)
      .having(sql`COUNT(*) >= 100`)
      .orderBy(sql`COUNT(*) DESC`);
    
    // Identify international opportunities
    const internationalOpportunities = await db
      .select({
        country: communities.country,
        totalCommunities: sql<number>`COUNT(*)`,
        states: sql<number>`COUNT(DISTINCT ${communities.state})`,
        cities: sql<number>`COUNT(DISTINCT ${communities.city})`
      })
      .from(communities)
      .where(sql`${communities.country} IS NOT NULL AND ${communities.country} != 'US'`)
      .groupBy(communities.country)
      .orderBy(sql`COUNT(*) DESC`);
    
    const recommendations = {
      priority1_majorMetros: underservedLocations
        .filter(loc => loc.count >= 50)
        .map(loc => ({
          ...loc,
          recommendation: `High priority: ${loc.city}, ${loc.state} has ${loc.count} communities and likely high search volume`,
          estimatedSearchVolume: loc.count >= 100 ? 'Very High' : loc.count >= 50 ? 'High' : 'Medium',
          seoUrl: `/senior-living/${loc.state.toLowerCase()}/${loc.city.toLowerCase().replace(/\s+/g, '-')}`
        })),
      
      priority2_growthMarkets: underservedLocations
        .filter(loc => loc.count >= 20 && loc.count < 50)
        .map(loc => ({
          ...loc,
          recommendation: `Growth opportunity: ${loc.city}, ${loc.state} has ${loc.count} communities`,
          estimatedSearchVolume: 'Medium',
          seoUrl: `/senior-living/${loc.state.toLowerCase()}/${loc.city.toLowerCase().replace(/\s+/g, '-')}`
        })),
      
      priority3_statePages: highPotentialStates.map(state => ({
        ...state,
        recommendation: `State page opportunity: ${state.state} has ${state.totalCommunities} communities across ${state.uniqueCities} cities`,
        seoUrl: `/senior-living/${state.state.toLowerCase()}`
      })),
      
      international: internationalOpportunities.map(country => ({
        ...country,
        recommendation: `International expansion: ${country.country} has ${country.totalCommunities} communities across ${country.cities} cities`
      })),
      
      keyInsights: [
        'Focus on major metros first (50+ communities) for maximum SEO impact',
        'Create state-level pages for states with 100+ communities',
        `Canada represents a major opportunity with ${internationalOpportunities.find(c => c.country === 'CA')?.totalCommunities || 0} communities`,
        'Implement hreflang tags for international content to avoid duplicate content issues',
        'Use local schema markup to improve visibility in local search results'
      ]
    };
    
    res.json(recommendations);
    
  } catch (error) {
    console.error('Error generating SEO recommendations:', error);
    res.status(500).json({ error: 'Failed to generate SEO recommendations' });
  }
}