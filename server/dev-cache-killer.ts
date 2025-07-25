// DEVELOPMENT CACHE KILLER
// This ensures edits are visible immediately in development

import { Request, Response, NextFunction } from 'express';

export const DEV_VERSION = 'dev_' + Date.now();

// Force refresh on EVERY request in development
export function devCacheKiller(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'development') {
    // Nuclear option - prevent ALL caching
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0, post-check=0, pre-check=0',
      'Pragma': 'no-cache',
      'Expires': '-1',
      'X-Cache-Status': 'BYPASS',
      'X-Dev-Version': DEV_VERSION,
      'X-Force-Refresh': Date.now().toString(),
      'Vary': '*',
      'ETag': '', // Clear ETags
      'Last-Modified': new Date().toUTCString(),
    });
    
    // Remove conditional request handling
    delete req.headers['if-modified-since'];
    delete req.headers['if-none-match'];
    
    // For HTML files, inject cache-busting script
    if (req.path === '/' || req.path.endsWith('.html')) {
      const originalSend = res.send;
      res.send = function(data: any) {
        if (typeof data === 'string' && data.includes('<head>')) {
          // Inject aggressive cache-busting script
          const cacheScript = `
            <script>
              // DEVELOPMENT CACHE KILLER
              window.__DEV_VERSION__ = '${DEV_VERSION}';
              window.__TIMESTAMP__ = ${Date.now()};
              
              // Force reload if version mismatch
              if (localStorage.getItem('dev_version') !== window.__DEV_VERSION__) {
                localStorage.setItem('dev_version', window.__DEV_VERSION__);
                // Clear all caches
                if ('caches' in window) {
                  caches.keys().then(names => {
                    names.forEach(name => caches.delete(name));
                  });
                }
              }
              
              // Disable service workers in development
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                });
              }
              
              // Add timestamp to all module imports
              const originalImport = window.import || function(){};
              window.import = function(url) {
                const timestampedUrl = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
                return originalImport.call(this, timestampedUrl);
              };
            </script>
          `;
          data = data.replace('<head>', '<head>' + cacheScript);
          // Also update script src to bust cache
          data = data.replace('src="/src/main.tsx?t=CACHEBUST"', `src="/src/main.tsx?t=${Date.now()}"`);
          data = data.replace('src="/src/main.tsx"', `src="/src/main.tsx?t=${Date.now()}"`);
        }
        return originalSend.call(this, data);
      };
    }
  }
  next();
}

// Clear Vite cache on startup
export function clearViteCache() {
  if (process.env.NODE_ENV === 'development') {
    const viteCacheDirs = [
      path.join(process.cwd(), 'node_modules', '.vite'),
      path.join(process.cwd(), 'client', '.vite'),
      path.join(process.cwd(), '.vite'),
    ];
    
    viteCacheDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        console.log(`🗑️  Clearing Vite cache: ${dir}`);
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });
  }
}