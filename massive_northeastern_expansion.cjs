const fs = require('fs');
const { Pool } = require('pg');

class MassiveNortheasternExpansion {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  // Get massive expansion opportunities from existing data files
  async identifyExpansionOpportunities() {
    const expansionOpportunities = [];
    
    // Check for existing large dataset files
    const potentialFiles = [
      // Major states with large populations but low current facility counts
      { state: 'PA', name: 'Pennsylvania', pattern: 'pennsylvania_*' },
      { state: 'OH', name: 'Ohio', pattern: 'ohio_*' },
      { state: 'MA', name: 'Massachusetts', pattern: 'massachusetts_*' },
      { state: 'MD', name: 'Maryland', pattern: 'maryland_*' },
      { state: 'WI', name: 'Wisconsin', pattern: 'wisconsin_*' },
      { state: 'MN', name: 'Minnesota', pattern: 'minnesota_*' },
      { state: 'IN', name: 'Indiana', pattern: 'indiana_*' },
      { state: 'MO', name: 'Missouri', pattern: 'missouri_*' },
      { state: 'CT', name: 'Connecticut', pattern: 'connecticut_*' },
      { state: 'RI', name: 'Rhode Island', pattern: 'rhode_island_*' },
      { state: 'VT', name: 'Vermont', pattern: 'vermont_*' },
      { state: 'NH', name: 'New Hampshire', pattern: 'new_hampshire_*' },
      { state: 'ME', name: 'Maine', pattern: 'maine_*' },
      { state: 'DE', name: 'Delaware', pattern: 'delaware_*' },
      { state: 'WV', name: 'West Virginia', pattern: 'west_virginia_*' },
      { state: 'KY', name: 'Kentucky', pattern: 'kentucky_*' },
      { state: 'AR', name: 'Arkansas', pattern: 'arkansas_*' },
      { state: 'KS', name: 'Kansas', pattern: 'kansas_*' },
      { state: 'NE', name: 'Nebraska', pattern: 'nebraska_*' },
      { state: 'IA', name: 'Iowa', pattern: 'iowa_*' },
      { state: 'OK', name: 'Oklahoma', pattern: 'oklahoma_*' },
      { state: 'ND', name: 'North Dakota', pattern: 'north_dakota_*' },
      { state: 'SD', name: 'South Dakota', pattern: 'south_dakota_*' },
      { state: 'AK', name: 'Alaska', pattern: 'alaska_*' }
    ];

    // Check for existing files with facility data
    try {
      const files = fs.readdirSync('.');
      
      for (const stateInfo of potentialFiles) {
        const stateFiles = files.filter(f => 
          f.includes(stateInfo.state.toLowerCase()) || 
          f.includes(stateInfo.name.toLowerCase().replace(' ', '_'))
        ).filter(f => f.endsWith('.csv') || f.endsWith('.json'));
        
        if (stateFiles.length > 0) {
          // Check file sizes to identify substantial datasets
          for (const file of stateFiles) {
            try {
              const stats = fs.statSync(file);
              if (stats.size > 1000) { // Files > 1KB likely have real data
                const rowCount = this.estimateRowCount(file);
                if (rowCount > 50) { // Look for substantial datasets
                  expansionOpportunities.push({
                    state: stateInfo.state,
                    name: stateInfo.name,
                    file: file,
                    estimatedFacilities: rowCount,
                    fileSize: stats.size
                  });
                }
              }
            } catch (e) {
              // Skip files we can't read
            }
          }
        }
      }
    } catch (error) {
      console.error('Error scanning for expansion opportunities:', error);
    }

    return expansionOpportunities.sort((a, b) => b.estimatedFacilities - a.estimatedFacilities);
  }

  // Estimate row count in CSV files
  estimateRowCount(filename) {
    try {
      if (filename.endsWith('.csv')) {
        const content = fs.readFileSync(filename, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        return Math.max(0, lines.length - 1); // Subtract header
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  // Generate comprehensive expansion report
  async generateExpansionReport() {
    console.log('🔍 SCANNING FOR MASSIVE EXPANSION OPPORTUNITIES...');
    console.log('=====================================================');
    
    const opportunities = await this.identifyExpansionOpportunities();
    
    if (opportunities.length === 0) {
      console.log('❌ No major expansion opportunities found in existing data files');
      return;
    }

    console.log(`🎯 FOUND ${opportunities.length} MAJOR EXPANSION OPPORTUNITIES:`);
    console.log('');
    
    let totalPotentialFacilities = 0;
    
    opportunities.forEach((opp, index) => {
      console.log(`${index + 1}. ${opp.name} (${opp.state})`);
      console.log(`   📄 File: ${opp.file}`);
      console.log(`   📊 Estimated Facilities: ${opp.estimatedFacilities}`);
      console.log(`   💾 File Size: ${(opp.fileSize / 1024).toFixed(1)} KB`);
      console.log('');
      
      totalPotentialFacilities += opp.estimatedFacilities;
    });

    console.log(`🚀 TOTAL POTENTIAL EXPANSION: ${totalPotentialFacilities} facilities`);
    console.log('');
    
    // Current database status
    const currentStats = await this.getCurrentStats();
    console.log(`📋 CURRENT DATABASE STATUS:`);
    console.log(`   Current communities: ${currentStats.totalCommunities}`);
    console.log(`   After full expansion: ${currentStats.totalCommunities + totalPotentialFacilities} communities`);
    console.log(`   Potential growth: ${((totalPotentialFacilities / currentStats.totalCommunities) * 100).toFixed(1)}%`);
    console.log('');
    
    console.log(`🎯 RECOMMENDED EXPANSION PRIORITY:`);
    opportunities.slice(0, 5).forEach((opp, index) => {
      console.log(`${index + 1}. ${opp.name}: ${opp.estimatedFacilities} facilities`);
    });
    
    return opportunities;
  }

  // Get current database stats
  async getCurrentStats() {
    try {
      const result = await this.pool.query('SELECT COUNT(*) as count FROM communities');
      return {
        totalCommunities: parseInt(result.rows[0].count)
      };
    } catch (error) {
      console.error('Error getting current stats:', error);
      return { totalCommunities: 0 };
    }
  }

  async close() {
    await this.pool.end();
  }
}

// Execute expansion opportunity analysis
async function main() {
  const expansion = new MassiveNortheasternExpansion();
  
  try {
    await expansion.generateExpansionReport();
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  } finally {
    await expansion.close();
  }
}

main().catch(console.error);