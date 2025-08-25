import { Router } from 'express';
import { perplexityService } from '../perplexity-ai-service';
import { MultiAIVerificationService } from '../multi-ai-verification-service';

const router = Router();

// Fetch web intelligence for a community with identity verification
router.post('/api/communities/web-intelligence', async (req, res) => {
  try {
    const { communityName, city, state, query, address, zipCode } = req.body;
    
    if (!communityName || !city || !state) {
      return res.status(400).json({ 
        error: 'Community name, city, and state are required' 
      });
    }

    // Build the search query
    const searchQuery = query || `"${communityName}" ${city} ${state} senior living community details features amenities pricing`;
    
    console.log(`🔍 Fetching web intelligence for: ${communityName} in ${city}, ${state}`);
    
    // Use Perplexity's sonar-pro model to get comprehensive results
    const response = await perplexityService.searchRealTime(searchQuery);
    
    // CRITICAL: Verify this data is about the correct community using ChatGPT
    let isVerified = false;
    let isIdentityVerified = false;
    let isNameMatch = false;
    let chatgptVerification = null;
    let verificationError = null;
    
    try {
      const verificationService = new MultiAIVerificationService();
      
      const communityContext = {
        city,
        state,
        address: address || 'Not specified',
        zipCode: zipCode || 'Not specified',
        careTypes: ['Senior Living']
      };
      
      console.log(`🔍 Running identity verification for ${communityName}...`);
      
      chatgptVerification = await verificationService.verifyWithChatGPT(
        communityName, 
        response, 
        communityContext
      );
      
      console.log(`🔍 Identity verification result:`, {
        identityVerified: chatgptVerification?.identityVerified,
        nameMatch: chatgptVerification?.nameMatch,
        verified: chatgptVerification?.verified
      });
      
      // Check if the data is verified to be about the correct community
      isIdentityVerified = chatgptVerification?.identityVerified === true;
      isNameMatch = chatgptVerification?.nameMatch === 'exact' || chatgptVerification?.nameMatch === 'partial';
      isVerified = isIdentityVerified && isNameMatch;
      
    } catch (error) {
      console.error('❌ Identity verification failed:', error);
      verificationError = error;
      isVerified = false;
    }
    
    if (!isVerified) {
      // Return a warning instead of potentially wrong community data
      console.warn(`⚠️ Identity verification failed for ${communityName} - data may be about different community`);
      
      const verificationStatus = {
        identityVerified: chatgptVerification?.identityVerified || false,
        nameMatch: chatgptVerification?.nameMatch || 'unknown',
        concerns: chatgptVerification?.concerns || []
      };
      
      return res.json({
        content: `**Data Verification Alert**

We found search results for "${communityName}" in ${city}, ${state}, but we cannot verify that the information is specifically about this community. 

**Identity Check Results:**
- Community Identity Verified: ${chatgptVerification?.identityVerified ? '✅ Yes' : '❌ No'}
- Name Match: ${chatgptVerification?.nameMatch || 'Unknown'}
- Data Quality Concerns: ${chatgptVerification?.concerns?.join(', ') || 'None specified'}

**Why This Happens:**
The web search may have returned information about similarly named communities or properties. To ensure accuracy, we only display verified information.

**Next Steps:**
- Contact the community directly at their verified phone number
- Request official documentation and pricing
- Schedule a tour to confirm details in person

For accurate information about ${communityName}, please contact them directly.`,
        citations: response.sources || [],
        images: [],
        verified: false,
        identityVerified: chatgptVerification?.identityVerified || false,
        nameMatch: chatgptVerification?.nameMatch,
        verificationConcerns: chatgptVerification?.concerns || [],
        verificationError: verificationError instanceof Error ? verificationError.message : null,
        timestamp: new Date().toISOString()
      });
    }
    
    // Data is verified - return the intelligence
    const structuredResponse = {
      content: response.summary || '',
      citations: response.sources || [],
      images: response.images || [],
      verified: true,
      identityVerified: chatgptVerification?.identityVerified || false,
      nameMatch: chatgptVerification?.nameMatch,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ Web intelligence retrieved and verified for ${communityName} with ${structuredResponse.citations.length} sources`);
    
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