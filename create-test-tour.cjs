const fetch = require('node-fetch');

async function createTestTour() {
  try {
    // First, find a community with an email address
    const communitiesResponse = await fetch('http://localhost:5000/api/communities?limit=100');
    const communities = await communitiesResponse.json();
    
    // Find a community with email for testing
    const communityWithEmail = communities.find(c => c.email || c.communityManagerEmail) || communities[0];
    
    console.log(`Creating test tour for community: ${communityWithEmail.name}`);
    console.log(`Community email: ${communityWithEmail.email || communityWithEmail.communityManagerEmail || 'No email on file'}`);
    
    // Create tour for tomorrow at 2:00 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tourDate = tomorrow.toISOString().split('T')[0];
    
    const tourData = {
      communityId: communityWithEmail.id,
      tourDate: tourDate,
      tourTime: '14:00',
      tourType: 'in_person',
      attendeeCount: 2,
      contactName: 'William Cowell',
      contactEmail: 'William.cowell01@gmail.com',
      contactPhone: '555-0123',
      specialRequests: 'This is a test tour to verify the notification system is working properly.',
      contactPreference: 'email'
    };
    
    const response = await fetch('http://localhost:5000/api/tours/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tourData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('\n✅ Test tour created successfully!');
      console.log(`Tour ID: ${result.tour.id}`);
      console.log(`Community: ${communityWithEmail.name}`);
      console.log(`Date: ${tourDate} at 2:00 PM`);
      console.log(`\nTo test the notification system:`);
      console.log(`1. Go to /tours in your browser`);
      console.log(`2. Find this tour and click "Mark as Complete"`);
      console.log(`3. Fill out the feedback form`);
      console.log(`4. Make sure to check all sharing options`);
      console.log(`5. Submit the feedback`);
      console.log(`\nEmails will be sent to:`);
      console.log(`- You (William.cowell01@gmail.com)`);
      console.log(`- The community (${communityWithEmail.email || communityWithEmail.communityManagerEmail || 'No email on file'})`);
      console.log(`- CC: hello@myseniorvalet.com`);
    } else {
      console.error('Failed to create tour:', result);
    }
  } catch (error) {
    console.error('Error creating test tour:', error);
  }
}

createTestTour();