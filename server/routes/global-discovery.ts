import { Express } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, and, isNull, or, like, sql } from 'drizzle-orm';

// Schema for global discovery search
const globalSearchSchema = z.object({
  query: z.string(),
  searchType: z.enum(['location', 'service', 'services', 'community']).optional(),
  limit: z.number().min(1).max(100).default(30)
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

// Import multi-AI orchestrator for comparisons
// import { MultiAIOrchestrator } from '../services/multi-ai-orchestrator';

export function setupGlobalDiscoveryRoutes(app: Express) {
  
  // Global discovery search endpoint
  app.post('/api/global-discovery/search', async (req, res) => {
    // Declare variables outside try block to avoid scope issues
    let existingCommunities: any[] = [];
    let query = '';
    let searchType: string | undefined = undefined;
    let limit = 30;
    
    try {
      const parsed = globalSearchSchema.parse(req.body);
      query = parsed.query;
      searchType = parsed.searchType;
      limit = parsed.limit;
      
      console.log(`🌍 Global Discovery Search: "${query}" (type: ${searchType || 'auto-detect'})`);
      
      // Step 1: PRIORITIZE DATABASE SEARCH - We have 33k+ communities!
      // Skip database search for services - we're looking for commercial services, not communities
      if (searchType !== 'services') {
        // Parse location from query (e.g., "Dallas, Texas" -> city: Dallas, state: Texas)
        const queryParts = query.split(',').map(p => p.trim());
        const citySearch = queryParts[0] || query;
        const stateSearch = queryParts[1] || '';
        
        // First try exact city match
        existingCommunities = await db.select()
          .from(communities)
          .where(
            and(
              sql`LOWER(${communities.city}) = ${citySearch.toLowerCase()}`,
              stateSearch ? sql`LOWER(${communities.state}) LIKE ${stateSearch.toLowerCase() + '%'}` : sql`true`,
              eq(communities.isVerified, true) // Only return verified communities
            )
          )
          .limit(50); // Get more results from database
      }
      
      // If not enough results, broaden search (skip for services)
      if (searchType !== 'services' && existingCommunities.length < 15) {
        const searchTerms = query.toLowerCase().split(' ').filter(term => 
          term.length > 2 && !['for', 'in', 'at', 'the', 'senior', 'living', 'care'].includes(term)
        );
        
        const additionalResults = await db.select()
          .from(communities)
          .where(
            and(
              or(
                ...searchTerms.map(term => 
                  or(
                    sql`LOWER(${communities.city}) LIKE ${'%' + term + '%'}`,
                    sql`LOWER(${communities.state}) LIKE ${'%' + term + '%'}`,
                    sql`LOWER(${communities.name}) LIKE ${'%' + term + '%'}`
                  )
                )
              ),
              eq(communities.isVerified, true)
            )
          )
          .limit(50 - existingCommunities.length);
        
        // Combine and deduplicate
        const existingIds = new Set(existingCommunities.map(c => c.id));
        additionalResults.forEach(result => {
          if (!existingIds.has(result.id)) {
            existingCommunities.push(result);
          }
        });
      }
      
      console.log(`💾 Found ${existingCommunities.length} existing communities in database`);
      
      // Check if we're in Discovery Mode or searching for services
      const isDiscoveryMode = req.body.discoveryMode === true;
      
      // If NOT in Discovery Mode and we have enough database results (skip for services)
      if (!isDiscoveryMode && searchType !== 'services' && existingCommunities.length >= 15) {
        // Mark all database results as existing/verified
        const markedResults = existingCommunities.slice(0, limit).map(community => ({
          ...community,
          isExisting: true,
          isDiscovered: false
        }));
        
        return res.json({
          success: true,
          query: query,
          searchType: searchType || 'database',
          results: markedResults,
          metadata: {
            totalFound: existingCommunities.length,
            existingCount: existingCommunities.length,
            discoveredCount: 0,
            sources: ['Database'],
            searchLocation: query,
            timestamp: new Date().toISOString(),
            aiConfidence: 100,
            dataSource: 'Database (33k+ verified communities)'
          },
          message: `Found ${existingCommunities.length} verified communities in ${query}`
        });
      }
      
      // If NOT in Discovery Mode and we have some database results, return them
      if (!isDiscoveryMode) {
        // Return database results without calling Perplexity
        console.log(`✅ Returning ${existingCommunities.length} database results without Perplexity (Discovery Mode: false)`);
        
        // Mark all database results as existing/verified
        const markedResults = existingCommunities.slice(0, limit || 30).map(community => ({
          ...community,
          isExisting: true,
          isDiscovered: false
        }));
        
        return res.json({
          success: true,
          query: query || '',
          searchType: searchType || 'auto-detected',
          results: markedResults,
          metadata: {
            totalFound: existingCommunities.length,
            existingCount: existingCommunities.length,
            discoveredCount: 0,
            sources: ['Database'],
            searchLocation: query,
            timestamp: new Date().toISOString(),
            aiConfidence: 100,
            dataSource: 'Database (33k+ verified communities)',
            discoveryModeUsed: false
          },
          message: existingCommunities.length === 0 
            ? 'No communities found in database. Use Discovery Mode to search the web.'
            : `Found ${existingCommunities.length} communities in database`
        });
      }
      
      // ============ DISCOVERY MODE ACTIVE ============
      // When Discovery Mode is TRUE, ALWAYS search the web to find ALL options,
      // then compare to database to identify which ones we already have
      
      const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
      if (!perplexityApiKey) {
        console.error('❌ Perplexity API key not configured');
        return res.status(500).json({ error: 'Search service not configured for Discovery Mode' });
      }
      
      console.log(`🔍 Discovery Mode ACTIVE: Always searching web for ALL communities in ${query}, then comparing to database`);
      
      // Construct an intelligent search query for Perplexity - optimized for city/region searches
      let searchQuery = '';
      // Detect if query includes city/country format (e.g., "Brisbane, Australia")
      const isSpecificCitySearch = query.includes(',') || query.match(/\b(city|town|suburb|district)\b/i);
      
      if (searchType === 'services') {
        // For services, discover ANY type of service providers - not limited to senior care
        searchQuery = `Find at least 15-20 different service providers and businesses in ${query}. This includes restaurants, law firms, tech companies, retail stores, fitness centers, beauty salons, medical practices, financial services, education centers, entertainment venues, transportation services, and ANY other business or service provider. Include ONLY real, operational businesses physically located in ${query}. For each business provide: exact business name, complete street address, phone number, website, and description of their services. List as many businesses as possible, minimum 15. Do not limit to senior care - include ALL types of businesses and services.`;
      } else if (searchType === 'location' || isSpecificCitySearch) {
        searchQuery = `Find at least 15-20 senior living communities, assisted living facilities, nursing homes, memory care centers, and retirement communities in ${query}. List ALL facilities you can find, not just a few examples. Include ONLY real, operational facilities physically located in ${query}. For each facility provide: exact facility name, complete street address with street number, phone number, website, and description of their services. Provide comprehensive results - list every facility you know of in this location. Minimum 15 facilities if they exist in this area.`;
      } else if (searchType === 'service') {
        // Legacy service type for backward compatibility
        searchQuery = `Find at least 10-15 senior care services and providers offering ${query}. Include company names, locations, contact information, and service descriptions. List as many providers as possible.`;
      } else {
        searchQuery = `Find at least 10-15 facilities about ${query} related to senior living, assisted living, or elder care. Include facility names, locations, and contact details. Provide comprehensive results.`;
      }
      
      console.log(`🔍 Perplexity Query: ${searchQuery}`);
      
      // Call Perplexity API with STRUCTURED JSON OUTPUT and timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout - increased to allow proper discovery
      
      const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        signal: controller.signal,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar', // Standard model for cost-effective search (same as community details)
          messages: [
            {
              role: 'system',
              content: 'You are a senior care research assistant. Return ONLY facilities from the requested location with accurate information.'
            },
            {
              role: 'user',
              content: searchQuery + ' Provide the response as structured JSON data with ALL facilities found, not just examples. Include every single facility you can find.'
            }
          ],
          web_search_options: {
            search_context_size: 'low' // Use low context to reduce costs
          },
          response_format: {
            type: 'json_schema',
            json_schema: {
              schema: {
                type: 'object',
                properties: {
                  facilities: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        address: { type: 'string' },
                        city: { type: 'string' },
                        state: { type: 'string' },
                        country: { type: 'string' },
                        phone: { type: 'string' },
                        website: { type: 'string' },
                        email: { type: 'string' },
                        description: { type: 'string' },
                        careTypes: {
                          type: 'array',
                          items: { type: 'string' }
                        },
                        zipCode: { type: 'string' }
                      },
                      required: ['name']
                    }
                  },
                  totalFound: { type: 'number' },
                  searchLocation: { type: 'string' }
                },
                required: ['facilities']
              }
            }
          },
          temperature: 0.2, // Lower temperature for more accurate results
          max_tokens: 2000, // Reduce for faster response
          top_p: 0.9,
          stream: false
        })
      }).finally(() => clearTimeout(timeout));
      
      if (!perplexityResponse.ok) {
        console.error('❌ Perplexity API error:', perplexityResponse.status);
        throw new Error('Search service error');
      }
      
      const perplexityData = await perplexityResponse.json();
      const aiResponse = perplexityData.choices[0]?.message?.content || '';
      const citations = perplexityData.citations || [];
      
      console.log(`✅ Perplexity Response Length: ${aiResponse.length} characters`);
      console.log(`📚 Citations: ${citations.length} sources`);
      
      // Step 3: Parse the structured JSON response
      let discoveredCommunities = [];
      
      try {
        // Parse the structured JSON response from Perplexity
        const structuredData = JSON.parse(aiResponse);
        
        if (structuredData.facilities && Array.isArray(structuredData.facilities)) {
          // Filter out any facilities that don't have valid names or are duplicates
          const uniqueFacilities = new Map();
          
          structuredData.facilities.forEach(facility => {
            // Skip if no name or name is too short
            if (!facility.name || facility.name.length < 3) return;
            
            // Use name + city as unique key to avoid exact duplicates
            const key = `${facility.name.toLowerCase()}_${(facility.city || '').toLowerCase()}`;
            
            // Only add if we haven't seen this facility before
            if (!uniqueFacilities.has(key)) {
              uniqueFacilities.set(key, {
                name: facility.name,
                address: facility.address || '',
                city: facility.city || query.split(',')[0]?.trim() || '',
                state: facility.state || query.split(',')[1]?.trim() || '',
                country: facility.country || 'United States',
                phone: facility.phone || '',
                website: facility.website || '',
                email: facility.email || '',
                zipCode: facility.zipCode || '',
                description: facility.description || `Senior living facility in ${facility.city || query}`,
                careTypes: facility.careTypes || [],
                source: 'Perplexity AI Discovery',
                confidence: 95,
                isDiscovered: true
              });
            }
          });
          
          discoveredCommunities = Array.from(uniqueFacilities.values());
          console.log(`✅ Successfully parsed ${discoveredCommunities.length} unique facilities from structured JSON`);
        }
      } catch (parseError) {
        console.error('⚠️ Error parsing structured JSON:', parseError);
        console.log('Attempting fallback parsing for markdown response...');
        
        // Fallback: More comprehensive extraction from markdown format
        try {
          const uniqueFallbackFacilities = new Map();
          
          // Try multiple patterns to extract facility information
          const patterns = [
            /\*\*([^\*]+)\*\*[\s\S]*?(?:Address|Location)?:?\s*([^\n]+)?/gi,
            /\d+\.\s+([^\n]+)[\s\S]*?(?:Address|Location)?:?\s*([^\n]+)?/gi,
            /^-\s+([^\n]+)[\s\S]*?(?:Address|Location)?:?\s*([^\n]+)?/gim,
            /(?:Name|Facility):\s*([^\n]+)[\s\S]*?(?:Address|Location)?:?\s*([^\n]+)?/gi
          ];
          
          for (const pattern of patterns) {
            const matches = aiResponse.matchAll(pattern);
            for (const match of matches) {
              const name = match[1]?.trim();
              const location = match[2]?.trim() || '';
              
              // Validate the name
              if (name && name.length > 5 && !name.includes('?') && !name.includes('example')) {
                const key = name.toLowerCase();
                if (!uniqueFallbackFacilities.has(key)) {
                  uniqueFallbackFacilities.set(key, {
                    name: name,
                    address: location,
                    city: query.split(',')[0]?.trim() || '',
                    state: query.split(',')[1]?.trim() || '',
                    country: 'United States',
                    description: `Found via search for "${query}"`,
                    source: 'Perplexity Web Search',
                    confidence: 85,
                    isDiscovered: true
                  });
                }
              }
            }
          }
          
          const fallbackResults = Array.from(uniqueFallbackFacilities.values());
          if (fallbackResults.length > 0) {
            discoveredCommunities = fallbackResults;
            console.log(`✅ Fallback parsing extracted ${discoveredCommunities.length} unique facilities`);
          }
        } catch (fallbackError) {
          console.error('❌ Fallback parsing also failed:', fallbackError);
        }
      }
      
      // Step 4: Save discovered communities to database (skip saving for services)
      const savedCommunities = [];
      // Only save communities, not services
      if (searchType !== 'services') {
        for (const discovered of discoveredCommunities) {
        try {
          // Check if we already have this community - use more flexible matching
          const nameParts = discovered.name.toLowerCase().split(/\s+/);
          const mainNamePart = nameParts.filter(p => p.length > 3)[0] || nameParts[0];
          
          const existing = await db.select()
            .from(communities)
            .where(
              and(
                sql`LOWER(${communities.name}) LIKE ${'%' + mainNamePart + '%'}`,
                discovered.city ? 
                  sql`LOWER(${communities.city}) = ${discovered.city.toLowerCase()}` : 
                  sql`true`
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
                
                // Store as pending for verification - DO NOT auto-approve
                discoverySource: 'Global Discovery Search',
                discoveryDate: new Date(),
                enrichmentStatus: 'pending', // Requires verification
                enrichmentHistory: [{
                  timestamp: new Date().toISOString(),
                  source: 'Perplexity Global Search',
                  fieldsUpdated: ['initial_discovery'],
                  autoApproved: false
                }],
                data_source: 'AI Discovery (Pending Verification)',
                isVerified: false, // Requires verification before becoming active
              })
              .returning();
            
            console.log(`💾 Saved new discovered community: ${discovered.name} (ID: ${newCommunity.id})`);
            savedCommunities.push(newCommunity);
          }
        } catch (saveError) {
          console.error(`⚠️ Error saving discovered community ${discovered.name}:`, saveError);
        }
      }
      } // End of if (searchType !== 'services')
      
      // Step 5: Map saved communities to have all the display fields needed (or use raw services)
      let discoveredWithRealIds: any[] = [];
      
      if (searchType === 'services') {
        // For services, format the discovered items as services
        discoveredWithRealIds = discoveredCommunities.map((service, index) => ({
          id: `service-${Date.now()}-${index}`, // Temporary ID for services
          name: service.name,
          type: 'service',
          serviceType: service.serviceType || 'General Service',
          address: service.address || service.location || '',
          city: service.city || query.split(',')[0] || '',
          state: service.state || query.split(',')[1]?.trim() || '',
          phone: service.phone || '',
          website: service.website || '',
          description: service.description || '',
          isDiscovered: true,
          isService: true,
          confidence: service.confidence || 90,
          data_source: 'Web Discovery',
          citations: citations
        }));
      } else {
        // For communities, map saved communities
        discoveredWithRealIds = savedCommunities.map((saved) => {
        // Find the original discovered data to get additional fields
        const originalData = discoveredCommunities.find(d => 
          d.name === saved.name || 
          (d.name && saved.name && d.name.toLowerCase().includes(saved.name.toLowerCase()))
        );
        
        return {
          id: saved.id, // Use the REAL database ID
          slug: saved.slug || `${saved.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${saved.id}`,
          name: saved.name,
          address: saved.address || originalData?.address || '',
          city: saved.city || '',
          state: saved.state || '',
          country: saved.country || '',
          zipCode: saved.zipCode || '00000',
          phone: saved.phone || originalData?.phone || '',
          website: saved.website || originalData?.website || '',
          description: saved.description || originalData?.description || '',
          careTypes: saved.careTypes || originalData?.careTypes || [],
          data_source: 'AI Discovery',
          isDiscovered: true,
          confidence: originalData?.confidence || 90,
          verificationStatus: 'pending', // Requires verification
          citations: citations, // Include Perplexity citations
          // Add fields needed for community details view
          photos: saved.photos || [],
          amenities: saved.amenities || [],
          pricing: saved.pricing,
          capacity: saved.capacity,
          yearFounded: saved.yearFounded,
          certifications: saved.certifications || [],
          specialties: saved.careTypes || []
        };
      });
      }
      
      // Step 6: Compare web results to database to identify which are existing vs new
      // This is the KEY LOGIC for Discovery Mode
      const allWebResults: any[] = [];
      const dbIndex = new Map();
      
      // Create a normalized index of database communities for matching
      existingCommunities.forEach(community => {
        // Normalize name for matching (remove common suffixes, lowercase, trim)
        const normalizedName = community.name
          .toLowerCase()
          .replace(/\s*(senior living|assisted living|memory care|llc|inc|corp).*$/i, '')
          .replace(/[^\w\s]/g, '')
          .trim();
        const key = `${normalizedName}_${(community.city || '').toLowerCase().trim()}`;
        dbIndex.set(key, community);
      });
      
      // Process all web-discovered communities
      discoveredWithRealIds.forEach(webCommunity => {
        // Normalize the web result name for matching
        const normalizedName = webCommunity.name
          .toLowerCase()
          .replace(/\s*(senior living|assisted living|memory care|llc|inc|corp).*$/i, '')
          .replace(/[^\w\s]/g, '')
          .trim();
        const key = `${normalizedName}_${(webCommunity.city || '').toLowerCase().trim()}`;
        
        // Check if this web result matches a database entry
        const dbMatch = dbIndex.get(key);
        
        if (dbMatch) {
          // This web result IS in our database - mark as existing/verified
          allWebResults.push({
            ...dbMatch,
            isExisting: true,
            isDiscovered: false,
            webData: webCommunity // Keep web data for reference
          });
        } else {
          // This web result is NOT in our database - mark as newly discovered
          allWebResults.push({
            ...webCommunity,
            isExisting: false,
            isDiscovered: true
          });
        }
      });
      
      const allResults = allWebResults;
      
      // Step 7: Return results with metadata
      // Count how many web results were existing vs new
      const existingInWebResults = allResults.filter(r => r.isExisting).length;
      const newlyDiscovered = allResults.filter(r => r.isDiscovered).length;
      
      res.json({
        success: true,
        query: query,
        searchType: searchType || 'auto-detected',
        results: allResults.slice(0, limit),
        metadata: {
          totalFound: allResults.length,
          existingCount: existingInWebResults,
          discoveredCount: newlyDiscovered,
          sources: citations.length > 0 ? [...citations, 'Database'] : ['Perplexity Web Search', 'Database'],
          searchLocation: query,
          timestamp: new Date().toISOString(),
          aiConfidence: discoveredCommunities.length > 0 ? 85 : 50
        },
        message: allResults.length === 0 
          ? `No communities found for "${query}". Try a different location or search term.`
          : `Discovery Mode found ${allResults.length} communities via web search: ${existingInWebResults} already in our database, ${newlyDiscovered} newly discovered`
      });
      
    } catch (error) {
      console.error('❌ Global discovery search error:', error);
      
      // If it's a timeout error, return existing results
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('⏱️ Perplexity API timeout - returning existing results only');
        const { query, searchType, limit } = req.body;
        res.json({
          success: true,
          query: query || '',
          searchType: searchType || 'auto-detected',
          results: existingCommunities.slice(0, limit || 30),
          metadata: {
            totalFound: existingCommunities.length,
            existingCount: existingCommunities.length,
            discoveredCount: 0,
            sources: [],
            searchLocation: query,
            timestamp: new Date().toISOString(),
            aiConfidence: 0,
            note: 'Discovery service timeout - showing existing communities only'
          },
          message: `Found ${existingCommunities.length} existing communities. Discovery service timed out.`
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: 'Failed to perform global search',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
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
  
  // AI Comparison endpoint for global discovery
  app.post('/api/global-discovery/compare', async (req, res) => {
    try {
      const { query } = req.body;
      console.log(`🌍 AI Comparison Search: "${query}"`);
      
      const results = {
        query,
        timestamp: new Date().toISOString(),
        providers: {},
        summary: ''
      };
      
      // Test with Perplexity
      try {
        const perplexityQuery = `Find ONLY senior living communities in ${query}. List actual facility names, addresses, and contact details.`;
        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'sonar', // Standard model for cost-effective search
            messages: [
              { role: 'system', content: 'List senior living facilities with accurate details.' },
              { role: 'user', content: perplexityQuery }
            ],
            web_search_options: {
              search_context_size: 'low' // Use low context to reduce costs
            },
            temperature: 0.1,
            max_tokens: 2000
          })
        });
        const perplexityData = await perplexityResponse.json();
        results.providers['perplexity'] = {
          response: perplexityData.choices[0]?.message?.content?.substring(0, 500),
          sources: perplexityData.citations || []
        };
      } catch (e) {
        results.providers['perplexity'] = { error: 'Failed to query Perplexity' };
      }
      
      // Test with Claude
      if (process.env.ANTHROPIC_API_KEY) {
        try {
          const Anthropic = require('@anthropic-ai/sdk');
          const anthropic = new Anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
          const claudeResponse = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            messages: [{
              role: 'user',
              content: `List real senior living facilities in ${query}. Include actual names and addresses.`
            }]
          });
          results.providers['claude'] = {
            response: claudeResponse.content[0].text?.substring(0, 500)
          };
        } catch (e) {
          results.providers['claude'] = { error: 'Failed to query Claude' };
        }
      }
      
      // Test with ChatGPT
      if (process.env.OPENAI_API_KEY) {
        try {
          const OpenAI = require('openai');
          const openai = new OpenAI.default({ apiKey: process.env.OPENAI_API_KEY });
          const gptResponse = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
              role: 'system',
              content: 'List real senior living facilities with accurate location data.'
            }, {
              role: 'user',
              content: `Find senior living communities in ${query}. List real facility names and addresses.`
            }],
            temperature: 0.1,
            max_tokens: 1000
          });
          results.providers['chatgpt'] = {
            response: gptResponse.choices[0]?.message?.content?.substring(0, 500)
          };
        } catch (e) {
          results.providers['chatgpt'] = { error: 'Failed to query ChatGPT' };
        }
      }
      
      // Summarize findings
      const activeProviders = Object.keys(results.providers).filter(p => !results.providers[p].error);
      results.summary = `Tested ${activeProviders.length} AI providers for "${query}". Active: ${activeProviders.join(', ')}`;
      
      res.json(results);
    } catch (error) {
      console.error('❌ AI comparison error:', error);
      res.status(500).json({ error: 'Comparison failed' });
    }
  });
  
  console.log('✅ Global Discovery routes initialized');
}