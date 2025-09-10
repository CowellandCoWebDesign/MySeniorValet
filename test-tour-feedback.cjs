// Test script for tour feedback email functionality
const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000';

// Test tour data (simulating a completed tour)
const testTour = {
  id: 1,
  userId: 1,
  communityId: 1,
  tourDate: new Date().toISOString().split('T')[0],
  contactEmail: 'test@example.com',
  contactName: 'Test User'
};

// Test feedback data
const testFeedback = {
  tourId: testTour.id,
  overallImpression: 'The community was very welcoming and clean. Staff was helpful.',
  tourNotes: 'Beautiful gardens, nice dining area. Activities room looked well-equipped.',
  pricingInfo: 'Base pricing starts at $4,500/month for independent living',
  staffNotes: 'Met with Sarah, the community director. Very knowledgeable.',
  overallRating: 5,
  wouldRecommend: true,
  likelihood: 'very_likely',
  shareContactInfo: true,
  shareNotes: false,
  sharePricing: true
};

async function testTourFeedback() {
  console.log('🧪 Testing Tour Feedback Email System...\n');
  
  try {
    // Submit feedback via API
    console.log('📤 Submitting tour feedback...');
    const response = await fetch(`${API_URL}/api/tours/${testTour.id}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testFeedback)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Tour feedback submitted successfully!');
      console.log('📧 Emails sent to:');
      console.log(`   - Community: ${result.feedbackDetails?.communityEmail || 'No email on file'}`);
      console.log(`   - User: ${testTour.contactEmail}`);
      console.log(`   - CC: hello@myseniorvalet.com (test mode)\n`);
      
      console.log('📋 Feedback Details:');
      console.log(`   - Overall Rating: ${testFeedback.overallRating}/5`);
      console.log(`   - Would Recommend: ${testFeedback.wouldRecommend ? 'Yes' : 'No'}`);
      console.log(`   - Likelihood to Move: ${testFeedback.likelihood.replace('_', ' ')}`);
      console.log(`   - Sharing Preferences:`);
      console.log(`     • Contact Info: ${testFeedback.shareContactInfo ? '✓' : '✗'}`);
      console.log(`     • Notes: ${testFeedback.shareNotes ? '✓' : '✗'}`);
      console.log(`     • Pricing: ${testFeedback.sharePricing ? '✓' : '✗'} (Always shared)`);
      
      console.log('\n🎉 Test completed successfully!');
      console.log('🔍 Check hello@myseniorvalet.com inbox for test emails.');
    } else {
      console.error('❌ Error submitting feedback:', result.error);
      console.log('\n💡 Make sure:');
      console.log('   1. The server is running (npm run dev)');
      console.log('   2. Tour ID exists in the database');
      console.log('   3. Database is properly configured');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Is the server running? Start it with: npm run dev');
  }
}

// Run the test
testTourFeedback();