/**
 * Data Quality Check Script
 * Comprehensive analysis of all community data in MySeniorValet
 */

import { db } from '../db';
import { communities } from '../../shared/schema';
import { sql } from 'drizzle-orm';

interface DataQualityReport {
  timestamp: string;
  totalCommunities: number;
  duplicates: {
    count: number;
    examples: any[];
  };
  missingData: {
    missingNames: number;
    missingAddresses: number;
    missingCities: number;
    missingStates: number;
    missingPhones: number;
    missingCareTypes: number;
    missingCoordinates: number;
  };
  dataCompleteness: {
    withPhone: number;
    withEmail: number;
    withWebsite: number;
    withDescription: number;
    withCoordinates: number;
    withCareTypes: number;
    withPricing: number;
  };
  coordinateAccuracy: {
    validCoordinates: number;
    invalidCoordinates: number;
    zeroCoordinates: number;
    outOfBounds: number;
  };
  careTypeAnalysis: {
    distribution: Record<string, number>;
    communitiesWithMultipleCareTypes: number;
    averageCareTypesPerCommunity: number;
  };
  stateDistribution: Record<string, number>;
  hudProperties: {
    total: number;
    withPricing: number;
    priceRange: {
      min: number;
      max: number;
      average: number;
    };
  };
  phoneNumberQuality: {
    valid10Digit: number;
    validWithFormatting: number;
    invalid: number;
    duplicatePhones: number;
  };
  dataAnomalies: {
    suspiciousNames: any[];
    testData: any[];
    placeholderData: any[];
  };
}

async function checkDataQuality(): Promise<DataQualityReport> {
  console.log('🔍 Starting comprehensive data quality check...');

  // Get all communities
  const allCommunities = await db.select().from(communities);
  const totalCount = allCommunities.length;

  console.log(`📊 Analyzing ${totalCount} communities...`);

  // Check for duplicates
  const duplicateCheck = await db.execute(sql`
    SELECT name, address, city, state, COUNT(*) as count
    FROM communities
    GROUP BY name, address, city, state
    HAVING COUNT(*) > 1
    ORDER BY count DESC
    LIMIT 10
  `);

  // Check missing data
  const missingData = {
    missingNames: allCommunities.filter(c => !c.name || c.name.trim() === '').length,
    missingAddresses: allCommunities.filter(c => !c.address || c.address.trim() === '').length,
    missingCities: allCommunities.filter(c => !c.city || c.city.trim() === '').length,
    missingStates: allCommunities.filter(c => !c.state || c.state.trim() === '').length,
    missingPhones: allCommunities.filter(c => !c.phone || c.phone.trim() === '').length,
    missingCareTypes: allCommunities.filter(c => !c.careTypes || c.careTypes.length === 0).length,
    missingCoordinates: allCommunities.filter(c => !c.latitude || !c.longitude).length,
  };

  // Check data completeness
  const dataCompleteness = {
    withPhone: allCommunities.filter(c => c.phone && c.phone.trim() !== '').length,
    withEmail: allCommunities.filter(c => c.email && c.email.trim() !== '').length,
    withWebsite: allCommunities.filter(c => c.website && c.website.trim() !== '').length,
    withDescription: allCommunities.filter(c => c.description && c.description.trim() !== '').length,
    withCoordinates: allCommunities.filter(c => c.latitude && c.longitude).length,
    withCareTypes: allCommunities.filter(c => c.careTypes && c.careTypes.length > 0).length,
    withPricing: allCommunities.filter(c => 
      (c.avgCost && c.avgCost > 0) || 
      (c.hudMinRent && c.hudMinRent > 0) || 
      c.priceInfo
    ).length,
  };

  // Check coordinate accuracy
  const coordinateAccuracy = {
    validCoordinates: 0,
    invalidCoordinates: 0,
    zeroCoordinates: 0,
    outOfBounds: 0,
  };

  allCommunities.forEach(c => {
    if (!c.latitude || !c.longitude) {
      coordinateAccuracy.invalidCoordinates++;
    } else if (c.latitude === 0 && c.longitude === 0) {
      coordinateAccuracy.zeroCoordinates++;
    } else if (
      c.latitude < -90 || c.latitude > 90 ||
      c.longitude < -180 || c.longitude > 180
    ) {
      coordinateAccuracy.outOfBounds++;
    } else {
      coordinateAccuracy.validCoordinates++;
    }
  });

  // Care type analysis
  const careTypeDistribution: Record<string, number> = {};
  let totalCareTypes = 0;

  allCommunities.forEach(c => {
    if (c.careTypes && Array.isArray(c.careTypes)) {
      c.careTypes.forEach(type => {
        careTypeDistribution[type] = (careTypeDistribution[type] || 0) + 1;
        totalCareTypes++;
      });
    }
  });

  const communitiesWithCareTypes = allCommunities.filter(c => c.careTypes && c.careTypes.length > 0).length;
  const avgCareTypes = communitiesWithCareTypes > 0 ? totalCareTypes / communitiesWithCareTypes : 0;

  // State distribution
  const stateDistribution: Record<string, number> = {};
  allCommunities.forEach(c => {
    if (c.state) {
      stateDistribution[c.state] = (stateDistribution[c.state] || 0) + 1;
    }
  });

  // HUD properties analysis
  const hudProperties = allCommunities.filter(c => c.hudPropertyType === 'low_income');
  const hudWithPricing = hudProperties.filter(c => c.hudMinRent && c.hudMinRent > 0);
  
  let minPrice = Infinity;
  let maxPrice = 0;
  let totalPrice = 0;
  let priceCount = 0;

  hudWithPricing.forEach(c => {
    if (c.hudMinRent) {
      minPrice = Math.min(minPrice, c.hudMinRent);
      maxPrice = Math.max(maxPrice, c.hudMaxRent || c.hudMinRent);
      totalPrice += c.hudMinRent;
      priceCount++;
    }
  });

  // Phone number quality
  const phoneNumberQuality = {
    valid10Digit: 0,
    validWithFormatting: 0,
    invalid: 0,
    duplicatePhones: 0,
  };

  const phoneNumbers = new Set<string>();
  const duplicatePhones = new Set<string>();

  allCommunities.forEach(c => {
    if (c.phone) {
      const cleanPhone = c.phone.replace(/\D/g, '');
      
      if (phoneNumbers.has(cleanPhone)) {
        duplicatePhones.add(cleanPhone);
        phoneNumberQuality.duplicatePhones++;
      }
      phoneNumbers.add(cleanPhone);

      if (cleanPhone.length === 10) {
        phoneNumberQuality.valid10Digit++;
      } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
        phoneNumberQuality.validWithFormatting++;
      } else if (cleanPhone.length > 0) {
        phoneNumberQuality.invalid++;
      }
    }
  });

  // Check for suspicious/test data
  const suspiciousPatterns = [
    /test/i,
    /demo/i,
    /sample/i,
    /example/i,
    /placeholder/i,
    /xxx/i,
    /fake/i,
    /dummy/i,
  ];

  const dataAnomalies = {
    suspiciousNames: allCommunities.filter(c => 
      c.name && suspiciousPatterns.some(pattern => pattern.test(c.name))
    ).slice(0, 10),
    testData: allCommunities.filter(c =>
      (c.name && c.name.toLowerCase().includes('test')) ||
      (c.address && c.address.toLowerCase().includes('test'))
    ).slice(0, 10),
    placeholderData: allCommunities.filter(c =>
      c.phone === '000-000-0000' ||
      c.phone === '123-456-7890' ||
      c.email === 'test@test.com' ||
      c.email === 'example@example.com'
    ).slice(0, 10),
  };

  const report: DataQualityReport = {
    timestamp: new Date().toISOString(),
    totalCommunities: totalCount,
    duplicates: {
      count: duplicateCheck.rows.length,
      examples: duplicateCheck.rows.slice(0, 5),
    },
    missingData,
    dataCompleteness,
    coordinateAccuracy,
    careTypeAnalysis: {
      distribution: careTypeDistribution,
      communitiesWithMultipleCareTypes: allCommunities.filter(c => 
        c.careTypes && c.careTypes.length > 1
      ).length,
      averageCareTypesPerCommunity: Number(avgCareTypes.toFixed(2)),
    },
    stateDistribution,
    hudProperties: {
      total: hudProperties.length,
      withPricing: hudWithPricing.length,
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice,
        average: priceCount > 0 ? Math.round(totalPrice / priceCount) : 0,
      },
    },
    phoneNumberQuality,
    dataAnomalies,
  };

  // Generate summary
  console.log('\n📊 DATA QUALITY REPORT SUMMARY');
  console.log('================================');
  console.log(`Total Communities: ${report.totalCommunities}`);
  console.log(`Duplicates Found: ${report.duplicates.count}`);
  console.log(`\n✅ Data Completeness:`);
  console.log(`  - With Phone: ${report.dataCompleteness.withPhone} (${(report.dataCompleteness.withPhone / totalCount * 100).toFixed(1)}%)`);
  console.log(`  - With Coordinates: ${report.dataCompleteness.withCoordinates} (${(report.dataCompleteness.withCoordinates / totalCount * 100).toFixed(1)}%)`);
  console.log(`  - With Care Types: ${report.dataCompleteness.withCareTypes} (${(report.dataCompleteness.withCareTypes / totalCount * 100).toFixed(1)}%)`);
  console.log(`  - With Pricing: ${report.dataCompleteness.withPricing} (${(report.dataCompleteness.withPricing / totalCount * 100).toFixed(1)}%)`);
  console.log(`\n🚨 Data Issues:`);
  console.log(`  - Missing Names: ${report.missingData.missingNames}`);
  console.log(`  - Missing Phones: ${report.missingData.missingPhones}`);
  console.log(`  - Invalid Coordinates: ${report.coordinateAccuracy.invalidCoordinates}`);
  console.log(`  - Suspicious Data: ${report.dataAnomalies.suspiciousNames.length + report.dataAnomalies.testData.length}`);
  console.log(`\n🏘️ HUD Properties:`);
  console.log(`  - Total: ${report.hudProperties.total}`);
  console.log(`  - With Pricing: ${report.hudProperties.withPricing}`);
  console.log(`  - Price Range: $${report.hudProperties.priceRange.min} - $${report.hudProperties.priceRange.max}`);

  return report;
}

// Execute if run directly
checkDataQuality()
  .then(report => {
    console.log('\n✅ Data quality check completed!');
    console.log('\nFull report saved to: data-quality-report.json');
    import('fs').then(fs => {
      fs.writeFileSync(
        'data-quality-report.json',
        JSON.stringify(report, null, 2)
      );
    });
  })
  .catch(error => {
    console.error('❌ Data quality check failed:', error);
    process.exit(1);
  });

export { checkDataQuality, DataQualityReport };