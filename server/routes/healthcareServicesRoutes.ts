import { Router } from "express";
import { db } from "../db";
import { healthcareServiceTypes } from "../../shared/schema";
import { eq, sql, desc, asc, and, isNotNull } from "drizzle-orm";

const router = Router();

// Get all healthcare service types
router.get('/healthcare-services/types', async (req, res) => {
  try {
    const { category, active_only, parent_category } = req.query;
    
    // Build query conditions
    const conditions = [];
    
    if (active_only === 'true') {
      conditions.push(eq(healthcareServiceTypes.isActive, true));
    }
    
    if (parent_category) {
      conditions.push(eq(healthcareServiceTypes.parentCategory, parent_category as string));
    }
    
    if (category) {
      conditions.push(eq(healthcareServiceTypes.serviceType, category as string));
    }
    
    // Query the database
    const serviceTypes = await db
      .select()
      .from(healthcareServiceTypes)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(healthcareServiceTypes.sortOrder));
    
    res.json({
      success: true,
      data: serviceTypes,
      total: serviceTypes.length
    });
  } catch (error) {
    console.error('Error fetching healthcare service types:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch healthcare service types' 
    });
  }
});

// Get healthcare service type by ID
router.get('/healthcare-services/types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const serviceType = await db
      .select()
      .from(healthcareServiceTypes)
      .where(eq(healthcareServiceTypes.categoryId, id))
      .limit(1);
    
    if (!serviceType.length) {
      return res.status(404).json({ 
        success: false,
        error: 'Healthcare service type not found' 
      });
    }
    
    res.json({
      success: true,
      data: serviceType[0]
    });
  } catch (error) {
    console.error('Error fetching healthcare service type:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch healthcare service type' 
    });
  }
});

// Get healthcare services statistics
router.get('/healthcare-services/statistics', async (req, res) => {
  try {
    // Get counts by parent category
    const categoryStats = await db
      .select({
        parent_category: healthcareServiceTypes.parentCategory,
        total_types: sql<number>`count(*)::int`,
        total_providers: sql<number>`sum(${healthcareServiceTypes.count})::int`
      })
      .from(healthcareServiceTypes)
      .where(eq(healthcareServiceTypes.isActive, true))
      .groupBy(healthcareServiceTypes.parentCategory);
    
    // Get total statistics
    const totalStats = await db
      .select({
        total_categories: sql<number>`count(distinct ${healthcareServiceTypes.serviceType})::int`,
        total_provider_count: sql<number>`sum(${healthcareServiceTypes.count})::int`,
        categories_with_providers: sql<number>`count(case when ${healthcareServiceTypes.count} > 0 then 1 end)::int`
      })
      .from(healthcareServiceTypes)
      .where(eq(healthcareServiceTypes.isActive, true));
    
    // Get top categories by provider count
    const topCategories = await db
      .select({
        name: healthcareServiceTypes.name,
        display_name: healthcareServiceTypes.displayName,
        icon: healthcareServiceTypes.icon,
        count: healthcareServiceTypes.count,
        service_type: healthcareServiceTypes.serviceType
      })
      .from(healthcareServiceTypes)
      .where(and(
        eq(healthcareServiceTypes.isActive, true),
        sql`${healthcareServiceTypes.count} > 0`
      ))
      .orderBy(desc(healthcareServiceTypes.count))
      .limit(10);
    
    res.json({
      success: true,
      statistics: {
        overall: totalStats[0] || {
          total_categories: 0,
          total_provider_count: 0,
          categories_with_providers: 0
        },
        by_category: categoryStats,
        top_categories: topCategories
      }
    });
  } catch (error) {
    console.error('Error fetching healthcare statistics:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch healthcare statistics' 
    });
  }
});

// Get healthcare services for homepage display
router.get('/healthcare-services/homepage', async (req, res) => {
  try {
    // Get all active service types for homepage display
    const serviceTypes = await db
      .select({
        category_id: healthcareServiceTypes.categoryId,
        name: healthcareServiceTypes.name,
        display_name: healthcareServiceTypes.displayName,
        icon: healthcareServiceTypes.icon,
        count: healthcareServiceTypes.count,
        service_type: healthcareServiceTypes.serviceType,
        parent_category: healthcareServiceTypes.parentCategory,
        description: healthcareServiceTypes.description
      })
      .from(healthcareServiceTypes)
      .where(eq(healthcareServiceTypes.isActive, true))
      .orderBy(asc(healthcareServiceTypes.sortOrder));
    
    // Group by parent category for organized display
    const grouped = serviceTypes.reduce((acc, service) => {
      const category = service.parent_category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
      return acc;
    }, {} as Record<string, typeof serviceTypes>);
    
    res.json({
      success: true,
      data: {
        all: serviceTypes,
        grouped: grouped,
        total: serviceTypes.length,
        with_providers: serviceTypes.filter(s => s.count > 0).length
      }
    });
  } catch (error) {
    console.error('Error fetching homepage healthcare services:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch healthcare services' 
    });
  }
});

// Update healthcare service type count (admin endpoint)
router.patch('/healthcare-services/types/:id/count', async (req, res) => {
  try {
    const { id } = req.params;
    const { count } = req.body;
    
    if (typeof count !== 'number' || count < 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid count value' 
      });
    }
    
    const updated = await db
      .update(healthcareServiceTypes)
      .set({ 
        count: count,
        updatedAt: new Date()
      })
      .where(eq(healthcareServiceTypes.categoryId, id))
      .returning();
    
    if (!updated.length) {
      return res.status(404).json({ 
        success: false,
        error: 'Healthcare service type not found' 
      });
    }
    
    res.json({
      success: true,
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating healthcare service count:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update healthcare service count' 
    });
  }
});

export default router;