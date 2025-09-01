import { Router } from 'express';
import { db } from '../db';
import { 
  users, 
  communities,
  tours,
  paymentTransactions,
  leaseAgreements,
  tenantPayments
} from '@shared/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { isAuthenticated } from '../auth-middleware';

const router = Router();

// Get resident profile and community info
router.get('/profile', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    // Get user's current community (from their most recent lease or tour)
    const [userLease] = await db
      .select({
        communityId: leaseAgreements.communityId,
        roomNumber: leaseAgreements.unitNumber,
        moveInDate: leaseAgreements.leaseStartDate,
        careLevel: leaseAgreements.careLevel
      })
      .from(leaseAgreements)
      .where(
        and(
          eq(leaseAgreements.tenantId, userId),
          eq(leaseAgreements.status, 'active')
        )
      )
      .limit(1);

    let community = null;
    if (userLease?.communityId) {
      [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, userLease.communityId))
        .limit(1);
    }

    const resident = {
      name: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || 'Resident',
      roomNumber: userLease?.roomNumber || '101',
      careLevel: userLease?.careLevel || 'Assisted Living',
      moveInDate: userLease?.moveInDate || new Date().toISOString()
    };

    res.json({ resident, community });
  } catch (error) {
    console.error('Error fetching resident profile:', error);
    res.status(500).json({ error: 'Failed to fetch resident profile' });
  }
});

// Get upcoming events and activities
router.get('/events', isAuthenticated, async (req: any, res) => {
  try {
    // In a real implementation, this would fetch from an events table
    // For now, return structured sample events based on current date
    const today = new Date();
    const events = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      events.push({
        id: i + 1,
        date: date.toISOString(),
        title: ['Book Club', 'Art Class', 'Music Therapy', 'Bingo Night', 'Movie Night', 'Exercise Class', 'Garden Club'][i % 7],
        time: ['9:00 AM', '2:00 PM', '3:00 PM', '7:00 PM', '6:30 PM', '10:00 AM', '11:00 AM'][i % 7],
        location: ['Library', 'Activity Room', 'Main Hall', 'Recreation Room', 'Theater', 'Gym', 'Garden'][i % 7],
        description: 'Join us for a fun and engaging activity!'
      });
    }

    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get care plan information
router.get('/care-plan', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    // Since we don't have care-specific tables yet, provide structured sample data
    // In production, these would come from actual care management tables
    const latestAssessment = null;
    const medications = [];
    const notes = [];

    const carePlan = {
      assessment: {
        mobilityScore: 75,
        cognitiveScore: 95,
        medicationAdherence: 95,
        socialEngagement: 60,
        assessmentDate: new Date().toISOString()
      },
      medications: [
        {
          name: 'Daily Multivitamin',
          dosage: '1 tablet',
          frequency: 'Once daily',
          time: '8:00 AM'
        }
      ],
      careNotes: [],
      dailyServices: [
        'Medication management (3x daily)',
        'Assistance with bathing and dressing',
        'Mobility assistance as needed',
        'Blood pressure monitoring (weekly)'
      ],
      goals: [
        { name: 'Improve mobility', progress: 75 },
        { name: 'Medication adherence', progress: 95 },
        { name: 'Social engagement', progress: 60 }
      ]
    };

    res.json(carePlan);
  } catch (error) {
    console.error('Error fetching care plan:', error);
    res.status(500).json({ error: 'Failed to fetch care plan' });
  }
});

// Get billing information
router.get('/billing', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    // Get recent payments
    const recentPayments = await db
      .select({
        id: tenantPayments.id,
        amount: tenantPayments.amount,
        type: tenantPayments.paymentType,
        status: tenantPayments.status,
        dueDate: tenantPayments.dueDate,
        paidAt: tenantPayments.paidAt
      })
      .from(tenantPayments)
      .where(eq(tenantPayments.tenantId, userId))
      .orderBy(desc(tenantPayments.createdAt))
      .limit(10);

    // Calculate current balance
    const [balanceData] = await db
      .select({
        totalDue: sql<number>`COALESCE(SUM(CASE WHEN status = 'pending' THEN amount END), 0)`,
        totalPaid: sql<number>`COALESCE(SUM(CASE WHEN status = 'completed' THEN amount END), 0)`
      })
      .from(tenantPayments)
      .where(eq(tenantPayments.tenantId, userId));

    // Get next payment due date
    const [nextPayment] = await db
      .select({
        amount: tenantPayments.amount,
        dueDate: tenantPayments.dueDate
      })
      .from(tenantPayments)
      .where(
        and(
          eq(tenantPayments.tenantId, userId),
          eq(tenantPayments.status, 'pending'),
          gte(tenantPayments.dueDate, new Date().toISOString().split('T')[0])
        )
      )
      .orderBy(tenantPayments.dueDate)
      .limit(1);

    const billing = {
      currentBalance: Number(balanceData?.totalDue || 0),
      totalPaid: Number(balanceData?.totalPaid || 0),
      nextPayment: nextPayment || {
        amount: 4850,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      recentTransactions: recentPayments.length > 0 ? recentPayments : [
        {
          id: 1,
          type: 'rent',
          amount: '3500',
          status: 'completed',
          description: 'Monthly Room & Board',
          paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          type: 'fee',
          amount: '1200',
          status: 'completed',
          description: 'Care Services',
          paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          type: 'other',
          amount: '150',
          status: 'completed',
          description: 'Medication Management',
          paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };

    res.json(billing);
  } catch (error) {
    console.error('Error fetching billing information:', error);
    res.status(500).json({ error: 'Failed to fetch billing information' });
  }
});

// Get dining menu
router.get('/dining/menu', isAuthenticated, async (req, res) => {
  try {
    // In a real implementation, this would fetch from a menu/dining table
    const menu = {
      date: new Date().toISOString(),
      meals: {
        breakfast: {
          time: '7:00 AM - 9:00 AM',
          items: ['Scrambled eggs', 'Whole wheat toast', 'Fresh fruit salad', 'Orange juice']
        },
        lunch: {
          time: '12:00 PM - 1:30 PM',
          items: ['Grilled chicken breast', 'Steamed vegetables', 'Mashed potatoes', 'Garden salad']
        },
        dinner: {
          time: '5:30 PM - 7:00 PM',
          items: ['Baked salmon', 'Wild rice', 'Green beans', 'Dinner roll', 'Chocolate pudding']
        }
      },
      specialDietary: 'Contact dining services at ext. 2100 for special dietary requirements'
    };

    res.json(menu);
  } catch (error) {
    console.error('Error fetching dining menu:', error);
    res.status(500).json({ error: 'Failed to fetch dining menu' });
  }
});

// Get messages/notifications
router.get('/messages', isAuthenticated, async (req: any, res) => {
  try {
    // In a real implementation, this would fetch from a messages table
    const messages = [
      {
        id: 1,
        from: 'Nurse Jennifer',
        fromType: 'staff',
        subject: 'Medication Schedule Update',
        message: 'Your medication schedule has been updated. Please check with the nursing station.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: 2,
        from: 'Sarah (Daughter)',
        fromType: 'family',
        subject: 'Visit Tomorrow',
        message: 'Looking forward to visiting you tomorrow at 4 PM! Love you!',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true
      },
      {
        id: 3,
        from: 'Activities Department',
        fromType: 'staff',
        subject: 'Special Music Performance',
        message: "Don't forget about the special music performance this Friday at 3 PM!",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        read: true
      }
    ];

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;