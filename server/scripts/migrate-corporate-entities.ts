/**
 * Migrate Corporate Entities: Move Inc/LLC/Corp companies to healthcare services
 * These are typically healthcare service providers, not actual communities
 * Date: August 27, 2025
 */

import { db } from "../db";
import { 
  communities, 
  serviceProviders, 
  services, 
  serviceCategories
} from "../../shared/schema";
import { eq, or, ilike, sql } from "drizzle-orm";

async function migrateCorporateEntities() {
  console.log("=".repeat(60));
  console.log("   MIGRATING CORPORATE ENTITIES (Inc/LLC/Corp)");
  console.log("=".repeat(60));
  
  // Get or create healthcare category
  const [category] = await db.select()
    .from(serviceCategories)
    .where(eq(serviceCategories.name, "Healthcare Services"))
    .limit(1);
    
  const healthcareCategoryId = category?.id || 1;
  
  // Query for corporate entities
  const corporateQuery = or(
    ilike(communities.name, "%inc%"),
    ilike(communities.name, "%llc%"),
    ilike(communities.name, "%corp%"),
    ilike(communities.name, "%corporation%"),
    ilike(communities.name, "%company%"),
    ilike(communities.name, "%ltd%"),
    ilike(communities.name, "%limited%"),
    ilike(communities.name, "%enterprises%"),
    ilike(communities.name, "%group%"),
    ilike(communities.name, "%services%")
  );
  
  const batchSize = 50;
  let totalMigrated = 0;
  let totalSkipped = 0;
  
  console.log("\n🔍 Finding corporate entities to migrate...");
  
  let hasMore = true;
  while (hasMore) {
    const batch = await db.select()
      .from(communities)
      .where(corporateQuery)
      .limit(batchSize);
    
    if (batch.length === 0) {
      hasMore = false;
      break;
    }
    
    console.log(`\n📦 Processing batch of ${batch.length} corporate entities...`);
    
    for (const entry of batch) {
      try {
        // Check if already migrated
        const existing = await db.select()
          .from(services)
          .where(eq(services.name, entry.name))
          .limit(1);
          
        if (existing.length > 0) {
          // Already migrated, try to delete from communities
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
            description: entry.description || `Healthcare services provider`,
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
            description: entry.description || `Healthcare and senior services`,
            shortDescription: entry.description?.substring(0, 200) || `Professional services`,
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
              corporateEntity: true,
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
          console.log(`   ✅ Migrated: ${entry.name}`);
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
    
    console.log(`   Batch complete - Migrated: ${totalMigrated}, Kept: ${totalSkipped}`);
  }
  
  // Final counts
  const [communityCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(communities);
  const [providerCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(serviceProviders);
  const [servicesCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(services);
  
  console.log("\n" + "=".repeat(60));
  console.log("   CORPORATE ENTITY MIGRATION COMPLETE");
  console.log("=".repeat(60));
  console.log("\n📊 Final Database State:");
  console.log(`   ✅ Communities: ${communityCount.count}`);
  console.log(`   🏥 Healthcare Providers: ${providerCount.count}`);
  console.log(`   💊 Healthcare Services: ${servicesCount.count}`);
  console.log(`\n   Corporate entities migrated: ${totalMigrated}`);
  console.log(`   Kept due to relationships: ${totalSkipped}`);
}

// Run the migration
migrateCorporateEntities()
  .then(() => {
    console.log("\n✅ Corporate entity migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });