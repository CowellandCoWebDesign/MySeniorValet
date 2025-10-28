import { Router, Request, Response } from 'express';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Submit an information request
router.post('/request-info', async (req: Request, res: Response) => {
  try {
    const {
      communityId,
      communityName,
      communityLocation,
      name,
      email,
      phone,
      interestedParty,
      timeframe,
      specificQuestions,
      requestedInfo
    } = req.body;
    
    // Get user session if authenticated (optional)
    const sessionUser = (req.session as any)?.user;
    
    console.log('📋 Information request received:', {
      communityId,
      communityName,
      hasUser: !!sessionUser,
      requestedInfo
    });
    
    // Validate required contact information
    if (!name || !email || !phone) {
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
    
    // Format requested information for display
    const formatRequestedInfo = (info: string[]) => {
      const infoLabels: Record<string, string> = {
        pricing: 'Current Pricing & Fees',
        availability: 'Unit Availability',
        tourScheduling: 'Schedule a Tour',
        careServices: 'Care Services Offered',
        amenities: 'Amenities & Activities',
        virtualTour: 'Virtual Tour',
        brochure: 'Community Brochure',
        insurance: 'Insurance Accepted'
      };
      
      return info.map(item => infoLabels[item] || item).join(', ');
    };
    
    // Log the information request (you could save this to a database table)
    console.log('📧 Information request details:', {
      community: communityName,
      location: communityLocation,
      contactName: name,
      contactEmail: email,
      contactPhone: phone,
      interestedParty: interestedParty || 'self',
      timeframe: timeframe || 'not specified',
      requestedInfo: formatRequestedInfo(requestedInfo || ['general information']),
      specificQuestions: specificQuestions || 'None',
      timestamp: new Date().toISOString()
    });
    
    // Here you would typically:
    // 1. Save the request to a database
    // 2. Send an email to the community
    // 3. Send a confirmation email to the user
    // 4. Trigger any CRM integrations
    
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: `Thank you! Your information request for ${communityName} has been submitted successfully. A community representative will contact you within 24-48 hours with the requested information.`,
      details: {
        community: communityName,
        requestedInfo: formatRequestedInfo(requestedInfo || ['general information']),
        contactMethod: 'Phone and Email',
        responseTime: '24-48 hours'
      }
    });
    
  } catch (error) {
    console.error('Error processing information request:', error);
    res.status(500).json({ 
      error: 'Failed to submit information request. Please try again or contact support.' 
    });
  }
});

export default router;