import { useState, useEffect, useCallback } from 'react';

interface MapState {
  center: [number, number];
  zoom: number;
  bounds?: {
    sw: { lat: number; lng: number };
    ne: { lat: number; lng: number };
  };
  filters: any;
  searchQuery: string;
  viewMode: 'map' | 'list';
  resultType: 'all' | 'communities' | 'vendors' | 'healthcare' | 'resources';
  showBottomPanel: boolean;
  panelHeight: number;
}

const MAP_STATE_KEY = 'myseniorvalet-map-search-state';
const STATE_EXPIRY_HOURS = 2; // State expires after 2 hours

export function useMapSessionStorage() {
  // Load initial state from sessionStorage
  const loadState = useCallback((): Partial<MapState> | null => {
    try {
      const stored = sessionStorage.getItem(MAP_STATE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      
      // Check if state has expired
      if (parsed.timestamp) {
        const age = Date.now() - parsed.timestamp;
        if (age > STATE_EXPIRY_HOURS * 60 * 60 * 1000) {
          sessionStorage.removeItem(MAP_STATE_KEY);
          return null;
        }
      }

      return parsed.state;
    } catch (error) {
      console.error('Error loading map state from session:', error);
      return null;
    }
  }, []);

  // Save state to sessionStorage
  const saveState = useCallback((state: Partial<MapState>) => {
    try {
      const dataToStore = {
        state,
        timestamp: Date.now(),
        url: window.location.pathname
      };
      sessionStorage.setItem(MAP_STATE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving map state to session:', error);
    }
  }, []);

  // Clear stored state
  const clearState = useCallback(() => {
    try {
      sessionStorage.removeItem(MAP_STATE_KEY);
    } catch (error) {
      console.error('Error clearing map state:', error);
    }
  }, []);

  // Save state before navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      // State is already saved on each update, this is just for safety
    };

    // Listen for navigation events
    const handleNavigation = () => {
      // State is already saved on each update
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  return {
    loadState,
    saveState,
    clearState
  };
}

// Helper to debounce state saves
export function useDebounceMapSave(
  state: Partial<MapState>,
  delay: number = 500
) {
  const { saveState } = useMapSessionStorage();
  const [debouncedState, setDebouncedState] = useState(state);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedState(state);
    }, delay);

    return () => clearTimeout(timer);
  }, [state, delay]);

  useEffect(() => {
    if (debouncedState && Object.keys(debouncedState).length > 0) {
      saveState(debouncedState);
    }
  }, [debouncedState, saveState]);
}