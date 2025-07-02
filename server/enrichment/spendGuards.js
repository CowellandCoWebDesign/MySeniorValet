import fs from 'fs/promises';
import path from 'path';

const LOG_FILE = 'server/logs/enrichment.log';
const DAILY_LIMITS = {
  yelp: 1000,      // Alert at 1000 calls/day
  google_places: 1000,  // Alert at 1000 calls/day
  foursquare: 900,      // Conservative limit under 950/day free
  twilio: 500           // Conservative daily phone validation limit
};

/**
 * Log enrichment API call with cost tracking
 */
export async function logEnrichmentCall(apiName, cost = 0) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    api: apiName,
    cost,
    date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
  };

  try {
    // Ensure logs directory exists
    await fs.mkdir('server/logs', { recursive: true });
    
    // Append to log file
    const logLine = JSON.stringify(logEntry) + '\n';
    await fs.appendFile(LOG_FILE, logLine);
    
    console.log(`[ENRICHMENT] ${apiName} call logged, cost: $${cost}`);
  } catch (error) {
    console.error('Failed to log enrichment call:', error.message);
  }
}

/**
 * Check daily API call limits and spending
 */
export async function checkDailyLimits() {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Try to read existing log file
    let logContent = '';
    try {
      logContent = await fs.readFile(LOG_FILE, 'utf-8');
    } catch (error) {
      // Log file doesn't exist yet, that's okay
      return { alertTriggered: false, dailyCounts: {} };
    }

    // Parse log entries for today
    const todayEntries = logContent
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(entry => entry && entry.date === today);

    // Count calls by API
    const dailyCounts = {};
    let totalCost = 0;

    for (const entry of todayEntries) {
      dailyCounts[entry.api] = (dailyCounts[entry.api] || 0) + 1;
      totalCost += entry.cost || 0;
    }

    // Check for limit violations
    const violations = [];
    let alertTriggered = false;

    for (const [api, limit] of Object.entries(DAILY_LIMITS)) {
      const count = dailyCounts[api] || 0;
      if (count >= limit) {
        violations.push(`${api}: ${count}/${limit} calls`);
        alertTriggered = true;
      }
    }

    // Log warnings
    if (violations.length > 0) {
      const alertMessage = `⚠️  SPEND ALERT: Daily limits exceeded - ${violations.join(', ')}`;
      console.warn(alertMessage);
      
      // Future: Send to Slack webhook
      // await sendSlackAlert(alertMessage);
    }

    return {
      alertTriggered,
      dailyCounts,
      totalCost: Math.round(totalCost * 1000) / 1000, // Round to 3 decimal places
      violations,
      date: today
    };

  } catch (error) {
    console.error('Failed to check daily limits:', error.message);
    return { 
      alertTriggered: false, 
      dailyCounts: {},
      error: error.message 
    };
  }
}

/**
 * Get spending summary for the current day
 */
export async function getDailySpendingSummary() {
  const limits = await checkDailyLimits();
  
  const summary = {
    date: limits.date,
    totalCost: limits.totalCost,
    apiCalls: limits.dailyCounts,
    violations: limits.violations || [],
    alertTriggered: limits.alertTriggered,
    limits: DAILY_LIMITS
  };

  return summary;
}

/**
 * Reset daily counters (for testing or manual reset)
 */
export async function resetDailyCounters() {
  try {
    await fs.unlink(LOG_FILE);
    console.log('Daily counters reset - log file deleted');
    return { success: true };
  } catch (error) {
    console.error('Failed to reset counters:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Future: Send Slack alert for spending violations
 */
async function sendSlackAlert(message) {
  // Placeholder for Slack webhook integration
  console.log(`[SLACK ALERT] ${message}`);
  
  // Implementation would look like:
  // if (process.env.SLACK_WEBHOOK_URL) {
  //   await fetch(process.env.SLACK_WEBHOOK_URL, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ text: message })
  //   });
  // }
}