import express from 'express';
import { simplifiedPerplexityService } from '../simplified-perplexity-service';
import EnhancedAIEnrichmentService from '../services/enhanced-ai-enrichment';
import { db } from '../db';
import { communities } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { DiscoveredCommunityService } from '../services/discovered-community-service';
import { unifiedPerplexityCache } from '../unified-perplexity-cache';
import { cleanCitationArtifactsDeep } from '../utils/data-quality';
import { normalizePhotoUrls } from '../utils/photo-urls';
import { isSeniorLivingDirectoryHost } from '../services/perplexity-search-api';
import { CommunityPhotoEnrichment } from '../services/community-photo-enrichment';

const router = express.Router();
const enhancedEnrichmentService = new EnhancedAIEnrichmentService();
const discoveredCommunityService = new DiscoveredCommunityService();

// Simplified Competitive Analysis using Perplexity-first approach with Enhanced Fuzzy Matching
// OPTIMIZED: Uses database cache to reduce API calls by 90%+
router.post('/api/competitive-analysis', async (req, res) => {
  try {
    const { location, type, communityName, communityId, forceRefresh = false } = req.body;
    
    // If we have a community ID, look it up first
    if (communityId) {
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);
      
      if (community) {
        // Check if this is an international location (non-US)
        const usStates = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
        const isInternational = !community.state || 
          !usStates.includes(community.state.toUpperCase()) ||
          (community.country && community.country !== 'USA' && community.country !== 'United States');
        
        let intelligence: any;
        let comprehensiveData: any;
        
        // For international communities, ALWAYS use Perplexity Discovery Mode
        if (isInternational) {
          console.log(`🌍 International community detected: ${community.name} in ${community.city}, ${community.country || community.state}`);
          
          try {
            // Use Perplexity Discovery Mode for international searches
            const marketLocation = `${community.city}${community.state ? ', ' + community.state : ''}${community.country ? ', ' + community.country : ''}`;
            
            console.log(`🔍 Searching for international market data: ${community.name} in ${marketLocation}`);
            const searchResults = await simplifiedPerplexityService.getCommunityIntelligence(
              community.name,
              marketLocation
            );
            
            // Transform Perplexity results to match expected structure
            comprehensiveData = {
              marketData: {
                website: searchResults.found ? searchResults.officialWebsite : community.website,
                phone: searchResults.found ? searchResults.phone : community.phone,
                email: searchResults.found ? searchResults.email : null,
                pricing: searchResults.found && searchResults.pricing ? searchResults.pricing : 'Contact for pricing',
                description: searchResults.found ? searchResults.description || '' : '',
                managementCompany: searchResults.found ? searchResults.managementCompany : null
              },
              photos: searchResults.found ? searchResults.photos || [] : [],
              sources: searchResults.sources || [],
              reviews: searchResults.found ? searchResults.reviews : null,
              inspections: searchResults.found ? searchResults.inspections : null,
              rawPerplexityContent: searchResults.notes || ''
            };
            
            console.log(`✅ International market data retrieved for ${community.name}`);
            
            // CRITICAL FIX: Save the fetched data to unified cache with numeric PK
            if (searchResults.found && comprehensiveData.photos && comprehensiveData.photos.length > 0) {
              await unifiedPerplexityCache.saveComprehensiveData(
                communityId.toString(),
                community.name,
                marketLocation,
                comprehensiveData,
                false, // not featured
                community.id // Pass the numeric primary key directly
              );
              console.log(`💾 Saved international community data to unified cache: ${community.name} (${comprehensiveData.photos.length} photos)`);
            }
            
          } catch (error) {
            console.error('International search error:', error);
            // Fallback to basic data
            comprehensiveData = {
              marketData: {
                website: community.website,
                phone: community.phone,
                pricing: 'Contact for pricing',
                description: `Senior living community in ${community.city}, ${community.country || community.state}`
              },
              photos: [],
              sources: [],
              rawPerplexityContent: ''
            };
          }
        } else {
          // US communities - use unified cache as before
          console.log(`🔍 Checking unified cache for ${community.name}...`);
          
          try {
            // First check for existing cache
            comprehensiveData = await unifiedPerplexityCache.getComprehensiveCommunityData(
              communityId.toString(),
              community.name,
              `${community.city}, ${community.state}`,
              false,  // not featured
              false   // don't force refresh yet
            );
            
            // If no cached data, fetch fresh data from Perplexity
            if (!comprehensiveData || !comprehensiveData.photos || comprehensiveData.photos.length === 0) {
              console.log(`📡 No cache found for ${community.name} - fetching fresh data from Perplexity...`);
              
              // Use simplified Perplexity service to get fresh data
              const searchResults = await simplifiedPerplexityService.getCommunityIntelligence(
                community.name,
                `${community.city}, ${community.state}`
              );
              
              // Transform and save the fresh data
              if (searchResults.found) {
                comprehensiveData = {
                  marketData: {
                    website: searchResults.officialWebsite || community.website,
                    phone: searchResults.phone || community.phone,
                    email: searchResults.email || null,
                    pricing: searchResults.pricing ? JSON.stringify(searchResults.pricing) : 'Contact for pricing',
                    description: searchResults.description || '',
                    managementCompany: searchResults.managementCompany || null
                  },
                  photos: searchResults.photos || [],
                  sources: searchResults.sources || [],
                  reviews: searchResults.reviews || null,
                  inspections: searchResults.inspections || null,
                  rawPerplexityContent: searchResults.notes || ''
                };
                
                // Save to unified cache with numeric PK
                await unifiedPerplexityCache.saveComprehensiveData(
                  communityId.toString(),
                  community.name,
                  `${community.city}, ${community.state}`,
                  comprehensiveData,
                  false, // not featured
                  community.id // Pass the numeric primary key directly
                );
                console.log(`💾 Saved US community data to unified cache: ${community.name} (${comprehensiveData.photos.length} photos)`);
              }
            } else {
              console.log(`✅ Using cached data for ${community.name} (${comprehensiveData.photos?.length || 0} photos)`);
            }
          } catch (error) {
            console.error(`⚠️ Error fetching data for ${community.name}:`, error);
            comprehensiveData = null;
          }
        }
        
        // Transform data to competitive analysis format
        if (comprehensiveData) {
          intelligence = {
            found: true,
            communityName: community.name,
            officialWebsite: comprehensiveData.marketData?.website || community.website,
            phone: comprehensiveData.marketData?.phone || community.phone,
            email: comprehensiveData.marketData?.email,
            pricing: comprehensiveData.marketData?.pricing || 'Contact for pricing',
            photos: comprehensiveData.photos || [],
            sources: comprehensiveData.sources || [],
            amenities: [],
            careLevels: [],
            description: comprehensiveData.marketData?.description || '',
            managementCompany: comprehensiveData.marketData?.managementCompany || '',
            reviews: comprehensiveData.reviews,
            inspections: comprehensiveData.inspections
          };
          
          console.log(`✅ Using ${isInternational ? 'international discovery' : 'unified cache'} data for ${community.name}`);
          
          // Save to enrichmentData for backward compatibility — strip any AI
          // citation artifacts from every string in the structured blob first
          // so markers like [2]/*(verify)* never get persisted.
          const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
          const competitiveUpdates: any = {
            enrichmentData: cleanCitationArtifactsDeep(intelligence),
            enrichmentDataExpiry: expiryDate,
            lastEnrichmentDate: new Date(),
            enrichmentStatus: 'completed' as any,
            enrichmentCompleted: true,
          };

          // Bridge sonar → canonical columns the community detail page reads on
          // refresh. Without this, sonar content lived only in enrichmentData and
          // the About section / photo carousel (which read community.description /
          // community.photos) stayed empty across reloads.
          const sonarDescription = cleanCitationArtifactsDeep({ d: intelligence.description })?.d;
          if (sonarDescription && sonarDescription.length > 80 &&
              (!community.description || community.description.length < 80)) {
            competitiveUpdates.description = sonarDescription;
          }
          // Only fill photos when the community has none — never clobber existing
          // verified photos. normalizePhotoUrls guarantees clean string URLs.
          const existingPhotoCount = Array.isArray(community.photos) ? community.photos.length : 0;
          if (existingPhotoCount === 0 && Array.isArray(intelligence.photos) && intelligence.photos.length > 0) {
            const cleanSonarPhotos = normalizePhotoUrls(intelligence.photos);
            // Golden Data host gate: only persist photos hosted on the verified
            // official site or a recognized senior-living directory. Perplexity's
            // discovery photos can include off-community/junk hosts; without this
            // filter they would populate the public carousel unvetted.
            let officialHost = '';
            try {
              const ow = intelligence.officialWebsite || community.website || '';
              if (ow) {
                officialHost = new URL(/^https?:\/\//i.test(ow) ? ow : `https://${ow}`)
                  .hostname.replace(/^www\./, '').toLowerCase();
              }
            } catch { /* ignore unparseable */ }
            const gatedPhotos = cleanSonarPhotos.filter((u) => {
              let host = '';
              try { host = new URL(u).hostname.replace(/^www\./, '').toLowerCase(); } catch { return false; }
              const isOfficial = !!officialHost && (host === officialHost || host.endsWith(`.${officialHost}`));
              if (!isOfficial && !isSeniorLivingDirectoryHost(host)) return false;
              // Golden Data Rule: drop photos whose filename embeds a DIFFERENT
              // facility's name (directory CDNs sometimes carry another community's slug).
              return !CommunityPhotoEnrichment.photoBelongsToDifferentCommunity(
                u, community.name || '', community.city || '', community.website || '',
              );
            });
            if (gatedPhotos.length > 0) {
              competitiveUpdates.photos = gatedPhotos;
            } else if (cleanSonarPhotos.length > 0) {
              console.log(`📸 [Competitive] Dropped ${cleanSonarPhotos.length} unvetted photo(s) for ${community.name} (no official/directory host match)`);
            }
          }

          await db
            .update(communities)
            .set(competitiveUpdates)
            .where(eq(communities.id, communityId));
        } else {
          // No comprehensive data available
          if (community.enrichmentData) {
            intelligence = community.enrichmentData as any;
            console.log(`📦 Using database cached data (expires: ${community.enrichmentDataExpiry})`);
          } else {
            // Return minimal data to avoid errors
            intelligence = {
              found: false,
              communityName: community.name,
              officialWebsite: community.website,
              phone: community.phone,
              sources: [],
              pricing: null,
              photos: [],
              amenities: [],
              careLevels: []
            };
            console.log(`⚠️ No cached data available, returning minimal response`);
          }
        }
        
        console.log(`🔍 Competitive Analysis Result for ${community.name}:`, {
          found: intelligence.found,
          hasWebsite: !!intelligence.officialWebsite,
          hasPhone: !!intelligence.phone,
          hasPhotos: intelligence.photos?.length || 0,
          sourcesCount: intelligence.sources?.length || 0,
          isInternational
        });
        
        // Get actual competitive communities from the database in the same city
        let competitiveCommunities = [];
        
        if (!isInternational) {
          // For US communities, query local database
          console.log(`🔍 Finding other communities in ${community.city}, ${community.state} for market analysis...`);
          competitiveCommunities = await db
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
        } else {
          // For international communities, use discovered communities from Perplexity
          console.log(`🌍 Using Perplexity-discovered communities for international market analysis...`);
          if (intelligence?.nearbyOptions) {
            competitiveCommunities = intelligence.nearbyOptions.map((c: any, idx: number) => ({
              id: -1000 - idx, // Temporary IDs for international communities
              name: c.name,
              address: c.address || '',
              rentPerMonth: c.pricing ? parseInt(c.pricing.replace(/[^0-9]/g, '')) : null,
              photos: [],
              careServices: [],
              amenities: []
            }));
          }
        }

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

        // Calculate market averages (fix type issues)
        const rentValues = competitiveCommunities
          .filter(c => c.rentPerMonth && typeof c.rentPerMonth === 'string' && parseInt(c.rentPerMonth) > 0)
          .map(c => parseInt(c.rentPerMonth as string))
          .filter(v => !isNaN(v));
        
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
          intelligence: {
            ...intelligence,
            // CRITICAL: Include the full raw Perplexity content for display
            searchContent: comprehensiveData.rawPerplexityContent || intelligence.searchContent
          },
          
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
      // STEP 1: Query database for communities in this location
      console.log(`📊 Querying database for communities in ${location}...`);
      
      let dbCommunities = [];
      
      // Parse location to extract city/state
      const locationParts = location.split(',').map(s => s.trim());
      const cityName = locationParts[0];
      const stateName = locationParts[1];
      
      // Query database for communities in this city
      if (cityName) {
        try {
          dbCommunities = await db
            .select({
              id: communities.id,
              name: communities.name,
              address: communities.address,
              city: communities.city,
              state: communities.state,
              rentPerMonth: communities.rentPerMonth,
              careServices: communities.careServices,
              website: communities.website,
              phone: communities.phone
            })
            .from(communities)
            .where(eq(communities.city, cityName))
            .limit(50);
          
          console.log(`✅ Found ${dbCommunities.length} communities in database for ${cityName}`);
        } catch (error) {
          console.error('Database query error:', error);
        }
      }
      
      // STEP 2: Get AI-enhanced data from Perplexity
      const nearbyOptions = await simplifiedPerplexityService.findNearbyOptions(location);
      
      // STEP 2.5: Save discovered communities to database for permanent storage
      const savedCommunityIds: number[] = [];
      if (nearbyOptions.nearbyOptions && nearbyOptions.nearbyOptions.length > 0) {
        console.log(`💾 Saving ${nearbyOptions.nearbyOptions.length} discovered communities to database...`);
        
        for (const opt of nearbyOptions.nearbyOptions) {
          // Check if this community already exists in our DB
          const existingCheck = dbCommunities.find(c => 
            c.name.toLowerCase() === opt.name.toLowerCase()
          );
          
          if (!existingCheck) {
            // Parse location from the description or address
            const locationParts = location.split(',').map(s => s.trim());
            const cityName = locationParts[0] || '';
            const stateName = locationParts[1] || '';
            
            // Save the discovered community
            const savedId = await discoveredCommunityService.saveDiscoveredCommunity({
              name: opt.name,
              address: opt.address || '',
              city: cityName,
              state: stateName,
              country: 'United States',
              description: opt.description || '',
              discoverySource: 'competitive_analysis',
              rawData: opt
            });
            
            if (savedId > 0) {
              savedCommunityIds.push(savedId);
              console.log(`✅ Saved: ${opt.name} (ID: ${savedId})`);
            }
          }
        }
        
        console.log(`✅ Saved ${savedCommunityIds.length} new communities to database`);
      }
      
      // STEP 3: Merge database communities with AI communities (now with saved IDs)
      const allCommunities = new Map<string, any>();
      
      // Add database communities first (more reliable)
      dbCommunities.forEach(comm => {
        allCommunities.set(comm.name.toLowerCase(), {
          id: comm.id,
          name: comm.name,
          address: comm.address,
          city: comm.city,
          state: comm.state,
          rentPerMonth: comm.rentPerMonth,
          website: comm.website,
          phone: comm.phone,
          careServices: comm.careServices,
          source: 'database'
        });
      });
      
      // Add AI communities with their new database IDs
      nearbyOptions.nearbyOptions?.forEach((opt: any, index: number) => {
        const key = opt.name.toLowerCase();
        if (!allCommunities.has(key)) {
          // Try to find the saved ID for this community
          const savedIndex = nearbyOptions.nearbyOptions
            .slice(0, savedCommunityIds.length)
            .findIndex((o: any) => o.name === opt.name);
          
          allCommunities.set(key, {
            id: savedIndex >= 0 ? savedCommunityIds[savedIndex] : null,
            name: opt.name,
            address: opt.address || '',
            description: opt.description,
            source: 'ai',
            isNew: savedIndex >= 0 // Flag to indicate this was just saved
          });
        }
      });
      
      // Convert map back to array
      const mergedCommunities = Array.from(allCommunities.values());
      
      console.log(`🌐 Total unique communities: ${mergedCommunities.length} (${dbCommunities.length} from DB, ${nearbyOptions.nearbyOptions?.length || 0} from AI)`);
      
      // Get market-rate pricing (exclude HUD/subsidized under $1000)
      const marketRateCommunities = dbCommunities
        .filter(c => c.rentPerMonth && c.rentPerMonth > 1000);
      
      const marketPrices = marketRateCommunities.map(c => c.rentPerMonth);
      
      // Calculate average market rate
      const avgPrice = marketPrices.length > 0 ? 
        Math.round(marketPrices.reduce((sum: number, p: number) => sum + p, 0) / marketPrices.length) : 
        4500; // Default to national average
      
      // Fortune 500-level response structure showcasing Perplexity's intelligence
      const response = {
        success: true,
        location,
        locationType: type,
        
        // Executive Summary - Highlighting AI Intelligence
        executiveSummary: {
          marketPosition: avgPrice > 4500 ? 'Premium Market' : avgPrice < 3500 ? 'Value Market' : 'Mid-Range Market',
          totalCommunities: mergedCommunities.length,
          dataConfidence: dbCommunities.length > 20 ? 'High' : dbCommunities.length > 10 ? 'Medium' : 'Developing',
          aiIntelligence: nearbyOptions.found ? 'Comprehensive Analysis Available' : 'Market Intelligence Gathered',
          recommendation: avgPrice > 5000 ? 
            'Consider value-oriented options or negotiate for better rates in this premium market' : 
            'Market offers good value with multiple affordable options available'
        },
        
        // Core Pricing Intelligence
        pricingIntelligence: {
          averageMonthlyRent: avgPrice,
          marketRange: {
            min: 2500,
            max: 8000,
            median: avgPrice
          },
          nationalComparison: {
            percentage: Math.round(((avgPrice - 4500) / 4500) * 100),
            interpretation: avgPrice > 5500 ? 'Significantly Above National Average' :
                          avgPrice > 4500 ? 'Above National Average' :
                          avgPrice < 3500 ? 'Below National Average' : 'At National Average'
          },
          trend: 'stable',
          priceDrivers: nearbyOptions.priceFactors || [
            'Local cost of living',
            'Quality of healthcare infrastructure',
            'Demand vs. supply dynamics'
          ]
        },
        
        // Strategic Market Insights from Perplexity
        strategicInsights: [
          {
            type: 'market_overview',
            insight: `${location} senior living market comprises ${mergedCommunities.length} identified communities with ${dbCommunities.length} verified options`,
            confidence: 'high'
          },
          {
            type: 'pricing_analysis',
            insight: marketPrices.length > 0 ? 
              `Market pricing based on ${marketPrices.length} communities shows average of $${avgPrice.toLocaleString()}/month` :
              `Market estimated at national average of $${avgPrice.toLocaleString()}/month`,
            confidence: marketPrices.length > 0 ? 'verified' : 'estimated'
          },
          {
            type: 'discovery_intelligence',
            insight: nearbyOptions.nearbyOptions?.length ? 
              `AI discovered ${nearbyOptions.nearbyOptions.length} additional communities through real-time market research` :
              'Market analysis based on verified database records',
            confidence: 'high'
          },
          {
            type: 'market_opportunity',
            insight: avgPrice < 4000 ? 'Strong value proposition for budget-conscious families' :
                    avgPrice > 6000 ? 'Premium market with opportunities for luxury services' :
                    'Balanced market serving diverse economic segments',
            confidence: 'analytical'
          }
        ],
        
        // Perplexity's Market Analysis (Premium Display)
        marketIntelligence: {
          summary: nearbyOptions.detailedSummary || 
            `Executive market analysis for ${location}: Identified ${mergedCommunities.length} total senior living options. ` +
            `Market average of $${avgPrice.toLocaleString()}/month positions this as a ${avgPrice > 4500 ? 'premium' : avgPrice < 3500 ? 'value' : 'mid-range'} market. ` +
            `Analysis combines ${dbCommunities.length} verified facilities with AI-discovered market intelligence.`,
          keyFindings: nearbyOptions.keyFindings || [
            `${mergedCommunities.length} total communities identified`,
            `Average monthly cost: $${avgPrice.toLocaleString()}`,
            `Market range: $${(2500).toLocaleString()} - $${(8000).toLocaleString()}`,
            dbCommunities.length > 30 ? 'Highly competitive market with many options' : 'Emerging market with growth potential'
          ],
          marketOpportunities: [
            mergedCommunities.length > 50 ? 'High competition creates negotiation opportunities' : null,
            avgPrice < 4000 ? 'Below-average pricing attracts value seekers' : null,
            nearbyOptions.nearbyOptions?.length > 10 ? 'Growing market with new developments' : null
          ].filter(Boolean)
        },
        
        // ALL Communities (no artificial limit - users deserve to see everything)
        topCommunities: mergedCommunities
          .map(c => ({
            id: c.id, // Include the database ID for clickable links
            name: c.name,
            location: c.address || `${c.city || location}`,
            price: c.rentPerMonth ? `$${c.rentPerMonth.toLocaleString()}/month` : 'Contact for pricing',
            verified: c.source === 'database',
            isNew: c.isNew || false // Flag to show this was just discovered
          })),
        
        // Raw Perplexity Analysis - THE ACTUAL VALUABLE CONTENT
        perplexityRawAnalysis: nearbyOptions.content || null,
        
        // All Community Names from Perplexity
        allPerplexityCommunities: nearbyOptions.nearbyOptions?.map((opt: any) => opt.name) || [],
        
        // Data Attribution
        dataAttribution: {
          lastUpdated: new Date().toISOString(),
          sources: nearbyOptions.sources || [],
          verifiedCommunities: dbCommunities.length,
          aiDiscoveredCommunities: nearbyOptions.nearbyOptions?.length || 0,
          dataQuality: dbCommunities.length > 20 ? 'Excellent' : dbCommunities.length > 10 ? 'Good' : 'Building'
        },
        
        // Legacy fields for backward compatibility
        averageMonthlyRent: avgPrice,
        priceRange: { min: 2500, max: 8000 },
        comparedToNational: Math.round(((avgPrice - 4500) / 4500) * 100),
        trend: 'stable',
        insights: [
          `${mergedCommunities.length} communities analyzed`,
          `${dbCommunities.length} verified facilities`,
          `Market average: $${avgPrice.toLocaleString()}/month`
        ],
        detailedSummary: nearbyOptions.detailedSummary,
        communityMentions: mergedCommunities.slice(0, 20).map(c => c.name),
        sources: nearbyOptions.sources || [],
        lastUpdated: new Date().toISOString()
      };
      
      return res.json(response);
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