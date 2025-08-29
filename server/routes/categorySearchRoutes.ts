/**
 * Unified search endpoints for different categories
 * Handles: Communities, Services, Healthcare, Resources
 */

import { Router } from 'express';
import { db } from '../db';
import { communities, vendors } from '@shared/schema';
import { sql, like, or, and, eq, desc } from 'drizzle-orm';

const router = Router();

// Vendor/Services search endpoint
router.post('/api/vendors/search', async (req, res) => {
  try {
    const { query = '', limit = 100, offset = 0 } = req.body;
    const searchTerm = query.toLowerCase().trim();
    
    const startTime = Date.now();
    
    // Search vendors
    const vendorResults = await db.execute(sql`
      SELECT 
        id, business_name, business_type, description, short_description,
        primary_contact_email, primary_contact_phone, business_city, business_state,
        website, logo_url, service_areas, subscription_tier, is_verified,
        average_rating, total_reviews, featured, status
      FROM vendors
      WHERE status = 'active'
        AND (
          LOWER(business_name) LIKE ${'%' + searchTerm + '%'}
          OR LOWER(description) LIKE ${'%' + searchTerm + '%'}
          OR LOWER(business_type) LIKE ${'%' + searchTerm + '%'}
          OR LOWER(business_city) LIKE ${'%' + searchTerm + '%'}
          OR LOWER(business_state) LIKE ${'%' + searchTerm + '%'}
        )
      ORDER BY 
        featured DESC, 
        average_rating DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `);
    
    const totalCount = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM vendors 
      WHERE status = 'active'
        AND (
          LOWER(business_name) LIKE ${'%' + searchTerm + '%'}
          OR LOWER(description) LIKE ${'%' + searchTerm + '%'}
          OR LOWER(business_type) LIKE ${'%' + searchTerm + '%'}
        )
    `);
    
    res.json({
      communities: vendorResults.rows || [], // Using 'communities' key for consistency
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

// Healthcare search endpoint
router.post('/api/healthcare/search', async (req, res) => {
  try {
    const { query = '', limit = 100, offset = 0 } = req.body;
    const searchTerm = query.toLowerCase().trim();
    
    const startTime = Date.now();
    
    // Search healthcare facilities in communities table
    const healthcareResults = await db.execute(sql`
      SELECT 
        id, name, address, city, state, zip_code, 
        phone, website, care_types, price_range,
        photos, latitude, longitude, rating,
        hud_property_id
      FROM communities
      WHERE 
        (array_to_string(care_types, ' ') ILIKE '%hospital%' 
         OR array_to_string(care_types, ' ') ILIKE '%medical%'
         OR array_to_string(care_types, ' ') ILIKE '%clinic%'
         OR array_to_string(care_types, ' ') ILIKE '%rehab%'
         OR array_to_string(care_types, ' ') ILIKE '%health%')
        AND (
          LOWER(name) LIKE ${'%' + searchTerm + '%'}
          OR LOWER(city) LIKE ${'%' + searchTerm + '%'}
          OR LOWER(state) LIKE ${'%' + searchTerm + '%'}
          OR array_to_string(care_types, ' ') ILIKE ${'%' + searchTerm + '%'}
        )
      ORDER BY 
        rating DESC NULLS LAST
      LIMIT ${limit}
      OFFSET ${offset}
    `);
    
    const totalCount = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM communities 
      WHERE 
        (array_to_string(care_types, ' ') ILIKE '%hospital%' 
         OR array_to_string(care_types, ' ') ILIKE '%medical%'
         OR array_to_string(care_types, ' ') ILIKE '%clinic%')
        AND (
          LOWER(name) LIKE ${'%' + searchTerm + '%'}
          OR LOWER(city) LIKE ${'%' + searchTerm + '%'}
        )
    `);
    
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

// Resources search endpoint
router.post('/api/resources/search', async (req, res) => {
  try {
    const { query = '', limit = 100, offset = 0 } = req.body;
    const searchTerm = query.toLowerCase().trim();
    
    const startTime = Date.now();
    
    // For now, return educational resources from static data
    // This could be expanded to search a resources table in the future
    const mockResources = [
      {
        id: 1,
        name: 'Understanding Medicare for Seniors',
        type: 'Guide',
        description: 'Complete guide to Medicare benefits and enrollment',
        category: 'Healthcare',
        url: '/resources/medicare-guide'
      },
      {
        id: 2,
        name: 'Choosing the Right Senior Living Community',
        type: 'Article',
        description: 'Key factors to consider when selecting senior care',
        category: 'Senior Living',
        url: '/resources/choosing-community'
      },
      {
        id: 3,
        name: 'Financial Planning for Long-Term Care',
        type: 'Guide',
        description: 'Understanding costs and payment options for senior care',
        category: 'Financial',
        url: '/resources/financial-planning'
      },
      {
        id: 4,
        name: 'Alzheimer\'s and Dementia Care Resources',
        type: 'Resource Hub',
        description: 'Support and information for memory care needs',
        category: 'Memory Care',
        url: '/resources/memory-care'
      },
      {
        id: 5,
        name: 'Veterans Benefits for Senior Care',
        type: 'Guide',
        description: 'VA benefits and resources for veteran seniors',
        category: 'Veterans',
        url: '/resources/va-benefits'
      }
    ];
    
    // Filter resources based on search query
    const filteredResources = searchTerm 
      ? mockResources.filter(resource => 
          resource.name.toLowerCase().includes(searchTerm) ||
          resource.description.toLowerCase().includes(searchTerm) ||
          resource.category.toLowerCase().includes(searchTerm)
        )
      : mockResources;
    
    res.json({
      communities: filteredResources.slice(offset, offset + limit),
      totalResults: filteredResources.length,
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