import { db } from "./db";
import { systemFlags } from "@shared/schema";
import { eq } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";
import { redisCache } from "./infrastructure/redis-cache";

interface MaintenanceModeConfig {
  enabled: boolean;
  message: string;
  expectedDuration?: string;
  allowedIPs: string[];
  allowedEmails: string[];
  startedAt?: Date;
  scheduledEnd?: Date;
}

class MaintenanceModeService {
  private config: MaintenanceModeConfig = {
    enabled: false,
    message: "We're currently performing scheduled maintenance. We'll be back shortly!",
    allowedIPs: ["127.0.0.1", "::1"], // Always allow localhost
    allowedEmails: ["william.cowell01@gmail.com", "admin@myseniorvalet.com"], // Super admins
  };

  constructor() {
    this.loadConfig();
  }

  private async loadConfig(): Promise<void> {
    try {
      // Try to load from cache first
      const cachedConfig = await redisCache.getCachedStats('maintenance_mode_config');
      if (cachedConfig) {
        this.config = { ...this.config, ...cachedConfig };
        return;
      }

      // Load from database
      const settings = await db
        .select()
        .from(systemFlags)
        .where(eq(systemFlags.flagName, "maintenance_mode"));

      if (settings.length > 0 && settings[0].flagValue) {
        const dbConfig = JSON.parse(settings[0].flagValue as string);
        this.config = { ...this.config, ...dbConfig };
        await this.saveToCache();
      }
    } catch (error) {
      console.error("Failed to load maintenance mode config:", error);
    }
  }

  private async saveToCache(): Promise<void> {
    try {
      await redisCache.cacheStats('maintenance_mode_config', this.config, 300); // 5 minute cache
    } catch (error) {
      console.log("Failed to cache maintenance mode config:", error);
    }
  }

  private async saveToDatabase(): Promise<void> {
    try {
      await db
        .insert(systemFlags)
        .values({
          flagName: "maintenance_mode",
          flagValue: JSON.stringify(this.config),
          reason: "Maintenance mode configuration",
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: systemFlags.flagName,
          set: {
            flagValue: JSON.stringify(this.config),
            updatedAt: new Date()
          }
        });
      
      await this.saveToCache();
    } catch (error) {
      console.error("Failed to save maintenance mode config:", error);
      throw error;
    }
  }

  // Enable maintenance mode
  async enable(
    message?: string, 
    expectedDuration?: string,
    scheduledEnd?: Date
  ): Promise<void> {
    this.config.enabled = true;
    this.config.message = message || this.config.message;
    this.config.expectedDuration = expectedDuration;
    this.config.startedAt = new Date();
    this.config.scheduledEnd = scheduledEnd;
    
    await this.saveToDatabase();
    console.log(`🔧 MAINTENANCE MODE ENABLED: ${this.config.message}`);
  }

  // Disable maintenance mode
  async disable(): Promise<void> {
    this.config.enabled = false;
    this.config.startedAt = undefined;
    this.config.scheduledEnd = undefined;
    this.config.expectedDuration = undefined;
    
    await this.saveToDatabase();
    console.log("✅ MAINTENANCE MODE DISABLED");
  }

  // Check if maintenance mode is active
  isEnabled(): boolean {
    // Check if scheduled end has passed
    if (this.config.scheduledEnd && new Date() > this.config.scheduledEnd) {
      this.disable(); // Auto-disable if scheduled end passed
      return false;
    }
    return this.config.enabled;
  }

  // Add allowed IP
  async addAllowedIP(ip: string): Promise<void> {
    if (!this.config.allowedIPs.includes(ip)) {
      this.config.allowedIPs.push(ip);
      await this.saveToDatabase();
    }
  }

  // Remove allowed IP
  async removeAllowedIP(ip: string): Promise<void> {
    this.config.allowedIPs = this.config.allowedIPs.filter(allowedIp => allowedIp !== ip);
    await this.saveToDatabase();
  }

  // Add allowed email
  async addAllowedEmail(email: string): Promise<void> {
    if (!this.config.allowedEmails.includes(email.toLowerCase())) {
      this.config.allowedEmails.push(email.toLowerCase());
      await this.saveToDatabase();
    }
  }

  // Remove allowed email  
  async removeAllowedEmail(email: string): Promise<void> {
    this.config.allowedEmails = this.config.allowedEmails.filter(
      allowedEmail => allowedEmail.toLowerCase() !== email.toLowerCase()
    );
    await this.saveToDatabase();
  }

  // Check if request is allowed
  isRequestAllowed(req: Request): boolean {
    // Allow if maintenance mode is disabled
    if (!this.isEnabled()) {
      return true;
    }

    // Allow API health check endpoints
    if (req.path === '/api/health' || req.path === '/api/maintenance/status') {
      return true;
    }

    // Check IP allowlist
    const clientIP = req.ip || req.socket.remoteAddress || '';
    if (this.config.allowedIPs.includes(clientIP)) {
      return true;
    }

    // Check user email allowlist (requires authenticated user)
    const userEmail = (req as any).user?.email;
    if (userEmail && this.config.allowedEmails.includes(userEmail.toLowerCase())) {
      return true;
    }

    return false;
  }

  // Get maintenance status
  getStatus(): MaintenanceModeConfig {
    return { ...this.config };
  }

  // Update message
  async updateMessage(message: string): Promise<void> {
    this.config.message = message;
    await this.saveToDatabase();
  }

  // Schedule maintenance
  async scheduleMaintenance(
    startDate: Date,
    endDate: Date,
    message?: string
  ): Promise<void> {
    // Set up scheduled job to enable maintenance at start time
    const now = new Date();
    const timeUntilStart = startDate.getTime() - now.getTime();
    
    if (timeUntilStart > 0) {
      setTimeout(() => {
        this.enable(message, undefined, endDate);
      }, timeUntilStart);
      
      console.log(`⏰ Maintenance scheduled for ${startDate.toISOString()}`);
    } else {
      // Start immediately if start time has passed
      await this.enable(message, undefined, endDate);
    }
  }

  // Express middleware
  middleware(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      // Skip maintenance check for allowed requests
      if (this.isRequestAllowed(req)) {
        return next();
      }

      // Return maintenance response
      const status = this.getStatus();
      
      // For API requests, return JSON
      if (req.path.startsWith('/api/')) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: status.message,
          expectedDuration: status.expectedDuration,
          scheduledEnd: status.scheduledEnd
        });
      }

      // For web requests, return HTML maintenance page
      return res.status(503).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>MySeniorValet - Maintenance Mode</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .maintenance-container {
              background: white;
              border-radius: 20px;
              padding: 40px;
              max-width: 500px;
              text-align: center;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .icon {
              width: 80px;
              height: 80px;
              margin: 0 auto 20px;
              background: #764ba2;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .icon svg {
              width: 40px;
              height: 40px;
              fill: white;
            }
            h1 {
              color: #333;
              margin-bottom: 15px;
              font-size: 28px;
            }
            p {
              color: #666;
              line-height: 1.6;
              margin-bottom: 15px;
            }
            .progress-bar {
              background: #f0f0f0;
              height: 4px;
              border-radius: 2px;
              overflow: hidden;
              margin: 30px 0;
            }
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #667eea, #764ba2);
              animation: progress 2s ease-in-out infinite;
            }
            @keyframes progress {
              0% { width: 0%; }
              50% { width: 100%; }
              100% { width: 0%; }
            }
            .eta {
              font-size: 14px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="maintenance-container">
            <div class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1>We'll Be Right Back!</h1>
            <p>${status.message}</p>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            ${status.expectedDuration ? `<p class="eta">Expected duration: ${status.expectedDuration}</p>` : ''}
            ${status.scheduledEnd ? `<p class="eta">Scheduled completion: ${new Date(status.scheduledEnd).toLocaleString()}</p>` : ''}
          </div>
        </body>
        </html>
      `);
    };
  }
}

// Export singleton instance
export const maintenanceMode = new MaintenanceModeService();