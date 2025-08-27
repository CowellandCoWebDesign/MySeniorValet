import { Router } from 'express';
import { db } from '../db';
import { communities, vendors, vendorServices, hospitals } from '@shared/schema';
import { sql, or, ilike, and } from 'drizzle-orm';

const router = Router();

// Enhanced autocomplete endpoint for predictive search with categories
router.get('/autocomplete/suggestions', async (req, res) => {
  try {
    const query = req.query.query as string;
    const limit = parseInt(req.query.limit as string) || 250; // MAXIMUM: 250 results to handle LA's 207 communities
    const category = req.query.category as string; // Optional filter: 'all', 'communities', 'healthcare', 'vendors', 'resources'
    
    // Allow single character searches for better UX
    if (!query || query.length < 1) {
      return res.json({ 
        suggestions: [],
        _version: 'v5_comprehensive_autocomplete',
        _timestamp: Date.now()
      });
    }

    const searchTerm = query.toLowerCase().trim();
    const suggestions: any[] = [];
    
    // Track timing for performance monitoring
    const startTime = Date.now();
    
    // PRIORITY 1: COMPREHENSIVE community search - this is what users need most!
    if (!category || category === 'all' || category === 'communities') {
      const communityNameResults = await db
        .select({
          id: communities.id,
          name: communities.name,
          city: communities.city,
          state: communities.state,
          address: communities.address,
          communitySubtype: communities.communitySubtype,
          rating: communities.rating,
          hudPropertyId: communities.hudPropertyId,
          rentPerMonth: communities.rentPerMonth,
          priceRange: communities.priceRange,
          totalUnits: communities.totalUnits,
          phone: communities.phone,
          careTypes: communities.careTypes,
          reviewCount: communities.reviewCount
        })
        .from(communities)
        .where(
          or(
            ilike(communities.name, `${searchTerm}%`),  // Starts with (highest priority)
            ilike(communities.name, `%${searchTerm}%`), // Contains (medium priority)
            ilike(communities.city, `${searchTerm}%`),  // City starts with
            ilike(communities.city, `%${searchTerm}%`),  // City contains
            ilike(communities.state, `${searchTerm}%`), // State starts with (for "North Carolina")
            ilike(communities.country, `${searchTerm}%`) // Country starts with (for "Mexico")
          )
        )
        .limit(200); // FULL COVERAGE: 200+ communities for major cities like LA (207 communities)
      
      // Add community name matches with priority and ALL needed data
      communityNameResults.forEach(c => {
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
          rentPerMonth: c.rentPerMonth,
          priceRange: c.priceRange,
          totalUnits: c.totalUnits,
          phone: c.phone,
          careTypes: c.careTypes,
          reviewCount: c.reviewCount,
          communitySubtype: c.communitySubtype
        });
      });
    }
    
    // PRIORITY 2: Search cities (database first for speed)
    const quickCityResults = await db
      .selectDistinct({
        city: communities.city,
        state: communities.state,
        count: sql<number>`COUNT(*)::int`.as('count')
      })
      .from(communities)
      .where(
        or(
          ilike(communities.city, `${searchTerm}%`),  // Starts with
          ilike(communities.city, `%${searchTerm}%`),  // Contains
          ilike(communities.state, `${searchTerm}%`), // State search (North Carolina, etc)
          sql`CONCAT(${communities.city}, ' ', ${communities.state}) ILIKE ${searchTerm + '%'}` // Combined city+state
        )
      )
      .groupBy(communities.city, communities.state)
      .limit(50); // EXPANDED: 50 cities for complete coverage
    
    // Add city suggestions with improved data
    quickCityResults.forEach(c => {
      suggestions.push({
        label: `${c.city}, ${c.state}`,
        value: c.city,
        type: 'location',
        id: null,
        description: `City - ${c.count} communities`,
        priority: c.city.toLowerCase().startsWith(searchTerm) ? 3 : 4,
        city: c.city,
        state: c.state,
        count: c.count
      });
    });
    
    // Parse location queries (e.g., "Kingston Ontario" or "San Francisco CA")
    let citySearch = searchTerm;
    let stateSearch: string | null = null;
    
    // Common state/province patterns
    const stateProvincePatterns = [
      // Canadian provinces
      /\b(ontario|on|quebec|qc|british columbia|bc|alberta|ab|manitoba|mb|saskatchewan|sk|nova scotia|ns|new brunswick|nb|newfoundland|nl|prince edward island|pei|yukon|yt|northwest territories|nt|nunavut|nu)\b$/i,
      // US states (common abbreviations and full names)
      /\b(alabama|al|alaska|ak|arizona|az|arkansas|ar|california|ca|colorado|co|connecticut|ct|delaware|de|florida|fl|georgia|ga|hawaii|hi|idaho|id|illinois|il|indiana|in|iowa|ia|kansas|ks|kentucky|ky|louisiana|la|maine|me|maryland|md|massachusetts|ma|michigan|mi|minnesota|mn|mississippi|ms|missouri|mo|montana|mt|nebraska|ne|nevada|nv|new hampshire|nh|new jersey|nj|new mexico|nm|new york|ny|north carolina|nc|north dakota|nd|ohio|oh|oklahoma|ok|oregon|or|pennsylvania|pa|rhode island|ri|south carolina|sc|south dakota|sd|tennessee|tn|texas|tx|utah|ut|vermont|vt|virginia|va|washington|wa|west virginia|wv|wisconsin|wi|wyoming|wy)\b$/i
    ];
    
    // Check if search contains state/province
    for (const pattern of stateProvincePatterns) {
      const match = searchTerm.match(pattern);
      if (match) {
        stateSearch = match[1].toUpperCase();
        // Map common abbreviations and full names to standard format
        const stateMap: Record<string, string> = {
          'ONTARIO': 'ON', 'QUEBEC': 'QC', 'BRITISH COLUMBIA': 'BC', 'ALBERTA': 'AB',
          'MANITOBA': 'MB', 'SASKATCHEWAN': 'SK', 'NOVA SCOTIA': 'NS', 'NEW BRUNSWICK': 'NB',
          'NEWFOUNDLAND': 'NL', 'PRINCE EDWARD ISLAND': 'PE', 'YUKON': 'YT', 
          'NORTHWEST TERRITORIES': 'NT', 'NUNAVUT': 'NU',
          'ALABAMA': 'AL', 'ALASKA': 'AK', 'ARIZONA': 'AZ', 'ARKANSAS': 'AR',
          'CALIFORNIA': 'CA', 'COLORADO': 'CO', 'CONNECTICUT': 'CT', 'DELAWARE': 'DE',
          'FLORIDA': 'FL', 'GEORGIA': 'GA', 'HAWAII': 'HI', 'IDAHO': 'ID',
          'ILLINOIS': 'IL', 'INDIANA': 'IN', 'IOWA': 'IA', 'KANSAS': 'KS',
          'KENTUCKY': 'KY', 'LOUISIANA': 'LA', 'MAINE': 'ME', 'MARYLAND': 'MD',
          'MASSACHUSETTS': 'MA', 'MICHIGAN': 'MI', 'MINNESOTA': 'MN', 'MISSISSIPPI': 'MS',
          'MISSOURI': 'MO', 'MONTANA': 'MT', 'NEBRASKA': 'NE', 'NEVADA': 'NV',
          'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ', 'NEW MEXICO': 'NM', 'NEW YORK': 'NY',
          'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND', 'OHIO': 'OH', 'OKLAHOMA': 'OK',
          'OREGON': 'OR', 'PENNSYLVANIA': 'PA', 'RHODE ISLAND': 'RI', 'SOUTH CAROLINA': 'SC',
          'SOUTH DAKOTA': 'SD', 'TENNESSEE': 'TN', 'TEXAS': 'TX', 'UTAH': 'UT',
          'VERMONT': 'VT', 'VIRGINIA': 'VA', 'WASHINGTON': 'WA', 'WEST VIRGINIA': 'WV',
          'WISCONSIN': 'WI', 'WYOMING': 'WY'
        };
        
        // Convert to standard abbreviation if it's a full name
        if (stateMap[stateSearch]) {
          stateSearch = stateMap[stateSearch];
        } else if (stateSearch.length > 2) {
          // If not found in map and longer than 2 chars, keep original
          stateSearch = stateSearch;
        }
        
        // Extract city part (everything before the state/province)
        citySearch = searchTerm.substring(0, match.index).trim();
      }
    }
    
    // Also check for comma-separated format (e.g., "Kingston, Ontario")
    if (!stateSearch && searchTerm.includes(',')) {
      const parts = searchTerm.split(',').map(p => p.trim());
      if (parts.length === 2) {
        citySearch = parts[0];
        const potentialState = parts[1].toUpperCase();
        // Map to standard abbreviation
        const stateMap: Record<string, string> = {
          'ONTARIO': 'ON', 'QUEBEC': 'QC', 'BRITISH COLUMBIA': 'BC', 'ALBERTA': 'AB',
          'MANITOBA': 'MB', 'SASKATCHEWAN': 'SK', 'NOVA SCOTIA': 'NS', 'NEW BRUNSWICK': 'NB',
          'NEWFOUNDLAND': 'NL', 'PRINCE EDWARD ISLAND': 'PE', 'YUKON': 'YT',
          'NORTHWEST TERRITORIES': 'NT', 'NUNAVUT': 'NU'
        };
        stateSearch = stateMap[potentialState] || potentialState;
      }
    }
    
    // Log parsed location for debugging
    if (citySearch || stateSearch) {
      console.log(`📍 Parsed location - City: "${citySearch}", State/Province: "${stateSearch}"`);
    }

    // Only use external API as last resort if we have few results
    if (suggestions.length < 3 && (!category || category === 'all' || category === 'locations')) {
      // Skip external API calls for now - too slow
      // Focus on database results only
    }

    // Skip duplicate community search - already done above with better priority

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
        .limit(15); // ENTERPRISE: 15 healthcare results

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
        .limit(5); // Increased from 3 to 5

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
        .limit(5); // Increased from 3 to 5

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
    // Build city search conditions based on parsed location
    let cityWhereCondition;
    if (stateSearch && citySearch) {
      // Search for cities in specific state
      cityWhereCondition = and(
        ilike(communities.city, `%${citySearch}%`),
        or(
          sql`UPPER(${communities.state}) = ${stateSearch}`,
          ilike(communities.state, `%${stateSearch}%`)
        )
      );
    } else if (citySearch) {
      // Search for cities matching the search term
      cityWhereCondition = ilike(communities.city, `%${citySearch}%`);
    } else {
      // Default city search
      cityWhereCondition = ilike(communities.city, `%${searchTerm}%`);
    }
    
    const cityResults = await db
      .selectDistinct({
        city: communities.city,
        state: communities.state,
        count: sql<number>`COUNT(*)`.as('count')
      })
      .from(communities)
      .where(cityWhereCondition)
      .groupBy(communities.city, communities.state)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(3);

    cityResults.forEach(c => {
      suggestions.push({
        label: `${c.city}, ${c.state}`,
        value: `${c.city}, ${c.state}`,
        type: 'city',
        count: c.count,
        description: `${c.count} communities`
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

    // Build county search conditions
    let countyWhereCondition;
    if (stateSearch && citySearch) {
      // Search for counties in specific state
      countyWhereCondition = and(
        sql`${communities.county} IS NOT NULL AND LOWER(${communities.county}) LIKE LOWER(${'%' + (citySearch || '') + '%'})`,
        or(
          sql`UPPER(${communities.state}) = ${stateSearch}`,
          ilike(communities.state, `%${stateSearch}%`)
        )
      );
    } else if (citySearch) {
      countyWhereCondition = sql`${communities.county} IS NOT NULL AND LOWER(${communities.county}) LIKE LOWER(${'%' + (citySearch || '') + '%'})`;
    } else {
      countyWhereCondition = sql`${communities.county} IS NOT NULL AND LOWER(${communities.county}) LIKE LOWER(${'%' + (searchTerm || '') + '%'})`;
    }
    
    const countyResults = await db
      .selectDistinct({
        county: communities.county,
        state: communities.state,
        count: sql<number>`COUNT(*)`.as('count')
      })
      .from(communities)
      .where(countyWhereCondition)
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

    // Sort by priority if available, otherwise by relevance and type
    suggestions.sort((a, b) => {
      // Use priority if set (from our optimized searches)
      if (a.priority !== undefined && b.priority !== undefined) {
        return a.priority - b.priority;
      }
      
      // Exact matches first
      const aExact = a.label.toLowerCase() === searchTerm;
      const bExact = b.label.toLowerCase() === searchTerm;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then by type priority: community > location > city > healthcare > vendor > care_type > state > county
      const typePriority: Record<string, number> = { 
        community: 1,
        location: 2,
        city: 3, 
        healthcare: 4, 
        vendor: 5, 
        care_type: 6, 
        state: 7, 
        county: 8 
      };
      return (typePriority[a.type] || 9) - (typePriority[b.type] || 9);
    });

    const responseTime = Date.now() - startTime;
    console.log(`⚡ Autocomplete: ${suggestions.length} results in ${responseTime}ms for "${searchTerm}"`);

    res.json({ 
      suggestions: suggestions.slice(0, limit),
      responseTime,
      totalFound: suggestions.length,
      _version: 'v5_comprehensive_autocomplete',
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// High-performance community-focused search endpoint for maximum coverage
router.get('/autocomplete/communities', async (req, res) => {
  try {
    const query = req.query.query as string;
    const limit = parseInt(req.query.limit as string) || 30; // Even higher limit for community-focused search
    
    if (!query || query.length < 1) {
      return res.json({ suggestions: [], _version: 'v5_community_focused', _timestamp: Date.now() });
    }

    const searchTerm = query.toLowerCase().trim();
    const startTime = Date.now();
    
    // ULTRA-COMPREHENSIVE community search
    const communityResults = await db
      .select({
        id: communities.id,
        name: communities.name,
        city: communities.city,
        state: communities.state,
        address: communities.address,
        communitySubtype: communities.communitySubtype,
        rating: communities.rating,
        hudPropertyId: communities.hudPropertyId,
        rentPerMonth: communities.rentPerMonth,
        priceRange: communities.priceRange,
        totalUnits: communities.totalUnits,
        phone: communities.phone,
        careTypes: communities.careTypes,
        reviewCount: communities.reviewCount
      })
      .from(communities)
      .where(
        or(
          ilike(communities.name, `${searchTerm}%`),    // Name starts with
          ilike(communities.name, `%${searchTerm}%`),   // Name contains
          ilike(communities.city, `${searchTerm}%`),    // City starts with  
          ilike(communities.city, `%${searchTerm}%`),   // City contains
          ilike(communities.address, `%${searchTerm}%`) // Address contains
        )
      )
      .limit(limit);

    const suggestions = communityResults.map(c => ({
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
      rentPerMonth: c.rentPerMonth,
      priceRange: c.priceRange,
      totalUnits: c.totalUnits,
      phone: c.phone,
      careTypes: c.careTypes,
      reviewCount: c.reviewCount,
      communitySubtype: c.communitySubtype
    }));

    // Sort by priority (exact name matches first)
    suggestions.sort((a, b) => a.priority - b.priority);

    const responseTime = Date.now() - startTime;
    console.log(`🏆 Community-focused search: ${suggestions.length} results in ${responseTime}ms for "${searchTerm}"`);

    res.json({ 
      suggestions,
      responseTime,
      totalFound: suggestions.length,
      _version: 'v5_community_focused',
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Community-focused autocomplete error:', error);
    res.status(500).json({ error: 'Failed to fetch community suggestions' });
  }
});

// Legacy endpoint for compatibility - returns simple string array
router.get('/autocomplete', async (req, res) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 100; // ENTERPRISE: Match new standard // Increased from 6 to 20
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = query.toLowerCase().trim();
    
    // Directly query the database for the legacy endpoint
    const communityResults = await db
      .select({
        id: communities.id,
        name: communities.name,
        city: communities.city,
        state: communities.state
      })
      .from(communities)
      .where(
        or(
          ilike(communities.name, `${searchTerm}%`),
          ilike(communities.name, `%${searchTerm}%`),
          ilike(communities.city, `${searchTerm}%`)
        )
      )
      .limit(limit);
    
    // Convert to simple format for legacy compatibility
    const suggestions = communityResults.map(c => ({
      label: c.name,
      value: c.name,
      type: 'community',
      id: c.id,
      description: `${c.city}, ${c.state}`
    }));
    
    res.json({ 
      suggestions,
      _version: 'v5_legacy_direct'
    });
  } catch (error) {
    console.error('Legacy autocomplete error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

export default router;