import { Request, Response, Router } from 'express';
import { db } from '../db';
import { tours, communities, users, userFavorites, tourFeedback } from '@shared/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
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
    let userId = req.user?.id ? parseInt(req.user.id) : null;
    
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
        userId = parseInt(existingUser.id);
      } else {
        // Create guest user using raw SQL to avoid schema mismatch issues
        // Get the next available user ID
        const maxIdResult = await db.execute(sql`SELECT MAX(id) as max_id FROM users`);
        const maxId = parseInt(String(maxIdResult.rows[0]?.max_id || 39096632)) || 39096632; // Start after current super admin
        const newUserId = maxId + 1;
        const username = `guest_${contactEmail.split('@')[0]}_${Math.floor(Math.random() * 10000)}`;
        
        const result = await db.execute(sql`
          INSERT INTO users (id, username, password, email, first_name, last_name, phone, role)
          VALUES (${newUserId}, ${username}, ${'guest_account'}, ${contactEmail}, 
                  ${contactName.split(' ')[0]}, ${contactName.split(' ').slice(1).join(' ') || ''}, 
                  ${contactPhone}, ${'user'})
          RETURNING *
        `);
        
        const newUser = result.rows[0] as any;
        userId = newUser.id;
      }
    }

    // Create the tour (userId should never be null at this point)
    if (!userId) {
      return res.status(400).json({ error: 'Failed to create or identify user' });
    }
    
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
        .from(userFavorites)
        .where(
          and(
            eq(userFavorites.userId, userId),
            eq(userFavorites.communityId, communityId)
          )
        );

      if (existingFavorite.length === 0) {
        // Add to favorites
        await db
          .insert(userFavorites)
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
        status: 'cancelled'
      })
      .where(eq(tours.id, tourId));
    
    // Store cancellation reason in tour feedback if needed
    if (reason) {
      // Check if feedback already exists
      const existingFeedback = await db
        .select()
        .from(tourFeedback)
        .where(eq(tourFeedback.tourId, tourId));
      
      if (existingFeedback.length > 0) {
        await db
          .update(tourFeedback)
          .set({ staffNotes: reason })
          .where(eq(tourFeedback.tourId, tourId));
      } else {
        await db
          .insert(tourFeedback)
          .values({
            tourId,
            userId: tour.tour.userId,
            communityId: tour.tour.communityId,
            staffNotes: reason
          });
      }
    }

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
      likelihood,
      shareContactInfo = true,
      shareNotes = false,
      sharePricing = false
    } = req.body;

    // Get full tour details with community and user info
    const [tourDetails] = await db
      .select({
        tour: tours,
        community: communities,
        user: users
      })
      .from(tours)
      .leftJoin(communities, eq(tours.communityId, communities.id))
      .leftJoin(users, eq(tours.userId, users.id))
      .where(eq(tours.id, tourId));

    if (!tourDetails) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    if (req.user?.id !== tourDetails.tour.userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this tour' });
    }

    // Update tour status
    await db
      .update(tours)
      .set({
        feedbackSubmitted: true,
        status: 'completed'
      })
      .where(eq(tours.id, tourId));
    
    // Store feedback in tourFeedback table
    const existingFeedback = await db
      .select()
      .from(tourFeedback)
      .where(eq(tourFeedback.tourId, tourId));
    
    if (existingFeedback.length > 0) {
      await db
        .update(tourFeedback)
        .set({
          overallImpression,
          tourNotes,
          pricingInfo,
          overallRating,
          wouldRecommend,
          likelihood,
          shareContactInfo,
          shareNotes,
          sharePricing,
          updatedAt: new Date()
        })
        .where(eq(tourFeedback.tourId, tourId));
    } else {
      await db
        .insert(tourFeedback)
        .values({
          tourId,
          userId: tourDetails.tour.userId,
          communityId: tourDetails.tour.communityId,
          overallImpression,
          tourNotes,
          pricingInfo,
          overallRating,
          wouldRecommend,
          likelihood,
          shareContactInfo,
          shareNotes,
          sharePricing
        });
    }

    // Import NotificationService
    const { NotificationService } = await import('../notification-service');

    // Send notification to user/prospect
    if (tourDetails.user?.email) {
      console.log(`Preparing to send prospect email to: ${tourDetails.user.email}`);
      
      const prospectEmailHtml = `
        <h2>Tour Completed at ${tourDetails.community?.name}</h2>
        <p>Thank you for completing your tour! We hope you found it informative.</p>
        
        <h3>Your Tour Summary:</h3>
        <ul>
          <li><strong>Community:</strong> ${tourDetails.community?.name}</li>
          <li><strong>Date:</strong> ${format(tourDetails.tour.tourDate, 'EEEE, MMMM d, yyyy at h:mm a')}</li>
          <li><strong>Overall Rating:</strong> ${overallRating || 'Not rated'}/5</li>
          <li><strong>Would Recommend:</strong> ${wouldRecommend ? 'Yes' : 'No'}</li>
        </ul>
        
        ${tourNotes ? `<p><strong>Your Notes:</strong> ${tourNotes}</p>` : ''}
        
        <p><strong>Privacy Promise:</strong> MySeniorValet will never sell your information. We only connect you directly with communities, cutting out the middle confusion.</p>
        
        <p>The community has been notified of your tour completion and your contact preferences.</p>
        
        <hr>
        <p style="color: #666; font-size: 14px;">
          You're receiving this because you completed a tour through MySeniorValet. 
          We're here to help you find the perfect senior living community.
        </p>
      `;

      const prospectEmailSent = await EmailService.sendEmail({
        to: tourDetails.user.email,
        cc: 'hello@myseniorvalet.com',
        subject: `Tour Completed - ${tourDetails.community?.name}`,
        html: prospectEmailHtml
      });
      
      console.log(`Prospect email sent: ${prospectEmailSent ? 'SUCCESS' : 'FAILED'} (to: ${tourDetails.user.email}, cc: hello@myseniorvalet.com)`);

      // Create notification for user
      await NotificationService.createNotification({
        userId: tourDetails.user.id.toString(),
        type: 'tour_completed',
        category: 'general',
        priority: 'normal',
        title: 'Tour Completed Successfully',
        message: `Your tour at ${tourDetails.community?.name} has been marked as complete. The community has been notified.`,
        actionUrl: `/tours`,
        iconType: 'check-circle',
        communityId: tourDetails.community?.id,
        metadata: {
          changeType: 'tour_completed'
        }
      });
    }

    // Send notification to community (if email available)
    // TEST MODE: Only send to admin emails until deployment
    const isTestMode = process.env.NODE_ENV !== 'production' || true; // Always test mode for now
    
    const communityHasEmail = tourDetails.community?.communityManagerEmail || tourDetails.community?.email;
    console.log(`Community email check - Has email: ${!!communityHasEmail}, Manager Email: ${tourDetails.community?.communityManagerEmail}, Community Email: ${tourDetails.community?.email}`);
    
    if (communityHasEmail) {
      const actualCommunityEmail = tourDetails.community.communityManagerEmail || tourDetails.community.email;
      const communityEmail = isTestMode ? 'hello@myseniorvalet.com' : actualCommunityEmail;
      console.log(`Preparing to send community email - Test Mode: ${isTestMode}, Actual: ${actualCommunityEmail}, Will send to: ${communityEmail}`);
      
      // Build shared information based on user preferences
      let sharedInfo = '';
      if (shareContactInfo && tourDetails.user) {
        sharedInfo += `
          <h3>Contact Information (Shared with Permission):</h3>
          <ul>
            <li><strong>Name:</strong> ${tourDetails.user.firstName} ${tourDetails.user.lastName || ''}</li>
            <li><strong>Email:</strong> ${tourDetails.user.email}</li>
            <li><strong>Phone:</strong> ${tourDetails.user.phone || 'Not provided'}</li>
          </ul>
        `;
      }
      
      if (shareNotes && tourNotes) {
        sharedInfo += `
          <h3>Tour Notes (Shared with Permission):</h3>
          <p>${tourNotes}</p>
        `;
      }
      
      if (sharePricing && pricingInfo) {
        sharedInfo += `
          <h3>Pricing Discussion (Shared with Permission):</h3>
          <p>${pricingInfo}</p>
        `;
      }

      const communityEmailHtml = `
        ${isTestMode ? '<div style="background: #fef3c7; padding: 10px; margin-bottom: 20px; border-radius: 5px;"><strong>TEST MODE:</strong> This email would normally go to ' + actualCommunityEmail + ' but is being sent to admin for testing.</div>' : ''}
        <h2>Tour Completed at Your Community</h2>
        <p>A prospect has completed their tour and provided feedback.</p>
        
        <h3>Tour Details:</h3>
        <ul>
          <li><strong>Date:</strong> ${format(tourDetails.tour.tourDate, 'EEEE, MMMM d, yyyy at h:mm a')}</li>
          <li><strong>Tour Type:</strong> ${tourDetails.tour.tourType?.replace('_', ' ') || 'In Person'}</li>
          <li><strong>Overall Rating:</strong> ${overallRating || 'Not rated'}/5</li>
          <li><strong>Likelihood to Move In:</strong> ${likelihood || 'Not specified'}</li>
          <li><strong>Would Recommend:</strong> ${wouldRecommend ? 'Yes' : 'No'}</li>
        </ul>
        
        ${sharedInfo || '<p>The prospect chose not to share additional information at this time.</p>'}
        
        <hr>
        <p><strong>MySeniorValet Promise:</strong> We never sell prospect information. We simply connect families with communities, cutting out the middle confusion. This information is shared directly from the prospect to you.</p>
        
        <p style="color: #666; font-size: 14px;">
          This tour was facilitated through MySeniorValet - Clarity in Senior Living
        </p>
      `;

      const communityEmailSent = await EmailService.sendEmail({
        to: communityEmail!,
        cc: 'hello@myseniorvalet.com',
        subject: `${isTestMode ? '[TEST MODE] ' : ''}Tour Completed - ${tourDetails.user?.firstName || 'Guest'} ${tourDetails.user?.lastName || ''}`,
        html: communityEmailHtml
      });
      
      console.log(`Community email sent: ${communityEmailSent ? 'SUCCESS' : 'FAILED'} (to: ${communityEmail}, cc: hello@myseniorvalet.com)`);
    } else {
      console.log('Community email NOT sent - No community email address available');
    }

    // Send notification to super admin
    await NotificationService.createSuperAdminNotification(
      'tour_completed',
      'Tour Completed',
      `Tour completed at ${tourDetails.community?.name} by ${tourDetails.user?.email}`,
      {
        category: 'general',
        tourId,
        communityId: tourDetails.community?.id,
        communityName: tourDetails.community?.name,
        userEmail: tourDetails.user?.email,
        overallRating,
        wouldRecommend,
        likelihood
      }
    );

    res.json({ 
      success: true, 
      message: 'Tour feedback submitted successfully. Notifications sent to all parties.',
      notificationsSent: {
        prospect: !!tourDetails.user?.email,
        community: !!(tourDetails.community?.communityManagerEmail || tourDetails.community?.email),
        admin: true
      }
    });
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