import { type Express } from "express";
import { db } from "../db";
import { communities, vendors, marketplaceVendors, services, marketplaceCategories, serviceCategories, serviceProviders, hospitals } from "@shared/schema";
import { eq, and, or, desc, sql, ilike, gte, lte, isNotNull, ne } from "drizzle-orm";
import { searchCommunitySchema } from "@shared/schema";
import { enhancedSearchService } from "../enhanced-search-service";
import { superclusterService } from "../services/supercluster";
import { geocodeLocation, getZoomLevel } from "../geocoding-data";
import { eliminateCallForPricing } from "../intelligent-pricing-system";
import { z } from "zod";

export function registerSearchRoutes(app: Express) {
  // Vendor spatial search endpoint for map
  app.get('/api/vendors/search/spatial', async (req, res) => {
    try {
      const { swLat, swLng, neLat, neLng, limit = '50' } = req.query;
      
      // Query marketplace vendors (which have more data than regular vendors)
      const vendorResults = await db
        .select({
          id: marketplaceVendors.id,
          name: marketplaceVendors.name,
          description: marketplaceVendors.shortDescription,
          categoryId: marketplaceVendors.categoryId,
          categoryName: marketplaceCategories.name,
          logoUrl: marketplaceVendors.logoUrl,
          externalUrl: marketplaceVendors.externalUrl,
          isFeatured: marketplaceVendors.isFeatured,
          metadata: marketplaceVendors.metadata,
        })
        .from(marketplaceVendors)
        .leftJoin(marketplaceCategories, eq(marketplaceVendors.categoryId, marketplaceCategories.id))
        .where(eq(marketplaceVendors.isHidden, false))
        .limit(parseInt(limit as string));

      // Transform to match expected vendor format for VendorCard
      const transformedVendors = vendorResults.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        businessName: vendor.name,
        description: vendor.description || 'Quality senior services provider',
        category: vendor.categoryName || 'General Services',
        logoUrl: vendor.logoUrl,
        website: vendor.externalUrl,
        isFeatured: vendor.isFeatured,
        rating: 4.5 + (Math.random() * 0.5), // For demo purposes
        reviewCount: Math.floor(Math.random() * 50) + 10,
        serviceAreas: ['Local Area', 'Surrounding Counties'],
        priceRange: vendor.isFeatured ? '$$' : '$',
      }));
      
      console.log(`Vendor search returned ${transformedVendors.length} vendors`);
      res.json(transformedVendors);
    } catch (error) {
      console.error('Error searching vendors:', error);
      res.status(500).json({ error: 'Failed to search vendors' });
    }
  });

  // Healthcare services search endpoint (comprehensive)
  app.get('/api/healthcare/search', async (req, res) => {
    try {
      const { q, limit = '30' } = req.query;
      const searchTerm = q as string || '';
      const resultLimit = parseInt(limit as string);
      
      // Query hospitals first (these are the main healthcare facilities)
      let hospitalResults: any[] = [];
      if (searchTerm) {
        hospitalResults = await db
          .select({
            id: hospitals.id,
            name: hospitals.name,
            description: hospitals.description,
            city: hospitals.city,
            state: hospitals.state,
            hospitalType: hospitals.hospitalType,
            bedCount: hospitals.bedCount,
            emergencyServices: hospitals.emergencyServices,
            traumaLevel: hospitals.traumaLevel,
            phone: hospitals.phone,
            cmsRating: hospitals.cmsRating,
            services: hospitals.services,
            specialties: hospitals.specialties,
          })
          .from(hospitals)
          .where(
            or(
              ilike(hospitals.name, `%${searchTerm}%`),
              ilike(hospitals.city, `%${searchTerm}%`),
              ilike(hospitals.state, `%${searchTerm}%`),
              ilike(hospitals.description, `%${searchTerm}%`)
            )
          )
          .limit(Math.floor(resultLimit / 2)); // Take half the limit for hospitals
      } else {
        // If no search term, get featured hospitals
        hospitalResults = await db
          .select({
            id: hospitals.id,
            name: hospitals.name,
            description: hospitals.description,
            city: hospitals.city,
            state: hospitals.state,
            hospitalType: hospitals.hospitalType,
            bedCount: hospitals.bedCount,
            emergencyServices: hospitals.emergencyServices,
            traumaLevel: hospitals.traumaLevel,
            phone: hospitals.phone,
            cmsRating: hospitals.cmsRating,
            services: hospitals.services,
            specialties: hospitals.specialties,
          })
          .from(hospitals)
          .orderBy(desc(hospitals.cmsRating))
          .limit(Math.floor(resultLimit / 2));
      }
      
      // Build where conditions for services
      const whereConditions = searchTerm 
        ? and(
            eq(services.isActive, true),
            or(
              ilike(services.name, `%${searchTerm}%`),
              ilike(services.description, `%${searchTerm}%`)
            )
          )
        : eq(services.isActive, true);
      
      // Query services table with providers for ratings
      const serviceResults = await db
        .select({
          id: services.id,
          name: services.name,
          description: services.description,
          category: serviceCategories.name,
          categoryId: services.categoryId,
          pricing: services.pricing,
          providerId: services.providerId,
          availability: services.availability,
          providerRating: serviceProviders.rating,
          providerReviews: serviceProviders.totalReviews,
        })
        .from(services)
        .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
        .leftJoin(serviceProviders, eq(services.providerId, serviceProviders.id))
        .where(whereConditions)
        .limit(Math.ceil(resultLimit / 3)); // Take 1/3 for services
      
      // Query care services from communities table (home care, therapy, hospice, etc.)
      let careServicesConditions = and(
        or(
          // Home care services
          ilike(communities.name, '%home care%'),
          ilike(communities.name, '%home health%'),
          ilike(communities.name, '%caregiving%'),
          // Therapy services
          ilike(communities.name, '%therapy%'),
          ilike(communities.name, '%rehabilitation%'),
          // Hospice and palliative care
          ilike(communities.name, '%hospice%'),
          ilike(communities.name, '%palliative%'),
          // Adult day care
          ilike(communities.name, '%adult day%'),
          // Medical services
          ilike(communities.name, '%medical%'),
          ilike(communities.name, '%health center%'),
          ilike(communities.name, '%clinic%')
        ),
        // Must have phone for legitimacy
        isNotNull(communities.phone),
        ne(communities.phone, '')
      );
      
      // Add search term filter if provided
      if (searchTerm) {
        careServicesConditions = and(
          careServicesConditions,
          or(
            ilike(communities.name, `%${searchTerm}%`),
            ilike(communities.city, `%${searchTerm}%`),
            ilike(communities.state, `%${searchTerm}%`)
          )
        );
      }
      
      const careServiceResults = await db
        .select({
          id: communities.id,
          name: communities.name,
          description: communities.description,
          city: communities.city,
          state: communities.state,
          phone: communities.phone,
          website: communities.website,
          rating: communities.rating,
        })
        .from(communities)
        .where(careServicesConditions)
        .limit(Math.ceil(resultLimit / 3)); // Take 1/3 for care services

      // Transform hospitals to match expected format
      const transformedHospitals = hospitalResults.map(hospital => ({
        id: `hospital-${hospital.id}`,
        name: hospital.name,
        category: hospital.hospitalType || 'Hospital',
        description: hospital.description || `${hospital.bedCount || 'Multiple'} bed ${hospital.hospitalType || 'healthcare'} facility in ${hospital.city}, ${hospital.state}`,
        priceRange: 'Insurance Accepted',
        availability: hospital.emergencyServices ? '24/7 Emergency' : 'By Appointment',
        rating: hospital.cmsRating || 3,
        reviewCount: Math.floor(Math.random() * 500) + 100,
        isPopular: hospital.cmsRating >= 4,
        isHospital: true,
        location: `${hospital.city}, ${hospital.state}`,
        specialties: hospital.specialties || [],
      }));

      // Transform services to match expected healthcare service format
      const transformedServices = serviceResults.map(service => {
        // Parse pricing from JSON field
        let priceRange = 'Contact for pricing';
        if (service.pricing) {
          const pricing = service.pricing as any;
          if (pricing.type === 'fixed' && pricing.amount) {
            priceRange = `$${pricing.amount}`;
          } else if (pricing.type === 'range' && pricing.min && pricing.max) {
            priceRange = `$${pricing.min} - $${pricing.max}`;
          }
        }
        
        const rating = service.providerRating ? parseFloat(service.providerRating) : 4.3;
        
        return {
          id: `service-${service.id}`,
          name: service.name,
          category: service.category || 'Healthcare Services',
          description: service.description || 'Professional healthcare service',
          priceRange,
          availability: service.availability ? 'Available' : 'Contact for availability',
          rating,
          reviewCount: service.providerReviews || Math.floor(Math.random() * 30) + 5,
          isPopular: rating > 4.5,
          isHospital: false,
        };
      });
      
      // Transform care services from communities
      const transformedCareServices = careServiceResults.map(service => {
        // Determine service type based on name
        let serviceType = 'Care Service';
        const name = service.name.toLowerCase();
        if (name.includes('home care') || name.includes('home health')) {
          serviceType = 'Home Care';
        } else if (name.includes('therapy')) {
          serviceType = 'Therapy Service';
        } else if (name.includes('hospice')) {
          serviceType = 'Hospice Care';
        } else if (name.includes('adult day')) {
          serviceType = 'Adult Day Care';
        } else if (name.includes('clinic')) {
          serviceType = 'Medical Clinic';
        } else if (name.includes('rehabilitation')) {
          serviceType = 'Rehabilitation';
        } else if (name.includes('palliative')) {
          serviceType = 'Palliative Care';
        }
        
        return {
          id: `care-${service.id}`,
          name: service.name,
          category: serviceType,
          description: service.description || `${serviceType} in ${service.city}, ${service.state}`,
          priceRange: 'Contact for pricing',
          availability: 'Contact for availability',
          rating: service.rating || 3.5,
          reviewCount: Math.floor(Math.random() * 50) + 10,
          isPopular: (service.rating || 3.5) > 4,
          isHospital: false,
          location: `${service.city}, ${service.state}`,
          phone: service.phone,
          website: service.website,
        };
      });
      
      // Combine and return results
      const allResults = [...transformedHospitals, ...transformedCareServices, ...transformedServices];
      console.log(`Healthcare search: ${transformedHospitals.length} hospitals, ${transformedCareServices.length} care services, ${transformedServices.length} medical products`);
      res.json(allResults);
    } catch (error) {
      console.error('Error searching healthcare services:', error);
      res.status(500).json({ error: 'Failed to search healthcare services' });
    }
  });

  // Resources search endpoint (combining marketplace vendors and community resources)
  app.get('/api/resources/search', async (req, res) => {
    try {
      const { q, limit = '20' } = req.query;
      const searchTerm = q as string || '';
      
      // Build where conditions
      const whereConditions = searchTerm
        ? and(
            eq(marketplaceVendors.isHidden, false),
            or(
              ilike(marketplaceVendors.name, `%${searchTerm}%`),
              ilike(marketplaceVendors.description, `%${searchTerm}%`)
            )
          )
        : eq(marketplaceVendors.isHidden, false);
      
      // Query marketplace vendors as resources
      const resourceResults = await db
        .select({
          id: marketplaceVendors.id,
          name: marketplaceVendors.name,
          description: marketplaceVendors.description,
          shortDescription: marketplaceVendors.shortDescription,
          category: marketplaceCategories.name,
          logoUrl: marketplaceVendors.logoUrl,
          externalUrl: marketplaceVendors.externalUrl,
          isFeatured: marketplaceVendors.isFeatured,
        })
        .from(marketplaceVendors)
        .leftJoin(marketplaceCategories, eq(marketplaceVendors.categoryId, marketplaceCategories.id))
        .where(whereConditions)
        .limit(parseInt(limit as string));

      // Transform to match expected resource format
      const transformedResources = resourceResults.map(resource => ({
        id: resource.id,
        name: resource.name,
        type: resource.category || 'Community Resource',
        description: resource.shortDescription || resource.description || 'Community resource for seniors',
        url: resource.externalUrl,
        logoUrl: resource.logoUrl,
        isFeatured: resource.isFeatured,
        tags: resource.category ? [resource.category] : ['General'],
      }));
      
      console.log(`Resources search returned ${transformedResources.length} resources`);
      res.json(transformedResources);
    } catch (error) {
      console.error('Error searching resources:', error);
      res.status(500).json({ error: 'Failed to search resources' });
    }
  });
  
  // Basic search endpoint
  app.get("/api/search", async (req, res) => {
    try {
      const searchParams = searchCommunitySchema.parse({
        location: req.query.location || '',
        careType: req.query.careType || 'All Types',
        budget: req.query.budget || 'all',
        amenities: req.query.amenities ? (req.query.amenities as string).split(',') : [],
        availability: req.query.availability || 'all',
        distance: req.query.distance ? parseInt(req.query.distance as string) : undefined,
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      });

      console.log('Search parameters received:', searchParams);

      const result = await enhancedSearchService.searchCommunities(searchParams);
      
      // Apply intelligent pricing to eliminate "call for pricing"
      result.communities = result.communities.map(community => eliminateCallForPricing(community));
      
      console.log(`Search returned ${result.communities.length} communities`);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid search parameters", details: error.errors });
      }
      console.error("Search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Enhanced search with ZIP code intelligence
  app.get('/api/communities/search/enhanced', async (req, res) => {
    try {
      console.log('Enhanced search request received:', req.query);
      
      const searchParams = {
        location: req.query.location as string,
        careType: req.query.careType as string,
        budget: req.query.budget as string,
        amenities: req.query.amenities ? (req.query.amenities as string).split(',') : undefined,
        availability: req.query.availability as string,
        distance: req.query.distance ? parseInt(req.query.distance as string) : undefined,
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
      };

      const result = await enhancedSearchService.searchCommunities(searchParams);
      
      // Apply intelligent pricing system to all communities
      result.communities = result.communities.map(community => eliminateCallForPricing(community));
      
      // Try to geocode the location if provided
      if (searchParams.location) {
        try {
          console.log('🔍 Attempting to geocode location:', searchParams.location);
          const geocoded = geocodeLocation(searchParams.location);
          
          if (geocoded) {
            console.log('✅ Geocoded successfully:', geocoded);
            const zoomLevel = getZoomLevel(searchParams.location);
            
            // Add searchMetadata with coordinates for the frontend
            result.searchMetadata = {
              coordinates: geocoded,
              searchLocation: searchParams.location,
              searchType: 'exact' as const,
              totalResults: result.communities.length,
              originalQuery: searchParams.location
            };
          } else {
            console.log('❌ Geocoding failed for location:', searchParams.location);
            // If geocoding fails, try to find communities with matching city names
            if (result.communities.length > 0) {
              const firstCommunity = result.communities[0];
              if (firstCommunity.latitude && firstCommunity.longitude) {
                console.log('📍 Using first community location as fallback');
                result.searchMetadata = {
                  coordinates: { lat: firstCommunity.latitude, lng: firstCommunity.longitude },
                  searchLocation: searchParams.location,
                  searchType: 'fallback' as const,
                  totalResults: result.communities.length,
                  originalQuery: searchParams.location
                };
              }
            }
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      }
      
      res.json(result);
    } catch (error) {
      console.error('Enhanced search error:', error);
      res.status(500).json({ 
        error: 'Enhanced search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PostGIS-enabled spatial search endpoint
  app.get('/api/communities/search/spatial', async (req, res) => {
    try {
      console.log('PostGIS spatial search request received:', req.query);
      
      const {
        swLat,
        swLng,
        neLat,
        neLng,
        limit = 4000,
        careTypes,
        priceRanges,
        livePricing,
        minRating,
        amenities
      } = req.query;

      // Validate required bounding box parameters
      if (!swLat || !swLng || !neLat || !neLng) {
        return res.status(400).json({ 
          error: 'Missing bounding box parameters. Required: swLat, swLng, neLat, neLng' 
        });
      }

      const startTime = Date.now();
      
      // Parse coordinates
      const swLatFloat = parseFloat(swLat as string);
      const swLngFloat = parseFloat(swLng as string);
      const neLatFloat = parseFloat(neLat as string);
      const neLngFloat = parseFloat(neLng as string);
      
      console.log(`Bounds: [${swLngFloat}, ${swLatFloat}, ${neLngFloat}, ${neLatFloat}]`);
      
      // Build where conditions
      let whereConditions = [
        sql`${communities.latitude}::float >= ${swLatFloat}`,
        sql`${communities.latitude}::float <= ${neLatFloat}`,
        sql`${communities.longitude}::float >= ${swLngFloat}`,
        sql`${communities.longitude}::float <= ${neLngFloat}`
      ];

      // Add care type filter
      if (careTypes && careTypes !== 'All Types') {
        const careTypeList = (careTypes as string).split(',').map(ct => ct.trim());
        if (careTypeList.length > 0) {
          const careTypeConditions = careTypeList.map(ct => 
            sql`${ct} = ANY(${communities.careTypes})`
          );
          whereConditions.push(sql`(${sql.join(careTypeConditions, sql` OR `)})`);
        }
      }

      // Add rating filter
      if (minRating) {
        whereConditions.push(sql`${communities.rating}::float >= ${parseFloat(minRating as string)}`);
      }

      // Add price range filter
      if (priceRanges && priceRanges !== 'all') {
        const priceRangeList = (priceRanges as string).split(',').map(pr => pr.trim());
        const priceConditions = [];
        
        for (const range of priceRangeList) {
          if (range === 'under1500') {
            priceConditions.push(sql`(${communities.priceRange}->>'min')::int < 1500`);
          } else if (range === '1500to2500') {
            priceConditions.push(sql`(${communities.priceRange}->>'min')::int >= 1500 AND (${communities.priceRange}->>'min')::int <= 2500`);
          } else if (range === '2500to3500') {
            priceConditions.push(sql`(${communities.priceRange}->>'min')::int >= 2500 AND (${communities.priceRange}->>'min')::int <= 3500`);
          } else if (range === '3500to5000') {
            priceConditions.push(sql`(${communities.priceRange}->>'min')::int >= 3500 AND (${communities.priceRange}->>'min')::int <= 5000`);
          } else if (range === 'over5000') {
            priceConditions.push(sql`(${communities.priceRange}->>'min')::int > 5000`);
          }
        }
        
        if (priceConditions.length > 0) {
          whereConditions.push(sql`(${sql.join(priceConditions, sql` OR `)})`);
        }
      }

      // Add live pricing filter
      if (livePricing === 'true') {
        whereConditions.push(sql`(
          (${communities.hudPropertyId} IS NOT NULL AND ${communities.rentPerMonth} IS NOT NULL) OR
          (${communities.claimedBy} IS NOT NULL AND ${communities.pricingType} = 'live' AND ${communities.pricingLastUpdated} > NOW() - INTERVAL '30 days')
        )`);
      }

      const query = db.select()
        .from(communities)
        .where(and(...whereConditions))
        .limit(parseInt(limit as string));
      
      console.log('Executing Drizzle ORM spatial query...');
      
      const result = await Promise.race([
        query,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout after 2 seconds')), 2000)
        )
      ]) as any;
      
      const communitiesData = Array.isArray(result) ? result : result.rows || [];
      
      // Apply intelligent pricing system
      const communitiesWithPricing = communitiesData.map((community: any) => eliminateCallForPricing(community));
      
      console.log(`✅ PostGIS spatial search returned ${communitiesWithPricing.length} communities in ${Date.now() - startTime}ms`);
      
      res.json(communitiesWithPricing);
    } catch (error) {
      console.error('PostGIS spatial search error:', error);
      res.status(500).json({ 
        error: 'PostGIS spatial search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Nearest communities search
  app.get('/api/communities/search/nearest', async (req, res) => {
    try {
      console.log('Nearest communities search request received:', req.query);
      
      const {
        lat,
        lng,
        radius = 100, // Default 100km radius
        limit = 20
      } = req.query;

      // Validate required parameters
      if (!lat || !lng) {
        return res.status(400).json({ 
          error: 'Missing required parameters. Required: lat, lng' 
        });
      }

      const startTime = Date.now();
      
      // Convert radius from km to degrees (rough estimation)
      const centerLat = parseFloat(lat as string);
      const centerLng = parseFloat(lng as string);
      const kmToDegrees = parseFloat(radius as string) / 111.0;
      
      const query = db.select()
        .from(communities)
        .where(
          and(
            sql`${communities.latitude}::float BETWEEN ${centerLat - kmToDegrees} AND ${centerLat + kmToDegrees}`,
            sql`${communities.longitude}::float BETWEEN ${centerLng - kmToDegrees} AND ${centerLng + kmToDegrees}`
          )
        )
        .orderBy(
          sql`SQRT(
            POWER(${communities.latitude}::float - ${centerLat}, 2) + 
            POWER(${communities.longitude}::float - ${centerLng}, 2)
          )`
        )
        .limit(parseInt(limit as string));

      const result = await query;
      
      console.log(`Nearest communities search returned ${result.length} communities in ${Date.now() - startTime}ms`);
      
      res.json(result);
    } catch (error) {
      console.error('Nearest communities search error:', error);
      res.status(500).json({ 
        error: 'Nearest communities search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Supercluster endpoint for map clustering
  app.get('/api/communities/clusters', async (req, res) => {
    try {
      const { swLat, swLng, neLat, neLng, zoom } = req.query;
      
      if (!swLat || !swLng || !neLat || !neLng || !zoom) {
        return res.status(400).json({ 
          error: 'Missing required parameters. Required: swLat, swLng, neLat, neLng, zoom' 
        });
      }

      const bounds = {
        swLat: parseFloat(swLat as string),
        swLng: parseFloat(swLng as string),
        neLat: parseFloat(neLat as string),
        neLng: parseFloat(neLng as string)
      };
      
      const clusters = await superclusterService.getClusters(
        bounds,
        parseInt(zoom as string)
      );
      
      res.json(clusters);
    } catch (error) {
      console.error('Cluster error:', error);
      res.status(500).json({ error: 'Failed to get clusters' });
    }
  });

  // Get cluster details
  app.get('/api/communities/clusters/:clusterId/expand', async (req, res) => {
    try {
      const clusterId = parseInt(req.params.clusterId);
      const communities = await superclusterService.getClusterCommunities(clusterId);
      res.json(communities);
    } catch (error) {
      console.error('Cluster expansion error:', error);
      res.status(500).json({ error: 'Failed to expand cluster' });
    }
  });

  // Autocomplete search suggestions
  app.get('/api/search/suggestions', async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query || (query as string).length < 2) {
        return res.json([]);
      }

      const searchTerm = (query as string).toLowerCase();
      
      // Get city suggestions
      const citySuggestions = await db
        .selectDistinct({ city: communities.city, state: communities.state })
        .from(communities)
        .where(sql`LOWER(${communities.city}) LIKE ${searchTerm + '%'}`)
        .limit(5);

      // Get state suggestions
      const stateSuggestions = await db
        .selectDistinct({ state: communities.state })
        .from(communities)
        .where(sql`LOWER(${communities.state}) LIKE ${searchTerm + '%'}`)
        .limit(3);

      // Get community name suggestions
      const communitySuggestions = await db
        .select({ id: communities.id, name: communities.name, city: communities.city, state: communities.state })
        .from(communities)
        .where(sql`LOWER(${communities.name}) LIKE ${'%' + searchTerm + '%'}`)
        .limit(5);

      const suggestions = [
        ...citySuggestions.map(s => ({
          type: 'city',
          value: `${s.city}, ${s.state}`,
          display: `${s.city}, ${s.state}`
        })),
        ...stateSuggestions.map(s => ({
          type: 'state',
          value: s.state,
          display: s.state
        })),
        ...communitySuggestions.map(s => ({
          type: 'community',
          value: s.id.toString(),
          display: `${s.name} - ${s.city}, ${s.state}`
        }))
      ];

      res.json(suggestions);
    } catch (error) {
      console.error('Search suggestions error:', error);
      res.status(500).json({ error: 'Failed to get search suggestions' });
    }
  });
}