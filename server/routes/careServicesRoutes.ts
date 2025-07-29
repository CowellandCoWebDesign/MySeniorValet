import { Router } from "express";
import { db } from "../db";
import { communities } from "../../shared/schema";
import { sql, like, or, and, ne, isNotNull } from "drizzle-orm";

const router = Router();

// Get all care services from the database
router.get('/care-services', async (req, res) => {
  try {
    const { category, location, limit = 50 } = req.query;
    
    // Build dynamic query conditions
    let whereConditions = and(
      or(
        like(sql`LOWER(${communities.name})`, '%placement%'),
        like(sql`LOWER(${communities.name})`, '%home care%'),
        like(sql`LOWER(${communities.name})`, '%caregiving%'),
        like(sql`LOWER(${communities.careTypes}::text)`, '%adult day%'),
        like(sql`LOWER(${communities.careTypes}::text)`, '%therapy%'),
        like(sql`LOWER(${communities.careTypes}::text)`, '%hospice%'),
        like(sql`LOWER(${communities.careTypes}::text)`, '%respite%'),
        like(sql`LOWER(${communities.careTypes}::text)`, '%personal care%')
      ),
      isNotNull(communities.phone),
      ne(communities.phone, '')
    );

    // Add location filter if specified
    if (location) {
      whereConditions = and(
        whereConditions,
        or(
          like(sql`LOWER(${communities.city})`, `%${String(location).toLowerCase()}%`),
          like(sql`LOWER(${communities.state})`, `%${String(location).toLowerCase()}%`)
        )
      );
    }

    const careServices = await db
      .select({
        id: communities.id,
        name: communities.name,
        careTypes: communities.careTypes,
        phone: communities.phone,
        address: communities.address,
        city: communities.city,
        state: communities.state,
        zipCode: communities.zipCode,
        website: communities.website,
        latitude: communities.latitude,
        longitude: communities.longitude,
        // Categorize services
        serviceCategory: sql<string>`
          CASE 
            WHEN LOWER(${communities.name}) LIKE '%placement%' THEN 'Senior Placement Agency'
            WHEN LOWER(${communities.name}) LIKE '%home care%' OR LOWER(${communities.name}) LIKE '%caregiving%' THEN 'Home Care Services'
            WHEN LOWER(${communities.careTypes}::text) LIKE '%adult day%' THEN 'Adult Day Care'
            WHEN LOWER(${communities.careTypes}::text) LIKE '%therapy%' THEN 'Therapy Services'
            WHEN LOWER(${communities.careTypes}::text) LIKE '%hospice%' THEN 'Hospice Care'
            WHEN LOWER(${communities.careTypes}::text) LIKE '%respite%' THEN 'Respite Care'
            WHEN LOWER(${communities.careTypes}::text) LIKE '%personal care%' THEN 'Personal Care Services'
            ELSE 'Care Services'
          END
        `.as('serviceCategory')
      })
      .from(communities)
      .where(whereConditions)
      .orderBy(sql`
        CASE 
          WHEN LOWER(${communities.name}) LIKE '%placement%' THEN 'Senior Placement Agency'
          WHEN LOWER(${communities.name}) LIKE '%home care%' OR LOWER(${communities.name}) LIKE '%caregiving%' THEN 'Home Care Services'
          WHEN LOWER(${communities.careTypes}::text) LIKE '%adult day%' THEN 'Adult Day Care'
          WHEN LOWER(${communities.careTypes}::text) LIKE '%therapy%' THEN 'Therapy Services'
          WHEN LOWER(${communities.careTypes}::text) LIKE '%hospice%' THEN 'Hospice Care'
          WHEN LOWER(${communities.careTypes}::text) LIKE '%respite%' THEN 'Respite Care'
          WHEN LOWER(${communities.careTypes}::text) LIKE '%personal care%' THEN 'Personal Care Services'
          ELSE 'Care Services'
        END
      `, communities.name)
      .limit(Number(limit));

    // Add category filter if specified
    let filteredServices = careServices;
    if (category) {
      filteredServices = careServices.filter(service => 
        service.serviceCategory.toLowerCase().includes(String(category).toLowerCase())
      );
    }

    res.json({
      services: filteredServices,
      total: filteredServices.length,
      categories: [
        'Senior Placement Agency',
        'Home Care Services', 
        'Adult Day Care',
        'Therapy Services',
        'Hospice Care',
        'Respite Care',
        'Personal Care Services'
      ]
    });

  } catch (error) {
    console.error('Error fetching care services:', error);
    res.status(500).json({ message: 'Failed to fetch care services' });
  }
});

// Get care services by category
router.get('/care-services/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { location, limit = 25 } = req.query;
    
    let categoryFilter;
    switch (category.toLowerCase()) {
      case 'placement':
        categoryFilter = like(sql`LOWER(${communities.name})`, '%placement%');
        break;
      case 'home-care':
        categoryFilter = or(
          like(sql`LOWER(${communities.name})`, '%home care%'),
          like(sql`LOWER(${communities.name})`, '%caregiving%')
        );
        break;
      case 'adult-day':
        categoryFilter = like(sql`LOWER(${communities.careTypes}::text)`, '%adult day%');
        break;
      case 'therapy':
        categoryFilter = like(sql`LOWER(${communities.careTypes}::text)`, '%therapy%');
        break;
      case 'hospice':
        categoryFilter = like(sql`LOWER(${communities.careTypes}::text)`, '%hospice%');
        break;
      case 'respite':
        categoryFilter = like(sql`LOWER(${communities.careTypes}::text)`, '%respite%');
        break;
      case 'personal-care':
        categoryFilter = like(sql`LOWER(${communities.careTypes}::text)`, '%personal care%');
        break;
      default:
        return res.status(400).json({ message: 'Invalid category' });
    }

    let whereConditions = and(
      categoryFilter,
      isNotNull(communities.phone),
      ne(communities.phone, '')
    );

    // Add location filter if specified
    if (location) {
      whereConditions = and(
        whereConditions,
        or(
          like(sql`LOWER(${communities.city})`, `%${String(location).toLowerCase()}%`),
          like(sql`LOWER(${communities.state})`, `%${String(location).toLowerCase()}%`)
        )
      );
    }

    const services = await db
      .select({
        id: communities.id,
        name: communities.name,
        careTypes: communities.careTypes,
        phone: communities.phone,
        address: communities.address,
        city: communities.city,
        state: communities.state,
        zipCode: communities.zipCode,
        website: communities.website,
        latitude: communities.latitude,
        longitude: communities.longitude
      })
      .from(communities)
      .where(whereConditions)
      .orderBy(communities.name)
      .limit(Number(limit));

    res.json({
      category,
      services,
      total: services.length
    });

  } catch (error) {
    console.error('Error fetching care services by category:', error);
    res.status(500).json({ message: 'Failed to fetch care services by category' });
  }
});

// Get care services analytics
router.get('/care-services/analytics', async (req, res) => {
  try {
    const analytics = await db
      .select({
        totalServices: sql<number>`COUNT(*)`,
        placementAgencies: sql<number>`COUNT(CASE WHEN LOWER(${communities.name}) LIKE '%placement%' THEN 1 END)`,
        homeCareServices: sql<number>`COUNT(CASE WHEN LOWER(${communities.name}) LIKE '%home care%' OR LOWER(${communities.name}) LIKE '%caregiving%' THEN 1 END)`,
        adultDayServices: sql<number>`COUNT(CASE WHEN LOWER(${communities.careTypes}::text) LIKE '%adult day%' THEN 1 END)`,
        therapyServices: sql<number>`COUNT(CASE WHEN LOWER(${communities.careTypes}::text) LIKE '%therapy%' THEN 1 END)`,
        hospiceServices: sql<number>`COUNT(CASE WHEN LOWER(${communities.careTypes}::text) LIKE '%hospice%' THEN 1 END)`,
        respiteServices: sql<number>`COUNT(CASE WHEN LOWER(${communities.careTypes}::text) LIKE '%respite%' THEN 1 END)`,
        personalCareServices: sql<number>`COUNT(CASE WHEN LOWER(${communities.careTypes}::text) LIKE '%personal care%' THEN 1 END)`,
        servicesWithWebsites: sql<number>`COUNT(CASE WHEN ${communities.website} IS NOT NULL AND ${communities.website} != '' THEN 1 END)`,
        servicesWithPhone: sql<number>`COUNT(CASE WHEN ${communities.phone} IS NOT NULL AND ${communities.phone} != '' THEN 1 END)`
      })
      .from(communities)
      .where(
        or(
          like(sql`LOWER(${communities.name})`, '%placement%'),
          like(sql`LOWER(${communities.name})`, '%home care%'),
          like(sql`LOWER(${communities.name})`, '%caregiving%'),
          like(sql`LOWER(${communities.careTypes}::text)`, '%adult day%'),
          like(sql`LOWER(${communities.careTypes}::text)`, '%therapy%'),
          like(sql`LOWER(${communities.careTypes}::text)`, '%hospice%'),
          like(sql`LOWER(${communities.careTypes}::text)`, '%respite%'),
          like(sql`LOWER(${communities.careTypes}::text)`, '%personal care%')
        )
      );

    res.json(analytics[0]);

  } catch (error) {
    console.error('Error fetching care services analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Search care services by name or location
router.get('/care-services/search', async (req, res) => {
  try {
    const { q, location, limit = 25 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let whereConditions = and(
      or(
        like(sql`LOWER(${communities.name})`, '%placement%'),
        like(sql`LOWER(${communities.name})`, '%home care%'),
        like(sql`LOWER(${communities.name})`, '%caregiving%'),
        like(sql`LOWER(${communities.careTypes}::text)`, '%adult day%'),
        like(sql`LOWER(${communities.careTypes}::text)`, '%therapy%'),
        like(sql`LOWER(${communities.careTypes}::text)`, '%hospice%'),
        like(sql`LOWER(${communities.careTypes}::text)`, '%respite%'),
        like(sql`LOWER(${communities.careTypes}::text)`, '%personal care%')
      ),
      like(sql`LOWER(${communities.name})`, `%${String(q).toLowerCase()}%`),
      isNotNull(communities.phone)
    );

    // Add location filter if specified
    if (location) {
      whereConditions = and(
        whereConditions,
        or(
          like(sql`LOWER(${communities.city})`, `%${String(location).toLowerCase()}%`),
          like(sql`LOWER(${communities.state})`, `%${String(location).toLowerCase()}%`)
        )
      );
    }

    const services = await db
      .select({
        id: communities.id,
        name: communities.name,
        careTypes: communities.careTypes,
        phone: communities.phone,
        address: communities.address,
        city: communities.city,
        state: communities.state,
        website: communities.website,
        serviceCategory: sql<string>`
          CASE 
            WHEN LOWER(${communities.name}) LIKE '%placement%' THEN 'Senior Placement Agency'
            WHEN LOWER(${communities.name}) LIKE '%home care%' OR LOWER(${communities.name}) LIKE '%caregiving%' THEN 'Home Care Services'
            WHEN LOWER(${communities.careTypes}::text) LIKE '%adult day%' THEN 'Adult Day Care'
            WHEN LOWER(${communities.careTypes}::text) LIKE '%therapy%' THEN 'Therapy Services'
            WHEN LOWER(${communities.careTypes}::text) LIKE '%hospice%' THEN 'Hospice Care'
            WHEN LOWER(${communities.careTypes}::text) LIKE '%respite%' THEN 'Respite Care'
            WHEN LOWER(${communities.careTypes}::text) LIKE '%personal care%' THEN 'Personal Care Services'
            ELSE 'Care Services'
          END
        `.as('serviceCategory')
      })
      .from(communities)
      .where(whereConditions)
      .orderBy(communities.name)
      .limit(Number(limit));

    res.json({
      query: q,
      location,
      services,
      total: services.length
    });

  } catch (error) {
    console.error('Error searching care services:', error);
    res.status(500).json({ message: 'Failed to search care services' });
  }
});

export default router;