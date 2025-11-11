#!/usr/bin/env node
/**
 * Script to check if production database is properly configured
 * Run this to verify your database setup
 * 
 * Usage: node check-production-db.js
 */

const { Pool } = require('@neondatabase/serverless');

async function checkProductionDatabase() {
  console.log('🔍 Production Database Check');
  console.log('================================\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('\nTo fix this:');
    console.log('1. Make sure you have created a PostgreSQL database');
    console.log('2. The DATABASE_URL should be automatically set in production');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Check database connection
    console.log('📡 Checking database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful\n');

    // Check users table
    console.log('📋 Checking users table...');
    const usersTableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!usersTableResult.rows[0].exists) {
      console.error('❌ Users table does not exist');
      console.log('Run: npm run db:push --force');
      process.exit(1);
    }
    console.log('✅ Users table exists');

    // Check sessions tables
    console.log('\n📋 Checking sessions tables...');
    const userSessionsResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_sessions'
      );
    `);
    
    const sessionsResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sessions'
      );
    `);
    
    if (!userSessionsResult.rows[0].exists) {
      console.log('⚠️  user_sessions table does not exist - will be created on first use');
    } else {
      console.log('✅ user_sessions table exists');
    }

    if (!sessionsResult.rows[0].exists) {
      console.log('⚠️  sessions table does not exist - will be created on first use');
    } else {
      console.log('✅ sessions table exists');
    }

    // Count total users
    console.log('\n👥 User Statistics:');
    const userCountResult = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`Total users: ${userCountResult.rows[0].count}`);

    // Check for super admins
    const adminCountResult = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'super_admin'");
    console.log(`Super admins: ${adminCountResult.rows[0].count}`);

    if (parseInt(adminCountResult.rows[0].count) === 0) {
      console.log('\n⚠️  No super admin accounts found!');
      console.log('Run: node create-admin-user.js to create one');
    }

    // Check for specific user
    const checkEmail = 'William.cowell01@gmail.com';
    const userCheckResult = await pool.query(
      'SELECT id, email, role FROM users WHERE lower(email) = lower($1)',
      [checkEmail]
    );

    if (userCheckResult.rows.length > 0) {
      const user = userCheckResult.rows[0];
      console.log(`\n✅ Found your account: ${user.email} (${user.role})`);
    } else {
      console.log(`\n⚠️  Your account (${checkEmail}) not found in production database`);
      console.log('Run: node create-admin-user.js to create it');
    }

    console.log('\n🎉 Database check complete!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.log('\nPossible issues:');
    console.log('1. Database connection string is incorrect');
    console.log('2. Database tables have not been created');
    console.log('3. Network connectivity issues');
    console.log('\nTry running: npm run db:push --force');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the check
checkProductionDatabase().catch(console.error);