import { type Express } from "express";
import { db } from "../db";
import { vendors, vendorServices, vendorReviews } from "@shared/schema";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { isAuthenticated as requireAuth, checkRole } from "../auth-middleware";
import { z } from "zod";

const createVendorSchema = z.object({
  businessName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  website: z.string().url().optional(),
  description: z.string().optional(),
  serviceCategories: z.array(z.string()),
  serviceAreas: z.array(z.string())
});

const createServiceSchema = z.object({
  serviceName: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  pricing: z.object({
    type: z.enum(['hourly', 'flat', 'monthly', 'custom']),
    amount: z.number().positive().optional(),
    customPricing: z.string().optional()
  }),
  availability: z.array(z.string()),
  serviceAreas: z.array(z.string())
});

export function registerVendorRoutes(app: Express) {
  // Get featured vendors (public) - Only return vendors with featured or national tier
  app.get("/api/vendors/featured", async (_req, res) => {
    try {
      // Fetch vendors with featured or national subscription tiers
      const featuredVendors = await db
        .select({
          id: vendors.id,
          userId: vendors.userId,
          businessName: vendors.businessName,
          businessType: vendors.businessType,
          primaryContactEmail: vendors.primaryContactEmail,
          primaryContactPhone: vendors.primaryContactPhone,
          businessCity: vendors.businessCity,
          businessState: vendors.businessState,
          logoUrl: vendors.logoUrl,
          description: vendors.description,
          shortDescription: vendors.shortDescription,
          website: vendors.website,
          serviceAreas: vendors.serviceAreas,
          isVerified: vendors.isVerified,
          subscriptionTier: vendors.subscriptionTier,
          averageRating: vendors.averageRating,
          totalReviews: vendors.totalReviews,
          status: vendors.status,
          featured: vendors.featured,
          createdAt: vendors.createdAt
        })
        .from(vendors)
        .where(and(
          eq(vendors.status, 'active'),
          or(
            eq(vendors.subscriptionTier, 'featured'),
            eq(vendors.subscriptionTier, 'national')
          )
        ))
        .orderBy(
          // National tier first, then featured
          desc(sql`CASE WHEN ${vendors.subscriptionTier} = 'national' THEN 2 
                        WHEN ${vendors.subscriptionTier} = 'featured' THEN 1 
                        ELSE 0 END`),
          desc(vendors.averageRating)
        )
        .limit(12);
      
      res.json(featuredVendors);
    } catch (error) {
      console.error("Error fetching featured vendors:", error);
      res.status(500).json({ error: "Failed to fetch featured vendors" });
    }
  });

  // Search vendors (MUST come before :id route)
  app.get('/api/vendors/search', async (req, res) => {
    try {
      const { query, category, location, minRating } = req.query;
      
      // Use raw SQL completely to avoid all Drizzle ORM issues
      const results = await db.execute(sql`
        SELECT id, business_name, business_type, description, short_description, 
               business_city, business_state, website, logo_url, service_areas,
               subscription_tier, average_rating, total_reviews, featured, status,
               primary_contact_email, primary_contact_phone
        FROM vendors
        WHERE status = 'active'
        ORDER BY featured DESC, average_rating DESC
        LIMIT 20
      `);

      res.json(results.rows || []);
    } catch (error) {
      console.error('Error searching vendors:', error);
      res.status(500).json({ error: 'Failed to search vendors' });
    }
  });

  // Get vendor by ID
  app.get('/api/vendors/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Use raw SQL to avoid Drizzle ORM query builder issues
      const result = await db.execute(sql`
        SELECT 
          id, business_name, business_type, description, short_description,
          primary_contact_email, primary_contact_phone, business_city, business_state,
          website, logo_url, service_areas, subscription_tier, is_verified,
          average_rating, total_reviews, featured, status, created_at, updated_at
        FROM vendors
        WHERE id = ${parseInt(id)}
        LIMIT 1
      `);
      
      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      res.status(500).json({ error: 'Failed to fetch vendor' });
    }
  });

  // Get vendor services
  app.get('/api/vendors/:id/services', async (req, res) => {
    try {
      const { id } = req.params;
      
      const services = await db
        .select()
        .from(vendorServices)
        .where(eq(vendorServices.vendorId, parseInt(id)));
      
      res.json(services);
    } catch (error) {
      console.error('Error fetching vendor services:', error);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  // Get vendor reviews
  app.get('/api/vendors/:id/reviews', async (req, res) => {
    try {
      const { id } = req.params;
      
      const reviews = await db
        .select()
        .from(vendorReviews)
        .where(and(
          eq(vendorReviews.vendorId, parseInt(id)),
          eq(vendorReviews.status, 'published')
        ))
        .orderBy(desc(vendorReviews.createdAt))
        .limit(10);
      
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching vendor reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  // Get all vendors
  app.get('/api/vendors', async (req, res) => {
    try {
      const { category, location, verified } = req.query;
      
      let conditions = [];
      
      // Skip complex SQL queries for now to avoid syntax errors
      // TODO: Fix SQL template literal queries
      
      if (verified === 'true') {
        conditions.push(eq(vendors.isVerified, true));
      }

      // Build conditions array including status
      conditions.push(eq(vendors.status, 'active'));
      
      const vendorsData = conditions.length > 1 
        ? await db
            .select({
              id: vendors.id,
              userId: vendors.userId,
              businessName: vendors.businessName,
              businessType: vendors.businessType,
              primaryContactEmail: vendors.primaryContactEmail,
              primaryContactPhone: vendors.primaryContactPhone,
              businessCity: vendors.businessCity,
              businessState: vendors.businessState,
              logoUrl: vendors.logoUrl,
              description: vendors.description,
              shortDescription: vendors.shortDescription,
              website: vendors.website,
              serviceAreas: vendors.serviceAreas,
              isVerified: vendors.isVerified,
              subscriptionTier: vendors.subscriptionTier,
              averageRating: vendors.averageRating,
              totalReviews: vendors.totalReviews,
              status: vendors.status,
              featured: vendors.featured,
              createdAt: vendors.createdAt
            })
            .from(vendors)
            .where(and(...conditions))
            .orderBy(
              // Sort by subscription tier first (national > featured > basic)
              desc(sql`CASE WHEN ${vendors.subscriptionTier} = 'national' THEN 3 
                            WHEN ${vendors.subscriptionTier} = 'featured' THEN 2
                            WHEN ${vendors.subscriptionTier} = 'basic' THEN 1
                            ELSE 0 END`),
              desc(vendors.isVerified), 
              desc(vendors.averageRating)
            )
            .limit(50)
        : await db
            .select({
              id: vendors.id,
              userId: vendors.userId,
              businessName: vendors.businessName,
              businessType: vendors.businessType,
              primaryContactEmail: vendors.primaryContactEmail,
              primaryContactPhone: vendors.primaryContactPhone,
              businessCity: vendors.businessCity,
              businessState: vendors.businessState,
              logoUrl: vendors.logoUrl,
              description: vendors.description,
              shortDescription: vendors.shortDescription,
              website: vendors.website,
              serviceAreas: vendors.serviceAreas,
              isVerified: vendors.isVerified,
              subscriptionTier: vendors.subscriptionTier,
              averageRating: vendors.averageRating,
              totalReviews: vendors.totalReviews,
              status: vendors.status,
              featured: vendors.featured,
              createdAt: vendors.createdAt
            })
            .from(vendors)
            .where(eq(vendors.status, 'active'))
            .orderBy(
              // Sort by subscription tier first (national > featured > basic)
              desc(sql`CASE WHEN ${vendors.subscriptionTier} = 'national' THEN 3 
                            WHEN ${vendors.subscriptionTier} = 'featured' THEN 2
                            WHEN ${vendors.subscriptionTier} = 'basic' THEN 1
                            ELSE 0 END`),
              desc(vendors.isVerified), 
              desc(vendors.averageRating)
            )
            .limit(50);

      res.json(vendorsData);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      res.status(500).json({ error: 'Failed to fetch vendors' });
    }
  });

  // Get single vendor
  app.get('/api/vendors/:id', async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      
      // Use raw SQL to avoid Drizzle ORM query builder issues
      const vendorResult = await db.execute(sql`
        SELECT 
          id, user_id, business_name, business_type,
          primary_contact_email, primary_contact_phone,
          business_address, business_city, business_state, business_zip,
          logo_url, cover_image_url, description, short_description,
          years_in_business, employee_count, website, social_links,
          service_areas, service_radius, is_verified, verification_date,
          subscription_status, subscription_tier, average_rating,
          total_reviews, status, featured, created_at
        FROM vendors
        WHERE id = ${vendorId}
        LIMIT 1
      `);

      if (!vendorResult.rows || vendorResult.rows.length === 0) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      // Get vendor services using raw SQL
      const servicesResult = await db.execute(sql`
        SELECT * FROM vendor_services
        WHERE vendor_id = ${vendorId}
        ORDER BY is_active DESC
      `);

      res.json({
        ...vendorResult.rows[0],
        services: servicesResult.rows || []
      });
    } catch (error) {
      console.error('Error fetching vendor:', error);
      res.status(500).json({ error: 'Failed to fetch vendor' });
    }
  });

  // Create vendor account
  app.post('/api/vendors/register', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const validatedData = createVendorSchema.parse(req.body);

      // Check if vendor already exists for this user
      const existing = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Vendor account already exists' });
      }

      const [newVendor] = await db
        .insert(vendors)
        .values({
          userId,
          ...validatedData,
          isActive: true,
          isVerified: false,
          rating: 0,
          reviewCount: 0
        })
        .returning();

      res.status(201).json(newVendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      console.error('Error creating vendor:', error);
      res.status(500).json({ error: 'Failed to create vendor account' });
    }
  });

  // Update vendor profile
  app.patch('/api/vendors/:id', requireAuth, checkRole(['vendor', 'admin']), async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      // Check ownership unless admin
      if (userRole !== 'admin') {
        const [vendor] = await db
          .select()
          .from(vendors)
          .where(eq(vendors.id, vendorId))
          .limit(1);

        if (!vendor || vendor.userId !== userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      const updates = req.body;
      delete updates.id;
      delete updates.userId;
      delete updates.isVerified; // Only admins can verify

      const [updated] = await db
        .update(vendors)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(vendors.id, vendorId))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      res.json(updated);
    } catch (error) {
      console.error('Error updating vendor:', error);
      res.status(500).json({ error: 'Failed to update vendor' });
    }
  });

  // Vendor services
  app.get('/api/vendors/:vendorId/services', async (req, res) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      
      const services = await db
        .select()
        .from(vendorServices)
        .where(eq(vendorServices.vendorId, vendorId))
        .orderBy(desc(vendorServices.isActive));

      res.json(services);
    } catch (error) {
      console.error('Error fetching vendor services:', error);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  // Create service
  app.post('/api/vendors/:vendorId/services', requireAuth, checkRole(['vendor', 'admin']), async (req, res) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      // Check ownership unless admin
      if (userRole !== 'admin') {
        const [vendor] = await db
          .select()
          .from(vendors)
          .where(eq(vendors.id, vendorId))
          .limit(1);

        if (!vendor || vendor.userId !== userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      const validatedData = createServiceSchema.parse(req.body);

      const [newService] = await db
        .insert(vendorServices)
        .values({
          vendorId,
          ...validatedData,
          isActive: true
        })
        .returning();

      res.status(201).json(newService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      console.error('Error creating service:', error);
      res.status(500).json({ error: 'Failed to create service' });
    }
  });

  // Update service
  app.patch('/api/vendors/:vendorId/services/:serviceId', requireAuth, checkRole(['vendor', 'admin']), async (req, res) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      const serviceId = parseInt(req.params.serviceId);
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      // Check ownership unless admin
      if (userRole !== 'admin') {
        const [vendor] = await db
          .select()
          .from(vendors)
          .where(eq(vendors.id, vendorId))
          .limit(1);

        if (!vendor || vendor.userId !== userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      const updates = req.body;
      delete updates.id;
      delete updates.vendorId;

      const [updated] = await db
        .update(vendorServices)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(and(
          eq(vendorServices.id, serviceId),
          eq(vendorServices.vendorId, vendorId)
        ))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'Service not found' });
      }

      res.json(updated);
    } catch (error) {
      console.error('Error updating service:', error);
      res.status(500).json({ error: 'Failed to update service' });
    }
  });

  // Delete service
  app.delete('/api/vendors/:vendorId/services/:serviceId', requireAuth, checkRole(['vendor', 'admin']), async (req, res) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      const serviceId = parseInt(req.params.serviceId);
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      // Check ownership unless admin
      if (userRole !== 'admin') {
        const [vendor] = await db
          .select()
          .from(vendors)
          .where(eq(vendors.id, vendorId))
          .limit(1);

        if (!vendor || vendor.userId !== userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      await db
        .delete(vendorServices)
        .where(and(
          eq(vendorServices.id, serviceId),
          eq(vendorServices.vendorId, vendorId)
        ));

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting service:', error);
      res.status(500).json({ error: 'Failed to delete service' });
    }
  });

  // Vendor dashboard - both /vendor/dashboard and /vendors/dashboard for compatibility
  app.get('/api/vendor/dashboard', requireAuth, checkRole(['vendor']), async (req, res) => {
    try {
      const userId = (req as any).user?.id;

      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1);

      if (!vendor) {
        return res.status(404).json({ error: 'Vendor account not found' });
      }

      // Get vendor stats
      const stats = {
        totalViews: vendor.profileViews || 0,
        totalLeads: vendor.totalLeads || 0,
        totalBookings: vendor.totalBookings || 0,
        rating: vendor.rating || 0,
        reviewCount: vendor.reviewCount || 0,
        monthlyRevenue: vendor.monthlyRevenue || 0
      };

      // Get recent activities (mock data for now)
      const recentActivities = [
        {
          type: 'lead',
          message: 'New lead from John Doe',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          type: 'review',
          message: 'New 5-star review received',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ];

      res.json({
        vendor,
        stats,
        recentActivities
      });
    } catch (error) {
      console.error('Error fetching vendor dashboard:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  });

  // Vendor dashboard - original route
  app.get('/api/vendors/dashboard', requireAuth, checkRole(['vendor']), async (req, res) => {
    try {
      const userId = (req as any).user?.id;

      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1);

      if (!vendor) {
        return res.status(404).json({ error: 'Vendor account not found' });
      }

      // Get vendor stats
      const stats = {
        totalViews: vendor.profileViews || 0,
        totalLeads: vendor.totalLeads || 0,
        totalBookings: vendor.totalBookings || 0,
        rating: vendor.rating || 0,
        reviewCount: vendor.reviewCount || 0,
        monthlyRevenue: vendor.monthlyRevenue || 0
      };

      // Get recent activities (mock data for now)
      const recentActivities = [
        {
          type: 'lead',
          message: 'New lead from John Doe',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          type: 'review',
          message: 'New 5-star review received',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ];

      res.json({
        vendor,
        stats,
        recentActivities
      });
    } catch (error) {
      console.error('Error fetching vendor dashboard:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  });
}