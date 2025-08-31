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
  connectionTimeoutMillis: 30000, // 30 second connection timeout (optimized for Neon)
  idleTimeoutMillis: 10000, // 10 second idle timeout (reduced for serverless)
  max: 5, // Further reduced for Neon serverless (recommended: 3-5)
  min: 0, // Don't keep minimum connections (serverless best practice)
  maxUses: 1000, // Rotate connections more frequently to prevent stale connections
  allowExitOnIdle: true // Allow exit on idle for serverless
});

// Improved error handling with connection type detection
pool.on('error', (err) => {
  // Suppress common Neon connection cycling messages
  if (err.message.includes('terminating connection due to administrator command') ||
      err.message.includes('Connection terminated unexpectedly') ||
      err.message.includes('idle timeout')) {
    // These are normal for Neon serverless, don't log as errors
    if (process.env.NODE_ENV === 'development') {
      // Only log in development if DEBUG is enabled
      if (process.env.DEBUG_DB === 'true') {
        console.log('[DB] Connection recycled:', err.message);
      }
    }
  } else {
    // Log actual errors
    console.error('Database pool error:', err.message);
  }
});

pool.on('connect', (client) => {
  // Only log new connections in development
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG_DB === 'true') {
    console.log('Database connection established');
  }
});

export const db = drizzle({ client: pool, schema });