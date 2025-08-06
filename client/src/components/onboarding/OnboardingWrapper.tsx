import { OnboardingWizard } from './OnboardingWizard';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import type { OnboardingData } from './OnboardingWizard';

export function OnboardingWrapper() {
  const { showOnboarding, completeOnboarding, setShowOnboarding } = useOnboarding();
  const [, setLocation] = useLocation();

  // Check if user just signed up and has onboarding data
  useEffect(() => {
    const storedData = localStorage.getItem('myseniorvalet_onboarding_data');
    if (storedData) {
      try {
        const data = JSON.parse(storedData) as OnboardingData;
        // Apply the stored onboarding data
        completeOnboarding(data);
        localStorage.removeItem('myseniorvalet_onboarding_data');
        
        // Navigate to map search with their preferences
        const searchParams = new URLSearchParams();
        if (data.location) searchParams.set('query', data.location);
        if (data.budget) searchParams.set('budget', data.budget);
        if (data.careType && data.careType.length > 0) {
          searchParams.set('careTypes', data.careType.join(','));
        }
        setLocation(`/map-search?${searchParams.toString()}`);
      } catch (error) {
        console.error('Failed to restore onboarding data:', error);
      }
    }
  }, []);

  const handleComplete = (data: OnboardingData) => {
    // Complete the onboarding
    completeOnboarding(data);
    
    // Navigate to map search with the onboarding data
    const searchParams = new URLSearchParams();
    if (data.location) searchParams.set('query', data.location);
    if (data.budget) searchParams.set('budget', data.budget);
    if (data.careType && data.careType.length > 0) {
      searchParams.set('careTypes', data.careType.join(','));
    }
    
    // Navigate to the map search page with parameters
    setLocation(`/map-search?${searchParams.toString()}`);
  };

  const handleSkip = () => {
    // Mark as skipped in localStorage to prevent showing again
    localStorage.setItem('myseniorvalet_onboarding_skipped', 'true');
    setShowOnboarding(false);
  };

  return (
    <OnboardingWizard
      isOpen={showOnboarding}
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}