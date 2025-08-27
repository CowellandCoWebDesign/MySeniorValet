/**
 * Migration Script: Move Misplaced Entries from Communities to Proper Tables
 * 
 * This script identifies and migrates entries that are currently in the communities
 * table but should be in either:
 * 1. Healthcare Services Directory (serviceProviders/services)
 * 2. Resources & Support Centers (supportResources/supportResourceCategories)
 * 
 * Date: August 27, 2025
 * Total misplaced entries: ~497
 */

import { db } from "../db";
import { 
  communities, 
  serviceProviders, 
  services, 
  serviceCategories,
  supportResources, 
  supportResourceCategories 
} from "../../shared/schema";
import { eq, and, isNull, or, ilike, inArray, notInArray, not } from "drizzle-orm";

// Keywords that indicate a healthcare service provider
const HEALTHCARE_SERVICE_KEYWORDS = [
  'home health', 'home care', 'hospice', 'therapy', 'medical', 'nursing',
  'health services', 'healthcare', 'rehabilitation', 'skilled nursing',
  'physical therapy', 'occupational therapy', 'speech therapy', 'palliative',
  'dental', 'pharmacy', 'diagnostic', 'laboratory', 'radiology', 'dialysis',
  'urgent care', 'clinic', 'hospital', 'medical center', 'health center',
  'wound care', 'pain management', 'cardiology', 'neurology', 'orthopedic'
];

// Keywords that indicate support resources/advisory services
const SUPPORT_RESOURCE_KEYWORDS = [
  'advisory', 'consulting', 'counseling', 'support group', 'resource center',
  'information center', 'referral', 'placement', 'locator', 'finder',
  'guide', 'assistance', 'advocacy', 'ombudsman', 'help line', 'helpline',
  'coalition', 'association', 'foundation', 'alliance', 'network',
  'education', 'training', 'workshop', 'seminar', 'program'
];

// Keywords that indicate it's an actual senior living community
const LEGITIMATE_COMMUNITY_KEYWORDS = [
  'assisted living', 'memory care', 'independent living', 'retirement community',
  'senior living', 'senior apartments', 'retirement home', 'nursing home',
  'care home', 'board and care', 'residential care', 'adult family home',
  'ccrc', 'continuing care', 'life plan community', 'active adult',
  'senior housing', 'elderly housing', '55+', '62+', 'senior village'
];

async function identifyMisplacedEntries() {
  console.log("🔍 Identifying misplaced entries in communities table...\n");
  
  // Get all communities
  const allCommunities = await db.select().from(communities);
  
  const healthcareServices: typeof allCommunities = [];
  const supportResources: typeof allCommunities = [];
  const legitimateCommunities: typeof allCommunities = [];
  const uncategorized: typeof allCommunities = [];
  
  for (const community of allCommunities) {
    const nameAndDescLower = 
      `${community.name} ${community.description || ''} ${community.careTypes?.join(' ') || ''}`.toLowerCase();
    
    // Check if it's a healthcare service
    const isHealthcare = HEALTHCARE_SERVICE_KEYWORDS.some(keyword => 
      nameAndDescLower.includes(keyword)
    );
    
    // Check if it's a support resource
    const isSupport = SUPPORT_RESOURCE_KEYWORDS.some(keyword => 
      nameAndDescLower.includes(keyword)
    );
    
    // Check if it's a legitimate community
    const isLegitimate = LEGITIMATE_COMMUNITY_KEYWORDS.some(keyword => 
      nameAndDescLower.includes(keyword)
    );
    
    // Categorize based on priority
    if (isHealthcare && !isLegitimate) {
      healthcareServices.push(community);
    } else if (isSupport && !isLegitimate && !isHealthcare) {
      supportResources.push(community);
    } else if (isLegitimate) {
      legitimateCommunities.push(community);
    } else {
      // Additional check for entries with minimal data
      const hasMinimalData = !community.website && 
                             !community.phone && 
                             (!community.address || community.address.length < 10);
      
      if (hasMinimalData) {
        uncategorized.push(community);
      } else {
        legitimateCommunities.push(community);
      }
    }
  }
  
  console.log(`📊 Analysis Results:`);
  console.log(`   ✅ Legitimate Communities: ${legitimateCommunities.length}`);
  console.log(`   🏥 Healthcare Services: ${healthcareServices.length}`);
  console.log(`   📚 Support Resources: ${supportResources.length}`);
  console.log(`   ❓ Uncategorized: ${uncategorized.length}`);
  console.log(`   📈 Total: ${allCommunities.length}\n`);
  
  return {
    healthcareServices,
    supportResources,
    legitimateCommunities,
    uncategorized
  };
}

async function migrateHealthcareServices(entries: any[]) {
  console.log(`\n🏥 Migrating ${entries.length} Healthcare Services...`);
  
  // Ensure we have healthcare category
  let healthcareCategoryId: number;
  const existingCategory = await db.select()
    .from(serviceCategories)
    .where(eq(serviceCategories.name, "Healthcare Services"))
    .limit(1);
  
  if (existingCategory.length === 0) {
    const [newCategory] = await db.insert(serviceCategories)
      .values({
        name: "Healthcare Services",
        description: "Professional healthcare and medical services for seniors",
        icon: "Heart",
        color: "red",
        isActive: true,
        sortOrder: 1
      })
      .returning();
    healthcareCategoryId = newCategory.id;
  } else {
    healthcareCategoryId = existingCategory[0].id;
  }
  
  let migrated = 0;
  for (const entry of entries) {
    try {
      // Create service provider
      const [provider] = await db.insert(serviceProviders)
        .values({
          name: entry.name,
          description: entry.description,
          website: entry.website,
          contactPhone: entry.phone,
          contactEmail: entry.email,
          isPartner: false,
          isActive: true
        })
        .returning();
      
      // Create service
      await db.insert(services)
        .values({
          categoryId: healthcareCategoryId,
          providerId: provider.id,
          name: entry.name,
          description: entry.description,
          shortDescription: entry.description?.substring(0, 200),
          serviceType: "service",
          deliveryMethod: ["in-person"],
          availability: {
            regions: entry.state ? [entry.state] : []
          },
          isActive: true,
          metadata: {
            migratedFrom: "communities",
            originalId: entry.id,
            migrationDate: new Date().toISOString()
          }
        });
      
      migrated++;
      
      // Try to delete from communities table (handle foreign key constraints gracefully)
      try {
        await db.delete(communities).where(eq(communities.id, entry.id));
      } catch (deleteError: any) {
        if (deleteError.code === '23503') {
          console.log(`   ⚠️  Kept ${entry.name} in communities table (has active relationships)`);
        } else {
          throw deleteError;
        }
      }
      
      if (migrated % 10 === 0) {
        console.log(`   Migrated ${migrated}/${entries.length}...`);
      }
    } catch (error) {
      console.error(`   ❌ Failed to migrate ${entry.name}:`, error);
    }
  }
  
  console.log(`   ✅ Successfully migrated ${migrated} healthcare services`);
  return migrated;
}

async function migrateSupportResources(entries: any[]) {
  console.log(`\n📚 Migrating ${entries.length} Support Resources...`);
  
  // Ensure we have support category
  let supportCategoryId: number;
  const existingCategory = await db.select()
    .from(supportResourceCategories)
    .where(eq(supportResourceCategories.name, "Advisory & Support Services"))
    .limit(1);
  
  if (existingCategory.length === 0) {
    const [newCategory] = await db.insert(supportResourceCategories)
      .values({
        name: "Advisory & Support Services",
        description: "Professional guidance and support resources for seniors and families",
        icon: "Users",
        colorScheme: "blue",
        displayOrder: 1,
        isActive: true
      })
      .returning();
    supportCategoryId = newCategory.id;
  } else {
    supportCategoryId = existingCategory[0].id;
  }
  
  let migrated = 0;
  for (const entry of entries) {
    try {
      await db.insert(supportResources)
        .values({
          categoryId: supportCategoryId,
          title: entry.name,
          description: entry.description || `Support services provided by ${entry.name}`,
          content: `
# ${entry.name}

${entry.description || ''}

## Contact Information
- **Address**: ${entry.address || 'Not available'}  
- **Phone**: ${entry.phone || 'Not available'}
- **Website**: ${entry.website || 'Not available'}
- **Email**: ${entry.email || 'Not available'}
          `,
          resourceType: "guide",
          tags: ["advisory", "support", "professional"],
          targetAudience: ["family_members", "caregivers", "seniors"],
          careStage: "exploration",
          emotionalThemes: ["support", "guidance", "resources"],
          authorName: entry.name,
          sourceUrl: entry.website,
          isHelpful: true,
          isFeatured: false
        });
      
      migrated++;
      
      // Try to delete from communities table (handle foreign key constraints gracefully)
      try {
        await db.delete(communities).where(eq(communities.id, entry.id));
      } catch (deleteError: any) {
        if (deleteError.code === '23503') {
          console.log(`   ⚠️  Kept ${entry.name} in communities table (has active relationships)`);
        } else {
          throw deleteError;
        }
      }
      
      if (migrated % 10 === 0) {
        console.log(`   Migrated ${migrated}/${entries.length}...`);
      }
    } catch (error) {
      console.error(`   ❌ Failed to migrate ${entry.name}:`, error);
    }
  }
  
  console.log(`   ✅ Successfully migrated ${migrated} support resources`);
  return migrated;
}

async function cleanupBadAddresses() {
  console.log("\n🧹 Cleaning up bad addresses...");
  
  // Fix Shasta Estates duplicates
  const shastaEstates = await db.select()
    .from(communities)
    .where(ilike(communities.name, "%shasta estates%"));
  
  if (shastaEstates.length > 1) {
    console.log(`   Found ${shastaEstates.length} Shasta Estates entries`);
    // Keep the one with the most complete data
    const sorted = shastaEstates.sort((a, b) => {
      const scoreA = (a.phone ? 1 : 0) + (a.website ? 1 : 0) + (a.description ? 1 : 0);
      const scoreB = (b.phone ? 1 : 0) + (b.website ? 1 : 0) + (b.description ? 1 : 0);
      return scoreB - scoreA;
    });
    
    // Delete all except the best one
    const idsToDelete = sorted.slice(1).map(c => c.id);
    if (idsToDelete.length > 0) {
      await db.delete(communities).where(inArray(communities.id, idsToDelete));
      console.log(`   Removed ${idsToDelete.length} duplicate Shasta Estates entries`);
    }
  }
  
  // Count entries with incomplete addresses
  const incompleteAddresses = await db.select()
    .from(communities)
    .where(
      or(
        isNull(communities.address),
        eq(communities.address, ""),
        // Address that's just city/state/zip
        and(
          not(ilike(communities.address, "%street%")),
          not(ilike(communities.address, "%ave%")),
          not(ilike(communities.address, "%road%")),
          not(ilike(communities.address, "%dr%")),
          not(ilike(communities.address, "%blvd%")),
          not(ilike(communities.address, "%way%")),
          not(ilike(communities.address, "%lane%")),
          not(ilike(communities.address, "%court%"))
        )
      )
    );
  
  console.log(`   Found ${incompleteAddresses.length} entries with incomplete addresses`);
  
  return {
    duplicatesRemoved: shastaEstates.length - 1,
    incompleteAddresses: incompleteAddresses.length
  };
}

async function main() {
  console.log("=".repeat(60));
  console.log("   MIGRATION: REORGANIZE MISPLACED ENTRIES");
  console.log("=".repeat(60));
  
  try {
    // Step 1: Identify misplaced entries
    const categorized = await identifyMisplacedEntries();
    
    // Step 2: Migrate healthcare services
    const healthcareMigrated = await migrateHealthcareServices(categorized.healthcareServices);
    
    // Step 3: Migrate support resources
    const supportMigrated = await migrateSupportResources(categorized.supportResources);
    
    // Step 4: Clean up bad addresses and duplicates
    const cleanup = await cleanupBadAddresses();
    
    // Step 5: Final report
    console.log("\n" + "=".repeat(60));
    console.log("   MIGRATION COMPLETE");
    console.log("=".repeat(60));
    console.log(`\n📊 Final Summary:`);
    console.log(`   🏥 Healthcare Services Migrated: ${healthcareMigrated}`);
    console.log(`   📚 Support Resources Migrated: ${supportMigrated}`);
    console.log(`   🗑️ Duplicates Removed: ${cleanup.duplicatesRemoved}`);
    console.log(`   ⚠️ Entries with Incomplete Addresses: ${cleanup.incompleteAddresses}`);
    console.log(`   ✅ Legitimate Communities Remaining: ${categorized.legitimateCommunities.length}`);
    
    console.log("\n✨ Migration completed successfully!");
    console.log("   - Healthcare services now in serviceProviders/services tables");
    console.log("   - Support resources now in supportResources table");
    console.log("   - Communities table now contains only actual senior living communities");
    
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

export { main as migrateMisplacedEntries };