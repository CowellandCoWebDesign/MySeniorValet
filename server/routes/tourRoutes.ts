import { Request, Response, Router } from 'express';
import { db } from '../db';
import { tours, communities, users, favorites } from '@shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { EmailService } from '../services/email';
import { format } from 'date-fns';

const router = Router();

// Schedule a new tour
router.post('/api/tours/schedule', async (req: Request, res: Response) => {
  try {
    const {
      communityId,
      tourDate,
      tourTime,
      tourType = 'in_person',
      attendeeCount = 1,
      contactName,
      contactEmail,
      contactPhone,
      specialRequests,
      contactPreference = 'email'
    } = req.body;

    // Validate required fields
    if (!communityId || !tourDate || !tourTime || !contactName || !contactEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['communityId', 'tourDate', 'tourTime', 'contactName', 'contactEmail'] 
      });
    }

    // Get community details
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId));

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Combine date and time
    const tourDateTime = new Date(`${tourDate}T${tourTime}`);
    
    // Create user if not authenticated (guest booking)
    let userId = req.user?.id;
    
    if (!userId) {
      // Check if user exists by email - select only necessary columns
      const [existingUser] = await db
        .select({
          id: users.id,
          email: users.email
        })
        .from(users)
        .where(eq(users.email, contactEmail));
      
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create guest user with generated ID
        const newUserId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const [newUser] = await db
          .insert(users)
          .values({
            id: newUserId,
            email: contactEmail,
            firstName: contactName.split(' ')[0],
            lastName: contactName.split(' ').slice(1).join(' ') || '',
            phone: contactPhone,
            role: 'user'
          })
          .returning();
        userId = newUser.id;
      }
    }

    // Create the tour
    const [tour] = await db
      .insert(tours)
      .values({
        userId,
        communityId,
        tourDate: tourDateTime,
        tourType,
        attendeeCount,
        specialRequests,
        contactPreference,
        status: 'scheduled'
      })
      .returning();

    // Auto-favorite the community when scheduling a tour
    try {
      // Check if already favorited
      const existingFavorite = await db
        .select()
        .from(favorites)
        .where(
          and(
            eq(favorites.userId, userId),
            eq(favorites.communityId, communityId)
          )
        );

      if (existingFavorite.length === 0) {
        // Add to favorites
        await db
          .insert(favorites)
          .values({
            userId,
            communityId,
            notes: 'Auto-added when tour was scheduled'
          });
      }
    } catch (favoriteError) {
      console.error('Error auto-favoriting community:', favoriteError);
      // Don't fail the tour scheduling if favoriting fails
    }

    // Send confirmation email
    const emailSent = await EmailService.sendTourConfirmation(
      contactEmail,
      community.name,
      tourDateTime,
      {
        tourType,
        attendeeCount,
        specialRequests,
        communityAddress: `${community.address}, ${community.city}, ${community.state} ${community.zipCode}`,
        communityPhone: community.phone || 'Not available',
        contactName
      }
    );

    // DISABLED FOR RELAUNCH: Not sending notifications to communities yet
    // if (community.communityManagerEmail) {
    //   await EmailService.sendEmail({
    //     to: community.communityManagerEmail,
    //     subject: `New Tour Scheduled - ${contactName}`,
    //     html: `
    //       <h2>New Tour Scheduled</h2>
    //       <p><strong>Community:</strong> ${community.name}</p>
    //       <p><strong>Date/Time:</strong> ${format(tourDateTime, 'EEEE, MMMM d, yyyy at h:mm a')}</p>
    //       <p><strong>Guest:</strong> ${contactName}</p>
    //       <p><strong>Email:</strong> ${contactEmail}</p>
    //       <p><strong>Phone:</strong> ${contactPhone || 'Not provided'}</p>
    //       <p><strong>Tour Type:</strong> ${tourType.replace('_', ' ')}</p>
    //       <p><strong>Attendees:</strong> ${attendeeCount}</p>
    //       ${specialRequests ? `<p><strong>Special Requests:</strong> ${specialRequests}</p>` : ''}
    //     `
    //   });
    // }

    res.json({
      success: true,
      tour: {
        id: tour.id,
        communityName: community.name,
        tourDate: tour.tourDate,
        status: tour.status,
        confirmationEmailSent: emailSent
      },
      message: emailSent 
        ? 'Tour scheduled successfully! A confirmation email has been sent.'
        : 'Tour scheduled successfully! Please check your email for confirmation.'
    });

  } catch (error) {
    console.error('Error scheduling tour:', error);
    res.status(500).json({ error: 'Failed to schedule tour' });
  }
});

// Get user's tours
router.get('/api/tours/my-tours', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userTours = await db
      .select({
        tour: tours,
        community: communities
      })
      .from(tours)
      .leftJoin(communities, eq(tours.communityId, communities.id))
      .where(eq(tours.userId, userId))
      .orderBy(desc(tours.tourDate));

    res.json({ tours: userTours });
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ error: 'Failed to fetch tours' });
  }
});

// Get community's scheduled tours (for operators)
router.get('/api/tours/community/:communityId', async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    // TODO: Add authorization check for community operators
    
    const communityTours = await db
      .select({
        tour: tours,
        user: users
      })
      .from(tours)
      .leftJoin(users, eq(tours.userId, users.id))
      .where(eq(tours.communityId, communityId))
      .orderBy(desc(tours.tourDate));

    res.json({ tours: communityTours });
  } catch (error) {
    console.error('Error fetching community tours:', error);
    res.status(500).json({ error: 'Failed to fetch community tours' });
  }
});

// Cancel a tour
router.post('/api/tours/:tourId/cancel', async (req: Request, res: Response) => {
  try {
    const tourId = parseInt(req.params.tourId);
    const { reason } = req.body;
    
    // Get tour details
    const [tour] = await db
      .select({
        tour: tours,
        community: communities,
        user: users
      })
      .from(tours)
      .leftJoin(communities, eq(tours.communityId, communities.id))
      .leftJoin(users, eq(tours.userId, users.id))
      .where(eq(tours.id, tourId));

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Check authorization
    if (req.user?.id !== tour.tour.userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to cancel this tour' });
    }

    // Update tour status
    await db
      .update(tours)
      .set({ 
        status: 'cancelled',
        staffNotes: reason 
      })
      .where(eq(tours.id, tourId));

    // Send cancellation email
    if (tour.user?.email) {
      await EmailService.sendEmail({
        to: tour.user.email,
        subject: `Tour Cancelled - ${tour.community?.name}`,
        html: `
          <h2>Tour Cancellation Confirmation</h2>
          <p>Your tour at <strong>${tour.community?.name}</strong> scheduled for 
          ${format(tour.tour.tourDate, 'EEEE, MMMM d, yyyy at h:mm a')} has been cancelled.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>If you'd like to reschedule, please contact us or book a new tour through our platform.</p>
        `
      });
    }

    res.json({ success: true, message: 'Tour cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling tour:', error);
    res.status(500).json({ error: 'Failed to cancel tour' });
  }
});

// Update tour feedback
router.post('/api/tours/:tourId/feedback', async (req: Request, res: Response) => {
  try {
    const tourId = parseInt(req.params.tourId);
    const {
      overallImpression,
      tourNotes,
      pricingInfo,
      overallRating,
      wouldRecommend,
      likelihood
    } = req.body;

    // Verify tour ownership
    const [tour] = await db
      .select()
      .from(tours)
      .where(eq(tours.id, tourId));

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    if (req.user?.id !== tour.userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this tour' });
    }

    // Update tour with feedback
    await db
      .update(tours)
      .set({
        overallImpression,
        tourNotes,
        pricingInfo,
        overallRating,
        wouldRecommend,
        likelihood,
        feedbackSubmitted: true,
        status: 'completed'
      })
      .where(eq(tours.id, tourId));

    res.json({ success: true, message: 'Tour feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting tour feedback:', error);
    res.status(500).json({ error: 'Failed to submit tour feedback' });
  }
});

export { router as tourRouter };

// Export registration function for the route index
export function registerTourRoutes(app: any) {
  app.use(router);
}