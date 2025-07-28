import { type Express } from "express";
import { db } from "../db";
import { vendorServices, vendorServiceCategories, vendors } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export function registerMoveInServicesRoutes(app: Express) {
  // Get all Move-In Essential services
  app.get("/api/vendor-services/category/move-in-essentials", async (req, res) => {
    try {
      const services = await db
        .select({
          id: vendorServices.id,
          serviceName: vendorServices.service_name,
          serviceDescription: vendorServices.service_description,
          serviceFeatures: vendorServices.service_features,
          pricingModel: vendorServices.pricing_model,
          priceMin: vendorServices.price_min,
          priceMax: vendorServices.price_max,
          priceUnit: vendorServices.price_unit,
          serviceAreas: vendorServices.service_areas,
          completionTimeDays: vendorServices.completion_time_days,
          successRate: vendorServices.success_rate,
          isActive: vendorServices.is_active,
          featured: vendorServices.featured,
          createdAt: vendorServices.created_at,
          updatedAt: vendorServices.updated_at
        })
        .from(vendorServices)
        .leftJoin(vendorServiceCategories, eq(vendorServices.category_id, vendorServiceCategories.id))
        .where(
          and(
            eq(vendorServiceCategories.slug, 'move-in-essentials'),
            eq(vendorServices.is_active, true)
          )
        )
        .orderBy(vendorServices.featured, vendorServices.service_name);

      res.json(services);
    } catch (error) {
      console.error("Error fetching move-in services:", error);
      res.status(500).json({ message: "Failed to fetch move-in services" });
    }
  });

  // Get vendor information for Amazon (vendor ID 8)
  app.get("/api/vendors/:vendorId", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      
      const [vendor] = await db
        .select({
          id: vendors.id,
          businessName: vendors.business_name,
          description: vendors.description,
          logoUrl: vendors.logo_url,
          website: vendors.website,
          shortDescription: vendors.short_description,
          isVerified: vendors.is_verified,
          averageRating: vendors.average_rating,
          totalReviews: vendors.total_reviews
        })
        .from(vendors)
        .where(eq(vendors.id, vendorId))
        .limit(1);

      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      res.json(vendor);
    } catch (error) {
      console.error("Error fetching vendor:", error);
      res.status(500).json({ message: "Failed to fetch vendor information" });
    }
  });

  // Get Move-In Essentials statistics
  app.get("/api/move-in-essentials/stats", async (req, res) => {
    try {
      const stats = await db
        .select({
          totalServices: vendorServices.id,
          avgPrice: vendorServices.price_min,
          fastestDelivery: vendorServices.completion_time_days,
          successRate: vendorServices.success_rate
        })
        .from(vendorServices)
        .leftJoin(vendorServiceCategories, eq(vendorServices.category_id, vendorServiceCategories.id))
        .where(
          and(
            eq(vendorServiceCategories.slug, 'move-in-essentials'),
            eq(vendorServices.is_active, true)
          )
        );

      const aggregatedStats = {
        totalServices: stats.length,
        avgPriceRange: stats.length > 0 ? {
          min: Math.min(...stats.map(s => s.avgPrice || 0)),
          max: Math.max(...stats.map(s => s.avgPrice || 0))
        } : { min: 0, max: 0 },
        fastestDelivery: stats.length > 0 ? Math.min(...stats.map(s => s.fastestDelivery || 7)) : 7,
        avgSuccessRate: stats.length > 0 ? 
          stats.reduce((sum, s) => sum + (s.successRate || 0), 0) / stats.length : 0
      };

      res.json(aggregatedStats);
    } catch (error) {
      console.error("Error fetching move-in essentials stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
}