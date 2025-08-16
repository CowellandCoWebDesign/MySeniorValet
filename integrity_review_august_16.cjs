#!/usr/bin/env node

/**
 * COMPREHENSIVE INTEGRITY REVIEW - AUGUST 16, 2025
 * Full audit of platform data after synthetic removal
 */

const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function integrityReview() {
  console.log('================================================================================');
  console.log('MYSENIORVALET INTEGRITY REVIEW - AUGUST 16, 2025');
  console.log('================================================================================\n');

  const report = [];
  report.push('# MySeniorValet Platform Integrity Review');
  report.push(`Generated: ${new Date().toISOString()}\n`);

  try {
    // 1. TOTAL COMMUNITY COUNT
    const totalQuery = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT country) as countries,
        COUNT(DISTINCT state) as states,
        COUNT(DISTINCT city) as cities
      FROM communities
    `);
    
    const totals = totalQuery.rows[0];
    console.log('📊 PLATFORM OVERVIEW');
    console.log('=' .repeat(80));
    console.log(`  Total Communities: ${totals.total}`);
    console.log(`  Countries: ${totals.countries}`);
    console.log(`  States/Provinces: ${totals.states}`);
    console.log(`  Cities: ${totals.cities}\n`);
    
    report.push('## Platform Overview\n');
    report.push(`- **Total Communities:** ${totals.total}`);
    report.push(`- **Countries:** ${totals.countries}`);
    report.push(`- **States/Provinces:** ${totals.states}`);
    report.push(`- **Cities:** ${totals.cities}\n`);

    // 2. COUNTRY BREAKDOWN
    const countryQuery = await pool.query(`
      SELECT 
        country,
        COUNT(*) as count,
        COUNT(DISTINCT state) as states,
        COUNT(CASE WHEN data_source IS NOT NULL THEN 1 END) as with_source,
        COUNT(CASE WHEN data_source IS NULL THEN 1 END) as no_source
      FROM communities
      GROUP BY country
      ORDER BY count DESC
    `);
    
    console.log('🌍 COUNTRY BREAKDOWN');
    console.log('=' .repeat(80));
    
    report.push('## Country Breakdown\n');
    countryQuery.rows.forEach(row => {
      const sourcePercent = ((row.with_source / row.count) * 100).toFixed(1);
      console.log(`  ${row.country}: ${row.count} communities (${row.states} states)`);
      console.log(`    • With data source: ${row.with_source} (${sourcePercent}%)`);
      console.log(`    • No source: ${row.no_source}\n`);
      
      report.push(`### ${row.country}`);
      report.push(`- Total: ${row.count} communities`);
      report.push(`- States/Provinces: ${row.states}`);
      report.push(`- With data source: ${row.with_source} (${sourcePercent}%)`);
      report.push(`- **Missing source: ${row.no_source}**\n`);
    });

    // 3. DATA SOURCE ANALYSIS
    const sourceQuery = await pool.query(`
      SELECT 
        COALESCE(data_source, 'NO SOURCE') as source,
        country,
        COUNT(*) as count
      FROM communities
      GROUP BY data_source, country
      ORDER BY count DESC
      LIMIT 30
    `);
    
    console.log('📝 TOP DATA SOURCES');
    console.log('=' .repeat(80));
    
    report.push('## Data Source Analysis\n');
    report.push('### Top 30 Data Sources\n');
    sourceQuery.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.source} (${row.country}): ${row.count} communities`);
      if (row.source === 'NO SOURCE') {
        report.push(`**${i + 1}. ${row.source} (${row.country}): ${row.count} communities** ⚠️`);
      } else {
        report.push(`${i + 1}. ${row.source} (${row.country}): ${row.count} communities`);
      }
    });
    report.push('\n');

    // 4. DATA QUALITY INDICATORS
    console.log('\n📐 DATA QUALITY INDICATORS');
    console.log('=' .repeat(80));
    
    const qualityQuery = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 END) as with_phone,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_email,
        COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) as with_website,
        COUNT(CASE WHEN description IS NOT NULL AND LENGTH(description) > 100 THEN 1 END) as good_description,
        COUNT(CASE WHEN address IS NOT NULL AND address != '' THEN 1 END) as with_address,
        COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_coordinates,
        COUNT(CASE WHEN hud_property_id IS NOT NULL THEN 1 END) as hud_properties
      FROM communities
    `);
    
    const quality = qualityQuery.rows[0];
    const phonePercent = ((quality.with_phone / quality.total) * 100).toFixed(1);
    const emailPercent = ((quality.with_email / quality.total) * 100).toFixed(1);
    const websitePercent = ((quality.with_website / quality.total) * 100).toFixed(1);
    const descPercent = ((quality.good_description / quality.total) * 100).toFixed(1);
    const addressPercent = ((quality.with_address / quality.total) * 100).toFixed(1);
    const coordPercent = ((quality.with_coordinates / quality.total) * 100).toFixed(1);
    
    console.log(`  With Phone: ${quality.with_phone} (${phonePercent}%)`);
    console.log(`  With Email: ${quality.with_email} (${emailPercent}%)`);
    console.log(`  With Website: ${quality.with_website} (${websitePercent}%)`);
    console.log(`  Good Description: ${quality.good_description} (${descPercent}%)`);
    console.log(`  With Address: ${quality.with_address} (${addressPercent}%)`);
    console.log(`  With Coordinates: ${quality.with_coordinates} (${coordPercent}%)`);
    console.log(`  HUD Properties: ${quality.hud_properties}\n`);
    
    report.push('## Data Quality Indicators\n');
    report.push(`- **Phone Numbers:** ${quality.with_phone} (${phonePercent}%)`);
    report.push(`- **Email Addresses:** ${quality.with_email} (${emailPercent}%)`);
    report.push(`- **Websites:** ${quality.with_website} (${websitePercent}%)`);
    report.push(`- **Quality Descriptions:** ${quality.good_description} (${descPercent}%)`);
    report.push(`- **Physical Addresses:** ${quality.with_address} (${addressPercent}%)`);
    report.push(`- **GPS Coordinates:** ${quality.with_coordinates} (${coordPercent}%)`);
    report.push(`- **HUD Properties:** ${quality.hud_properties}\n`);

    // 5. SUSPICIOUS PATTERNS
    console.log('🚨 SUSPICIOUS PATTERN DETECTION');
    console.log('=' .repeat(80));
    
    const suspiciousQuery = await pool.query(`
      SELECT 
        'Generic emails' as pattern,
        COUNT(*) as count
      FROM communities
      WHERE email LIKE '%example%' OR email LIKE '%test%' OR email LIKE '%@gmail.com'
      UNION ALL
      SELECT 
        'Template descriptions' as pattern,
        COUNT(*) as count
      FROM communities
      WHERE description LIKE '%specialized in comprehensive care%'
        OR description LIKE '%instalaciones modernas%'
        OR description LIKE '%personal altamente capacitado%'
      UNION ALL
      SELECT 
        'Missing critical data' as pattern,
        COUNT(*) as count
      FROM communities
      WHERE (phone IS NULL OR phone = '') 
        AND (email IS NULL OR email = '')
        AND (website IS NULL OR website = '')
      UNION ALL
      SELECT 
        'Duplicate phone numbers' as pattern,
        COUNT(*) - COUNT(DISTINCT phone) as count
      FROM communities
      WHERE phone IS NOT NULL
    `);
    
    report.push('## Suspicious Pattern Detection\n');
    let hasIssues = false;
    suspiciousQuery.rows.forEach(row => {
      if (row.count > 0) {
        hasIssues = true;
        console.log(`  ⚠️  ${row.pattern}: ${row.count}`);
        report.push(`- **⚠️ ${row.pattern}:** ${row.count}`);
      } else {
        console.log(`  ✅ ${row.pattern}: ${row.count}`);
        report.push(`- ✅ ${row.pattern}: ${row.count}`);
      }
    });
    report.push('\n');

    // 6. HUD PRICING INTEGRITY
    console.log('\n💰 HUD PRICING INTEGRITY');
    console.log('=' .repeat(80));
    
    const hudPricingQuery = await pool.query(`
      SELECT 
        COUNT(*) as total_hud,
        COUNT(CASE WHEN base_rent IS NOT NULL THEN 1 END) as with_base_rent,
        COUNT(CASE WHEN ceiling_rent IS NOT NULL THEN 1 END) as with_ceiling_rent,
        COUNT(CASE WHEN fair_market_rent IS NOT NULL THEN 1 END) as with_fmr,
        AVG(CASE WHEN base_rent > 0 THEN base_rent END) as avg_base_rent,
        MIN(CASE WHEN base_rent > 0 THEN base_rent END) as min_base_rent,
        MAX(CASE WHEN base_rent > 0 THEN base_rent END) as max_base_rent
      FROM communities
      WHERE hud_property_id IS NOT NULL
    `);
    
    const hudPricing = hudPricingQuery.rows[0];
    if (hudPricing.total_hud > 0) {
      console.log(`  Total HUD Properties: ${hudPricing.total_hud}`);
      console.log(`  With Base Rent: ${hudPricing.with_base_rent}`);
      console.log(`  With Ceiling Rent: ${hudPricing.with_ceiling_rent}`);
      console.log(`  With Fair Market Rent: ${hudPricing.with_fmr}`);
      if (hudPricing.avg_base_rent) {
        console.log(`  Base Rent Range: $${hudPricing.min_base_rent} - $${hudPricing.max_base_rent}`);
        console.log(`  Average Base Rent: $${Math.round(hudPricing.avg_base_rent)}`);
      }
      
      report.push('## HUD Pricing Integrity\n');
      report.push(`- **Total HUD Properties:** ${hudPricing.total_hud}`);
      report.push(`- **With Base Rent:** ${hudPricing.with_base_rent}`);
      report.push(`- **With Ceiling Rent:** ${hudPricing.with_ceiling_rent}`);
      report.push(`- **With Fair Market Rent:** ${hudPricing.with_fmr}`);
      if (hudPricing.avg_base_rent) {
        report.push(`- **Base Rent Range:** $${hudPricing.min_base_rent} - $${hudPricing.max_base_rent}`);
        report.push(`- **Average Base Rent:** $${Math.round(hudPricing.avg_base_rent)}`);
      }
      report.push('\n');
    }

    // 7. RECENT CHANGES
    console.log('\n📅 RECENT DATA CHANGES');
    console.log('=' .repeat(80));
    
    const recentQuery = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as added,
        COUNT(DISTINCT country) as countries
      FROM communities
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    if (recentQuery.rows.length > 0) {
      report.push('## Recent Data Changes (Last 7 Days)\n');
      recentQuery.rows.forEach(row => {
        console.log(`  ${row.date}: ${row.added} communities added (${row.countries} countries)`);
        report.push(`- **${row.date}:** ${row.added} communities added`);
      });
      report.push('\n');
    }

    // 8. INTEGRITY VERDICT
    console.log('\n================================================================================');
    console.log('🏆 INTEGRITY VERDICT');
    console.log('================================================================================\n');
    
    const noSourceCount = countryQuery.rows.reduce((sum, row) => sum + parseInt(row.no_source), 0);
    const noSourcePercent = ((noSourceCount / totals.total) * 100).toFixed(1);
    
    report.push('## Integrity Verdict\n');
    
    if (noSourcePercent > 50) {
      console.log('❌ CRITICAL INTEGRITY ISSUES');
      console.log(`   • ${noSourceCount} communities (${noSourcePercent}%) lack data sources`);
      console.log('   • Platform cannot claim "authentic" with majority unverified data');
      console.log('   • IMMEDIATE ACTION REQUIRED');
      
      report.push('### ❌ CRITICAL INTEGRITY ISSUES\n');
      report.push(`- **${noSourceCount} communities (${noSourcePercent}%) lack data sources**`);
      report.push('- Platform cannot claim "authentic" with majority unverified data');
      report.push('- **IMMEDIATE ACTION REQUIRED**');
    } else if (noSourcePercent > 20) {
      console.log('⚠️  MODERATE INTEGRITY CONCERNS');
      console.log(`   • ${noSourceCount} communities (${noSourcePercent}%) lack data sources`);
      console.log('   • Data quality indicators show room for improvement');
      console.log('   • Source verification needed for full integrity');
      
      report.push('### ⚠️ MODERATE INTEGRITY CONCERNS\n');
      report.push(`- **${noSourceCount} communities (${noSourcePercent}%) lack data sources**`);
      report.push('- Data quality indicators show room for improvement');
      report.push('- Source verification needed for full integrity');
    } else {
      console.log('✅ GOOD INTEGRITY STATUS');
      console.log(`   • Only ${noSourceCount} communities (${noSourcePercent}%) lack sources`);
      console.log('   • Majority of data has verified attribution');
      console.log('   • Platform can claim authenticity');
      
      report.push('### ✅ GOOD INTEGRITY STATUS\n');
      report.push(`- Only ${noSourceCount} communities (${noSourcePercent}%) lack sources`);
      report.push('- Majority of data has verified attribution');
      report.push('- Platform can claim authenticity');
    }
    
    report.push('\n## Recommendations\n');
    report.push('1. **Immediate:** Remove or verify all communities without data sources');
    report.push('2. **Short-term:** Implement mandatory data source validation');
    report.push('3. **Long-term:** Partner with official data providers for continuous updates');
    report.push('4. **Ongoing:** Regular integrity audits to maintain trust');
    
    // Save report
    const reportContent = report.join('\n');
    fs.writeFileSync('INTEGRITY_REVIEW_AUGUST_16.md', reportContent);
    
    console.log('\n📄 Full report saved to: INTEGRITY_REVIEW_AUGUST_16.md');
    
  } catch (error) {
    console.error('❌ ERROR during integrity review:', error);
  } finally {
    await pool.end();
  }
}

integrityReview();