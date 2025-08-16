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
              <SheetContent side="left" className="w-[400px] sm:w-[540px] flex flex-col h-full">
                <SheetHeader className="flex-shrink-0 pb-4 border-b">
                  <SheetTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <Accessibility className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="font-bold">Accessibility Settings</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-1">
                        Customize your viewing experience
                      </p>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="sheet-scroll-container flex-1 overflow-y-auto mt-6 space-y-4 pb-6 px-4" style={{ maxHeight: 'calc(100vh - 150px)' }}>
                  {/* Emergency Button Toggle */}
                  <div className="group p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="emergency-toggle" className="text-base font-semibold flex items-center">
                          <div className="p-1.5 bg-red-500 rounded-lg mr-3">
                            <Phone className="w-4 h-4 text-white" />
                          </div>
                          Emergency Button
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-10">
                          Quick access to emergency contacts
                        </p>
                      </div>
                      <Switch
                        id="emergency-toggle"
                        checked={preferences.emergencyButton}
                        onCheckedChange={() => togglePreference('emergencyButton')}
                        className="data-[state=checked]:bg-red-500"
                      />
                    </div>
                  </div>
                  
                  {/* Voice Guidance Toggle */}
                  <div className="group p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="voice-toggle" className="text-base font-semibold flex items-center">
                          <div className="p-1.5 bg-blue-500 rounded-lg mr-3">
                            <Volume2 className="w-4 h-4 text-white" />
                          </div>
                          Voice Guidance
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-10">
                          Screen reader and voice commands
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
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* High Contrast Toggle */}
                  <div className="group p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="contrast-toggle" className="text-base font-semibold flex items-center">
                          <div className="p-1.5 bg-purple-500 rounded-lg mr-3">
                            <Contrast className="w-4 h-4 text-white" />
                          </div>
                          High Contrast
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-10">
                          Enhanced visibility for better reading
                        </p>
                      </div>
                      <Switch
                        id="contrast-toggle"
                        checked={preferences.highContrast}
                        onCheckedChange={() => togglePreference('highContrast')}
                        className="data-[state=checked]:bg-purple-500"
                      />
                    </div>
                  </div>
                  
                  {/* Large Text Toggle */}
                  <div className="group p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="text-toggle" className="text-base font-semibold flex items-center">
                          <div className="p-1.5 bg-green-500 rounded-lg mr-3">
                            <ZoomIn className="w-4 h-4 text-white" />
                          </div>
                          Large Text
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-10">
                          Bigger text for easier reading
                        </p>
                      </div>
                      <Switch
                        id="text-toggle"
                        checked={preferences.largeText}
                        onCheckedChange={() => togglePreference('largeText')}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                  </div>
                  
                  {/* Reduced Motion Toggle */}
                  <div className="group p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="motion-toggle" className="text-base font-semibold flex items-center">
                          <div className="p-1.5 bg-amber-500 rounded-lg mr-3">
                            <Move className="w-4 h-4 text-white" />
                          </div>
                          Reduced Motion
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-10">
                          Minimize animations for comfort
                        </p>
                      </div>
                      <Switch
                        id="motion-toggle"
                        checked={preferences.reducedMotion}
                        onCheckedChange={() => togglePreference('reducedMotion')}
                        className="data-[state=checked]:bg-amber-500"
                      />
                    </div>
                  </div>
                  
                  {/* Keyboard Shortcuts Info */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <div className="p-1.5 bg-gray-600 rounded-lg mr-2">
                        <Settings className="w-4 h-4 text-white" />
                      </div>
                      Keyboard Shortcuts
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        ['Alt + V', 'Toggle voice guidance'],
                        ['Alt + R', 'Read page content'],
                        ['Alt + S', 'Stop speaking'],
                        ['Alt + L', 'Voice commands'],
                        ['Alt + H', 'Help'],
                        ['Tab', 'Navigate elements'],
                        ['Enter', 'Activate selection']
                      ].map(([keys, desc]) => (
                        <div key={keys} className="flex items-center justify-between py-1">
                          <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                            {keys}
                          </kbd>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Help Section */}
                  <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-5 text-white">
                    <h3 className="font-semibold text-lg mb-2 flex items-center">
                      <div className="p-1.5 bg-white/20 rounded-lg mr-2">
                        <Phone className="w-4 h-4" />
                      </div>
                      Need Assistance?
                    </h3>
                    <p className="text-sm text-blue-50 mb-4">
                      Our support team is ready to help you with any accessibility needs.
                    </p>
                    <Button 
                      variant="secondary" 
                      className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold"
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