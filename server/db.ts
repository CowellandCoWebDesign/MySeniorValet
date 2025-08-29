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
  connectionTimeoutMillis: 60000, // 60 second connection timeout (increased)
  idleTimeoutMillis: 300000, // 5 minute idle timeout (increased)
  max: 10, // Reduced max connections for Neon serverless
  min: 1, // Keep minimum connection open
  maxUses: 7500, // Rotate connections to prevent stale connections
  allowExitOnIdle: false // Don't exit on idle
});
// Add error handling and reconnection logic
pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
  // Don't crash the server on database errors
});

pool.on('connect', (client) => {
  console.log('Database connection established');
});

export const db = drizzle({ client: pool, schema });