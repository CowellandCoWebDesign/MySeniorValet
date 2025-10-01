#!/usr/bin/env node

console.log('\n=== MySeniorValet Database Connection String ===\n');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not found in environment variables');
  console.error('Make sure your Replit database is provisioned.');
  process.exit(1);
}

console.log('📋 Copy this connection string for your database import:\n');
console.log(process.env.DATABASE_URL);
console.log('\n');

// Also show individual components for reference
console.log('Individual Components:');
console.log('---');
console.log('Host:', process.env.PGHOST || '(not set)');
console.log('User:', process.env.PGUSER || '(not set)');
console.log('Password:', process.env.PGPASSWORD || '(not set)');
console.log('Database:', process.env.PGDATABASE || '(not set)');
console.log('Port:', process.env.PGPORT || '5432');
console.log('\n');

console.log('✅ Use this for pg_dump export:');
console.log(`pg_dump "${process.env.DATABASE_URL}" > myseniorvalet_backup_$(date +%Y%m%d_%H%M%S).sql`);
console.log('\n');

console.log('⚠️  SECURITY REMINDER: Delete this output after copying!');
console.log('===\n');
