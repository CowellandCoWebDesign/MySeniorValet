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
      lengthOfStay,
      careNeeds,
      budget,
      additionalNotes,
      requestType = 'reservation',
      // Contact information from the form
      name,
      email,
      phone
    } = req.body;
    
    // Get user session if authenticated (optional)
    const sessionUser = (req.session as any)?.user;
    
    // Get user information from custom auth session
    console.log('🔐 User info from session:', { 
      hasUser: !!sessionUser, 
      email: sessionUser?.email, 
      firstName: sessionUser?.firstName,
      lastName: sessionUser?.lastName,
      id: sessionUser?.id
    });
    
    // Log contact information from form
    console.log('📞 Contact info from form:', {
      name: name || 'Not provided',
      email: email || 'Not provided', 
      phone: phone || 'Not provided'
    });
    
    // Get user info - require form data for all contact information
    const userName = name || (sessionUser?.firstName && sessionUser?.lastName 
      ? `${sessionUser.firstName} ${sessionUser.lastName}`
      : '');
    const userEmail = email || sessionUser?.email || '';
    const userPhone = phone || sessionUser?.phone || '';
    
    // Validate required contact information
    if (!userName || !userEmail || !userPhone) {
      console.error('❌ Missing required contact information');
      return res.status(400).json({ 
        error: 'Please provide all required contact information (name, email, and phone number).' 
      });
    }
    
    // Fetch community details from database
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);
      
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }
    
    console.log('🏢 Community details:', {
      id: community.id,
      name: community.name,
      hasEmail: !!community.email,
      email: community.email,
      hasPhone: !!community.phone,
      phone: community.phone
    });
    
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
      lengthOfStay,
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