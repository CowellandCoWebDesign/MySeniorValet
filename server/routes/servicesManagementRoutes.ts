import { Router } from "express";
import { db } from "../db";
import { serviceCategories, serviceProviders, services, serviceAnalytics, serviceClicks, insertServiceCategorySchema, insertServiceProviderSchema, insertServiceSchema } from "@shared/schema";
import { eq, desc, sql, and } from "drizzle-orm";

const router = Router();

// ========== SERVICE CATEGORIES ==========

// Get all service categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await db
      .select({
        id: serviceCategories.id,
        name: serviceCategories.name,
        description: serviceCategories.description,
        icon: serviceCategories.icon,
        color: serviceCategories.color,
        isActive: serviceCategories.isActive,
        sortOrder: serviceCategories.sortOrder,
        serviceCount: sql<number>`count(${services.id})`.as('serviceCount'),
        createdAt: serviceCategories.createdAt,
        updatedAt: serviceCategories.updatedAt,
      })
      .from(serviceCategories)
      .leftJoin(services, eq(serviceCategories.id, services.categoryId))
      .groupBy(serviceCategories.id)
      .orderBy(serviceCategories.sortOrder, serviceCategories.name);

    res.json(categories);
  } catch (error) {
    console.error("Error fetching service categories:", error);
    res.status(500).json({ error: "Failed to fetch service categories" });
  }
});

// Create service category
router.post("/categories", async (req, res) => {
  try {
    const validatedData = insertServiceCategorySchema.parse(req.body);
    const [category] = await db.insert(serviceCategories).values(validatedData).returning();
    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating service category:", error);
    res.status(500).json({ error: "Failed to create service category" });
  }
});

// Update service category
router.put("/categories/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertServiceCategorySchema.parse(req.body);
    
    const [category] = await db
      .update(serviceCategories)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(serviceCategories.id, id))
      .returning();

    if (!category) {
      return res.status(404).json({ error: "Service category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error updating service category:", error);
    res.status(500).json({ error: "Failed to update service category" });
  }
});

// ========== SERVICE PROVIDERS ==========

// Get all service providers (public endpoint)
router.get("/providers", async (req, res) => {
  try {
    const { category, search, limit = 100, highQuality } = req.query;
    
    console.log("Fetching service providers with params:", { category, search, limit, highQuality });
    
    // Simple query to get all active providers
    const providers = await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.isActive, true))
      .orderBy(desc(serviceProviders.totalReviews), desc(serviceProviders.rating), serviceProviders.name)
      .limit(parseInt(limit as string) || 100);
    
    console.log(`Found ${providers.length} active providers`);
    
    // Filter by high quality if requested
    let filteredProviders = providers;
    if (highQuality === 'true') {
      filteredProviders = providers.filter(p => p.rating && typeof p.rating === 'number' && p.rating >= 4.0);
    }
    
    // Search filter
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      filteredProviders = filteredProviders.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply limit
    const limitNum = parseInt(limit as string) || 100;
    filteredProviders = filteredProviders.slice(0, limitNum);

    res.json(filteredProviders);
  } catch (error) {
    console.error("Error fetching service providers:", error);
    res.status(500).json({ error: "Failed to fetch service providers" });
  }
});

// Create service provider
router.post("/providers", async (req, res) => {
  try {
    const validatedData = insertServiceProviderSchema.parse(req.body);
    const [provider] = await db.insert(serviceProviders).values(validatedData).returning();
    res.status(201).json(provider);
  } catch (error) {
    console.error("Error creating service provider:", error);
    res.status(500).json({ error: "Failed to create service provider" });
  }
});

// Update service provider
router.put("/providers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertServiceProviderSchema.parse(req.body);
    
    const [provider] = await db
      .update(serviceProviders)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(serviceProviders.id, id))
      .returning();

    if (!provider) {
      return res.status(404).json({ error: "Service provider not found" });
    }

    res.json(provider);
  } catch (error) {
    console.error("Error updating service provider:", error);
    res.status(500).json({ error: "Failed to update service provider" });
  }
});

// ========== SERVICES ==========

// Get all services with analytics
router.get("/services", async (req, res) => {
  try {
    const { categoryId, providerId, isActive, isFeatured } = req.query;
    
    let query = db
      .select({
        id: services.id,
        categoryId: services.categoryId,
        providerId: services.providerId,
        name: services.name,
        description: services.description,
        shortDescription: services.shortDescription,
        features: services.features,
        pricing: services.pricing,
        serviceType: services.serviceType,
        deliveryMethod: services.deliveryMethod,
        availability: services.availability,
        externalUrl: services.externalUrl,
        affiliateCode: services.affiliateCode,
        productId: services.productId,
        imageUrl: services.imageUrl,
        isActive: services.isActive,
        isFeatured: services.isFeatured,
        sortOrder: services.sortOrder,
        metadata: services.metadata,
        categoryName: serviceCategories.name,
        providerName: serviceProviders.name,
        providerLogo: serviceProviders.logo,
        createdAt: services.createdAt,
        updatedAt: services.updatedAt,
      })
      .from(services)
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .leftJoin(serviceProviders, eq(services.providerId, serviceProviders.id));

    // Apply filters
    const conditions = [];
    if (categoryId) conditions.push(eq(services.categoryId, parseInt(categoryId as string)));
    if (providerId) conditions.push(eq(services.providerId, parseInt(providerId as string)));
    if (isActive !== undefined) conditions.push(eq(services.isActive, isActive === 'true'));
    if (isFeatured !== undefined) conditions.push(eq(services.isFeatured, isFeatured === 'true'));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const servicesList = await query.orderBy(desc(services.isFeatured), services.sortOrder, services.name);

    res.json(servicesList);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// Create service
router.post("/services", async (req, res) => {
  try {
    const validatedData = insertServiceSchema.parse(req.body);
    const [service] = await db.insert(services).values(validatedData).returning();
    res.status(201).json(service);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ error: "Failed to create service" });
  }
});

// Update service
router.put("/services/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertServiceSchema.parse(req.body);
    
    const [service] = await db
      .update(services)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Failed to update service" });
  }
});

// Track service click
router.post("/services/:id/click", async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    const userId = req.user?.id || null;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');
    const referrer = req.get('Referer');

    // Record the click
    await db.insert(serviceClicks).values({
      serviceId,
      userId,
      ipAddress,
      userAgent,
      referrer,
    });

    // Update daily analytics
    const today = new Date().toISOString().split('T')[0];
    
    // Get the service to find the provider
    const [service] = await db
      .select({ providerId: services.providerId })
      .from(services)
      .where(eq(services.id, serviceId));

    if (service) {
      await db
        .insert(serviceAnalytics)
        .values({
          serviceId,
          providerId: service.providerId,
          date: today,
          clicks: 1,
          views: 0,
          conversions: 0,
          revenue: '0',
          impressions: 0,
        })
        .onConflictDoUpdate({
          target: [serviceAnalytics.serviceId, serviceAnalytics.date],
          set: {
            clicks: sql`${serviceAnalytics.clicks} + 1`,
          },
        });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error tracking service click:", error);
    res.status(500).json({ error: "Failed to track service click" });
  }
});

// ========== ANALYTICS ==========

// Get service analytics dashboard
router.get("/analytics/dashboard", async (req, res) => {
  try {
    const { startDate, endDate, providerId } = req.query;
    
    let analyticsQuery = db
      .select({
        serviceId: serviceAnalytics.serviceId,
        serviceName: services.name,
        providerName: serviceProviders.name,
        date: serviceAnalytics.date,
        views: serviceAnalytics.views,
        clicks: serviceAnalytics.clicks,
        conversions: serviceAnalytics.conversions,
        revenue: serviceAnalytics.revenue,
        impressions: serviceAnalytics.impressions,
        engagementRate: serviceAnalytics.engagementRate,
        conversionRate: serviceAnalytics.conversionRate,
      })
      .from(serviceAnalytics)
      .leftJoin(services, eq(serviceAnalytics.serviceId, services.id))
      .leftJoin(serviceProviders, eq(serviceAnalytics.providerId, serviceProviders.id));

    // Apply filters
    const conditions = [];
    if (startDate) conditions.push(sql`${serviceAnalytics.date} >= ${startDate}`);
    if (endDate) conditions.push(sql`${serviceAnalytics.date} <= ${endDate}`);
    if (providerId) conditions.push(eq(serviceAnalytics.providerId, parseInt(providerId as string)));

    if (conditions.length > 0) {
      analyticsQuery = analyticsQuery.where(and(...conditions));
    }

    const analytics = await analyticsQuery.orderBy(desc(serviceAnalytics.date));

    // Get summary stats
    const summaryQuery = db
      .select({
        totalViews: sql<number>`sum(${serviceAnalytics.views})`.as('totalViews'),
        totalClicks: sql<number>`sum(${serviceAnalytics.clicks})`.as('totalClicks'),
        totalConversions: sql<number>`sum(${serviceAnalytics.conversions})`.as('totalConversions'),
        totalRevenue: sql<number>`sum(${serviceAnalytics.revenue})`.as('totalRevenue'),
        avgEngagementRate: sql<number>`avg(${serviceAnalytics.engagementRate})`.as('avgEngagementRate'),
        avgConversionRate: sql<number>`avg(${serviceAnalytics.conversionRate})`.as('avgConversionRate'),
      })
      .from(serviceAnalytics);

    if (conditions.length > 0) {
      summaryQuery.where(and(...conditions));
    }

    const [summary] = await summaryQuery;

    res.json({
      analytics,
      summary: summary || {
        totalViews: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalRevenue: 0,
        avgEngagementRate: 0,
        avgConversionRate: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics dashboard:", error);
    res.status(500).json({ error: "Failed to fetch analytics dashboard" });
  }
});

// Get top performing services
router.get("/analytics/top-services", async (req, res) => {
  try {
    const { limit = 10, metric = 'clicks' } = req.query;
    
    const topServices = await db
      .select({
        serviceId: serviceAnalytics.serviceId,
        serviceName: services.name,
        categoryName: serviceCategories.name,
        providerName: serviceProviders.name,
        totalViews: sql<number>`sum(${serviceAnalytics.views})`.as('totalViews'),
        totalClicks: sql<number>`sum(${serviceAnalytics.clicks})`.as('totalClicks'),
        totalConversions: sql<number>`sum(${serviceAnalytics.conversions})`.as('totalConversions'),
        totalRevenue: sql<number>`sum(${serviceAnalytics.revenue})`.as('totalRevenue'),
      })
      .from(serviceAnalytics)
      .leftJoin(services, eq(serviceAnalytics.serviceId, services.id))
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .leftJoin(serviceProviders, eq(serviceAnalytics.providerId, serviceProviders.id))
      .groupBy(serviceAnalytics.serviceId, services.name, serviceCategories.name, serviceProviders.name)
      .orderBy(desc(sql`sum(${serviceAnalytics[metric as keyof typeof serviceAnalytics]})`))
      .limit(parseInt(limit as string));

    res.json(topServices);
  } catch (error) {
    console.error("Error fetching top services:", error);
    res.status(500).json({ error: "Failed to fetch top services" });
  }
});

export default router;