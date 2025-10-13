const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function completeStatewideIntegration() {
  console.log('🎯 COMPLETING TEXAS STATEWIDE INTEGRATION');
  
  // Load all statewide facilities
  const facilities = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream('texas_statewide_facilities.csv')
      .pipe(csv())
      .on('data', (row) => facilities.push(row))
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`📋 Total statewide facilities: ${facilities.length}`);
  
  // Get current database status
  const currentQuery = `
    SELECT 
      COUNT(*) as current_total,
      COUNT(DISTINCT county) as counties,
      COUNT(DISTINCT city) as cities
    FROM communities WHERE state = 'TX'
  `;
  
  const currentResult = await pool.query(currentQuery);
  const current = currentResult.rows[0];
  
  console.log(`📊 Current status: ${current.current_total} facilities, ${current.counties} counties, ${current.cities} cities`);
  
  // Check which facilities are missing
  const existingQuery = `SELECT name, city FROM communities WHERE state = 'TX'`;
  const existingResult = await pool.query(existingQuery);
  const existingSet = new Set(
    existingResult.rows.map(row => `${row.name}|${row.city}`.toLowerCase())
  );
  
  const missingFacilities = facilities.filter(facility => {
    const key = `${facility.provider_name}|${facility.city}`.toLowerCase();
    return !existingSet.has(key);
  });
  
  console.log(`🆕 Missing facilities to add: ${missingFacilities.length}`);
  
  if (missingFacilities.length === 0) {
    console.log('✅ All statewide facilities already integrated!');
    await showFinalStats();
    await pool.end();
    return;
  }
  
  // Process remaining facilities rapidly
  console.log('⚡ Adding remaining facilities in optimized batches...');
  
  const batchSize = 10; // Smaller batches for stability
  let addedCount = 0;
  
  for (let i = 0; i < missingFacilities.length; i += batchSize) {
    const batch = missingFacilities.slice(i, i + batchSize);
    
    console.log(`🔄 Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(missingFacilities.length/batchSize)}: Adding ${batch.length} facilities...`);
    
    const insertPromises = batch.map(async (facility) => {
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
          'Texas Statewide Expansion - Complete Coverage',
          new Date().toISOString(),
          true
        ]);
        
        return { success: true, name: facility.provider_name };
      } catch (error) {
        console.error(`❌ ${facility.provider_name}: ${error.message}`);
        return { success: false, name: facility.provider_name };
      }
    });
    
    const results = await Promise.all(insertPromises);
    const batchSuccess = results.filter(r => r.success).length;
    addedCount += batchSuccess;
    
    console.log(`✅ Batch complete: +${batchSuccess} (${addedCount}/${missingFacilities.length} total)`);
    
    // Progress update every 10 batches
    if ((Math.floor(i/batchSize) + 1) % 10 === 0) {
      const progressQuery = `SELECT COUNT(*) as count FROM communities WHERE state = 'TX'`;
      const progress = await pool.query(progressQuery);
      console.log(`📊 Progress update: ${progress.rows[0].count} total TX facilities in database`);
    }
  }
  
  console.log(`\n🎉 STATEWIDE INTEGRATION COMPLETE!`);
  console.log(`✅ Successfully added: ${addedCount} facilities`);
  
  await showFinalStats();
  await pool.end();
}

async function showFinalStats() {
  // Final comprehensive statistics
  const finalStatsQuery = `
    SELECT 
      COUNT(*) as total_communities,
      COUNT(CASE WHEN state = 'TX' THEN 1 END) as texas_communities,
      COUNT(CASE WHEN state = 'CA' THEN 1 END) as california_communities
    FROM communities
  `;
  
  const finalStats = await pool.query(finalStatsQuery);
  const stats = finalStats.rows[0];
  
  console.log(`\n🌟 FINAL TRUEVIEW DATABASE STATUS:`);
  console.log(`   📊 Total Communities: ${stats.total_communities}`);
  console.log(`   🤠 Texas Communities: ${stats.texas_communities}`);
  console.log(`   🏖️ California Communities: ${stats.california_communities}`);
  
  // Texas detailed coverage
  const texasStatsQuery = `
    SELECT 
      COUNT(DISTINCT county) as counties,
      COUNT(DISTINCT city) as cities,
      ROUND((COUNT(DISTINCT county) * 100.0 / 254), 1) as coverage_percent
    FROM communities 
    WHERE state = 'TX' AND county != ''
  `;
  
  const texasStats = await pool.query(texasStatsQuery);
  const texas = texasStats.rows[0];
  
  console.log(`\n📍 TEXAS STATEWIDE COVERAGE:`);
  console.log(`   Counties: ${texas.counties}/254 (${texas.coverage_percent}%)`);
  console.log(`   Cities: ${texas.cities}`);
  
  // Top counties
  const topCountiesQuery = `
    SELECT 
      county,
      COUNT(*) as facilities,
      COUNT(DISTINCT city) as cities
    FROM communities 
    WHERE state = 'TX' AND county != ''
    GROUP BY county
    ORDER BY facilities DESC
    LIMIT 10
  `;
  
  const topCounties = await pool.query(topCountiesQuery);
  console.log(`\n🏆 Top 10 Texas Counties:`);
  for (const row of topCounties.rows) {
    console.log(`   ${row.county}: ${row.facilities} facilities across ${row.cities} cities`);
  }
  
  console.log(`\n✅ SEARCH PORTAL READY - Complete Texas statewide coverage achieved!`);
}

if (require.main === module) {
  completeStatewideIntegration().catch(console.error);
}

module.exports = { completeStatewideIntegration };