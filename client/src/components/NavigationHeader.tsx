import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Bell, Menu, Settings, Shield, Eye, Volume2, Move, Type, Phone, Accessibility, Contrast, ZoomIn } from "lucide-react";
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
import { useState, useEffect } from "react";

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
  const { preferences, togglePreference, updatePreferences } = useAccessibilityPreferences();
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

  // Apply accessibility preferences to the document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply high contrast
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Apply large text
    if (preferences.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // Apply reduced motion
    if (preferences.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [preferences]);

  return (
    <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b-2 border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Accessibility Menu Button - Top Left */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Accessibility menu"
                >
                  <Accessibility className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Accessibility className="w-5 h-5" />
                    Accessibility Options
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  {/* Emergency Button Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emergency-toggle" className="text-base font-medium">
                        <Phone className="inline w-4 h-4 mr-2" />
                        Emergency Button
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Show floating emergency contact button
                      </p>
                    </div>
                    <Switch
                      id="emergency-toggle"
                      checked={preferences.emergencyButton}
                      onCheckedChange={() => togglePreference('emergencyButton')}
                    />
                  </div>
                  
                  <Separator />
                  
                  {/* Voice Guidance Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="voice-toggle" className="text-base font-medium">
                        <Volume2 className="inline w-4 h-4 mr-2" />
                        Voice Guidance
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enable screen reader and voice commands
                      </p>
                    </div>
                    <Switch
                      id="voice-toggle"
                      checked={preferences.voiceGuidance}
                      onCheckedChange={() => {
                        togglePreference('voiceGuidance');
                        // Toggle the voice guidance context if available
                        const voiceButton = document.querySelector('[aria-label*="voice guidance"]');
                        if (voiceButton && voiceButton instanceof HTMLElement) {
                          voiceButton.click();
                        }
                      }}
                    />
                  </div>
                  
                  <Separator />
                  
                  {/* High Contrast Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="contrast-toggle" className="text-base font-medium">
                        <Contrast className="inline w-4 h-4 mr-2" />
                        High Contrast
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Increase color contrast for better visibility
                      </p>
                    </div>
                    <Switch
                      id="contrast-toggle"
                      checked={preferences.highContrast}
                      onCheckedChange={() => togglePreference('highContrast')}
                    />
                  </div>
                  
                  <Separator />
                  
                  {/* Large Text Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="text-toggle" className="text-base font-medium">
                        <ZoomIn className="inline w-4 h-4 mr-2" />
                        Large Text
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Increase text size for easier reading
                      </p>
                    </div>
                    <Switch
                      id="text-toggle"
                      checked={preferences.largeText}
                      onCheckedChange={() => togglePreference('largeText')}
                    />
                  </div>
                  
                  <Separator />
                  
                  {/* Reduced Motion Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="motion-toggle" className="text-base font-medium">
                        <Move className="inline w-4 h-4 mr-2" />
                        Reduced Motion
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Minimize animations and transitions
                      </p>
                    </div>
                    <Switch
                      id="motion-toggle"
                      checked={preferences.reducedMotion}
                      onCheckedChange={() => togglePreference('reducedMotion')}
                    />
                  </div>
                  
                  <Separator />
                  
                  {/* Keyboard Shortcuts Info */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Keyboard Shortcuts</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• <kbd>Alt</kbd> + <kbd>V</kbd> - Toggle voice guidance</li>
                      <li>• <kbd>Alt</kbd> + <kbd>R</kbd> - Read page content</li>
                      <li>• <kbd>Alt</kbd> + <kbd>S</kbd> - Stop speaking</li>
                      <li>• <kbd>Alt</kbd> + <kbd>L</kbd> - Voice commands</li>
                      <li>• <kbd>Alt</kbd> + <kbd>H</kbd> - Help</li>
                      <li>• <kbd>Tab</kbd> - Navigate through elements</li>
                      <li>• <kbd>Enter</kbd> - Activate buttons/links</li>
                    </ul>
                  </div>
                  
                  {/* Help Section */}
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Need Help?</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Our platform is designed to be accessible for all users. If you need assistance:
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open('tel:1-800-222-1222', '_blank')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Support: 1-800-222-1222
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
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