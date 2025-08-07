import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Cookie, Settings } from "lucide-react";
import { Link } from "wouter";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made cookie preferences
    const savedPreferences = localStorage.getItem('cookiePreferences');
    const consentGiven = localStorage.getItem('cookieConsentGiven');
    
    if (!savedPreferences && !consentGiven) {
      // Show banner after a short delay for better UX
      setTimeout(() => {
        setShowBanner(true);
      }, 2000);
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true
    };
    
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    localStorage.setItem('cookieConsentGiven', 'true');
    setShowBanner(false);
  };

  const handleRejectOptional = () => {
    const preferences: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false
    };
    
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    localStorage.setItem('cookieConsentGiven', 'true');
    setShowBanner(false);
  };

  const handleCustomize = () => {
    setShowDetails(!showDetails);
  };

  const handleClose = () => {
    setShowBanner(false);
    // Set minimal preferences if user closes without choosing
    handleRejectOptional();
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-2xl">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Cookie className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Cookie Preferences
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  MySeniorValet uses cookies to enhance your experience, provide personalized content, 
                  and analyze platform usage. We respect your privacy and give you control over 
                  which cookies we use.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {showDetails && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Cookie Types:</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Essential:</strong> Required for site functionality
                  </span>
                  <span className="text-green-600 font-medium">Always On</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Analytics:</strong> Help us improve the platform
                  </span>
                  <span className="text-blue-600 font-medium">Recommended</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Personalization:</strong> Customize your experience
                  </span>
                  <span className="text-blue-600 font-medium">Recommended</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Marketing:</strong> Show relevant advertisements
                  </span>
                  <span className="text-gray-600 font-medium">Optional</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 text-sm">
              <Link href="/cookie-policy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
                Cookie Policy
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
                Privacy Policy
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/terms-of-service" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
                Terms of Service
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCustomize}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {showDetails ? 'Hide Details' : 'Customize'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectOptional}
              >
                Essential Only
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}