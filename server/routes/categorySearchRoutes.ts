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
    
    const startTime = Date.now();
    
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
        AND (
          ${searchTerm ? sql`(
            LOWER(business_name) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(description) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(business_type) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(business_city) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(business_state) LIKE ${'%' + searchTerm + '%'}
          )` : sql`true`}
        )
    `);
    
    // Then search service_providers table for comprehensive results
    const serviceProviderResults = await db.execute(sql`
      SELECT 
        'provider' as source_type,
        id, name, 'Service Provider' as business_type, description, 
        description as short_description,
        contact_email as email, contact_phone as phone, 
        '' as city, '' as state,
        website, logo as logo_url, null as service_areas, 
        partnership_level as subscription_tier, is_partner as is_verified,
        rating as average_rating, total_reviews, 
        is_partner as featured, 'active' as status
      FROM service_providers
      WHERE is_active = true
        AND (
          ${searchTerm ? sql`(
            LOWER(name) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(description) LIKE ${'%' + searchTerm + '%'}
          )` : sql`true`}
        )
      ORDER BY 
        is_partner DESC, 
        rating DESC NULLS LAST
      LIMIT ${limit - vendorResults.rows.length}
      OFFSET ${Math.max(0, offset - vendorResults.rows.length)}
    `);
    
    // Combine results
    const combinedResults = [...vendorResults.rows, ...serviceProviderResults.rows];
    
    const totalCount = await db.execute(sql`
      SELECT 
        (SELECT COUNT(*) FROM vendors WHERE status = 'active' 
          AND (${searchTerm ? sql`(
            LOWER(business_name) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(description) LIKE ${'%' + searchTerm + '%'}
          )` : sql`true`})) +
        (SELECT COUNT(*) FROM service_providers WHERE is_active = true
          AND (${searchTerm ? sql`(
            LOWER(name) LIKE ${'%' + searchTerm + '%'}
            OR LOWER(description) LIKE ${'%' + searchTerm + '%'}
          )` : sql`true`})) as count
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