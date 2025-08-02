import { OnboardingWizard } from './OnboardingWizard';
import { useOnboarding } from '@/contexts/OnboardingContext';

export function OnboardingWrapper() {
  const { showOnboarding, completeOnboarding } = useOnboarding();

  return (
    <OnboardingWizard
      isOpen={showOnboarding}
      onComplete={completeOnboarding}
    />
  );
}