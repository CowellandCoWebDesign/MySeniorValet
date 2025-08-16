import { Phone, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface EmergencyContactBannerProps {
  onEmergencyClick: () => void;
}

export function EmergencyContactBanner({ onEmergencyClick }: EmergencyContactBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Card className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-[90%] max-w-md bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 shadow-lg">
      <div className="relative p-4">
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close emergency banner"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
              Quick Emergency Access
            </h3>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              Press the red button for instant access to 911 and your emergency contacts
            </p>
          </div>
          
          <Button
            onClick={onEmergencyClick}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Phone className="h-4 w-4 mr-1" />
            Emergency
          </Button>
        </div>
      </div>
    </Card>
  );
}