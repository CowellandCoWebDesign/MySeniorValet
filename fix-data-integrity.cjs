/**
 * Fix data integrity issues in communities.json
 * Removes records with null names and fixes other data issues
 */

const fs = require('fs');
const path = require('path');

const fixDataIntegrity = () => {
  console.log('🔧 Fixing data integrity issues...');
  
  const filePath = path.join(__dirname, 'server', 'seed-data', 'communities.json');
  const communities = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  console.log(`📊 Original count: ${communities.length}`);
  
  // Filter out records with null or empty names
  const validCommunities = communities.filter(community => {
    return community.name && community.name.trim() !== '';
  });
  
  console.log(`📊 Valid count: ${validCommunities.length}`);
  console.log(`❌ Removed: ${communities.length - validCommunities.length} invalid records`);
  
  // Fix any other data issues
  const fixedCommunities = validCommunities.map(community => {
    // Ensure required fields are not null
    if (!community.facilityType) {
      community.facilityType = 'Senior Living';
    }
    
    // Fix zip code - required field
    if (!community.zipCode) {
      community.zipCode = '00000'; // Default zip code for missing values
    }
    
    // Ensure arrays are arrays
    if (!Array.isArray(community.careTypes)) {
      community.careTypes = [];
    }
    
    if (!Array.isArray(community.amenities)) {
      community.amenities = [];
    }
    
    if (!Array.isArray(community.photos)) {
      community.photos = [];
    }
    
    // Ensure priceRange is set
    if (!community.priceRange) {
      community.priceRange = 'Contact for Pricing';
    }
    
    return community;
  });
  
  // Save cleaned data
  fs.writeFileSync(filePath, JSON.stringify(fixedCommunities, null, 2));
  
  console.log('✅ Data integrity fixed!');
  console.log(`📈 Final count: ${fixedCommunities.length} communities`);
  
  return fixedCommunities;
};

if (require.main === module) {
  fixDataIntegrity();
}

module.exports = { fixDataIntegrity };