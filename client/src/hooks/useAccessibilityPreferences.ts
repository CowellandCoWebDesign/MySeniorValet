import { useState, useEffect } from 'react';

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
    // Initialize state with localStorage value if available
    if (typeof window !== 'undefined') {
      const savedPrefs = localStorage.getItem('accessibilityPreferences');
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs);
          return { ...defaultPreferences, ...parsed };
        } catch (error) {
          console.error('Error loading accessibility preferences:', error);
        }
      }
    }
    return defaultPreferences;
  });

  useEffect(() => {
    // Re-sync with localStorage in case it wasn't available during SSR
    const savedPrefs = localStorage.getItem('accessibilityPreferences');
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        setPreferences({ ...defaultPreferences, ...parsed });
      } catch (error) {
        console.error('Error loading accessibility preferences:', error);
      }
    }

    // Listen for storage changes (in case preferences are updated in another tab/window)
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

  const updatePreferences = (newPreferences: Partial<AccessibilityPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    localStorage.setItem('accessibilityPreferences', JSON.stringify(updated));
  };

  const togglePreference = (key: keyof AccessibilityPreferences) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    localStorage.setItem('accessibilityPreferences', JSON.stringify(updated));
  };

  return {
    preferences,
    updatePreferences,
    togglePreference,
  };
}