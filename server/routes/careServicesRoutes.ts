import { Router } from "express";
import { db } from "../db";
import { communities } from "../../shared/schema";
import { sql, like, or, and, ne, isNotNull } from "drizzle-orm";

const router = Router();

// Get all care services from the database
router.get('/care-services', async (req, res) => {
  try {
    const { category, location, limit } = req.query;
    
    // Build dynamic query conditions - EXCLUDE placement agencies
    let whereConditions = and(
      or(
        // Home care services
        and(
          or(
            like(sql`LOWER(${communities.name})`, '%home care%'),
            like(sql`LOWER(${communities.name})`, '%caregiving%'),
            like(sql`LOWER(${communities.name})`, '%visiting%'),
            like(sql`LOWER(${communities.name})`, '%home health%')
          ),
          // Exclude placement agencies disguised as home care
          sql`LOWER(${communities.name}) NOT LIKE '%placement%'`
        ),
        // Adult day care
        or(
          like(sql`LOWER(${communities.careTypes}::text)`, '%adult day%'),
          like(sql`LOWER(${communities.name})`, '%adult day%'),
          like(sql`LOWER(${communities.name})`, '%day program%')
        ),
        // Therapy services
        or(
          like(sql`LOWER(${communities.careTypes}::text)`, '%therapy%'),
          like(sql`LOWER(${communities.name})`, '%therapy%'),
          like(sql`LOWER(${communities.name})`, '%rehabilitation%'),
          like(sql`LOWER(${communities.name})`, '%physical therapy%'),
          like(sql`LOWER(${communities.name})`, '%occupational%')
        ),
        // Hospice care
        or(
          like(sql`LOWER(${communities.careTypes}::text)`, '%hospice%'),
          like(sql`LOWER(${communities.name})`, '%hospice%')
        ),
        // Respite care
        or(
          like(sql`LOWER(${communities.careTypes}::text)`, '%respite%'),
          like(sql`LOWER(${communities.name})`, '%respite%')
        ),
        // Personal care services
        or(
          like(sql`LOWER(${communities.careTypes}::text)`, '%personal care%'),
          like(sql`LOWER(${communities.name})`, '%personal care%')
        )
      ),
      // Must have phone for verification
      isNotNull(communities.phone),
      ne(communities.phone, ''),
      // Exclude any placement agencies
      sql`LOWER(${communities.name}) NOT LIKE '%placement%'`,
      sql`LOWER(${communities.name}) NOT LIKE '%referral%'`,
      sql`LOWER(${communities.name}) NOT LIKE '%advisor%'`,
      sql`LOWER(${communities.name}) NOT LIKE '%locator%'`
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

    let careServicesQuery = db
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
        // Categorize services - NO placement agencies
        serviceCategory: sql<string>`
          CASE 
            WHEN LOWER(${communities.name}) LIKE '%home care%' OR LOWER(${communities.name}) LIKE '%caregiving%' 
                 OR LOWER(${communities.name}) LIKE '%visiting%' OR LOWER(${communities.name}) LIKE '%home health%' THEN 'Home Care Services'
            WHEN LOWER(${communities.careTypes}::text) LIKE '%adult day%' 
                 OR LOWER(${communities.name}) LIKE '%adult day%' 
                 OR LOWER(${communities.name}) LIKE '%day program%' THEN 'Adult Day Care'
            WHEN LOWER(${communities.careTypes}::text) LIKE '%therapy%' 
                 OR LOWER(${communities.name}) LIKE '%therapy%' 
                 OR LOWER(${communities.name}) LIKE '%rehabilitation%'
                 OR LOWER(${communities.name}) LIKE '%physical therapy%'
                 OR LOWER(${communities.name}) LIKE '%occupational%' THEN 'Therapy Services'
            WHEN LOWER(${communities.careTypes}::text) LIKE '%hospice%' 
                 OR LOWER(${communities.name}) LIKE '%hospice%' THEN 'Hospice Care'
            WHEN LOWER(${communities.careTypes}::text) LIKE '%respite%' 
                 OR LOWER(${communities.name}) LIKE '%respite%' THEN 'Respite Care'
            WHEN LOWER(${communities.careTypes}::text) LIKE '%personal care%' 
                 OR LOWER(${communities.name}) LIKE '%personal care%' THEN 'Personal Care Services'
            ELSE 'Care Services'
          END
        `.as('serviceCategory'),
        // Add rating from metadata if available
        rating: communities.rating,
        // Add email if available
        email: communities.email
      })
      .from(communities)
      .where(whereConditions)
      .orderBy(sql`
        CASE 
          WHEN LOWER(${communities.name}) LIKE '%home care%' OR LOWER(${communities.name}) LIKE '%caregiving%' 
               OR LOWER(${communities.name}) LIKE '%visiting%' OR LOWER(${communities.name}) LIKE '%home health%' THEN 'Home Care Services'
          WHEN LOWER(${communities.careTypes}::text) LIKE '%adult day%' 
               OR LOWER(${communities.name}) LIKE '%adult day%' 
               OR LOWER(${communities.name}) LIKE '%day program%' THEN 'Adult Day Care'
          WHEN LOWER(${communities.careTypes}::text) LIKE '%therapy%' 
               OR LOWER(${communities.name}) LIKE '%therapy%' 
               OR LOWER(${communities.name}) LIKE '%rehabilitation%' THEN 'Therapy Services'
          WHEN LOWER(${communities.careTypes}::text) LIKE '%hospice%' 
               OR LOWER(${communities.name}) LIKE '%hospice%' THEN 'Hospice Care'
          WHEN LOWER(${communities.careTypes}::text) LIKE '%respite%' 
               OR LOWER(${communities.name}) LIKE '%respite%' THEN 'Respite Care'
          WHEN LOWER(${communities.careTypes}::text) LIKE '%personal care%' 
               OR LOWER(${communities.name}) LIKE '%personal care%' THEN 'Personal Care Services'
          ELSE 'Care Services'
        END
      `, communities.name);
    
    // Apply limit only if specified
    if (limit) {
      careServicesQuery = careServicesQuery.limit(Number(limit));
    }
      
    const queryResult = await careServicesQuery;

    // Remove duplicates based on phone number and address
    const uniqueServicesMap = new Map();
    queryResult.forEach(service => {
      const key = `${service.phone}-${service.address}`.toLowerCase();
      if (!uniqueServicesMap.has(key)) {
        uniqueServicesMap.set(key, service);
      }
    });
    
    let uniqueServices = Array.from(uniqueServicesMap.values());

    // Add category filter if specified
    if (category) {
      uniqueServices = uniqueServices.filter(service => 
        service.serviceCategory.toLowerCase().includes(String(category).toLowerCase())
      );
    }

    res.json({
      services: uniqueServices,
      total: uniqueServices.length,
      categories: [
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
      category: category,
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
        homeCareServices: sql<number>`COUNT(CASE WHEN (LOWER(${communities.name}) LIKE '%home care%' OR LOWER(${communities.name}) LIKE '%caregiving%' OR LOWER(${communities.name}) LIKE '%visiting%' OR LOWER(${communities.name}) LIKE '%home health%') AND LOWER(${communities.name}) NOT LIKE '%placement%' THEN 1 END)`,
        adultDayServices: sql<number>`COUNT(CASE WHEN (LOWER(${communities.careTypes}::text) LIKE '%adult day%' OR LOWER(${communities.name}) LIKE '%adult day%' OR LOWER(${communities.name}) LIKE '%day program%') THEN 1 END)`,
        therapyServices: sql<number>`COUNT(CASE WHEN (LOWER(${communities.careTypes}::text) LIKE '%therapy%' OR LOWER(${communities.name}) LIKE '%therapy%' OR LOWER(${communities.name}) LIKE '%rehabilitation%' OR LOWER(${communities.name}) LIKE '%physical therapy%' OR LOWER(${communities.name}) LIKE '%occupational%') THEN 1 END)`,
        hospiceServices: sql<number>`COUNT(CASE WHEN (LOWER(${communities.careTypes}::text) LIKE '%hospice%' OR LOWER(${communities.name}) LIKE '%hospice%') THEN 1 END)`,
        respiteServices: sql<number>`COUNT(CASE WHEN (LOWER(${communities.careTypes}::text) LIKE '%respite%' OR LOWER(${communities.name}) LIKE '%respite%') THEN 1 END)`,
        personalCareServices: sql<number>`COUNT(CASE WHEN (LOWER(${communities.careTypes}::text) LIKE '%personal care%' OR LOWER(${communities.name}) LIKE '%personal care%') THEN 1 END)`,
        servicesWithWebsites: sql<number>`COUNT(CASE WHEN ${communities.website} IS NOT NULL AND ${communities.website} != '' THEN 1 END)`,
        servicesWithPhone: sql<number>`COUNT(CASE WHEN ${communities.phone} IS NOT NULL AND ${communities.phone} != '' THEN 1 END)`
      })
      .from(communities)
      .where(
        and(
          or(
            like(sql`LOWER(${communities.name})`, '%home care%'),
            like(sql`LOWER(${communities.name})`, '%caregiving%'),
            like(sql`LOWER(${communities.name})`, '%visiting%'),
            like(sql`LOWER(${communities.name})`, '%home health%'),
            like(sql`LOWER(${communities.careTypes}::text)`, '%adult day%'),
            like(sql`LOWER(${communities.name})`, '%adult day%'),
            like(sql`LOWER(${communities.name})`, '%day program%'),
            like(sql`LOWER(${communities.careTypes}::text)`, '%therapy%'),
            like(sql`LOWER(${communities.name})`, '%therapy%'),
            like(sql`LOWER(${communities.name})`, '%rehabilitation%'),
            like(sql`LOWER(${communities.name})`, '%physical therapy%'),
            like(sql`LOWER(${communities.name})`, '%occupational%'),
            like(sql`LOWER(${communities.careTypes}::text)`, '%hospice%'),
            like(sql`LOWER(${communities.name})`, '%hospice%'),
            like(sql`LOWER(${communities.careTypes}::text)`, '%respite%'),
            like(sql`LOWER(${communities.name})`, '%respite%'),
            like(sql`LOWER(${communities.careTypes}::text)`, '%personal care%'),
            like(sql`LOWER(${communities.name})`, '%personal care%')
          ),
          // Exclude all placement agencies
          sql`LOWER(${communities.name}) NOT LIKE '%placement%'`,
          sql`LOWER(${communities.name}) NOT LIKE '%referral%'`,
          sql`LOWER(${communities.name}) NOT LIKE '%advisor%'`,
          sql`LOWER(${communities.name}) NOT LIKE '%locator%'`
        )
      );

    res.json(analytics[0]);

  } catch (error) {
    console.error('Error fetching care services analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Get Canadian care services
router.get('/care-services/canadian', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const canadianServices = await db
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
        bilingual: communities.bilingual
      })
      .from(communities)
      .where(
        and(
          // Canadian communities
          sql`${communities.county} = 'Canada'`,
          // Care service types
          or(
            like(sql`LOWER(${communities.name})`, '%home care%'),
            like(sql`LOWER(${communities.name})`, '%caregiving%'),
            like(sql`LOWER(${communities.name})`, '%visiting%'),
            like(sql`LOWER(${communities.name})`, '%home health%'),
            like(sql`LOWER(${communities.careTypes}::text)`, '%adult day%'),
            like(sql`LOWER(${communities.name})`, '%adult day%'),
            like(sql`LOWER(${communities.name})`, '%day program%'),
            like(sql`LOWER(${communities.careTypes}::text)`, '%therapy%'),
            like(sql`LOWER(${communities.name})`, '%therapy%'),
            like(sql`LOWER(${communities.name})`, '%rehabilitation%'),
            like(sql`LOWER(${communities.name})`, '%physical therapy%'),
            like(sql`LOWER(${communities.name})`, '%occupational%'),
            like(sql`LOWER(${communities.careTypes}::text)`, '%hospice%'),
            like(sql`LOWER(${communities.name})`, '%hospice%'),
            like(sql`LOWER(${communities.careTypes}::text)`, '%respite%'),
            like(sql`LOWER(${communities.name})`, '%respite%'),
            like(sql`LOWER(${communities.careTypes}::text)`, '%personal care%'),
            like(sql`LOWER(${communities.name})`, '%personal care%')
          ),
          // Must have phone
          isNotNull(communities.phone),
          ne(communities.phone, ''),
          // Exclude placement agencies
          sql`LOWER(${communities.name}) NOT LIKE '%placement%'`,
          sql`LOWER(${communities.name}) NOT LIKE '%referral%'`,
          sql`LOWER(${communities.name}) NOT LIKE '%advisor%'`,
          sql`LOWER(${communities.name}) NOT LIKE '%locator%'`
        )
      )
      .orderBy(communities.state, communities.city, communities.name)
      .limit(Number(limit));

    // If no care services found, return regular Canadian communities as services
    if (canadianServices.length === 0) {
      const regularCanadianCommunities = await db
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
          bilingual: communities.bilingual
        })
        .from(communities)
        .where(
          and(
            sql`${communities.county} = 'Canada'`,
            isNotNull(communities.phone),
            ne(communities.phone, '')
          )
        )
        .orderBy(communities.state, communities.city, communities.name)
        .limit(Number(limit));
      
      res.json(regularCanadianCommunities);
    } else {
      res.json(canadianServices);
    }

  } catch (error) {
    console.error('Error fetching Canadian care services:', error);
    res.status(500).json({ message: 'Failed to fetch Canadian care services' });
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