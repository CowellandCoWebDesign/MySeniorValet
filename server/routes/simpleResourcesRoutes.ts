import { Express } from "express";
import { db } from "../db";
import { supportResources, supportResourceCategories } from "@shared/schema";
import { eq, desc, asc } from "drizzle-orm";

export function setupSimpleResourcesRoutes(app: Express) {
  // Using Drizzle ORM query builder for safe database queries
  app.get("/api/resources", async (req, res) => {
    try {
      // Get support resources using Drizzle ORM (safe from SQL injection)
      const resources = await db
        .select({
          id: supportResources.id,
          title: supportResources.title,
          description: supportResources.description,
          content: supportResources.content,
          phoneNumber: supportResources.phoneNumber,
          website: supportResources.website,
          availableHours: supportResources.availableHours,
          eligibilityCriteria: supportResources.eligibilityCriteria,
          cost: supportResources.cost,
          nationalHotline: supportResources.nationalHotline,
          priority: supportResources.priority,
          isFeatured: supportResources.isFeatured,
          categoryName: supportResourceCategories.name,
          categoryIcon: supportResourceCategories.icon,
          categoryColor: supportResourceCategories.colorScheme,
        })
        .from(supportResources)
        .leftJoin(
          supportResourceCategories,
          eq(supportResources.categoryId, supportResourceCategories.id)
        )
        .where(eq(supportResources.isActive, true))
        .orderBy(desc(supportResources.priority), asc(supportResources.title))
        .limit(100);

      // Get categories using Drizzle ORM
      const categories = await db
        .select({
          id: supportResourceCategories.id,
          name: supportResourceCategories.name,
          description: supportResourceCategories.description,
          icon: supportResourceCategories.icon,
          colorScheme: supportResourceCategories.colorScheme,
          displayOrder: supportResourceCategories.displayOrder,
        })
        .from(supportResourceCategories)
        .where(eq(supportResourceCategories.isActive, true))
        .orderBy(asc(supportResourceCategories.displayOrder));

      // Sanitize output data
      const sanitizedResources = resources.map(resource => ({
        ...resource,
        title: sanitizeOutput(resource.title),
        description: sanitizeOutput(resource.description),
        content: sanitizeOutput(resource.content),
        website: sanitizeOutput(resource.website),
        phoneNumber: sanitizeOutput(resource.phoneNumber),
      }));

      const sanitizedCategories = categories.map(category => ({
        ...category,
        name: sanitizeOutput(category.name),
        description: sanitizeOutput(category.description),
      }));

      res.json({
        supportResources: sanitizedResources || [],
        categories: sanitizedCategories || [],
        totalSupport: sanitizedResources.length || 0
      });
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ 
        error: "Failed to fetch resources",
        supportResources: [],
        categories: []
      });
    }
  });

  // Categories endpoint using Drizzle ORM
  app.get("/api/resources/categories", async (req, res) => {
    try {
      const categories = await db
        .select({
          name: supportResourceCategories.name,
        })
        .from(supportResourceCategories)
        .where(eq(supportResourceCategories.isActive, true))
        .orderBy(asc(supportResourceCategories.displayOrder));
      
      const categoryNames = categories.map(cat => sanitizeOutput(cat.name));
      res.json(categoryNames);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.json([]);
    }
  });
}

// Helper function to sanitize output (prevent XSS)
function sanitizeOutput(input: any): any {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous HTML/script tags
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}