// Leaflet error prevention patches for _leaflet_pos errors
// These patches prevent the common "_leaflet_pos" TypeError that crashes the UI

declare const L: any;

// Patch for DOM utility functions - prevents _leaflet_pos errors
export const applyLeafletPatches = () => {
  if (typeof window === 'undefined' || !window.L) {
    return;
  }

  try {
    // Patch getPosition function to handle missing _leaflet_pos
    if (window.L.DomUtil && window.L.DomUtil.getPosition) {
      const originalGetPosition = window.L.DomUtil.getPosition;
      window.L.DomUtil.getPosition = function(el: any) {
        try {
          if (!el || !el._leaflet_pos) {
            return new window.L.Point(0, 0);
          }
          return originalGetPosition.call(this, el);
        } catch (error) {
          console.warn('Leaflet getPosition error prevented:', error);
          return new window.L.Point(0, 0);
        }
      };
    }

    // Patch setPosition function
    if (window.L.DomUtil && window.L.DomUtil.setPosition) {
      const originalSetPosition = window.L.DomUtil.setPosition;
      window.L.DomUtil.setPosition = function(el: any, point: any) {
        try {
          if (!el) return;
          return originalSetPosition.call(this, el, point);
        } catch (error) {
          console.warn('Leaflet setPosition error prevented:', error);
        }
      };
    }

    // Patch getBounds function to handle container issues
    if (window.L.Map && window.L.Map.prototype.getBounds) {
      const originalGetBounds = window.L.Map.prototype.getBounds;
      window.L.Map.prototype.getBounds = function() {
        try {
          if (!(this as any)._loaded || !this.getContainer()) {
            // Return a default bounds if map isn't ready
            return new window.L.LatLngBounds(
              new window.L.LatLng(37.7000, -122.5200),
              new window.L.LatLng(37.8200, -122.3800)
            );
          }
          return originalGetBounds.call(this);
        } catch (error) {
          console.warn('Leaflet getBounds error prevented:', error);
          // Return San Francisco area as fallback
          return new window.L.LatLngBounds(
            new window.L.LatLng(37.7000, -122.5200),
            new window.L.LatLng(37.8200, -122.3800)
          );
        }
      };
    }

    console.log('Leaflet patches applied successfully');
  } catch (error) {
    console.error('Error applying Leaflet patches:', error);
  }
};

// Global error handler for Leaflet positioning errors
export const setupLeafletErrorHandler = () => {
  const originalError = window.addEventListener;
  
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && event.error.message.includes('_leaflet_pos')) {
      console.warn('Leaflet positioning error caught and suppressed:', event.error);
      event.preventDefault();
      return false;
    }
  }, true);
};