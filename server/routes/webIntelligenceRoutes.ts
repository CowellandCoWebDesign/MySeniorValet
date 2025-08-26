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

    // Enhanced search query prioritizing official website
    const searchQuery = query || `"${communityName}" ${city} ${state} official website senior living community contact pricing amenities features`;
    
    console.log(`🔍 Fetching web intelligence for: ${communityName} in ${city}, ${state}`);
    
    // Use Perplexity's sonar-pro model to get comprehensive results
    const response = await perplexityService.searchRealTime(searchQuery);
    
    // IMPROVED: Smart verification with reasonable thresholds
    let verificationScore = 0;
    let isVerified = false;
    let isIdentityVerified = false;
    let isNameMatch = false;
    let chatgptVerification = null;
    let verificationError = null;
    
    // First, do a quick check if the data likely matches
    const contentLower = (response?.summary || '').toLowerCase();
    const nameLower = communityName.toLowerCase();
    const cityLower = city.toLowerCase();
    const stateLower = state.toLowerCase();
    
    // Basic matching heuristics
    if (contentLower.includes(nameLower) || contentLower.includes(nameLower.split(' ')[0])) {
      verificationScore += 40; // Name match
    }
    if (contentLower.includes(cityLower)) {
      verificationScore += 20; // City match
    }
    if (contentLower.includes(stateLower)) {
      verificationScore += 10; // State match
    }
    if (contentLower.includes('senior living') || contentLower.includes('assisted living') || contentLower.includes('memory care')) {
      verificationScore += 15; // Care type match
    }
    
    // If we have reasonable confidence, try ChatGPT verification but don't block on it
    if (verificationScore >= 50) {
      try {
        const verificationService = new MultiAIVerificationService();
        
        const communityContext = {
          city,
          state,
          address: address || 'Not specified',
          zipCode: zipCode || 'Not specified',
          careTypes: ['Senior Living']
        };
        
        console.log(`🔍 Running multi-AI verification for ${communityName} (pre-score: ${verificationScore})...`);
        
        // Use full multi-AI orchestration: Perplexity → Claude → ChatGPT
        const verificationPromise = verificationService.verifyRealTimeData(
          0, // communityId placeholder
          communityName, 
          response, 
          communityContext
        );
        
        const fullVerification = await Promise.race([
          verificationPromise,
          new Promise((resolve) => setTimeout(() => resolve(null), 5000)) // 5 second timeout for full orchestration
        ]);
        
        if (fullVerification) {
          // Extract verification results from the full orchestration
          const claudeVerif = fullVerification.verificationResults?.claudeVerification;
          const chatgptVerif = fullVerification.verificationResults?.chatgptVerification;
          const consensus = fullVerification.consensus;
          
          // Log AI orchestration status
          console.log(`🎭 AI Orchestration Status:`, {
            perplexity: fullVerification.aiOrchestra?.perplexity?.status,
            claude: fullVerification.aiOrchestra?.claude?.status,
            chatgpt: fullVerification.aiOrchestra?.chatgpt?.status,
            consensus: consensus?.agreementLevel
          });
          
          // Use Claude verification if available (primary), otherwise ChatGPT (fallback)
          chatgptVerification = claudeVerif || chatgptVerif;
          
          if (chatgptVerification) {
            isIdentityVerified = chatgptVerification?.identityVerified === true;
            isNameMatch = chatgptVerification?.nameMatch === 'exact' || chatgptVerification?.nameMatch === 'partial';
            isVerified = isIdentityVerified && isNameMatch;
          } else if (consensus?.confidenceScore >= 50) {
            // Use consensus if individual verifications failed
            isVerified = true;
            isIdentityVerified = true;
            isNameMatch = true;
          } else {
            // Fall back to heuristic
            isVerified = verificationScore >= 50;
            isIdentityVerified = verificationScore >= 50;
            isNameMatch = verificationScore >= 40;
          }
        } else {
          console.log(`⚠️ Multi-AI verification timed out, using heuristic score: ${verificationScore}`);
          // Fall back to heuristic scoring
          isVerified = verificationScore >= 50;
          isIdentityVerified = verificationScore >= 50;
          isNameMatch = verificationScore >= 40;
        }
      } catch (error) {
        console.error('❌ Identity verification failed:', error);
        verificationError = error;
        // Fall back to heuristic scoring on error
        isVerified = verificationScore >= 50;
        isIdentityVerified = verificationScore >= 50;
        isNameMatch = verificationScore >= 40;
      }
    } else {
      // Score too low, but still show data with disclaimer
      console.log(`⚠️ Low confidence score (${verificationScore}) for ${communityName}`);
      isVerified = false;
    }
    
    // IMPROVED: Show actual data with appropriate disclaimers instead of generic alerts
    if (!isVerified && verificationScore < 30) {
      // Only do retry attempts if confidence is very low
      console.warn(`⚠️ Very low confidence (${verificationScore}) for ${communityName} - attempting one targeted search`);
      
      // Try ONE more specific search
      const targetedQuery = `"${communityName}" "${city}" "${state}" senior living community contact information`;
      
      try {
        const retryResponse = await perplexityService.searchRealTime(targetedQuery);
        
        // Quick check if this improved things
        const retryContent = (retryResponse?.summary || '').toLowerCase();
        if (retryContent.includes(nameLower) && retryContent.includes(cityLower)) {
          console.log(`✅ Targeted search improved results for ${communityName}`);
          response.summary = retryResponse.summary || response.summary;
          response.sources = [...(response.sources || []), ...(retryResponse.sources || [])];
          response.images = [...(response.images || []), ...(retryResponse.images || [])];
          isVerified = true; // Accept the improved results
        }
      } catch (error) {
        console.error(`❌ Targeted search failed:`, error);
      }
    }
    
    // ALWAYS return actual data, just with appropriate confidence indicators
    if (!isVerified && verificationScore < 50) {
      // Low confidence - show data with a disclaimer
      console.warn(`⚠️ Showing data with disclaimer for ${communityName} (confidence: ${verificationScore})`);
      
      const disclaimerContent = response.summary ? 
        `**Note:** The following information may include details about senior living communities in ${city}, ${state}. Please verify specific details about "${communityName}" directly with the community.\n\n${response.summary}` :
        `We found limited information about senior living communities in ${city}, ${state}. Please contact "${communityName}" directly for specific details about their services and pricing.`;
      
      return res.json({
        content: disclaimerContent,
        citations: response.sources || [],
        images: response.images || [],
        verified: false,
        verificationScore: verificationScore,
        confidenceLevel: 'low',
        disclaimer: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Extract pricing from the response content
    const extractedPricing = extractPricingFromContent(response.summary || '');
    
    // Data is verified - return the intelligence
    const structuredResponse = {
      content: response.summary || '',
      citations: response.sources || [],
      images: response.images || [],
      verified: true,
      identityVerified: chatgptVerification?.identityVerified || false,
      nameMatch: chatgptVerification?.nameMatch,
      pricing: extractedPricing,
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

// Helper function to extract pricing from content
function extractPricingFromContent(content: string): any {
  const pricing: any = {};
  
  // First, extract pricing from markdown tables (Perplexity often returns data in table format)
  const tableRowPattern = /\|[^|]*\|[^|]*\|\s*([^|]*(?:Living|Care|Memory|Nursing|Skilled|Studio|bedroom|Apartment)?[^|]*)\s*\|\s*([^|]*\$[^|]*)\s*\|/gi;
  const tablePrices: string[] = [];
  let tableMatch;
  
  while ((tableMatch = tableRowPattern.exec(content)) !== null) {
    const priceCell = tableMatch[2];
    if (priceCell && priceCell.includes('$')) {
      const cleanPrice = priceCell.replace(/\|/g, '').trim();
      tablePrices.push(cleanPrice);
      console.log(`💰 Found table pricing: ${cleanPrice}`);
    }
  }
  
  // Additional pricing patterns for non-table content
  const pricingPatterns = [
    // Price ranges with various dash types
    /\$[\d,]+(?:\.\d{2})?\s*[–—-]\s*\$[\d,]+(?:\.\d{2})?(?:\s*\/?\s*(?:per\s+)?(?:month|mo|monthly))?/gi,
    // Starting/from prices
    /(?:starting\s+(?:at|from)|from|starts\s+at|as\s+low\s+as)\s*\$[\d,]+(?:\.\d{2})?(?:\s*\/?\s*(?:per\s+)?(?:month|mo|monthly))?/gi,
    // Prices with context words
    /(?:cost(?:s)?|price(?:d)?|rate(?:s)?|fee(?:s)?|rent)[\s:]*\$[\d,]+(?:\.\d{2})?(?:\s*[–—-]\s*\$[\d,]+(?:\.\d{2})?)?/gi,
    // Simple dollar amounts with monthly context
    /\$[\d,]+(?:\.\d{2})?(?:\s*\/?\s*(?:per\s+)?(?:month|mo|monthly))/gi,
    // Call for price variations
    /(?:call\s+for\s+(?:pricing|price|rates?))|(?:contact\s+(?:for|us\s+for)\s+pricing)/gi
  ];
  
  const foundPrices: string[] = [...tablePrices];
  pricingPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleanMatch = match.replace(/\|/g, '').trim();
        if (!foundPrices.includes(cleanMatch)) {
          foundPrices.push(cleanMatch);
        }
      });
    }
  });
  
  if (foundPrices.length > 0) {
    pricing.raw = foundPrices;
    
    // Extract numeric values for min/max
    const numbers: number[] = [];
    foundPrices.forEach(price => {
      const priceNumbers = price.match(/\$?([\d,]+(?:\.\d{2})?)/g);
      if (priceNumbers) {
        priceNumbers.forEach(n => {
          const num = parseFloat(n.replace(/[$,]/g, ''));
          if (num > 100 && num < 50000) { // Reasonable range for monthly costs
            numbers.push(num);
          }
        });
      }
    });
    
    if (numbers.length > 0) {
      pricing.min = Math.min(...numbers);
      pricing.max = Math.max(...numbers);
      pricing.formatted = pricing.min === pricing.max ? 
        `$${pricing.min.toLocaleString()}/month` :
        `$${pricing.min.toLocaleString()} - $${pricing.max.toLocaleString()}/month`;
      console.log(`💰 Extracted pricing range: ${pricing.formatted}`);
    }
    
    // Check for "call for price" patterns
    const callForPricePattern = /(?:call\s+for\s+(?:pricing|price|rates?))|(?:contact\s+(?:for|us\s+for)\s+pricing)/gi;
    if (callForPricePattern.test(content) && !pricing.min) {
      pricing.note = 'Contact community for pricing';
    }
  }
  
  return pricing;
}

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