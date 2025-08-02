import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePersonalizedContent } from '@/hooks/usePersonalizedContent';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  Heart, 
  Sparkles, 
  Settings,
  Star,
  Home
} from 'lucide-react';
import { Link } from 'wouter';

export function PersonalizedBanner() {
  const { 
    hasCompletedOnboarding,
    getPersonalizedGreeting,
    getPersonalizedWelcomeMessage,
    getRecommendedBudgetFilter,
    getRecommendedCareTypes,
    shouldShowBudgetHint,
    onboardingData
  } = usePersonalizedContent();
  
  const { setShowOnboarding } = useOnboarding();

  if (!hasCompletedOnboarding) {
    return null;
  }

  const budgetFilter = getRecommendedBudgetFilter();
  const careTypes = getRecommendedCareTypes();
  const welcomeMessage = getPersonalizedWelcomeMessage();

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 border-2 border-blue-200 dark:border-blue-700">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">
                  {getPersonalizedGreeting()}
                </h2>
              </div>
              {/* Mobile Actions */}
              <div className="flex gap-2 md:hidden">
                <Link href={`/map-search?query=${encodeURIComponent(onboardingData?.location || '')}&budget=${onboardingData?.budget || ''}&careTypes=${onboardingData?.careType?.join(',') || ''}`}>
                  <Button size="sm" variant="default" className="px-3">
                    <Home className="h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowOnboarding(true)}
                  className="px-3"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {welcomeMessage && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {welcomeMessage}
              </p>
            )}

            {/* Personalized Preferences Display - Optimized for Mobile */}
            <div className="space-y-3 mb-4">
              {/* Location */}
              {onboardingData?.location && (
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-2 border">
                  <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Location</span>
                    <span className="text-sm font-medium">{onboardingData.location}</span>
                  </div>
                </div>
              )}

              {/* Budget */}
              {budgetFilter && (
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-2 border">
                  <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Budget</span>
                    <span className="text-sm font-medium">{budgetFilter}</span>
                  </div>
                </div>
              )}

              {/* Timeline and Care Types on same row */}
              <div className="flex gap-2">
                {onboardingData?.timeline && (
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-2 border flex-1">
                    <Calendar className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Timeline</span>
                      <span className="text-sm font-medium">{onboardingData.timeline}</span>
                    </div>
                  </div>
                )}

                {careTypes.length > 0 && (
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-2 border flex-1">
                    <Heart className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Care Types</span>
                      <span className="text-sm font-medium">{careTypes.length} selected</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Care Types Badges - Inline */}
              {careTypes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {careTypes.map((type, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                      {type}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Special HUD Budget Hint */}
            {shouldShowBudgetHint() && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Great news! We have HUD properties starting at $0/month in your search area.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex flex-col gap-2 ml-4">
            <Link href={`/map-search?query=${encodeURIComponent(onboardingData?.location || '')}&budget=${onboardingData?.budget || ''}&careTypes=${onboardingData?.careType?.join(',') || ''}`}>
              <Button size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Find Communities
              </Button>
            </Link>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowOnboarding(true)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Update Preferences
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}