#!/usr/bin/env tsx

/**
 * Test the enhanced website scraper with improved data extraction
 */

import { websiteScraperService } from './website-scraper-service';

async function testEnhancedScraper() {
  console.log('🧪 Testing Enhanced Website Scraper...\n');

  // Test 1: seniorlivingnearme.com listing (official community service)
  console.log('Test 1: Official seniorlivingnearme.com listing');
  console.log('=========================================');
  
  try {
    const result1 = await websiteScraperService.scrapeWebsite(
      'https://seniorlivingnearme.com/community/hilltop-estates',
      'Hilltop Estates'
    );
    
    console.log('✅ Scraped Hilltop Estates:');
    console.log('  Description:', result1.description ? result1.description.substring(0, 100) + '...' : 'None');
    console.log('  Photos:', result1.photos.length);
    console.log('  Amenities:', result1.amenities.slice(0, 5).join(', '));
    console.log('  Care Levels:', result1.careLevels.join(', '));
    console.log('  Pricing:', result1.pricing);
    console.log('  Contact:', result1.contactInfo);
    console.log('');
  } catch (error) {
    console.error('❌ Failed to scrape:', error);
  }

  // Test 2: Direct community website
  console.log('Test 2: Direct Community Website');
  console.log('================================');
  
  try {
    const result2 = await websiteScraperService.scrapeWebsite(
      'https://www.brookdale.com',
      'Brookdale Senior Living'
    );
    
    console.log('✅ Scraped Brookdale:');
    console.log('  Photos:', result2.photos.length);
    console.log('  Amenities:', result2.amenities.slice(0, 5).join(', '));
    console.log('  Care Levels:', result2.careLevels.join(', '));
    console.log('  Features:', result2.features.slice(0, 5).join(', '));
    console.log('');
  } catch (error) {
    console.error('❌ Failed to scrape:', error);
  }

  // Test 3: Pricing accuracy with community name context
  console.log('Test 3: Pricing Accuracy Test');
  console.log('=============================');
  
  try {
    const result3 = await websiteScraperService.scrapeWebsite(
      'https://seniorlivingnearme.com/multiple-communities',
      'Sunrise Senior Living'
    );
    
    console.log('✅ Pricing extraction with community name context:');
    console.log('  Community Name:', 'Sunrise Senior Living');
    console.log('  Pricing:', result3.pricing);
    console.log('  Details:', result3.pricing.details ? result3.pricing.details.substring(0, 150) : 'None');
    console.log('');
  } catch (error) {
    console.error('❌ Failed to test pricing accuracy:', error);
  }

  console.log('🎉 Enhanced scraper testing complete!');
}

// Run the test
testEnhancedScraper().catch(console.error);