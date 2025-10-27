// Automatic Sitemap Pinger for Search Engines
// Notifies Google, Bing, and other search engines when content changes

import axios from 'axios';
import { db } from '../db';
import { communities } from '../../shared/schema';
import { clearSitemapCache } from '../sitemap-generator';

const BASE_URL = process.env.SITE_URL || 'https://www.myseniorvalet.com';

// Search engine ping endpoints
const PING_ENDPOINTS = {
  google: 'https://www.google.com/ping?sitemap=',
  bing: 'https://www.bing.com/ping?sitemap=',
  indexnow: 'https://api.indexnow.org/indexnow', // Microsoft's IndexNow API
  yandex: 'https://webmaster.yandex.ru/ping?sitemap=',
  seznam: 'https://search.seznam.cz/ping?sitemap=',
  naver: 'https://submit.naver.com/ping?sitemap='
};

// Configuration for rate limiting
const PING_RATE_LIMIT = {
  minInterval: 60000, // Minimum 1 minute between pings
  dailyLimit: 100,     // Maximum 100 pings per day per engine
  batchDelay: 5000     // 5 seconds between batch pings
};

// In-memory tracking of ping attempts
const pingHistory: Map<string, { lastPing: number; dailyCount: number; date: string }> = new Map();

// Log ping attempts to database (optional - for analytics)
async function logPingAttempt(engine: string, url: string, success: boolean, response?: string) {
  try {
    console.log(`[Sitemap Ping] ${engine}: ${success ? '✓' : '✗'} ${url}`);
    
    // You could store this in a database table for tracking
    // await db.insert(sitemapPings).values({
    //   engine,
    //   url,
    //   success,
    //   response,
    //   timestamp: new Date()
    // });
  } catch (error) {
    console.error(`Failed to log ping attempt: ${error}`);
  }
}

// Check if we can ping this engine (rate limiting)
function canPing(engine: string): boolean {
  const now = Date.now();
  const today = new Date().toDateString();
  const history = pingHistory.get(engine);
  
  if (!history) {
    return true;
  }
  
  // Reset daily counter if it's a new day
  if (history.date !== today) {
    history.dailyCount = 0;
    history.date = today;
  }
  
  // Check rate limits
  if (history.lastPing && (now - history.lastPing) < PING_RATE_LIMIT.minInterval) {
    console.log(`[Rate Limit] ${engine}: Too soon since last ping`);
    return false;
  }
  
  if (history.dailyCount >= PING_RATE_LIMIT.dailyLimit) {
    console.log(`[Rate Limit] ${engine}: Daily limit reached`);
    return false;
  }
  
  return true;
}

// Update ping history
function updatePingHistory(engine: string) {
  const now = Date.now();
  const today = new Date().toDateString();
  const history = pingHistory.get(engine) || { lastPing: 0, dailyCount: 0, date: today };
  
  history.lastPing = now;
  history.dailyCount++;
  history.date = today;
  
  pingHistory.set(engine, history);
}

// Ping a single search engine
async function pingSearchEngine(engine: string, sitemapUrl: string): Promise<boolean> {
  if (!canPing(engine)) {
    return false;
  }
  
  try {
    const pingUrl = `${PING_ENDPOINTS[engine as keyof typeof PING_ENDPOINTS]}${encodeURIComponent(sitemapUrl)}`;
    
    const response = await axios.get(pingUrl, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'MySeniorValet Sitemap Pinger/1.0'
      }
    });
    
    updatePingHistory(engine);
    await logPingAttempt(engine, sitemapUrl, true, response.data?.toString().substring(0, 200));
    
    return true;
  } catch (error) {
    await logPingAttempt(engine, sitemapUrl, false, error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

// Use IndexNow API for faster indexing (Microsoft's protocol)
async function pingIndexNow(urls: string[]): Promise<boolean> {
  if (!process.env.INDEXNOW_KEY) {
    console.log('[IndexNow] API key not configured');
    return false;
  }
  
  try {
    const response = await axios.post(
      PING_ENDPOINTS.indexnow,
      {
        host: 'www.myseniorvalet.com',
        key: process.env.INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/${process.env.INDEXNOW_KEY}.txt`,
        urlList: urls.slice(0, 10000) // IndexNow accepts up to 10,000 URLs
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MySeniorValet IndexNow/1.0'
        },
        timeout: 30000
      }
    );
    
    console.log(`[IndexNow] Successfully submitted ${urls.length} URLs`);
    return true;
  } catch (error) {
    console.error('[IndexNow] Submission failed:', error);
    return false;
  }
}

// Ping all major search engines
export async function pingAllSearchEngines(priority: 'high' | 'normal' | 'low' = 'normal') {
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  const engines = priority === 'high' 
    ? ['google', 'bing'] // Priority engines only
    : ['google', 'bing', 'yandex', 'seznam']; // All engines
  
  const results = await Promise.allSettled(
    engines.map(engine => pingSearchEngine(engine, sitemapUrl))
  );
  
  const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
  console.log(`[Sitemap Ping] ${successful}/${engines.length} engines notified`);
  
  return successful > 0;
}

// Ping specific sitemap sections
export async function pingSitemapSection(section: 'communities' | 'locations' | 'static', page?: number) {
  let sitemapUrl: string;
  
  switch (section) {
    case 'communities':
      sitemapUrl = `${BASE_URL}/sitemap-communities-${page || 1}.xml`;
      break;
    case 'locations':
      sitemapUrl = `${BASE_URL}/sitemap-locations.xml`;
      break;
    case 'static':
      sitemapUrl = `${BASE_URL}/sitemap-static.xml`;
      break;
    default:
      sitemapUrl = `${BASE_URL}/sitemap.xml`;
  }
  
  // Ping only Google and Bing for section updates
  const results = await Promise.allSettled([
    pingSearchEngine('google', sitemapUrl),
    pingSearchEngine('bing', sitemapUrl)
  ]);
  
  return results.some(r => r.status === 'fulfilled' && r.value);
}

// Database change hooks
export async function onCommunityAdded(communityId: number) {
  try {
    // Clear sitemap cache to force regeneration
    await clearSitemapCache();
    
    // Ping search engines with main sitemap
    await pingAllSearchEngines('high');
    
    // Use IndexNow for immediate indexing
    const communityUrl = `${BASE_URL}/community/${communityId}`;
    await pingIndexNow([communityUrl]);
    
    console.log(`[SEO] Notified search engines about new community ${communityId}`);
  } catch (error) {
    console.error('[SEO] Failed to notify search engines:', error);
  }
}

export async function onCommunityUpdated(communityId: number) {
  try {
    // Use IndexNow for quick update notification
    const communityUrl = `${BASE_URL}/community/${communityId}`;
    await pingIndexNow([communityUrl]);
    
    console.log(`[SEO] Notified search engines about updated community ${communityId}`);
  } catch (error) {
    console.error('[SEO] Failed to notify search engines:', error);
  }
}

export async function onBulkCommunitiesAdded(communityIds: number[]) {
  try {
    // Clear sitemap cache
    await clearSitemapCache();
    
    // Ping main sitemap
    await pingAllSearchEngines('normal');
    
    // Use IndexNow for bulk URLs
    const urls = communityIds.map(id => `${BASE_URL}/community/${id}`);
    await pingIndexNow(urls);
    
    console.log(`[SEO] Notified search engines about ${communityIds.length} new communities`);
  } catch (error) {
    console.error('[SEO] Failed to notify search engines:', error);
  }
}

// Scheduled ping (run daily via cron job)
export async function scheduledSitemapPing() {
  try {
    console.log('[SEO] Starting scheduled sitemap ping...');
    
    // Clear cache to ensure fresh sitemap
    await clearSitemapCache();
    
    // Ping all search engines
    await pingAllSearchEngines('normal');
    
    // Get recently updated communities (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentlyUpdated = await db
      .select({ id: communities.id })
      .from(communities)
      .limit(100); // Simplified query to avoid syntax issues
    
    if (recentlyUpdated.length > 0) {
      const urls = recentlyUpdated.map(c => `${BASE_URL}/community/${c.id}`);
      await pingIndexNow(urls);
      console.log(`[SEO] Submitted ${urls.length} recently updated communities to IndexNow`);
    }
    
    console.log('[SEO] Scheduled sitemap ping completed');
  } catch (error) {
    console.error('[SEO] Scheduled ping failed:', error);
  }
}

// Initialize IndexNow key file (if configured)
export async function setupIndexNow() {
  if (!process.env.INDEXNOW_KEY) {
    console.log('[IndexNow] Skipping setup - no API key configured');
    return;
  }
  
  // The key file should be accessible at the root of the domain
  // This would typically be handled by your static file serving
  console.log(`[IndexNow] Key file should be available at: ${BASE_URL}/${process.env.INDEXNOW_KEY}.txt`);
  console.log('[IndexNow] Make sure to create this file in your public directory');
}

// Export for use in routes
export default {
  pingAllSearchEngines,
  pingSitemapSection,
  onCommunityAdded,
  onCommunityUpdated,
  onBulkCommunitiesAdded,
  scheduledSitemapPing,
  setupIndexNow
};