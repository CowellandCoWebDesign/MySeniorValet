import { createContext, useContext, useEffect, useState } from "react";

type MemoryFriendlyPreferences = {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  cardSize: 'compact' | 'comfortable' | 'spacious';
  showHelpTips: boolean;
  layoutType: 'simple' | 'detailed' | 'visual';
};

type MemoryFriendlyContextType = {
  preferences: MemoryFriendlyPreferences;
  updatePreferences: (prefs: Partial<MemoryFriendlyPreferences>) => void;
  getFontSizeClass: () => string;
  getCardSizeClass: () => string;
  getLayoutClass: () => string;
};

const MemoryFriendlyContext = createContext<MemoryFriendlyContextType | undefined>(undefined);

export function MemoryFriendlyProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<MemoryFriendlyPreferences>({
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    cardSize: 'comfortable',
    showHelpTips: true,
    layoutType: 'detailed'
  });

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('memory-friendly-preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load memory-friendly preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('memory-friendly-preferences', JSON.stringify(preferences));
    
    // Apply theme changes to document
    const root = document.documentElement;
    
    // Font size
    const fontSizeMap = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[preferences.fontSize]);
    
    // High contrast
    if (preferences.highContrast) {
      root.classList.add('contrast-more');
    } else {
      root.classList.remove('contrast-more');
    }
    
    // Reduced motion
    if (preferences.reducedMotion) {
      root.style.setProperty('--transition-duration', '0ms');
      root.classList.add('motion-reduce');
    } else {
      root.style.removeProperty('--transition-duration');
      root.classList.remove('motion-reduce');
    }
  }, [preferences]);

  const updatePreferences = (newPrefs: Partial<MemoryFriendlyPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  };

  const getFontSizeClass = () => {
    switch (preferences.fontSize) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      case 'extra-large': return 'text-xl';
      default: return 'text-base';
    }
  };

  const getCardSizeClass = () => {
    switch (preferences.cardSize) {
      case 'compact': return 'p-3 space-y-2';
      case 'comfortable': return 'p-4 space-y-3';
      case 'spacious': return 'p-6 space-y-4';
      default: return 'p-4 space-y-3';
    }
  };

  const getLayoutClass = () => {
    switch (preferences.layoutType) {
      case 'simple': return 'grid-cols-1 md:grid-cols-2';
      case 'detailed': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 'visual': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <MemoryFriendlyContext.Provider value={{
      preferences,
      updatePreferences,
      getFontSizeClass,
      getCardSizeClass,
      getLayoutClass
    }}>
      {children}
    </MemoryFriendlyContext.Provider>
  );
}

export function useMemoryFriendly() {
  const context = useContext(MemoryFriendlyContext);
  if (context === undefined) {
    throw new Error('useMemoryFriendly must be used within a MemoryFriendlyProvider');
  }
  return context;
}

// Senior-friendly color palette
export const seniorFriendlyColors = {
  primary: {
    light: '#3B82F6', // Blue - good contrast, easy to see
    dark: '#60A5FA'
  },
  secondary: {
    light: '#10B981', // Green - calming, positive
    dark: '#34D399'
  },
  accent: {
    light: '#F59E0B', // Amber - warm, attention-grabbing
    dark: '#FBBF24'
  },
  text: {
    primary: {
      light: '#1F2937', // Dark gray for high contrast
      dark: '#F9FAFB'   // Light gray for dark mode
    },
    secondary: {
      light: '#6B7280', // Medium gray
      dark: '#D1D5DB'
    }
  },
  background: {
    primary: {
      light: '#FFFFFF', // Pure white for clarity
      dark: '#111827'   // Dark background
    },
    secondary: {
      light: '#F9FAFB', // Very light gray
      dark: '#1F2937'
    }
  },
  border: {
    light: '#E5E7EB', // Light border for subtle separation
    dark: '#374151'
  }
};

// Memory-friendly component styles
export const memoryFriendlyStyles = {
  button: {
    base: "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    sizes: {
      compact: "h-9 px-3 text-sm",
      comfortable: "h-10 py-2 px-4",
      spacious: "h-12 py-3 px-6 text-lg"
    },
    variants: {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
      outline: "border border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-gray-500"
    }
  },
  card: {
    base: "rounded-lg border bg-white shadow-sm",
    sizes: {
      compact: "p-3",
      comfortable: "p-4",
      spacious: "p-6"
    }
  },
  text: {
    sizes: {
      small: "text-sm",
      medium: "text-base", 
      large: "text-lg",
      'extra-large': "text-xl"
    }
  }
};