// Discover actionable data we can implement immediately
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function discoverActionableData() {
  console.log('🎯 ACTIONABLE DATA WE CAN IMPLEMENT TODAY');
  console.log('=========================================\n');

  try {
    // 1. Direct management contacts we're not showing
    console.log('📞 DIRECT MANAGEMENT CONTACTS (Not displayed):\n');
    
    const mgmtResult = await pool.query(`
      SELECT 
        COUNT(CASE WHEN management_company IS NOT NULL AND management_company != '' THEN 1 END) as has_company,
        COUNT(CASE WHEN management_phone IS NOT NULL AND management_phone != '' THEN 1 END) as has_phone,
        COUNT(CASE WHEN management_email IS NOT NULL AND management_email != '' THEN 1 END) as has_email,
        COUNT(CASE WHEN management_contact IS NOT NULL AND management_contact != '' THEN 1 END) as has_contact_name
      FROM communities
    `);

    console.log(`🏢 Management companies: ${mgmtResult.rows[0].has_company.toLocaleString()} communities`);
    console.log(`📱 Direct management phones: ${mgmtResult.rows[0].has_phone.toLocaleString()} communities`);
    console.log(`📧 Management emails: ${mgmtResult.rows[0].has_email.toLocaleString()} communities`);
    console.log(`👤 Management contact names: ${mgmtResult.rows[0].has_contact_name.toLocaleString()} communities`);

    // 2. Waitlist and availability data
    console.log('\n⏳ WAITLIST & AVAILABILITY DATA:\n');
    
    const waitResult = await pool.query(`
      SELECT 
        COUNT(CASE WHEN months_waiting IS NOT NULL THEN 1 END) as has_wait_time,
        AVG(months_waiting) as avg_wait_time,
        MIN(months_waiting) as min_wait,
        MAX(months_waiting) as max_wait,
        COUNT(CASE WHEN occupancy_rate_hud > 95 THEN 1 END) as nearly_full,
        COUNT(CASE WHEN occupancy_rate_hud < 90 THEN 1 END) as has_availability
      FROM communities
      WHERE hud_property_id IS NOT NULL
    `);

    console.log(`⏱️ Communities with wait time data: ${waitResult.rows[0].has_wait_time.toLocaleString()}`);
    if (waitResult.rows[0].avg_wait_time) {
      console.log(`   Average wait: ${parseFloat(waitResult.rows[0].avg_wait_time).toFixed(1)} months`);
      console.log(`   Range: ${parseFloat(waitResult.rows[0].min_wait).toFixed(1)} - ${parseFloat(waitResult.rows[0].max_wait).toFixed(1)} months`);
    }
    console.log(`🔴 Nearly full (>95% occupancy): ${waitResult.rows[0].nearly_full.toLocaleString()} communities`);
    console.log(`🟢 Has availability (<90% occupancy): ${waitResult.rows[0].has_availability.toLocaleString()} communities`);

    // 3. Rich descriptions and facility types
    console.log('\n📝 CONTENT & FACILITY TYPES:\n');
    
    const contentResult = await pool.query(`
      SELECT 
        COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as has_description,
        COUNT(CASE WHEN description IS NOT NULL AND LENGTH(description) > 200 THEN 1 END) as rich_description,
        COUNT(CASE WHEN facility_type = 'HUD-VASH' THEN 1 END) as hud_vash,
        COUNT(CASE WHEN facility_type = 'Affordable Senior' THEN 1 END) as affordable_senior,
        COUNT(CASE WHEN facility_type = 'Veterans Housing' THEN 1 END) as veterans_housing,
        COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) as has_website,
        COUNT(CASE WHEN virtual_tour_url IS NOT NULL AND virtual_tour_url != '' THEN 1 END) as has_virtual_tour
      FROM communities
    `);

    console.log(`📄 Communities with descriptions: ${contentResult.rows[0].has_description.toLocaleString()}`);
    console.log(`📝 Rich descriptions (>200 chars): ${contentResult.rows[0].rich_description.toLocaleString()}`);
    console.log(`🌐 Communities with websites: ${contentResult.rows[0].has_website.toLocaleString()}`);
    console.log(`🎥 Virtual tours available: ${contentResult.rows[0].has_virtual_tour}`);
    console.log(`\nSpecial facility types:`);
    console.log(`🇺🇸 HUD-VASH (Veterans): ${contentResult.rows[0].hud_vash}`);
    console.log(`💰 Affordable Senior Housing: ${contentResult.rows[0].affordable_senior}`);
    console.log(`🎖️ Veterans Housing: ${contentResult.rows[0].veterans_housing}`);

    // 4. Unit size distribution data
    console.log('\n🏠 UNIT SIZE DATA (For "I need a 2BR" searches):\n');
    
    const unitResult = await pool.query(`
      SELECT 
        COUNT(CASE WHEN studio_units_pct IS NOT NULL THEN 1 END) as has_studio_data,
        COUNT(CASE WHEN one_bedroom_pct IS NOT NULL THEN 1 END) as has_1br_data,
        COUNT(CASE WHEN two_bedroom_pct IS NOT NULL THEN 1 END) as has_2br_data,
        AVG(CASE WHEN studio_units_pct IS NOT NULL THEN studio_units_pct ELSE NULL END) as avg_studio,
        AVG(CASE WHEN one_bedroom_pct IS NOT NULL THEN one_bedroom_pct ELSE NULL END) as avg_1br,
        AVG(CASE WHEN two_bedroom_pct IS NOT NULL THEN two_bedroom_pct ELSE NULL END) as avg_2br
      FROM communities
    `);

    console.log(`📊 Communities with unit mix data:`);
    console.log(`   Studio units: ${unitResult.rows[0].has_studio_data} communities`);
    console.log(`   1BR units: ${unitResult.rows[0].has_1br_data} communities`);
    console.log(`   2BR units: ${unitResult.rows[0].has_2br_data} communities`);

    // 5. Sample queries showing real data
    console.log('\n💡 SAMPLE QUERIES WE COULD ENABLE:\n');

    // Query 1: Affordable options under $400/month
    const affordableResult = await pool.query(`
      SELECT COUNT(*) as count, AVG(rent_per_month) as avg_rent
      FROM communities 
      WHERE rent_per_month IS NOT NULL AND rent_per_month < 400 AND rent_per_month > 0
    `);
    console.log(`🔍 "Show me affordable options under $400/month"`);
    console.log(`   → ${affordableResult.rows[0].count} communities (avg: $${parseFloat(affordableResult.rows[0].avg_rent).toFixed(0)}/month)`);

    // Query 2: High senior population communities
    const seniorResult = await pool.query(`
      SELECT COUNT(*) as count, AVG(age_62_plus_pct) as avg_senior_pct
      FROM communities 
      WHERE age_62_plus_pct > 75
    `);
    console.log(`\n🔍 "Show me communities with mostly seniors (>75%)"`);
    console.log(`   → ${seniorResult.rows[0].count} communities (avg: ${parseFloat(seniorResult.rows[0].avg_senior_pct).toFixed(0)}% seniors)`);

    // Query 3: Available now (low occupancy)
    const availableResult = await pool.query(`
      SELECT COUNT(*) as count, AVG(occupancy_rate_hud) as avg_occupancy
      FROM communities 
      WHERE occupancy_rate_hud < 85 AND occupancy_rate_hud > 0
    `);
    console.log(`\n🔍 "Show me communities with immediate availability"`);
    console.log(`   → ${availableResult.rows[0].count} communities (avg: ${parseFloat(availableResult.rows[0].avg_occupancy).toFixed(0)}% occupied)`);

    // 6. Top management companies by property count
    console.log('\n\n🏆 TOP PROPERTY MANAGEMENT COMPANIES:\n');
    
    const topMgmtResult = await pool.query(`
      SELECT management_company, COUNT(*) as property_count
      FROM communities
      WHERE management_company IS NOT NULL AND management_company != ''
      GROUP BY management_company
      ORDER BY property_count DESC
      LIMIT 5
    `);

    topMgmtResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.management_company}: ${row.property_count} properties`);
    });

    // 7. Geographic insights
    console.log('\n\n🗺️ GEOGRAPHIC INSIGHTS:\n');
    
    const geoResult = await pool.query(`
      SELECT 
        state,
        COUNT(*) as total_communities,
        COUNT(CASE WHEN hud_property_id IS NOT NULL THEN 1 END) as hud_properties,
        COUNT(CASE WHEN rent_per_month IS NOT NULL THEN 1 END) as with_pricing,
        AVG(CASE WHEN rent_per_month IS NOT NULL THEN rent_per_month ELSE NULL END) as avg_rent
      FROM communities
      WHERE state IN ('CA', 'TX', 'FL', 'NY', 'PA')
      GROUP BY state
      ORDER BY total_communities DESC
    `);

    console.log('Top 5 states with HUD data coverage:');
    geoResult.rows.forEach(row => {
      const hudPercent = ((row.hud_properties / row.total_communities) * 100).toFixed(1);
      const pricingPercent = ((row.with_pricing / row.total_communities) * 100).toFixed(1);
      console.log(`\n${row.state}: ${parseInt(row.total_communities).toLocaleString()} total communities`);
      console.log(`   HUD properties: ${row.hud_properties} (${hudPercent}%)`);
      console.log(`   With pricing: ${row.with_pricing} (${pricingPercent}%)`);
      if (row.avg_rent) {
        console.log(`   Average HUD rent: $${parseFloat(row.avg_rent).toFixed(0)}/month`);
      }
    });

    console.log('\n\n✅ Actionable data discovery complete!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the discovery
discoverActionableData();