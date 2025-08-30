import { Express } from "express";
import { db } from "../db";
import { supportResources, supportResourceCategories, educationalResources } from "@shared/schema";
import { eq, sql, desc, asc, and, like, or } from "drizzle-orm";

export function setupResourcesManagementRoutes(app: Express) {
  // Get all support resource categories
  app.get("/api/resources-management/categories", async (req, res) => {
    try {
      const categories = await db
        .select()
        .from(supportResourceCategories)
        .orderBy(asc(supportResourceCategories.displayOrder));
      
      res.json({ categories });
    } catch (error) {
      console.error("Error fetching resource categories:", error);
      res.status(500).json({ error: "Failed to fetch resource categories" });
    }
  });

  // Get support resources with optional filtering
  app.get("/api/resources-management/support", async (req, res) => {
    try {
      const { category, search, limit = 50 } = req.query;
      
      let query = db
        .select({
          id: supportResources.id,
          categoryId: supportResources.categoryId,
          title: supportResources.title,
          description: supportResources.description,
          phoneNumber: supportResources.phoneNumber,
          website: supportResources.website,
          availableHours: supportResources.availableHours,
          eligibilityCriteria: supportResources.eligibilityCriteria,
          cost: supportResources.cost,
          tags: supportResources.tags,
          icon: supportResources.icon,
          nationalHotline: supportResources.nationalHotline,
          priority: supportResources.priority,
          isActive: supportResources.isActive,
          category: supportResourceCategories.name,
          categoryIcon: supportResourceCategories.icon,
          categoryColor: supportResourceCategories.color
        })
        .from(supportResources)
        .leftJoin(supportResourceCategories, eq(supportResources.categoryId, supportResourceCategories.id))
        .where(eq(supportResources.isActive, true));

      // Apply filters
      const conditions = [];
      if (category) {
        conditions.push(eq(supportResources.categoryId, parseInt(category as string)));
      }
      if (search) {
        conditions.push(
          or(
            like(supportResources.title, `%${search}%`),
            like(supportResources.description, `%${search}%`)
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const resources = await query
        .orderBy(desc(supportResources.priority), asc(supportResources.title))
        .limit(parseInt(limit as string));

      res.json({ resources });
    } catch (error) {
      console.error("Error fetching support resources:", error);
      res.status(500).json({ error: "Failed to fetch support resources" });
    }
  });

  // Get educational resources
  app.get("/api/resources-management/educational", async (req, res) => {
    try {
      const { category, search, featured, limit = 50 } = req.query;
      
      let query = db.select().from(educationalResources);
      
      const conditions = [eq(educationalResources.is_active, true)];
      
      if (category) {
        conditions.push(eq(educationalResources.category, category as string));
      }
      if (featured === 'true') {
        conditions.push(eq(educationalResources.is_featured, true));
      }
      if (search) {
        conditions.push(
          or(
            like(educationalResources.title, `%${search}%`),
            like(educationalResources.description, `%${search}%`)
          )
        );
      }

      query = query.where(and(...conditions));

      const resources = await query
        .orderBy(desc(educationalResources.is_featured), desc(educationalResources.view_count))
        .limit(parseInt(limit as string));

      res.json({ resources });
    } catch (error) {
      console.error("Error fetching educational resources:", error);
      res.status(500).json({ error: "Failed to fetch educational resources" });
    }
  });

  // Get all resources (combined endpoint for the resources center page)
  app.get("/api/resources", async (req, res) => {
    try {
      // Get categories
      const categories = await db
        .select()
        .from(supportResourceCategories)
        .orderBy(asc(supportResourceCategories.displayOrder));

      // Get support resources
      const support = await db
        .select({
          id: supportResources.id,
          categoryId: supportResources.categoryId,
          title: supportResources.title,
          description: supportResources.description,
          phoneNumber: supportResources.phoneNumber,
          website: supportResources.website,
          availableHours: supportResources.availableHours,
          eligibilityCriteria: supportResources.eligibilityCriteria,
          cost: supportResources.cost,
          tags: supportResources.tags,
          icon: supportResources.icon,
          nationalHotline: supportResources.nationalHotline,
          priority: supportResources.priority,
          isActive: supportResources.isActive,
          category: supportResourceCategories.name,
          categoryIcon: supportResourceCategories.icon,
          categoryColor: supportResourceCategories.color
        })
        .from(supportResources)
        .leftJoin(supportResourceCategories, eq(supportResources.categoryId, supportResourceCategories.id))
        .where(eq(supportResources.isActive, true))
        .orderBy(desc(supportResources.priority), asc(supportResources.title))
        .limit(100);

      // Get educational resources
      const educational = await db
        .select()
        .from(educationalResources)
        .where(eq(educationalResources.is_active, true))
        .orderBy(desc(educationalResources.is_featured), desc(educationalResources.view_count))
        .limit(50);

      res.json({
        categories,
        supportResources: support,
        educationalResources: educational,
        totalSupport: support.length,
        totalEducational: educational.length
      });
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ error: "Failed to fetch resources" });
    }
  });

  // Public endpoint for resources center page
  app.get("/api/resources/categories", async (req, res) => {
    try {
      const categories = await db
        .select()
        .from(supportResourceCategories)
        .orderBy(asc(supportResourceCategories.displayOrder));
      
      res.json(categories);
    } catch (error) {
      console.error("Error fetching resource categories:", error);
      res.status(500).json({ error: "Failed to fetch resource categories" });
    }
  });
}