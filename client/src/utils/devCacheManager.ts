/**
 * Development Cache Manager
 * Ensures code changes are immediately visible during development
 * Prevents browser caching issues that block updates
 */

export class DevCacheManager {
  private static instance: DevCacheManager;
  private versionHash: string;
  private updateCheckInterval: number | null = null;
  
  private constructor() {
    this.versionHash = this.generateVersionHash();
    this.initializeCacheBusting();
  }
  
  static getInstance(): DevCacheManager {
    if (!DevCacheManager.instance) {
      DevCacheManager.instance = new DevCacheManager();
    }
    return DevCacheManager.instance;
  }
  
  private generateVersionHash(): string {
    // Force new version for cache busting - Enhanced Card Update
    return `dev-${Date.now()}-enhanced-cards-${Math.random().toString(36).substr(2, 9)}-${performance.now()}`;
  }
  
  private initializeCacheBusting(): void {
    if (import.meta.env.DEV) {
      // Clear all caches on load
      this.clearAllCaches();
      
      // Add version to all fetch requests
      this.interceptFetch();
      
      // Monitor for stale content
      this.startUpdateCheck();
      
      // Force reload on visibility change
      this.handleVisibilityChange();
      
      console.log(`🚀 DevCacheManager initialized - Version: ${this.versionHash}`);
    }
  }
  
  private async clearAllCaches(): Promise<void> {
    // Clear service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      console.log('✅ Service workers cleared');
    }
    
    // Clear Cache Storage
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('✅ Cache storage cleared');
    }
    
    // Clear session storage
    sessionStorage.clear();
    
    // Add cache-busting headers to document
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Cache-Control';
    meta.content = 'no-cache, no-store, must-revalidate';
    document.head.appendChild(meta);
  }
  
  private interceptFetch(): void {
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      // Add cache busting to all requests in dev mode
      if (typeof input === 'string' && input.startsWith('/')) {
        const url = new URL(input, window.location.origin);
        url.searchParams.set('_v', this.versionHash);
        input = url.toString();
      }
      
      // Force no-cache headers
      const headers = new Headers(init?.headers);
      headers.set('Cache-Control', 'no-cache');
      headers.set('Pragma', 'no-cache');
      
      return originalFetch(input, { ...init, headers });
    };
  }
  
  private startUpdateCheck(): void {
    // Check for updates every 5 seconds in dev mode
    this.updateCheckInterval = window.setInterval(() => {
      this.checkForUpdates();
    }, 5000);
  }
  
  private async checkForUpdates(): Promise<void> {
    try {
      const response = await fetch(`/api/dev/version?_t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.version && data.version !== this.versionHash) {
          console.log('🔄 New version detected, reloading...');
          window.location.reload();
        }
      }
    } catch (error) {
      // Silently fail - this is just a dev helper
    }
  }
  
  private handleVisibilityChange(): void {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && import.meta.env.DEV) {
        // When tab becomes visible, check for updates immediately
        this.checkForUpdates();
      }
    });
  }
  
  // Public method to force refresh
  forceRefresh(): void {
    this.versionHash = this.generateVersionHash();
    window.location.reload();
  }
  
  // Get current version for display
  getVersion(): string {
    return this.versionHash;
  }
  
  // Cleanup method
  destroy(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
    }
  }
}

// Auto-initialize in development
if (import.meta.env.DEV) {
  DevCacheManager.getInstance();
}