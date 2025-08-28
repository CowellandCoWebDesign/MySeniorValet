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
        
        // Transform intelligence data to match frontend expectations
        const transformedData = {
          success: true,
          communityId,
          communityName: community.name,
          location: `${community.city}, ${community.state}`,
          
          // Add expected fields for market analysis
          averageMonthlyRent: intelligence.pricing?.assistedLiving || 
                              intelligence.pricing?.memoryCare || 
                              intelligence.pricing?.independentLiving || 
                              'Contact for pricing',
          
          // Transform nearbyOptions to extractedCommunities
          extractedCommunities: intelligence.nearbyOptions?.map((opt: any) => ({
            name: opt.name,
            price: opt.pricing || 'Contact for pricing',
            distance: opt.distance,
            address: opt.address,
            description: opt.description || `Senior living community near ${community.name}`
          })) || [],
          
          // Create detailed summary from description and other data
          detailedSummary: intelligence.description || 
            `Market analysis for ${community.name} in ${community.city}, ${community.state}. ${
              intelligence.found ? 
              'This community offers senior living services in the local area.' : 
              'Limited public information available for this specific community.'
            } ${
              intelligence.careLevels?.length ? 
              `Care levels include: ${intelligence.careLevels.join(', ')}.` : 
              ''
            } ${
              intelligence.amenities?.length ? 
              `Amenities include: ${intelligence.amenities.slice(0, 5).join(', ')}.` : 
              ''
            }`,
          
          // Generate insights from available data
          insights: [
            intelligence.found && `${community.name} is an active senior living community in ${community.city}`,
            intelligence.officialWebsite && `Official website available for direct information`,
            intelligence.pricing && Object.keys(intelligence.pricing).length > 0 && 
              `Pricing information available for ${Object.keys(intelligence.pricing).join(', ')}`,
            intelligence.careLevels?.length && `Offers ${intelligence.careLevels.length} levels of care`,
            intelligence.amenities?.length && `Features ${intelligence.amenities.length} amenities and services`,
            intelligence.nearbyOptions?.length && 
              `${intelligence.nearbyOptions.length} comparable communities found in the area`,
            `Located in ${community.city}, ${community.state} market`
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
      
      return res.json({
        success: true,
        location,
        type,
        intelligence: nearbyOptions,
        timestamp: new Date().toISOString()
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