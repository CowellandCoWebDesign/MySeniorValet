const fetch = require('node-fetch');

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Test login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'demo@trueview.com',
        password: 'demo123'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      console.log('User data:', loginData.user);
    } else {
      console.log('❌ Login failed:', loginData.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAuth();