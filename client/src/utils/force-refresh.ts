/**
 * Force refresh utilities to ensure immediate updates during development
 */

// Force a hard refresh of the page
export function forceHardRefresh() {
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  // Force reload with cache bypass
  window.location.reload();
}

// Check if data has changed and force refresh if needed
export function checkDataVersion() {
  const currentVersion = sessionStorage.getItem('dataVersion');
  const newVersion = Date.now().toString();
  
  if (currentVersion && currentVersion !== newVersion) {
    console.log('Data version changed, forcing refresh...');
    sessionStorage.setItem('dataVersion', newVersion);
    forceHardRefresh();
  } else if (!currentVersion) {
    sessionStorage.setItem('dataVersion', newVersion);
  }
}

// Auto-refresh in development mode
if (import.meta.env.DEV) {
  // Check for updates every 5 seconds in development
  setInterval(() => {
    fetch('/api/version')
      .then(res => res.json())
      .then(data => {
        const storedCount = sessionStorage.getItem('communityCount');
        if (storedCount && storedCount !== data.communityCount.toString()) {
          console.log(`Community count changed from ${storedCount} to ${data.communityCount}, forcing refresh...`);
          sessionStorage.setItem('communityCount', data.communityCount.toString());
          window.location.reload();
        } else if (!storedCount) {
          sessionStorage.setItem('communityCount', data.communityCount.toString());
        }
      })
      .catch(err => console.error('Version check failed:', err));
  }, 5000);
}