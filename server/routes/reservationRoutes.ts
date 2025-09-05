import { Router, Request, Response } from 'express';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { reservationMarketingService } from '../services/reservation-marketing.service';

const router = Router();

// Submit a reservation request
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const {
      communityId,
      communityName,
      unitType,
      moveInDate,
      careNeeds,
      budget,
      additionalNotes,
      requestType = 'reservation'
    } = req.body;
    
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        error: 'You must be logged in to place a reservation. Please create an account or sign in.' 
      });
    }
    
    // Get user information from session
    const user = req.user as any;
    const userName = user.name || user.email?.split('@')[0] || 'Guest';
    const userEmail = user.email;
    const userPhone = user.phone || '';
    
    // Fetch community details from database
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);
      
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }
    
    // Prepare reservation request
    const reservationRequest = {
      communityId,
      communityName: community.name,
      communityAddress: `${community.address}, ${community.city}, ${community.state}`,
      communityPhone: community.phone || undefined,
      communityEmail: community.email || undefined,
      
      userName,
      userEmail,
      userPhone,
      
      unitType,
      moveInDate,
      careNeeds,
      budget,
      additionalNotes,
      
      requestType: requestType as 'reservation' | 'waitlist',
      depositAmount: 500,
      paymentTerms: 'Pay at time of arrival'
    };
    
    // Process reservation and send marketing emails
    const result = await reservationMarketingService.processReservationRequest(reservationRequest);
    
    if (result.success) {
      console.log(`✅ Reservation request processed for ${communityName} by ${userName}`);
      
      // Log the reservation in database (optional - for tracking)
      // You could create a reservations table to track these
      
      res.json({
        success: true,
        message: 'Your reservation request has been submitted successfully!',
        details: {
          community: communityName,
          deposit: 500,
          paymentTerms: 'Pay at time of arrival',
          nextSteps: 'The community will contact you within 24-48 hours to confirm availability and schedule a tour.'
        }
      });
    } else {
      throw new Error(result.error || 'Failed to process reservation');
    }
    
  } catch (error) {
    console.error('Error processing reservation request:', error);
    res.status(500).json({ 
      error: 'Failed to submit reservation request. Please try again or contact support.' 
    });
  }
});

// Get reservation terms
router.get('/terms', (req: Request, res: Response) => {
  res.json({
    depositAmount: 500,
    paymentTerms: 'Pay at time of arrival',
    requirements: ['Platform registration required', 'Valid email address', 'Contact information'],
    process: [
      'Register or sign in to MySeniorValet',
      'Submit reservation request',
      'Community contacts you within 24-48 hours',
      'Schedule tour and discuss details',
      'Pay $500 deposit at move-in'
    ]
  });
});

export default router;