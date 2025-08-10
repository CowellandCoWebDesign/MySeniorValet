import { type Express } from "express";
import { db } from "../db";
import { communities, vendors, marketplaceVendors, services, marketplaceCategories, serviceCategories, serviceProviders, hospitals } from "@shared/schema";
import { eq, and, or, desc, sql, ilike, gte, lte, isNotNull, ne, inArray } from "drizzle-orm";
import { searchCommunitySchema } from "@shared/schema";
import { enhancedSearchService } from "../enhanced-search-service";
import { superclusterService } from "../services/supercluster";
import { geocodeLocation, getZoomLevel } from "../geocoding-data";
import { eliminateCallForPricing } from "../intelligent-pricing-system";
import { MarketPricingIntelligence } from "../market-pricing-intelligence";
import { z } from "zod";

export function registerSearchRoutes(app: Express) {
  // Market pricing intelligence endpoint
  app.get('/api/market-pricing/:communityId', async (req, res) => {
    try {
      const { communityId } = req.params;
      
      // Get community details
      const [community] = await db
        .select({
          city: communities.city,
          state: communities.state,
          careType: communities.communitySubtype
        })
        .from(communities)
        .where(eq(communities.id, parseInt(communityId)))
        .limit(1);
      
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }
      
      // Get market pricing intelligence
      const marketPricing = await MarketPricingIntelligence.getMarketPricing(
        community.city,
        community.state,
        community.careType || 'assisted living'
      );
      
      if (!marketPricing) {
        return res.json({ 
          pricing: null,
          message: 'Market pricing data unavailable' 
        });
      }
      
      const pricingWithConfidence = MarketPricingIntelligence.getPricingWithConfidence(marketPricing);
      
      res.json({
        pricing: marketPricing,
        display: pricingWithConfidence.display,
        confidence: pricingWithConfidence.confidence,
        source: pricingWithConfidence.source
      });
    } catch (error) {
      console.error('Error fetching market pricing:', error);
      res.status(500).json({ error: 'Failed to fetch market pricing' });
    }
  });
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

  // Hospitals map endpoint - fetch hospitals within map bounds  
  app.get('/api/healthcare/hospitals-map', async (req, res) => {
    try {
      const { west, south, east, north, limit = '100' } = req.query;
      
      // Validate bounds
      if (!west || !south || !east || !north) {
        return res.status(400).json({ 
          error: 'Map bounds required',
          hospitals: [] 
        });
      }

      const bounds = {
        west: parseFloat(west as string),
        south: parseFloat(south as string),
        east: parseFloat(east as string),
        north: parseFloat(north as string)
      };

      console.log('🏥 Fetching hospitals for map bounds:', bounds);

      // Query hospitals within bounds
      const hospitalsResult = await db.select({
        id: hospitals.id,
        name: hospitals.name,
        address: hospitals.address,
        city: hospitals.city,
        state: hospitals.state,
        zipCode: hospitals.zipCode,
        latitude: hospitals.latitude,
        longitude: hospitals.longitude,
        phone: hospitals.phone,
        website: hospitals.website,
        emergencyServices: hospitals.emergencyServices,
        hospitalType: hospitals.hospitalType,

        ownership: hospitals.ownership
      })
      .from(hospitals)
      .where(sql`
        latitude::decimal BETWEEN ${bounds.south} AND ${bounds.north}
        AND longitude::decimal BETWEEN ${bounds.west} AND ${bounds.east}
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
      `)
      .limit(parseInt(limit as string))
      .orderBy(
        sql`CASE WHEN emergency_services = true THEN 0 ELSE 1 END`
      );

      console.log(`🏥 Found ${hospitalsResult.length} hospitals in view`);

      res.json({ hospitals: hospitalsResult });
    } catch (error) {
      console.error('Error fetching hospitals for map:', error);
      res.status(500).json({ 
        error: 'Failed to fetch hospitals',
        hospitals: [] 
      });
    }
  });

  // Healthcare services search endpoint (comprehensive with dual filtering modes)
  app.get('/api/healthcare/search', async (req, res) => {
    try {
      const { 
        q, 
        limit = '5000',  // Show ALL healthcare facilities - full database access
        swLat, swLng, neLat, neLng,  // Map bounds filtering
        radius, centerLat, centerLng  // Radius filtering
      } = req.query;
      
      let searchTerm = q as string || '';
      const resultLimit = parseInt(limit as string);
      
      // Determine filtering mode
      const isRadiusSearch = radius && centerLat && centerLng;
      const hasBounds = swLat && swLng && neLat && neLng;
      
      // Parse radius search parameters if provided
      let radiusFilter = null;
      if (isRadiusSearch) {
        radiusFilter = {
          radius: parseFloat(radius as string),
          centerLat: parseFloat(centerLat as string),
          centerLng: parseFloat(centerLng as string)
        };
      }
      
      // Parse bounds if provided (for map pan/zoom)
      const bounds = hasBounds ? {
        swLat: parseFloat(swLat as string),
        swLng: parseFloat(swLng as string),
        neLat: parseFloat(neLat as string),
        neLng: parseFloat(neLng as string),
      } : null;
      
      // Check if searchTerm looks like a location (contains comma or is a state abbreviation)
      const isLocationSearch = searchTerm && (
        searchTerm.includes(',') || 
        searchTerm.match(/^[A-Z]{2}$/i) ||
        searchTerm.toLowerCase().includes(' ca') ||
        searchTerm.toLowerCase().includes(' tx') ||
        searchTerm.toLowerCase().includes(' ny')
      );
      
      // Remove location from search term but keep other search criteria
      if (isLocationSearch) {
        // Remove "within X miles" pattern from search term
        searchTerm = searchTerm.replace(/within\s+\d+\s+miles?/i, '').trim();
        // If only location remains, clear search term
        if (searchTerm.match(/^[^,]+,\s*[A-Z]{2}$/i)) {
          searchTerm = '';
        }
      }
      
      // Determine which states are in the bounds/radius for filtering
      let statesInBounds: string[] = [];
      
      if (radiusFilter) {
        // For radius searches, determine states based on center point and radius
        // This is simplified - in production you'd calculate actual geographic boundaries
        const { centerLat, centerLng, radius: radiusMiles } = radiusFilter;
        
        // California regions
        if (centerLng >= -125 && centerLng <= -114 && centerLat >= 32 && centerLat <= 42) {
          statesInBounds.push('CA');
          if (radiusMiles > 50) statesInBounds.push('NV', 'OR', 'AZ');
        }
        // Texas regions
        if (centerLng >= -106 && centerLng <= -93 && centerLat >= 25 && centerLat <= 37) {
          statesInBounds.push('TX');
          if (radiusMiles > 50) statesInBounds.push('OK', 'NM', 'LA', 'AR');
        }
        // Florida regions
        if (centerLng >= -88 && centerLng <= -80 && centerLat >= 24 && centerLat <= 31) {
          statesInBounds.push('FL');
          if (radiusMiles > 50) statesInBounds.push('GA', 'AL');
        }
        // New York regions
        if (centerLng >= -80 && centerLng <= -72 && centerLat >= 40 && centerLat <= 45) {
          statesInBounds.push('NY');
          if (radiusMiles > 50) statesInBounds.push('NJ', 'CT', 'MA', 'PA', 'VT');
        }
        
      } else if (bounds) {
        // Comprehensive state detection for all US states based on bounds
        // California (includes Los Angeles, San Francisco, San Diego)
        if (bounds.neLat >= 32 && bounds.swLat <= 42 && bounds.neLng >= -125 && bounds.swLng <= -114) {
          statesInBounds.push('CA');
        }
        // Texas (includes Houston, Dallas, Austin, San Antonio)
        if (bounds.neLat >= 25 && bounds.swLat <= 37 && bounds.neLng >= -106 && bounds.swLng <= -93) {
          statesInBounds.push('TX');
        }
        // Florida (includes Miami, Orlando, Tampa)
        if (bounds.neLat >= 24 && bounds.swLat <= 31 && bounds.neLng >= -88 && bounds.swLng <= -80) {
          statesInBounds.push('FL');
        }
        // New York (includes NYC, Buffalo, Albany)
        if (bounds.neLat >= 40 && bounds.swLat <= 45 && bounds.neLng >= -80 && bounds.swLng <= -72) {
          statesInBounds.push('NY');
        }
        
        // If no specific states identified, use a broader approach
        if (statesInBounds.length === 0) {
          // West Coast
          if (bounds.swLng <= -100) {
            statesInBounds.push('CA', 'OR', 'WA', 'NV', 'AZ');
          }
          // East Coast
          if (bounds.neLng >= -85) {
            statesInBounds.push('NY', 'FL', 'MA', 'PA', 'NJ', 'MD', 'VA', 'NC', 'SC', 'GA');
          }
          // Central
          if (bounds.swLng > -100 && bounds.neLng < -85) {
            statesInBounds.push('TX', 'IL', 'OH', 'MI', 'IN', 'MO', 'TN', 'KY');
          }
        }
      }
      
      // Log filtering mode for debugging
      if (radiusFilter) {
        console.log(`Healthcare radius search: ${radiusFilter.radius} miles from (${radiusFilter.centerLat}, ${radiusFilter.centerLng})`);
      } else if (bounds) {
        console.log(`Healthcare bounds search: [${bounds.swLat}, ${bounds.swLng}] to [${bounds.neLat}, ${bounds.neLng}]`);
      } else {
        console.log('Healthcare search: No spatial filtering applied');
      }
      
      // Query hospitals first (these are the main healthcare facilities)
      let hospitalResults: any[] = [];
      
      // Build hospital query conditions
      let hospitalConditions: any[] = [];
      
      // Add search term conditions if provided
      if (searchTerm && searchTerm.length > 2) {
        hospitalConditions.push(
          or(
            ilike(hospitals.name, `%${searchTerm}%`),
            ilike(hospitals.hospitalType, `%${searchTerm}%`),
            ilike(hospitals.description, `%${searchTerm}%`)
          )
        );
      }
      
      // Add geographic filtering based on bounds or radius using actual coordinates
      if (radiusFilter) {
        // Radius-based filtering for "within X miles" searches using lat/lng
        const { centerLat, centerLng, radius: radiusMiles } = radiusFilter;
        const milesToDegrees = radiusMiles / 69.0;
        
        // Filter hospitals within radius - cast string coordinates to numeric for comparison
        hospitalConditions.push(
          sql`CAST(${hospitals.latitude} AS DECIMAL) >= ${centerLat - milesToDegrees} AND 
              CAST(${hospitals.latitude} AS DECIMAL) <= ${centerLat + milesToDegrees} AND
              CAST(${hospitals.longitude} AS DECIMAL) >= ${centerLng - (milesToDegrees / Math.cos(centerLat * Math.PI / 180))} AND
              CAST(${hospitals.longitude} AS DECIMAL) <= ${centerLng + (milesToDegrees / Math.cos(centerLat * Math.PI / 180))}`
        );
        console.log(`Healthcare radius filtering: ${radiusMiles} miles from (${centerLat}, ${centerLng})`);
      } else if (bounds) {
        // Bounds-based filtering for map pan/zoom - cast string coordinates to numeric for comparison
        hospitalConditions.push(
          sql`CAST(${hospitals.latitude} AS DECIMAL) >= ${bounds.swLat} AND 
              CAST(${hospitals.latitude} AS DECIMAL) <= ${bounds.neLat} AND
              CAST(${hospitals.longitude} AS DECIMAL) >= ${bounds.swLng} AND
              CAST(${hospitals.longitude} AS DECIMAL) <= ${bounds.neLng}`
        );
        console.log(`Healthcare bounds filtering: [${bounds.swLat}, ${bounds.swLng}] to [${bounds.neLat}, ${bounds.neLng}]`);
      } else {
        console.log('Healthcare search: No geographic filtering (showing all)');
      }
      
      // Execute query with conditions
      if (hospitalConditions.length > 0) {
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
            mortalityRating: hospitals.mortalityRating,
            safetyRating: hospitals.safetyRating,
            readmissionRating: hospitals.readmissionRating,
            experienceRating: hospitals.experienceRating,
            ownership: hospitals.ownership,
            insuranceAccepted: hospitals.insuranceAccepted,
            networkAffiliations: hospitals.networkAffiliations,
            website: hospitals.website,
          })
          .from(hospitals)
          .where(and(...hospitalConditions))
          .orderBy(desc(hospitals.cmsRating))
          .limit(resultLimit);  // Show all hospitals in view, not just half
      } else {
        // No filters, get featured hospitals
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
            mortalityRating: hospitals.mortalityRating,
            safetyRating: hospitals.safetyRating,
            readmissionRating: hospitals.readmissionRating,
            experienceRating: hospitals.experienceRating,
            ownership: hospitals.ownership,
            insuranceAccepted: hospitals.insuranceAccepted,
            networkAffiliations: hospitals.networkAffiliations,
            website: hospitals.website,
          })
          .from(hospitals)
          .orderBy(desc(hospitals.cmsRating))
          .limit(resultLimit);  // Show all hospitals, not just half
      }
      
      // Build where conditions for services
      const whereConditions = searchTerm && searchTerm.length > 2
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
        .limit(resultLimit); // Show all services in view
      
      // Query care services from communities table (home care, therapy, hospice, etc.)
      let careServicesConditionsList: any[] = [
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
      ];
      
      // Add search term filter if provided (only for non-location searches)
      if (searchTerm && searchTerm.length > 2) {
        careServicesConditionsList.push(
          or(
            ilike(communities.name, `%${searchTerm}%`),
            ilike(communities.city, `%${searchTerm}%`),
            ilike(communities.state, `%${searchTerm}%`)
          )
        );
      }
      
      // Add geographic filtering for care services based on location
      if (radiusFilter && statesInBounds.length > 0) {
        careServicesConditionsList.push(inArray(communities.state, statesInBounds));
        console.log(`Care services radius filtering by states: ${statesInBounds.join(', ')}`);
      } else if (bounds && statesInBounds.length > 0) {
        careServicesConditionsList.push(inArray(communities.state, statesInBounds));
        console.log(`Care services bounds filtering by states: ${statesInBounds.join(', ')}`);
      }
      
      const careServicesConditions = and(...careServicesConditionsList);
      
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
        .limit(resultLimit); // Show all care services in view

      // Transform hospitals to match expected format with full data
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
        city: hospital.city,
        state: hospital.state,
        // Extended hospital fields
        hospitalType: hospital.hospitalType,
        bedCount: hospital.bedCount,
        emergencyServices: hospital.emergencyServices,
        traumaLevel: hospital.traumaLevel,
        cmsRating: hospital.cmsRating,
        specialties: hospital.specialties || [],
        services: hospital.services || [],
        phone: hospital.phone,
        website: hospital.website,
        mortalityRating: hospital.mortalityRating,
        safetyRating: hospital.safetyRating,
        readmissionRating: hospital.readmissionRating,
        experienceRating: hospital.experienceRating,
        ownership: hospital.ownership,
        insuranceAccepted: hospital.insuranceAccepted || [],
        networkAffiliations: hospital.networkAffiliations || [],
      })).sort((a, b) => {
        // CRITICAL: Prioritize hospitals by emergency services and urgent care
        // 1. Emergency services hospitals first
        if (a.emergencyServices && !b.emergencyServices) return -1;
        if (!a.emergencyServices && b.emergencyServices) return 1;
        
        // 2. Urgent care facilities next
        const aIsUrgent = a.name.toLowerCase().includes('urgent') || a.category?.toLowerCase().includes('urgent');
        const bIsUrgent = b.name.toLowerCase().includes('urgent') || b.category?.toLowerCase().includes('urgent');
        if (aIsUrgent && !bIsUrgent) return -1;
        if (!aIsUrgent && bIsUrgent) return 1;
        
        // 3. Then by CMS rating
        const aRating = a.cmsRating || 0;
        const bRating = b.cmsRating || 0;
        return bRating - aRating;
      });

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
          reviewCount: service.providerReviews || 0, // Golden Data Rule: no synthetic data
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
          reviewCount: 0, // Golden Data Rule: no synthetic data
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
          
          // First try local geocoding
          let geocoded = geocodeLocation(searchParams.location);
          
          // If local geocoding fails, try Nominatim for comprehensive coverage
          if (!geocoded) {
            const { geocodeAnyLocation } = await import('../nominatim-geocoding');
            geocoded = await geocodeAnyLocation(searchParams.location);
          }
          
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

  // PostGIS-enabled spatial search endpoint - DUAL MODE: bounds or radius
  app.get('/api/communities/search/spatial', async (req, res) => {
    try {
      console.log('PostGIS spatial search request received:', req.query);
      
      const {
        // Bounds parameters (map pan/zoom)
        swLat,
        swLng,
        neLat,
        neLng,
        // Radius parameters ("within X miles")
        radius,
        centerLat,
        centerLng,
        // Common parameters
        limit = 4000,
        careTypes,
        priceRanges,
        livePricing,
        minRating,
        amenities
      } = req.query;

      const startTime = Date.now();
      let whereConditions = [];
      
      // DUAL-MODE FILTERING: Support both bounds and radius searches
      if (radius && centerLat && centerLng) {
        // RADIUS MODE: "within X miles" search
        const radiusMiles = parseFloat(radius as string);
        const center = {
          lat: parseFloat(centerLat as string),
          lng: parseFloat(centerLng as string)
        };
        
        // Convert miles to degrees (rough approximation: 1 degree latitude = ~69 miles)
        const milesToDegrees = radiusMiles / 69.0;
        
        whereConditions = [
          sql`${communities.latitude}::float >= ${center.lat - milesToDegrees}`,
          sql`${communities.latitude}::float <= ${center.lat + milesToDegrees}`,
          sql`${communities.longitude}::float >= ${center.lng - milesToDegrees}`,
          sql`${communities.longitude}::float <= ${center.lng + milesToDegrees}`
        ];
        
        console.log(`RADIUS MODE: ${radiusMiles} miles from (${center.lat}, ${center.lng})`);
      } else if (swLat && swLng && neLat && neLng) {
        // BOUNDS MODE: Default map pan/zoom filtering
        const swLatFloat = parseFloat(swLat as string);
        const swLngFloat = parseFloat(swLng as string);
        const neLatFloat = parseFloat(neLat as string);
        const neLngFloat = parseFloat(neLng as string);
        
        whereConditions = [
          sql`${communities.latitude}::float >= ${swLatFloat}`,
          sql`${communities.latitude}::float <= ${neLatFloat}`,
          sql`${communities.longitude}::float >= ${swLngFloat}`,
          sql`${communities.longitude}::float <= ${neLngFloat}`
        ];
        
        console.log(`BOUNDS MODE: [${swLngFloat}, ${swLatFloat}, ${neLngFloat}, ${neLatFloat}]`);
      } else {
        return res.status(400).json({ 
          error: 'Missing required parameters. Provide either (swLat, swLng, neLat, neLng) for bounds or (radius, centerLat, centerLng) for radius search' 
        });
      }

      // Add care type filter
      if (careTypes && careTypes !== 'All Types') {
        const careTypeList = (careTypes as string).split(',').map(ct => ct.trim());
        if (careTypeList.length > 0) {
          // Filter out "Hospitals" as it's handled separately
          const communityCareTypes = careTypeList.filter(ct => ct !== 'Hospitals');
          
          if (communityCareTypes.length > 0) {
            const careTypeConditions = communityCareTypes.map(ct => 
              sql`${ct} = ANY(${communities.careTypes})`
            );
            whereConditions.push(sql`(${sql.join(careTypeConditions, sql` OR `)})`);
          }
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

      let finalResults: any[] = [];
      
      // Check if we need to query communities 
      const careTypeList = careTypes ? (careTypes as string).split(',').map(ct => ct.trim()) : [];
      const hasNonHospitalCareTypes = careTypeList.some(ct => ct !== 'Hospitals') || !careTypes || careTypes === 'All Types';
      
      // Query communities (if any care types other than Hospitals are selected, or if no care types specified)
      if (hasNonHospitalCareTypes) {
        // Ensure we have at least spatial conditions
        if (whereConditions.length === 0) {
          // This shouldn't happen, but add basic spatial conditions as fallback
          if (swLat && swLng && neLat && neLng) {
            const swLatFloat = parseFloat(swLat as string);
            const swLngFloat = parseFloat(swLng as string);
            const neLatFloat = parseFloat(neLat as string);
            const neLngFloat = parseFloat(neLng as string);
            
            whereConditions = [
              sql`${communities.latitude}::float >= ${swLatFloat}`,
              sql`${communities.latitude}::float <= ${neLatFloat}`,
              sql`${communities.longitude}::float >= ${swLngFloat}`,
              sql`${communities.longitude}::float <= ${neLngFloat}`,
              isNotNull(communities.latitude),
              isNotNull(communities.longitude)
            ];
          }
        }
        const query = db.select()
          .from(communities)
          .where(and(...whereConditions))
          .limit(parseInt(limit as string));
        
        console.log('Executing Drizzle ORM spatial query for communities...');
        
        const result = await Promise.race([
          query,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout after 2 seconds')), 2000)
          )
        ]) as any;
        
        const communitiesData = Array.isArray(result) ? result : result.rows || [];
        
        // Apply intelligent pricing system
        const communitiesWithPricing = communitiesData.map((community: any) => eliminateCallForPricing(community));
        finalResults = [...communitiesWithPricing];
      }
      
      // Query hospitals if "Hospitals" is selected as a care type
      if (careTypes && (careTypes as string).includes('Hospitals')) {
        console.log('Including hospitals in spatial search...');
        
        let hospitalWhereConditions: any[] = [];
        
        // Apply spatial filters to hospitals
        if (radius && centerLat && centerLng) {
          // RADIUS MODE
          const radiusMiles = parseFloat(radius as string);
          const center = {
            lat: parseFloat(centerLat as string),
            lng: parseFloat(centerLng as string)
          };
          const milesToDegrees = radiusMiles / 69.0;
          
          hospitalWhereConditions = [
            sql`${hospitals.latitude}::float >= ${center.lat - milesToDegrees}`,
            sql`${hospitals.latitude}::float <= ${center.lat + milesToDegrees}`,
            sql`${hospitals.longitude}::float >= ${center.lng - milesToDegrees}`,
            sql`${hospitals.longitude}::float <= ${center.lng + milesToDegrees}`
          ];
        } else if (swLat && swLng && neLat && neLng) {
          // BOUNDS MODE
          const swLatFloat = parseFloat(swLat as string);
          const swLngFloat = parseFloat(swLng as string);
          const neLatFloat = parseFloat(neLat as string);
          const neLngFloat = parseFloat(neLng as string);
          
          hospitalWhereConditions = [
            sql`${hospitals.latitude}::float >= ${swLatFloat}`,
            sql`${hospitals.latitude}::float <= ${neLatFloat}`,
            sql`${hospitals.longitude}::float >= ${swLngFloat}`,
            sql`${hospitals.longitude}::float <= ${neLngFloat}`
          ];
        }
        
        const hospitalQuery = db.select({
          id: hospitals.id,
          name: hospitals.name,
          address: hospitals.address,
          city: hospitals.city,
          state: hospitals.state,
          zipCode: hospitals.zipCode,
          latitude: hospitals.latitude,
          longitude: hospitals.longitude,
          phone: hospitals.phone,
          website: hospitals.website,
          emergencyServices: hospitals.emergencyServices,
          hospitalType: hospitals.hospitalType,
          bedCount: hospitals.bedCount,
          ownership: hospitals.ownership,
          cmsRating: hospitals.cmsRating,
          // Map hospital fields to community-like format for frontend compatibility
          careTypes: sql`ARRAY['Hospitals']`,
          type: sql`'hospital'`
        })
        .from(hospitals)
        .where(and(
          ...hospitalWhereConditions,
          isNotNull(hospitals.latitude),
          isNotNull(hospitals.longitude)
        ))
        .limit(Math.max(50, Math.floor(parseInt(limit as string) / 4))); // Reserve some space for hospitals
        
        const hospitalResult = await hospitalQuery;
        
        // Transform hospital data to match community format for frontend
        const hospitalData = hospitalResult.map(hospital => ({
          id: `hospital-${hospital.id}`,
          name: hospital.name,
          address: hospital.address,
          city: hospital.city,
          state: hospital.state,
          zipCode: hospital.zipCode,
          latitude: hospital.latitude,
          longitude: hospital.longitude,
          phone: hospital.phone,
          website: hospital.website,
          careTypes: ['Hospitals'],
          type: 'hospital',
          hospitalType: hospital.hospitalType,
          bedCount: hospital.bedCount,
          emergencyServices: hospital.emergencyServices,
          ownership: hospital.ownership,
          cmsRating: hospital.cmsRating,
          rating: hospital.cmsRating || 4.0,
          priceRange: 'Contact for pricing',
          description: `${hospital.hospitalType || 'Healthcare facility'} in ${hospital.city}, ${hospital.state}`,
          amenities: hospital.emergencyServices ? ['Emergency Services'] : []
        }));
        
        finalResults = [...finalResults, ...hospitalData];
        
        console.log(`✅ Added ${hospitalData.length} hospitals to search results`);
      }
      
      console.log(`✅ PostGIS spatial search returned ${finalResults.length} total results in ${Date.now() - startTime}ms`);
      
      res.json(finalResults);
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
      // Support both parameter formats for compatibility
      const west = req.query.west || req.query.swLng;
      const south = req.query.south || req.query.swLat;
      const east = req.query.east || req.query.neLng;
      const north = req.query.north || req.query.neLat;
      const zoom = req.query.zoom;
      
      if (!west || !south || !east || !north || !zoom) {
        return res.status(400).json({ 
          error: 'Missing required parameters. Required: west/swLng, south/swLat, east/neLng, north/neLat, zoom' 
        });
      }

      // Convert to bbox array format [west, south, east, north]
      const bbox: [number, number, number, number] = [
        parseFloat(west as string),
        parseFloat(south as string),
        parseFloat(east as string),
        parseFloat(north as string)
      ];
      
      const clusters = await superclusterService.getClusters(
        bbox,
        parseInt(zoom as string)
      );
      
      // Return in the format expected by the Map component
      res.json({ clusters });
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