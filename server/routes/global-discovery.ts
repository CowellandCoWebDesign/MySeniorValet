import { Express } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, and, isNull, or, like, sql } from 'drizzle-orm';

// Schema for global discovery search
const globalSearchSchema = z.object({
  query: z.string(),
  searchType: z.enum(['location', 'service', 'community']).optional(),
  limit: z.number().min(1).max(100).default(20)
});

// Schema for discovered community data
const discoveredCommunitySchema = z.object({
  name: z.string(),
  location: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  careTypes: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
  pricing: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    description: z.string().optional()
  }).optional(),
  source: z.string(), // Where we found it (Perplexity, Google, etc.)
  sourceUrl: z.string().optional(),
  confidence: z.number().min(0).max(100).optional() // How confident we are in the data
});

export function setupGlobalDiscoveryRoutes(app: Express) {
  
  // Global discovery search endpoint
  app.post('/api/global-discovery/search', async (req, res) => {
    try {
      const { query, searchType, limit } = globalSearchSchema.parse(req.body);
      
      console.log(`🌍 Global Discovery Search: "${query}" (type: ${searchType || 'auto-detect'})`);
      
      // Step 1: Check if we already have communities matching this query in our database
      let existingCommunities: any[] = [];
      
      // Try to find existing communities first
      const searchTerms = query.toLowerCase().split(' ');
      const locationSearch = searchTerms.some(term => 
        term.length > 2 && !['for', 'in', 'at', 'the', 'senior', 'living', 'care'].includes(term)
      );
      
      if (locationSearch) {
        // Search by location (city, state, country)
        existingCommunities = await db.select()
          .from(communities)
          .where(
            or(
              ...searchTerms.map(term => 
                or(
                  like(communities.city, `%${term}%`),
                  like(communities.state, `%${term}%`),
                  like(communities.country, `%${term}%`),
                  like(communities.name, `%${term}%`)
                )
              )
            )
          )
          .limit(5);
      }
      
      // Step 2: Use Perplexity to search globally for communities
      const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
      if (!perplexityApiKey) {
        console.error('❌ Perplexity API key not configured');
        return res.status(500).json({ error: 'Search service not configured' });
      }
      
      // Construct an intelligent search query for Perplexity
      let searchQuery = '';
      if (searchType === 'location' || locationSearch) {
        searchQuery = `Find senior living communities, assisted living facilities, nursing homes, and retirement communities in ${query}. Include their names, addresses, websites, phone numbers, and brief descriptions.`;
      } else if (searchType === 'service') {
        searchQuery = `Find senior care services and providers offering ${query}. Include company names, locations, contact information, and service descriptions.`;
      } else {
        searchQuery = `Find information about ${query} related to senior living, assisted living, or elder care. Include facility names, locations, and contact details if available.`;
      }
      
      console.log(`🔍 Perplexity Query: ${searchQuery}`);
      
      // Call Perplexity API
      const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: `You are a senior care research assistant. Extract structured data about senior living communities. 
                       For each community found, provide: name, full address, city, state, country, phone, email, website, 
                       care types offered, and a brief description. Format as a JSON array.`
            },
            {
              role: 'user',
              content: searchQuery
            }
          ],
          temperature: 0.2,
          max_tokens: 2000,
          return_images: true, // Try to get images if available
          return_related_questions: false,
          stream: false
        })
      });
      
      if (!perplexityResponse.ok) {
        console.error('❌ Perplexity API error:', perplexityResponse.status);
        throw new Error('Search service error');
      }
      
      const perplexityData = await perplexityResponse.json();
      const aiResponse = perplexityData.choices[0]?.message?.content || '';
      const citations = perplexityData.citations || [];
      
      console.log(`✅ Perplexity Response Length: ${aiResponse.length} characters`);
      console.log(`📚 Citations: ${citations.length} sources`);
      
      // Step 3: Parse the AI response to extract community data
      let discoveredCommunities = [];
      
      try {
        // Try to extract JSON data from the response
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          discoveredCommunities = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: Extract community information using patterns
          const communityMatches = aiResponse.matchAll(/(?:^|\n)[\d\.\-\*\s]*([A-Z][^:\n]{2,50})(?::|\n)/g);
          for (const match of communityMatches) {
            const name = match[1].trim();
            if (name && !name.includes('?') && name.length > 5) {
              discoveredCommunities.push({
                name: name,
                description: `Found via search for "${query}"`,
                source: 'Perplexity Web Search',
                confidence: 70
              });
            }
          }
        }
      } catch (parseError) {
        console.error('⚠️ Error parsing AI response:', parseError);
        // Continue with fallback extraction
      }
      
      // Step 4: Save discovered communities to database with "discovered_pending" status
      const savedCommunities = [];
      for (const discovered of discoveredCommunities) {
        try {
          // Check if we already have this community
          const existing = await db.select()
            .from(communities)
            .where(
              and(
                eq(communities.name, discovered.name),
                discovered.city ? eq(communities.city, discovered.city) : sql`true`
              )
            )
            .limit(1);
          
          if (existing.length === 0 && discovered.name) {
            // Create a new discovered community record
            const [newCommunity] = await db.insert(communities)
              .values({
                name: discovered.name,
                address: discovered.address || discovered.location || 'Address pending verification',
                city: discovered.city || query.split(',')[0] || 'Unknown',
                state: discovered.state || query.split(',')[1]?.trim() || 'Unknown',
                country: discovered.country || 'Unknown',
                zipCode: discovered.zipCode || '00000',
                phone: discovered.phone || null,
                email: discovered.email || null,
                website: discovered.website || null,
                description: discovered.description || `Discovered via search for "${query}"`,
                careTypes: discovered.careTypes || ['Unknown'],
                photos: discovered.photos || [],
                
                // Mark as discovered and pending approval
                discoverySource: 'Global Discovery Search',
                discoveryDate: new Date(),
                enrichmentStatus: 'pending', // Will be marked for admin approval
                enrichmentHistory: [{
                  timestamp: new Date().toISOString(),
                  source: 'Perplexity Global Search',
                  fieldsUpdated: ['initial_discovery']
                }],
                data_source: 'AI Discovery (Pending Verification)',
                isVerified: false
              })
              .returning();
            
            console.log(`💾 Saved new discovered community: ${discovered.name} (ID: ${newCommunity.id})`);
            savedCommunities.push(newCommunity);
          }
        } catch (saveError) {
          console.error(`⚠️ Error saving discovered community ${discovered.name}:`, saveError);
        }
      }
      
      // Step 5: Combine existing and discovered communities
      const allResults = [
        ...existingCommunities.map(c => ({ ...c, isExisting: true })),
        ...savedCommunities.map(c => ({ ...c, isDiscovered: true, needsApproval: true }))
      ];
      
      // Step 6: Return results with metadata
      res.json({
        success: true,
        query: query,
        searchType: searchType || 'auto-detected',
        results: allResults.slice(0, limit),
        metadata: {
          totalFound: allResults.length,
          existingCount: existingCommunities.length,
          discoveredCount: savedCommunities.length,
          sources: citations,
          searchLocation: query,
          timestamp: new Date().toISOString(),
          aiConfidence: discoveredCommunities.length > 0 ? 85 : 50
        },
        message: allResults.length === 0 
          ? `No communities found for "${query}". Try a different location or search term.`
          : `Found ${allResults.length} communities (${existingCommunities.length} existing, ${savedCommunities.length} newly discovered)`
      });
      
    } catch (error) {
      console.error('❌ Global discovery search error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to perform global search',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Get discovered communities pending approval (for admin dashboard)
  app.get('/api/global-discovery/pending', async (req, res) => {
    try {
      const pendingCommunities = await db.select()
        .from(communities)
        .where(
          and(
            eq(communities.enrichmentStatus, 'pending'),
            eq(communities.discoverySource, 'Global Discovery Search')
          )
        )
        .orderBy(communities.discoveryDate);
      
      res.json({
        success: true,
        communities: pendingCommunities,
        count: pendingCommunities.length
      });
    } catch (error) {
      console.error('Error fetching pending communities:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch pending communities' 
      });
    }
  });
  
  // Approve a discovered community
  app.post('/api/global-discovery/approve/:id', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      const [updated] = await db.update(communities)
        .set({
          enrichmentStatus: 'completed',
          isVerified: true,
          data_source: 'Verified via Global Discovery',
          enrichmentHistory: sql`array_append(enrichment_history, ${JSON.stringify({
            timestamp: new Date().toISOString(),
            source: 'Admin Approval',
            fieldsUpdated: ['status_approved'],
            approvedBy: (req as any).user?.id || 'admin'
          })}::jsonb)`
        })
        .where(eq(communities.id, communityId))
        .returning();
      
      res.json({
        success: true,
        community: updated,
        message: 'Community approved successfully'
      });
    } catch (error) {
      console.error('Error approving community:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to approve community' 
      });
    }
  });
  
  // Reject a discovered community
  app.post('/api/global-discovery/reject/:id', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      // Delete the rejected community
      await db.delete(communities)
        .where(
          and(
            eq(communities.id, communityId),
            eq(communities.enrichmentStatus, 'pending')
          )
        );
      
      res.json({
        success: true,
        message: 'Community rejected and removed'
      });
    } catch (error) {
      console.error('Error rejecting community:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to reject community' 
      });
    }
  });
  
  console.log('✅ Global Discovery routes initialized');
}