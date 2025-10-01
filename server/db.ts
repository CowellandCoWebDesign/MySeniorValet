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

// Enhanced pool configuration for Neon serverless deployment
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 60000, // Increased to 60 seconds for deployment environment
  idleTimeoutMillis: 5000, // Reduced to 5 seconds for faster cleanup
  max: 3, // Minimal connections for Neon serverless
  min: 0, // Don't keep minimum connections (serverless best practice)
  maxUses: 500, // Rotate connections more frequently
  allowExitOnIdle: true, // Allow exit on idle for serverless
  // Retry configuration for better resilience
  statement_timeout: 30000, // 30 second query timeout
  query_timeout: 30000, // 30 second query timeout
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
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

// Connection validation helper with retry logic
export async function validateConnection(retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      // Simple query to test connection
      await pool.query('SELECT 1');
      return true;
    } catch (error: any) {
      console.warn(`Database connection validation attempt ${i + 1}/${retries} failed:`, error.message);
      if (i < retries - 1) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  return false;
}

// Helper to execute queries with connection validation
export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  skipValidation = false
): Promise<T> {
  if (!skipValidation) {
    const isConnected = await validateConnection();
    if (!isConnected) {
      throw new Error('Database connection unavailable');
    }
  }
  
  try {
    return await queryFn();
  } catch (error: any) {
    // Handle common Neon errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('Database connection error:', error.message);
      throw new Error('Database temporarily unavailable');
    }
    throw error;
  }
}