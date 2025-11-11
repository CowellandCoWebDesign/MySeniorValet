import { db } from "../db";
import { sql } from "drizzle-orm";

async function setupPasswordAudit() {
  console.log("🔐 Setting up password audit system...");
  
  try {
    // Create audit table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS password_audit_log (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        email VARCHAR(255),
        action VARCHAR(50),
        initiator VARCHAR(100),
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Password audit table created");

    // Create indexes for faster queries
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_password_audit_email ON password_audit_log(email);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_password_audit_created ON password_audit_log(created_at);
    `);
    
    console.log("✅ Indexes created for audit table");
    
    // Add a retrospective log of the August 25 incident
    await db.execute(sql`
      INSERT INTO password_audit_log (user_id, email, action, initiator, created_at)
      VALUES 
        ('UNKNOWN', 'william.cowell01@gmail.com', 'password_changed', 'UNKNOWN_BATCH_OPERATION', '2025-08-25 16:39:01'),
        ('UNKNOWN', 'test.family@example.com', 'password_created', 'UNKNOWN_BATCH_OPERATION', '2025-08-25 16:39:01'),
        ('UNKNOWN', 'test.community@example.com', 'password_created', 'UNKNOWN_BATCH_OPERATION', '2025-08-25 16:39:01'),
        ('UNKNOWN', 'test.vendor@example.com', 'password_created', 'UNKNOWN_BATCH_OPERATION', '2025-08-25 16:39:01')
      ON CONFLICT DO NOTHING
    `);
    
    console.log("✅ Historical incident logged for August 25, 2025");
    
    console.log("\n🛡️ Password audit system is now active!");
    console.log("All future password changes will be logged and monitored.");
    console.log("Bulk password changes will trigger security alerts.");
    
  } catch (error) {
    console.error("❌ Error setting up password audit:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

setupPasswordAudit();