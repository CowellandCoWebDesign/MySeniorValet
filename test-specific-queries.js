import fetch from 'node-fetch';

// Test specific failing queries to debug
const testQueries = [
  "Affordable memory care",
  "Budget senior housing", 
  "Places with gym",
  "Military retirement",
  "High quality care",
  "Available now"
];

async function testQuery(query) {
  const response = await fetch('http://localhost:5000/api/natural-language/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  
  const data = await response.json();
  console.log(`\nQuery: "${query}"`);
  console.log('Parsed:', JSON.stringify(data.parsed, null, 2));
}

async function runTests() {
  console.log('Testing specific failing queries...\n');
  for (const query of testQueries) {
    await testQuery(query);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

runTests();
