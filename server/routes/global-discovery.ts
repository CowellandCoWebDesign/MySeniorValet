import { Express } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, and, isNull, or, like, sql } from 'drizzle-orm';

// Schema for global discovery search
const globalSearchSchema = z.object({
  query: z.string(),
  searchType: z.enum(['location', 'service', 'services', 'community']).optional(),
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

// Import multi-AI orchestrator for comparisons
import { MultiAIOrchestrator } from '../services/multi-ai-orchestrator';

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
      
      // Construct an intelligent search query for Perplexity - optimized for city/region searches
      let searchQuery = '';
      // Detect if query includes city/country format (e.g., "Brisbane, Australia")
      const isSpecificCitySearch = query.includes(',') || query.match(/\b(city|town|suburb|district)\b/i);
      
      if (searchType === 'services') {
        // For services, discover ANY type of service providers - not limited to senior care
        searchQuery = `Find ALL types of service providers and businesses in ${query}. This includes restaurants, law firms, tech companies, retail stores, fitness centers, beauty salons, medical practices, financial services, education centers, entertainment venues, transportation services, and ANY other business or service provider. Include ONLY real, operational businesses physically located in ${query}. Provide exact business names, complete street addresses, phone numbers, websites, and descriptions of their services. Do not limit to senior care - include ALL types of businesses and services.`;
      } else if (searchType === 'location' || locationSearch || isSpecificCitySearch) {
        searchQuery = `Find ALL senior living communities, assisted living facilities, nursing homes, memory care centers, and retirement communities in ${query}. Include ONLY real, operational facilities physically located in ${query}. Provide exact facility names, complete street addresses with street numbers, phone numbers, websites, and descriptions of their services. Focus on facilities that families can actually visit and tour.`;
      } else if (searchType === 'service') {
        // Legacy service type for backward compatibility
        searchQuery = `Find senior care services and providers offering ${query}. Include company names, locations, contact information, and service descriptions.`;
      } else {
        searchQuery = `Find information about ${query} related to senior living, assisted living, or elder care. Include facility names, locations, and contact details if available.`;
      }
      
      console.log(`🔍 Perplexity Query: ${searchQuery}`);
      
      // Call Perplexity API with STRUCTURED JSON OUTPUT
      const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'You are a senior care research assistant. Return ONLY facilities from the requested location with accurate information.'
            },
            {
              role: 'user',
              content: searchQuery + ' Provide the response as structured JSON data.'
            }
          ],
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
                        description: { type: 'string' },
                        careTypes: {
                          type: 'array',
                          items: { type: 'string' }
                        }
                      },
                      required: ['name', 'city', 'country']
                    }
                  },
                  totalFound: { type: 'number' },
                  searchLocation: { type: 'string' }
                },
                required: ['facilities']
              }
            }
          },
          temperature: 0.2,
          max_tokens: 2000,
          top_p: 0.9,
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
      
      // Step 3: Parse the structured JSON response
      let discoveredCommunities = [];
      
      try {
        // Parse the structured JSON response from Perplexity
        const structuredData = JSON.parse(aiResponse);
        
        if (structuredData.facilities && Array.isArray(structuredData.facilities)) {
          discoveredCommunities = structuredData.facilities.map(facility => ({
            name: facility.name,
            address: facility.address || '',
            city: facility.city || '',
            state: facility.state || '',
            country: facility.country || '',
            phone: facility.phone || '',
            website: facility.website || '',
            description: facility.description || `Senior living facility in ${facility.city}, ${facility.country}`,
            careTypes: facility.careTypes || [],
            source: 'Perplexity AI Discovery',
            confidence: 95,
            isDiscovered: true
          }));
          console.log(`✅ Successfully parsed ${discoveredCommunities.length} facilities from structured JSON`);
        }
      } catch (parseError) {
        console.error('⚠️ Error parsing structured JSON:', parseError);
        console.log('Attempting fallback parsing for markdown response...');
        
        // Fallback: Extract facilities from markdown format
        try {
          const facilityMatches = aiResponse.matchAll(/\*\*([^\*]+)\*\*[\s\S]*?(?:Address|Location)?:?\s*([^\n]+)?/gi);
          for (const match of facilityMatches) {
            const name = match[1].trim();
            const location = match[2] ? match[2].trim() : '';
            if (name && name.length > 5 && !name.includes('?')) {
              discoveredCommunities.push({
                name: name,
                address: location,
                description: `Found via search for "${query}"`,
                source: 'Perplexity Web Search',
                confidence: 85,
                isDiscovered: true
              });
            }
          }
          console.log(`✅ Fallback parsing extracted ${discoveredCommunities.length} facilities`);
        } catch (fallbackError) {
          console.error('❌ Fallback parsing also failed:', fallbackError);
        }
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
                
                // Auto-approve discovered communities
                discoverySource: 'Global Discovery Search',
                discoveryDate: new Date(),
                enrichmentStatus: 'completed', // Auto-approved (using valid enum value)
                enrichmentHistory: [{
                  timestamp: new Date().toISOString(),
                  source: 'Perplexity Global Search',
                  fieldsUpdated: ['initial_discovery'],
                  autoApproved: true
                }],
                data_source: 'AI Discovery',
                isVerified: true, // Immediately verified and active
              })
              .returning();
            
            console.log(`💾 Saved new discovered community: ${discovered.name} (ID: ${newCommunity.id})`);
            savedCommunities.push(newCommunity);
          }
        } catch (saveError) {
          console.error(`⚠️ Error saving discovered community ${discovered.name}:`, saveError);
        }
      }
      
      // Step 5: Format discovered communities for immediate display (don't wait for DB save)
      const formattedDiscoveries = discoveredCommunities.map((community, index) => {
        // Generate a unique temporary ID if not saved yet
        const tempId = `discovered_${Date.now()}_${index}`;
        const slug = community.name
          ? community.name.toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '') + '-' + tempId.substr(-8)
          : tempId;
        
        return {
          id: tempId,
          slug: slug, // Required for navigation to community details
          name: community.name,
          address: community.address || '',
          city: community.city || '',
          state: community.state || '',
          country: community.country || '',
          zipCode: community.zipCode || '00000',
          phone: community.phone || '',
          website: community.website || '',
          description: community.description || '',
          careTypes: community.careTypes || [],
          data_source: 'AI Discovery',
          isDiscovered: true,
          confidence: community.confidence || 90,
          verificationStatus: 'verified', // Auto-approved
          citations: citations, // Include Perplexity citations
          // Add fields needed for community details view
          photos: [],
          amenities: [],
          pricing: null,
          capacity: null,
          yearFounded: null,
          certifications: [],
          specialties: community.careTypes || []
        };
      });
      
      // Step 6: Combine results - prioritize discovered facilities over database results
      const allResults = [
        ...formattedDiscoveries, // Show discovered results FIRST
        ...existingCommunities.map(c => ({ ...c, isExisting: true })),
        ...savedCommunities.map(c => ({ ...c, isDiscovered: true, needsApproval: true }))
      ];
      
      // Step 7: Return results with metadata
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
            model: 'sonar-pro',
            messages: [
              { role: 'system', content: 'List senior living facilities with accurate details.' },
              { role: 'user', content: perplexityQuery }
            ],
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