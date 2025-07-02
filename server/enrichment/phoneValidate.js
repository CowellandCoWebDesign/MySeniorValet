/**
 * Twilio Phone Validation ($0.005/lookup)
 * Validates phone numbers for senior living communities
 */

export async function validatePhone(phoneNumber) {
  if (!phoneNumber) {
    return { isValid: false, error: 'No phone number provided' };
  }

  // Check if Twilio credentials are available
  if (!process.env.TWILIO_LOOKUP_KEY || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('Twilio credentials not available, skipping phone validation');
    return { isValid: null, error: 'Twilio credentials not configured' };
  }

  try {
    // Clean phone number - remove formatting
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    
    // Basic validation - must be 10+ digits for US numbers
    if (cleanPhone.length < 10) {
      return { isValid: false, error: 'Phone number too short' };
    }

    // Twilio Lookup API call
    const accountSid = process.env.TWILIO_LOOKUP_KEY;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await fetch(
      `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(cleanPhone)}?Fields=carrier,caller_name`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      return {
        isValid: data.valid || false,
        phoneNumber: data.phone_number,
        carrier: data.carrier?.name,
        lineType: data.carrier?.type,
        callerName: data.caller_name?.caller_name,
        error: null
      };
    } else if (response.status === 404) {
      // Phone number not found or invalid
      return { isValid: false, error: 'Phone number not found' };
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Twilio API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

  } catch (error) {
    console.error('Phone validation error:', error.message);
    return { 
      isValid: false, 
      error: error.message 
    };
  }
}

/**
 * Batch phone validation with rate limiting
 */
export async function validatePhonesBatch(phoneNumbers, delayMs = 100) {
  const results = [];
  
  for (const phone of phoneNumbers) {
    try {
      const result = await validatePhone(phone);
      results.push({ phone, ...result });
      
      // Rate limiting to stay within Twilio limits
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      results.push({ 
        phone, 
        isValid: false, 
        error: error.message 
      });
    }
  }
  
  return results;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  const cleaned = phone.replace(/[^\d]/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if can't format
}