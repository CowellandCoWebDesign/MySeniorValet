// Data Discovery Script - Find what verified data exists but isn't being utilized
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function discoverUnusedData() {
  console.log('🔍 MySeniorValet Data Discovery Analysis');
  console.log('=======================================\n');

  try {
    // 1. Count total communities
    const totalResult = await pool.query('SELECT COUNT(*) FROM communities');
    const totalCommunities = parseInt(totalResult.rows[0].count);
    console.log(`📊 Total Communities in Database: ${totalCommunities.toLocaleString()}\n`);

    // 2. Analyze HUD data fields
    console.log('🏛️  HUD GOVERNMENT DATA ANALYSIS:\n');
    
    const hudFields = [
      { field: 'hud_property_id', label: 'HUD Property IDs' },
      { field: 'rent_per_month', label: 'HUD Verified Monthly Rent' },
      { field: 'occupancy_rate_hud', label: 'HUD Occupancy Rates' },
      { field: 'total_units_hud', label: 'HUD Total Units' },
      { field: 'available_units_hud', label: 'HUD Available Units' },
      { field: 'household_income', label: 'HUD Household Income Data' },
      { field: 'age_62_plus_pct', label: 'HUD Senior Demographics (62+)' },
      { field: 'age_85_plus_pct', label: 'HUD Super Senior Demographics (85+)' },
      { field: 'disabled_all_pct', label: 'HUD Disability Demographics' },
      { field: 'management_company', label: 'HUD Management Company Names' },
      { field: 'management_phone', label: 'HUD Management Phone Numbers' },
      { field: 'management_email', label: 'HUD Management Emails' },
      { field: 'months_waiting', label: 'HUD Average Wait Time (months)' }
    ];

    for (const { field, label } of hudFields) {
      // Check if field is numeric or text
      const numericFields = ['rent_per_month', 'occupancy_rate_hud', 'total_units_hud', 'available_units_hud', 
                            'household_income', 'age_62_plus_pct', 'age_85_plus_pct', 'disabled_all_pct', 
                            'months_waiting'];
      const isNumeric = numericFields.includes(field);
      
      let query;
      if (isNumeric) {
        query = `
          SELECT COUNT(*) as count,
                 AVG(${field}::numeric) as avg_value,
                 MIN(${field}::numeric) as min_value,
                 MAX(${field}::numeric) as max_value
          FROM communities 
          WHERE ${field} IS NOT NULL
        `;
      } else {
        query = `
          SELECT COUNT(*) as count
          FROM communities 
          WHERE ${field} IS NOT NULL AND ${field} != ''
        `;
      }
      
      const result = await pool.query(query);
      const count = parseInt(result.rows[0].count);
      const percentage = ((count / totalCommunities) * 100).toFixed(1);
      
      if (count > 0) {
        console.log(`✅ ${label}: ${count.toLocaleString()} communities (${percentage}%)`);
        if (isNumeric && result.rows[0].avg_value !== null) {
          const avg = parseFloat(result.rows[0].avg_value);
          const min = parseFloat(result.rows[0].min_value);
          const max = parseFloat(result.rows[0].max_value);
          if (field.includes('pct') || field.includes('rate')) {
            console.log(`   Range: ${min.toFixed(1)}% - ${max.toFixed(1)}% (avg: ${avg.toFixed(1)}%)`);
          } else if (field.includes('rent') || field.includes('income')) {
            console.log(`   Range: $${min.toFixed(0)} - $${max.toFixed(0)} (avg: $${avg.toFixed(0)})`);
          } else if (field.includes('months')) {
            console.log(`   Range: ${min.toFixed(1)} - ${max.toFixed(1)} months (avg: ${avg.toFixed(1)} months)`);
          }
        }
      }
    }

    // 3. Analyze verified pricing data
    console.log('\n💰 VERIFIED PRICING DATA:\n');
    
    const pricingQueries = [
      {
        label: 'Communities with HUD verified rent',
        query: `SELECT COUNT(*) FROM communities WHERE hud_property_id IS NOT NULL AND rent_per_month IS NOT NULL`
      },
      {
        label: 'Communities with live pricing (claimed)',
        query: `SELECT COUNT(*) FROM communities WHERE claimed_by_user_id IS NOT NULL AND pricing_type = 'live'`
      },
      {
        label: 'Communities with price ranges',
        query: `SELECT COUNT(*) FROM communities WHERE price_range IS NOT NULL`
      },
      {
        label: 'Communities with detailed pricing breakdown',
        query: `SELECT COUNT(*) FROM communities WHERE pricing_details IS NOT NULL AND pricing_details::text != '{}'`
      }
    ];

    for (const { label, query } of pricingQueries) {
      const result = await pool.query(query);
      const count = parseInt(result.rows[0].count);
      const percentage = ((count / totalCommunities) * 100).toFixed(1);
      console.log(`📊 ${label}: ${count.toLocaleString()} (${percentage}%)`);
    }

    // 4. Analyze community details data
    console.log('\n🏘️  COMMUNITY DETAILS DATA:\n');
    
    const detailFields = [
      { field: 'license_number', label: 'State License Numbers' },
      { field: 'license_status', label: 'License Status' },
      { field: 'last_inspection', label: 'Inspection Dates' },
      { field: 'violations', label: 'Violation Records' },
      { field: 'veteran_programs', label: 'Veteran Programs' },
      { field: 'eligibility_requirements', label: 'Eligibility Requirements' },
      { field: 'google_rating', label: 'Google Ratings' },
      { field: 'google_review_count', label: 'Google Review Counts' },
      { field: 'yelp_rating', label: 'Yelp Ratings' },
      { field: 'yelp_review_count', label: 'Yelp Review Counts' }
    ];

    for (const { field, label } of detailFields) {
      let query = `SELECT COUNT(*) FROM communities WHERE ${field} IS NOT NULL`;
      if (field.includes('programs') || field.includes('requirements')) {
        query = `SELECT COUNT(*) FROM communities WHERE ${field} IS NOT NULL AND array_length(${field}, 1) > 0`;
      }
      const result = await pool.query(query);
      const count = parseInt(result.rows[0].count);
      const percentage = ((count / totalCommunities) * 100).toFixed(1);
      if (count > 0) {
        console.log(`📌 ${label}: ${count.toLocaleString()} communities (${percentage}%)`);
      }
    }

    // 5. Analyze specialized services data
    console.log('\n🏥 SPECIALIZED SERVICES DATA:\n');
    
    const serviceFields = [
      { field: 'spa_services', label: 'Spa Services' },
      { field: 'healthcare_services', label: 'Healthcare Services' },
      { field: 'fitness_services', label: 'Fitness Services' },
      { field: 'dining_services', label: 'Dining Services' },
      { field: 'transportation_services', label: 'Transportation Services' },
      { field: 'social_services', label: 'Social Services' },
      { field: 'medical_restrictions', label: 'Medical Restrictions' }
    ];

    for (const { field, label } of serviceFields) {
      const result = await pool.query(`
        SELECT COUNT(*) FROM communities 
        WHERE ${field} IS NOT NULL AND array_length(${field}, 1) > 0
      `);
      const count = parseInt(result.rows[0].count);
      const percentage = ((count / totalCommunities) * 100).toFixed(1);
      if (count > 0) {
        console.log(`🏥 ${label}: ${count.toLocaleString()} communities (${percentage}%)`);
      }
    }

    // 6. Sample some communities with rich HUD data
    console.log('\n🌟 SAMPLE COMMUNITIES WITH RICH HUD DATA:\n');
    
    const richDataSample = await pool.query(`
      SELECT name, city, state, 
             hud_property_id,
             rent_per_month,
             occupancy_rate_hud,
             age_62_plus_pct,
             disabled_all_pct,
             management_company,
             months_waiting
      FROM communities 
      WHERE hud_property_id IS NOT NULL 
        AND rent_per_month IS NOT NULL
        AND occupancy_rate_hud IS NOT NULL
        AND age_62_plus_pct IS NOT NULL
      ORDER BY rent_per_month ASC
      LIMIT 5
    `);

    richDataSample.rows.forEach((community, index) => {
      console.log(`\n${index + 1}. ${community.name} - ${community.city}, ${community.state}`);
      console.log(`   HUD ID: ${community.hud_property_id}`);
      console.log(`   Rent: $${community.rent_per_month}/month`);
      console.log(`   Occupancy: ${community.occupancy_rate_hud}%`);
      console.log(`   Seniors 62+: ${community.age_62_plus_pct}%`);
      console.log(`   Disabled residents: ${community.disabled_all_pct}%`);
      if (community.management_company) {
        console.log(`   Managed by: ${community.management_company}`);
      }
      if (community.months_waiting) {
        console.log(`   Average wait: ${community.months_waiting} months`);
      }
    });

    // 7. Geographic coverage analysis
    console.log('\n🗺️  GEOGRAPHIC COVERAGE:\n');
    
    const stateResult = await pool.query(`
      SELECT state, COUNT(*) as count 
      FROM communities 
      GROUP BY state 
      ORDER BY count DESC 
      LIMIT 10
    `);

    console.log('Top 10 states by community count:');
    stateResult.rows.forEach((row, index) => {
      const percentage = ((parseInt(row.count) / totalCommunities) * 100).toFixed(1);
      console.log(`${index + 1}. ${row.state}: ${parseInt(row.count).toLocaleString()} communities (${percentage}%)`);
    });

    // 8. Data completeness summary
    console.log('\n📈 DATA COMPLETENESS SUMMARY:\n');
    
    const completenessChecks = [
      {
        label: 'Communities with photos',
        query: `SELECT COUNT(*) FROM communities WHERE photos IS NOT NULL AND array_length(photos, 1) > 0`
      },
      {
        label: 'Communities with descriptions',
        query: `SELECT COUNT(*) FROM communities WHERE description IS NOT NULL AND description != ''`
      },
      {
        label: 'Communities with coordinates',
        query: `SELECT COUNT(*) FROM communities WHERE latitude IS NOT NULL AND longitude IS NOT NULL`
      },
      {
        label: 'Communities with email addresses',
        query: `SELECT COUNT(*) FROM communities WHERE email IS NOT NULL AND email != ''`
      },
      {
        label: 'Communities with websites',
        query: `SELECT COUNT(*) FROM communities WHERE website IS NOT NULL AND website != ''`
      }
    ];

    for (const { label, query } of completenessChecks) {
      const result = await pool.query(query);
      const count = parseInt(result.rows[0].count);
      const percentage = ((count / totalCommunities) * 100).toFixed(1);
      console.log(`📊 ${label}: ${count.toLocaleString()} (${percentage}%)`);
    }

    console.log('\n✅ Data discovery complete!');

  } catch (error) {
    console.error('Error during data discovery:', error);
  } finally {
    await pool.end();
  }
}

// Run the discovery
discoverUnusedData();