import { Link } from "wouter";
import { Home, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Search, Building, ShoppingBag, Building2, Heart, Calendar,
  CheckSquare, Truck, Users2, BookOpen, Brain, Users,
  Phone, Eye, MessageSquare, RefreshCw
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

export function SharedNavbar() {
  const [preferences, setPreferences] = useState({
    emergencyButton: false,
    voiceGuidance: false,
    highContrast: false,
    largeText: false,
    reducedMotion: false
  });

  useEffect(() => {
    const stored = localStorage.getItem('accessibilityPreferences');
    if (stored) {
      setPreferences(JSON.parse(stored));
    }
  }, []);

  const togglePreference = (key: string) => {
    const newPreferences = { ...preferences, [key]: !preferences[key as keyof typeof preferences] };
    setPreferences(newPreferences);
    localStorage.setItem('accessibilityPreferences', JSON.stringify(newPreferences));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  <Menu className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Home className="text-white h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-display font-bold text-gray-900 dark:text-white">MySeniorValet</span>
                      <span className="text-sm text-gray-500 font-medium -mt-1">Senior Living Search</span>
                    </div>
                  </div>
                  <nav className="flex flex-col space-y-1">
                    {/* Primary Navigation - Essential Services */}
                    <div className="mb-2">
                      <Link href="/" className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Home className="h-5 w-5" />
                        <span>Home</span>
                      </Link>
                      <Link href="/search" className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Search className="h-5 w-5" />
                        <span>Search Communities</span>
                      </Link>
                      <Link href="/community-portal" className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Building className="h-5 w-5" />
                        <span>Communities</span>
                      </Link>
                      <Link href="/senior-marketplace" className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">
                        <ShoppingBag className="h-5 w-5" />
                        <span>Senior Marketplace</span>
                      </Link>
                      <Link href="/senior-healthcare-directory" className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Building2 className="h-5 w-5" />
                        <span>Healthcare Directory</span>
                      </Link>
                      <Link href="/senior-resources" className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Heart className="h-5 w-5" />
                        <span>Resources & Support</span>
                      </Link>
                      <Link href="/tours" className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-sm">
                        <Calendar className="h-5 w-5" />
                        <span>Schedule Tours</span>
                      </Link>
                    </div>

                    {/* Additional Services */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="px-4 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Planning Tools
                      </p>
                      <Link href="/tour-tracker" className="flex items-center space-x-3 px-4 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                        <CheckSquare className="h-4 w-4" />
                        <span>Tour Tracker</span>
                      </Link>
                      <Link href="/move-in-coordination" className="flex items-center space-x-3 px-4 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                        <Truck className="h-4 w-4" />
                        <span>Move-In Coordination</span>
                      </Link>
                      <Link href="/family-collaboration" className="flex items-center space-x-3 px-4 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                        <Users2 className="h-4 w-4" />
                        <span>Family Collaboration</span>
                      </Link>
                    </div>

                    {/* Resources */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="px-4 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Learn & Explore
                      </p>
                      <Link href="/care-guide" className="flex items-center space-x-3 px-4 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                        <BookOpen className="h-4 w-4" />
                        <span>Care Guide</span>
                      </Link>
                      <Link href="/ai-matching-assistant" className="flex items-center space-x-3 px-4 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                        <Brain className="h-4 w-4" />
                        <span>AI Matching Assistant</span>
                      </Link>
                      <Link href="/about" className="flex items-center space-x-3 px-4 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                        <Users className="h-4 w-4" />
                        <span>About Us</span>
                      </Link>
                    </div>
                  </nav>
                  
                  {/* Accessibility Options Section */}
                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="px-4 pb-3">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Accessibility Options
                      </h3>
                    </div>
                    <div className="space-y-3 px-4">
                      {/* Emergency Button */}
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-red-500" />
                          <Label htmlFor="emergency-button" className="text-sm font-medium cursor-pointer">
                            Emergency Button
                          </Label>
                        </div>
                        <Switch
                          id="emergency-button"
                          checked={preferences.emergencyButton}
                          onCheckedChange={() => togglePreference('emergencyButton')}
                        />
                      </div>
                      
                      {/* Voice Guidance */}
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <Users2 className="h-4 w-4 text-blue-500" />
                          <Label htmlFor="voice-guidance" className="text-sm font-medium cursor-pointer">
                            Voice Guidance
                          </Label>
                        </div>
                        <Switch
                          id="voice-guidance"
                          checked={preferences.voiceGuidance}
                          onCheckedChange={() => togglePreference('voiceGuidance')}
                        />
                      </div>
                      
                      {/* High Contrast */}
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <Eye className="h-4 w-4 text-blue-600" />
                          <Label htmlFor="high-contrast" className="text-sm font-medium cursor-pointer">
                            High Contrast
                          </Label>
                        </div>
                        <Switch
                          id="high-contrast"
                          checked={preferences.highContrast}
                          onCheckedChange={() => togglePreference('highContrast')}
                        />
                      </div>
                      
                      {/* Large Text */}
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <MessageSquare className="h-4 w-4 text-green-500" />
                          <Label htmlFor="large-text" className="text-sm font-medium cursor-pointer">
                            Large Text
                          </Label>
                        </div>
                        <Switch
                          id="large-text"
                          checked={preferences.largeText}
                          onCheckedChange={() => togglePreference('largeText')}
                        />
                      </div>
                      
                      {/* Reduced Motion */}
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <RefreshCw className="h-4 w-4 text-orange-500" />
                          <Label htmlFor="reduced-motion" className="text-sm font-medium cursor-pointer">
                            Reduced Motion
                          </Label>
                        </div>
                        <Switch
                          id="reduced-motion"
                          checked={preferences.reducedMotion}
                          onCheckedChange={() => togglePreference('reducedMotion')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <Link href="/login">
                      <Button className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/signup">
                      <Button variant="outline" className="w-full">Sign Up</Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center space-x-1.5">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-md flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">MySeniorValet</span>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/login" className="text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400 transition-colors font-medium text-sm">
              Sign In
            </Link>
            <Link href="/signup" className="bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}