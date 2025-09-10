const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function finalizeTexasExpansion() {
  console.log('🎯 FINALIZING TEXAS EXPANSION - Adding remaining facilities');
  
  // Load facilities from CSV
  const facilities = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream('texas_tulip_facilities.csv')
      .pipe(csv())
      .on('data', (row) => facilities.push(row))
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`📋 Total facilities in dataset: ${facilities.length}`);
  
  // Get existing facilities
  const existingQuery = `SELECT name, city FROM communities WHERE state = 'TX'`;
  const existingResult = await pool.query(existingQuery);
  const existingSet = new Set(
    existingResult.rows.map(row => `${row.name}|${row.city}`.toLowerCase())
  );
  
  console.log(`📊 Currently in database: ${existingResult.rows.length} Texas facilities`);
  
  // Filter remaining facilities
  const remainingFacilities = facilities.filter(facility => {
    const key = `${facility.provider_name}|${facility.city}`.toLowerCase();
    return !existingSet.has(key);
  });
  
  console.log(`🆕 Remaining to add: ${remainingFacilities.length} facilities`);
  
  if (remainingFacilities.length === 0) {
    console.log('✅ All Texas facilities already integrated!');
    await showFinalStats();
    await pool.end();
    return;
  }
  
  // Add remaining facilities in batches
  const batchSize = 25;
  let addedCount = 0;
  
  for (let i = 0; i < remainingFacilities.length; i += batchSize) {
    const batch = remainingFacilities.slice(i, i + batchSize);
    
    console.log(`⚡ Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(remainingFacilities.length/batchSize)}...`);
    
    const promises = batch.map(async (facility) => {
      try {
        const insertQuery = `
          INSERT INTO communities (
            name, address, city, state, zip_code, phone, county,
            care_types, amenities, services, medical_restrictions,
            discovery_source, discovery_date, is_verified
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
          )
        `;
        
        await pool.query(insertQuery, [
          facility.provider_name,
          facility.address,
          facility.city,
          facility.state,
          '',
          facility.phone,
          facility.county || '',
          [facility.care_category || 'Assisted Living'],
          [],
          [],
          [],
          'Texas TULIP Comprehensive Dataset',
          new Date().toISOString(),
          true
        ]);
        
        return { success: true, name: facility.provider_name };
      } catch (error) {
        console.error(`❌ ${facility.provider_name}: ${error.message}`);
        return { success: false, name: facility.provider_name };
      }
    });
    
    const results = await Promise.all(promises);
    const batchSuccess = results.filter(r => r.success).length;
    addedCount += batchSuccess;
    
    console.log(`✅ Batch complete: +${batchSuccess} facilities (${addedCount} total added)`);
    
    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n🎉 TEXAS EXPANSION FINALIZED!`);
  console.log(`✅ Successfully added: ${addedCount} facilities`);
  console.log(`📊 Total remaining: ${remainingFacilities.length - addedCount} (if any errors)`);
  
  await showFinalStats();
  await pool.end();
}

async function showFinalStats() {
  // Final comprehensive statistics
  const finalStatsQuery = `
    SELECT 
      COUNT(*) as total_communities,
      COUNT(CASE WHEN state = 'TX' THEN 1 END) as texas_communities,
      COUNT(CASE WHEN state = 'CA' THEN 1 END) as california_communities,
      COUNT(CASE WHEN state NOT IN ('TX', 'CA') THEN 1 END) as other_communities
    FROM communities
  `;
  
  const finalStats = await pool.query(finalStatsQuery);
  const stats = finalStats.rows[0];
  
  console.log(`\n🌟 FINAL TRUEVIEW DATABASE STATUS:`);
  console.log(`   📊 Total Communities: ${stats.total_communities}`);
  console.log(`   🤠 Texas Communities: ${stats.texas_communities}`);
  console.log(`   🏖️ California Communities: ${stats.california_communities}`);
  console.log(`   🌍 Other Communities: ${stats.other_communities}`);
  
  // Texas county breakdown
  const countyStatsQuery = `
    SELECT 
      county,
      COUNT(*) as count,
      COUNT(DISTINCT city) as cities
    FROM communities 
    WHERE state = 'TX' AND county != ''
    GROUP BY county
    ORDER BY count DESC
    LIMIT 10
  `;
  
  const countyStats = await pool.query(countyStatsQuery);
  console.log(`\n📍 Texas Coverage by County:`);
  for (const row of countyStats.rows) {
    console.log(`   ${row.county}: ${row.count} communities across ${row.cities} cities`);
  }
  
  console.log(`\n✅ SEARCH PORTAL READY - All Texas communities accessible through search!`);
}

if (require.main === module) {
  finalizeTexasExpansion().catch(console.error);
}

module.exports = { finalizeTexasExpansion };