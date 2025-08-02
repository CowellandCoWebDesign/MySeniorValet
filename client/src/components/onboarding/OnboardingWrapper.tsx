import { OnboardingWizard } from './OnboardingWizard';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useLocation } from 'wouter';
import type { OnboardingData } from './OnboardingWizard';

export function OnboardingWrapper() {
  const { showOnboarding, completeOnboarding } = useOnboarding();
  const [, setLocation] = useLocation();

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

  return (
    <OnboardingWizard
      isOpen={showOnboarding}
      onComplete={handleComplete}
    />
  );
}