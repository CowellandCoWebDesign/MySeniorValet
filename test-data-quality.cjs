const axios = require('axios');

async function testDataQuality() {
  try {
    console.log('📊 Getting data quality overview...');
    
    const overview = await axios.get('http://localhost:5000/api/admin/data-quality/overview');
    console.log('Data Quality Overview:');
    console.log(`- Total Communities: ${overview.data.overview.totalCommunities}`);
    console.log(`- Communities with Duplicate Photos: ${overview.data.overview.communitiesWithDuplicatePhotos}`);
    console.log(`- Communities without Reviews: ${overview.data.overview.communitiesWithoutReviews}`);
    console.log(`- Communities with Few Amenities: ${overview.data.overview.communitiesWithFewAmenities}`);
    console.log(`- Average Photo Count: ${overview.data.overview.averagePhotoCount}`);
    console.log(`- Average Amenity Count: ${overview.data.overview.averageAmenityCount}`);
    console.log(`- Average Review Count: ${overview.data.overview.averageReviewCount}`);
    console.log('');

    // Test enhancing the Redding communities that had issues
    const reddingCommunityIds = [96, 97, 98]; // Sundial, Oakmont, River Commons
    
    console.log('🔧 Enhancing data quality for Redding communities...');
    const enhancement = await axios.post('http://localhost:5000/api/admin/data-quality/enhance-batch', {
      communityIds: reddingCommunityIds
    });
    
    console.log('Enhancement Results:');
    console.log(`- Total Processed: ${enhancement.data.summary.totalProcessed}`);
    console.log(`- Total Improvements: ${enhancement.data.summary.totalImprovements}`);
    console.log(`- Total Issues Fixed: ${enhancement.data.summary.totalIssuesFixed}`);
    
    enhancement.data.reports.forEach(report => {
      console.log(`\n${report.name} (ID: ${report.communityId}):`);
      console.log(`  Issues Found: ${report.issues.length > 0 ? report.issues.join(', ') : 'None'}`);
      console.log(`  Improvements: ${report.improvements.length > 0 ? report.improvements.join(', ') : 'None'}`);
      console.log(`  Photos: ${report.before.photoCount} → ${report.after.photoCount}`);
      console.log(`  Amenities: ${report.before.amenityCount} → ${report.after.amenityCount}`);
      console.log(`  Reviews: ${report.before.reviewCount} → ${report.after.reviewCount}`);
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testDataQuality();