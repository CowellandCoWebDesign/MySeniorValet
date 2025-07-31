import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

async function testAuth() {
  console.log('Testing authentication flow...\n');
  
  // Test with william's credentials
  const credentials = {
    email: 'william.cowell01@gmail.com',
    password: 'MySeniorValet2025!'
  };
  
  console.log('1. Testing quick-login...');
  const loginResponse = await fetch(`${API_BASE}/api/auth/quick-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    credentials: 'include' // This ensures cookies are included
  });
  
  const cookieHeader = loginResponse.headers.get('set-cookie');
  console.log('Response status:', loginResponse.status);
  console.log('Set-Cookie header:', cookieHeader);
  console.log('Response:', await loginResponse.text());
  
  if (cookieHeader) {
    console.log('\n2. Testing with session cookie...');
    
    // Extract sessionId cookie
    const sessionId = cookieHeader.split('sessionId=')[1]?.split(';')[0];
    console.log('Session ID:', sessionId);
    
    // Test authenticated endpoint
    const userResponse = await fetch(`${API_BASE}/api/auth/quick-user`, {
      headers: { 'Cookie': `sessionId=${sessionId}` }
    });
    
    console.log('User endpoint status:', userResponse.status);
    console.log('User data:', await userResponse.text());
    
    // Test messaging endpoint
    console.log('\n3. Testing messaging endpoint...');
    const unreadResponse = await fetch(`${API_BASE}/api/messaging/unread`, {
      headers: { 'Cookie': `sessionId=${sessionId}` }
    });
    
    console.log('Unread endpoint status:', unreadResponse.status);
    const unreadText = await unreadResponse.text();
    console.log('Unread response:', unreadText.substring(0, 200));
    
    // If we got HTML, it means the route isn't being handled
    if (unreadText.startsWith('<!DOCTYPE')) {
      console.log('ERROR: Got HTML response - route not being handled properly');
    }
  }
}

testAuth().catch(console.error);