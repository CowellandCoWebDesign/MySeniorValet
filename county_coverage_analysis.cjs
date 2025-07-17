const { Pool } = require('pg');

class CountyCoverageAnalysis {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  // Total counties per state (official counts)
  getStateCountyTotals() {
    return {
      'NY': 62,  // New York has 62 counties
      'PA': 67,  // Pennsylvania has 67 counties
      'OH': 88,  // Ohio has 88 counties
      'MI': 83,  // Michigan has 83 counties
      'IL': 102  // Illinois has 102 counties
    };
  }

  // Analyze county coverage for recent expansion states
  async analyzeCoverageGaps() {
    const stateTotals = this.getStateCountyTotals();
    const expansionStates = ['NY', 'PA', 'OH', 'MI', 'IL'];
    
    console.log('🔍 COUNTY COVERAGE ANALYSIS FOR RECENT EXPANSION STATES');
    console.log('========================================================');
    
    for (const state of expansionStates) {
      try {
        // Get covered counties
        const coveredQuery = `
          SELECT DISTINCT county 
          FROM communities 
          WHERE state = $1 
          AND county IS NOT NULL 
          AND county != ''
          ORDER BY county
        `;
        
        const coveredResult = await this.pool.query(coveredQuery, [state]);
        const coveredCounties = coveredResult.rows.map(row => row.county);
        
        // Get facility count per county
        const facilityQuery = `
          SELECT county, COUNT(*) as facilities 
          FROM communities 
          WHERE state = $1 
          AND county IS NOT NULL 
          AND county != ''
          GROUP BY county
          ORDER BY facilities DESC
        `;
        
        const facilityResult = await this.pool.query(facilityQuery, [state]);
        
        const totalCounties = stateTotals[state];
        const coveredCount = coveredCounties.length;
        const coveragePercent = ((coveredCount / totalCounties) * 100).toFixed(1);
        
        console.log(`\n📊 ${this.getStateName(state)} (${state})`);
        console.log(`   Counties Covered: ${coveredCount}/${totalCounties} (${coveragePercent}%)`);
        console.log(`   Total Facilities: ${facilityResult.rows.reduce((sum, row) => sum + parseInt(row.facilities), 0)}`);
        
        // Show top counties by facility count
        console.log(`   Top Counties by Facilities:`);
        facilityResult.rows.slice(0, 5).forEach((row, index) => {
          console.log(`     ${index + 1}. ${row.county}: ${row.facilities} facilities`);
        });
        
        // Calculate coverage gap
        const missingCount = totalCounties - coveredCount;
        if (missingCount > 0) {
          console.log(`   ⚠️  Missing ${missingCount} counties (${(100 - parseFloat(coveragePercent)).toFixed(1)}% gap)`);
        } else {
          console.log(`   ✅ Complete county coverage achieved!`);
        }
      } catch (error) {
        console.error(`❌ Error analyzing ${state}:`, error.message);
      }
    }
    
    // Overall summary
    console.log('\n📋 OVERALL COVERAGE SUMMARY');
    console.log('===========================');
    
    let totalStateCounties = 0;
    let totalCoveredCounties = 0;
    let totalFacilities = 0;
    
    for (const state of expansionStates) {
      const stateTotal = stateTotals[state];
      const coveredResult = await this.pool.query(
        'SELECT COUNT(DISTINCT county) as covered FROM communities WHERE state = $1 AND county IS NOT NULL AND county != \'\'',
        [state]
      );
      const facilityResult = await this.pool.query(
        'SELECT COUNT(*) as facilities FROM communities WHERE state = $1',
        [state]
      );
      
      totalStateCounties += stateTotal;
      totalCoveredCounties += parseInt(coveredResult.rows[0].covered);
      totalFacilities += parseInt(facilityResult.rows[0].facilities);
    }
    
    const overallCoverage = ((totalCoveredCounties / totalStateCounties) * 100).toFixed(1);
    
    console.log(`📊 Combined Statistics:`);
    console.log(`   Total Counties: ${totalCoveredCounties}/${totalStateCounties} (${overallCoverage}%)`);
    console.log(`   Total Facilities: ${totalFacilities}`);
    console.log(`   States Analyzed: ${expansionStates.length}`);
    
    if (overallCoverage < 50) {
      console.log(`\n🎯 EXPANSION RECOMMENDATION: Major county coverage gaps detected`);
      console.log(`   Priority: Expand data collection to achieve 75%+ county coverage`);
      console.log(`   Missing: ${totalStateCounties - totalCoveredCounties} counties need facility discovery`);
    } else if (overallCoverage < 75) {
      console.log(`\n🎯 EXPANSION RECOMMENDATION: Good foundation, continue targeted expansion`);
      console.log(`   Priority: Focus on major metropolitan counties with missing coverage`);
    } else {
      console.log(`\n✅ EXCELLENT COVERAGE: Strong county representation achieved`);
      console.log(`   Status: Ready for facility count expansion within existing counties`);
    }
  }

  getStateName(code) {
    const names = {
      'NY': 'New York',
      'PA': 'Pennsylvania', 
      'OH': 'Ohio',
      'MI': 'Michigan',
      'IL': 'Illinois'
    };
    return names[code] || code;
  }

  async close() {
    await this.pool.end();
  }
}

// Execute county coverage analysis
async function main() {
  const analyzer = new CountyCoverageAnalysis();
  
  try {
    await analyzer.analyzeCoverageGaps();
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  } finally {
    await analyzer.close();
  }
}

main().catch(console.error);