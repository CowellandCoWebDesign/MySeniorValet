const http = require('http');

const data = JSON.stringify({
  tier: 'standard',
  type: 'community',
  metadata: {
    communityId: '1',
    communityName: 'Debug Test',
    userEmail: 'william.cowell01@gmail.com'
  }
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/payments/create-payment-intent',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Sending request with data:', JSON.parse(data));

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', body);
    try {
      const parsed = JSON.parse(body);
      if (parsed.error) {
        console.log('ERROR FOUND:', parsed.error);
      } else {
        console.log('SUCCESS! Payment Intent Created');
        console.log('Client Secret:', parsed.clientSecret);
        console.log('Payment Intent ID:', parsed.paymentIntentId);
      }
    } catch (e) {
      console.log('Raw response:', body);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
