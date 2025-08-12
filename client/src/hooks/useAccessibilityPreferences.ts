import { useState, useEffect } from 'react';

interface AccessibilityPreferences {
  emergencyButton: boolean;
  voiceGuidance: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
}

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  emergencyButton: false, // Disabled by default
  voiceGuidance: false,
  highContrast: false,
  largeText: false,
  reducedMotion: false,
};

export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(DEFAULT_PREFERENCES);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('accessibility-preferences');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch (error) {
        console.error('Failed to parse accessibility preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage whenever they change
  const updatePreferences = (updates: Partial<AccessibilityPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    localStorage.setItem('accessibility-preferences', JSON.stringify(newPreferences));
  };

  // Toggle a specific preference
  const togglePreference = (key: keyof AccessibilityPreferences) => {
    updatePreferences({ [key]: !preferences[key] });
  };

  // Reset all preferences to defaults
  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.removeItem('accessibility-preferences');
  };

  return {
    preferences,
    updatePreferences,
    togglePreference,
    resetPreferences,
  };
}