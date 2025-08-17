import { useState, useEffect, useCallback } from 'react';

interface AccessibilityPreferences {
  largeText: boolean;
  highContrast: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
  emergencyButton: boolean;
}

const defaultPreferences: AccessibilityPreferences = {
  largeText: false,
  highContrast: false,
  screenReader: false,
  reducedMotion: false,
  emergencyButton: true,
};

export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    // Initialize from localStorage on first render
    const savedPrefs = localStorage.getItem('accessibilityPreferences');
    if (savedPrefs) {
      try {
        return { ...defaultPreferences, ...JSON.parse(savedPrefs) };
      } catch {
        return defaultPreferences;
      }
    }
    return defaultPreferences;
  });

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessibilityPreferences' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setPreferences({ ...defaultPreferences, ...parsed });
        } catch (error) {
          console.error('Error updating accessibility preferences:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updatePreferences = useCallback((newPreferences: Partial<AccessibilityPreferences>) => {
    setPreferences(current => {
      const updated = { ...current, ...newPreferences };
      localStorage.setItem('accessibilityPreferences', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const togglePreference = useCallback((key: keyof AccessibilityPreferences) => {
    setPreferences(current => {
      const updated = { ...current, [key]: !current[key] };
      localStorage.setItem('accessibilityPreferences', JSON.stringify(updated));
      console.log(`Toggled ${key}: ${current[key]} -> ${updated[key]}`);
      return updated;
    });
  }, []);

  return {
    preferences,
    updatePreferences,
    togglePreference,
  };
}