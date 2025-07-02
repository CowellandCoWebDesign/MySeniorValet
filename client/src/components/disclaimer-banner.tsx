import { Info, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function DisclaimerBanner() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has dismissed the banner before
    const dismissed = localStorage.getItem('disclaimerDismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('disclaimerDismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-900 text-white shadow-lg z-50 border-t border-blue-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Info className="h-5 w-5 text-blue-300 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-medium mb-1">
                Information Only - No Referral Fees
              </p>
              <p className="text-blue-200 leading-relaxed">
                TrueView provides publicly available information only and does not collect 
                referral fees. We are not a licensed placement agency. Always verify 
                information directly with communities before making decisions.
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-blue-300 hover:text-white hover:bg-blue-800 ml-4 flex-shrink-0"
            aria-label="Dismiss disclaimer banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}