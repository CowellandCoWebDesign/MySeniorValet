import { Router } from 'express';
import { db } from '../db';
import { checklistItems } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all checklist items
router.get('/api/launch-checklist', async (req, res) => {
  try {
    const items = await db.select().from(checklistItems);
    res.json(items);
  } catch (error) {
    console.error('Error fetching checklist items:', error);
    res.status(500).json({ error: 'Failed to fetch checklist items' });
  }
});

// Update checklist item status
router.patch('/api/launch-checklist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [updated] = await db
      .update(checklistItems)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(checklistItems.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Error updating checklist item:', error);
    res.status(500).json({ error: 'Failed to update checklist item' });
  }
});

// Get launch readiness stats
router.get('/api/launch-checklist/stats', async (req, res) => {
  try {
    const items = await db.select().from(checklistItems);
    
    const stats = {
      total: items.length,
      complete: items.filter(item => item.status === 'complete').length,
      partial: items.filter(item => item.status === 'partial').length,
      pending: items.filter(item => item.status === 'pending').length,
      blocked: items.filter(item => item.status === 'blocked').length,
      critical: items.filter(item => item.priority === 'critical').length,
      criticalComplete: items.filter(item => item.priority === 'critical' && item.status === 'complete').length,
      byCategory: {}
    };

    // Group by category
    items.forEach(item => {
      if (!stats.byCategory[item.category]) {
        stats.byCategory[item.category] = {
          total: 0,
          complete: 0,
          partial: 0,
          pending: 0,
          blocked: 0
        };
      }
      stats.byCategory[item.category].total++;
      stats.byCategory[item.category][item.status]++;
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching checklist stats:', error);
    res.status(500).json({ error: 'Failed to fetch checklist stats' });
  }
});

export default router;