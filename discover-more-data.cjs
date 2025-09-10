// Deep dive into unused data fields
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function discoverMoreData() {
  console.log('🔍 DEEP DIVE: Unused MySeniorValet Data Analysis');
  console.log('================================================\n');

  try {
    // 1. HUD Income Demographics - Valuable for affordability filtering
    console.log('💵 HUD INCOME & AFFORDABILITY DATA:\n');
    
    const incomeQueries = [
      {
        field: 'income_lt_5k_pct',
        label: 'Residents with income <$5k/year'
      },
      {
        field: 'income_5k_10k_pct',
        label: 'Residents with income $5k-$10k/year'
      },
      {
        field: 'income_10k_15k_pct',
        label: 'Residents with income $10k-$15k/year'
      },
      {
        field: 'household_income',
        label: 'Average household income'
      },
      {
        field: 'person_income',
        label: 'Average person income'
      },
      {
        field: 'welfare_major_pct',
        label: 'Residents on welfare assistance'
      }
    ];

    for (const {field, label} of incomeQueries) {
      const result = await pool.query(`
        SELECT COUNT(*) as count,
               AVG(${field}::numeric) as avg_value
        FROM communities 
        WHERE ${field} IS NOT NULL AND ${field}::text != ''
      `);
      const count = parseInt(result.rows[0].count);
      if (count > 0) {
        console.log(`📊 ${label}: ${count.toLocaleString()} communities`);
        if (result.rows[0].avg_value) {
          const avg = parseFloat(result.rows[0].avg_value);
          if (field.includes('pct')) {
            console.log(`   Average: ${avg.toFixed(1)}%`);
          } else {
            console.log(`   Average: $${avg.toFixed(0)}`);
          }
        }
      }
    }

    // 2. HUD Disability & Special Needs Data
    console.log('\n♿ HUD DISABILITY & SPECIAL NEEDS DATA:\n');
    
    const disabilityQueries = [
      {
        field: 'disabled_under_62_pct',
        label: 'Disabled residents under 62'
      },
      {
        field: 'disabled_over_62_pct', 
        label: 'Disabled residents over 62'
      },
      {
        field: 'disabled_all_pct',
        label: 'Total disabled residents'
      }
    ];

    for (const {field, label} of disabilityQueries) {
      const result = await pool.query(`
        SELECT COUNT(*) as count,
               AVG(${field}::numeric) as avg_value,
               MAX(${field}::numeric) as max_value
        FROM communities 
        WHERE ${field} IS NOT NULL
      `);
      const count = parseInt(result.rows[0].count);
      if (count > 0) {
        console.log(`♿ ${label}: ${count.toLocaleString()} communities`);
        if (result.rows[0].avg_value) {
          console.log(`   Average: ${parseFloat(result.rows[0].avg_value).toFixed(1)}%`);
          console.log(`   Maximum: ${parseFloat(result.rows[0].max_value).toFixed(1)}%`);
        }
      }
    }

    // 3. HUD Unit Mix Data
    console.log('\n🏠 HUD UNIT MIX & HOUSING DATA:\n');
    
    const unitQueries = [
      {
        field: 'studio_units_pct',
        label: 'Studio/efficiency units'
      },
      {
        field: 'one_bedroom_pct',
        label: 'One bedroom units'
      },
      {
        field: 'two_bedroom_pct',
        label: 'Two bedroom units'
      },
      {
        field: 'avg_utility_allowance',
        label: 'Average utility allowance'
      }
    ];

    for (const {field, label} of unitQueries) {
      const result = await pool.query(`
        SELECT COUNT(*) as count,
               AVG(${field}::numeric) as avg_value
        FROM communities 
        WHERE ${field} IS NOT NULL AND ${field}::text != ''
      `);
      const count = parseInt(result.rows[0].count);
      if (count > 0) {
        console.log(`🏠 ${label}: ${count.toLocaleString()} communities`);
        if (result.rows[0].avg_value) {
          const avg = parseFloat(result.rows[0].avg_value);
          if (field.includes('pct')) {
            console.log(`   Average: ${avg.toFixed(1)}%`);
          } else {
            console.log(`   Average: $${avg.toFixed(0)}`);
          }
        }
      }
    }

    // 4. HUD Demographics by Race/Ethnicity
    console.log('\n🌍 HUD DIVERSITY & INCLUSION DATA:\n');
    
    const diversityQueries = [
      {
        field: 'minority_percent',
        label: 'Minority residents'
      },
      {
        field: 'black_percent',
        label: 'Black residents'
      },
      {
        field: 'hispanic_percent',
        label: 'Hispanic residents'
      },
      {
        field: 'asian_percent',
        label: 'Asian residents'
      },
      {
        field: 'female_head_pct',
        label: 'Female-headed households'
      }
    ];

    for (const {field, label} of diversityQueries) {
      const result = await pool.query(`
        SELECT COUNT(*) as count,
               AVG(${field}::numeric) as avg_value
        FROM communities 
        WHERE ${field} IS NOT NULL
      `);
      const count = parseInt(result.rows[0].count);
      if (count > 0) {
        console.log(`🌍 ${label}: ${count.toLocaleString()} communities`);
        if (result.rows[0].avg_value) {
          console.log(`   Average: ${parseFloat(result.rows[0].avg_value).toFixed(1)}%`);
        }
      }
    }

    // 5. HUD Property Management Details
    console.log('\n🏢 HUD PROPERTY MANAGEMENT DATA:\n');
    
    const managementQueries = [
      {
        query: `SELECT COUNT(DISTINCT management_company) FROM communities WHERE management_company IS NOT NULL AND management_company != ''`,
        label: 'Unique management companies'
      },
      {
        query: `SELECT management_company, COUNT(*) as property_count 
                FROM communities 
                WHERE management_company IS NOT NULL AND management_company != ''
                GROUP BY management_company 
                ORDER BY property_count DESC 
                LIMIT 10`,
        label: 'Top 10 management companies',
        isDetail: true
      }
    ];

    for (const {query, label, isDetail} of managementQueries) {
      const result = await pool.query(query);
      if (isDetail) {
        console.log(`\n📊 ${label}:`);
        result.rows.forEach((row, index) => {
          console.log(`   ${index + 1}. ${row.management_company}: ${row.property_count} properties`);
        });
      } else {
        console.log(`🏢 ${label}: ${parseInt(result.rows[0].count).toLocaleString()}`);
      }
    }

    // 6. Community Features We Have But Don't Display
    console.log('\n\n✨ COMMUNITY FEATURES & SERVICES DATA:\n');
    
    const featureQueries = [
      {
        query: `SELECT COUNT(*) FROM communities WHERE virtual_tour_url IS NOT NULL AND virtual_tour_url != ''`,
        label: 'Communities with virtual tours'
      },
      {
        query: `SELECT COUNT(*) FROM communities WHERE array_length(amenities, 1) > 0`,
        label: 'Communities with amenities listed'
      },
      {
        query: `SELECT COUNT(*) FROM communities WHERE array_length(services, 1) > 0`,
        label: 'Communities with services listed'
      },
      {
        query: `SELECT COUNT(*) FROM communities WHERE array_length(care_types, 1) > 1`,
        label: 'Communities offering multiple care types'
      },
      {
        query: `SELECT COUNT(*) FROM communities WHERE facility_type = 'HUD-VASH'`,
        label: 'HUD-VASH veteran facilities'
      },
      {
        query: `SELECT COUNT(*) FROM communities WHERE facility_type = 'Affordable Senior'`,
        label: 'Affordable senior housing'
      }
    ];

    for (const {query, label} of featureQueries) {
      const result = await pool.query(query);
      const count = parseInt(result.rows[0].count);
      console.log(`✨ ${label}: ${count.toLocaleString()}`);
    }

    // 7. Pricing & Special Offers Data
    console.log('\n💰 PRICING & SPECIAL OFFERS DATA:\n');
    
    const pricingResult = await pool.query(`
      SELECT 
        COUNT(CASE WHEN pricing_details->>'moveInSpecials' IS NOT NULL THEN 1 END) as has_move_in_specials,
        COUNT(CASE WHEN pricing_details->>'specialOffers' IS NOT NULL THEN 1 END) as has_special_offers,
        COUNT(CASE WHEN pricing_details->>'priceBreakdown' IS NOT NULL THEN 1 END) as has_price_breakdown,
        COUNT(CASE WHEN pricing_details->>'moveInCosts' IS NOT NULL THEN 1 END) as has_move_in_costs
      FROM communities
      WHERE pricing_details IS NOT NULL
    `);

    console.log(`🎁 Communities with move-in specials: ${pricingResult.rows[0].has_move_in_specials}`);
    console.log(`🎁 Communities with special offers: ${pricingResult.rows[0].has_special_offers}`);
    console.log(`💵 Communities with price breakdown: ${pricingResult.rows[0].has_price_breakdown}`);
    console.log(`💵 Communities with move-in costs: ${pricingResult.rows[0].has_move_in_costs}`);

    // 8. Review Data from Multiple Sources
    console.log('\n⭐ REVIEW DATA FROM MULTIPLE SOURCES:\n');
    
    const reviewQueries = [
      {
        query: `SELECT COUNT(*) FROM communities WHERE yelp_rating IS NOT NULL`,
        label: 'Communities with Yelp ratings'
      },
      {
        query: `SELECT COUNT(*) FROM communities WHERE google_rating IS NOT NULL`,
        label: 'Communities with Google ratings'
      },
      {
        query: `SELECT COUNT(*) FROM communities WHERE array_length(google_review_snippets::text[], 1) > 0`,
        label: 'Communities with Google review snippets'
      },
      {
        query: `SELECT COUNT(*) FROM communities WHERE array_length(trusted_reviews::text[], 1) > 0`,
        label: 'Communities with trusted review data'
      }
    ];

    for (const {query, label} of reviewQueries) {
      const result = await pool.query(query);
      const count = parseInt(result.rows[0].count);
      console.log(`⭐ ${label}: ${count.toLocaleString()}`);
    }

    // 9. Sample communities with rich data
    console.log('\n\n🌟 EXAMPLES OF COMMUNITIES WITH RICH DATA:\n');
    
    const richDataSamples = await pool.query(`
      SELECT 
        name, city, state,
        hud_property_id,
        rent_per_month,
        occupancy_rate_hud,
        disabled_all_pct,
        management_company,
        management_phone,
        minority_percent,
        income_lt_5k_pct,
        studio_units_pct,
        one_bedroom_pct,
        two_bedroom_pct
      FROM communities 
      WHERE hud_property_id IS NOT NULL 
        AND management_company IS NOT NULL
        AND disabled_all_pct IS NOT NULL
        AND minority_percent IS NOT NULL
      ORDER BY rent_per_month ASC
      LIMIT 3
    `);

    richDataSamples.rows.forEach((community, index) => {
      console.log(`\n${index + 1}. ${community.name} - ${community.city}, ${community.state}`);
      console.log(`   💰 Rent: $${community.rent_per_month}/month`);
      console.log(`   📊 Occupancy: ${community.occupancy_rate_hud}%`);
      console.log(`   ♿ Disabled residents: ${community.disabled_all_pct}%`);
      console.log(`   🌍 Minority residents: ${community.minority_percent}%`);
      console.log(`   💵 Low income (<$5k): ${community.income_lt_5k_pct}%`);
      console.log(`   🏠 Unit mix: Studios ${community.studio_units_pct}%, 1BR ${community.one_bedroom_pct}%, 2BR ${community.two_bedroom_pct}%`);
      console.log(`   🏢 Managed by: ${community.management_company}`);
      console.log(`   📞 Management: ${community.management_phone}`);
    });

    // 10. Hidden data opportunities
    console.log('\n\n🚀 HIDDEN DATA OPPORTUNITIES:\n');
    
    const hiddenOpportunities = [
      {
        query: `SELECT COUNT(*) FROM communities WHERE months_waiting IS NOT NULL`,
        label: 'Communities with average wait time data'
      },
      {
        query: `SELECT AVG(months_waiting) FROM communities WHERE months_waiting IS NOT NULL`,
        label: 'Average wait time (months)',
        isAvg: true
      },
      {
        query: `SELECT COUNT(*) FROM communities WHERE people_per_unit IS NOT NULL`,
        label: 'Communities with occupancy density data'
      },
      {
        query: `SELECT COUNT(*) FROM communities WHERE hub_name IS NOT NULL AND hub_name != ''`,
        label: 'Communities with HUD regional hub data'
      },
      {
        query: `SELECT COUNT(*) FROM communities WHERE project_manager IS NOT NULL AND project_manager != ''`,
        label: 'Communities with HUD project manager contacts'
      }
    ];

    for (const {query, label, isAvg} of hiddenOpportunities) {
      const result = await pool.query(query);
      if (isAvg) {
        const avg = parseFloat(result.rows[0].avg);
        console.log(`⏱️ ${label}: ${avg.toFixed(1)}`);
      } else {
        const count = parseInt(result.rows[0].count);
        console.log(`🚀 ${label}: ${count.toLocaleString()}`);
      }
    }

    console.log('\n✅ Deep data discovery complete!');

  } catch (error) {
    console.error('Error during deep data discovery:', error);
  } finally {
    await pool.end();
  }
}

// Run the discovery
discoverMoreData();