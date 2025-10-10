// Test script to verify search functionality
const axios = require('axios');

async function testSearch() {
  try {
    console.log('Testing search for San Jose, California...');
    
    const response = await axios.post('http://localhost:5000/api/chatkit/test-search', {
      location: 'San Jose California',
      careType: '',
      maxPrice: 0
    });
    
    console.log('Results:', response.data.count, 'communities found');
    
    if (response.data.communities && response.data.communities.length > 0) {
      console.log('\nFirst 5 results:');
      response.data.communities.slice(0, 5).forEach((comm, i) => {
        console.log(`${i + 1}. ${comm.name} - ${comm.city}, ${comm.state}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testSearch();