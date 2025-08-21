import { Router } from 'express';
import { perplexityService } from '../perplexity-ai-service';

const router = Router();

// Fetch web intelligence for a community
router.post('/api/communities/web-intelligence', async (req, res) => {
  try {
    const { communityName, city, state, query } = req.body;
    
    if (!communityName || !city || !state) {
      return res.status(400).json({ 
        error: 'Community name, city, and state are required' 
      });
    }

    // Build the search query
    const searchQuery = query || `"${communityName}" ${city} ${state} senior living community details features amenities pricing`;
    
    console.log(`🔍 Fetching web intelligence for: ${communityName} in ${city}, ${state}`);
    
    // Use Perplexity's sonar-pro model to get comprehensive results with images
    const response = await perplexityService.searchRealTime(searchQuery);
    
    // Parse the response to extract structured data including images
    const structuredResponse = {
      content: response.summary || '',
      citations: response.sources || [],
      images: response.images || [],  // Real community photos found online
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ Web intelligence retrieved with ${structuredResponse.citations.length} sources`);
    
    res.json(structuredResponse);
  } catch (error) {
    console.error('Error fetching web intelligence:', error);
    res.status(500).json({ 
      error: 'Failed to fetch web intelligence',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Fetch comparative analysis for multiple communities
router.post('/api/communities/comparative-intelligence', async (req, res) => {
  try {
    const { location, careType } = req.body;
    
    if (!location) {
      return res.status(400).json({ 
        error: 'Location is required' 
      });
    }

    // Build comparative search query
    const searchQuery = `senior living communities in ${location} ${careType ? careType : ''} pricing comparison features amenities reviews`;
    
    console.log(`📊 Fetching comparative intelligence for: ${location}`);
    
    const response = await perplexityService.searchRealTime(searchQuery);
    
    res.json({
      content: response.summary || '',
      citations: response.sources || [],
      images: response.images || [],
      location,
      careType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching comparative intelligence:', error);
    res.status(500).json({ 
      error: 'Failed to fetch comparative intelligence',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Verify community information against web sources
router.post('/api/communities/verify-information', async (req, res) => {
  try {
    const { communityId, communityName, address, phone, website } = req.body;
    
    if (!communityName) {
      return res.status(400).json({ 
        error: 'Community name is required for verification' 
      });
    }

    // Build verification query
    const verificationQuery = `"${communityName}" ${address ? `"${address}"` : ''} ${phone ? `phone ${phone}` : ''} ${website ? `website ${website}` : ''} verify contact information`;
    
    console.log(`🔍 Verifying information for: ${communityName}`);
    
    const response = await perplexityService.searchRealTime(verificationQuery);
    
    // Extract verification results
    const content = response.summary || '';
    const verificationResults = {
      communityId,
      verified: content.toLowerCase().includes(communityName.toLowerCase()),
      addressConfirmed: address ? content.includes(address.split(',')[0]) : null,
      phoneConfirmed: phone ? content.includes(phone.replace(/\D/g, '').slice(-7)) : null,
      websiteConfirmed: website ? content.includes(website.replace(/https?:\/\//, '')) : null,
      additionalInfo: extractAdditionalInfo(content),
      sources: response.sources || [],
      images: response.images || [],  // Include found images
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ Verification complete for ${communityName}`);
    
    res.json(verificationResults);
  } catch (error) {
    console.error('Error verifying community information:', error);
    res.status(500).json({ 
      error: 'Failed to verify community information',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to extract additional information
function extractAdditionalInfo(content: string) {
  const info: any = {};
  
  // Extract email if found
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = content.match(emailPattern);
  if (emails) {
    info.emails = [...new Set(emails)];
  }
  
  // Extract social media
  if (content.includes('facebook.com')) info.hasFacebook = true;
  if (content.includes('twitter.com') || content.includes('x.com')) info.hasTwitter = true;
  if (content.includes('instagram.com')) info.hasInstagram = true;
  if (content.includes('linkedin.com')) info.hasLinkedIn = true;
  
  // Extract business hours if mentioned
  const hoursPattern = /\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)\s*-\s*\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)/g;
  const hours = content.match(hoursPattern);
  if (hours) {
    info.businessHours = hours[0];
  }
  
  // Check for certifications/awards
  const certifications = [];
  if (content.includes('Medicare')) certifications.push('Medicare Certified');
  if (content.includes('Medicaid')) certifications.push('Medicaid Certified');
  if (content.includes('award') || content.includes('Award')) info.hasAwards = true;
  if (certifications.length > 0) info.certifications = certifications;
  
  return info;
}

export default router;