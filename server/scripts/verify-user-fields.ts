import { db } from "../db";
import { users } from "@shared/schema";
import { sql } from "drizzle-orm";

/**
 * Verification script for user profile enhancement fields
 * Ensures all new fields are properly added to the database
 */

async function verifyUserFields() {
  console.log("🔍 Verifying user profile enhancement fields...\n");
  
  try {
    // Check if columns exist by querying information schema
    const columnsQuery = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN (
        'relationship_to_care',
        'care_needs',
        'search_preferences',
        'notifications',
        'dashboard_preferences'
      )
      ORDER BY column_name;
    `);
    
    console.log("📊 Database Column Status:");
    console.log("─".repeat(50));
    
    const expectedFields = [
      'relationship_to_care',
      'care_needs', 
      'search_preferences',
      'notifications',
      'dashboard_preferences'
    ];
    
    const foundFields = columnsQuery.rows.map((row: any) => row.column_name);
    
    expectedFields.forEach(field => {
      const exists = foundFields.includes(field);
      const column = columnsQuery.rows.find((row: any) => row.column_name === field);
      
      if (exists) {
        console.log(`✅ ${field}: ${column.data_type}`);
        if (column.column_default) {
          console.log(`   Default: ${column.column_default.substring(0, 50)}...`);
        }
      } else {
        console.log(`❌ ${field}: NOT FOUND`);
      }
    });
    
    console.log("\n📈 Testing Field Functionality:");
    console.log("─".repeat(50));
    
    // Get a test user or create one
    const testUserId = "test-profile-enhancement";
    
    // Try to update a user with the new fields
    const testData = {
      relationshipToCare: "Seeking for Parent" as const,
      careNeeds: ["Assisted Living", "Memory Care"],
      searchPreferences: {
        preferredLocation: "San Francisco, CA",
        budgetRange: { min: 3000, max: 5000 },
        preferredAmenities: ["Pet Friendly", "Outdoor Space"],
        mustHaveFeatures: ["24/7 Nursing"],
        dealBreakers: ["No Smoking Policy"]
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        newListings: true,
        priceAlerts: true,
        messageAlerts: true,
        reviewReminders: false
      },
      dashboardPreferences: {
        layoutType: "detailed" as const,
        fontSize: "large" as const,
        highContrast: false,
        reducedMotion: false,
        cardSize: "comfortable" as const,
        showHelpTips: true,
        quickActions: ["search", "favorites"],
        dashboardSections: {
          favorites: { visible: true, order: 1 },
          recentSearches: { visible: true, order: 2 },
          recommendations: { visible: true, order: 3 },
          savedCommunities: { visible: true, order: 4 },
          tourSchedule: { visible: true, order: 5 },
          familyNotes: { visible: true, order: 6 }
        }
      }
    };
    
    // Try to insert/update with new fields
    try {
      await db.insert(users).values({
        id: testUserId,
        email: "test@myseniorvalet.com",
        firstName: "Test",
        lastName: "User",
        ...testData
      }).onConflictDoUpdate({
        target: users.id,
        set: testData
      });
      
      console.log("✅ Successfully inserted/updated user with new fields");
      
      // Retrieve and verify
      const [retrievedUser] = await db.select().from(users).where(sql`${users.id} = ${testUserId}`);
      
      if (retrievedUser) {
        console.log("\n✅ Field Verification Results:");
        console.log(`   relationshipToCare: ${retrievedUser.relationshipToCare}`);
        console.log(`   careNeeds: ${JSON.stringify(retrievedUser.careNeeds)}`);
        console.log(`   searchPreferences: ${JSON.stringify(retrievedUser.searchPreferences).substring(0, 50)}...`);
        console.log(`   notifications: ${JSON.stringify(retrievedUser.notifications).substring(0, 50)}...`);
        console.log(`   dashboardPreferences: ${JSON.stringify(retrievedUser.dashboardPreferences).substring(0, 50)}...`);
      }
      
    } catch (error) {
      console.error("❌ Error testing new fields:", error);
    }
    
    console.log("\n✨ User Profile Enhancement Verification Complete!");
    
  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

verifyUserFields();