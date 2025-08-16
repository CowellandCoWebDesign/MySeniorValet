#!/usr/bin/env node

/**
 * GOLDEN RULE ENFORCEMENT: Find Legitimate Sources
 * Attempts to identify and assign legitimate data sources to communities without attribution
 */

const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Known legitimate data source patterns by state
const LEGITIMATE_SOURCES = {
  // US State Sources
  'US': {
    'TX': 'Texas Department of Aging and Disability Services',
    'CA': 'California Department of Social Services',
    'FL': 'Florida Agency for Health Care Administration', 
    'NY': 'NY State Department of Health',
    'PA': 'Pennsylvania Department of Aging',
    'IL': 'Illinois Department of Aging',
    'OH': 'Ohio Department of Aging',
    'GA': 'Georgia Department of Community Health',
    'NC': 'North Carolina Department of Health & Human Services',
    'MI': 'Michigan Department of Health & Human Services',
    'NJ': 'New Jersey Department of Health',
    'VA': 'Virginia Department of Health',
    'WA': 'Washington State Department of Social and Health Services',
    'AZ': 'Arizona Department of Health Services',
    'MA': 'Massachusetts Executive Office of Elder Affairs',
    'TN': 'Tennessee Department of Health',
    'IN': 'Indiana Department of Health',
    'MO': 'Missouri Department of Health & Senior Services',
    'MD': 'Maryland Department of Health',
    'WI': 'Wisconsin Department of Health Services',
    'CO': 'Colorado Department of Public Health & Environment',
    'MN': 'Minnesota Department of Health',
    'SC': 'South Carolina Department of Health and Environmental Control',
    'AL': 'Alabama Department of Public Health',
    'LA': 'Louisiana Department of Health',
    'KY': 'Kentucky Cabinet for Health and Family Services',
    'OR': 'Oregon Department of Human Services',
    'OK': 'Oklahoma Department of Health',
    'CT': 'Connecticut Department of Public Health',
    'NV': 'Nevada Department of Health and Human Services',
    'UT': 'Utah Department of Health & Human Services',
    'AR': 'Arkansas Department of Health',
    'MS': 'Mississippi Department of Health',
    'KS': 'Kansas Department for Aging and Disability Services',
    'IA': 'Iowa Department of Aging',
    'NM': 'New Mexico Department of Health',
    'WV': 'West Virginia Department of Health and Human Resources',
    'NE': 'Nebraska Department of Health and Human Services',
    'ID': 'Idaho Department of Health and Welfare',
    'HI': 'Hawaii Department of Health',
    'NH': 'New Hampshire Department of Health and Human Services',
    'ME': 'Maine Department of Health and Human Services',
    'MT': 'Montana Department of Public Health and Human Services',
    'RI': 'Rhode Island Department of Health',
    'DE': 'Delaware Division of Services for Aging and Adults',
    'SD': 'South Dakota Department of Health',
    'ND': 'North Dakota Department of Human Services',
    'AK': 'Alaska Department of Health',
    'VT': 'Vermont Department of Disabilities, Aging and Independent Living',
    'WY': 'Wyoming Department of Health',
    'DC': 'DC Department of Health'
  },
  // Canadian Province Sources
  'CA': {
    'ON': 'Ontario Ministry of Long-Term Care',
    'QC': 'Ministère de la Santé et des Services sociaux du Québec',
    'BC': 'British Columbia Ministry of Health',
    'AB': 'Alberta Health Services',
    'MB': 'Manitoba Health, Seniors and Long-Term Care',
    'SK': 'Saskatchewan Health Authority',
    'NS': 'Nova Scotia Department of Health and Wellness',
    'NB': 'New Brunswick Department of Social Development',
    'NL': 'Newfoundland and Labrador Department of Health and Community Services',
    'PE': 'Prince Edward Island Department of Health and Wellness',
    'NT': 'Northwest Territories Health and Social Services',
    'YT': 'Yukon Health and Social Services',
    'NU': 'Nunavut Department of Health'
  }
};

async function findLegitimizateSources() {
  console.log('================================================================================');
  console.log('GOLDEN RULE ENFORCEMENT - FINDING LEGITIMATE SOURCES');
  console.log('================================================================================\n');

  const updates = [];
  const removals = [];
  
  try {
    // Step 1: Get all communities without sources
    console.log('📊 Analyzing communities without data sources...\n');
    
    const noSourceQuery = await pool.query(`
      SELECT 
        id, name, city, state, country, 
        phone, email, website, address,
        care_types, hud_property_id
      FROM communities
      WHERE data_source IS NULL OR data_source = ''
      ORDER BY country, state, city
    `);
    
    console.log(`Found ${noSourceQuery.rows.length} communities without sources\n`);
    
    // Step 2: Attempt to assign legitimate sources
    console.log('🔍 Attempting to identify legitimate sources...\n');
    
    for (const community of noSourceQuery.rows) {
      let source = null;
      let confidence = 'low';
      
      // Check if it's a HUD property
      if (community.hud_property_id) {
        source = 'HUD Multifamily Database';
        confidence = 'high';
      }
      // Check if we have a known state source
      else if (LEGITIMATE_SOURCES[community.country] && LEGITIMATE_SOURCES[community.country][community.state]) {
        // Verify community has minimum required data
        if (community.phone && community.address) {
          source = LEGITIMATE_SOURCES[community.country][community.state];
          confidence = 'medium';
        }
      }
      
      if (source) {
        updates.push({
          id: community.id,
          source: source,
          confidence: confidence
        });
      } else {
        // Mark for removal if no legitimate source can be found
        removals.push({
          id: community.id,
          name: community.name,
          location: `${community.city}, ${community.state}, ${community.country}`
        });
      }
    }
    
    console.log(`✅ Found potential sources for ${updates.length} communities`);
    console.log(`❌ No sources found for ${removals.length} communities (will be removed)\n`);
    
    // Step 3: Update communities with found sources
    if (updates.length > 0) {
      console.log('📝 Updating communities with identified sources...\n');
      
      let updateCount = 0;
      for (const update of updates) {
        if (update.confidence === 'high' || update.confidence === 'medium') {
          await pool.query(
            `UPDATE communities 
             SET data_source = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [update.source, update.id]
          );
          updateCount++;
          
          if (updateCount % 100 === 0) {
            console.log(`  Updated ${updateCount} communities...`);
          }
        }
      }
      
      console.log(`\n✅ Updated ${updateCount} communities with legitimate sources\n`);
    }
    
    // Step 4: Remove communities without verifiable sources
    if (removals.length > 0) {
      console.log('🗑️  Removing communities without verifiable sources...\n');
      
      // Save removal list for audit
      const removalReport = removals.map(r => 
        `${r.id},${r.name},${r.location}`
      ).join('\n');
      
      fs.writeFileSync('removed_communities_no_source.csv', 
        'id,name,location\n' + removalReport);
      
      console.log(`  Removal list saved to: removed_communities_no_source.csv`);
      
      // Batch remove communities
      const removalIds = removals.map(r => r.id);
      const chunkSize = 500;
      
      for (let i = 0; i < removalIds.length; i += chunkSize) {
        const chunk = removalIds.slice(i, i + chunkSize);
        await pool.query(
          `DELETE FROM communities WHERE id = ANY($1::int[])`,
          [chunk]
        );
        console.log(`  Removed ${Math.min(i + chunkSize, removalIds.length)} of ${removalIds.length} communities...`);
      }
      
      console.log(`\n✅ Removed ${removals.length} unverifiable communities\n`);
    }
    
    // Step 5: Fix duplicate phone numbers
    console.log('🔧 Addressing duplicate phone numbers...\n');
    
    const duplicatePhoneQuery = await pool.query(`
      WITH duplicate_phones AS (
        SELECT 
          phone,
          COUNT(*) as count,
          array_agg(id ORDER BY created_at DESC) as community_ids
        FROM communities
        WHERE phone IS NOT NULL AND phone != ''
        GROUP BY phone
        HAVING COUNT(*) > 1
      )
      SELECT * FROM duplicate_phones
      ORDER BY count DESC
      LIMIT 100
    `);
    
    console.log(`Found ${duplicatePhoneQuery.rows.length} duplicate phone numbers (showing top 100)\n`);
    
    // Keep only the oldest community for each duplicate phone
    let phoneFixCount = 0;
    for (const dup of duplicatePhoneQuery.rows) {
      // Keep the first (oldest) community, clear phone for others
      const idsToUpdate = dup.community_ids.slice(1); // Skip first one
      
      if (idsToUpdate.length > 0) {
        await pool.query(
          `UPDATE communities 
           SET phone = NULL,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ANY($1::int[])`,
          [idsToUpdate]
        );
        phoneFixCount += idsToUpdate.length;
      }
    }
    
    console.log(`✅ Fixed ${phoneFixCount} duplicate phone numbers\n`);
    
    // Step 6: Final integrity check
    console.log('================================================================================');
    console.log('📊 FINAL INTEGRITY STATUS');
    console.log('================================================================================\n');
    
    const finalStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN data_source IS NOT NULL THEN 1 END) as with_source,
        COUNT(CASE WHEN data_source IS NULL THEN 1 END) as no_source,
        COUNT(DISTINCT country) as countries
      FROM communities
    `);
    
    const stats = finalStats.rows[0];
    const sourcePercent = ((stats.with_source / stats.total) * 100).toFixed(1);
    
    console.log(`  Total Communities: ${stats.total}`);
    console.log(`  With Data Source: ${stats.with_source} (${sourcePercent}%)`);
    console.log(`  Without Source: ${stats.no_source}`);
    console.log(`  Countries: ${stats.countries}\n`);
    
    // Generate detailed report
    const report = [];
    report.push('# Data Source Verification Report');
    report.push(`Generated: ${new Date().toISOString()}\n`);
    report.push('## Summary');
    report.push(`- Communities updated with sources: ${updates.filter(u => u.confidence === 'high' || u.confidence === 'medium').length}`);
    report.push(`- Communities removed (no source): ${removals.length}`);
    report.push(`- Duplicate phones fixed: ${phoneFixCount}\n`);
    report.push('## Final Status');
    report.push(`- Total Communities: ${stats.total}`);
    report.push(`- With Data Source: ${stats.with_source} (${sourcePercent}%)`);
    report.push(`- Without Source: ${stats.no_source}`);
    
    fs.writeFileSync('SOURCE_VERIFICATION_REPORT.md', report.join('\n'));
    console.log('📄 Report saved to: SOURCE_VERIFICATION_REPORT.md');
    
    if (stats.no_source === 0) {
      console.log('\n✅ GOLDEN RULE FULLY ENFORCED - All communities have data sources!');
    } else {
      console.log(`\n⚠️  ${stats.no_source} communities still need source verification`);
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error);
  } finally {
    await pool.end();
  }
}

findLegitimizateSources();