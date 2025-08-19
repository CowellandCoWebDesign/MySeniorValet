import { Router } from "express";
import { db } from "../db";
import { communities } from "../../shared/schema";
import { sql, or, and, ne, isNotNull, ilike } from "drizzle-orm";

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
            ilike(communities.name, '%home care%'),
            ilike(communities.name, '%caregiving%'),
            ilike(communities.name, '%visiting%'),
            ilike(communities.name, '%home health%')
          ),
          // Exclude placement agencies disguised as home care
          sql`${communities.name} NOT ILIKE '%placement%'`
        ),
        // Adult day care
        or(
          sql`${communities.careTypes}::text ILIKE '%adult day%'`,
          ilike(communities.name, '%adult day%'),
          ilike(communities.name, '%day program%')
        ),
        // Therapy services
        or(
          sql`${communities.careTypes}::text ILIKE '%therapy%'`,
          ilike(communities.name, '%therapy%'),
          ilike(communities.name, '%rehabilitation%'),
          ilike(communities.name, '%physical therapy%'),
          ilike(communities.name, '%occupational%')
        ),
        // Hospice care
        or(
          sql`${communities.careTypes}::text ILIKE '%hospice%'`,
          ilike(communities.name, '%hospice%')
        ),
        // Respite care
        or(
          sql`${communities.careTypes}::text ILIKE '%respite%'`,
          ilike(communities.name, '%respite%')
        ),
        // Personal care services
        or(
          sql`${communities.careTypes}::text ILIKE '%personal care%'`,
          ilike(communities.name, '%personal care%')
        ),
        // Dental services
        or(
          sql`${communities.careTypes}::text ILIKE '%dental%'`,
          ilike(communities.name, '%dental%')
        ),
        // Palliative care services
        or(
          sql`${communities.careTypes}::text ILIKE '%palliative%'`,
          ilike(communities.name, '%palliative%'),
          ilike(communities.name, '%comfort care%')
        ),
        // Nutrition services
        or(
          sql`${communities.careTypes}::text ILIKE '%nutrition%'`,
          ilike(communities.name, '%nutrition%'),
          ilike(communities.name, '%dietitian%'),
          ilike(communities.name, '%dietician%')
        ),
        // Companion care services
        or(
          sql`${communities.careTypes}::text ILIKE '%companion%'`,
          ilike(communities.name, '%companion%'),
          ilike(communities.name, '%visiting angels%'),
          ilike(communities.name, '%comfort keepers%')
        ),
        // Medical equipment services
        or(
          sql`${communities.careTypes}::text ILIKE '%medical equipment%'`,
          ilike(communities.name, '%medical equipment%'),
          ilike(communities.name, '%medical supply%'),
          ilike(communities.name, '%healthcare equipment%'),
          ilike(communities.name, '%apria%'),
          ilike(communities.name, '%lincare%')
        ),
        // Skilled nursing services
        or(
          sql`${communities.careTypes}::text ILIKE '%skilled nursing%'`,
          ilike(communities.name, '%skilled nursing%'),
          sql`COALESCE(${communities.community_subtype}, '') ILIKE '%skilled nursing%'`,
          ilike(communities.name, '%snf%')
        )
      ),
      // Must have phone for verification
      isNotNull(communities.phone),
      ne(communities.phone, ''),
      // Exclude any placement agencies
      sql`${communities.name} NOT ILIKE '%placement%'`,
      sql`${communities.name} NOT ILIKE '%referral%'`,
      sql`${communities.name} NOT ILIKE '%advisor%'`,
      sql`${communities.name} NOT ILIKE '%locator%'`
    );

    // Add location filter if specified
    if (location) {
      whereConditions = and(
        whereConditions,
        or(
          ilike(communities.city, `%${String(location).toLowerCase()}%`),
          ilike(communities.state, `%${String(location).toLowerCase()}%`)
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
        // Categorize services - simplified to avoid SQL syntax issues
        serviceCategory: sql<string>`'Care Services'`,
        // Add rating from metadata if available
        rating: communities.rating,
        // Add email if available
        email: communities.email
      })
      .from(communities)
      .where(whereConditions)
      .orderBy(communities.name);
    
    // Apply limit (default to 100 if not specified)
    careServicesQuery = careServicesQuery.limit(limit ? Number(limit) : 100);
      
    const queryResult = await careServicesQuery;
    
    console.log('Query returned', queryResult.length, 'services');
    if (queryResult.length > 0) {
      console.log('First few services:', queryResult.slice(0, 3).map(s => ({
        name: s.name,
        category: s.serviceCategory,
        careTypes: s.careTypes
      })));
    }

    // Remove duplicates based on phone number and address
    const uniqueServicesMap = new Map();
    queryResult.forEach(service => {
      const key = `${service.phone}-${service.address}`.toLowerCase();
      if (!uniqueServicesMap.has(key)) {
        uniqueServicesMap.set(key, service);
      }
    });
    
    let uniqueServices = Array.from(uniqueServicesMap.values());
    console.log('After deduplication:', uniqueServices.length, 'services');

    // Add category filter if specified
    if (category) {
      console.log('Filtering for category:', category);
      const beforeFilter = uniqueServices.length;
      uniqueServices = uniqueServices.filter(service => 
        service.serviceCategory.toLowerCase().includes(String(category).toLowerCase())
      );
      console.log('After category filter:', uniqueServices.length, 'services (was', beforeFilter, ')');
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
        'Personal Care Services',
        'Dental Services',
        'Palliative Care',
        'Nutrition Services',
        'Companion Care',
        'Medical Equipment',
        'Skilled Nursing'
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
        categoryFilter = sql`LOWER(${communities.careTypes}::text) LIKE '%adult day%'`;
        break;
      case 'therapy':
        categoryFilter = sql`LOWER(${communities.careTypes}::text) LIKE '%therapy%'`;
        break;
      case 'hospice':
        categoryFilter = sql`LOWER(${communities.careTypes}::text) LIKE '%hospice%'`;
        break;
      case 'respite':
        categoryFilter = sql`LOWER(${communities.careTypes}::text) LIKE '%respite%'`;
        break;
      case 'personal-care':
        categoryFilter = sql`LOWER(${communities.careTypes}::text) LIKE '%personal care%'`;
        break;
      case 'dental':
        categoryFilter = or(
          sql`LOWER(${communities.careTypes}::text) LIKE '%dental%'`,
          like(sql`LOWER(${communities.name})`, '%dental%')
        );
        break;
      case 'palliative':
        categoryFilter = or(
          sql`LOWER(${communities.careTypes}::text) LIKE '%palliative%'`,
          like(sql`LOWER(${communities.name})`, '%palliative%'),
          like(sql`LOWER(${communities.name})`, '%comfort care%')
        );
        break;
      case 'nutrition':
        categoryFilter = or(
          sql`LOWER(${communities.careTypes}::text) LIKE '%nutrition%'`,
          like(sql`LOWER(${communities.name})`, '%nutrition%'),
          like(sql`LOWER(${communities.name})`, '%dietitian%'),
          like(sql`LOWER(${communities.name})`, '%dietician%')
        );
        break;
      case 'companion':
        categoryFilter = or(
          sql`LOWER(${communities.careTypes}::text) LIKE '%companion%'`,
          like(sql`LOWER(${communities.name})`, '%companion%'),
          like(sql`LOWER(${communities.name})`, '%visiting angels%'),
          like(sql`LOWER(${communities.name})`, '%comfort keepers%')
        );
        break;
      case 'medical':
      case 'medical-equipment':
        categoryFilter = or(
          sql`LOWER(${communities.careTypes}::text) LIKE '%medical equipment%'`,
          like(sql`LOWER(${communities.name})`, '%medical equipment%'),
          like(sql`LOWER(${communities.name})`, '%medical supply%'),
          like(sql`LOWER(${communities.name})`, '%healthcare equipment%'),
          like(sql`LOWER(${communities.name})`, '%apria%'),
          like(sql`LOWER(${communities.name})`, '%lincare%')
        );
        break;
      case 'skilled':
      case 'skilled-nursing':
        categoryFilter = or(
          sql`LOWER(${communities.careTypes}::text) LIKE '%skilled nursing%'`,
          like(sql`LOWER(${communities.name})`, '%skilled nursing%'),
          sql`LOWER(COALESCE(${communities.community_subtype}, '')) LIKE '%skilled nursing%'`,
          like(sql`LOWER(${communities.name})`, '%snf%')
        );
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
          ilike(communities.city, `%${String(location).toLowerCase()}%`),
          ilike(communities.state, `%${String(location).toLowerCase()}%`)
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

// Get care services analytics summary
router.get('/care-services/analytics/summary', async (req, res) => {
  try {
    const analytics = await db
      .select({
        totalServices: sql<number>`COUNT(*)`,
        homeCareServices: sql<number>`COUNT(CASE WHEN (LOWER(${communities.name}) LIKE '%home care%' OR LOWER(${communities.name}) LIKE '%caregiving%' OR LOWER(${communities.name}) LIKE '%visiting%' OR LOWER(${communities.name}) LIKE '%home health%') AND LOWER(${communities.name}) NOT LIKE '%placement%' THEN 1 END)`,
        adultDayServices: sql<number>`COUNT(CASE WHEN (LOWER(${communities.careTypes}::text) LIKE '%adult day%' OR LOWER(${communities.name}) LIKE '%adult day%' OR LOWER(${communities.name}) LIKE '%day program%') THEN 1 END)`,
        personalCareServices: sql<number>`COUNT(CASE WHEN (LOWER(${communities.careTypes}::text) LIKE '%personal care%' OR LOWER(${communities.name}) LIKE '%personal care%') THEN 1 END)`,
        companionCareServices: sql<number>`COUNT(CASE WHEN (LOWER(${communities.careTypes}::text) LIKE '%companion%' OR LOWER(${communities.name}) LIKE '%companion%') THEN 1 END)`,
        nursingServices: sql<number>`COUNT(CASE WHEN (LOWER(${communities.careTypes}::text) LIKE '%nursing%' OR LOWER(${communities.name}) LIKE '%nursing%') THEN 1 END)`,
        dentalServices: sql<number>`COUNT(CASE WHEN (LOWER(${communities.careTypes}::text) LIKE '%dental%' OR LOWER(${communities.name}) LIKE '%dental%') THEN 1 END)`,
        palliativeServices: sql<number>`COUNT(CASE WHEN (LOWER(${communities.careTypes}::text) LIKE '%palliative%' OR LOWER(${communities.name}) LIKE '%palliative%' OR LOWER(${communities.name}) LIKE '%comfort care%') THEN 1 END)`,
        nutritionServices: sql<number>`COUNT(CASE WHEN (LOWER(${communities.careTypes}::text) LIKE '%nutrition%' OR LOWER(${communities.name}) LIKE '%nutrition%' OR LOWER(${communities.name}) LIKE '%dietitian%' OR LOWER(${communities.name}) LIKE '%dietician%') THEN 1 END)`
      })
      .from(communities)
      .where(
        and(
          or(
            like(sql`LOWER(${communities.name})`, '%home care%'),
            like(sql`LOWER(${communities.name})`, '%caregiving%'),
            like(sql`LOWER(${communities.name})`, '%visiting%'),
            like(sql`LOWER(${communities.name})`, '%home health%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%adult day%'`,
            like(sql`LOWER(${communities.name})`, '%adult day%'),
            like(sql`LOWER(${communities.name})`, '%day program%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%personal care%'`,
            like(sql`LOWER(${communities.name})`, '%personal care%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%companion%'`,
            like(sql`LOWER(${communities.name})`, '%companion%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%nursing%'`,
            like(sql`LOWER(${communities.name})`, '%nursing%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%dental%'`,
            like(sql`LOWER(${communities.name})`, '%dental%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%palliative%'`,
            like(sql`LOWER(${communities.name})`, '%palliative%'),
            like(sql`LOWER(${communities.name})`, '%comfort care%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%nutrition%'`,
            like(sql`LOWER(${communities.name})`, '%nutrition%'),
            like(sql`LOWER(${communities.name})`, '%dietitian%'),
            like(sql`LOWER(${communities.name})`, '%dietician%')
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
    console.error('Error fetching care services analytics summary:', error);
    res.status(500).json({ message: 'Failed to fetch analytics summary' });
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
        dentalServices: sql<number>`COUNT(CASE WHEN (LOWER(${communities.careTypes}::text) LIKE '%dental%' OR LOWER(${communities.name}) LIKE '%dental%') THEN 1 END)`,
        palliativeServices: sql<number>`COUNT(CASE WHEN (LOWER(${communities.careTypes}::text) LIKE '%palliative%' OR LOWER(${communities.name}) LIKE '%palliative%' OR LOWER(${communities.name}) LIKE '%comfort care%') THEN 1 END)`,
        nutritionServices: sql<number>`COUNT(CASE WHEN (LOWER(${communities.careTypes}::text) LIKE '%nutrition%' OR LOWER(${communities.name}) LIKE '%nutrition%' OR LOWER(${communities.name}) LIKE '%dietitian%' OR LOWER(${communities.name}) LIKE '%dietician%') THEN 1 END)`,
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
            sql`LOWER(${communities.careTypes}::text) LIKE '%adult day%'`,
            like(sql`LOWER(${communities.name})`, '%adult day%'),
            like(sql`LOWER(${communities.name})`, '%day program%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%therapy%'`,
            like(sql`LOWER(${communities.name})`, '%therapy%'),
            like(sql`LOWER(${communities.name})`, '%rehabilitation%'),
            like(sql`LOWER(${communities.name})`, '%physical therapy%'),
            like(sql`LOWER(${communities.name})`, '%occupational%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%hospice%'`,
            like(sql`LOWER(${communities.name})`, '%hospice%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%respite%'`,
            like(sql`LOWER(${communities.name})`, '%respite%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%personal care%'`,
            like(sql`LOWER(${communities.name})`, '%personal care%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%dental%'`,
            like(sql`LOWER(${communities.name})`, '%dental%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%palliative%'`,
            like(sql`LOWER(${communities.name})`, '%palliative%'),
            like(sql`LOWER(${communities.name})`, '%comfort care%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%nutrition%'`,
            like(sql`LOWER(${communities.name})`, '%nutrition%'),
            like(sql`LOWER(${communities.name})`, '%dietitian%'),
            like(sql`LOWER(${communities.name})`, '%dietician%')
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
            sql`LOWER(${communities.careTypes}::text) LIKE '%adult day%'`,
            like(sql`LOWER(${communities.name})`, '%adult day%'),
            like(sql`LOWER(${communities.name})`, '%day program%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%therapy%'`,
            like(sql`LOWER(${communities.name})`, '%therapy%'),
            like(sql`LOWER(${communities.name})`, '%rehabilitation%'),
            like(sql`LOWER(${communities.name})`, '%physical therapy%'),
            like(sql`LOWER(${communities.name})`, '%occupational%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%hospice%'`,
            like(sql`LOWER(${communities.name})`, '%hospice%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%respite%'`,
            like(sql`LOWER(${communities.name})`, '%respite%'),
            sql`LOWER(${communities.careTypes}::text) LIKE '%personal care%'`,
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
        sql`LOWER(${communities.careTypes}::text) LIKE '%adult day%'`,
        sql`LOWER(${communities.careTypes}::text) LIKE '%therapy%'`,
        sql`LOWER(${communities.careTypes}::text) LIKE '%hospice%'`,
        sql`LOWER(${communities.careTypes}::text) LIKE '%respite%'`,
        sql`LOWER(${communities.careTypes}::text) LIKE '%personal care%'`
      ),
      ilike(communities.name, `%${String(q).toLowerCase()}%`),
      isNotNull(communities.phone)
    );

    // Add location filter if specified
    if (location) {
      whereConditions = and(
        whereConditions,
        or(
          ilike(communities.city, `%${String(location).toLowerCase()}%`),
          ilike(communities.state, `%${String(location).toLowerCase()}%`)
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