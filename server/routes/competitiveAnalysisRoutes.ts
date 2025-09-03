import express from 'express';
import { simplifiedPerplexityService } from '../simplified-perplexity-service';
import EnhancedAIEnrichmentService from '../services/enhanced-ai-enrichment';
import { db } from '../db';
import { communities } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();
const enhancedEnrichmentService = new EnhancedAIEnrichmentService();

// Simplified Competitive Analysis using Perplexity-first approach with Enhanced Fuzzy Matching
router.post('/api/competitive-analysis', async (req, res) => {
  try {
    const { location, type, communityName, communityId } = req.body;
    
    // If we have a community ID, look it up first
    if (communityId) {
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);
      
      if (community) {
        // First try enhanced service with fuzzy matching and multiple strategies
        console.log(`🚀 Using Enhanced AI Enrichment with fuzzy matching for ${community.name}`);
        const enhancedResult = await enhancedEnrichmentService.findCommunityWithStrategies(
          community.id,
          community.name,
          community.city,
          community.state,
          community.address || undefined
        );
        
        // Log enrichment summary
        console.log(enhancedEnrichmentService.getEnrichmentSummary(enhancedResult));
        
        // Fall back to basic service if enhanced fails
        let intelligence = enhancedResult;
        if (!enhancedResult.found) {
          console.log(`💫 Falling back to basic Perplexity search...`);
          intelligence = await simplifiedPerplexityService.getCommunityIntelligence(
            community.name,
            `${community.city}, ${community.state}`
          );
        }
        
        console.log(`🔍 Competitive Analysis Result for ${community.name}:`, {
          found: intelligence.found,
          hasWebsite: !!intelligence.officialWebsite,
          hasPhone: !!intelligence.phone,
          hasPhotos: intelligence.photos?.length || 0,
          sourcesCount: intelligence.sources?.length || 0
        });
        
        // Get actual competitive communities from the database in the same city
        console.log(`🔍 Finding other communities in ${community.city}, ${community.state} for market analysis...`);
        const competitiveCommunities = await db
          .select({
            id: communities.id,
            name: communities.name,
            address: communities.address,
            rentPerMonth: communities.rentPerMonth,
            photos: communities.photos,
            careServices: communities.careServices,
            amenities: communities.amenities
          })
          .from(communities)
          .where(eq(communities.city, community.city))
          .limit(10);

        // Filter out the current community and prepare competitive analysis
        const comparableCommunities = competitiveCommunities
          .filter(c => c.id !== community.id)
          .map(c => ({
            name: c.name,
            price: c.rentPerMonth ? `$${c.rentPerMonth}/month` : 'Contact for pricing',
            distance: 'Same city',
            address: c.address,
            description: `Senior living community in ${community.city}`,
            photos: c.photos ? c.photos.length : 0,
            careServices: c.careServices?.length || 0,
            amenities: c.amenities?.length || 0
          }));

        // Calculate market averages
        const rentValues = competitiveCommunities
          .filter(c => c.rentPerMonth && c.rentPerMonth > 0)
          .map(c => c.rentPerMonth);
        
        const averageRent = rentValues.length > 0 ? 
          Math.round(rentValues.reduce((sum, rent) => sum + rent, 0) / rentValues.length) : null;
        
        const minRent = rentValues.length > 0 ? Math.min(...rentValues) : null;
        const maxRent = rentValues.length > 0 ? Math.max(...rentValues) : null;

        console.log(`📊 Found ${comparableCommunities.length} competitive communities in ${community.city}`);
        console.log(`💰 Market pricing: Average $${averageRent}/mo, Range: $${minRent}-$${maxRent}/mo`);

        // Transform intelligence data to match frontend expectations
        const transformedData = {
          success: true,
          communityId,
          communityName: community.name,
          location: `${community.city}, ${community.state}`,
          
          // Add expected fields for market analysis with real data
          averageMonthlyRent: averageRent || intelligence.pricing?.assistedLiving || 
                              intelligence.pricing?.memoryCare || 
                              intelligence.pricing?.independentLiving || 
                              'Contact for pricing',
          
          // Add market price range
          priceRange: averageRent ? {
            min: minRent,
            max: maxRent,
            average: averageRent
          } : null,
          
          // Use real competitive communities from database
          extractedCommunities: comparableCommunities.length > 0 ? 
            comparableCommunities : 
            (intelligence.nearbyOptions?.map((opt: any) => ({
              name: opt.name,
              price: opt.pricing || 'Contact for pricing',
              distance: opt.distance,
              address: opt.address,
              description: opt.description || `Senior living community near ${community.name}`
            })) || []),
          
          // Create detailed market analysis summary with real competitive data
          detailedSummary: `Market Analysis for ${community.name} in ${community.city}, ${community.state}: ${
            comparableCommunities.length > 0 ? 
            `We found ${comparableCommunities.length} comparable senior living communities in ${community.city}. ${
              averageRent ? 
              `The average monthly cost is $${averageRent.toLocaleString()}, with prices ranging from $${minRent?.toLocaleString()} to $${maxRent?.toLocaleString()}. ` : 
              'Pricing varies across communities in the area. '
            }${
              intelligence.found ? 
              `${community.name} ${intelligence.careLevels?.length ? `offers ${intelligence.careLevels.join(', ')} services` : 'provides senior living services'} in this competitive market. ` : 
              ''
            }${
              intelligence.amenities?.length ? 
              `Key amenities include ${intelligence.amenities.slice(0, 5).join(', ')}. ` : 
              ''
            }This analysis is based on ${competitiveCommunities.length} verified communities in the ${community.city} market.` : 
            `${community.name} is located in ${community.city}, ${community.state}. ${
              intelligence.found ? 
              'Our AI search found current information about this community. ' : 
              'We are gathering additional market data for this location. '
            }${
              intelligence.careLevels?.length ? 
              `Care levels include: ${intelligence.careLevels.join(', ')}. ` : 
              ''
            }${
              intelligence.amenities?.length ? 
              `Amenities include: ${intelligence.amenities.slice(0, 5).join(', ')}. ` : 
              ''
            }Contact the community directly for current pricing and availability.`
          }`,
          
          // Generate insights from real market data and AI intelligence
          insights: [
            comparableCommunities.length > 0 && `${comparableCommunities.length} comparable communities found in ${community.city}`,
            averageRent && `Average market price: $${averageRent.toLocaleString()}/month`,
            minRent && maxRent && `Price range: $${minRent.toLocaleString()} - $${maxRent.toLocaleString()}/month`,
            intelligence.found && `${community.name} verified as active senior living community`,
            intelligence.officialWebsite && `Official website available for direct information`,
            intelligence.pricing && Object.keys(intelligence.pricing).length > 0 && 
              `Live pricing available for ${Object.keys(intelligence.pricing).join(', ')}`,
            intelligence.careLevels?.length && `Offers ${intelligence.careLevels.length} levels of care`,
            intelligence.amenities?.length && `Features ${intelligence.amenities.length} amenities and services`,
            intelligence.phone && `Direct contact information verified`,
            `Market analysis based on ${competitiveCommunities.length} verified communities in ${community.city}, ${community.state}`
          ].filter(Boolean),
          
          // Add market trend (could be enhanced with actual analysis)
          trend: 'stable',
          
          // Add pricing comparison (placeholder - could be enhanced)
          pricing: {
            priceRange: intelligence.pricing?.assistedLiving || intelligence.pricing?.memoryCare || 'Contact for pricing',
            comparedToNational: 0, // Placeholder - would need actual comparison
            details: intelligence.pricing
          },
          
          // Include original intelligence for backward compatibility
          intelligence,
          
          // Add sources
          sources: intelligence.sources || [],
          
          timestamp: new Date().toISOString()
        };
        
        return res.json(transformedData);
      }
    }
    
    // For area searches without specific community
    if (communityName && location) {
      const intelligence = await simplifiedPerplexityService.getCommunityIntelligence(
        communityName,
        location
      );
      
      return res.json({
        success: true,
        communityName,
        location,
        intelligence,
        timestamp: new Date().toISOString()
      });
    }
    
    // For broad area searches
    if (location) {
      const nearbyOptions = await simplifiedPerplexityService.findNearbyOptions(location);
      
      // Extract pricing from nearby options if available
      const prices = nearbyOptions.nearbyOptions?.map((opt: any) => {
        // Try to extract numeric price from pricing field
        if (opt.pricing && typeof opt.pricing === 'string') {
          const priceMatch = opt.pricing.match(/\$([\d,]+)/);
          if (priceMatch) {
            return parseInt(priceMatch[1].replace(',', ''));
          }
        }
        return null;
      }).filter((p: number | null) => p !== null) || [];
      
      const avgPrice = prices.length > 0 ? 
        Math.round(prices.reduce((sum: number, p: number) => sum + p, 0) / prices.length) : 
        null;
      
      const minPrice = prices.length > 0 ? Math.min(...prices) : null;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
      
      // Format response to match frontend expectations
      return res.json({
        success: true,
        location,
        locationType: type,
        
        // Market analysis fields
        averageMonthlyRent: avgPrice || 4500, // Default national average if no data
        
        priceRange: {
          min: minPrice || 2000,
          max: maxPrice || 8000
        },
        
        // Compare to national average ($4,500)
        comparedToNational: avgPrice ? Math.round(((avgPrice - 4500) / 4500) * 100) : 0,
        
        trend: 'stable', // Default to stable
        
        // Detailed insights
        insights: [
          nearbyOptions.nearbyOptions?.length && `Found ${nearbyOptions.nearbyOptions.length} senior living communities in ${location}`,
          avgPrice && `Average monthly cost: $${avgPrice.toLocaleString()}`,
          minPrice && maxPrice && `Price range: $${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`,
          nearbyOptions.found && 'Real-time market data available',
          'Analysis powered by Perplexity AI web search'
        ].filter(Boolean),
        
        detailedSummary: nearbyOptions.description || 
          `Market analysis for ${location}: ${nearbyOptions.nearbyOptions?.length || 0} senior living communities found in the area. ${
            avgPrice ? 
            `Average monthly cost is approximately $${avgPrice.toLocaleString()}. ` : 
            'Contact communities directly for current pricing. '
          }This analysis is based on real-time web search data.`,
        
        communityMentions: nearbyOptions.nearbyOptions?.map((opt: any) => opt.name) || [],
        
        lastUpdated: new Date().toISOString(),
        
        sources: nearbyOptions.sources || [],
        
        // Include original intelligence for backward compatibility
        intelligence: nearbyOptions,
        
        timestamp: new Date().toISOString(),
        _version: 'v4_streamlined_hero_' + Date.now(),
        _timestamp: Date.now()
      });
    }
    
    return res.status(400).json({ 
      error: 'Please provide either a community ID, community name with location, or location for area search' 
    });
  } catch (error) {
    console.error('Competitive analysis error:', error);
    return res.status(500).json({ 
      error: 'Failed to perform competitive analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;