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
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {getPersonalizedGreeting()}
              </h2>
            </div>
            
            {welcomeMessage && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {welcomeMessage}
              </p>
            )}

            {/* Personalized Preferences Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {onboardingData?.location && (
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3 border">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                    <div className="text-sm font-medium">{onboardingData.location}</div>
                  </div>
                </div>
              )}

              {budgetFilter && (
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3 border">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Budget</div>
                    <div className="text-sm font-medium">{budgetFilter}</div>
                  </div>
                </div>
              )}

              {onboardingData?.timeline && (
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3 border">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Timeline</div>
                    <div className="text-sm font-medium">{onboardingData.timeline}</div>
                  </div>
                </div>
              )}

              {careTypes.length > 0 && (
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3 border">
                  <Heart className="h-4 w-4 text-red-600" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Care Types</div>
                    <div className="text-sm font-medium">{careTypes.length} selected</div>
                  </div>
                </div>
              )}
            </div>

            {/* Care Types Badges */}
            {careTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {careTypes.map((type, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            )}

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

          {/* Actions */}
          <div className="flex flex-col gap-2 ml-4">
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