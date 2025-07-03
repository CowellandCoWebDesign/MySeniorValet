/**
 * Enhanced database connection pooling for 10,000+ concurrent users
 * Provides connection reuse, health monitoring, and automatic recovery
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

interface PoolStats {
  totalConnections: number;
  idleConnections: number;
  activeConnections: number;
  waitingClients: number;
  totalErrors: number;
  avgResponseTime: number;
}

export class ScalableConnectionPool {
  private pool: Pool;
  private stats: PoolStats;
  private responseTimes: number[] = [];
  private errorCount = 0;
  private lastHealthCheck = 0;
  private readonly healthCheckInterval = 30000; // 30 seconds

  constructor(connectionString: string) {
    if (!connectionString) {
      throw new Error("Database connection string is required");
    }

    this.pool = new Pool({
      connectionString,
      max: 20, // Maximum pool size for high concurrency
      min: 2,  // Minimum pool size for quick response
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 5000, // Connection timeout
      query_timeout: 30000, // Query timeout
      allowExitOnIdle: false,
      application_name: 'TrueView-Production'
    });

    this.stats = {
      totalConnections: 0,
      idleConnections: 0,
      activeConnections: 0,
      waitingClients: 0,
      totalErrors: 0,
      avgResponseTime: 0
    };

    this.setupEventListeners();
    this.startHealthMonitoring();
  }

  private setupEventListeners() {
    this.pool.on('connect', (client) => {
      this.stats.totalConnections++;
      console.log('Database client connected. Total:', this.stats.totalConnections);
    });

    this.pool.on('error', (err, client) => {
      this.errorCount++;
      this.stats.totalErrors++;
      console.error('Database pool error:', err);
      
      // Attempt to recreate pool if too many errors
      if (this.errorCount > 10) {
        console.log('Too many database errors, attempting pool recovery...');
        this.recoverPool();
      }
    });

    this.pool.on('remove', (client) => {
      this.stats.totalConnections--;
      console.log('Database client removed. Total:', this.stats.totalConnections);
    });
  }

  private startHealthMonitoring() {
    setInterval(async () => {
      await this.performHealthCheck();
    }, this.healthCheckInterval);
  }

  private async performHealthCheck() {
    try {
      const start = Date.now();
      const client = await this.pool.connect();
      
      await client.query('SELECT 1');
      client.release();
      
      const responseTime = Date.now() - start;
      this.recordResponseTime(responseTime);
      
      this.lastHealthCheck = Date.now();
      this.errorCount = Math.max(0, this.errorCount - 1); // Gradually reduce error count on success
      
    } catch (error) {
      console.error('Health check failed:', error);
      this.errorCount++;
    }
  }

  private recordResponseTime(time: number) {
    this.responseTimes.push(time);
    
    // Keep only last 100 response times for average calculation
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }
    
    this.stats.avgResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }

  private async recoverPool() {
    try {
      console.log('Attempting to recover database pool...');
      
      // End the current pool
      await this.pool.end();
      
      // Create a new pool with the same configuration
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL!,
        max: 20,
        min: 2,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        query_timeout: 30000,
        allowExitOnIdle: false,
        application_name: 'TrueView-Production-Recovered'
      });
      
      this.setupEventListeners();
      this.errorCount = 0;
      
      console.log('Database pool recovered successfully');
      
    } catch (error) {
      console.error('Failed to recover database pool:', error);
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    let client;
    
    try {
      client = await this.pool.connect();
      const result = await client.query(text, params);
      
      this.recordResponseTime(Date.now() - start);
      return result;
      
    } catch (error) {
      this.errorCount++;
      this.stats.totalErrors++;
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async getClient() {
    return await this.pool.connect();
  }

  getStats(): PoolStats & { 
    isHealthy: boolean; 
    lastHealthCheck: number;
    errorRate: number;
  } {
    const now = Date.now();
    const isHealthy = (now - this.lastHealthCheck) < (this.healthCheckInterval * 2) && this.errorCount < 5;
    const errorRate = this.stats.totalConnections > 0 ? this.stats.totalErrors / this.stats.totalConnections : 0;
    
    return {
      ...this.stats,
      isHealthy,
      lastHealthCheck: this.lastHealthCheck,
      errorRate
    };
  }

  async close() {
    await this.pool.end();
  }

  // Circuit breaker pattern for database calls
  async executeWithCircuitBreaker<T>(operation: () => Promise<T>): Promise<T> {
    const stats = this.getStats();
    
    // If error rate is too high, reject immediately
    if (stats.errorRate > 0.1 && !stats.isHealthy) {
      throw new Error('Circuit breaker is open - database is unhealthy');
    }
    
    try {
      return await operation();
    } catch (error) {
      // If this is a connection error, trigger health check
      if (error instanceof Error && error.message.includes('connection')) {
        this.performHealthCheck();
      }
      throw error;
    }
  }
}

// Global connection pool instance
export const connectionPool = new ScalableConnectionPool(process.env.DATABASE_URL!);

// Enhanced database interface with pooling
export const scalableDb = {
  query: (text: string, params?: any[]) => connectionPool.query(text, params),
  getClient: () => connectionPool.getClient(),
  getStats: () => connectionPool.getStats(),
  executeWithCircuitBreaker: <T>(operation: () => Promise<T>) => 
    connectionPool.executeWithCircuitBreaker(operation)
};