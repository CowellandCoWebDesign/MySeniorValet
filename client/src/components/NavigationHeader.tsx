import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Bell, Menu, Settings, Shield, Eye, Volume2, Move, Type, Phone } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { VoiceGuidanceButton } from "@/components/VoiceGuidanceButton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAccessibilityPreferences } from "@/hooks/useAccessibilityPreferences";
import { useState } from "react";

interface NavigationHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function NavigationHeader({ 
  title, 
  subtitle, 
  showBackButton = true, 
  onBackClick 
}: NavigationHeaderProps) {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { preferences, togglePreference } = useAccessibilityPreferences();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Query for unread messages count
  const { data: unreadCount } = useQuery({
    queryKey: ['/api/messages/unread-count'],
    enabled: !!isAuthenticated,
  });

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation('/');
    }
  };

  return (
    <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b-2 border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBackButton && location !== "/" && (
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={handleBackClick}
                className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </Button>
            )}
            
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MySeniorValet
                </h1>
                {(title || subtitle) && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {title || subtitle}
                  </p>
                )}
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <VoiceGuidanceButton />
            {isAuthenticated && (
              <Link href="/dashboard?tab=messages">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount && typeof unreadCount === 'object' && 'count' in unreadCount && (unreadCount as any).count > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-xs"
                    >
                      {(unreadCount as any).count}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}