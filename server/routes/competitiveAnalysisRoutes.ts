import express from 'express';
import { simplifiedPerplexityService } from '../simplified-perplexity-service';
import { db } from '../db';
import { communities } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Simplified Competitive Analysis using Perplexity-first approach
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
        // Use the simplified service for exact community lookup
        const intelligence = await simplifiedPerplexityService.getCommunityIntelligence(
          community.name,
          `${community.city}, ${community.state}`
        );
        
        console.log(`🔍 Competitive Analysis Result for ${community.name}:`, {
          found: intelligence.found,
          hasWebsite: !!intelligence.officialWebsite,
          hasPhone: !!intelligence.phone,
          hasPhotos: intelligence.photos?.length || 0,
          sourcesCount: intelligence.sources?.length || 0
        });
        
        return res.json({
          success: true,
          communityId,
          communityName: community.name,
          location: `${community.city}, ${community.state}`,
          intelligence,
          timestamp: new Date().toISOString()
        });
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