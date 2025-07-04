const axios = require('axios');

async function reclassifyCareTypes() {
  try {
    console.log('Starting care type reclassification...');
    
    const response = await axios.post('http://localhost:5000/api/admin/reclassify-care-types', {
      timeout: 60000
    });
    
    console.log('Reclassification Results:');
    console.log(`Total Communities: ${response.data.totalCommunities}`);
    console.log(`Reclassified: ${response.data.reclassified}`);
    console.log(`Unchanged: ${response.data.unchanged}`);
    
    if (response.data.detailedResults && response.data.detailedResults.length > 0) {
      console.log('\nDetailed Changes:');
      response.data.detailedResults.forEach(result => {
        console.log(`- ${result.name}:`);
        console.log(`  Old: ${result.oldCareTypes.join(', ')}`);
        console.log(`  New: ${result.newCareTypes.join(', ')} (${result.primaryCareType})`);
        console.log(`  Confidence: ${(result.confidence * 100).toFixed(1)}% - ${result.reasoning}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

reclassifyCareTypes();