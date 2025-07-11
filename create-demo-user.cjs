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
      "SELECT id FROM users WHERE email = $1",
      ["demo@trueview.com"]
    );
    
    if (existingUser.rows.length > 0) {
      console.log("Demo user already exists");
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash("demo123", 10);
    
    // Create demo user
    const result = await client.query(
      `INSERT INTO users (email, password, first_name, last_name, phone, relationship_to_care, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id`,
      [
        "demo@trueview.com",
        hashedPassword,
        "Demo",
        "User",
        "(555) 123-4567",
        "Seeking for Parent"
      ]
    );
    
    const userId = result.rows[0].id;
    
    // Add some sample favorites for the demo user
    const favoriteQueries = [
      `INSERT INTO favorites (user_id, community_id, created_at) VALUES ($1, 1, NOW())`,
      `INSERT INTO favorites (user_id, community_id, created_at) VALUES ($1, 2, NOW())`,
      `INSERT INTO favorites (user_id, community_id, created_at) VALUES ($1, 3, NOW())`,
    ];
    
    for (const query of favoriteQueries) {
      try {
        await client.query(query, [userId]);
      } catch (error) {
        console.log("Note: Could not add sample favorites - communities may not exist");
      }
    }
    
    // Add some sample search history
    const searchHistoryQueries = [
      `INSERT INTO search_history (user_id, query, location, results_count, created_at) VALUES ($1, 'Assisted Living', 'San Francisco, CA', 12, NOW())`,
      `INSERT INTO search_history (user_id, query, location, results_count, created_at) VALUES ($1, 'Memory Care', 'Sacramento, CA', 8, NOW())`,
      `INSERT INTO search_history (user_id, query, location, results_count, created_at) VALUES ($1, 'Independent Living', 'Los Angeles, CA', 25, NOW())`,
    ];
    
    for (const query of searchHistoryQueries) {
      try {
        await client.query(query, [userId]);
      } catch (error) {
        console.log("Note: Could not add sample search history - table may not exist");
      }
    }
    
    // Add sample scheduled tours
    const tourQueries = [
      `INSERT INTO tours (user_id, community_id, tour_date, tour_time, status, notes, created_at, updated_at) VALUES ($1, 1, '2025-01-20', '10:00', 'scheduled', 'Looking forward to the tour!', NOW(), NOW())`,
      `INSERT INTO tours (user_id, community_id, tour_date, tour_time, status, notes, created_at, updated_at) VALUES ($1, 2, '2025-01-25', '14:00', 'scheduled', 'Interested in memory care options', NOW(), NOW())`,
    ];
    
    for (const query of tourQueries) {
      try {
        await client.query(query, [userId]);
      } catch (error) {
        console.log("Note: Could not add sample tours - communities may not exist");
      }
    }
    
    console.log("✅ Demo user created successfully!");
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