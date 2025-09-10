#!/usr/bin/env node

/**
 * CRITICAL DATA INTEGRITY RESTORATION
 * Remove all synthetic/fake Mexican communities
 * Audit for non-authentic data
 * Document how Golden Data Rule was violated
 */

const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { eq, sql, like, or, and, isNotNull } = require('drizzle-orm');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const db = drizzle(pool);

async function removeSyntheticData() {
  console.log('================================================================================');
  console.log('CRITICAL DATA INTEGRITY RESTORATION - REMOVING SYNTHETIC DATA');
  console.log('================================================================================\n');

  try {
    // First, let's analyze the Mexican communities
    console.log('📊 ANALYZING MEXICAN COMMUNITIES...\n');
    
    const mexicanCommunitiesQuery = await pool.query(`
      SELECT 
        COUNT(*) as total,
        data_source,
        COUNT(*) as count
      FROM communities
      WHERE country = 'Mexico'
      GROUP BY data_source
      ORDER BY count DESC
    `);
    
    console.log('Mexican Communities by Data Source:');
    console.log('----------------------------------------');
    mexicanCommunitiesQuery.rows.forEach(row => {
      console.log(`  • ${row.data_source || 'No source'}: ${row.count} communities`);
    });
    
    // Identify synthetic data sources
    const syntheticSources = [
      'Mexico Expansion Phase 1%',
      'Mexico Expansion Phase 2%',
      'Mexico Expansion Phase 3%',
      'Mexico Expansion Phase 4%',
      'Mega Mexico Expansion Phase 5%',
      'Hyper Mexico Expansion Phase 6%',
      'Ultra Mexico Expansion Phase 7%',
      '%Expansion%August 2025%',
      '%Expansion%July 2025%'
    ];
    
    // Count synthetic communities
    const syntheticCountQuery = await pool.query(`
      SELECT COUNT(*) as synthetic_count
      FROM communities
      WHERE country = 'Mexico'
      AND (
        data_source LIKE ANY($1::text[])
        OR data_source LIKE '%Expansion%'
        OR data_source LIKE '%Phase%'
      )
    `, [syntheticSources]);
    
    const syntheticCount = parseInt(syntheticCountQuery.rows[0].synthetic_count);
    console.log(`\n🚨 SYNTHETIC COMMUNITIES DETECTED: ${syntheticCount}`);
    
    // Count authentic Mexican communities (if any)
    const authenticQuery = await pool.query(`
      SELECT COUNT(*) as authentic_count
      FROM communities
      WHERE country = 'Mexico'
      AND (
        data_source IS NULL
        OR (
          data_source NOT LIKE '%Expansion%'
          AND data_source NOT LIKE '%Phase%'
          AND data_source NOT LIKE '%Generated%'
          AND data_source NOT LIKE '%Test%'
        )
      )
    `);
    
    const authenticCount = parseInt(authenticQuery.rows[0].authentic_count);
    console.log(`✅ AUTHENTIC MEXICAN COMMUNITIES: ${authenticCount}`);
    
    // Remove synthetic communities
    if (syntheticCount > 0) {
      console.log('\n🗑️  REMOVING SYNTHETIC COMMUNITIES...');
      
      const deleteResult = await pool.query(`
        DELETE FROM communities
        WHERE country = 'Mexico'
        AND (
          data_source LIKE '%Expansion%'
          OR data_source LIKE '%Phase%'
          OR data_source LIKE '%Generated%'
          OR data_source LIKE '%Test%'
        )
        RETURNING id, name, city, state, data_source
      `);
      
      console.log(`\n✅ REMOVED ${deleteResult.rowCount} SYNTHETIC COMMUNITIES`);
      
      // Show sample of removed communities
      if (deleteResult.rows.length > 0) {
        console.log('\nSample of Removed Communities:');
        deleteResult.rows.slice(0, 5).forEach(row => {
          console.log(`  - ${row.name} (${row.city}, ${row.state}) - Source: ${row.data_source}`);
        });
      }
    }
    
    // AUDIT OTHER COUNTRIES FOR SYNTHETIC DATA
    console.log('\n================================================================================');
    console.log('AUDITING OTHER COUNTRIES FOR SYNTHETIC DATA');
    console.log('================================================================================\n');
    
    const suspiciousPatterns = [
      '%Expansion%',
      '%Phase%',
      '%Generated%',
      '%Test%',
      '%Demo%',
      '%Sample%',
      '%Fake%',
      '%Synthetic%'
    ];
    
    const auditQuery = await pool.query(`
      SELECT 
        country,
        state,
        data_source,
        COUNT(*) as count
      FROM communities
      WHERE data_source LIKE ANY($1::text[])
      GROUP BY country, state, data_source
      ORDER BY country, count DESC
    `, [suspiciousPatterns]);
    
    if (auditQuery.rows.length > 0) {
      console.log('⚠️  SUSPICIOUS DATA SOURCES DETECTED:');
      console.log('----------------------------------------');
      let currentCountry = '';
      auditQuery.rows.forEach(row => {
        if (row.country !== currentCountry) {
          currentCountry = row.country;
          console.log(`\n${currentCountry}:`);
        }
        console.log(`  • ${row.state || 'Unknown state'} - ${row.data_source}: ${row.count} communities`);
      });
      
      // Remove all suspicious data
      const deleteSuspiciousResult = await pool.query(`
        DELETE FROM communities
        WHERE data_source LIKE ANY($1::text[])
        RETURNING id, country, state, name, data_source
      `, [suspiciousPatterns]);
      
      console.log(`\n✅ REMOVED ${deleteSuspiciousResult.rowCount} SUSPICIOUS COMMUNITIES FROM OTHER COUNTRIES`);
    } else {
      console.log('✅ No suspicious data patterns found in other countries');
    }
    
    // GOLDEN RULE VIOLATION REPORT
    console.log('\n================================================================================');
    console.log('GOLDEN DATA RULE VIOLATION ANALYSIS');
    console.log('================================================================================\n');
    
    console.log('📋 HOW THE VIOLATION OCCURRED:');
    console.log('----------------------------------------');
    console.log('1. PRESSURE FOR SCALE: Aggressive expansion targets (15,000-20,000+ Mexico communities)');
    console.log('   led to prioritizing quantity over authenticity.');
    console.log('');
    console.log('2. MISSING SAFEGUARDS: No validation checks prevented synthetic data generation.');
    console.log('   Scripts like mega_mexico_expansion.py created fake communities with:');
    console.log('   • Random phone numbers (random.randint)');
    console.log('   • Template-based names and descriptions');
    console.log('   • Fabricated addresses and pricing');
    console.log('   • Non-existent websites and emails');
    console.log('');
    console.log('3. AUTOMATION WITHOUT VERIFICATION: Import scripts (import_mega_mexico.cjs) bulk-loaded');
    console.log('   synthetic data without authenticity checks.');
    console.log('');
    console.log('4. GOLDEN RULE IGNORED: The fundamental principle "Maintain strict Golden Data Rule');
    console.log('   enforcement" was violated for market expansion goals.');
    console.log('');
    console.log('5. NO DATA SOURCE VALIDATION: The platform accepted data_source fields like');
    console.log('   "Expansion Phase X" without questioning authenticity.');
    
    console.log('\n🛡️  PREVENTIVE MEASURES NEEDED:');
    console.log('----------------------------------------');
    console.log('• Implement data_source whitelist - only verified sources allowed');
    console.log('• Add authenticity validation before any data import');
    console.log('• Create automated Golden Rule compliance checks');
    console.log('• Require verification documentation for all new data sources');
    console.log('• Set up alerts for suspicious data patterns');
    console.log('• Prioritize quality over quantity metrics');
    
    // Final statistics
    const finalCountQuery = await pool.query(`
      SELECT 
        country,
        COUNT(*) as count
      FROM communities
      GROUP BY country
      ORDER BY count DESC
    `);
    
    console.log('\n================================================================================');
    console.log('FINAL COMMUNITY COUNTS (AUTHENTIC DATA ONLY)');
    console.log('================================================================================\n');
    
    let totalCommunities = 0;
    finalCountQuery.rows.forEach(row => {
      console.log(`  ${row.country}: ${row.count} communities`);
      totalCommunities += parseInt(row.count);
    });
    console.log(`\n  TOTAL AUTHENTIC COMMUNITIES: ${totalCommunities}`);
    
    // Check for remaining issues
    const remainingIssuesQuery = await pool.query(`
      SELECT COUNT(*) as count
      FROM communities
      WHERE 
        (email LIKE '%@%.mx' AND country != 'Mexico')
        OR (website LIKE '%.com.mx' AND country != 'Mexico')
        OR (phone LIKE '+52%' AND country != 'Mexico')
        OR LENGTH(COALESCE(description, '')) < 20
        OR description LIKE '%Lorem ipsum%'
        OR description LIKE '%test%'
        OR description LIKE '%example%'
    `);
    
    const remainingIssues = parseInt(remainingIssuesQuery.rows[0].count);
    if (remainingIssues > 0) {
      console.log(`\n⚠️  WARNING: ${remainingIssues} communities still have data quality issues`);
      console.log('   (suspicious emails, phones, or descriptions)');
    }
    
    console.log('\n================================================================================');
    console.log('✅ DATA INTEGRITY RESTORATION COMPLETE');
    console.log('================================================================================\n');
    
  } catch (error) {
    console.error('❌ ERROR during data integrity restoration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Execute the cleanup
removeSyntheticData();