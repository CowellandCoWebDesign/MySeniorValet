import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Heart, 
  Search, 
  Calendar, 
  Users, 
  Settings, 
  Eye, 
  Type, 
  Layout, 
  Lightbulb,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  Bookmark,
  TrendingUp,
  HelpCircle,
  CheckCircle,
  ArrowRight,
  Grid3X3,
  List,
  Image,
  Palette,
  Volume2,
  VolumeX,
  Maximize,
  Home,
  RotateCcw,
  Zap
} from "lucide-react";
import { Link } from "wouter";

export default function PersonalizedDashboard() {
  // Dashboard preference state
  const [preferences, setPreferences] = useState({
    layoutType: 'comfortable' as 'simple' | 'comfortable' | 'detailed',
    fontSize: 'medium' as 'small' | 'medium' | 'large' | 'extra-large',
    highContrast: false,
    reducedMotion: false,
    cardSize: 'comfortable' as 'compact' | 'comfortable' | 'spacious',
    showHelpTips: true,
    quickActions: ['search', 'favorites', 'schedule-tour', 'family-share'],
    dashboardSections: {
      favorites: { visible: true, order: 1 },
      recentSearches: { visible: true, order: 2 },
      recommendations: { visible: true, order: 3 },
      savedCommunities: { visible: true, order: 4 },
      tourSchedule: { visible: true, order: 5 },
      familyNotes: { visible: true, order: 6 }
    }
  });

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showLayoutSuggestions, setShowLayoutSuggestions] = useState(false);

  // Sample data for demonstration
  const sampleCommunities = [
    {
      id: 1,
      name: "Sunset Manor",
      city: "Sacramento",
      state: "CA",
      rating: 4.8,
      priceRange: "$3,200 - $4,800",
      careTypes: ["Independent Living", "Assisted Living"],
      lastVisited: "2 days ago"
    },
    {
      id: 2,
      name: "Golden Years Community",
      city: "Roseville",
      state: "CA",
      rating: 4.6,
      priceRange: "$2,800 - $4,200",
      careTypes: ["Memory Care", "Assisted Living"],
      lastVisited: "1 week ago"
    }
  ];

  const recentSearches = [
    { query: "Independent Living Sacramento", date: "Today" },
    { query: "Memory Care near me", date: "Yesterday" },
    { query: "Assisted Living under $4000", date: "3 days ago" }
  ];

  const upcomingTours = [
    {
      community: "Sunset Manor",
      date: "Tomorrow",
      time: "2:00 PM",
      contact: "(916) 555-0123"
    },
    {
      community: "Peaceful Gardens",
      date: "Friday",
      time: "10:00 AM",
      contact: "(916) 555-0456"
    }
  ];

  // Memory-friendly layout suggestions
  const layoutSuggestions = [
    {
      title: "Simple & Clear",
      description: "Large buttons, minimal text, essential information only",
      icon: <Layout className="w-6 h-6" />,
      benefits: ["Less overwhelming", "Easier navigation", "Clearer focus"],
      layoutType: 'simple' as const
    },
    {
      title: "Comfortable View",
      description: "Balanced layout with helpful details and visual cues",
      icon: <Grid3X3 className="w-6 h-6" />,
      benefits: ["Good balance", "Helpful context", "Not too busy"],
      layoutType: 'comfortable' as const
    },
    {
      title: "Detailed Information",
      description: "Complete information with all available details",
      icon: <List className="w-6 h-6" />,
      benefits: ["All information", "Comprehensive view", "Power user friendly"],
      layoutType: 'detailed' as const
    }
  ];

  // Apply font size class based on preference
  const getFontSizeClass = () => {
    switch (preferences.fontSize) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      case 'extra-large': return 'text-xl';
      default: return 'text-base';
    }
  };

  // Apply card size class
  const getCardSizeClass = () => {
    switch (preferences.cardSize) {
      case 'compact': return 'p-3';
      case 'comfortable': return 'p-4';
      case 'spacious': return 'p-6';
      default: return 'p-4';
    }
  };

  const renderCustomizationPanel = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Customize Your Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Layout Suggestions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Layout Style</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLayoutSuggestions(!showLayoutSuggestions)}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Get Suggestions
            </Button>
          </div>
          
          {showLayoutSuggestions && (
            <div className="grid md:grid-cols-3 gap-4 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="col-span-3 mb-2">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Memory-Friendly Layout Suggestions</h4>
                <p className="text-sm text-blue-600 dark:text-blue-300">Choose the layout that feels most comfortable for you:</p>
              </div>
              
              {layoutSuggestions.map((suggestion) => (
                <Card 
                  key={suggestion.layoutType}
                  className={`cursor-pointer transition-all ${
                    preferences.layoutType === suggestion.layoutType 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setPreferences(prev => ({ ...prev, layoutType: suggestion.layoutType }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {suggestion.icon}
                      <h5 className="font-medium">{suggestion.title}</h5>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{suggestion.description}</p>
                    <div className="space-y-1">
                      {suggestion.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-2">
            {['simple', 'comfortable', 'detailed'].map((layout) => (
              <Button
                key={layout}
                variant={preferences.layoutType === layout ? "default" : "outline"}
                onClick={() => setPreferences(prev => ({ ...prev, layoutType: layout as any }))}
                className="capitalize"
              >
                {layout}
              </Button>
            ))}
          </div>
        </div>

        {/* Text Size */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Text Size</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { key: 'small', label: 'Small', demo: 'Aa' },
              { key: 'medium', label: 'Medium', demo: 'Aa' },
              { key: 'large', label: 'Large', demo: 'Aa' },
              { key: 'extra-large', label: 'Extra Large', demo: 'Aa' }
            ].map((size) => (
              <Button
                key={size.key}
                variant={preferences.fontSize === size.key ? "default" : "outline"}
                onClick={() => setPreferences(prev => ({ ...prev, fontSize: size.key as any }))}
                className="h-16 flex flex-col"
              >
                <span className={`${size.key === 'small' ? 'text-sm' : size.key === 'medium' ? 'text-base' : size.key === 'large' ? 'text-lg' : 'text-xl'} font-bold`}>
                  {size.demo}
                </span>
                <span className="text-xs">{size.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Accessibility Options */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Accessibility</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span>High Contrast</span>
              </div>
              <Switch
                checked={preferences.highContrast}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, highContrast: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span>Reduce Motion</span>
              </div>
              <Switch
                checked={preferences.reducedMotion}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, reducedMotion: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>Show Help Tips</span>
              </div>
              <Switch
                checked={preferences.showHelpTips}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, showHelpTips: checked }))}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Card Spacing</h3>
            <div className="grid grid-cols-3 gap-2">
              {['compact', 'comfortable', 'spacious'].map((size) => (
                <Button
                  key={size}
                  variant={preferences.cardSize === size ? "default" : "outline"}
                  onClick={() => setPreferences(prev => ({ ...prev, cardSize: size as any }))}
                  className="capitalize"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <Button onClick={() => setIsCustomizing(false)} className="flex-1">
            <CheckCircle className="w-4 h-4 mr-2" />
            Apply Changes
          </Button>
          <Button variant="outline" onClick={() => {
            setPreferences({
              layoutType: 'comfortable',
              fontSize: 'medium',
              highContrast: false,
              reducedMotion: false,
              cardSize: 'comfortable',
              showHelpTips: true,
              quickActions: ['search', 'favorites', 'schedule-tour', 'family-share'],
              dashboardSections: {
                favorites: { visible: true, order: 1 },
                recentSearches: { visible: true, order: 2 },
                recommendations: { visible: true, order: 3 },
                savedCommunities: { visible: true, order: 4 },
                tourSchedule: { visible: true, order: 5 },
                familyNotes: { visible: true, order: 6 }
              }
            });
          }}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderDashboardContent = () => {
    const baseClassName = `${getFontSizeClass()} ${preferences.highContrast ? 'contrast-more' : ''} ${preferences.reducedMotion ? '[&_*]:transition-none' : ''}`;
    
    return (
      <div className={baseClassName}>
        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
              {preferences.showHelpTips && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  <HelpCircle className="w-3 h-3 mr-1" />
                  Your most used features
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid ${preferences.layoutType === 'simple' ? 'grid-cols-2' : preferences.layoutType === 'comfortable' ? 'grid-cols-4' : 'grid-cols-6'} gap-4`}>
              <Button asChild className={`${getCardSizeClass()} flex flex-col h-auto`}>
                <Link href="/search">
                  <Search className="w-6 h-6 mb-2" />
                  <span>Search Communities</span>
                </Link>
              </Button>
              
              <Button variant="outline" className={`${getCardSizeClass()} flex flex-col h-auto`}>
                <Heart className="w-6 h-6 mb-2" />
                <span>View Favorites</span>
              </Button>
              
              <Button variant="outline" className={`${getCardSizeClass()} flex flex-col h-auto`}>
                <Calendar className="w-6 h-6 mb-2" />
                <span>Schedule Tour</span>
              </Button>
              
              <Button variant="outline" className={`${getCardSizeClass()} flex flex-col h-auto`}>
                <Users className="w-6 h-6 mb-2" />
                <span>Family Share</span>
              </Button>
              
              {preferences.layoutType !== 'simple' && (
                <>
                  <Button variant="outline" className={`${getCardSizeClass()} flex flex-col h-auto`}>
                    <Phone className="w-6 h-6 mb-2" />
                    <span>Call Support</span>
                  </Button>
                  
                  <Button variant="outline" className={`${getCardSizeClass()} flex flex-col h-auto`}>
                    <Settings className="w-6 h-6 mb-2" />
                    <span>Settings</span>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Favorites Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Your Favorite Communities
              {preferences.showHelpTips && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  <HelpCircle className="w-3 h-3 mr-1" />
                  Communities you've saved
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`space-y-${preferences.cardSize === 'compact' ? '2' : preferences.cardSize === 'comfortable' ? '4' : '6'}`}>
              {sampleCommunities.map((community) => (
                <Card key={community.id} className={`${getCardSizeClass()} hover:shadow-md transition-shadow`}>
                  <CardContent className="p-0">
                    <div className={`flex ${preferences.layoutType === 'simple' ? 'flex-col' : 'items-center justify-between'}`}>
                      <div className={`${preferences.layoutType === 'simple' ? 'mb-3' : ''}`}>
                        <h3 className="font-semibold text-lg">{community.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{community.city}, {community.state}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{community.rating}</span>
                          </div>
                          <Badge variant="outline">{community.priceRange}</Badge>
                        </div>
                        {preferences.layoutType !== 'simple' && (
                          <div className="flex gap-1 mt-2">
                            {community.careTypes.map((type) => (
                              <Badge key={type} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className={`flex ${preferences.layoutType === 'simple' ? 'justify-between' : 'flex-col'} gap-2`}>
                        <Button size="sm" asChild>
                          <Link href={`/community/${community.id}`}>
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                        {preferences.layoutType !== 'simple' && (
                          <Button size="sm" variant="outline">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Tour
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Searches */}
        {preferences.layoutType !== 'simple' && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSearches.map((search, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium">{search.query}</p>
                        <p className="text-sm text-gray-500">{search.date}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Tours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTours.map((tour, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <h4 className="font-medium">{tour.community}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{tour.date} at {tour.time}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button size="sm" variant="outline">
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                        <span className="text-sm text-gray-500">{tour.contact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/">
                  <Home className="w-5 h-5 mr-2" />
                  Home
                </Link>
              </Button>
              <h1 className="text-xl font-semibold">My Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={isCustomizing ? "default" : "outline"}
                onClick={() => setIsCustomizing(!isCustomizing)}
              >
                <Settings className="w-4 h-4 mr-2" />
                {isCustomizing ? 'Done Customizing' : 'Customize Dashboard'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isCustomizing && renderCustomizationPanel()}
        {renderDashboardContent()}
      </div>
    </div>
  );
}