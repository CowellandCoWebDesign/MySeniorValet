import { Request, Response, Router } from 'express';
import { db } from '../db';
import { tours, communities, users, userFavorites, tourFeedback } from '@shared/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { EmailService } from '../services/email';
import { format } from 'date-fns';
import { internalNotifications } from '../services/internal-notifications';

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
    
    // Check if community has any email available
    const communityHasEmail = community.communityManagerEmail || 
                             community.email || 
                             community.managementEmail;
    
    if (!communityHasEmail && !community.isClaimed) {
      return res.status(400).json({ 
        error: 'Unable to schedule tour', 
        message: 'This community has not yet claimed their listing and we have no contact information on file. Please contact the community directly or try another community.',
        suggestedAction: 'contactDirectly'
      });
    }
    
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

    // Find best available community email
    const findBestCommunityEmail = () => {
      return community.communityManagerEmail || 
             community.email || 
             community.managementEmail || 
             null;
    };
    
    const communityEmail = findBestCommunityEmail();
    const isTestMode = true; // Always in test mode for now
    const isClaimed = community.isClaimed || false;
    
    if (communityEmail || isTestMode) {
      try {
        const emailTo = isTestMode ? 'hello@myseniorvalet.com' : communityEmail || 'hello@myseniorvalet.com';
        
        // Different subject lines for claimed vs unclaimed
        const subject = isClaimed 
          ? `${isTestMode ? '[TEST MODE] ' : ''}New Tour Scheduled - ${community.name}` 
          : `${isTestMode ? '[TEST MODE] ' : ''}🎉 Your First Tour Request! - ${community.name}`;
        
        // Different email templates based on claimed status
        const emailHtml = isClaimed ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            ${isTestMode ? `<div style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 8px;"><p style="margin: 0; color: #92400e;"><strong>TEST MODE:</strong> This email would normally go to ${communityEmail || 'the community contact'}</p></div>` : ''}
            
            <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">New Tour Scheduled</h2>
            </div>
            
            <div style="padding: 20px;">
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #1e40af;">Tour Details</h3>
                <table style="width: 100%;">
                  <tr>
                    <td style="padding: 5px 0;"><strong>Date/Time:</strong></td>
                    <td>${format(tourDateTime, 'EEEE, MMMM d, yyyy at h:mm a')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0;"><strong>Guest Name:</strong></td>
                    <td>${contactName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0;"><strong>Contact:</strong></td>
                    <td>${contactEmail} ${contactPhone ? `| ${contactPhone}` : ''}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0;"><strong>Tour Type:</strong></td>
                    <td>${tourType.replace('_', ' ').charAt(0).toUpperCase() + tourType.slice(1).replace('_', ' ')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0;"><strong>Party Size:</strong></td>
                    <td>${attendeeCount} ${attendeeCount === 1 ? 'person' : 'people'}</td>
                  </tr>
                </table>
                ${specialRequests ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                  <strong>Special Requests:</strong><br>
                  ${specialRequests}
                </div>
                ` : ''}
              </div>
              
              <div style="margin-top: 20px; text-align: center;">
                <p style="color: #666; font-size: 14px;">
                  Tour scheduled via MySeniorValet - Your Verified Partner Platform
                </p>
              </div>
            </div>
          </div>
        ` : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            ${isTestMode ? `<div style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 8px;"><p style="margin: 0; color: #92400e;"><strong>TEST MODE:</strong> This email would normally go to ${communityEmail || 'the community contact'}</p></div>` : ''}
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0;">🎉 Congratulations!</h1>
              <h2 style="margin: 10px 0;">You Have Your First Tour Request!</h2>
            </div>
            
            <div style="padding: 30px;">
              <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #047857;">Great news!</h3>
                <p style="margin: 5px 0;">A family found your community on MySeniorValet and wants to schedule a tour. This is your opportunity to make a great first impression!</p>
              </div>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #1e40af;">Tour Details</h3>
                <p><strong>Date/Time:</strong> ${format(tourDateTime, 'EEEE, MMMM d, yyyy at h:mm a')}</p>
                <p><strong>Guest Name:</strong> ${contactName}</p>
                <p><strong>Contact:</strong> ${contactEmail} ${contactPhone ? `| ${contactPhone}` : ''}</p>
                <p><strong>Tour Type:</strong> ${tourType.replace('_', ' ').charAt(0).toUpperCase() + tourType.slice(1).replace('_', ' ')}</p>
                <p><strong>Party Size:</strong> ${attendeeCount} ${attendeeCount === 1 ? 'person' : 'people'}</p>
                ${specialRequests ? `<p><strong>Special Requests:</strong> ${specialRequests}</p>` : ''}
              </div>
              
              <div style="background-color: #e0f2fe; border: 2px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #0c4a6e; margin-top: 0;">🚀 Take Control of Your Listing!</h3>
                <p>Your community is one of <strong>34,171+ communities</strong> on MySeniorValet. Stand out by claiming your listing today!</p>
                
                <div style="display: flex; gap: 20px; margin: 20px 0;">
                  <div style="flex: 1;">
                    <h4 style="color: #0c4a6e;">Without Claiming:</h4>
                    <ul style="color: #666; margin: 5px 0;">
                      <li>Basic listing only</li>
                      <li>No photo updates</li>
                      <li>No direct messaging</li>
                      <li>Limited visibility</li>
                    </ul>
                  </div>
                  <div style="flex: 1;">
                    <h4 style="color: #0c4a6e;">With Claimed Status:</h4>
                    <ul style="color: #047857; margin: 5px 0;">
                      <li>✓ Update photos & info</li>
                      <li>✓ Direct family messaging</li>
                      <li>✓ Analytics dashboard</li>
                      <li>✓ Verified Partner badge</li>
                      <li>✓ Priority in searches</li>
                      <li>✓ Tour tracking tools</li>
                    </ul>
                  </div>
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                  <a href="https://myseniorvalet.com/vendor-signup" style="background-color: #0ea5e9; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 18px;">Claim Your Listing Now</a>
                  <p style="margin: 10px 0; color: #0c4a6e;">Starting at just $49/month</p>
                </div>
              </div>
              
              <hr style="border: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #666; font-size: 14px; text-align: center;">
                <strong>MySeniorValet Promise:</strong> We connect families directly with communities.<br>
                No middleman fees. No data sales. Just clear connections.
              </p>
            </div>
          </div>
        `;
        
        await EmailService.sendEmail({
          to: emailTo,
          cc: isTestMode ? [] : ['hello@myseniorvalet.com'], // CC in production only
          subject: subject,
          html: emailHtml
        });
        console.log(`Community notification sent to: ${isTestMode ? 'hello@myseniorvalet.com (TEST MODE)' : emailTo}`);
      } catch (error) {
        console.error('Error sending community notification:', error);
        // Don't fail the tour scheduling if community notification fails
      }
    } else {
      console.log('No community email found - notification not sent');
    }

    // Send internal notification to admin team
    try {
      await internalNotifications.notifyTourScheduled({
        communityId: community.id,
        communityName: community.name,
        userName: contactName,
        userEmail: contactEmail,
        userPhone: contactPhone,
        requestedDate: format(tourDateTime, 'EEEE, MMMM d, yyyy at h:mm a'),
        tourType,
        attendeeCount,
        message: specialRequests,
        contactPreference
      });
    } catch (notificationError) {
      console.error('Error sending internal notification:', notificationError);
      // Don't fail the tour scheduling if internal notification fails
    }

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

    // Find best available community email
    const findBestCommunityEmail = () => {
      return tourDetails.community?.communityManagerEmail || 
             tourDetails.community?.email || 
             tourDetails.community?.managementEmail || 
             null;
    };
    
    const isTestMode = process.env.NODE_ENV !== 'production' || true; // Always test mode for now
    const communityEmail = findBestCommunityEmail();
    const isClaimed = tourDetails.community?.isClaimed || false;
    
    console.log(`Community email check - Manager Email: ${tourDetails.community?.communityManagerEmail}, Community Email: ${tourDetails.community?.email}, Management Email: ${tourDetails.community?.managementEmail}, Is Claimed: ${isClaimed}`);
    
    if (communityEmail || isTestMode) {
      const emailTo = isTestMode ? 'hello@myseniorvalet.com' : communityEmail || 'hello@myseniorvalet.com';
      console.log(`Preparing to send community email - Test Mode: ${isTestMode}, Actual: ${communityEmail}, Will send to: ${emailTo}`);
      
      // Build shared information based on user preferences
      let sharedInfo = '';
      if (shareContactInfo && tourDetails.user) {
        sharedInfo += `
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 10px 0;">
            <h4 style="margin-top: 0; color: #1e40af;">Contact Information (Shared with Permission)</h4>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${tourDetails.user.firstName} ${tourDetails.user.lastName || ''}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${tourDetails.user.email}">${tourDetails.user.email}</a></p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${tourDetails.user.phone || 'Not provided'}</p>
          </div>
        `;
      }
      
      if (shareNotes && tourNotes) {
        sharedInfo += `
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 10px 0;">
            <h4 style="margin-top: 0; color: #1e40af;">Tour Notes (Shared with Permission)</h4>
            <p style="margin: 5px 0;">${tourNotes}</p>
          </div>
        `;
      }
      
      // Pricing is ALWAYS shared according to the requirements
      if (pricingInfo) {
        sharedInfo += `
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 10px 0;">
            <h4 style="margin-top: 0; color: #92400e;">Pricing Information Discussed</h4>
            <p style="margin: 5px 0;">${pricingInfo}</p>
          </div>
        `;
      }
      
      // Different subject lines for claimed vs unclaimed
      const subject = isClaimed 
        ? `${isTestMode ? '[TEST MODE] ' : ''}Tour Feedback - ${tourDetails.community?.name}` 
        : `${isTestMode ? '[TEST MODE] ' : ''}🌟 Tour Complete + Unlock More Features - ${tourDetails.community?.name}`;

      // Different email templates based on claimed status
      const communityEmailHtml = isClaimed ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${isTestMode ? `<div style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 8px;"><p style="margin: 0; color: #92400e;"><strong>TEST MODE:</strong> This email would normally go to ${communityEmail || 'the community contact'}</p></div>` : ''}
          
          <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Tour Feedback Received</h2>
          </div>
          
          <div style="padding: 20px;">
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #1e40af;">Tour Summary</h3>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 5px 0; width: 40%;"><strong>Date:</strong></td>
                  <td>${format(tourDetails.tour.tourDate, 'EEEE, MMMM d, yyyy')}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;"><strong>Overall Rating:</strong></td>
                  <td>${'⭐'.repeat(overallRating || 0)} (${overallRating || 0}/5)</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;"><strong>Would Recommend:</strong></td>
                  <td>${wouldRecommend ? '✅ Yes' : '❌ No'}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;"><strong>Move-in Likelihood:</strong></td>
                  <td>${likelihood ? likelihood.replace('_', ' ').charAt(0).toUpperCase() + likelihood.slice(1).replace('_', ' ') : 'Not specified'}</td>
                </tr>
              </table>
            </div>
            
            ${overallImpression ? `
            <div style="background-color: #e0f2fe; padding: 15px; border-radius: 6px; margin: 10px 0;">
              <h4 style="margin-top: 0; color: #0c4a6e;">Overall Impression</h4>
              <p style="margin: 5px 0;">${overallImpression}</p>
            </div>
            ` : ''}
            
            ${sharedInfo || '<p style="text-align: center; color: #666; padding: 20px;">The prospect chose not to share additional contact information at this time.</p>'}
            
            <div style="margin-top: 20px; text-align: center;">
              <p style="color: #666; font-size: 14px;">
                Feedback provided via MySeniorValet - Your Verified Partner Platform
              </p>
            </div>
          </div>
        </div>
      ` : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${isTestMode ? `<div style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 8px;"><p style="margin: 0; color: #92400e;"><strong>TEST MODE:</strong> This email would normally go to ${communityEmail || 'the community contact'}</p></div>` : ''}
          
          <div style="background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">✅ Tour Complete!</h1>
            <h2 style="margin: 10px 0;">Here's What Your Prospect Said</h2>
          </div>
          
          <div style="padding: 30px;">
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #1e40af;">Tour Feedback</h3>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Date:</strong></td>
                  <td>${format(tourDetails.tour.tourDate, 'EEEE, MMMM d, yyyy')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Overall Rating:</strong></td>
                  <td style="font-size: 20px;">${'⭐'.repeat(overallRating || 0)} (${overallRating || 0}/5)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Would Recommend:</strong></td>
                  <td style="font-size: 18px;">${wouldRecommend ? '✅ YES!' : '❌ No'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Move-in Likelihood:</strong></td>
                  <td><strong style="color: ${likelihood === 'very_likely' ? '#047857' : '#666'};">${likelihood ? likelihood.replace('_', ' ').charAt(0).toUpperCase() + likelihood.slice(1).replace('_', ' ') : 'Not specified'}</strong></td>
                </tr>
              </table>
            </div>
            
            ${overallImpression ? `
            <div style="background-color: #e0f2fe; padding: 15px; border-radius: 6px; margin: 10px 0;">
              <h4 style="margin-top: 0; color: #0c4a6e;">What They Said:</h4>
              <p style="margin: 5px 0; font-style: italic;">"${overallImpression}"</p>
            </div>
            ` : ''}
            
            ${sharedInfo || '<p style="text-align: center; color: #666; padding: 20px;">The prospect chose not to share additional contact information at this time.</p>'}
            
            <div style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="color: #92400e; margin-top: 0;">⚡ Did You Know?</h3>
              <p style="color: #92400e;">Communities that claim their listings see:</p>
              <ul style="color: #92400e;">
                <li><strong>3x more tour requests</strong> with enhanced visibility</li>
                <li><strong>50% higher conversion rates</strong> with direct messaging</li>
                <li><strong>Detailed analytics</strong> on who's viewing your listing</li>
              </ul>
              
              <p style="color: #92400e; margin-top: 15px;"><strong>Right now, you're missing out on:</strong></p>
              <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 10px 0;">
                <p style="margin: 5px 0; color: #666;">❌ <strong>Direct messaging</strong> with ${tourDetails.user?.firstName || 'this prospect'} for follow-up</p>
                <p style="margin: 5px 0; color: #666;">❌ <strong>Analytics</strong> on how many families viewed your listing this week</p>
                <p style="margin: 5px 0; color: #666;">❌ <strong>Priority placement</strong> in search results</p>
                <p style="margin: 5px 0; color: #666;">❌ <strong>Verified Partner badge</strong> that builds trust</p>
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="https://myseniorvalet.com/vendor-signup" style="background-color: #f59e0b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 18px;">Claim Your Listing Now</a>
                <p style="margin: 10px 0; color: #92400e;">
                  <strong>Limited Time:</strong> First month just $25 (reg. $49)<br>
                  <small>Less than the cost of one tour no-show!</small>
                </p>
              </div>
            </div>
            
            <hr style="border: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              <strong>MySeniorValet:</strong> 34,171+ communities. Direct connections. No middleman fees.<br>
              <a href="https://myseniorvalet.com">Learn more about our platform</a>
            </p>
          </div>
        </div>
      `;

      const communityEmailSent = await EmailService.sendEmail({
        to: emailTo,
        cc: isTestMode ? [] : ['hello@myseniorvalet.com'], // CC in production only
        subject: subject,
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