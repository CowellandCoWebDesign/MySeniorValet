/**
 * Data Standardization Initiative
 * ================================
 * Comprehensive cleanup script to fix data quality issues in MySeniorValet database
 * 
 * Issues addressed:
 * 1. Remove emoji flags from international communities
 * 2. Remove markdown asterisks from names
 * 3. Fix broken website URLs (markdown formatting, trailing commas)
 * 4. Standardize generic names with location identifiers
 * 5. Clean up special characters that prevent AI enrichment
 * 
 * Created: August 27, 2025
 */

import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, sql, isNotNull, or, like, and } from "drizzle-orm";

interface CleanupStats {
  totalCommunities: number;
  namesFixed: number;
  websitesFixed: number;
  phonesFixed: number;
  descriptionsFixed: number;
  internationalFixed: number;
  genericNamesFixed: number;
}

class DataStandardizationService {
  private stats: CleanupStats = {
    totalCommunities: 0,
    namesFixed: 0,
    websitesFixed: 0,
    phonesFixed: 0,
    descriptionsFixed: 0,
    internationalFixed: 0,
    genericNamesFixed: 0
  };

  /**
   * Clean community name from special characters and formatting
   */
  private cleanName(name: string): string {
    let cleaned = name;
    
    // Remove emoji flags (🇦🇺, 🇨🇦, 🇲🇽, etc.)
    cleaned = cleaned.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '').trim();
    
    // Remove markdown asterisks
    cleaned = cleaned.replace(/\*\*/g, '');
    
    // Remove extra spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Fix common formatting issues
    cleaned = cleaned
      .replace(/\s*\(\s*multiple\s*locations\s*\)/gi, '') // Remove "(multiple locations)"
      .replace(/\s*communities$/i, '') // Remove trailing "communities"
      .replace(/\s*-\s*$/, '') // Remove trailing dashes
      .trim();
    
    return cleaned;
  }

  /**
   * Clean website URL from markdown and formatting issues
   */
  private cleanWebsite(website: string | null): string | null {
    if (!website) return null;
    
    let cleaned = website;
    
    // Fix markdown link syntax: ](https://example.com) -> https://example.com
    const markdownMatch = cleaned.match(/\]\((https?:\/\/[^\)]+)\)/);
    if (markdownMatch) {
      cleaned = markdownMatch[1];
    }
    
    // Remove trailing commas, periods, semicolons
    cleaned = cleaned.replace(/[,;.\s]+$/, '');
    
    // Remove leading/trailing brackets
    cleaned = cleaned.replace(/^\[|\]$/g, '');
    
    // Ensure proper protocol
    if (cleaned && !cleaned.startsWith('http')) {
      cleaned = 'https://' + cleaned;
    }
    
    // Validate URL format
    try {
      new URL(cleaned);
      return cleaned;
    } catch {
      console.log(`Invalid URL after cleaning: ${cleaned} (original: ${website})`);
      return null;
    }
  }

  /**
   * Clean phone number formatting
   */
  private cleanPhone(phone: string | null): string | null {
    if (!phone) return null;
    
    // Remove extra spaces and formatting
    let cleaned = phone.trim();
    
    // Standardize international format
    cleaned = cleaned
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/^\+1\s*/, '') // Remove US country code for consistency
      .replace(/[^\d\s\-\(\)\+]/g, ''); // Keep only digits and basic formatting
    
    return cleaned || null;
  }

  /**
   * Add location identifier to generic names
   */
  private standardizeName(name: string, city: string, state: string): string {
    const cleanedName = this.cleanName(name);
    
    // Check if name is too generic
    const genericPatterns = [
      /^(Brookdale|Atria|Sunrise)(\s+Senior\s+Living)?$/i,
      /^(The\s+)?Senior\s+Living$/i,
      /^Assisted\s+Living$/i,
      /^Memory\s+Care$/i
    ];
    
    const isGeneric = genericPatterns.some(pattern => pattern.test(cleanedName));
    
    if (isGeneric) {
      // Add location to make it specific
      return `${cleanedName} - ${city}`;
    }
    
    return cleanedName;
  }

  /**
   * Main cleanup function
   */
  async standardizeAllData(): Promise<CleanupStats> {
    console.log('🚀 Starting Data Standardization Initiative...\n');
    
    // Get all communities
    const allCommunities = await db.select().from(communities);
    this.stats.totalCommunities = allCommunities.length;
    
    console.log(`📊 Found ${this.stats.totalCommunities} communities to process\n`);
    
    // Process in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < allCommunities.length; i += batchSize) {
      const batch = allCommunities.slice(i, i + batchSize);
      
      for (const community of batch) {
        let hasChanges = false;
        const updates: any = {};
        
        // Clean name
        const originalName = community.name;
        const cleanedName = this.standardizeName(
          community.name, 
          community.city, 
          community.state
        );
        
        if (originalName !== cleanedName) {
          updates.name = cleanedName;
          hasChanges = true;
          this.stats.namesFixed++;
          
          // Check if it's an international community with emoji
          if (originalName.match(/[\u{1F1E0}-\u{1F1FF}]/gu)) {
            this.stats.internationalFixed++;
          }
          
          // Check if it was a generic name
          if (cleanedName.includes(' - ')) {
            this.stats.genericNamesFixed++;
          }
        }
        
        // Clean French name if exists
        if (community.nameFr) {
          const cleanedNameFr = this.cleanName(community.nameFr);
          if (community.nameFr !== cleanedNameFr) {
            updates.nameFr = cleanedNameFr;
            hasChanges = true;
          }
        }
        
        // Clean website
        if (community.website) {
          const cleanedWebsite = this.cleanWebsite(community.website);
          if (community.website !== cleanedWebsite) {
            updates.website = cleanedWebsite;
            hasChanges = true;
            this.stats.websitesFixed++;
          }
        }
        
        // Clean phone
        if (community.phone) {
          const cleanedPhone = this.cleanPhone(community.phone);
          if (community.phone !== cleanedPhone) {
            updates.phone = cleanedPhone;
            hasChanges = true;
            this.stats.phonesFixed++;
          }
        }
        
        // Clean description
        if (community.description) {
          const cleanedDescription = community.description
            .replace(/\*\*/g, '') // Remove markdown
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
          
          if (community.description !== cleanedDescription) {
            updates.description = cleanedDescription;
            hasChanges = true;
            this.stats.descriptionsFixed++;
          }
        }
        
        // Update if changes were made
        if (hasChanges) {
          await db.update(communities)
            .set(updates)
            .where(eq(communities.id, community.id));
        }
      }
      
      // Progress update
      const processed = Math.min(i + batchSize, allCommunities.length);
      const percentage = Math.round((processed / allCommunities.length) * 100);
      console.log(`⏳ Progress: ${processed}/${allCommunities.length} (${percentage}%)`);
    }
    
    return this.stats;
  }

  /**
   * Generate detailed report
   */
  generateReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 DATA STANDARDIZATION INITIATIVE - FINAL REPORT');
    console.log('='.repeat(60));
    console.log(`\n✅ Total Communities Processed: ${this.stats.totalCommunities.toLocaleString()}`);
    console.log('\n🔧 Issues Fixed:');
    console.log(`   • Names cleaned: ${this.stats.namesFixed.toLocaleString()}`);
    console.log(`     - International (emoji flags removed): ${this.stats.internationalFixed.toLocaleString()}`);
    console.log(`     - Generic names standardized: ${this.stats.genericNamesFixed.toLocaleString()}`);
    console.log(`   • Websites fixed: ${this.stats.websitesFixed.toLocaleString()}`);
    console.log(`   • Phone numbers cleaned: ${this.stats.phonesFixed.toLocaleString()}`);
    console.log(`   • Descriptions cleaned: ${this.stats.descriptionsFixed.toLocaleString()}`);
    
    const totalFixes = this.stats.namesFixed + this.stats.websitesFixed + 
                      this.stats.phonesFixed + this.stats.descriptionsFixed;
    console.log(`\n🎯 Total Fixes Applied: ${totalFixes.toLocaleString()}`);
    
    const successRate = Math.round((totalFixes / this.stats.totalCommunities) * 100);
    console.log(`📈 Data Quality Improvement: ${successRate}% of communities had issues fixed`);
    
    console.log('\n✨ Next Steps:');
    console.log('   1. Test AI enrichment with cleaned data');
    console.log('   2. Verify search functionality improvements');
    console.log('   3. Monitor ongoing data quality');
    console.log('\n' + '='.repeat(60) + '\n');
  }

  /**
   * Verify specific communities were fixed
   */
  async verifyFixes(): Promise<void> {
    console.log('\n🔍 Verifying Sample Fixes...\n');
    
    // Check a few specific communities
    const testCommunities = [
      { pattern: '%Atria%', type: 'Atria' },
      { pattern: '%Brookdale%', type: 'Brookdale' },
      { pattern: '%Bright Waters%', type: 'Australian' }
    ];
    
    for (const test of testCommunities) {
      const samples = await db.select({
        id: communities.id,
        name: communities.name,
        website: communities.website
      })
      .from(communities)
      .where(like(communities.name, test.pattern))
      .limit(2);
      
      console.log(`${test.type} Communities:`);
      samples.forEach(s => {
        console.log(`  • ID: ${s.id}, Name: "${s.name}"`);
        if (s.website) console.log(`    Website: ${s.website}`);
      });
      console.log('');
    }
  }
}

// Execute the standardization
async function main() {
  try {
    const service = new DataStandardizationService();
    
    console.log('🏁 MySeniorValet Data Standardization Initiative');
    console.log('📅 Date: ' + new Date().toISOString());
    console.log('');
    
    const stats = await service.standardizeAllData();
    
    service.generateReport();
    
    await service.verifyFixes();
    
    console.log('✅ Data Standardization Complete!');
    console.log('🚀 AI enrichment should now work much better with cleaned data.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during standardization:', error);
    process.exit(1);
  }
}

// Execute immediately
main();

export { DataStandardizationService };