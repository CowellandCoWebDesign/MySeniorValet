import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OnboardingData {
  name: string;
  location: string;
  careType: string[];
  budget: string;
  timeline: string;
  notes: string;
  preferredContact: string;
}

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  onboardingData: OnboardingData | null;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  completeOnboarding: (data: OnboardingData) => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has skipped onboarding
    const hasSkipped = localStorage.getItem('myseniorvalet_onboarding_skipped');
    if (hasSkipped) {
      setShowOnboarding(false);
      return;
    }

    // Check localStorage for existing onboarding data
    const savedData = localStorage.getItem('myseniorvalet_onboarding');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setOnboardingData(parsedData);
        setHasCompletedOnboarding(true);
      } catch (error) {
        console.error('Error parsing onboarding data:', error);
        localStorage.removeItem('myseniorvalet_onboarding');
      }
    } else {
      // Show onboarding for new users after a short delay
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = (data: OnboardingData) => {
    setOnboardingData(data);
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
    
    // Save to localStorage
    localStorage.setItem('myseniorvalet_onboarding', JSON.stringify({
      ...data,
      completedAt: new Date().toISOString()
    }));
  };

  const resetOnboarding = () => {
    setOnboardingData(null);
    setHasCompletedOnboarding(false);
    setShowOnboarding(false);
    localStorage.removeItem('myseniorvalet_onboarding');
  };

  const value = {
    hasCompletedOnboarding,
    onboardingData,
    showOnboarding,
    setShowOnboarding,
    completeOnboarding,
    resetOnboarding
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}