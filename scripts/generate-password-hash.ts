import bcrypt from 'bcrypt';

// URGENT PASSWORD HASH GENERATOR
// Run: tsx scripts/generate-password-hash.ts "YourNewPassword"

async function generatePasswordHash() {
  const password = process.argv[2];
  
  if (!password) {
    console.error('❌ Please provide a password as an argument');
    console.log('Usage: tsx scripts/generate-password-hash.ts "YourNewPassword"');
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    
    console.log('\n' + '='.repeat(70));
    console.log('🔐 PASSWORD HASH GENERATED');
    console.log('='.repeat(70));
    console.log(`Original Password: ${password}`);
    console.log(`Bcrypt Hash: ${hash}`);
    console.log('\n📋 SQL COMMAND TO FIX YOUR PRODUCTION DATABASE:');
    console.log('='.repeat(70));
    console.log(`
UPDATE users 
SET password = '${hash}',
    password_reset_token = NULL,
    password_reset_expires = NULL
WHERE email = 'william.cowell01@gmail.com';

-- Also clear any existing sessions to force fresh login
DELETE FROM user_sessions WHERE user_id = (
  SELECT id FROM users WHERE email = 'william.cowell01@gmail.com'
);
    `);
    console.log('='.repeat(70));
    console.log('\n✅ Copy and run the SQL above in your production database');
    console.log('Then login with your new password!');
    console.log('='.repeat(70) + '\n');
  } catch (error) {
    console.error('❌ Error generating hash:', error);
    process.exit(1);
  }
}

generatePasswordHash();