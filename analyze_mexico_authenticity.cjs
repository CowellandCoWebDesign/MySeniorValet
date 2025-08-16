#!/usr/bin/env node

/**
 * DEEP AUTHENTICITY ANALYSIS - MEXICAN COMMUNITIES
 * Examine patterns to determine if communities are real or synthetic
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function analyzeMexicanAuthenticity() {
  console.log('================================================================================');
  console.log('MEXICAN COMMUNITIES AUTHENTICITY ANALYSIS');
  console.log('================================================================================\n');

  try {
    // Check for synthetic patterns in Mexican communities
    console.log('🔍 CHECKING FOR SYNTHETIC PATTERNS...\n');
    
    // 1. Check email patterns
    const emailPatternQuery = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT email) as unique_emails,
        COUNT(CASE WHEN email LIKE '%@%.mx' THEN 1 END) as mx_emails,
        COUNT(CASE WHEN email LIKE '%contacto@%' THEN 1 END) as contacto_emails,
        COUNT(CASE WHEN email IS NULL THEN 1 END) as null_emails
      FROM communities
      WHERE country IN ('Mexico', 'MX')
    `);
    
    const emailStats = emailPatternQuery.rows[0];
    console.log('📧 EMAIL ANALYSIS:');
    console.log(`  Total communities: ${emailStats.total}`);
    console.log(`  Unique emails: ${emailStats.unique_emails}`);
    console.log(`  .mx domains: ${emailStats.mx_emails}`);
    console.log(`  Generic 'contacto@' emails: ${emailStats.contacto_emails}`);
    console.log(`  No email: ${emailStats.null_emails}`);
    
    if (emailStats.contacto_emails > 1000) {
      console.log('  ⚠️  SUSPICIOUS: High number of generic "contacto@" emails!');
    }
    
    // 2. Check phone patterns
    const phonePatternQuery = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT phone) as unique_phones,
        COUNT(CASE WHEN phone LIKE '+52%' THEN 1 END) as mexico_phones,
        COUNT(CASE WHEN phone ~ '[0-9]{4}-[0-9]{4}' THEN 1 END) as formatted_phones,
        COUNT(CASE WHEN phone IS NULL THEN 1 END) as null_phones
      FROM communities
      WHERE country IN ('Mexico', 'MX')
    `);
    
    const phoneStats = phonePatternQuery.rows[0];
    console.log('\n📞 PHONE ANALYSIS:');
    console.log(`  Total communities: ${phoneStats.total}`);
    console.log(`  Unique phones: ${phoneStats.unique_phones}`);
    console.log(`  +52 Mexico phones: ${phoneStats.mexico_phones}`);
    console.log(`  Pattern XXXX-XXXX: ${phoneStats.formatted_phones}`);
    console.log(`  No phone: ${phoneStats.null_phones}`);
    
    if (phoneStats.formatted_phones > 1000) {
      console.log('  ⚠️  SUSPICIOUS: High number of uniformly formatted phones!');
    }
    
    // 3. Check website patterns
    const websitePatternQuery = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT website) as unique_websites,
        COUNT(CASE WHEN website LIKE '%.com.mx' THEN 1 END) as com_mx,
        COUNT(CASE WHEN website LIKE 'https://www.%' THEN 1 END) as https_www,
        COUNT(CASE WHEN website IS NULL THEN 1 END) as null_websites
      FROM communities
      WHERE country IN ('Mexico', 'MX')
    `);
    
    const websiteStats = websitePatternQuery.rows[0];
    console.log('\n🌐 WEBSITE ANALYSIS:');
    console.log(`  Total communities: ${websiteStats.total}`);
    console.log(`  Unique websites: ${websiteStats.unique_websites}`);
    console.log(`  .com.mx domains: ${websiteStats.com_mx}`);
    console.log(`  https://www. pattern: ${websiteStats.https_www}`);
    console.log(`  No website: ${websiteStats.null_websites}`);
    
    if (websiteStats.https_www > 1000) {
      console.log('  ⚠️  SUSPICIOUS: Too many perfectly formatted websites!');
    }
    
    // 4. Check name patterns
    const namePatternQuery = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN name LIKE 'Casa de Retiro%' THEN 1 END) as casa_retiro,
        COUNT(CASE WHEN name LIKE 'Residencia Geriátrica%' THEN 1 END) as residencia,
        COUNT(CASE WHEN name LIKE 'Asilo%' THEN 1 END) as asilo,
        COUNT(CASE WHEN name LIKE 'Centro Gerontológico%' THEN 1 END) as centro,
        COUNT(CASE WHEN name LIKE '%Norte' OR name LIKE '%Sur' OR name LIKE '%Este' OR name LIKE '%Oeste' THEN 1 END) as directional
      FROM communities
      WHERE country IN ('Mexico', 'MX')
    `);
    
    const nameStats = namePatternQuery.rows[0];
    console.log('\n🏷️  NAME PATTERN ANALYSIS:');
    console.log(`  Total communities: ${nameStats.total}`);
    console.log(`  "Casa de Retiro X": ${nameStats.casa_retiro}`);
    console.log(`  "Residencia Geriátrica X": ${nameStats.residencia}`);
    console.log(`  "Asilo X": ${nameStats.asilo}`);
    console.log(`  "Centro Gerontológico X": ${nameStats.centro}`);
    console.log(`  With directional suffixes (Norte/Sur/Este/Oeste): ${nameStats.directional}`);
    
    if (nameStats.casa_retiro > 500 || nameStats.residencia > 500) {
      console.log('  ⚠️  SUSPICIOUS: Too many template-based names!');
    }
    
    // 5. Check description patterns
    const descriptionQuery = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN description LIKE '%Centro especializado en el cuidado integral%' THEN 1 END) as template_desc,
        COUNT(CASE WHEN description IS NULL OR LENGTH(description) < 50 THEN 1 END) as short_desc,
        COUNT(CASE WHEN description LIKE '%instalaciones modernas%' THEN 1 END) as modern_facilities,
        COUNT(CASE WHEN description LIKE '%personal altamente capacitado%' THEN 1 END) as trained_staff
      FROM communities
      WHERE country IN ('Mexico', 'MX')
    `);
    
    const descStats = descriptionQuery.rows[0];
    console.log('\n📝 DESCRIPTION ANALYSIS:');
    console.log(`  Total communities: ${descStats.total}`);
    console.log(`  Template descriptions: ${descStats.template_desc}`);
    console.log(`  Short/missing descriptions: ${descStats.short_desc}`);
    console.log(`  "instalaciones modernas": ${descStats.modern_facilities}`);
    console.log(`  "personal altamente capacitado": ${descStats.trained_staff}`);
    
    if (descStats.template_desc > 100) {
      console.log('  ⚠️  SUSPICIOUS: Many identical template descriptions!');
    }
    
    // 6. Sample actual data
    console.log('\n📊 SAMPLE OF MEXICAN COMMUNITIES:');
    console.log('================================================================================');
    
    const sampleQuery = await pool.query(`
      SELECT 
        id,
        name,
        city,
        state,
        phone,
        email,
        website,
        data_source,
        created_at
      FROM communities
      WHERE country IN ('Mexico', 'MX')
      ORDER BY RANDOM()
      LIMIT 5
    `);
    
    sampleQuery.rows.forEach((row, i) => {
      console.log(`\n${i + 1}. ${row.name}`);
      console.log(`   City: ${row.city}, ${row.state}`);
      console.log(`   Phone: ${row.phone || 'None'}`);
      console.log(`   Email: ${row.email || 'None'}`);
      console.log(`   Website: ${row.website || 'None'}`);
      console.log(`   Data Source: ${row.data_source || 'NO SOURCE'}`);
      console.log(`   Created: ${row.created_at}`);
    });
    
    // 7. Final verdict
    console.log('\n================================================================================');
    console.log('🚨 AUTHENTICITY VERDICT');
    console.log('================================================================================\n');
    
    const suspiciousCount = 
      (emailStats.contacto_emails > 1000 ? 1 : 0) +
      (phoneStats.formatted_phones > 1000 ? 1 : 0) +
      (websiteStats.https_www > 1000 ? 1 : 0) +
      (nameStats.casa_retiro > 500 ? 1 : 0) +
      (descStats.template_desc > 100 ? 1 : 0);
    
    if (suspiciousCount >= 3) {
      console.log('❌ VERDICT: THESE MEXICAN COMMUNITIES ARE SYNTHETIC');
      console.log('   Evidence:');
      console.log('   • Uniform patterns in emails, phones, websites');
      console.log('   • Template-based names and descriptions');
      console.log('   • No data source attribution');
      console.log('   • Mass-generated characteristics');
      console.log('\n   RECOMMENDATION: Remove all Mexican communities without verified data sources');
    } else {
      console.log('✅ VERDICT: Communities may be authentic but need verification');
      console.log('   RECOMMENDATION: Require data source verification for all communities');
    }
    
  } catch (error) {
    console.error('❌ ERROR during analysis:', error);
  } finally {
    await pool.end();
  }
}

analyzeMexicanAuthenticity();