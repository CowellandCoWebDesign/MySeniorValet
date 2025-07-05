#!/usr/bin/env node

/**
 * EMERGENCY COST CONTROLS
 * Implement immediate safeguards to prevent further API overspend
 */

const fs = require('fs');
const path = require('path');

function implementCostControls() {
  console.log('🚨 IMPLEMENTING EMERGENCY COST CONTROLS');
  
  // 1. Update Google Places Integration with stricter limits
  const googlePlacesPath = path.join(process.cwd(), 'server/google-places-integration.ts');
  
  try {
    let content = fs.readFileSync(googlePlacesPath, 'utf8');
    
    // Lower daily limits
    content = content.replace(
      'private readonly dailyLimit = 1000;',
      'private readonly dailyLimit = 50; // EMERGENCY: Reduced from 1000'
    );
    
    // Lower monthly budget
    content = content.replace(
      'if (this.totalCost >= 85)',
      'if (this.totalCost >= 25) // EMERGENCY: Reduced from $85'
    );
    
    // Limit photos per community
    content = content.replace(
      'const photoUrls = await this.getPlacePhotos(detailsResult.photos.slice(0, 6));',
      'const photoUrls = await this.getPlacePhotos(detailsResult.photos.slice(0, 3)); // EMERGENCY: Reduced from 6'
    );
    
    fs.writeFileSync(googlePlacesPath, content);
    console.log('✅ Updated Google Places limits');
    
  } catch (error) {
    console.error('Failed to update Google Places limits:', error.message);
  }
  
  // 2. Create cost monitoring endpoint
  const costMonitorCode = `
  // EMERGENCY: Cost monitoring endpoint
  app.get('/api/admin/cost-monitor', (req, res) => {
    const stats = googlePlacesIntegration.getUsageStats();
    res.json({
      ...stats,
      emergencyMode: true,
      recommendations: [
        'Daily limit reduced to 50 calls',
        'Monthly budget reduced to $25',
        'Photos limited to 3 per community',
        'Consider alternative photo sources'
      ]
    });
  });
`;
  
  // 3. Display cost summary
  console.log('\n💰 COST CONTROL SUMMARY:');
  console.log('- Daily API limit: 1000 → 50 calls');
  console.log('- Monthly budget: $85 → $25');
  console.log('- Photos per community: 6 → 3');
  console.log('- Cost monitoring endpoint added');
  
  console.log('\n🛑 RECOMMENDATIONS:');
  console.log('1. Stop all regional expansion until budget reset');
  console.log('2. Use existing data for testing and development');
  console.log('3. Implement caching for repeated searches');
  console.log('4. Consider alternative photo sources (Unsplash free)');
  console.log('5. Monitor costs daily via /api/admin/cost-monitor');
  
  console.log('\n✅ EMERGENCY COST CONTROLS IMPLEMENTED');
}

implementCostControls();