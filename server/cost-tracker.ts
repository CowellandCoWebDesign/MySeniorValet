/**
 * Cost Tracking System
 * Prevents $300 disasters by tracking and limiting API spending
 */

let dailyCosts = 0;
let monthlyCosts = 0;
let lastResetDate = new Date().toDateString();
let apiCallLog: Array<{
  timestamp: Date;
  endpoint: string;
  cost: number;
  dailyTotal: number;
  monthlyTotal: number;
}> = [];

const DAILY_LIMIT = 10; // $10 daily limit
const MONTHLY_LIMIT = 50; // $50 monthly limit

export function trackAPICall(endpoint: string, cost: number): void {
  const today = new Date().toDateString();
  
  // Reset daily counter if new day
  if (today !== lastResetDate) {
    dailyCosts = 0;
    lastResetDate = today;
  }
  
  dailyCosts += cost;
  monthlyCosts += cost;
  
  apiCallLog.push({
    timestamp: new Date(),
    endpoint,
    cost,
    dailyTotal: dailyCosts,
    monthlyTotal: monthlyCosts
  });
  
  console.log(`💰 API Cost: ${endpoint} +$${cost.toFixed(3)} (Daily: $${dailyCosts.toFixed(2)}, Monthly: $${monthlyCosts.toFixed(2)})`);
  
  // Keep only last 1000 calls
  if (apiCallLog.length > 1000) {
    apiCallLog = apiCallLog.slice(-1000);
  }
}

export function checkCostLimits(): { canProceed: boolean; reason?: string } {
  if (dailyCosts >= DAILY_LIMIT) {
    return { canProceed: false, reason: `Daily limit of $${DAILY_LIMIT} exceeded ($${dailyCosts.toFixed(2)})` };
  }
  
  if (monthlyCosts >= MONTHLY_LIMIT) {
    return { canProceed: false, reason: `Monthly limit of $${MONTHLY_LIMIT} exceeded ($${monthlyCosts.toFixed(2)})` };
  }
  
  return { canProceed: true };
}

export function getCostStats() {
  return {
    dailyCosts,
    monthlyCosts,
    dailyLimit: DAILY_LIMIT,
    monthlyLimit: MONTHLY_LIMIT,
    recentCalls: apiCallLog.slice(-10)
  };
}

export function resetCosts() {
  dailyCosts = 0;
  monthlyCosts = 0;
  apiCallLog = [];
  lastResetDate = new Date().toDateString();
}