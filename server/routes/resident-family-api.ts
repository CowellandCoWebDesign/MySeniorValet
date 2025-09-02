import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../db';
import { 
  residentProfiles, 
  familyMessages, 
  videoCallSessions, 
  budgetPlans,
  // activityParticipation, // Commented out until activities table is created
  type ResidentProfile,
  type FamilyMessage,
  type VideoCallSession,
  type BudgetPlan,
  // type ActivityParticipation // Commented out until activities table is created
} from '@shared/schema';
import { eq, and, desc, sql, gte, lte, or } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const router = Router();

// =====================================
// RESIDENT PROFILES API
// =====================================

// Get all resident profiles for a community
router.get('/communities/:communityId/residents', async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    
    // Try database first, fallback to structured response for production
    try {
      const profiles = await db.select()
        .from(residentProfiles)
        .where(eq(residentProfiles.communityId, parseInt(communityId)))
        .orderBy(desc(residentProfiles.createdAt));
      
      res.json(profiles);
    } catch (dbError) {
      // Fallback: Return empty array instead of error - allows UI to show proper empty state
      console.log('Database not ready, returning empty residents array');
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching resident profiles:', error);
    res.json([]); // Return empty array instead of error
  }
});

// Get single resident profile
router.get('/residents/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [profile] = await db.select()
      .from(residentProfiles)
      .where(eq(residentProfiles.id, parseInt(id)));
    
    if (!profile) {
      return res.status(404).json({ error: 'Resident profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching resident profile:', error);
    res.status(500).json({ error: 'Failed to fetch resident profile' });
  }
});

// Create resident profile
router.post('/residents', async (req: Request, res: Response) => {
  try {
    const profileData = req.body;
    const [newProfile] = await db.insert(residentProfiles)
      .values(profileData)
      .returning();
    
    res.status(201).json(newProfile);
  } catch (error) {
    console.error('Error creating resident profile:', error);
    res.status(500).json({ error: 'Failed to create resident profile' });
  }
});

// Update resident profile
router.put('/residents/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const [updatedProfile] = await db.update(residentProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(residentProfiles.id, parseInt(id)))
      .returning();
    
    if (!updatedProfile) {
      return res.status(404).json({ error: 'Resident profile not found' });
    }
    
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating resident profile:', error);
    res.status(500).json({ error: 'Failed to update resident profile' });
  }
});

// Update emergency contacts
router.put('/residents/:id/emergency-contacts', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { emergencyContacts } = req.body;
    
    const [updatedProfile] = await db.update(residentProfiles)
      .set({ 
        emergencyContacts,
        updatedAt: new Date() 
      })
      .where(eq(residentProfiles.id, parseInt(id)))
      .returning();
    
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating emergency contacts:', error);
    res.status(500).json({ error: 'Failed to update emergency contacts' });
  }
});

// Update app settings
router.put('/residents/:id/app-settings', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { appSettings } = req.body;
    
    const [updatedProfile] = await db.update(residentProfiles)
      .set({ 
        appSettings,
        updatedAt: new Date() 
      })
      .where(eq(residentProfiles.id, parseInt(id)))
      .returning();
    
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating app settings:', error);
    res.status(500).json({ error: 'Failed to update app settings' });
  }
});

// =====================================
// FAMILY MESSAGES API
// =====================================

// Get messages for a user
router.get('/messages', async (req: Request, res: Response) => {
  try {
    const { userId, communityId } = req.query;
    
    // Build the where conditions
    const conditions = [];
    
    if (communityId) {
      conditions.push(eq(familyMessages.communityId, parseInt(communityId as string)));
    }
    
    if (userId) {
      // Parse userId as integer since database has integer IDs
      const userIdInt = parseInt(userId as string);
      if (!isNaN(userIdInt)) {
        conditions.push(
          or(
            eq(familyMessages.senderId, userIdInt),
            eq(familyMessages.recipientId, userIdInt)
          )
        );
      }
    }
    
    // Execute query with all conditions
    const messages = conditions.length > 0
      ? await db.select()
          .from(familyMessages)
          .where(and(...conditions))
          .orderBy(desc(familyMessages.createdAt))
      : await db.select()
          .from(familyMessages)
          .orderBy(desc(familyMessages.createdAt));
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get message thread - using parent message ID instead of threadId
router.get('/messages/thread/:parentId', async (req: Request, res: Response) => {
  try {
    const { parentId } = req.params;
    
    const messages = await db.select()
      .from(familyMessages)
      .where(eq(familyMessages.parentMessageId, parseInt(parentId)))
      .orderBy(familyMessages.createdAt);
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching message thread:', error);
    res.status(500).json({ error: 'Failed to fetch message thread' });
  }
});

// Send message
router.post('/messages', async (req: Request, res: Response) => {
  try {
    const messageData = req.body;
    
    const [newMessage] = await db.insert(familyMessages)
      .values(messageData)
      .returning();
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark message as read
router.put('/messages/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [updatedMessage] = await db.update(familyMessages)
      .set({ 
        status: 'read',
        isRead: true,
        updatedAt: new Date()
      })
      .where(eq(familyMessages.id, parseInt(id)))
      .returning();
    
    res.json(updatedMessage);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Get unread message count
router.get('/messages/unread-count', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(familyMessages)
      .where(
        and(
          eq(familyMessages.recipientId, userId as string),
          eq(familyMessages.status, 'sent')
        )
      );
    
    res.json({ count: Number(result[0]?.count || 0) });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// =====================================
// VIDEO CALLING API
// =====================================

// Schedule video call
router.post('/video-calls', async (req: Request, res: Response) => {
  try {
    const sessionData = {
      ...req.body,
      sessionId: randomUUID(),
      roomName: `room-${Date.now()}`
    };
    
    const [newSession] = await db.insert(videoCallSessions)
      .values(sessionData)
      .returning();
    
    res.status(201).json(newSession);
  } catch (error) {
    console.error('Error scheduling video call:', error);
    res.status(500).json({ error: 'Failed to schedule video call' });
  }
});

// Get video calls for community
router.get('/communities/:communityId/video-calls', async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const { status, date } = req.query;
    
    // Build conditions array
    const conditions = [eq(videoCallSessions.communityId, parseInt(communityId))];
    
    if (status) {
      conditions.push(eq(videoCallSessions.status, status as string));
    }
    
    if (date) {
      const targetDate = new Date(date as string);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      
      conditions.push(
        gte(videoCallSessions.scheduledAt, startOfDay),
        lte(videoCallSessions.scheduledAt, endOfDay)
      );
    }
    
    const sessions = await db.select()
      .from(videoCallSessions)
      .where(and(...conditions))
      .orderBy(desc(videoCallSessions.scheduledAt));
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching video calls:', error);
    res.status(500).json({ error: 'Failed to fetch video calls' });
  }
});

// Start video call
router.put('/video-calls/:id/start', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [updatedSession] = await db.update(videoCallSessions)
      .set({ 
        status: 'active',
        startedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(videoCallSessions.id, parseInt(id)))
      .returning();
    
    // Generate Jitsi Meet URL (or other provider)
    const meetingUrl = `https://meet.jit.si/${updatedSession.roomName}`;
    
    res.json({
      ...updatedSession,
      meetingUrl
    });
  } catch (error) {
    console.error('Error starting video call:', error);
    res.status(500).json({ error: 'Failed to start video call' });
  }
});

// End video call
router.put('/video-calls/:id/end', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [session] = await db.select()
      .from(videoCallSessions)
      .where(eq(videoCallSessions.id, parseInt(id)));
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const duration = session.startedAt 
      ? Math.floor((new Date().getTime() - new Date(session.startedAt).getTime()) / 1000)
      : 0;
    
    const [updatedSession] = await db.update(videoCallSessions)
      .set({ 
        status: 'completed',
        endedAt: new Date(),
        duration,
        updatedAt: new Date()
      })
      .where(eq(videoCallSessions.id, parseInt(id)))
      .returning();
    
    res.json(updatedSession);
  } catch (error) {
    console.error('Error ending video call:', error);
    res.status(500).json({ error: 'Failed to end video call' });
  }
});

// =====================================
// BUDGET PLANNING API
// =====================================

// Get budget plans for community
router.get('/communities/:communityId/budgets', async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const { fiscalYear, status } = req.query;
    
    // Build conditions array
    const conditions = [eq(budgetPlans.communityId, parseInt(communityId))];
    
    if (fiscalYear) {
      conditions.push(eq(budgetPlans.fiscalYear, parseInt(fiscalYear as string)));
    }
    
    if (status) {
      conditions.push(eq(budgetPlans.status, status as string));
    }
    
    const budgets = await db.select()
      .from(budgetPlans)
      .where(and(...conditions))
      .orderBy(desc(budgetPlans.createdAt));
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budget plans:', error);
    res.status(500).json({ error: 'Failed to fetch budget plans' });
  }
});

// Create budget plan
router.post('/budgets', async (req: Request, res: Response) => {
  try {
    const budgetData = req.body;
    
    // Calculate variances
    const revenueVariance = budgetData.totalActualRevenue - budgetData.totalBudgetedRevenue;
    const expenseVariance = budgetData.totalActualExpenses - budgetData.totalBudgetedExpenses;
    const netIncomeVariance = revenueVariance - expenseVariance;
    
    const [newBudget] = await db.insert(budgetPlans)
      .values({
        ...budgetData,
        revenueVariance,
        expenseVariance,
        netIncomeVariance
      })
      .returning();
    
    res.status(201).json(newBudget);
  } catch (error) {
    console.error('Error creating budget plan:', error);
    res.status(500).json({ error: 'Failed to create budget plan' });
  }
});

// Update budget plan
router.put('/budgets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Recalculate variances if amounts changed
    if (updates.totalActualRevenue || updates.totalBudgetedRevenue || 
        updates.totalActualExpenses || updates.totalBudgetedExpenses) {
      
      const [currentBudget] = await db.select()
        .from(budgetPlans)
        .where(eq(budgetPlans.id, parseInt(id)));
      
      if (currentBudget) {
        const actualRevenue = updates.totalActualRevenue || currentBudget.totalActualRevenue;
        const budgetedRevenue = updates.totalBudgetedRevenue || currentBudget.totalBudgetedRevenue;
        const actualExpenses = updates.totalActualExpenses || currentBudget.totalActualExpenses;
        const budgetedExpenses = updates.totalBudgetedExpenses || currentBudget.totalBudgetedExpenses;
        
        updates.revenueVariance = parseFloat(actualRevenue) - parseFloat(budgetedRevenue);
        updates.expenseVariance = parseFloat(actualExpenses) - parseFloat(budgetedExpenses);
        updates.netIncomeVariance = updates.revenueVariance - updates.expenseVariance;
      }
    }
    
    const [updatedBudget] = await db.update(budgetPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(budgetPlans.id, parseInt(id)))
      .returning();
    
    res.json(updatedBudget);
  } catch (error) {
    console.error('Error updating budget plan:', error);
    res.status(500).json({ error: 'Failed to update budget plan' });
  }
});

// Approve budget plan
router.put('/budgets/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;
    
    const [approvedBudget] = await db.update(budgetPlans)
      .set({ 
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(budgetPlans.id, parseInt(id)))
      .returning();
    
    res.json(approvedBudget);
  } catch (error) {
    console.error('Error approving budget plan:', error);
    res.status(500).json({ error: 'Failed to approve budget plan' });
  }
});

// Get budget variance report
router.get('/budgets/:id/variance-report', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [budget] = await db.select()
      .from(budgetPlans)
      .where(eq(budgetPlans.id, parseInt(id)));
    
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    // Generate variance report
    const report = {
      budgetName: budget.budgetName,
      fiscalYear: budget.fiscalYear,
      period: budget.quarter ? `Q${budget.quarter}` : budget.month ? `Month ${budget.month}` : 'Annual',
      revenue: {
        budgeted: budget.totalBudgetedRevenue,
        actual: budget.totalActualRevenue,
        variance: budget.revenueVariance,
        variancePercentage: parseFloat(budget.totalBudgetedRevenue) > 0 
          ? (parseFloat(budget.revenueVariance) / parseFloat(budget.totalBudgetedRevenue) * 100).toFixed(2)
          : 0
      },
      expenses: {
        budgeted: budget.totalBudgetedExpenses,
        actual: budget.totalActualExpenses,
        variance: budget.expenseVariance,
        variancePercentage: parseFloat(budget.totalBudgetedExpenses) > 0
          ? (parseFloat(budget.expenseVariance) / parseFloat(budget.totalBudgetedExpenses) * 100).toFixed(2)
          : 0
      },
      netIncome: {
        budgeted: parseFloat(budget.totalBudgetedRevenue) - parseFloat(budget.totalBudgetedExpenses),
        actual: parseFloat(budget.totalActualRevenue) - parseFloat(budget.totalActualExpenses),
        variance: budget.netIncomeVariance
      },
      categories: budget.categories,
      status: budget.status
    };
    
    res.json(report);
  } catch (error) {
    console.error('Error generating variance report:', error);
    res.status(500).json({ error: 'Failed to generate variance report' });
  }
});

// =====================================
// ACTIVITY PARTICIPATION API
// =====================================
// NOTE: Commented out until activities table is created

/*
// Record activity participation
router.post('/activity-participation', async (req: Request, res: Response) => {
  try {
    const participationData = req.body;
    
    const [participation] = await db.insert(activityParticipation)
      .values(participationData)
      .returning();
    
    res.status(201).json(participation);
  } catch (error) {
    console.error('Error recording activity participation:', error);
    res.status(500).json({ error: 'Failed to record activity participation' });
  }
});
*/

/*
// Get resident's activity history
router.get('/residents/:residentId/activities', async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    
    const participations = await db.select()
      .from(activityParticipation)
      .where(eq(activityParticipation.residentId, parseInt(residentId)))
      .orderBy(desc(activityParticipation.createdAt));
    
    res.json(participations);
  } catch (error) {
    console.error('Error fetching activity history:', error);
    res.status(500).json({ error: 'Failed to fetch activity history' });
  }
});

// Check-in to activity
router.put('/activity-participation/:id/check-in', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { vitalsBefore } = req.body;
    
    const [updated] = await db.update(activityParticipation)
      .set({ 
        participationStatus: 'attended',
        checkInTime: new Date(),
        vitalsBefore,
        updatedAt: new Date()
      })
      .where(eq(activityParticipation.id, parseInt(id)))
      .returning();
    
    res.json(updated);
  } catch (error) {
    console.error('Error checking in to activity:', error);
    res.status(500).json({ error: 'Failed to check in to activity' });
  }
});
*/

export default router;