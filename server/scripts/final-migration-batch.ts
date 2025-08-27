/**
 * Final Batch Migration: Complete the healthcare services migration
 * Processing remaining ~530 healthcare services in small batches
 * Date: August 27, 2025
 */

import { db } from "../db";
import { 
  communities, 
  serviceProviders, 
  services, 
  serviceCategories
} from "../../shared/schema";
import { eq, or, and, ilike, not, sql } from "drizzle-orm";

async function migrateRemainingHealthcare() {
  console.log("=".repeat(60));
  console.log("   FINAL HEALTHCARE SERVICES MIGRATION");
  console.log("=".repeat(60));
  
  // Get healthcare category
  const [category] = await db.select()
    .from(serviceCategories)
    .where(eq(serviceCategories.name, "Healthcare Services"))
    .limit(1);
    
  const healthcareCategoryId = category?.id || 1;
  
  // Query for remaining healthcare services
  const healthcareQuery = and(
    or(
      ilike(communities.name, "%home health%"),
      ilike(communities.name, "%hospice%"),
      ilike(communities.name, "%therapy%"),
      ilike(communities.name, "%medical%"),
      ilike(communities.name, "%health service%"),
      ilike(communities.name, "%healthcare%"),
      ilike(communities.name, "%clinic%"),
      ilike(communities.name, "%hospital%"),
      ilike(communities.name, "%nursing service%"),
      ilike(communities.name, "%rehabilitation%"),
      ilike(communities.name, "%dental%"),
      ilike(communities.name, "%pharmacy%"),
      ilike(communities.name, "%diagnostic%"),
      ilike(communities.name, "%laboratory%"),
      ilike(communities.name, "%urgent care%"),
      ilike(communities.name, "%wound care%"),
      ilike(communities.name, "%pain management%")
    ),
    and(
      not(ilike(communities.name, "%assisted living%")),
      not(ilike(communities.name, "%memory care%")),
      not(ilike(communities.name, "%senior living%")),
      not(ilike(communities.name, "%retirement%")),
      not(ilike(communities.name, "%senior apartment%")),
      not(ilike(communities.name, "%independent living%"))
    )
  );
  
  // Get remaining healthcare services in batches
  const batchSize = 50;
  let totalMigrated = 0;
  let totalSkipped = 0;
  
  console.log("\n🔍 Finding remaining healthcare services...");
  
  // Process in batches
  let hasMore = true;
  while (hasMore) {
    const batch = await db.select()
      .from(communities)
      .where(healthcareQuery)
      .limit(batchSize);
    
    if (batch.length === 0) {
      hasMore = false;
      break;
    }
    
    console.log(`\n📦 Processing batch of ${batch.length} entries...`);
    
    for (const entry of batch) {
      try {
        // Check if already migrated (by checking if a service exists with this name)
        const existing = await db.select()
          .from(services)
          .where(eq(services.name, entry.name))
          .limit(1);
          
        if (existing.length > 0) {
          // Already migrated, just try to delete from communities
          try {
            await db.delete(communities).where(eq(communities.id, entry.id));
          } catch (e: any) {
            if (e.code === '23503') {
              totalSkipped++;
            }
          }
          continue;
        }
        
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
              migrationDate: new Date().toISOString(),
              address: entry.address,
              city: entry.city,
              state: entry.state,
              zip: entry.zip
            }
          });
        
        totalMigrated++;
        
        // Try to delete from communities table
        try {
          await db.delete(communities).where(eq(communities.id, entry.id));
        } catch (deleteError: any) {
          if (deleteError.code === '23503') {
            totalSkipped++;
            console.log(`   ⚠️  Kept ${entry.name} (has active relationships)`);
          }
        }
        
      } catch (error: any) {
        console.error(`   ❌ Failed to migrate ${entry.name}: ${error.message}`);
      }
    }
    
    console.log(`   ✅ Batch complete - Migrated: ${totalMigrated}, Kept: ${totalSkipped}`);
  }
  
  // Final counts
  const [communityCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(communities);
  const [providerCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(serviceProviders);
  const [servicesCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(services);
  
  console.log("\n" + "=".repeat(60));
  console.log("   MIGRATION COMPLETE");
  console.log("=".repeat(60));
  console.log("\n📊 Final Database State:");
  console.log(`   ✅ Communities: ${communityCount.count}`);
  console.log(`   🏥 Healthcare Providers: ${providerCount.count}`);
  console.log(`   💊 Healthcare Services: ${servicesCount.count}`);
  console.log(`\n   Migrated in this run: ${totalMigrated}`);
  console.log(`   Kept due to relationships: ${totalSkipped}`);
  
  // Check for any remaining healthcare services
  const [remaining] = await db.select({ count: sql<number>`COUNT(*)` })
    .from(communities)
    .where(healthcareQuery);
  
  if (remaining.count > 0) {
    console.log(`\n   ⚠️  ${remaining.count} healthcare services remain (have active relationships)`);
  } else {
    console.log("\n   ✨ All healthcare services successfully migrated!");
  }
}

// Run the migration
migrateRemainingHealthcare()
  .then(() => {
    console.log("\n✅ Migration script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });

export { migrateRemainingHealthcare };