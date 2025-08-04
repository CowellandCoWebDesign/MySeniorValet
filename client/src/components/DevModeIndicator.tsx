import { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DevCacheManager } from '@/utils/devCacheManager';

export function DevModeIndicator() {
  const [isVisible, setIsVisible] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  if (!import.meta.env.DEV || !isVisible) return null;
  
  const handleClearCache = async () => {
    setIsRefreshing(true);
    
    // Clear all browser caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    // Clear local storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Force hard reload with cache bypass
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };
  
  const cacheManager = DevCacheManager.getInstance();
  const version = cacheManager.getVersion();
  
  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-red-500 text-white rounded-lg shadow-xl p-3 flex items-center gap-2 animate-pulse">
      <div className="flex flex-col">
        <span className="text-xs font-bold">🔥 DEV MODE ACTIVE - {Date.now()}</span>
        <span className="text-xs opacity-80">Cache: {version.slice(0, 20)}...</span>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleClearCache}
        disabled={isRefreshing}
        className="bg-white text-red-500 hover:bg-gray-100"
      >
        {isRefreshing ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-1" />
            Clear Cache
          </>
        )}
      </Button>
      <button
        onClick={() => setIsVisible(false)}
        className="p-1 hover:bg-red-600 rounded"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}