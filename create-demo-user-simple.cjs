const { Pool } = require("@neondatabase/serverless");
const bcrypt = require("bcrypt");
const ws = require("ws");

// Configure neon
const neonConfig = require("@neondatabase/serverless").neonConfig;
neonConfig.webSocketConstructor = ws;

async function createDemoUser() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const client = await pool.connect();
    
    // Check if demo user already exists
    const existingUser = await client.query(
      "SELECT id FROM users WHERE username = $1",
      ["demo@trueview.com"]
    );
    
    if (existingUser.rows.length > 0) {
      console.log("Demo user already exists with ID:", existingUser.rows[0].id);
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash("demo123", 10);
    
    // Create demo user with only the columns that exist
    const result = await client.query(
      `INSERT INTO users (username, password)
       VALUES ($1, $2)
       RETURNING id, username`,
      [
        "demo@trueview.com",
        hashedPassword
      ]
    );
    
    console.log("✅ Demo user created successfully!");
    console.log("User details:", result.rows[0]);
    console.log("Email: demo@trueview.com");
    console.log("Password: demo123");
    
    client.release();
    
  } catch (error) {
    console.error("Error creating demo user:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

createDemoUser().catch(console.error);