const fs = require('fs');
const { Pool } = require('pg');

class SystematicCountyDiscovery {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  // Complete county lists for systematic discovery
  getCompleteCountyList() {
    return {
      'NY': [
        'Albany', 'Allegany', 'Bronx', 'Broome', 'Cattaraugus', 'Cayuga', 'Chautauqua', 'Chemung',
        'Chenango', 'Clinton', 'Columbia', 'Cortland', 'Delaware', 'Dutchess', 'Erie', 'Essex',
        'Franklin', 'Fulton', 'Genesee', 'Greene', 'Hamilton', 'Herkimer', 'Jefferson', 'Kings',
        'Lewis', 'Livingston', 'Madison', 'Monroe', 'Montgomery', 'Nassau', 'New York', 'Niagara',
        'Oneida', 'Onondaga', 'Ontario', 'Orange', 'Orleans', 'Oswego', 'Otsego', 'Putnam',
        'Queens', 'Rensselaer', 'Richmond', 'Rockland', 'Saratoga', 'Schenectady', 'Schoharie',
        'Schuyler', 'Seneca', 'St. Lawrence', 'Steuben', 'Suffolk', 'Sullivan', 'Tioga',
        'Tompkins', 'Ulster', 'Warren', 'Washington', 'Wayne', 'Westchester', 'Wyoming', 'Yates'
      ],
      'IL': [
        'Adams', 'Alexander', 'Bond', 'Boone', 'Brown', 'Bureau', 'Calhoun', 'Carroll', 'Cass',
        'Champaign', 'Christian', 'Clark', 'Clay', 'Clinton', 'Coles', 'Cook', 'Crawford',
        'Cumberland', 'DeKalb', 'De Witt', 'Douglas', 'DuPage', 'Edgar', 'Edwards', 'Effingham',
        'Fayette', 'Ford', 'Franklin', 'Fulton', 'Gallatin', 'Greene', 'Grundy', 'Hamilton',
        'Hancock', 'Hardin', 'Henderson', 'Henry', 'Iroquois', 'Jackson', 'Jasper', 'Jefferson',
        'Jersey', 'Jo Daviess', 'Johnson', 'Kane', 'Kankakee', 'Kendall', 'Knox', 'Lake',
        'LaSalle', 'Lawrence', 'Lee', 'Livingston', 'Logan', 'McDonough', 'McHenry', 'McLean',
        'Macon', 'Macoupin', 'Madison', 'Marion', 'Marshall', 'Mason', 'Massac', 'Menard',
        'Mercer', 'Monroe', 'Montgomery', 'Morgan', 'Moultrie', 'Ogle', 'Peoria', 'Perry',
        'Piatt', 'Pike', 'Pope', 'Pulaski', 'Putnam', 'Randolph', 'Richland', 'Rock Island',
        'Saline', 'Sangamon', 'Schuyler', 'Scott', 'Shelby', 'St. Clair', 'Stark', 'Stephenson',
        'Tazewell', 'Union', 'Vermilion', 'Wabash', 'Warren', 'Washington', 'Wayne', 'White',
        'Whiteside', 'Will', 'Williamson', 'Winnebago', 'Woodford'
      ]
    };
  }

  // Get major cities for each county (for facility discovery)
  getCountyCities() {
    return {
      'NY': {
        'Albany': ['Albany', 'Cohoes', 'Watervliet'],
        'Allegany': ['Wellsville', 'Belmont', 'Angelica'],
        'Bronx': ['Bronx'],
        'Broome': ['Binghamton', 'Johnson City', 'Endicott'],
        'Cattaraugus': ['Olean', 'Salamanca', 'Ellicottville'],
        'Cayuga': ['Auburn', 'Fulton', 'Weedsport'],
        'Chautauqua': ['Jamestown', 'Dunkirk', 'Fredonia'],
        'Chemung': ['Elmira', 'Horseheads', 'Millport'],
        'Chenango': ['Norwich', 'Oxford', 'Greene'],
        'Clinton': ['Plattsburgh', 'Champlain', 'Dannemora'],
        'Columbia': ['Hudson', 'Kinderhook', 'Chatham'],
        'Cortland': ['Cortland', 'Homer', 'Marathon'],
        'Delaware': ['Delhi', 'Walton', 'Sidney'],
        'Dutchess': ['Poughkeepsie', 'Beacon', 'Rhinebeck'],
        'Erie': ['Buffalo', 'Cheektowaga', 'West Seneca'],
        'Essex': ['Ticonderoga', 'Elizabethtown', 'Lake Placid'],
        'Franklin': ['Malone', 'Tupper Lake', 'Saranac Lake'],
        'Fulton': ['Gloversville', 'Johnstown', 'Mayfield'],
        'Genesee': ['Batavia', 'Le Roy', 'Oakfield'],
        'Greene': ['Catskill', 'Coxsackie', 'Hunter'],
        'Hamilton': ['Lake Pleasant', 'Indian Lake', 'Wells'],
        'Herkimer': ['Herkimer', 'Little Falls', 'Ilion'],
        'Jefferson': ['Watertown', 'Fort Drum', 'Carthage'],
        'Kings': ['Brooklyn'],
        'Lewis': ['Lowville', 'Lyons Falls', 'Constableville'],
        'Livingston': ['Geneseo', 'Dansville', 'Mount Morris'],
        'Madison': ['Oneida', 'Canastota', 'Cazenovia'],
        'Monroe': ['Rochester', 'Greece', 'Irondequoit'],
        'Montgomery': ['Amsterdam', 'Fonda', 'Canajoharie'],
        'Nassau': ['Hempstead', 'Levittown', 'Freeport'],
        'New York': ['Manhattan', 'New York City'],
        'Niagara': ['Niagara Falls', 'North Tonawanda', 'Lockport'],
        'Oneida': ['Utica', 'Rome', 'Sherrill'],
        'Onondaga': ['Syracuse', 'Liverpool', 'Cicero'],
        'Ontario': ['Canandaigua', 'Geneva', 'Victor'],
        'Orange': ['Newburgh', 'Middletown', 'Port Jervis'],
        'Orleans': ['Albion', 'Medina', 'Holley'],
        'Oswego': ['Oswego', 'Fulton', 'Mexico'],
        'Otsego': ['Cooperstown', 'Oneonta', 'Richfield Springs'],
        'Putnam': ['Carmel', 'Brewster', 'Cold Spring'],
        'Queens': ['Queens'],
        'Rensselaer': ['Troy', 'Rensselaer', 'Hoosick'],
        'Richmond': ['Staten Island'],
        'Rockland': ['New City', 'Spring Valley', 'Suffern'],
        'Saratoga': ['Saratoga Springs', 'Ballston Spa', 'Mechanicville'],
        'Schenectady': ['Schenectady', 'Rotterdam', 'Niskayuna'],
        'Schoharie': ['Schoharie', 'Cobleskill', 'Middleburgh'],
        'Schuyler': ['Watkins Glen', 'Montour Falls', 'Burdett'],
        'Seneca': ['Waterloo', 'Seneca Falls', 'Ovid'],
        'St. Lawrence': ['Canton', 'Potsdam', 'Massena'],
        'Steuben': ['Corning', 'Hornell', 'Bath'],
        'Suffolk': ['Huntington', 'Brookhaven', 'Islip'],
        'Sullivan': ['Monticello', 'Liberty', 'Fallsburg'],
        'Tioga': ['Owego', 'Newark Valley', 'Nichols'],
        'Tompkins': ['Ithaca', 'Dryden', 'Groton'],
        'Ulster': ['Kingston', 'New Paltz', 'Saugerties'],
        'Warren': ['Glens Falls', 'Queensbury', 'Lake George'],
        'Washington': ['Hudson Falls', 'Granville', 'Whitehall'],
        'Wayne': ['Lyons', 'Newark', 'Clyde'],
        'Westchester': ['Yonkers', 'New Rochelle', 'Mount Vernon'],
        'Wyoming': ['Warsaw', 'Perry', 'Attica'],
        'Yates': ['Penn Yan', 'Dundee', 'Rushville']
      }
    };
  }

  // Identify missing counties for a state
  async identifyMissingCounties(state) {
    const allCounties = this.getCompleteCountyList()[state] || [];
    
    // Get currently covered counties
    const coveredQuery = `
      SELECT DISTINCT county 
      FROM communities 
      WHERE state = $1 
      AND county IS NOT NULL 
      AND county != ''
    `;
    
    const result = await this.pool.query(coveredQuery, [state]);
    const coveredCounties = result.rows.map(row => row.county);
    
    // Find missing counties
    const missingCounties = allCounties.filter(county => !coveredCounties.includes(county));
    
    return {
      allCounties: allCounties.length,
      coveredCounties: coveredCounties.length,
      missing: missingCounties,
      covered: coveredCounties
    };
  }

  // Generate facility discovery targets for missing counties
  async generateDiscoveryTargets(state) {
    const analysis = await this.identifyMissingCounties(state);
    const countyCities = this.getCountyCities()[state] || {};
    
    const discoveryTargets = [];
    
    for (const county of analysis.missing) {
      const cities = countyCities[county] || [county];
      
      discoveryTargets.push({
        county: county,
        state: state,
        cities: cities,
        searchTerms: this.generateSearchTerms(cities),
        priority: this.calculatePriority(county, cities)
      });
    }
    
    // Sort by priority (high population counties first)
    discoveryTargets.sort((a, b) => b.priority - a.priority);
    
    return {
      analysis,
      targets: discoveryTargets
    };
  }

  // Generate search terms for facility discovery
  generateSearchTerms(cities) {
    const facilityTypes = [
      'senior living', 'assisted living', 'memory care', 'nursing home',
      'retirement community', 'skilled nursing', 'continuing care', 'adult home',
      'enriched housing', 'senior housing', 'independent living'
    ];
    
    const terms = [];
    
    for (const city of cities) {
      for (const type of facilityTypes) {
        terms.push(`${type} ${city}`);
        terms.push(`${city} ${type}`);
      }
    }
    
    return terms;
  }

  // Calculate priority based on population estimates
  calculatePriority(county, cities) {
    const highPriority = ['Nassau', 'Suffolk', 'Westchester', 'Erie', 'Monroe', 'Onondaga', 'Oneida'];
    const mediumPriority = ['Albany', 'Dutchess', 'Orange', 'Rockland', 'Saratoga', 'Schenectady'];
    
    if (highPriority.includes(county)) return 10;
    if (mediumPriority.includes(county)) return 7;
    if (cities.length > 2) return 5;
    return 3;
  }

  // Generate comprehensive county discovery report
  async generateDiscoveryReport(state) {
    const discovery = await this.generateDiscoveryTargets(state);
    const stateName = this.getStateName(state);
    
    console.log(`\n🎯 SYSTEMATIC COUNTY DISCOVERY REPORT - ${stateName}`);
    console.log('='.repeat(60));
    
    console.log(`\n📊 COVERAGE STATUS:`);
    console.log(`   Total Counties: ${discovery.analysis.allCounties}`);
    console.log(`   Covered Counties: ${discovery.analysis.coveredCounties}`);
    console.log(`   Missing Counties: ${discovery.analysis.missing.length}`);
    console.log(`   Coverage: ${((discovery.analysis.coveredCounties / discovery.analysis.allCounties) * 100).toFixed(1)}%`);
    
    console.log(`\n✅ CURRENTLY COVERED COUNTIES:`);
    discovery.analysis.covered.forEach(county => {
      console.log(`   • ${county}`);
    });
    
    console.log(`\n🔍 MISSING COUNTIES REQUIRING DISCOVERY:`);
    discovery.targets.forEach((target, index) => {
      console.log(`   ${index + 1}. ${target.county} (Priority: ${target.priority})`);
      console.log(`      Cities: ${target.cities.join(', ')}`);
      console.log(`      Search Terms: ${target.searchTerms.slice(0, 3).join(', ')}...`);
    });
    
    console.log(`\n🎯 NEXT STEPS FOR 100% COVERAGE:`);
    console.log(`   1. Focus on high-priority counties (Priority 10)`);
    console.log(`   2. Use systematic facility discovery for each missing county`);
    console.log(`   3. Expand data sources beyond current NY Department of Health`);
    console.log(`   4. Target multiple facility types per county`);
    console.log(`   5. Verify county boundaries and city assignments`);
    
    return discovery;
  }

  // Create systematic discovery plan
  async createDiscoveryPlan(state) {
    const discovery = await this.generateDiscoveryTargets(state);
    
    const plan = {
      state: state,
      stateName: this.getStateName(state),
      timestamp: new Date().toISOString(),
      currentCoverage: {
        total: discovery.analysis.allCounties,
        covered: discovery.analysis.coveredCounties,
        missing: discovery.analysis.missing.length,
        percentage: ((discovery.analysis.coveredCounties / discovery.analysis.allCounties) * 100).toFixed(1)
      },
      discoveryTargets: discovery.targets,
      recommendations: {
        immediate: discovery.targets.filter(t => t.priority >= 7),
        secondary: discovery.targets.filter(t => t.priority >= 5 && t.priority < 7),
        tertiary: discovery.targets.filter(t => t.priority < 5)
      }
    };
    
    // Save plan to file
    const filename = `${state.toLowerCase()}_county_discovery_plan_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.json`;
    fs.writeFileSync(filename, JSON.stringify(plan, null, 2));
    
    console.log(`\n💾 Discovery plan saved to: ${filename}`);
    
    return plan;
  }

  getStateName(code) {
    const names = {
      'NY': 'New York',
      'IL': 'Illinois'
    };
    return names[code] || code;
  }

  async close() {
    await this.pool.end();
  }
}

// Execute systematic county discovery
async function main() {
  const discovery = new SystematicCountyDiscovery();
  
  try {
    // Focus on Illinois for 100% coverage next
    console.log('🚀 SYSTEMATIC COUNTY DISCOVERY SYSTEM');
    console.log('====================================');
    
    await discovery.generateDiscoveryReport('IL');
    const plan = await discovery.createDiscoveryPlan('IL');
    
    console.log(`\n🎯 IMMEDIATE ACTION PLAN:`);
    console.log(`   High Priority Counties: ${plan.recommendations.immediate.length}`);
    console.log(`   Medium Priority Counties: ${plan.recommendations.secondary.length}`);
    console.log(`   Lower Priority Counties: ${plan.recommendations.tertiary.length}`);
    
    console.log(`\n📋 READY FOR SYSTEMATIC EXPANSION:`);
    console.log(`   ✅ Discovery targets identified`);
    console.log(`   ✅ Search terms generated`);
    console.log(`   ✅ Priority ranking completed`);
    console.log(`   ✅ Implementation plan created`);
    
  } catch (error) {
    console.error('❌ Discovery failed:', error);
  } finally {
    await discovery.close();
  }
}

main().catch(console.error);