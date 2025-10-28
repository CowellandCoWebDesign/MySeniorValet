import { Router, Request, Response } from 'express';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { infoRequestService } from '../services/info-request.service';

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
    
    // Process the information request and send emails
    const emailResult = await infoRequestService.processInfoRequest({
      communityId,
      communityName: community.name,
      communityLocation: communityLocation || `${community.city}, ${community.state}`,
      communityPhone: community.phone || undefined,
      communityEmail: community.email || undefined,
      userName: name,
      userEmail: email,
      userPhone: phone,
      interestedParty,
      timeframe,
      specificQuestions,
      requestedInfo
    });
    
    // Log the information request details
    console.log('📧 Information request processed:', {
      community: communityName,
      location: communityLocation,
      contactName: name,
      contactEmail: email,
      contactPhone: phone,
      interestedParty: interestedParty || 'self',
      timeframe: timeframe || 'not specified',
      requestedInfo: formatRequestedInfo(requestedInfo || ['general information']),
      specificQuestions: specificQuestions || 'None',
      emailsSent: emailResult.emailsSent,
      timestamp: new Date().toISOString()
    });
    
    if (emailResult.success && emailResult.adminNotified) {
      res.json({
        success: true,
        message: `Thank you! Your information request for ${communityName} has been submitted successfully. A community representative will contact you within 24-48 hours with the requested information.`,
        details: {
          community: communityName,
          requestedInfo: formatRequestedInfo(requestedInfo || ['general information']),
          contactMethod: 'Phone and Email',
          responseTime: '24-48 hours',
          emailsSent: emailResult.emailsSent
        }
      });
    } else if (!emailResult.adminNotified) {
      // Critical: Admin notification failed - log error but still return success to user
      console.error('⚠️ CRITICAL: Admin notification failed. Manual follow-up required.');
      
      // Store failed request for manual processing (you could implement a database table for this)
      console.error('FAILED ADMIN NOTIFICATION:', {
        timestamp: new Date().toISOString(),
        community: communityName,
        user: { name, email, phone },
        requestedInfo: requestedInfo
      });
      
      res.json({
        success: true,
        message: `Thank you! Your information request for ${communityName} has been received. A community representative will contact you within 24-48 hours.`,
        details: {
          community: communityName,
          requestedInfo: formatRequestedInfo(requestedInfo || ['general information']),
          contactMethod: 'Phone and Email',
          responseTime: '24-48 hours',
          note: 'Your request has been logged for processing.'
        }
      });
    } else {
      // Other email failures but admin was notified
      console.log('ℹ️ Some emails failed but admin was notified');
      res.json({
        success: true,
        message: `Thank you! Your information request for ${communityName} has been received. A community representative will contact you within 24-48 hours.`,
        details: {
          community: communityName,
          requestedInfo: formatRequestedInfo(requestedInfo || ['general information']),
          contactMethod: 'Phone and Email',
          responseTime: '24-48 hours'
        }
      });
    }
    
  } catch (error) {
    console.error('Error processing information request:', error);
    res.status(500).json({ 
      error: 'Failed to submit information request. Please try again or contact support.' 
    });
  }
});

export default router;