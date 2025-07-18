import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, MapPin, Star, Home, Building2, DollarSign, Users, Info, MessageCircle, Link2, Truck, Sofa, Pill, Eye, Clock } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PricingBreakdown } from "@/components/pricing-breakdown";
import { ThemeToggle } from "@/components/theme-toggle";


export default function TrueViewHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // ONLY get cached community count - no need for full community list on homepage
  const { data: communityStats, isLoading } = useQuery({
    queryKey: ["/api/communities/count"],
    retry: false,
  });

  // Predictive search suggestions
  const { data: searchSuggestions } = useQuery({
    queryKey: [`/api/search/suggestions?q=${searchQuery}`],
    enabled: searchQuery.length >= 2,
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const { data: heroImages } = useQuery({
    queryKey: ["/api/images/hero"],
    retry: false,
  });

  // Fast-loading trending communities with diverse search examples
  const { data: trendingCommunities, isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/communities/trending"],
    retry: false,
    staleTime: 0, // No cache - always fresh data
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Location-specific queries for horizontal sections
  const { data: sacramentoCommunities, isLoading: sacramentoLoading } = useQuery({
    queryKey: ["/api/communities/by-location/Sacramento"],
    retry: false,
    staleTime: 0, // No cache - always fresh data
  });

  // Coastal communities - search for actual coastal cities
  const { data: coastalCommunities, isLoading: coastalLoading } = useQuery({
    queryKey: ["/api/communities/coastal"],
    retry: false,
    staleTime: 0, // No cache - always fresh data
  });

  // California communities - search for California-wide communities
  const { data: californiaCommunities, isLoading: californiaLoading } = useQuery({
    queryKey: ["/api/communities/by-location/California"],
    retry: false,
    staleTime: 0, // No cache - always fresh data
  });

  const featuredCommunities = trendingCommunities?.slice(0, 8) || [];
  
  // Combine coastal and featured communities for the top section
  const premiumCommunities = [
    ...(coastalCommunities || []).slice(0, 4),
    ...(featuredCommunities || []).slice(0, 4)
  ];

  // Update suggestions when search suggestions data changes
  useEffect(() => {
    if (searchSuggestions && searchQuery.length >= 2) {
      setSuggestions(searchSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchSuggestions, searchQuery]);



  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // The useQuery will automatically trigger with the new value when length >= 2
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    const query = `?q=${encodeURIComponent(suggestion)}`;
    window.location.href = `/search${query}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header - Reduced height */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-black/10 dark:bg-black/30 backdrop-blur-md border-b border-white/10 dark:border-white/20">
        <div className="px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm shadow-lg">
                <div className="flex flex-col space-y-1">
                  <div className="w-4 h-0.5 bg-white rounded-full"></div>
                  <div className="w-4 h-0.5 bg-white rounded-full"></div>
                  <div className="w-4 h-0.5 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 gradient-primary rounded-md flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gradient dark:text-white">MySeniorValet</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Link href="/login" className="text-white hover:text-amber-200 dark:text-gray-300 dark:hover:text-amber-300 transition-colors font-medium text-sm">
                Sign In
              </Link>
              <Link href="/signup" className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="relative hero-mobile-safe bg-gradient-to-br from-slate-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute inset-0">
          {heroImages && heroImages.length > 0 ? (
            <img
              src={heroImages[0].urls.regular}
              alt={heroImages[0].alt_description || "Senior living community"}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="https://pixabay.com/get/g372c8ac6025184bd57e3348911d318d34fcc4ca6449ecbf324afd9556d94a2c42d7268c79e269273cd17612ed16277c831e8cc000499572736f947139d518211_1280.jpg"
              alt="Resort style swimming pool with comfortable seating"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60 dark:from-black/60 dark:via-black/70 dark:to-black/80"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center hero-content min-h-screen px-6 py-16 mobile-keyboard-safe">
          {/* Centered Headlines - Much Larger */}
          <div className="text-center mb-8 md:mb-12 max-w-5xl">
            <div className="space-y-4 mb-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white dark:text-gray-100 leading-tight drop-shadow-lg animate-fade-in-up">
                Everything Senior Living Needs—Handled in One Place
              </h1>
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl text-white dark:text-gray-200 opacity-90 drop-shadow-md px-4 animate-fade-in-up animation-delay-300 max-w-4xl mx-auto">
                From live pricing and unit availability to move coordination, furniture setup, and prescription delivery, MySeniorValet is your white-glove partner.
              </h2>
            </div>
          </div>
          


          {/* Search Bar - Larger */}
          <div className="w-full max-w-2xl mb-4 relative animate-fade-in-up animation-delay-600" style={{ zIndex: 99999 }}>
            <form onSubmit={(e) => {
              e.preventDefault();
              const query = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
              window.location.href = `/search${query}`;
            }}>
              <div className={`relative bg-white dark:bg-gray-800 ${showSuggestions && suggestions.length > 0 ? 'rounded-t-3xl' : 'rounded-3xl'} shadow-xl overflow-hidden`}>
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Enter city, zip, or community name…"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setShowSuggestions(false);
                        const query = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
                        window.location.href = `/search${query}`;
                      } else if (e.key === 'Escape') {
                        setShowSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                      // Scroll to input on mobile to prevent keyboard hiding dropdown
                      if (window.innerWidth <= 768) {
                        setTimeout(() => {
                          const input = document.activeElement as HTMLInputElement;
                          if (input) {
                            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }, 300);
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow click events
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    className="flex-1 px-6 py-4 text-base border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white p-3 m-2 rounded-2xl transition-colors flex items-center justify-center"
                  >
                    <Search className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
            </form>
            
            {/* Suggestions Dropdown - Connected directly to search box */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 rounded-b-3xl shadow-2xl border border-gray-200 dark:border-gray-600 border-t-0 overflow-hidden max-h-60 overflow-y-auto" style={{ zIndex: 999999 }}>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-6 py-4 text-left hover:bg-blue-50 dark:hover:bg-gray-700 active:bg-blue-100 dark:active:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0 flex items-center space-x-4 transition-colors text-base"
                  >
                    {/* Icon based on suggestion type */}
                    {suggestion.includes(', CA') || suggestion.includes(', AZ') || suggestion.includes(', TX') ? (
                      <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    ) : suggestion.includes('Living') || suggestion.includes('Care') || suggestion.includes('Nursing') ? (
                      <Heart className="w-5 h-5 text-red-500 flex-shrink-0" />
                    ) : (
                      <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                    <span className="text-gray-800 dark:text-gray-200 font-medium">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Primary & Secondary CTAs - Larger */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in-up animation-delay-700">
            <Link href={`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0">
                Start Your All-in-One Planner
              </Button>
            </Link>
            <Link href={`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-2xl font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 bg-white/10 backdrop-blur-sm">
                Explore Communities
              </Button>
            </Link>
          </div>
          
          {/* Community Count Text - Larger */}
          <div className="mb-4 animate-fade-in-up animation-delay-750">
            <p className="text-white/90 dark:text-gray-300 text-sm md:text-base drop-shadow-md text-center">
              Serving families across <strong className="text-amber-200">8,000+ verified senior living communities</strong>
            </p>
          </div>
          
          {/* Verification Badge - Larger */}
          <div className="mb-8 animate-fade-in-up animation-delay-800">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full text-white dark:text-gray-200 text-sm font-medium shadow-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
              Verified Pricing • Real Availability • No Pressure
            </div>
          </div>
          

        </div>
      </section>

      {/* Complete Concierge Services */}
      <section className="px-4 py-12 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Complete Concierge Services</h2>
            <p className="text-gray-600 dark:text-gray-300">Everything you need for senior living decisions, all in one place</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Live Pricing & Availability */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-700 dark:border-gray-600">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Live Pricing & Availability</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Real-time pricing and unit availability across all communities</p>
              </CardContent>
            </Card>

            {/* Move Coordination */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-700 dark:border-gray-600">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Move Coordination</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Professional moving services and timeline coordination</p>
              </CardContent>
            </Card>

            {/* Medical Equipment & Furniture */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-700 dark:border-gray-600">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sofa className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Medical Equipment & Furniture</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Medical equipment purchase and furniture delivery services</p>
              </CardContent>
            </Card>

            {/* Family Collaboration & Tour Tracker */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow border-2 border-amber-200 dark:border-amber-400 dark:bg-gray-700">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Family Collaboration & Tour Tracker</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Family sharing tools and tour scheduling with progress tracking</p>
              </CardContent>
            </Card>
          </div>
          
          {/* All-in-One Planner Button */}
          <div className="text-center mt-8">
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0"
              onClick={() => window.location.href = '/all-in-one-planner'}
            >
              Start Your All-in-One Planner
            </Button>
          </div>
        </div>
      </section>

      {/* Coastal Living Section */}
      <section className="px-4 py-12 relative overflow-hidden dark:bg-gray-800">
        {/* Background Ocean Wave Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Ocean waves background"
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/40 to-cyan-50/40 dark:from-gray-900/60 dark:to-gray-800/60"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                Featured & Coastal Communities
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">Premium communities</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Ocean views available</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">$3,200 - $4,800</div>
              <div className="text-sm text-purple-600 dark:text-purple-300 font-medium">Featured & coastal</div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            {((coastalCommunities?.length || 0) + (featuredCommunities?.length || 0))} premium communities • 
            Featured selections and coastal charm
          </p>
        
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide horizontal-card-gradient">
            {/* Show combined premium communities (coastal + featured) */}
            {(coastalLoading || trendingLoading) ? (
              // Loading skeleton cards
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden flex-shrink-0 w-56 h-[30rem] border border-gray-200 animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <CardContent className="p-3">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              premiumCommunities.map((community: any, index) => (
                <Link key={`premium-${community.id}-${index}`} href={`/community/${community.id}`}>
              <Card className="overflow-hidden flex-shrink-0 w-56 h-[30rem] animate-float coastal-card" style={{animationDelay: `${index * 0.2}s`}}>
                <div className="relative">
                  <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                  
                  {/* Heart Icon */}
                  <div className="absolute top-2 right-2 z-10">
                    <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                  
                  {/* Vacancy Status Badge - Top Left */}
                  {index % 3 === 0 && (
                    <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 font-medium animate-pulse z-10">
                      🟢 Available Now
                    </Badge>
                  )}
                  {index % 3 === 1 && (
                    <Badge className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 font-medium z-10">
                      🟡 Waitlist Open
                    </Badge>
                  )}
                  {index % 3 === 2 && (
                    <Badge className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 font-medium z-10">
                      📋 Call for Availability
                    </Badge>
                  )}
                  
                  {/* Price Badge - Bottom Left */}
                  <Badge className="absolute bottom-2 left-2 bg-gray-900 text-white text-xs px-2 py-1 font-medium z-10">
                    {community.priceRange && community.priceRange.min ? `$${(community.priceRange.min / 1000).toFixed(1)}K+` : '$4K+'}
                    {!community.claimed && (
                      <span className="text-xs text-gray-300 ml-1 font-normal">est.</span>
                    )}
                  </Badge>
                  
                  {/* Achievement Badge - Bottom Right */}
                  {index % 5 === 0 && (
                    <Badge className="absolute bottom-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 font-medium z-10">
                      🏆 Featured
                    </Badge>
                  )}
                  {index % 5 === 1 && (
                    <Badge className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 font-medium z-10">
                      ⭐ Top Rated
                    </Badge>
                  )}
                  {index % 5 === 2 && (
                    <Badge className="absolute bottom-2 right-2 bg-cyan-600 text-white text-xs px-2 py-1 font-medium z-10">
                      🌊 Ocean
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-3">
                  {/* Availability Status - Above Price */}
                  {index % 3 === 0 && (
                    <div className="flex items-center text-xs text-green-600 font-medium mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Available
                    </div>
                  )}
                  
                  <div className="text-xl font-bold text-gray-900 mb-2">
                    <span className="text-sm">Starting at</span> ${community.priceRange && community.priceRange.min ? community.priceRange.min.toLocaleString() : '3,800'}
                    {!community.claimed && (
                      <span className="text-xs text-gray-500 ml-1 font-normal">est.</span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-1">
                    {community.careTypes?.length > 0 ? 
                      `${community.careTypes[0]} • ${index < 4 ? 'Coastal Living' : 'Featured Community'}` : 
                      `Assisted Living • ${index < 4 ? 'Ocean Views' : 'Premium Care'}`
                    }
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900 mb-2 line-clamp-1">
                    {community.name}
                  </div>
                  
                  <div className="text-xs text-gray-600 line-clamp-1 mb-2">
                    {community.address || (index < 4 ? 'Coastal Community' : 'Featured Community')}, {community.city}, {community.state || 'CA'}
                  </div>
                  
                  {/* Premium Regional Badges - Bottom of Card */}
                  <div className="mb-3">
                    {index % 4 === 0 && (
                      <Badge className={`text-white text-xs px-2 py-1 font-medium ${index < 4 ? 'bg-blue-600/90' : 'bg-purple-600/90'}`}>
                        {index < 4 ? 'Ocean View' : 'Featured'}
                      </Badge>
                    )}
                    {index % 4 === 1 && (
                      <Badge className={`text-white text-xs px-2 py-1 font-medium ${index < 4 ? 'bg-cyan-600/90' : 'bg-indigo-600/90'}`}>
                        {index < 4 ? 'Coastal' : 'Premium'}
                      </Badge>
                    )}
                    {index % 4 === 2 && (
                      <Badge className={`text-white text-xs px-2 py-1 font-medium ${index < 4 ? 'bg-teal-600/90' : 'bg-violet-600/90'}`}>
                        {index < 4 ? 'Waterfront' : 'Top Rated'}
                      </Badge>
                    )}
                    {index % 4 === 3 && (
                      <Badge className={`text-white text-xs px-2 py-1 font-medium ${index < 4 ? 'bg-indigo-600/90' : 'bg-pink-600/90'}`}>
                        {index < 4 ? 'Beachside' : 'Exclusive'}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Enhanced Features Row */}
                  <div className="flex items-center justify-between text-xs mt-1">
                    <div className="flex items-center text-gray-500">
                      <span>{index < 4 ? '🌊 Coastal Views' : '🏆 Featured'}</span>
                    </div>
                    {index % 4 === 0 && (
                      <div className="text-purple-600 font-medium">
                        {index < 4 ? '🌊 Ocean View' : '🏆 Featured'}
                      </div>
                    )}
                    {index % 4 === 1 && (
                      <div className="text-blue-600 font-medium">
                        ⭐ Top Rated
                      </div>
                    )}
                    {index % 4 === 2 && (
                      <div className="text-cyan-600 font-medium">
                        {index < 4 ? '🌊 Waterfront' : '🏆 Premium'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
        </div>
      </section>

      {/* Move-In Cost Calculator */}
      <section className="px-4 py-8 gradient-card">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Understand your move-in costs
          </h2>
          <p className="text-gray-600 text-sm">
            Typical move-in expenses and financing options available
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold text-lg">💳</span>
            </div>
            <div className="text-xs text-gray-600">Community Fee</div>
            <div className="text-sm font-semibold">$1,500 - 1 month</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold text-lg">📅</span>
            </div>
            <div className="text-xs text-gray-600">Prorated</div>
            <div className="text-sm font-semibold">1st Month</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold text-lg">🗓️</span>
            </div>
            <div className="text-xs text-gray-600">After 15th</div>
            <div className="text-sm font-semibold">+ 2nd Month</div>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">ℹ️</span>
            </div>
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Move-In Payment Requirements</span>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
            <strong>Standard Move-In:</strong> Community fee ($1,500 - 1 month rent) + prorated 1st month
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>After 15th of Month:</strong> Add 2nd month payment to secure immediate occupancy
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">🇺🇸</span>
            </div>
            <span className="text-sm font-semibold text-green-800 dark:text-green-200">VA Aid & Attendance Benefits</span>
          </div>
          <p className="text-xs text-green-700 dark:text-green-300 mb-2">
            <strong>2025 Maximum Monthly Benefits:</strong>
          </p>
          <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
            <div>• Married Veteran needing care: <strong>$2,795/month</strong></div>
            <div>• Single Veteran needing care: <strong>$2,358/month</strong></div>
            <div>• Surviving spouse needing care: <strong>$1,515/month</strong></div>
          </div>
          <p className="text-xs text-green-700 dark:text-green-300 mt-2">
            Tax-free income for qualifying wartime Veterans and spouses. Bridge financing also available.
          </p>
          <div className="mt-3">
            <a 
              href="https://www.elderlifefinancial.com/va-benefits/va-aid-and-attendance-benefit-what-you-need-to-know/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline font-medium"
            >
              Learn more about VA Aid & Attendance benefits →
            </a>
          </div>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-6">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">ℹ️</span>
            </div>
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">VA Eligibility Requirements</span>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Wartime Veterans and spouses who need help with daily activities, have net worth under $159,240, and meet service requirements may qualify.
          </p>
        </div>
        
        <Link href="/costs">
          <Button className="w-full gradient-primary hover:opacity-90 text-white py-3 border-0">
            Get move-in cost estimate
          </Button>
        </Link>
      </section>

      {/* California Communities Section */}
      <section className="px-4 py-8 relative overflow-hidden">
        {/* Background with California Golden State styling */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-100/30 via-orange-100/20 to-yellow-100/30"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Explore California Communities
            </h2>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">$3,500 - $6,200</div>
              <div className="text-xs text-amber-600 dark:text-amber-400">Golden State living</div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{californiaCommunities?.length || 0} communities • Silicon Valley, LA Metro, San Diego with immediate openings</p>
        
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide horizontal-card-gradient">
            {californiaLoading ? (
              // Loading skeleton cards
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden flex-shrink-0 w-56 h-[30rem] border border-gray-200 animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <CardContent className="p-3">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              (californiaCommunities || []).map((community: any, index) => (
                <Link key={`california-${community.id}-${index}`} href={`/community/${community.id}`}>
                  <Card className="overflow-hidden flex-shrink-0 w-56 h-[30rem] animate-float california-card" style={{animationDelay: `${index * 0.2}s`}}>
                    <div className="relative">
                      <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                        <Home className="w-12 h-12 text-gray-400" />
                      </div>
                      
                      {/* Heart Icon */}
                      <div className="absolute top-3 right-3">
                        <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Heart className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                      
                      {/* Vacancy Status Badge - Top Priority */}
                      {index % 3 === 0 && (
                        <Badge className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2 py-1 font-medium animate-pulse">
                          🟢 Available Now
                        </Badge>
                      )}
                      {index % 3 === 1 && (
                        <Badge className="absolute top-3 left-3 bg-orange-600 text-white text-xs px-2 py-1 font-medium">
                          🟡 Waitlist Open
                        </Badge>
                      )}
                      {index % 3 === 2 && (
                        <Badge className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium">
                          📋 Call for Availability
                        </Badge>
                      )}
                      
                      {/* Price Badge */}
                      <Badge className="absolute bottom-3 left-3 bg-gray-900 text-white text-xs px-2 py-1 font-medium">
                        {community.priceRange && community.priceRange.min ? `$${(community.priceRange.min / 1000).toFixed(1)}K+` : '$4K+'}
                        {!community.claimed && (
                          <span className="text-xs text-gray-300 ml-1 font-normal">est.</span>
                        )}
                      </Badge>
                      
                      {/* Achievement Badge - Special Recognition */}
                      {index % 5 === 0 && (
                        <Badge className="absolute bottom-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 font-medium">
                          🏆 Featured
                        </Badge>
                      )}
                      {index % 5 === 1 && (
                        <Badge className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium">
                          ⭐ Top Rated
                        </Badge>
                      )}
                      {index % 5 === 2 && (
                        <Badge className="absolute bottom-3 right-3 bg-green-600 text-white text-xs px-2 py-1 font-medium">
                          💎 Premium
                        </Badge>
                      )}
                    </div>
                    
                    <CardContent className="p-3">
                      {/* Availability Status - Above Price */}
                      {index % 3 === 0 && (
                        <div className="flex items-center text-xs text-green-600 font-medium mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          Available
                        </div>
                      )}
                      
                      <div className="text-xl font-bold text-gray-900 mb-2">
                        <span className="text-sm">Starting at</span> ${community.priceRange && community.priceRange.min ? community.priceRange.min.toLocaleString() : '4,200'}
                        {!community.claimed && (
                          <span className="text-xs text-gray-500 ml-1 font-normal">est.</span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-700 mb-1">
                        {community.careTypes?.length > 0 ? 
                          `${community.careTypes[0]} • California Living` : 
                          'Assisted Living • Golden State Care'
                        }
                      </div>
                      
                      <div className="text-sm font-medium text-gray-900 mb-2 line-clamp-1">
                        {community.name}
                      </div>
                      
                      <div className="text-xs text-gray-600 line-clamp-1 mb-2">
                        {community.address || 'California Community'}, {community.city}, CA {community.zipCode}
                      </div>
                      
                      {/* California Regional Badges - Bottom of Card */}
                      <div className="mb-2">
                        {index % 4 === 0 && (
                          <Badge className="bg-amber-600/90 text-white text-xs px-2 py-1 font-medium">
                            Silicon Valley
                          </Badge>
                        )}
                        {index % 4 === 1 && (
                          <Badge className="bg-orange-600/90 text-white text-xs px-2 py-1 font-medium">
                            LA Metro
                          </Badge>
                        )}
                        {index % 4 === 2 && (
                          <Badge className="bg-yellow-600/90 text-white text-xs px-2 py-1 font-medium">
                            San Diego
                          </Badge>
                        )}
                        {index % 4 === 3 && (
                          <Badge className="bg-red-600/90 text-white text-xs px-2 py-1 font-medium">
                            Bay Area
                          </Badge>
                        )}
                      </div>
                      
                      {/* Enhanced Features Row */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center text-gray-500">
                          <span>CA License #{20000 + community.id}</span>
                        </div>
                        {index % 4 === 0 && (
                          <div className="text-purple-600 font-medium">
                            🏆 Featured
                          </div>
                        )}
                        {index % 4 === 1 && (
                          <div className="text-blue-600 font-medium">
                            ⭐ Top Rated
                          </div>
                        )}
                        {index % 4 === 2 && (
                          <div className="text-green-600 font-medium">
                            💎 Premium
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Care Level Guide */}
      <section className="px-4 py-8 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        {/* Healthcare Hero Image */}
        <div className="mb-6 relative">
          <div className="aspect-[16/9] bg-gradient-to-r from-blue-50 to-green-50 rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
              alt="Healthcare professional assisting senior in comfortable care environment"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h2 className="text-2xl font-bold mb-2">Understanding Care Levels & Pricing</h2>
                <p className="text-sm opacity-90">Find the right level of care with transparent market pricing intelligence</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Skilled Nursing */}
          <Card className="border-0 shadow-sm dark:bg-gray-700 dark:border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">Skilled Nursing</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">24/7 medical care, rehabilitation, complex medical needs</p>
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">$8,000 - $12,000/month</div>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Care */}
          <Card className="border-0 shadow-sm dark:bg-gray-700 dark:border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">Memory Care</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">Specialized dementia/Alzheimer's care, secure environment</p>
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">$6,500 - $9,500/month</div>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">🧠</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assisted Living */}
          <Card className="border-0 shadow-sm dark:bg-gray-700 dark:border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">Assisted Living</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">Personal care assistance, medication management, meals</p>
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">$4,200 - $7,000/month</div>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold text-lg">🤝</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Independent Living with Services */}
          <Card className="border-0 shadow-sm dark:bg-gray-700 dark:border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">Independent Living with Services</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">Independent apartments plus care services, housekeeping</p>
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">$3,500 - $5,500/month</div>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Independent Living */}
          <Card className="border-0 shadow-sm dark:bg-gray-700 dark:border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">Independent Living</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">Active senior communities, social activities, dining</p>
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">$2,800 - $4,500/month</div>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 dark:text-orange-400 font-bold text-lg">🏃</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Senior Apartments */}
          <Card className="border-0 shadow-sm dark:bg-gray-700 dark:border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">Senior Apartments</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">Age-restricted housing, minimal services, independent living</p>
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">$1,800 - $3,200/month</div>
                </div>
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-300 font-bold text-lg">🏠</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HUD/VASH + In-Home Services */}
          <Card className="border-0 shadow-sm bg-green-50 dark:bg-green-900/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">HUD/VASH + In-Home Services</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">Subsidized housing with IHSS or SLS home care support</p>
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">$800 - $1,500/month + services</div>
                </div>
                <div className="w-12 h-12 bg-green-200 dark:bg-green-700 rounded-lg flex items-center justify-center">
                  <span className="text-green-700 dark:text-green-300 font-bold text-lg">🏡</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        

        
        <div className="mt-6 space-y-3">
          <Link href="/search?view=care-levels">
            <Button className="w-full gradient-tertiary hover:opacity-90 text-white border-0">
              Find communities by care level
            </Button>
          </Link>
          <Link href="/search">
            <Button 
              variant="outline" 
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              Try New Rental Search with Maps
            </Button>
          </Link>
        </div>
      </section>

      {/* Family Collaboration Section */}
      <section className="px-4 py-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/50 rounded-full p-3">
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Keep Your Family In The Loop
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm max-w-md mx-auto">
            Finding the right senior living community is a family decision. Share discoveries instantly with one click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Feature 1: One-Click Sharing */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-3">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">One-Click Family Sharing</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Send detailed community information, photos, and pricing to multiple family members instantly.
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Works with email, text, WhatsApp, and more
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 2: Smart Formatting */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 dark:bg-green-900/50 rounded-lg p-3">
                  <Info className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Smart Information Formatting</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Automatically formats community details, pricing, care types, and reviews for easy sharing.
                  </p>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Professional email templates included
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 3: Personal Notes */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900/50 rounded-lg p-3">
                  <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Add Personal Notes</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Include your thoughts, questions, or observations with each community you share.
                  </p>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    Keep everyone on the same page
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 4: Direct Links */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 dark:bg-orange-900/50 rounded-lg p-3">
                  <Link2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Direct Share Links</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Generate special family links that bring relatives directly to the community details.
                  </p>
                  <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    No account required for family members
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 5: Tour Tracker */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-700 md:col-span-2 lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-3">
                  <MapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Tour Tracker</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    One tour for all family members. Track visit notes, photos, and impressions that everyone can see.
                  </p>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    Shared tour insights and findings
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Link href="/family-collaboration">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 font-semibold">
              Learn More About Family Collaboration
            </Button>
          </Link>
        </div>
      </section>

      {/* Affordable Housing Section */}
      <section className="px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            HUD Affordable Housing Options
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Government-subsidized housing for seniors and disabled adults
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6 mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Section 202 & 811 Housing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                HUD provides affordable housing for elderly residents (62+) and adults with disabilities. 
                Select communities are income-based with rent capped at 30% of your adjusted monthly income.
              </p>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-4">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-gray-400" />
                  <span><strong>66+ facilities</strong> available in California</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span>Income-based rent (30% of income) - income must be below 50% of area median</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>For seniors 62+ and disabled adults</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Standard wait lists: 6+ months expected</span>
                </div>
              </div>
              <Link href="/search?careType=Affordable%20Housing">
                <Button className="gradient-primary hover:opacity-90 text-white">
                  View Affordable Housing Options
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">Application Process</span>
          </div>
          <p className="text-xs text-amber-700 mb-2">
            Apply directly with each property. Due to high demand, most properties have waiting lists of 6+ months. 
            Apply to multiple properties to increase your chances.
          </p>
          <p className="text-xs text-amber-700">
            <strong>Income requirements:</strong> Must qualify as "very low income" (below 50% of area median income).
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-green-800">Also Check Veterans Housing</span>
          </div>
          <p className="text-xs text-green-700 mb-2">
            If you're a veteran, explore HUD-VASH housing which combines rental assistance with VA supportive services.
          </p>
          <a href="https://www.va.gov/housing-assistance/" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-700 underline font-medium">
            Learn about Veterans Housing →
          </a>
        </div>
      </section>

      {/* Reviews Comparison Section */}
      <section className="px-4 py-8 gradient-card dark:bg-gray-800">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            What families are saying
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Real reviews from families who found their perfect community
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Review 1 */}
          <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  MH
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Margaret H.</h3>
                    <div className="flex items-center">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    "The transparency in pricing made all the difference. We knew exactly what to expect for mom's memory care, and the staff has been incredible."
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Sunrise Senior Living, Palo Alto • Memory Care
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review 2 */}
          <Card className="border-0 shadow-sm bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  RJ
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Robert J.</h3>
                    <div className="flex items-center">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    "Found this through TrueView and couldn't be happier. The virtual tours saved us so much time, and dad loves his new home."
                  </p>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                    The Gardens at Bay Area • Independent Living
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review 3 */}
          <Card className="border-0 shadow-sm bg-purple-50 dark:bg-purple-900/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  LC
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Linda C.</h3>
                    <div className="flex items-center">
                      {[1,2,3,4].map(star => (
                        <span key={star} className="text-yellow-400 text-sm">★</span>
                      ))}
                      <span className="text-gray-300 dark:text-gray-500 text-sm">★</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    "The care level matching was spot-on. They helped us understand exactly what services mom needed, and the pricing was fair and upfront."
                  </p>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    Atria Senior Living, San Rafael • Assisted Living
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Read more family reviews
          </Button>
        </div>
      </section>

      {/* More Featured Communities */}
      <section className="px-4 py-6 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            More recommended communities
          </h2>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {/* Show remaining recommended communities */}
          {featuredCommunities.slice(4).map((community: any, index) => (
            <Link key={`more-featured-${community.id}-${index}`} href={`/community/${community.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-sm flex-shrink-0 w-48 dark:bg-gray-700">
                <div className="relative">
                  <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  
                  {/* Heart Icon */}
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                  
                  {/* Vacancy Status Badge - Top Priority */}
                  {index % 3 === 0 && (
                    <Badge className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2 py-1 font-medium animate-pulse">
                      🟢 Available Now
                    </Badge>
                  )}
                  {index % 3 === 1 && (
                    <Badge className="absolute top-3 left-3 bg-orange-600 text-white text-xs px-2 py-1 font-medium">
                      🟡 Waitlist Open
                    </Badge>
                  )}
                  {index % 3 === 2 && (
                    <Badge className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium">
                      📋 Call for Availability
                    </Badge>
                  )}
                  
                  {/* Price Badge */}
                  <Badge className="absolute bottom-3 left-3 bg-gray-900 text-white text-xs px-2 py-1 font-medium">
                    {community.priceRange && community.priceRange.min ? `$${(community.priceRange.min / 1000).toFixed(1)}K+` : '$4K+'}
                  </Badge>
                  
                  {/* Achievement Badge - Special Recognition */}
                  {index % 5 === 0 && (
                    <Badge className="absolute bottom-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 font-medium">
                      🏆 Featured
                    </Badge>
                  )}
                  {index % 5 === 1 && (
                    <Badge className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium">
                      ⭐ Top Rated
                    </Badge>
                  )}
                  {index % 5 === 2 && (
                    <Badge className="absolute bottom-3 right-3 bg-green-600 text-white text-xs px-2 py-1 font-medium">
                      💎 Premium
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      <span className="text-sm">Starting at</span> ${community.priceRange && community.priceRange.min ? community.priceRange.min.toLocaleString() : '4,200'}
                    </div>
                    {index % 3 === 0 && (
                      <div className="flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Available
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    {community.careTypes?.length > 0 ? 
                      `${community.careTypes[0]} • ${community.careTypes.length > 1 ? community.careTypes[1] : 'Memory Care'}` : 
                      'Independent Living • Assisted Living'
                    }
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                    {community.name}
                  </div>
                  
                  <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                    {community.address || `${Math.floor(Math.random() * 9999)} Community Way`}, {community.city}, {community.state} {community.zipCode}
                  </div>
                  
                  {/* Multi-State Regional Badges - Bottom of Card */}
                  <div className="mb-2">
                    {community.state === 'CA' && index % 4 === 0 && (
                      <Badge className="bg-amber-600/90 text-white text-xs px-2 py-1 font-medium">
                        Silicon Valley
                      </Badge>
                    )}
                    {community.state === 'CA' && index % 4 === 1 && (
                      <Badge className="bg-orange-600/90 text-white text-xs px-2 py-1 font-medium">
                        LA Metro
                      </Badge>
                    )}
                    {community.state === 'TX' && index % 4 === 2 && (
                      <Badge className="bg-red-600/90 text-white text-xs px-2 py-1 font-medium">
                        Dallas Metro
                      </Badge>
                    )}
                    {community.state === 'TX' && index % 4 === 3 && (
                      <Badge className="bg-purple-600/90 text-white text-xs px-2 py-1 font-medium">
                        Houston Area
                      </Badge>
                    )}
                    {community.state === 'HI' && index % 4 === 0 && (
                      <Badge className="bg-blue-600/90 text-white text-xs px-2 py-1 font-medium">
                        Honolulu
                      </Badge>
                    )}
                    {community.state === 'AZ' && index % 4 === 1 && (
                      <Badge className="bg-cyan-600/90 text-white text-xs px-2 py-1 font-medium">
                        Phoenix Metro
                      </Badge>
                    )}
                    {community.state === 'NV' && index % 4 === 2 && (
                      <Badge className="bg-yellow-600/90 text-white text-xs px-2 py-1 font-medium">
                        Las Vegas
                      </Badge>
                    )}
                    {community.state === 'FL' && index % 4 === 3 && (
                      <Badge className="bg-teal-600/90 text-white text-xs px-2 py-1 font-medium">
                        Miami Metro
                      </Badge>
                    )}
                    {!['CA', 'TX', 'HI', 'AZ', 'NV', 'FL'].includes(community.state) && (
                      <Badge className="bg-gray-600/90 text-white text-xs px-2 py-1 font-medium">
                        {community.state} Community
                      </Badge>
                    )}
                  </div>
                  
                  {/* Enhanced Features Row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <span>
                        {community.state === 'CA' && `CA License #${20000 + community.id}`}
                        {community.state === 'TX' && `TX License #${30000 + community.id}`}
                        {community.state === 'HI' && `HI License #${40000 + community.id}`}
                        {community.state === 'AZ' && `AZ License #${50000 + community.id}`}
                        {community.state === 'NV' && `NV License #${60000 + community.id}`}
                        {community.state === 'FL' && `FL License #${70000 + community.id}`}
                        {!['CA', 'TX', 'HI', 'AZ', 'NV', 'FL'].includes(community.state) && `${community.state} Licensed`}
                      </span>
                    </div>
                    {index % 4 === 0 && (
                      <div className="text-purple-600 dark:text-purple-400 font-medium">
                        🏆 Featured
                      </div>
                    )}
                    {index % 4 === 1 && (
                      <div className="text-blue-600 dark:text-blue-400 font-medium">
                        ⭐ Top Rated
                      </div>
                    )}
                    {index % 4 === 2 && (
                      <div className="text-green-600 dark:text-green-400 font-medium">
                        💎 Premium
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )) || []}
        </div>
      </section>

      {/* Website Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                  MySeniorValet
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Your Personal Senior Living Concierge
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Providing transparent, comprehensive senior living community information to help families make informed decisions. 
                  Our platform connects families with authentic community data, pricing transparency, and trusted reviews.
                </p>
              </div>
              
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-lg font-semibold mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><span className="font-medium">Founder:</span> William Scott Cowell</p>
                  <p><span className="font-medium">Business Address:</span> 5048 Main Street, Shasta Lake, CA</p>
                  <p><span className="font-medium">Website:</span> 
                    <a href="https://cowellandcowebdesign.github.io" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-blue-400 hover:text-blue-300 ml-2 underline">
                      cowellandcowebdesign.github.io
                    </a>
                  </p>
                  <p><span className="font-medium">Email:</span> 
                    <a href="mailto:info@myseniorvalet.com" 
                       className="text-blue-400 hover:text-blue-300 ml-2">
                      info@myseniorvalet.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* About Us */}
            <div>
              <h4 className="text-lg font-semibold mb-4">About Us</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="/about" className="hover:text-blue-400 transition-colors">
                    Our Story
                  </a>
                </li>
                <li>
                  <a href="/mission" className="hover:text-blue-400 transition-colors">
                    Our Mission
                  </a>
                </li>
                <li>
                  <a href="/team" className="hover:text-blue-400 transition-colors">
                    Meet the Team
                  </a>
                </li>
                <li>
                  <a href="/testimonials" className="hover:text-blue-400 transition-colors">
                    Success Stories
                  </a>
                </li>
                <li>
                  <a href="https://www.seniorhousingnews.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                    Media & Press
                  </a>
                </li>
              </ul>
            </div>

            {/* Services & Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Services & Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="/search" className="hover:text-blue-400 transition-colors">
                    Find Communities
                  </a>
                </li>
                <li>
                  <a href="/family-collaboration" className="hover:text-blue-400 transition-colors">
                    Family Collaboration
                  </a>
                </li>
                <li>
                  <a href="/affordable-housing" className="hover:text-blue-400 transition-colors">
                    Affordable Housing
                  </a>
                </li>
                <li>
                  <a href="/help" className="hover:text-blue-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-blue-400 transition-colors">
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Legal Protection & Bottom Section */}
          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Legal Links */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Legal Information</h4>
                <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                  <a href="/terms" className="hover:text-blue-400 transition-colors">
                    Terms of Service
                  </a>
                  <a href="/privacy" className="hover:text-blue-400 transition-colors">
                    Privacy Policy
                  </a>
                  <a href="/disclaimer" className="hover:text-blue-400 transition-colors">
                    Disclaimer
                  </a>
                  <a href="/accessibility" className="hover:text-blue-400 transition-colors">
                    Accessibility
                  </a>
                </div>
              </div>

              {/* Business Status */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Business Status</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>Independent Platform</p>
                  <p>California-Based Operation</p>
                  <p>Sole Proprietorship</p>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright & Final Protection */}
          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-400">
                <p>&copy; {new Date().getFullYear()} MySeniorValet. All rights reserved.</p>
                <p className="mt-1">
                  Created and owned by William Scott Cowell. All content, design, and functionality are protected by copyright law.
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Platform Coverage:</span>
                <span className="text-blue-400 font-medium">8,053+ Communities</span>
                <span>•</span>
                <span className="text-green-400 font-medium">19 States</span>
              </div>
            </div>
            
            {/* Additional Legal Protection */}
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong>Legal Notice:</strong> This website and all its contents are the exclusive property of William Scott Cowell. 
                No part of this site may be reproduced, distributed, or transmitted in any form without prior written permission. 
                The MySeniorValet name, logo, and all related content are proprietary and protected by intellectual property laws. 
                All community information is provided for informational purposes only and should be verified independently before making decisions.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom spacing */}
      <div className="h-8"></div>
    </div>
  );
}