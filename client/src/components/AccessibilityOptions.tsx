import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Type, 
  Volume2, 
  MousePointer, 
  AlertCircle,
  Settings,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccessibilityPreferences {
  largeText: boolean;
  highContrast: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
  emergencyButton: boolean;
}

export function AccessibilityOptions() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    largeText: false,
    highContrast: false,
    screenReader: false,
    reducedMotion: false,
    emergencyButton: true,
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('accessibilityPreferences');
    if (saved) {
      try {
        const parsedPrefs = JSON.parse(saved);
        setPreferences(parsedPrefs);
        applyPreferences(parsedPrefs);
      } catch (error) {
        console.error('Error loading accessibility preferences:', error);
      }
    }
  }, []);

  const applyPreferences = (prefs: AccessibilityPreferences) => {
    const html = document.documentElement;
    
    // Large text
    if (prefs.largeText) {
      html.classList.add('large-text');
    } else {
      html.classList.remove('large-text');
    }
    
    // High contrast
    if (prefs.highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (prefs.reducedMotion) {
      html.classList.add('reduced-motion');
    } else {
      html.classList.remove('reduced-motion');
    }
  };

  const togglePreference = (key: keyof AccessibilityPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };
    
    setPreferences(newPreferences);
    localStorage.setItem('accessibilityPreferences', JSON.stringify(newPreferences));
    applyPreferences(newPreferences);
    
    toast({
      title: 'Accessibility Updated',
      description: `${key === 'largeText' ? 'Large text' : 
                     key === 'highContrast' ? 'High contrast' :
                     key === 'screenReader' ? 'Screen reader support' :
                     key === 'reducedMotion' ? 'Reduced motion' :
                     'Emergency button'} ${newPreferences[key] ? 'enabled' : 'disabled'}`,
    });
  };

  const options = [
    {
      key: 'largeText' as keyof AccessibilityPreferences,
      icon: Type,
      label: 'Large Text',
      description: 'Increase text size for better readability',
    },
    {
      key: 'highContrast' as keyof AccessibilityPreferences,
      icon: Eye,
      label: 'High Contrast',
      description: 'Improve visibility with stronger colors',
    },
    {
      key: 'screenReader' as keyof AccessibilityPreferences,
      icon: Volume2,
      label: 'Screen Reader',
      description: 'Optimize for screen reading software',
    },
    {
      key: 'reducedMotion' as keyof AccessibilityPreferences,
      icon: MousePointer,
      label: 'Reduced Motion',
      description: 'Minimize animations and transitions',
    },
    {
      key: 'emergencyButton' as keyof AccessibilityPreferences,
      icon: AlertCircle,
      label: 'Emergency Button',
      description: 'Show quick access emergency contact button',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 pb-3 border-b border-gray-200 dark:border-gray-700">
        <Settings className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Accessibility Options</h3>
      </div>
      
      <div className="space-y-2">
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = preferences[option.key];
          
          return (
            <button
              key={option.key}
              onClick={() => togglePreference(option.key)}
              className={`w-full flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500' 
                  : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <Icon className={`h-5 w-5 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                }`} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${
                    isActive ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                  }`}>
                    {option.label}
                  </span>
                  {isActive && (
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <p className={`text-sm mt-1 ${
                  isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          These settings are saved locally and will persist across sessions.
        </p>
      </div>
    </div>
  );
}