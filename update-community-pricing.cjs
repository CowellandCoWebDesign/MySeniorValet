/**
 * Update Community Pricing Script
 * Assigns realistic pricing to all communities based on care types and location
 */
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const path = require('path');

neonConfig.webSocketConstructor = ws;

const careTypePricing = {
  'Independent Living': { baseMin: 2500, baseMax: 4500, californiaMultiplier: 1.4 },
  'Assisted Living': { baseMin: 3500, baseMax: 6500, californiaMultiplier: 1.5 },
  'Memory Care': { baseMin: 5500, baseMax: 8500, californiaMultiplier: 1.6 },
  'Skilled Nursing': { baseMin: 7500, baseMax: 12000, californiaMultiplier: 1.3 },
  'Respite Care': { baseMin: 150, baseMax: 400, californiaMultiplier: 1.4 }
};

function getRegionalMultiplier(city, state) {
  if (state !== 'CA') return 1.0;
  
  const cityLower = city.toLowerCase();
  
  if (cityLower.includes('san francisco') || cityLower.includes('palo alto') || 
      cityLower.includes('mountain view') || cityLower.includes('cupertino')) {
    return 1.8;
  }
  
  if (cityLower.includes('san jose') || cityLower.includes('oakland') || 
      cityLower.includes('berkeley') || cityLower.includes('santa clara') ||
      cityLower.includes('los angeles') || cityLower.includes('santa monica')) {
    return 1.5;
  }
  
  if (cityLower.includes('sacramento') || cityLower.includes('san diego') || 
      cityLower.includes('santa rosa') || cityLower.includes('stockton')) {
    return 1.3;
  }
  
  if (cityLower.includes('fresno') || cityLower.includes('bakersfield') || 
      cityLower.includes('redding') || cityLower.includes('modesto')) {
    return 1.1;
  }
  
  return 1.2;
}

function calculateCommunityPricing(community) {
  const { care_types, city, state } = community;
  
  let minPrice = Infinity;
  let maxPrice = 0;
  
  if (!care_types || care_types.length === 0) {
    // Default to assisted living
    const pricing = careTypePricing['Assisted Living'];
    minPrice = Math.round(pricing.baseMin * pricing.californiaMultiplier);
    maxPrice = Math.round(pricing.baseMax * pricing.californiaMultiplier);
  } else {
    // Calculate based on care types
    let foundValidPricing = false;
    care_types.forEach(careType => {
      const pricing = careTypePricing[careType];
      if (pricing) {
        const adjustedMin = Math.round(pricing.baseMin * pricing.californiaMultiplier);
        const adjustedMax = Math.round(pricing.baseMax * pricing.californiaMultiplier);
        
        if (!foundValidPricing) {
          minPrice = adjustedMin;
          maxPrice = adjustedMax;
          foundValidPricing = true;
        } else {
          minPrice = Math.min(minPrice, adjustedMin);
          maxPrice = Math.max(maxPrice, adjustedMax);
        }
      }
    });
    
    // If no valid pricing found, default to assisted living
    if (!foundValidPricing) {
      const pricing = careTypePricing['Assisted Living'];
      minPrice = Math.round(pricing.baseMin * pricing.californiaMultiplier);
      maxPrice = Math.round(pricing.baseMax * pricing.californiaMultiplier);
    }
  }
  
  // Apply regional multiplier
  const regionalMultiplier = getRegionalMultiplier(city, state);
  minPrice = Math.round(minPrice * regionalMultiplier);
  maxPrice = Math.round(maxPrice * regionalMultiplier);
  
  // Add variance (+/- 10%)
  const variance = 0.1;
  const minVariance = 1 - variance + (Math.random() * variance * 2);
  const maxVariance = 1 - variance + (Math.random() * variance * 2);
  
  minPrice = Math.round(minPrice * minVariance);
  maxPrice = Math.round(maxPrice * maxVariance);
  
  return { min: minPrice, max: maxPrice };
}

async function updateCommunityPricing() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('Fetching communities from database...');
    const result = await pool.query(`
      SELECT id, name, city, state, care_types, is_claimed, price_range 
      FROM communities 
      ORDER BY id
    `);
    
    console.log(`Found ${result.rows.length} communities to update`);
    
    let updatedCount = 0;
    
    for (const community of result.rows) {
      // Skip if already claimed (they have live pricing)
      if (community.is_claimed) {
        console.log(`Skipping claimed community: ${community.name}`);
        continue;
      }
      
      const pricing = calculateCommunityPricing(community);
      
      // Update the community with realistic pricing
      await pool.query(`
        UPDATE communities 
        SET price_range = $1, 
            pricing_type = 'estimated',
            pricing_last_updated = NOW()
        WHERE id = $2
      `, [JSON.stringify(pricing), community.id]);
      
      console.log(`Updated ${community.name}: $${pricing.min} - $${pricing.max}`);
      updatedCount++;
    }
    
    console.log(`\n✅ Successfully updated pricing for ${updatedCount} communities`);
    console.log(`🏷️  Pricing based on care types and California locations`);
    console.log(`📊  Estimated pricing will be replaced with live pricing when communities are claimed`);
    
  } catch (error) {
    console.error('Error updating community pricing:', error);
  } finally {
    await pool.end();
  }
}

// Run the update
updateCommunityPricing();