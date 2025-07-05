/**
 * EXPANSION FIRE-PROOFING SYSTEM
 * Prevents runaway API costs from regional expansion
 */

import { apiCostProtection } from './api-cost-protection';

interface ExpansionSession {
  id: string;
  startTime: Date;
  status: 'active' | 'completed' | 'failed' | 'stopped';
  estimatedCost: number;
  actualCost: number;
  countiesProcessed: number;
  totalCounties: number;
  apiCallsMade: number;
  lastActivity: Date;
}

export class ExpansionFireProofing {
  private activeSession: ExpansionSession | null = null;
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes max per session

  /**
   * CRITICAL: Check if expansion is allowed and estimate costs
   */
  async checkExpansionAllowed(): Promise<{
    allowed: boolean;
    estimatedCost: number;
    totalApiCalls: number;
    reason?: string;
  }> {
    // Check if another session is already active
    if (this.activeSession && this.activeSession.status === 'active') {
      const timeSinceActivity = Date.now() - this.activeSession.lastActivity.getTime();
      if (timeSinceActivity < this.sessionTimeout) {
        return {
          allowed: false,
          estimatedCost: 0,
          totalApiCalls: 0,
          reason: `Another expansion session is active (started ${this.activeSession.startTime.toLocaleString()})`
        };
      } else {
        // Session timed out, mark as failed
        this.activeSession.status = 'failed';
        this.activeSession = null;
      }
    }

    // Calculate estimated costs
    const targetCounties = 24; // From regional-expansion.ts
    const avgCitiesPerCounty = 4.2;
    const queriesPerCity = 6;
    const totalApiCalls = Math.ceil(targetCounties * avgCitiesPerCounty * queriesPerCity);
    const estimatedCost = totalApiCalls * 0.032; // $0.032 per Text Search

    // Check API cost protection
    const costCheck = await apiCostProtection.checkBeforeOperation(totalApiCalls, estimatedCost);
    if (!costCheck.allowed) {
      return {
        allowed: false,
        estimatedCost,
        totalApiCalls,
        reason: costCheck.reason
      };
    }

    return {
      allowed: true,
      estimatedCost,
      totalApiCalls
    };
  }

  /**
   * Start a new expansion session with tracking
   */
  async startExpansionSession(totalCounties: number, estimatedCost: number): Promise<string> {
    const sessionId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.activeSession = {
      id: sessionId,
      startTime: new Date(),
      status: 'active',
      estimatedCost,
      actualCost: 0,
      countiesProcessed: 0,
      totalCounties,
      apiCallsMade: 0,
      lastActivity: new Date()
    };

    console.log(`🔥 EXPANSION SESSION STARTED: ${sessionId}`);
    console.log(`   Estimated Cost: $${estimatedCost.toFixed(2)}`);
    console.log(`   Counties to Process: ${totalCounties}`);

    return sessionId;
  }

  /**
   * Update session progress and costs
   */
  async updateSessionProgress(sessionId: string, countiesProcessed: number, actualCost: number, apiCallsMade: number): Promise<void> {
    if (!this.activeSession || this.activeSession.id !== sessionId) {
      throw new Error('Invalid or inactive session');
    }

    this.activeSession.countiesProcessed = countiesProcessed;
    this.activeSession.actualCost = actualCost;
    this.activeSession.apiCallsMade = apiCallsMade;
    this.activeSession.lastActivity = new Date();

    // Check if we're exceeding estimates
    if (actualCost > this.activeSession.estimatedCost * 1.5) {
      await this.emergencyStopSession(sessionId, 'Cost exceeded 150% of estimate');
    }

    // Check timeout
    const sessionDuration = Date.now() - this.activeSession.startTime.getTime();
    if (sessionDuration > this.sessionTimeout) {
      await this.emergencyStopSession(sessionId, 'Session timeout exceeded');
    }
  }

  /**
   * Emergency stop expansion session
   */
  async emergencyStopSession(sessionId: string, reason: string): Promise<void> {
    if (!this.activeSession || this.activeSession.id !== sessionId) {
      console.error(`Cannot stop session ${sessionId} - not active`);
      return;
    }

    this.activeSession.status = 'stopped';
    
    console.log(`🚨 EXPANSION EMERGENCY STOP: ${sessionId}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Counties Processed: ${this.activeSession.countiesProcessed}/${this.activeSession.totalCounties}`);
    console.log(`   Actual Cost: $${this.activeSession.actualCost.toFixed(2)}`);
    console.log(`   API Calls Made: ${this.activeSession.apiCallsMade}`);

    // Trigger API cost protection emergency stop
    await apiCostProtection.triggerEmergencyStop(`Expansion emergency stop: ${reason}`);
  }

  /**
   * Complete expansion session successfully
   */
  async completeExpansionSession(sessionId: string): Promise<void> {
    if (!this.activeSession || this.activeSession.id !== sessionId) {
      throw new Error('Invalid or inactive session');
    }

    this.activeSession.status = 'completed';
    
    console.log(`✅ EXPANSION SESSION COMPLETED: ${sessionId}`);
    console.log(`   Final Cost: $${this.activeSession.actualCost.toFixed(2)}`);
    console.log(`   Counties Processed: ${this.activeSession.countiesProcessed}/${this.activeSession.totalCounties}`);
    console.log(`   API Calls Made: ${this.activeSession.apiCallsMade}`);

    // Record final usage
    await apiCostProtection.recordUsage(
      this.activeSession.apiCallsMade,
      this.activeSession.actualCost,
      `Expansion Session ${sessionId}`
    );
  }

  /**
   * Get current session status
   */
  getCurrentSession(): ExpansionSession | null {
    return this.activeSession;
  }

  /**
   * Check if session is still valid
   */
  isSessionValid(sessionId: string): boolean {
    return this.activeSession && 
           this.activeSession.id === sessionId && 
           this.activeSession.status === 'active';
  }

  /**
   * Force cleanup of abandoned sessions
   */
  async cleanupAbandonedSessions(): Promise<void> {
    if (this.activeSession && this.activeSession.status === 'active') {
      const timeSinceActivity = Date.now() - this.activeSession.lastActivity.getTime();
      if (timeSinceActivity > this.sessionTimeout) {
        console.log(`🧹 Cleaning up abandoned session: ${this.activeSession.id}`);
        this.activeSession.status = 'failed';
        this.activeSession = null;
      }
    }
  }
}

export const expansionFireProofing = new ExpansionFireProofing();