#!/usr/bin/env node
/**
 * Script to create a super admin user in production database
 * Run this after deployment to create your admin account
 * 
 * Usage: node create-admin-user.js
 */

const { Pool } = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');
const readline = require('readline');

// Create readline interface for password input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function createAdminUser() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('Make sure you are running this in the production environment');
    process.exit(1);
  }

  console.log('🔐 Create Super Admin Account');
  console.log('================================');
  
  try {
    // Get user details
    const email = await question('Enter email (William.cowell01@gmail.com): ') || 'William.cowell01@gmail.com';
    const username = email.split('@')[0].toLowerCase();
    const password = await question('Enter password: ');
    
    if (!password) {
      console.error('❌ Password is required');
      process.exit(1);
    }

    const firstName = await question('Enter first name (William): ') || 'William';
    const lastName = await question('Enter last name (Cowell): ') || 'Cowell';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Connect to database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Check if user already exists
    const checkResult = await pool.query(
      'SELECT id, email, role FROM users WHERE lower(email) = lower($1)',
      [email]
    );

    if (checkResult.rows.length > 0) {
      const existingUser = checkResult.rows[0];
      console.log(`\n⚠️  User already exists with email: ${existingUser.email}`);
      console.log(`Current role: ${existingUser.role}`);
      
      const updateRole = await question('Do you want to update this user to super_admin? (y/n): ');
      
      if (updateRole.toLowerCase() === 'y') {
        // Update existing user to super admin
        await pool.query(
          `UPDATE users 
           SET role = 'super_admin', 
               password = $2,
               updated_at = NOW() 
           WHERE lower(email) = lower($1)`,
          [email, hashedPassword]
        );
        console.log('✅ User updated to super admin successfully!');
      } else {
        console.log('No changes made.');
      }
    } else {
      // Create new super admin user
      const insertResult = await pool.query(
        `INSERT INTO users (
          username, 
          email, 
          password, 
          first_name, 
          last_name, 
          role, 
          email_verified,
          is_active,
          created_at, 
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, 'super_admin', true, true, NOW(), NOW())
        RETURNING id, email, role`,
        [username, email, hashedPassword, firstName, lastName]
      );

      const newUser = insertResult.rows[0];
      console.log('\n✅ Super admin user created successfully!');
      console.log(`Email: ${newUser.email}`);
      console.log(`Role: ${newUser.role}`);
    }

    console.log('\n🎉 You can now log in with your credentials!');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
createAdminUser().catch(console.error);