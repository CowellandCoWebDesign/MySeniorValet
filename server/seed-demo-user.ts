import { db } from "./db";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function createDemoUser() {
  try {
    // Check if demo user already exists (using raw SQL to match current database structure)
    const existingUser = await db.execute(
      sql`SELECT id, username FROM users WHERE username = 'demo@trueview.com'`
    );
    
    if (existingUser.rows.length > 0) {
      console.log('Demo user already exists');
      return;
    }

    // Hash the demo password
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Create demo user (using raw SQL to match current database structure)
    const result = await db.execute(
      sql`INSERT INTO users (username, password) VALUES ('demo@trueview.com', ${hashedPassword}) RETURNING id, username`
    );

    const demoUser = result.rows[0];
    console.log('Demo user created successfully:', demoUser.username);
    return demoUser;
  } catch (error) {
    console.error('Error creating demo user:', error);
    throw error;
  }
}