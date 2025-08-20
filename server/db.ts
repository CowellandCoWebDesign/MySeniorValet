import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // 10 second connection timeout
  idleTimeoutMillis: 30000, // 30 second idle timeout
  max: 10, // Reduced from 20 to prevent overload
  maxUses: 7500, // Recycle connections after 7500 uses
});

// Handle pool errors gracefully to prevent crashes
pool.on('error', (err) => {
  console.error('Database pool error (non-fatal):', err.message);
});

export const db = drizzle({ client: pool, schema });