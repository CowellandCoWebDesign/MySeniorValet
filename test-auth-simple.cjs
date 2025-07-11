// Simple authentication test without sessions
const { Pool } = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testAuthLogin() {
  console.log('🔐 Testing simple authentication...');
  
  try {
    const client = await pool.connect();
    
    // Get demo user
    const result = await client.query(
      "SELECT id, username, password FROM users WHERE username = $1",
      ["demo@trueview.com"]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Demo user not found');
      return false;
    }
    
    const user = result.rows[0];
    console.log('✅ Demo user found:', { id: user.id, username: user.username });
    
    // Test password verification
    const isValid = await bcrypt.compare("demo123", user.password);
    console.log('✅ Password verification:', isValid ? 'VALID' : 'INVALID');
    
    client.release();
    return isValid;
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return false;
  }
}

testAuthLogin().then(success => {
  console.log('\n🔐 Authentication test result:', success ? 'PASS' : 'FAIL');
  process.exit(success ? 0 : 1);
});