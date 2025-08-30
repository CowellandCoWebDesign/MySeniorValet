import { Express } from "express";
import { db } from "../db";

export function setupSimpleResourcesRoutes(app: Express) {
  // Simple direct SQL query to get resources
  app.get("/api/resources", async (req, res) => {
    try {
      // Get support resources directly with SQL
      const supportResourcesResult = await db.execute(`
        SELECT 
          sr.id,
          sr.title,
          sr.description,
          sr.content,
          sr.phone_number,
          sr.website,
          sr.available_hours,
          sr.eligibility_criteria,
          sr.cost,
          sr.national_hotline,
          sr.priority,
          sr.is_featured,
          src.name as category_name,
          src.icon as category_icon,
          src.color_scheme as category_color
        FROM support_resources sr
        LEFT JOIN support_resource_categories src ON sr.category_id = src.id
        WHERE sr.is_active = true
        ORDER BY sr.priority DESC, sr.title ASC
        LIMIT 100
      `);

      // Get categories
      const categoriesResult = await db.execute(`
        SELECT id, name, description, icon, color_scheme, display_order
        FROM support_resource_categories
        WHERE is_active = true
        ORDER BY display_order ASC
      `);

      res.json({
        supportResources: supportResourcesResult.rows || [],
        categories: categoriesResult.rows || [],
        totalSupport: supportResourcesResult.rows?.length || 0
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

  // Categories endpoint
  app.get("/api/resources/categories", async (req, res) => {
    try {
      const result = await db.execute(`
        SELECT name FROM support_resource_categories
        WHERE is_active = true
        ORDER BY display_order ASC
      `);
      
      const categories = result.rows?.map((row: any) => row.name) || [];
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.json([]);
    }
  });
}