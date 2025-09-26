/**
 * Unified search endpoints for different categories
 * Handles: Communities, Services, Healthcare, Resources
 */

import { Router } from 'express';
import { db } from '../db';
import { communities, vendors } from '@shared/schema';
import { sql, like, or, and, eq, desc } from 'drizzle-orm';

const router = Router();

// Vendor/Services search endpoint - Using service_providers table (3,584 providers)
router.post('/api/vendors/search', async (req, res) => {
  try {
    const { query = '', limit = 100, offset = 0 } = req.body;
    const searchTerm = query.toLowerCase().trim();
    
    // Define care-related keywords that indicate user is looking for actual care services
    const careKeywords = [
      'home care', 'homecare', 'in-home care', 'in home care',
      'hospice', 'palliative', 'nursing', 'caregiver', 'caregiving',
      'assisted living', 'memory care', 'dementia', 'alzheimer',
      'senior care', 'elder care', 'elderly care', 'companion care',
      'respite care', 'adult day care', 'rehabilitation', 'therapy',
      'medical equipment', 'mobility aid', 'wheelchair', 'walker',
      'home health', 'health aide', 'personal care', 'daily living'
    ];
    
    // Check if search is for care services
    // Only check for care keywords if there's an actual search term (not empty)
    // And require at least 3 characters to avoid false positives on short queries
    const isSearchingForCareServices = searchTerm.length >= 3 && careKeywords.some(keyword => {
      // Check if the full keyword phrase appears in the search term
      // This avoids false positives like "home" matching "home care"
      return searchTerm.includes(keyword);
    });
    
    const startTime = Date.now();
    
    // Build appropriate WHERE clause based on search type
    let vendorWhereClause;
    if (isSearchingForCareServices) {
      // For care services, be more selective - only match relevant business types
      vendorWhereClause = sql`(
        LOWER(business_type) IN ('home care', 'home health', 'hospice', 'medical equipment', 
          'senior care', 'assisted living', 'nursing', 'therapy', 'rehabilitation',
          'personal care', 'companion care', 'respite care', 'adult day care')
        OR LOWER(business_name) LIKE ${'%' + searchTerm + '%'}
        OR (LOWER(description) LIKE ${'%' + searchTerm + '%'} 
            AND (LOWER(description) LIKE '%care%' OR LOWER(description) LIKE '%health%'
                OR LOWER(description) LIKE '%senior%' OR LOWER(description) LIKE '%medical%'))
      )`;
    } else if (searchTerm) {
      // For non-care searches, use the original broad matching
      vendorWhereClause = sql`(
        LOWER(business_name) LIKE ${'%' + searchTerm + '%'}
        OR LOWER(description) LIKE ${'%' + searchTerm + '%'}
        OR LOWER(business_type) LIKE ${'%' + searchTerm + '%'}
        OR LOWER(business_city) LIKE ${'%' + searchTerm + '%'}
        OR LOWER(business_state) LIKE ${'%' + searchTerm + '%'}
      )`;
    } else {
      vendorWhereClause = sql`true`;
    }
    
    // First try vendors table for featured/verified vendors
    const vendorResults = await db.execute(sql`
      SELECT 
        'vendor' as source_type,
        id, business_name as name, business_type, description, short_description,
        primary_contact_email as email, primary_contact_phone as phone, 
        business_city as city, business_state as state,
        website, logo_url, service_areas, subscription_tier, is_verified,
        average_rating, total_reviews, featured, status
      FROM vendors
      WHERE status = 'active'
        AND ${vendorWhereClause}
      ORDER BY
        CASE 
          WHEN ${isSearchingForCareServices} AND LOWER(business_type) LIKE '%care%' THEN 0
          WHEN ${isSearchingForCareServices} AND LOWER(business_type) LIKE '%health%' THEN 1
          ELSE 2
        END,
        featured DESC,
        average_rating DESC NULLS LAST
      LIMIT ${limit}
    `);
    
    // Build service provider WHERE clause based on search type  
    let serviceProviderWhereClause;
    if (isSearchingForCareServices) {
      // For care services, filter more strictly
      serviceProviderWhereClause = sql`(
        (LOWER(name) LIKE ${'%' + searchTerm + '%'} 
         AND (LOWER(name) LIKE '%care%' OR LOWER(name) LIKE '%health%' 
              OR LOWER(name) LIKE '%senior%' OR LOWER(name) LIKE '%hospice%'
              OR LOWER(name) LIKE '%therapy%' OR LOWER(name) LIKE '%medical%'))
        OR (LOWER(description) LIKE ${'%' + searchTerm + '%'}
            AND (LOWER(description) LIKE '%care%' OR LOWER(description) LIKE '%health%'
                OR LOWER(description) LIKE '%senior%' OR LOWER(description) LIKE '%medical%'
                OR LOWER(description) LIKE '%assist%' OR LOWER(description) LIKE '%nursing%'))
      )`;
    } else if (searchTerm) {
      serviceProviderWhereClause = sql`(
        LOWER(name) LIKE ${'%' + searchTerm + '%'}
        OR LOWER(description) LIKE ${'%' + searchTerm + '%'}
      )`;
    } else {
      serviceProviderWhereClause = sql`true`;
    }
    
    // Then search service_providers table for comprehensive results
    const serviceProviderResults = await db.execute(sql`
      SELECT 
        'provider' as source_type,
        id, name, 
        CASE 
          WHEN LOWER(name) LIKE '%home care%' OR LOWER(description) LIKE '%home care%' THEN 'Home Care'
          WHEN LOWER(name) LIKE '%hospice%' OR LOWER(description) LIKE '%hospice%' THEN 'Hospice Care'
          WHEN LOWER(name) LIKE '%therapy%' OR LOWER(description) LIKE '%therapy%' THEN 'Therapy Services'
          WHEN LOWER(name) LIKE '%medical%' OR LOWER(description) LIKE '%medical%' THEN 'Medical Services'
          ELSE 'Service Provider'
        END as business_type,
        description, 
        description as short_description,
        contact_email as email, contact_phone as phone, 
        '' as city, '' as state,
        website, logo as logo_url, null as service_areas, 
        partnership_level as subscription_tier, is_partner as is_verified,
        rating as average_rating, total_reviews, 
        is_partner as featured, 'active' as status
      FROM service_providers
      WHERE is_active = true
        AND ${serviceProviderWhereClause}
      ORDER BY 
        CASE 
          WHEN ${isSearchingForCareServices} AND LOWER(name) LIKE ${'%' + searchTerm + '%'} THEN 0
          WHEN ${isSearchingForCareServices} AND LOWER(description) LIKE '%care%' THEN 1
          ELSE 2
        END,
        is_partner DESC, 
        rating DESC NULLS LAST
      LIMIT ${Math.max(0, limit - vendorResults.rows.length)}
      OFFSET ${Math.max(0, offset - vendorResults.rows.length)}
    `);
    
    // Combine results
    const combinedResults = [...vendorResults.rows, ...serviceProviderResults.rows];
    
    const totalCount = await db.execute(sql`
      SELECT 
        (SELECT COUNT(*) FROM vendors WHERE status = 'active' 
          AND ${vendorWhereClause}) +
        (SELECT COUNT(*) FROM service_providers WHERE is_active = true
          AND ${serviceProviderWhereClause}) as count
    `);
    
    res.json({
      communities: combinedResults || [], // Using 'communities' key for consistency
      totalResults: parseInt((totalCount.rows[0] as any)?.count || '0'),
      searchMetadata: {
        query,
        searchType: 'vendor',
        processingTime: Date.now() - startTime,
        searchCategory: 'services'
      },
      facets: {
        states: [],
        careTypes: [],
        priceRanges: []
      }
    });
  } catch (error) {
    console.error('Vendor search error:', error);
    res.status(500).json({ 
      error: 'Failed to search vendors',
      communities: [],
      totalResults: 0,
      searchMetadata: {
        query: req.body.query,
        searchType: 'error',
        processingTime: 0,
        searchCategory: 'services'
      },
      facets: {
        states: [],
        careTypes: [],
        priceRanges: []
      }
    });
  }
});

// Healthcare search endpoint - Using real hospitals data
router.post('/api/healthcare/search', async (req, res) => {
  try {
    const { query = '', limit = 100, offset = 0 } = req.body;
    const searchTerm = query.toLowerCase().trim();
    
    const startTime = Date.now();
    
    // Search real hospitals from hospitals table
    let healthcareResults;
    let totalCount;
    
    if (searchTerm) {
      healthcareResults = await db.execute(sql`
        SELECT 
          id, name, address, city, state, zip_code, 
          phone, website, hospital_type, emergency_services,
          bed_count, cms_rating, services, specialties,
          latitude, longitude, ownership, trauma_level,
          emergency_phone, insurance_accepted
        FROM hospitals
        WHERE 
          is_active = true
          AND (
            LOWER(name) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(city) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(state) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(hospital_type) LIKE ${'%' + searchTerm + '%'}
            OR array_to_string(services, ' ') ILIKE ${'%' + searchTerm + '%'}
            OR array_to_string(specialties, ' ') ILIKE ${'%' + searchTerm + '%'}
          )
        ORDER BY 
          CASE WHEN emergency_services = true THEN 0 ELSE 1 END,
          cms_rating DESC NULLS LAST,
          bed_count DESC NULLS LAST
        LIMIT ${limit}
        OFFSET ${offset}
      `);
      
      totalCount = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM hospitals 
        WHERE 
          is_active = true
          AND (
            LOWER(name) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(city) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(state) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(hospital_type) LIKE ${'%' + searchTerm + '%'}
            OR array_to_string(services, ' ') ILIKE ${'%' + searchTerm + '%'}
            OR array_to_string(specialties, ' ') ILIKE ${'%' + searchTerm + '%'}
          )
      `);
    } else {
      healthcareResults = await db.execute(sql`
        SELECT 
          id, name, address, city, state, zip_code, 
          phone, website, hospital_type, emergency_services,
          bed_count, cms_rating, services, specialties,
          latitude, longitude, ownership, trauma_level,
          emergency_phone, insurance_accepted
        FROM hospitals
        WHERE is_active = true
        ORDER BY 
          CASE WHEN emergency_services = true THEN 0 ELSE 1 END,
          cms_rating DESC NULLS LAST,
          bed_count DESC NULLS LAST
        LIMIT ${limit}
        OFFSET ${offset}
      `);
      
      totalCount = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM hospitals 
        WHERE is_active = true
      `);
    }
    
    res.json({
      communities: healthcareResults.rows || [],
      totalResults: parseInt((totalCount.rows[0] as any)?.count || '0'),
      searchMetadata: {
        query,
        searchType: 'healthcare',
        processingTime: Date.now() - startTime,
        searchCategory: 'healthcare'
      },
      facets: {
        states: [],
        careTypes: [],
        priceRanges: []
      }
    });
  } catch (error) {
    console.error('Healthcare search error:', error);
    res.status(500).json({ 
      error: 'Failed to search healthcare facilities',
      communities: [],
      totalResults: 0,
      searchMetadata: {
        query: req.body.query,
        searchType: 'error',
        processingTime: 0,
        searchCategory: 'healthcare'
      },
      facets: {
        states: [],
        careTypes: [],
        priceRanges: []
      }
    });
  }
});

// Hospital statistics endpoint for directory page
router.get('/api/hospitals/statistics', async (req, res) => {
  try {
    // Get hospital type statistics
    const hospitalTypes = await db.execute(sql`
      SELECT 
        hospital_type, 
        COUNT(*) as count,
        STRING_AGG(DISTINCT ownership, ', ') as ownership_types
      FROM hospitals 
      WHERE is_active = true
      GROUP BY hospital_type
      ORDER BY count DESC
    `);
    
    // Get top services statistics
    const topServices = await db.execute(sql`
      SELECT 
        UNNEST(services) as service,
        COUNT(*) as count
      FROM hospitals 
      WHERE is_active = true AND services IS NOT NULL
      GROUP BY service
      ORDER BY count DESC
      LIMIT 15
    `);
    
    // Get specialty statistics
    const specialties = await db.execute(sql`
      SELECT 
        UNNEST(specialties) as specialty,
        COUNT(*) as count
      FROM hospitals 
      WHERE is_active = true AND specialties IS NOT NULL
      GROUP BY specialty
      ORDER BY count DESC
      LIMIT 20
    `);
    
    // Get total counts
    const totals = await db.execute(sql`
      SELECT 
        COUNT(*) as total_hospitals,
        COUNT(DISTINCT hospital_type) as unique_types,
        COUNT(CASE WHEN emergency_services = true THEN 1 END) as emergency_count,
        COUNT(CASE WHEN trauma_level IS NOT NULL THEN 1 END) as trauma_centers,
        COUNT(CASE WHEN array_length(services, 1) > 10 THEN 1 END) as comprehensive_centers
      FROM hospitals
      WHERE is_active = true
    `);
    
    res.json({
      hospitalTypes: hospitalTypes.rows || [],
      topServices: topServices.rows || [],
      specialties: specialties.rows || [],
      totals: totals.rows[0] || {},
      success: true
    });
  } catch (error) {
    console.error('Hospital statistics error:', error);
    res.status(500).json({ 
      error: 'Failed to get hospital statistics',
      hospitalTypes: [],
      topServices: [],
      specialties: [],
      totals: {},
      success: false
    });
  }
});

// Resources search endpoint - Using real educational_resources table
router.post('/api/resources/search', async (req, res) => {
  try {
    const { query = '', limit = 100, offset = 0 } = req.body;
    const searchTerm = query.toLowerCase().trim();
    
    const startTime = Date.now();
    
    // Search real educational resources from database
    let resourceResults;
    let totalCount;
    
    if (searchTerm) {
      resourceResults = await db.execute(sql`
        SELECT 
          id, title as name, content_type as type, 
          description, category,
          slug as url,
          author, source, source_url,
          difficulty_level, reading_time,
          tags, is_featured as featured,
          view_count, helpful_count
        FROM educational_resources
        WHERE 
          is_active = true
          AND (
            LOWER(title) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(description) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(category) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(subcategory) LIKE ${'%' + searchTerm + '%'}
            OR array_to_string(tags, ' ') ILIKE ${'%' + searchTerm + '%'}
          )
        ORDER BY 
          is_featured DESC,
          view_count DESC,
          helpful_count DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `);
      
      totalCount = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM educational_resources 
        WHERE 
          is_active = true
          AND (
            LOWER(title) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(description) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(category) LIKE ${'%' + searchTerm + '%'}
            OR array_to_string(tags, ' ') ILIKE ${'%' + searchTerm + '%'}
          )
      `);
    } else {
      // Return featured resources when no search term
      resourceResults = await db.execute(sql`
        SELECT 
          id, title as name, content_type as type, 
          description, category,
          slug as url,
          author, source, source_url,
          difficulty_level, reading_time,
          tags, is_featured as featured,
          view_count, helpful_count
        FROM educational_resources
        WHERE is_active = true
        ORDER BY 
          is_featured DESC,
          view_count DESC,
          created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `);
      
      totalCount = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM educational_resources 
        WHERE is_active = true
      `);
    }
    
    // Format resources with URL prefix
    const formattedResources = (resourceResults.rows || []).map(resource => ({
      ...resource,
      url: `/resources/${resource.url}`
    }));
    
    res.json({
      communities: formattedResources,
      totalResults: parseInt((totalCount.rows[0] as any)?.count || '0'),
      searchMetadata: {
        query,
        searchType: 'resources',
        processingTime: Date.now() - startTime,
        searchCategory: 'resources'
      },
      facets: {
        states: [],
        careTypes: [],
        priceRanges: []
      }
    });
  } catch (error) {
    console.error('Resources search error:', error);
    res.status(500).json({ 
      error: 'Failed to search resources',
      communities: [],
      totalResults: 0,
      searchMetadata: {
        query: req.body.query,
        searchType: 'error',
        processingTime: 0,
        searchCategory: 'resources'
      },
      facets: {
        states: [],
        careTypes: [],
        priceRanges: []
      }
    });
  }
});

export default router;