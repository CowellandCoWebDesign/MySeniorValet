/**
 * ENRICHMENT FIRE-PROOFING SYSTEM
 * Prevents photo and review enrichment systems from causing runaway API costs
 * Similar to expansion fire-proofing but tailored for enrichment operations
 */

import { apiCostProtection } from './api-cost-protection';
import { db } from './db';
import { communities } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface EnrichmentSession {
  id: string;
  type: 'photo' | 'review' | 'combined';
  startTime: Date;
  estimatedCost: number;
  estimatedCalls: number;
  actualCost: number;
  actualCalls: number;
  progress: {
    totalCommunities: number;
    processedCommunities: number;
    photosAdded: number;
    reviewsAdded: number;
    errors: string[];
  };
  status: 'running' | 'completed' | 'failed' | 'stopped';
  fireProofingActive: boolean;
}

interface EnrichmentFireProofingConfig {
  maxPhotosPerCommunity: number;
  maxReviewsPerCommunity: number;
  maxCostPerOperation: number;
  maxCallsPerOperation: number;
  sessionTimeoutMinutes: number;
  rateLimitMs: number;
  emergencyStopCost: number;
  maxOverrunPercentage: number;
}

export class EnrichmentFireProofing {
  private activeSessions: Map<string, EnrichmentSession> = new Map();
  private readonly config: EnrichmentFireProofingConfig;
  private readonly logFile: string;

  constructor() {
    this.config = {
      maxPhotosPerCommunity: 10, // Increased to 10 photos per community
      maxReviewsPerCommunity: 5, // Limit reviews to 5 per community
      maxCostPerOperation: 30, // Max $30 per enrichment operation (increased to accommodate 10 photos)
      maxCallsPerOperation: 600, // Max 600 API calls per operation
      sessionTimeoutMinutes: 30, // Auto-stop after 30 minutes
      rateLimitMs: 2000, // 2 seconds between communities
      emergencyStopCost: 75, // Emergency stop at $75 total cost
      maxOverrunPercentage: 150 // Stop if costs exceed estimates by 50%
    };
    
    this.logFile = path.join(__dirname, 'logs', 'enrichment-fire-proofing.log');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * CRITICAL: Check if enrichment operation is allowed before starting
   */
  async checkBeforeEnrichment(
    type: 'photo' | 'review' | 'combined',
    communityIds?: number[]
  ): Promise<{
    allowed: boolean;
    reason?: string;
    estimatedCost: number;
    estimatedCalls: number;
    sessionId?: string;
  }> {
    try {
      // Check if any enrichment session is already running
      const runningSession = Array.from(this.activeSessions.values()).find(
        session => session.status === 'running'
      );
      
      if (runningSession) {
        return {
          allowed: false,
          reason: `Enrichment session ${runningSession.id} already running (${runningSession.type})`,
          estimatedCost: 0,
          estimatedCalls: 0
        };
      }

      // Get communities to enrich
      let targetCommunities: any[] = [];
      if (communityIds) {
        targetCommunities = await db.select().from(communities).where(
          sql`id = ANY(${communityIds})`
        );
      } else {
        targetCommunities = await db.select().from(communities);
      }

      // Calculate estimated costs
      const estimatedCost = this.calculateEstimatedCost(type, targetCommunities.length);
      const estimatedCalls = this.calculateEstimatedCalls(type, targetCommunities.length);

      // Check against our limits
      if (estimatedCost > this.config.maxCostPerOperation) {
        return {
          allowed: false,
          reason: `Estimated cost $${estimatedCost.toFixed(2)} exceeds limit $${this.config.maxCostPerOperation}`,
          estimatedCost,
          estimatedCalls
        };
      }

      if (estimatedCalls > this.config.maxCallsPerOperation) {
        return {
          allowed: false,
          reason: `Estimated ${estimatedCalls} calls exceed limit ${this.config.maxCallsPerOperation}`,
          estimatedCost,
          estimatedCalls
        };
      }

      // Check against global API cost protection
      const protection = await apiCostProtection.checkBeforeOperation(estimatedCalls, estimatedCost);
      if (!protection.allowed) {
        return {
          allowed: false,
          reason: `API cost protection blocked: ${protection.reason}`,
          estimatedCost,
          estimatedCalls
        };
      }

      // Create session
      const sessionId = `enrichment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const session: EnrichmentSession = {
        id: sessionId,
        type,
        startTime: new Date(),
        estimatedCost,
        estimatedCalls,
        actualCost: 0,
        actualCalls: 0,
        progress: {
          totalCommunities: targetCommunities.length,
          processedCommunities: 0,
          photosAdded: 0,
          reviewsAdded: 0,
          errors: []
        },
        status: 'running',
        fireProofingActive: true
      };

      this.activeSessions.set(sessionId, session);
      await this.logEnrichmentEvent('SESSION_START', sessionId, {
        type,
        estimatedCost,
        estimatedCalls,
        totalCommunities: targetCommunities.length
      });

      // Set timeout for automatic session cleanup
      setTimeout(() => {
        this.timeoutSession(sessionId);
      }, this.config.sessionTimeoutMinutes * 60 * 1000);

      return {
        allowed: true,
        estimatedCost,
        estimatedCalls,
        sessionId
      };

    } catch (error) {
      console.error('Error in enrichment pre-flight check:', error);
      return {
        allowed: false,
        reason: 'Internal error in pre-flight check',
        estimatedCost: 0,
        estimatedCalls: 0
      };
    }
  }

  /**
   * CRITICAL: Check if community enrichment is allowed during session
   */
  async checkCommunityEnrichment(
    sessionId: string,
    communityId: number,
    photosToAdd: number,
    reviewsToAdd: number
  ): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status !== 'running') {
      return {
        allowed: false,
        reason: 'No active enrichment session found'
      };
    }

    // Check photo limits
    if (photosToAdd > this.config.maxPhotosPerCommunity) {
      return {
        allowed: false,
        reason: `Too many photos (${photosToAdd} > ${this.config.maxPhotosPerCommunity})`
      };
    }

    // Check review limits
    if (reviewsToAdd > this.config.maxReviewsPerCommunity) {
      return {
        allowed: false,
        reason: `Too many reviews (${reviewsToAdd} > ${this.config.maxReviewsPerCommunity})`
      };
    }

    // Check cost overrun
    if (session.actualCost > session.estimatedCost * (this.config.maxOverrunPercentage / 100)) {
      await this.stopSession(sessionId, 'Cost overrun detected');
      return {
        allowed: false,
        reason: 'Session stopped due to cost overrun'
      };
    }

    // Check emergency stop
    if (session.actualCost > this.config.emergencyStopCost) {
      await this.stopSession(sessionId, 'Emergency cost limit reached');
      return {
        allowed: false,
        reason: 'Emergency stop triggered'
      };
    }

    return { allowed: true };
  }

  /**
   * Update session progress after enriching a community
   */
  async updateSessionProgress(
    sessionId: string,
    communityId: number,
    photosAdded: number,
    reviewsAdded: number,
    actualCost: number,
    actualCalls: number
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.progress.processedCommunities++;
    session.progress.photosAdded += photosAdded;
    session.progress.reviewsAdded += reviewsAdded;
    session.actualCost += actualCost;
    session.actualCalls += actualCalls;

    await this.logEnrichmentEvent('COMMUNITY_ENRICHED', sessionId, {
      communityId,
      photosAdded,
      reviewsAdded,
      actualCost,
      actualCalls,
      totalCost: session.actualCost,
      totalCalls: session.actualCalls
    });

    // Check if session is complete
    if (session.progress.processedCommunities >= session.progress.totalCommunities) {
      await this.completeSession(sessionId);
    }
  }

  /**
   * Record enrichment error
   */
  async recordEnrichmentError(sessionId: string, error: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.progress.errors.push(error);
    await this.logEnrichmentEvent('ERROR', sessionId, { error });
  }

  /**
   * Get active session status
   */
  getSessionStatus(sessionId: string): EnrichmentSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Emergency stop all enrichment sessions
   */
  async emergencyStop(reason: string): Promise<void> {
    const runningSessionIds = Array.from(this.activeSessions.keys()).filter(
      id => this.activeSessions.get(id)?.status === 'running'
    );

    for (const sessionId of runningSessionIds) {
      await this.stopSession(sessionId, `Emergency stop: ${reason}`);
    }

    await this.logEnrichmentEvent('EMERGENCY_STOP', 'ALL', { reason });
  }

  /**
   * Stop a specific session
   */
  private async stopSession(sessionId: string, reason: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.status = 'stopped';
    session.fireProofingActive = false;

    await this.logEnrichmentEvent('SESSION_STOPPED', sessionId, { reason });
  }

  /**
   * Complete a session
   */
  private async completeSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.status = 'completed';
    session.fireProofingActive = false;

    await this.logEnrichmentEvent('SESSION_COMPLETED', sessionId, {
      totalCost: session.actualCost,
      totalCalls: session.actualCalls,
      photosAdded: session.progress.photosAdded,
      reviewsAdded: session.progress.reviewsAdded
    });
  }

  /**
   * Timeout a session
   */
  private async timeoutSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status !== 'running') return;

    session.status = 'failed';
    session.fireProofingActive = false;

    await this.logEnrichmentEvent('SESSION_TIMEOUT', sessionId, {
      duration: this.config.sessionTimeoutMinutes
    });
  }

  /**
   * Calculate estimated cost for enrichment operation
   */
  private calculateEstimatedCost(type: 'photo' | 'review' | 'combined', communityCount: number): number {
    const textSearchCost = 0.032; // $32 per 1000 requests
    const placeDetailsCost = 0.017; // $17 per 1000 requests
    const photoCost = 0.007; // $7 per 1000 requests

    let costPerCommunity = 0;

    switch (type) {
      case 'photo':
        costPerCommunity = textSearchCost + placeDetailsCost + (this.config.maxPhotosPerCommunity * photoCost);
        break;
      case 'review':
        costPerCommunity = textSearchCost + placeDetailsCost; // Reviews included in details
        break;
      case 'combined':
        costPerCommunity = textSearchCost + placeDetailsCost + (this.config.maxPhotosPerCommunity * photoCost);
        break;
    }

    return costPerCommunity * communityCount;
  }

  /**
   * Calculate estimated API calls for enrichment operation
   */
  private calculateEstimatedCalls(type: 'photo' | 'review' | 'combined', communityCount: number): number {
    let callsPerCommunity = 0;

    switch (type) {
      case 'photo':
        callsPerCommunity = 1 + 1 + this.config.maxPhotosPerCommunity; // Search + Details + Photos
        break;
      case 'review':
        callsPerCommunity = 2; // Search + Details
        break;
      case 'combined':
        callsPerCommunity = 1 + 1 + this.config.maxPhotosPerCommunity; // Search + Details + Photos
        break;
    }

    return callsPerCommunity * communityCount;
  }

  /**
   * Log enrichment fire-proofing events
   */
  private async logEnrichmentEvent(event: string, sessionId: string, data: any): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      sessionId,
      data
    };

    try {
      await fs.promises.appendFile(this.logFile, JSON.stringify(logEntry) + '\n');
      console.log(`🔥 ENRICHMENT FIRE-PROOFING: ${event} - ${sessionId}`);
    } catch (error) {
      console.error('Failed to log enrichment event:', error);
    }
  }

  /**
   * Get all active sessions
   */
  getAllSessions(): EnrichmentSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Cleanup old sessions
   */
  cleanupOldSessions(): void {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - (this.config.sessionTimeoutMinutes * 60 * 1000));

    for (const [sessionId, session] of this.activeSessions) {
      if (session.startTime < cutoffTime && session.status === 'running') {
        this.timeoutSession(sessionId);
      }
    }
  }
}

export const enrichmentFireProofing = new EnrichmentFireProofing();

// Cleanup old sessions every 5 minutes
setInterval(() => {
  enrichmentFireProofing.cleanupOldSessions();
}, 5 * 60 * 1000);