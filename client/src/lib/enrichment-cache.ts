/**
 * Global Enrichment Cache Manager
 * Prevents duplicate Perplexity API calls by caching results and deduplicating concurrent requests
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  expiry: number;
}

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

class EnrichmentCache {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  private readonly REQUEST_TIMEOUT = 60 * 1000; // 60 seconds for pending requests
  private readonly STORAGE_KEY = 'enrichment-cache-v1';
  
  constructor() {
    // Load cache from localStorage on initialization
    this.loadFromStorage();
  }
  
  /**
   * Load cache from localStorage
   */
  private loadFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const now = Date.now();
          // Restore only non-expired entries
          Object.entries(parsed).forEach(([key, entry]: [string, any]) => {
            if (entry.expiry > now) {
              this.cache.set(key, entry);
            }
          });
          console.log(`📦 Loaded ${this.cache.size} cached enrichment entries from storage`);
        }
      } catch (error) {
        console.error('Failed to load enrichment cache from storage:', error);
      }
    }
  }
  
  /**
   * Save cache to localStorage
   */
  private saveToStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const toStore: Record<string, CacheEntry> = {};
        const now = Date.now();
        
        // Only save non-expired entries
        this.cache.forEach((entry, key) => {
          if (entry.expiry > now) {
            toStore[key] = entry;
          }
        });
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(toStore));
      } catch (error) {
        console.error('Failed to save enrichment cache to storage:', error);
        // If localStorage is full, clear old entries
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          this.cleanup();
          try {
            const toStore: Record<string, CacheEntry> = {};
            this.cache.forEach((entry, key) => {
              toStore[key] = entry;
            });
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(toStore));
          } catch (retryError) {
            console.error('Failed to save after cleanup:', retryError);
          }
        }
      }
    }
  }

  /**
   * Get cached data without fetching (returns undefined if not cached)
   */
  get(communityId: string | number): any {
    const cacheKey = `community-${communityId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    
    return undefined;
  }

  /**
   * Get cached data or fetch if not available
   * Prevents duplicate concurrent requests for the same community
   */
  async getOrFetch(
    communityId: string | number,
    fetchFn: () => Promise<any>,
    forceRefresh = false
  ): Promise<any> {
    const cacheKey = `community-${communityId}`;
    
    // If forceRefresh is true, bypass cache
    if (!forceRefresh) {
      // Check if we have valid cached data
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        console.log(`✅ Using cached enrichment data for community ${communityId}, expires in ${Math.round((cached.expiry - Date.now()) / (1000 * 60 * 60))} hours`);
        return cached.data;
      }

      // Check if there's already a pending request for this community
      const pending = this.pendingRequests.get(cacheKey);
      if (pending && (Date.now() - pending.timestamp < this.REQUEST_TIMEOUT)) {
        console.log(`⏳ Waiting for existing enrichment request for community ${communityId}`);
        return pending.promise;
      }
    }

    // Create new request promise
    console.log(`🔄 Fetching fresh enrichment data for community ${communityId}`);
    const requestPromise = fetchFn()
      .then(data => {
        // Cache the successful result
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          expiry: Date.now() + this.CACHE_DURATION
        });
        
        // Save to localStorage
        this.saveToStorage();
        
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey);
        
        console.log(`💾 Cached enrichment data for community ${communityId} for 7 days`);
        return data;
      })
      .catch(error => {
        // Remove from pending requests on error
        this.pendingRequests.delete(cacheKey);
        throw error;
      });

    // Store as pending request
    this.pendingRequests.set(cacheKey, {
      promise: requestPromise,
      timestamp: Date.now()
    });

    return requestPromise;
  }

  /**
   * Clear cache for a specific community
   */
  clearCommunity(communityId: string | number) {
    const cacheKey = `community-${communityId}`;
    this.cache.delete(cacheKey);
    this.pendingRequests.delete(cacheKey);
    this.saveToStorage();
  }

  /**
   * Clear all cached data
   */
  clearAll() {
    this.cache.clear();
    this.pendingRequests.clear();
    this.saveToStorage();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    const validEntries = Array.from(this.cache.values()).filter(entry => entry.expiry > now);
    const expiredEntries = this.cache.size - validEntries.length;
    
    return {
      totalCached: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries,
      pendingRequests: this.pendingRequests.size
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    
    // Remove expired cache entries
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry <= now) {
        this.cache.delete(key);
      }
    }
    
    // Remove stale pending requests
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.REQUEST_TIMEOUT) {
        this.pendingRequests.delete(key);
      }
    }
  }
}

// Export singleton instance
export const enrichmentCache = new EnrichmentCache();

// Clean up expired entries every hour
if (typeof window !== 'undefined') {
  setInterval(() => {
    enrichmentCache.cleanup();
  }, 60 * 60 * 1000);
}