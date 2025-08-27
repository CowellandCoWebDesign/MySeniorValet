/**
 * Continue Migration Script: Resume migrating misplaced healthcare services
 * Date: August 27, 2025
 */

import { db } from "../db";
import { 
  communities, 
  serviceProviders, 
  services, 
  serviceCategories
} from "../../shared/schema";
import { eq, ilike, notInArray, sql } from "drizzle-orm";

// Keywords that indicate a healthcare service provider
const HEALTHCARE_SERVICE_KEYWORDS = [
  'home health', 'home care', 'hospice', 'therapy', 'medical', 'nursing',
  'health services', 'healthcare', 'rehabilitation', 'skilled nursing',
  'physical therapy', 'occupational therapy', 'speech therapy', 'palliative',
  'dental', 'pharmacy', 'diagnostic', 'laboratory', 'radiology', 'dialysis',
  'urgent care', 'clinic', 'hospital', 'medical center', 'health center',
  'wound care', 'pain management', 'cardiology', 'neurology', 'orthopedic'
];

// Keywords that indicate it's an actual senior living community
const LEGITIMATE_COMMUNITY_KEYWORDS = [
  'assisted living', 'memory care', 'independent living', 'retirement community',
  'senior living', 'senior apartments', 'retirement home', 'nursing home',
  'care home', 'board and care', 'residential care', 'adult family home',
  'ccrc', 'continuing care', 'life plan community', 'active adult',
  'senior housing', 'elderly housing', '55+', '62+', 'senior village'
];

async function continueHealthcareMigration() {
  console.log("🔍 Finding remaining healthcare services to migrate...\n");
  
  // Get IDs of already migrated entries
  const alreadyMigrated = await db.select({ 
    originalId: sql<number>`(metadata->>'originalId')::integer` 
  })
  .from(services)
  .where(sql`metadata->>'migratedFrom' = 'communities'`);
  
  const migratedIds = alreadyMigrated
    .map(s => s.originalId)
    .filter(id => id !== null && id !== undefined);
  
  console.log(`   Already migrated: ${migratedIds.length} entries`);
  
  // Get all remaining communities
  const query = migratedIds.length > 0 
    ? db.select().from(communities).where(notInArray(communities.id, migratedIds))
    : db.select().from(communities);
    
  const remainingCommunities = await query;
  
  const healthcareServices: typeof remainingCommunities = [];
  
  for (const community of remainingCommunities) {
    const nameAndDescLower = 
      `${community.name} ${community.description || ''} ${community.careTypes?.join(' ') || ''}`.toLowerCase();
    
    // Check if it's a healthcare service
    const isHealthcare = HEALTHCARE_SERVICE_KEYWORDS.some(keyword => 
      nameAndDescLower.includes(keyword)
    );
    
    // Check if it's a legitimate community
    const isLegitimate = LEGITIMATE_COMMUNITY_KEYWORDS.some(keyword => 
      nameAndDescLower.includes(keyword)
    );
    
    if (isHealthcare && !isLegitimate) {
      healthcareServices.push(community);
    }
  }
  
  console.log(`   Found ${healthcareServices.length} more healthcare services to migrate\n`);
  
  if (healthcareServices.length === 0) {
    console.log("✅ No more healthcare services to migrate!");
    return 0;
  }
  
  // Get healthcare category
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
  
  console.log(`🏥 Continuing migration of ${healthcareServices.length} Healthcare Services...`);
  
  let migrated = 0;
  let skipped = 0;
  
  for (const entry of healthcareServices) {
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
          skipped++;
          console.log(`   ⚠️  Kept ${entry.name} in communities table (has active relationships)`);
        } else {
          throw deleteError;
        }
      }
      
      if (migrated % 100 === 0) {
        console.log(`   Migrated ${migrated}/${healthcareServices.length}...`);
      }
    } catch (error) {
      console.error(`   ❌ Failed to migrate ${entry.name}:`, error);
    }
  }
  
  console.log(`\n   ✅ Successfully migrated ${migrated} healthcare services`);
  console.log(`   ⚠️  Kept ${skipped} entries in communities (have active relationships)`);
  
  return migrated;
}

async function cleanupDuplicates() {
  console.log("\n🧹 Cleaning up duplicates...");
  
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
      for (const id of idsToDelete) {
        try {
          await db.delete(communities).where(eq(communities.id, id));
        } catch (e: any) {
          if (e.code === '23503') {
            console.log(`   ⚠️  Cannot delete duplicate Shasta Estates (ID: ${id}) - has active relationships`);
          }
        }
      }
    }
  }
  
  return shastaEstates.length - 1;
}

async function main() {
  console.log("=".repeat(60));
  console.log("   CONTINUING MIGRATION OF HEALTHCARE SERVICES");
  console.log("=".repeat(60));
  
  try {
    // Continue healthcare services migration
    const healthcareMigrated = await continueHealthcareMigration();
    
    // Clean up duplicates
    const duplicatesRemoved = await cleanupDuplicates();
    
    // Final count
    const [communityCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(communities);
    const [providerCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(serviceProviders);
    const [servicesCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(services);
    
    // Final report
    console.log("\n" + "=".repeat(60));
    console.log("   MIGRATION STATUS");
    console.log("=".repeat(60));
    console.log(`\n📊 Current Database State:`);
    console.log(`   ✅ Legitimate Communities: ${communityCount.count}`);
    console.log(`   🏥 Healthcare Providers: ${providerCount.count}`);
    console.log(`   💊 Healthcare Services: ${servicesCount.count}`);
    console.log(`   🗑️ Duplicates Removed: ${duplicatesRemoved}`);
    
    if (healthcareMigrated === 0) {
      console.log("\n✨ Migration complete! All healthcare services have been moved.");
    } else {
      console.log(`\n✨ Migrated ${healthcareMigrated} more healthcare services!`);
    }
    
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

export { main as continueMigration };