/**
 * Check Healthcare Facilities Integration Status
 * Verify why healthcare facilities aren't being imported
 */

const fs = require('fs');
const csv = require('csv-parser');

const CSV_FILE = './california_facilities_20250708_044619.csv';

async function analyzeHealthcareFacilities() {
  const facilities = [];
  
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CSV_FILE)) {
      reject(new Error(`CSV file not found: ${CSV_FILE}`));
      return;
    }
    
    console.log('📊 Analyzing healthcare facilities in dataset...');
    
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on('data', (row) => {
        facilities.push(row);
      })
      .on('end', () => {
        // Analyze data sources
        const sourceCounts = {};
        const healthcareFacilities = [];
        
        facilities.forEach(facility => {
          const source = facility.data_source || 'unknown';
          sourceCounts[source] = (sourceCounts[source] || 0) + 1;
          
          if (source === 'healthcare_facilities') {
            healthcareFacilities.push(facility);
          }
        });
        
        console.log('\n📋 Data Source Analysis:');
        Object.entries(sourceCounts).forEach(([source, count]) => {
          console.log(`  ${source}: ${count} facilities`);
        });
        
        console.log('\n🏥 Healthcare Facilities Sample:');
        if (healthcareFacilities.length > 0) {
          healthcareFacilities.slice(0, 5).forEach((facility, index) => {
            console.log(`${index + 1}. ${facility.name} - ${facility.city}`);
            console.log(`   Type: ${facility.facility_type || 'N/A'}`);
            console.log(`   License: ${facility.license_number || 'N/A'}`);
            console.log('');
          });
        } else {
          console.log('   ❌ No healthcare facilities found in dataset');
        }
        
        resolve({
          total: facilities.length,
          alw: sourceCounts.alw_assisted_living || 0,
          healthcare: sourceCounts.healthcare_facilities || 0,
          healthcareFacilities
        });
      })
      .on('error', reject);
  });
}

async function main() {
  try {
    const analysis = await analyzeHealthcareFacilities();
    
    console.log('\n📊 Final Analysis:');
    console.log(`Total facilities in CSV: ${analysis.total}`);
    console.log(`ALW facilities: ${analysis.alw}`);
    console.log(`Healthcare facilities: ${analysis.healthcare}`);
    
    if (analysis.healthcare === 0) {
      console.log('\n🔍 Investigation: Why no healthcare facilities?');
      console.log('This suggests the healthcare facilities were filtered out during processing.');
      console.log('The original download showed 1,206 healthcare facilities were found.');
      console.log('They may have been filtered out during the senior living filtering process.');
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };