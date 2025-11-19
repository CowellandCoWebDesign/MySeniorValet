import { LocationSEOService, MAJOR_LOCATIONS } from '../client/src/services/locationSEO.service';

// Test that all location titles are under 60 characters
console.log('Testing Location SEO Title Length (Max 60 chars):');
console.log('==================================================');

let allPassed = true;

MAJOR_LOCATIONS.forEach(location => {
  const titles = {
    search: LocationSEOService.generateTitle(location, 'search'),
    assisted: LocationSEOService.generateTitle(location, 'assisted'),
    memory: LocationSEOService.generateTitle(location, 'memory'),
    nursing: LocationSEOService.generateTitle(location, 'nursing'),
    independent: LocationSEOService.generateTitle(location, 'independent'),
  };
  
  Object.entries(titles).forEach(([type, title]) => {
    const length = title.length;
    const status = length <= 60 ? '✅' : '❌';
    
    if (length > 60) {
      allPassed = false;
      console.log(`${status} ${location.city}, ${location.stateAbbr} (${type}): ${length} chars`);
      console.log(`   Title: "${title}"`);
    }
  });
});

if (allPassed) {
  console.log('\n✅ All titles are under 60 characters!');
} else {
  console.log('\n❌ Some titles exceed 60 characters and need to be shortened.');
}

// Show example titles
console.log('\nExample Location Titles:');
console.log('========================');
const exampleLocations = [
  { city: 'Fort Worth', state: 'Texas', stateAbbr: 'TX', slug: 'fort-worth-tx' },
  { city: 'Toronto', state: 'Ontario', stateAbbr: 'ON', slug: 'toronto-on' },
  { city: 'San Francisco', state: 'California', stateAbbr: 'CA', slug: 'san-francisco-ca' },
];

exampleLocations.forEach(location => {
  const title = LocationSEOService.generateTitle(location, 'search');
  const description = LocationSEOService.generateDescription(location);
  console.log(`\n${location.city}, ${location.stateAbbr}:`);
  console.log(`  Title (${title.length} chars): ${title}`);
  console.log(`  Description: ${description.substring(0, 100)}...`);
});

// Test search intent matching
console.log('\nSearch Intent Coverage:');
console.log('=======================');
const searchQueries = [
  'assisted living fort worth',
  'nursing homes toronto', 
  'memory care san francisco',
  'senior living dallas tx',
  'retirement homes vancouver bc'
];

searchQueries.forEach(query => {
  const location = LocationSEOService.findLocation(query);
  if (location) {
    console.log(`✅ "${query}" → ${location.city}, ${location.stateAbbr}`);
  } else {
    console.log(`❌ "${query}" → No match found`);
  }
});