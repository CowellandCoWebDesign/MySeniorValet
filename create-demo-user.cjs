const bcrypt = require('bcrypt');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

async function createDemoUser() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Check if demo user exists
    const checkResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      ['demo@myseniorvalet.com']
    );
    
    if (checkResult.rows.length > 0) {
      console.log('Demo user already exists');
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    // Create the demo user
    const insertResult = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      ['demo@myseniorvalet.com', hashedPassword]
    );
    
    console.log('Demo user created successfully:', insertResult.rows[0]);
  } catch (error) {
    console.error('Error creating demo user:', error);
  } finally {
    await pool.end();
  }
}

createDemoUser();