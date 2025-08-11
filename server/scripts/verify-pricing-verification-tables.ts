#!/usr/bin/env tsx
// Verify Phase 2 Database Enhancement Tables
import { neon } from '@neondatabase/serverless';

async function verifyPricingVerificationTables() {
  const sql = neon(process.env.DATABASE_URL!);
  
  console.log('🔍 Verifying Phase 2 Database Enhancement Tables...\n');
  
  // Check all new tables
  const tables = [
    'pricing_history',
    'price_change_alerts', 
    'verified_community_profiles',
    'verification_activity_log',
    'pricing_update_queue',
    'community_claims'
  ];
  
  console.log('📊 Table Status:');
  console.log('──────────────────────────────────────────────────');
  
  for (const tableName of tables) {
    try {
      const result = await sql`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = ${tableName}
        ORDER BY ordinal_position
        LIMIT 1
      `;
      
      if (result.length > 0) {
        console.log(`✅ ${tableName}: EXISTS`);
      } else {
        console.log(`❌ ${tableName}: NOT FOUND`);
      }
    } catch (error) {
      console.log(`❌ ${tableName}: ERROR checking table`);
    }
  }
  
  console.log('\n📈 Table Record Counts:');
  console.log('──────────────────────────────────────────────────');
  
  // Check record counts
  const countQueries = {
    'pricing_history': 'SELECT COUNT(*) as count FROM pricing_history',
    'price_change_alerts': 'SELECT COUNT(*) as count FROM price_change_alerts',
    'verified_community_profiles': 'SELECT COUNT(*) as count FROM verified_community_profiles',
    'verification_activity_log': 'SELECT COUNT(*) as count FROM verification_activity_log',
    'pricing_update_queue': 'SELECT COUNT(*) as count FROM pricing_update_queue',
    'community_claims': 'SELECT COUNT(*) as count FROM community_claims'
  };
  
  for (const [table, query] of Object.entries(countQueries)) {
    try {
      const result = await sql(query);
      console.log(`${table}: ${result[0].count} records`);
    } catch (error) {
      console.log(`${table}: Unable to count`);
    }
  }
  
  console.log('\n🔑 Checking Foreign Key Relationships:');
  console.log('──────────────────────────────────────────────────');
  
  // Check foreign keys
  const fkQuery = await sql`
    SELECT 
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name IN ('pricing_history', 'price_change_alerts', 'verified_community_profiles', 'verification_activity_log', 'community_claims')
    ORDER BY tc.table_name, kcu.column_name;
  `;
  
  for (const fk of fkQuery) {
    console.log(`${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
  }
  
  console.log('\n✨ Phase 2 Database Enhancement Verification Complete!');
  console.log('\n📌 Next Steps:');
  console.log('1. Create API endpoints for pricing history');
  console.log('2. Build community claims workflow');
  console.log('3. Implement verification process');
  console.log('4. Add pricing transparency features');
  console.log('5. Create admin verification panel');
}

verifyPricingVerificationTables().catch(console.error);