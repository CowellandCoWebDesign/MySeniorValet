const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE = 'http://localhost:5000';

async function debugTourFeedbackEmails() {
  console.log('🔍 DEBUGGING TOUR FEEDBACK EMAIL SYSTEM\n');
  
  // First, let's find a tour that's already scheduled
  try {
    console.log('1. Fetching existing tours...');
    const toursResponse = await fetch(`${API_BASE}/api/tours`, {
      headers: {
        'Cookie': 'test-auth-cookie'
      }
    });
    
    const toursData = await toursResponse.json();
    console.log(`   Found ${toursData.tours?.length || 0} tours`);
    
    if (!toursData.tours || toursData.tours.length === 0) {
      console.log('❌ No tours found. Please schedule a tour first through the UI.');
      return;
    }
    
    // Find a tour without feedback
    const tourWithoutFeedback = toursData.tours.find(t => !t.feedbackSubmitted);
    
    if (!tourWithoutFeedback) {
      console.log('❌ All tours already have feedback. Please schedule a new tour.');
      return;
    }
    
    console.log(`\n2. Using tour ID ${tourWithoutFeedback.id} for ${tourWithoutFeedback.communityName}`);
    console.log(`   Tour date: ${new Date(tourWithoutFeedback.tourDate).toLocaleString()}`);
    console.log(`   User email: ${tourWithoutFeedback.contactEmail}`);
    
    // Get community details
    console.log('\n3. Fetching community details...');
    const communityResponse = await fetch(`${API_BASE}/api/communities/${tourWithoutFeedback.communityId}`);
    const community = await communityResponse.json();
    
    console.log(`   Community: ${community.name}`);
    console.log(`   Community email: ${community.email || 'NONE'}`);
    console.log(`   Manager email: ${community.communityManagerEmail || 'NONE'}`);
    
    // Submit feedback
    console.log('\n4. Submitting tour feedback...');
    const feedbackData = {
      overallImpression: 'Great community with excellent amenities',
      tourNotes: 'Clean facilities, friendly staff, good location',
      pricingInfo: 'Base rent $3500, care levels range from $500-$2000',
      overallRating: 5,
      wouldRecommend: true,
      likelihood: 'very_likely',
      shareContactInfo: true,
      shareNotes: true,
      sharePricing: true
    };
    
    console.log('   Feedback data:', JSON.stringify(feedbackData, null, 2));
    
    const feedbackResponse = await fetch(`${API_BASE}/api/tours/${tourWithoutFeedback.id}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'test-auth-cookie'
      },
      body: JSON.stringify(feedbackData)
    });
    
    const result = await feedbackResponse.json();
    console.log(`\n5. Response status: ${feedbackResponse.status}`);
    console.log('   Response:', JSON.stringify(result, null, 2));
    
    if (feedbackResponse.ok) {
      console.log('\n✅ Feedback submitted successfully!');
      console.log('\n📧 CHECK SERVER LOGS for email sending details:');
      console.log('   - Look for "Preparing to send prospect email"');
      console.log('   - Look for "Community email check"');
      console.log('   - Look for "Attempting to send email"');
      console.log('   - Look for "Email sent successfully" or error messages');
    } else {
      console.log('\n❌ Failed to submit feedback');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

// Run the debug script
console.log('Starting debug script...\n');
debugTourFeedbackEmails();