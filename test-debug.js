// Debug test for web intelligence

async function testWebIntelligence() {
  console.log('Testing web intelligence with known website...\n');
  
  const response = await fetch('http://localhost:5000/api/communities/web-intelligence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      communityName: 'Superior Residences of Panama City Beach',
      address: '112 Venture Blvd',
      city: 'Panama City Beach',
      state: 'Florida',
      website: 'https://superiorpcb.com'
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Error:', error);
    return;
  }
  
  const data = await response.json();
  console.log('Success! Got data:', {
    hasContent: !!data.content,
    sourceCount: data.citations?.length || 0,
    imageCount: data.images?.length || 0,
    verified: data.verified
  });
}

testWebIntelligence().catch(console.error);