import { useOnboarding } from '@/contexts/OnboardingContext';
import { useMemo } from 'react';

export function usePersonalizedContent() {
  const { onboardingData, hasCompletedOnboarding } = useOnboarding();

  const personalizedFilters = useMemo(() => {
    if (!onboardingData) return null;

    return {
      location: onboardingData.location,
      careTypes: onboardingData.careType,
      budget: onboardingData.budget,
      timeline: onboardingData.timeline
    };
  }, [onboardingData]);

  const getPersonalizedGreeting = () => {
    if (!hasCompletedOnboarding || !onboardingData?.name) {
      return "Welcome to MySeniorValet";
    }
    
    const timeOfDay = new Date().getHours();
    let greeting = "Hello";
    
    if (timeOfDay < 12) greeting = "Good morning";
    else if (timeOfDay < 17) greeting = "Good afternoon";
    else greeting = "Good evening";
    
    return `${greeting}, ${onboardingData.name}`;
  };

  const getPersonalizedSearchPlaceholder = () => {
    if (!onboardingData?.location) {
      return "Search by city, state, or community name...";
    }
    return `Search communities near ${onboardingData.location}...`;
  };

  const getRecommendedBudgetFilter = () => {
    if (!onboardingData?.budget) return null;
    
    const budgetMap = {
      'hud': 'HUD Income-Qualified',
      'low': '$500-$2,000',
      'mid': '$2,000-$4,000', 
      'high': '$4,000-$6,000',
      'premium': '$6,000+',
      'flexible': 'Any Budget'
    };
    
    return budgetMap[onboardingData.budget as keyof typeof budgetMap] || null;
  };

  const getRecommendedCareTypes = () => {
    if (!onboardingData?.careType) return [];
    
    const careTypeLabels = {
      'hud': 'HUD Senior Housing',
      'independent': 'Independent Living',
      'assisted': 'Assisted Living',
      'memory': 'Memory Care',
      'skilled': 'Skilled Nursing',
      'active': '55+ Active Adult'
    };
    
    return onboardingData.careType.map(type => 
      careTypeLabels[type as keyof typeof careTypeLabels] || type
    );
  };

  const shouldShowBudgetHint = () => {
    return hasCompletedOnboarding && 
           onboardingData?.budget === 'hud' &&
           onboardingData?.careType?.includes('hud');
  };

  const getPersonalizedWelcomeMessage = () => {
    if (!hasCompletedOnboarding) return null;
    
    const careTypeCount = onboardingData?.careType?.length || 0;
    const location = onboardingData?.location || 'your area';
    
    return `Based on your preferences, we're showing you ${careTypeCount} care types in ${location}. Your personalized search is ready!`;
  };

  return {
    hasCompletedOnboarding,
    onboardingData,
    personalizedFilters,
    getPersonalizedGreeting,
    getPersonalizedSearchPlaceholder,
    getRecommendedBudgetFilter,
    getRecommendedCareTypes,
    shouldShowBudgetHint,
    getPersonalizedWelcomeMessage
  };
}