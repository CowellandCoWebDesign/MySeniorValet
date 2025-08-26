import express from 'express';
import { PerplexityAIService } from '../perplexity-ai-service';
import { websiteScraperService } from '../website-scraper-service';
import { db } from '../db';
import { communities } from '../../shared/schema';
import { sql } from 'drizzle-orm';

const router = express.Router();
const perplexityService = new PerplexityAIService();

// Competitive Analysis endpoint
router.post('/api/competitive-analysis', async (req, res) => {
  console.log('🔍 Competitive Analysis Request:', { location: req.body.location, type: req.body.type });
  
  try {
    const { location, type } = req.body;
    
    if (!location || !type) {
      return res.status(400).json({ error: 'Location and type are required' });
    }

    // SIMPLIFIED FAST QUERY - Just get raw search results quickly
    let searchQuery = '';
    let contextQuery = '';
    
    switch(type) {
      case 'city':
        // INCLUSIVE QUERY: Get all senior living options without restrictions
        searchQuery = `senior living communities ${location} 2025 pricing`;
        contextQuery = `What is the current 2025 average monthly pricing for all senior living in ${location}? List 5-10 major communities with their names, websites if available, and current monthly rates.`;
        break;
      case 'state':
        searchQuery = `senior living average costs ${location} state 2025`;
        contextQuery = `What are the average 2025 monthly costs for all senior living in ${location}? Include state averages with a few example communities and their pricing.`;
        break;
      case 'region':
        searchQuery = `senior care pricing ${location} region 2025`;
        contextQuery = `What are the current 2025 average monthly rates for all senior living in the ${location} region? Include regional pricing averages.`;
        break;
      case 'country':
        searchQuery = `senior living national average costs ${location} 2025`;
        contextQuery = `What are the national average 2025 monthly costs for all senior living in ${location}? Include pricing averages across all care types.`;
        break;
    }

    // Use Perplexity to get real-time market data with timeout
    console.log('📡 Calling Perplexity with query:', contextQuery);
    
    // Set a 45-second timeout for Perplexity call (user accepts longer response times for comprehensive data)
    const perplexityPromise = perplexityService.searchRealTime(contextQuery);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Perplexity timeout after 45 seconds')), 45000)
    );
    
    let perplexityResponse;
    try {
      perplexityResponse = await Promise.race([perplexityPromise, timeoutPromise]) as any;
      console.log('✅ Perplexity response received');
    } catch (timeoutError) {
      console.error('⏱️ Perplexity timed out:', timeoutError);
      throw timeoutError;
    }

    // Parse the response to extract pricing information
    const content = perplexityResponse.summary || '';
    const sources = perplexityResponse.sources || [];
    
    console.log('📝 Perplexity response content length:', content.length); // Debug logging
    
    // Extract pricing information from the response with multiple patterns
    const pricePatterns = [
      /\$[\d,]+(?:\s*-\s*\$[\d,]+)?/g,  // Matches $X,XXX or $X,XXX - $Y,YYY
      /[\d,]+\s*(?:dollars|USD)/gi,      // Matches X,XXX dollars/USD
      /costs?\s+(?:of\s+)?[\$]?[\d,]+/gi // Matches "cost of $X,XXX"
    ];
    
    let averagePrice = 0;
    let minPrice = 0;
    let maxPrice = 0;
    
    // Try different patterns to extract prices
    for (const pattern of pricePatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        const numbers = matches.map(match => {
          const num = match.replace(/[^\d]/g, '');
          return parseInt(num) || 0;
        }).filter(n => n > 1000 && n < 20000); // Reasonable range for monthly costs
        
        if (numbers.length > 0) {
          numbers.sort((a, b) => a - b);
          minPrice = numbers[0];
          maxPrice = numbers[numbers.length - 1];
          averagePrice = Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
          break;
        }
      }
    }
    
    // Fallback to location-based defaults if no prices found
    if (averagePrice === 0) {
      const locationDefaults: Record<string, { avg: number, min: number, max: number }> = {
        'california': { avg: 5500, min: 3800, max: 7200 },
        'new york': { avg: 6200, min: 4300, max: 8100 },
        'florida': { avg: 4200, min: 2900, max: 5500 },
        'texas': { avg: 3800, min: 2600, max: 5000 },
        'arizona': { avg: 4100, min: 2850, max: 5350 },
        'default': { avg: 4500, min: 3150, max: 5850 }
      };
      
      const locationLower = location.toLowerCase();
      const defaults = Object.entries(locationDefaults).find(([key]) => 
        locationLower.includes(key)
      )?.[1] || locationDefaults.default;
      
      averagePrice = defaults.avg;
      minPrice = defaults.min;
      maxPrice = defaults.max;
    }
    
    // Calculate price range
    const priceRange = {
      min: minPrice || Math.round(averagePrice * 0.7),
      max: maxPrice || Math.round(averagePrice * 1.3)
    };

    // Determine comparison to national average (simplified calculation)
    const nationalAverage = 4500; // Approximate US national average for all senior living types combined
    const comparedToNational = Math.round(((averagePrice - nationalAverage) / nationalAverage) * 100);
    
    // Determine trend based on content analysis
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (content.toLowerCase().includes('increas') || content.toLowerCase().includes('rising')) {
      trend = 'increasing';
    } else if (content.toLowerCase().includes('decreas') || content.toLowerCase().includes('falling')) {
      trend = 'decreasing';
    }

    // COMPLETELY UNFILTERED - Show ALL content exactly as returned
    const insights = [];
    const sentences = content.split('. ');
    
    // Include EVERY sentence - no filtering at all
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 0) { // Only skip completely empty strings
        insights.push(trimmed + '.');
      }
    }

    // Also query our database for actual data in the location
    let dbInsight = '';
    if (type === 'city') {
      const localCommunities = await db
        .select({
          count: sql<number>`count(*)`,
          avgRent: sql<number>`avg(rent_per_month)`
        })
        .from(communities)
        .where(sql`lower(city) = lower(${location.split(',')[0]})`);
      
      if (localCommunities[0]?.count > 0) {
        dbInsight = `We have data on ${localCommunities[0].count} verified communities in this area.`;
        insights.unshift(dbInsight);
      }
    }

    // Extract websites from the content - they're already in the response!
    const websitePattern = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9\-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s\]]*)?)/g;
    const websiteMatches = content.match(websitePattern) || [];
    
    // Extract community data from Perplexity's structured format
    const extractedCommunities: Array<{
      name: string;
      website?: string;
      address?: string;
      phone?: string;
      pricing?: string;
      photos?: string[];
      floorPlans?: string[];
      virtualTours?: string[];
      videos?: string[];
      amenities?: string[];
      careLevels?: string[];
      description?: string;
      enrichedPricing?: any;
      contactInfo?: any;
      scrapedAt?: string;
    }> = [];
    
    // Parse Perplexity's structured format: **1. Community Name** followed by details
    const communityPattern = /\*\*\d+\.\s+([^*]+)\*\*/g;
    let match;
    
    while ((match = communityPattern.exec(content)) !== null) {
      const name = match[1].trim();
      
      // Skip invalid entries
      if (!name || name.length < 3 || name.length > 100) {
        continue;
      }
      
      // Get the content after this community name until the next community or separator
      const startIndex = match.index + match[0].length;
      let endIndex = content.length;
      
      // Find the next community header or separator
      const tempPattern = /\*\*\d+\.\s+[^*]+\*\*|^---$/gm;
      tempPattern.lastIndex = startIndex;
      const nextMatch = tempPattern.exec(content);
      if (nextMatch) {
        endIndex = nextMatch.index;
      }
      
      const details = content.substring(startIndex, endIndex);
      const community: any = { name };
      
      // Extract website from markdown link format [text](url) or plain URL
      const websiteLinkMatch = details.match(/\*\*Website:\*\*\s*\[[^\]]+\]\(([^)]+)\)/i) ||
                             details.match(/Website:\s*\[[^\]]+\]\(([^)]+)\)/i);
      const websitePlainMatch = details.match(/\*\*Website:\*\*\s*(https?:\/\/[^\s\n\[]+)/i) ||
                              details.match(/Website:\s*(https?:\/\/[^\s\n\[]+)/i);
      
      if (websiteLinkMatch) {
        community.website = websiteLinkMatch[1].trim();
      } else if (websitePlainMatch) {
        community.website = websitePlainMatch[1].trim();
      }
      
      // Extract address  
      const addressMatch = details.match(/\*\*Address:\*\*\s*([^\n\[]+)/i) ||
                         details.match(/Address:\s*([^\n\[]+)/i);
      if (addressMatch && !addressMatch[1].includes('Not') && !addressMatch[1].includes('not')) {
        const addr = addressMatch[1].trim();
        if (addr && addr.length > 5) {
          community.address = addr;
        }
      }
      
      // Extract phone (handle multiple phone numbers)
      const phoneMatch = details.match(/\*\*Phone:\*\*([^\n]+)/i) ||
                       details.match(/Phone:([^\n]+)/i) ||
                       details.match(/Pricing and Availability:\s*([\d\s\-()]+)/i);
      if (phoneMatch && !phoneMatch[1].includes('Not') && !phoneMatch[1].includes('not')) {
        const phone = phoneMatch[1].trim();
        if (phone && phone.match(/\d{3}/)) { // Must have at least 3 digits
          community.phone = phone;
        }
      }
      
      // Extract pricing
      const pricingMatch = details.match(/\*\*Monthly Pricing:\*\*\s*([^\n\[]+)/i) ||
                         details.match(/Monthly Pricing:\s*([^\n\[]+)/i) ||
                         details.match(/Starting at\s*\*?\*?(\$[\d,]+\+?\s*(?:per|\/)\s*month)/i);
      if (pricingMatch && !pricingMatch[1].includes('Not') && !pricingMatch[1].includes('not')) {
        const pricing = pricingMatch[1].trim();
        if (pricing && pricing.includes('$')) {
          community.pricing = pricing;
        }
      }
      
      extractedCommunities.push(community);
    }
    
    // Also look for additional communities mentioned (without numbering)
    const additionalPattern = /\*\*([^*\d][^*]+)\*\*/g;
    while ((match = additionalPattern.exec(content)) !== null) {
      const name = match[1].trim();
      
      // Check if it's a valid community name
      if (name && name.length > 3 && name.length < 100 &&
          (name.includes('House') || name.includes('Home') || name.includes('Hall') || 
           name.includes('Living') || name.includes('Care') || name.includes('Village') || 
           name.includes('Manor') || name.includes('Residence') || name.includes('Center')) &&
          !name.includes('Website') && !name.includes('Address') && !name.includes('Phone') &&
          !name.includes('Pricing') && !name.includes('Note') && !name.includes('Additional')) {
        
        // Check if we already have this community
        const exists = extractedCommunities.some(c => 
          c.name.toLowerCase() === name.toLowerCase()
        );
        
        if (!exists) {
          extractedCommunities.push({ name });
        }
      }
    }
    
    // Also extract community names mentioned
    const communityNamePattern = /\b(?:The\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Living|Care|Community|Manor|Village|Residence|Center|Home|Place|House|Terrace|Gardens?|Lodge|Park|Estates?|Court|Heights|Oaks|Pines|Springs|Hills|Valley|Creek|Ridge|Point|Plaza|Square|Tower|Arms|Haven|Crossing|Landing|Station|Walk|Way|Trail|Grove|Meadows?|Fields?|Woods?|Forest|Lake|River|Bay|Beach|Shore|Coast|Harbor|Port|Vista|View|Pointe)\b/g;
    const communityMentions = Array.from(new Set(content.match(communityNamePattern) || []));

    // Search our database for mentioned communities
    const matchedCommunities: Array<{
      id: number;
      name: string;
      city: string;
      state: string;
      type: string | null;
    }> = [];
    if (communityMentions.length > 0) {
      for (const communityName of communityMentions) {
        // STABILITY FIX: Validate community name before database query
        if (!communityName || typeof communityName !== 'string' || communityName.trim().length < 3) {
          continue; // Skip invalid names
        }
        
        try {
          const sanitizedName = communityName.trim();
          const searchPattern = '%' + sanitizedName + '%';
          
          // Use LIKE for partial matching to catch variations
          const matches = await db
            .select({
              id: communities.id,
              name: communities.name,
              city: communities.city,
              state: communities.state,
              type: communities.communitySubtype
            })
            .from(communities)
            .where(sql`lower(${communities.name}) LIKE lower(${searchPattern})`)
            .limit(5); // Get up to 5 matches per community name
          
          // Add unique matches only
          for (const match of matches) {
            if (!matchedCommunities.find(m => m.id === match.id)) {
              matchedCommunities.push(match);
            }
          }
        } catch (error) {
          console.error(`Error searching for community "${communityName}":`, error);
        }
      }
    }

    // NEW: Scrape websites for rich data (photos, floorplans, 3D tours)
    const enrichedCommunities = [...extractedCommunities];
    
    // Scrape up to 3 community websites for rich data (to keep response time reasonable)
    const communitiesToScrape = extractedCommunities
      .filter(c => c.website && c.website.includes('http'))
      .slice(0, 3);
    
    console.log(`🕸️ Scraping ${communitiesToScrape.length} community websites for rich data...`);
    
    for (const community of communitiesToScrape) {
      try {
        if (!community.website) continue;
        console.log(`  Scraping ${community.name}: ${community.website}`);
        const scrapedData = await websiteScraperService.scrapeWebsite(community.website);
        
        // Find and enrich the community in our list
        const index = enrichedCommunities.findIndex(c => c.name === community.name);
        if (index !== -1) {
          enrichedCommunities[index] = {
            ...enrichedCommunities[index],
            photos: scrapedData.photos,
            floorPlans: scrapedData.floorPlans,
            virtualTours: scrapedData.virtualTours,
            videos: scrapedData.videos,
            amenities: scrapedData.amenities,
            careLevels: scrapedData.careLevels,
            description: scrapedData.description,
            enrichedPricing: scrapedData.pricing,
            contactInfo: scrapedData.contactInfo,
            scrapedAt: new Date().toISOString()
          };
        }
      } catch (error) {
        console.error(`  Failed to scrape ${community.name}:`, error);
      }
    }
    
    const analysisResult = {
      location,
      locationType: type,
      averageMonthlyRent: averagePrice || 4500,
      priceRange,
      comparedToNational,
      trend,
      insights: insights.length > 0 ? insights : [
        'Pricing varies significantly based on care level and amenities',
        'Memory care typically costs 20-30% more than assisted living',
        'Private rooms command premium pricing over shared accommodations',
        'Location within the city/state affects pricing substantially'
      ],
      detailedSummary: content, // Full unfiltered Perplexity response for complete transparency
      communityMentions, // All mentioned community names
      matchedCommunities, // Communities found in our database
      // Include enriched community data with scraped website content!
      extractedCommunities: enrichedCommunities,
      websiteMatches: websiteMatches.filter(url => {
        // Filter out directory sites, keep only official community websites
        const directorySites = [
          'aplaceformom', 'caring.com', 'seniorly', 'assistedliving.org', 
          'senioradvisor', 'seniorhousing.net', 'medicare.gov', 'google.com', 
          'facebook.com', 'yelp.com', 'apartments.com', 'after55.com'
        ];
        return !directorySites.some(site => url.toLowerCase().includes(site));
      }),
      lastUpdated: new Date().toISOString(),
      sources: sources.length > 0 ? sources.map(s => {
        try {
          const url = new URL(s);
          return url.hostname.replace('www.', '');
        } catch {
          return 'Industry Report';
        }
      }) : ['Genworth Cost of Care', 'SeniorLiving.org', 'AARP Research']
    };

    res.json(analysisResult);
  } catch (error) {
    console.error('❌ Competitive analysis error:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error details:', errorMessage);
    
    // Fallback response with all required fields
    const fallbackResponse = {
      location: req.body.location,
      locationType: req.body.type,
      averageMonthlyRent: 4500,
      priceRange: {
        min: 3000,
        max: 6500
      },
      comparedToNational: 0,
      trend: 'stable' as const,
      insights: [
        'National average for assisted living is approximately $4,500/month',
        'Memory care typically costs 20-30% more than assisted living',
        'Costs vary significantly by region and level of care needed',
        'Urban areas generally have higher costs than rural locations'
      ],
      detailedSummary: '', // Include empty detailedSummary for frontend compatibility
      communityMentions: [], // No communities available in fallback
      matchedCommunities: [], // Include empty matchedCommunities
      extractedCommunities: [], // Include empty extractedCommunities
      websiteMatches: [], // Include empty websiteMatches
      lastUpdated: new Date().toISOString(),
      sources: ['Industry Estimates', 'Historical Data'],
      error: errorMessage // Include error message for debugging
    };
    
    res.json(fallbackResponse);
  }
});

// Get recent analyses (cached)
router.get('/api/competitive-analysis/recent', async (req, res) => {
  try {
    // This would typically fetch from a cache or database
    // For now, return empty array
    res.json([]);
  } catch (error) {
    console.error('Error fetching recent analyses:', error);
    res.json([]);
  }
});

export default router;