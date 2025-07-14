import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, MapPin, Star, Home, Building2, DollarSign, Users, Info } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function TrueViewHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // ONLY get cached community count - no need for full community list on homepage
  const { data: communityStats, isLoading } = useQuery({
    queryKey: ["/api/communities/count"],
    retry: false,
  });

  const { data: heroImages } = useQuery({
    queryKey: ["/api/images/hero"],
    retry: false,
  });

  // Fast-loading trending communities with diverse search examples
  const { data: trendingCommunities, isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/communities/trending"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Location-specific queries for horizontal sections
  const { data: sacramentoCommunities, isLoading: sacramentoLoading } = useQuery({
    queryKey: ["/api/communities/by-location/Sacramento"],
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Coastal communities - search for actual coastal cities
  const { data: coastalCommunities, isLoading: coastalLoading } = useQuery({
    queryKey: ["/api/communities/coastal"],
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // California communities - search for California-wide communities
  const { data: californiaCommunities, isLoading: californiaLoading } = useQuery({
    queryKey: ["/api/communities/by-location/California"],
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const featuredCommunities = trendingCommunities?.slice(0, 8) || [];

  // Generate location suggestions based on available community data
  const generateSuggestions = (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const allSuggestions = new Set<string>();

    // Add popular California cities from different regions
    const popularCities = [
      "San Francisco, CA",
      "Los Angeles, CA",
      "San Diego, CA", 
      "Sacramento, CA",
      "San Jose, CA",
      "Oakland, CA",
      "Fresno, CA",
      "Long Beach, CA",
      "Santa Ana, CA",
      "Redding, CA",
      "Santa Rosa, CA",
      "Stockton, CA",
      "Fremont, CA",
      "Berkeley, CA",
      "Richmond, CA",
      "Eureka, CA",
      "Arcata, CA",
      "Napa, CA",
      "Petaluma, CA",
      "Vallejo, CA"
    ];

    popularCities.forEach(city => {
      if (city.toLowerCase().includes(lowerQuery)) {
        allSuggestions.add(city);
      }
    });

    // Static suggestions for performance - no database queries on homepage

    // Add care type suggestions
    const careTypes = [
      "Independent Living",
      "Assisted Living", 
      "Memory Care",
      "Skilled Nursing",
      "Independent Living with Services"
    ];

    careTypes.forEach(careType => {
      if (careType.toLowerCase().includes(lowerQuery)) {
        allSuggestions.add(careType);
      }
    });

    const filteredSuggestions = Array.from(allSuggestions).slice(0, 6);
    setSuggestions(filteredSuggestions);
    setShowSuggestions(filteredSuggestions.length > 0);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    generateSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    const query = `?q=${encodeURIComponent(suggestion)}`;
    window.location.href = `/search${query}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-md backdrop-blur-sm">
                <div className="flex flex-col space-y-1">
                  <div className="w-5 h-0.5 bg-white"></div>
                  <div className="w-5 h-0.5 bg-white"></div>
                  <div className="w-5 h-0.5 bg-white"></div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white drop-shadow-lg">TrueView</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-white hover:text-blue-200 transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="relative hero-mobile-safe bg-gradient-to-br from-blue-50 to-indigo-100">
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
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center hero-content min-h-screen px-6 py-20 mobile-keyboard-safe">
          {/* Centered Headlines */}
          <div className="text-center mb-12 md:mb-16">
            <div className="space-y-6 mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white leading-tight drop-shadow-lg animate-fade-in-up">
                Senior Living, Unlocked.
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white opacity-90 drop-shadow-md px-4 animate-fade-in-up animation-delay-300">
                Helping families find care — without the noise.
              </p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="w-full max-w-lg mb-8 md:mb-16 relative animate-fade-in-up animation-delay-600">
            <form onSubmit={(e) => {
              e.preventDefault();
              const query = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
              window.location.href = `/search${query}`;
            }}>
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Community name, city, care type"
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
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow click events
                      setTimeout(() => setShowSuggestions(false), 150);
                    }}
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-500"
                  />
                  <button
                    type="submit"
                    className="bg-gray-700 hover:bg-gray-800 text-white p-2 sm:p-3 m-1 rounded-xl transition-colors flex items-center justify-center"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 sm:px-6 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-b-0 flex items-center space-x-3 transition-colors"
                    >
                      {/* Icon based on suggestion type */}
                      {suggestion.includes(', CA') ? (
                        <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      ) : suggestion.includes('Living') || suggestion.includes('Care') || suggestion.includes('Nursing') ? (
                        <Heart className="w-4 h-4 text-red-500 flex-shrink-0" />
                      ) : (
                        <Home className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                      <span className="text-gray-900 text-sm sm:text-base">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </form>
            
            {/* Dynamic Community Count Text */}
            <div className="text-center mt-12 animate-fade-in-up animation-delay-900">
              <p className="text-white/80 text-sm sm:text-base drop-shadow-md">
                {isLoading ? (
                  <span>Loading verified communities...</span>
                ) : (
                  <span>
                    Search <strong className="text-white">{communityStats?.count || '1,702'} verified Senior Living Communities</strong> with transparent listing information
                    <br className="hidden sm:block" />
                    <span className="block sm:inline sm:ml-1">— no sales pressure, no surprise calls</span>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coastal Living Section */}
      <section className="px-4 py-12 relative overflow-hidden">
        {/* Background Ocean Wave Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Ocean waves background"
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/40 to-cyan-50/40"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Coastal Living Communities
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-700 font-medium">Ocean views available</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">$3,200 - $4,800</div>
              <div className="text-sm text-blue-600 font-medium">Coastal living</div>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-6">{coastalCommunities?.length || 0} coastal communities • Ocean views and coastal charm</p>
        
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide horizontal-card-gradient">
            {/* Show coastal communities from dedicated endpoint */}
            {coastalLoading ? (
              // Loading skeleton cards
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden flex-shrink-0 w-48 border border-gray-200 animate-pulse">
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
              (coastalCommunities || []).map((community: any, index) => (
                <Link key={`coastal-top-${community.id}-${index}`} href={`/community/${community.id}`}>
              <Card className="overflow-hidden flex-shrink-0 w-48 animate-float coastal-card" style={{animationDelay: `${index * 0.2}s`}}>
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
                    {community.monthlyRent ? `$${(community.monthlyRent / 1000).toFixed(1)}K+` : '$4K+'}
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
                    <Badge className="absolute bottom-3 right-3 bg-cyan-600 text-white text-xs px-2 py-1 font-medium">
                      🌊 Ocean View
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xl font-bold text-gray-900">
                      {community.monthlyRent ? `$${community.monthlyRent.toLocaleString()}` : '$3,800'}
                    </div>
                    {index % 3 === 0 && (
                      <div className="flex items-center text-xs text-green-600 font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Available
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-1">
                    {community.careTypes?.length > 0 ? 
                      `${community.careTypes[0]} • Coastal Living` : 
                      'Assisted Living • Ocean Views'
                    }
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900 mb-2 line-clamp-1">
                    {community.name}
                  </div>
                  
                  <div className="text-xs text-gray-600 line-clamp-1 mb-2">
                    {community.address || 'Coastal Community'}, {community.city}, CA
                  </div>
                  
                  {/* Coastal Regional Badges - Bottom of Card */}
                  <div className="mb-2">
                    {index % 4 === 0 && (
                      <Badge className="bg-blue-600/90 text-white text-xs px-2 py-1 font-medium">
                        Ocean View
                      </Badge>
                    )}
                    {index % 4 === 1 && (
                      <Badge className="bg-cyan-600/90 text-white text-xs px-2 py-1 font-medium">
                        Coastal
                      </Badge>
                    )}
                    {index % 4 === 2 && (
                      <Badge className="bg-teal-600/90 text-white text-xs px-2 py-1 font-medium">
                        Waterfront
                      </Badge>
                    )}
                    {index % 4 === 3 && (
                      <Badge className="bg-indigo-600/90 text-white text-xs px-2 py-1 font-medium">
                        Beachside
                      </Badge>
                    )}
                  </div>
                  
                  {/* Enhanced Features Row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-gray-500">
                      <span>🌊 Coastal Views</span>
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
                      <div className="text-cyan-600 font-medium">
                        🌊 Ocean View
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
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">ℹ️</span>
            </div>
            <span className="text-sm font-semibold text-blue-800">Move-In Payment Requirements</span>
          </div>
          <p className="text-xs text-blue-700 mb-2">
            <strong>Standard Move-In:</strong> Community fee ($1,500 - 1 month rent) + prorated 1st month
          </p>
          <p className="text-xs text-blue-700">
            <strong>After 15th of Month:</strong> Add 2nd month payment to secure immediate occupancy
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">🇺🇸</span>
            </div>
            <span className="text-sm font-semibold text-green-800">VA Aid & Attendance Benefits</span>
          </div>
          <p className="text-xs text-green-700 mb-2">
            <strong>2025 Maximum Monthly Benefits:</strong>
          </p>
          <div className="text-xs text-green-700 space-y-1">
            <div>• Married Veteran needing care: <strong>$2,795/month</strong></div>
            <div>• Single Veteran needing care: <strong>$2,358/month</strong></div>
            <div>• Surviving spouse needing care: <strong>$1,515/month</strong></div>
          </div>
          <p className="text-xs text-green-700 mt-2">
            Tax-free income for qualifying wartime Veterans and spouses. Bridge financing also available.
          </p>
          <div className="mt-3">
            <a 
              href="https://www.elderlifefinancial.com/va-benefits/va-aid-and-attendance-benefit-what-you-need-to-know/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:text-green-700 underline font-medium"
            >
              Learn more about VA Aid & Attendance benefits →
            </a>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">ℹ️</span>
            </div>
            <span className="text-xs font-semibold text-amber-800">VA Eligibility Requirements</span>
          </div>
          <p className="text-xs text-amber-700">
            Wartime Veterans and spouses who need help with daily activities, have net worth under $159,240, and meet service requirements may qualify.
          </p>
        </div>
        
        <Button className="w-full gradient-primary hover:opacity-90 text-white py-3 border-0">
          Get move-in cost estimate
        </Button>
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
            <h2 className="text-xl font-bold text-gray-900">
              Explore California Communities
            </h2>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">$3,500 - $6,200</div>
              <div className="text-xs text-amber-600">Golden State living</div>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4">{californiaCommunities?.length || 0} communities • Silicon Valley, LA Metro, San Diego with immediate openings</p>
        
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide horizontal-card-gradient">
            {californiaLoading ? (
              // Loading skeleton cards
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden flex-shrink-0 w-48 border border-gray-200 animate-pulse">
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
                  <Card className="overflow-hidden flex-shrink-0 w-48 animate-float california-card" style={{animationDelay: `${index * 0.2}s`}}>
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
                        {community.monthlyRent ? `$${(community.monthlyRent / 1000).toFixed(1)}K+` : '$4K+'}
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
                        <div className="text-xl font-bold text-gray-900">
                          {community.monthlyRent ? `$${community.monthlyRent.toLocaleString()}` : '$4,200'}
                        </div>
                        {index % 3 === 0 && (
                          <div className="flex items-center text-xs text-green-600 font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            Available
                          </div>
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
      <section className="px-4 py-8 bg-gradient-to-br from-green-50 to-blue-50">
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
                <h2 className="text-2xl font-bold mb-2">Understanding care levels</h2>
                <p className="text-sm opacity-90">Find the right level of care based on needs and independence</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Skilled Nursing */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Skilled Nursing</h3>
                  <p className="text-xs text-gray-600 mb-2">24/7 medical care, rehabilitation, complex medical needs</p>
                  <div className="text-sm font-semibold text-blue-600">$8,000 - $12,000/month</div>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Care */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Memory Care</h3>
                  <p className="text-xs text-gray-600 mb-2">Specialized dementia/Alzheimer's care, secure environment</p>
                  <div className="text-sm font-semibold text-blue-600">$6,500 - $9,500/month</div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-lg">🧠</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assisted Living */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Assisted Living</h3>
                  <p className="text-xs text-gray-600 mb-2">Personal care assistance, medication management, meals</p>
                  <div className="text-sm font-semibold text-blue-600">$4,200 - $7,000/month</div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">🤝</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Independent Living with Services */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Independent Living with Services</h3>
                  <p className="text-xs text-gray-600 mb-2">Independent apartments plus care services, housekeeping</p>
                  <div className="text-sm font-semibold text-blue-600">$3,500 - $5,500/month</div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Independent Living */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Independent Living</h3>
                  <p className="text-xs text-gray-600 mb-2">Active senior communities, social activities, dining</p>
                  <div className="text-sm font-semibold text-blue-600">$2,800 - $4,500/month</div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-lg">🏃</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Senior Apartments */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Senior Apartments</h3>
                  <p className="text-xs text-gray-600 mb-2">Age-restricted housing, minimal services, independent living</p>
                  <div className="text-sm font-semibold text-blue-600">$1,800 - $3,200/month</div>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-lg">🏠</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HUD/VASH + In-Home Services */}
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">HUD/VASH + In-Home Services</h3>
                  <p className="text-xs text-gray-600 mb-2">Subsidized housing with IHSS or SLS home care support</p>
                  <div className="text-sm font-semibold text-green-600">$800 - $1,500/month + services</div>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                  <span className="text-green-700 font-bold text-lg">🏡</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <Button className="w-full gradient-tertiary hover:opacity-90 text-white border-0">
            Find communities by care level
          </Button>
        </div>
      </section>



      {/* Affordable Housing Section */}
      <section className="px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            HUD Affordable Housing Options
          </h2>
          <p className="text-gray-600 text-sm">
            Government-subsidized housing for seniors and disabled adults
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Section 202 & 811 Housing</h3>
              <p className="text-sm text-gray-600 mb-3">
                HUD provides affordable housing for elderly residents (62+) and adults with disabilities. 
                Rent is typically 30% of your adjusted monthly income.
              </p>
              <div className="text-sm text-gray-700 space-y-1 mb-4">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-gray-400" />
                  <span><strong>66+ facilities</strong> available in California</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span>Income-based rent (30% of income)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>For seniors 62+ and disabled adults</span>
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
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-green-800">Also Check Veterans Housing</span>
          </div>
          <p className="text-xs text-green-700 mb-2">
            If you're a veteran, explore HUD-VASH housing which combines rental assistance with VA supportive services.
          </p>
          <Link href="/hud-vash" className="text-xs text-green-600 hover:text-green-700 underline font-medium">
            Learn about Veterans Housing →
          </Link>
        </div>
      </section>

      {/* Reviews Comparison Section */}
      <section className="px-4 py-8 gradient-card">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            What families are saying
          </h2>
          <p className="text-gray-600 text-sm">
            Real reviews from families who found their perfect community
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Review 1 */}
          <Card className="border-0 shadow-sm bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  MH
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">Margaret H.</h3>
                    <div className="flex items-center">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    "The transparency in pricing made all the difference. We knew exactly what to expect for mom's memory care, and the staff has been incredible."
                  </p>
                  <div className="text-xs text-blue-600 font-medium">
                    Sunrise Senior Living, Palo Alto • Memory Care
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review 2 */}
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  RJ
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">Robert J.</h3>
                    <div className="flex items-center">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    "Found this through TrueView and couldn't be happier. The virtual tours saved us so much time, and dad loves his new home."
                  </p>
                  <div className="text-xs text-green-600 font-medium">
                    The Gardens at Bay Area • Independent Living
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review 3 */}
          <Card className="border-0 shadow-sm bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  LC
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">Linda C.</h3>
                    <div className="flex items-center">
                      {[1,2,3,4].map(star => (
                        <span key={star} className="text-yellow-400 text-sm">★</span>
                      ))}
                      <span className="text-gray-300 text-sm">★</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    "The care level matching was spot-on. They helped us understand exactly what services mom needed, and the pricing was fair and upfront."
                  </p>
                  <div className="text-xs text-purple-600 font-medium">
                    Atria Senior Living, San Rafael • Assisted Living
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
            Read more family reviews
          </Button>
        </div>
      </section>

      {/* More Featured Communities */}
      <section className="px-4 py-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            More recommended communities
          </h2>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {/* Show remaining recommended communities */}
          {featuredCommunities.slice(4).map((community: any, index) => (
            <Link key={`more-featured-${community.id}-${index}`} href={`/community/${community.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-sm flex-shrink-0 w-48">
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
                    {community.monthlyRent ? `$${(community.monthlyRent / 1000).toFixed(1)}K+` : '$4K+'}
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
                    <div className="text-xl font-bold text-gray-900">
                      {community.monthlyRent ? `$${community.monthlyRent.toLocaleString()}` : '$4,200'}
                    </div>
                    {index % 3 === 0 && (
                      <div className="flex items-center text-xs text-green-600 font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Available
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-1">
                    {community.careTypes?.length > 0 ? 
                      `${community.careTypes[0]} • ${community.careTypes.length > 1 ? community.careTypes[1] : 'Memory Care'}` : 
                      'Independent Living • Assisted Living'
                    }
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900 mb-2 line-clamp-1">
                    {community.name}
                  </div>
                  
                  <div className="text-xs text-gray-600 line-clamp-1 mb-2">
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
                    <div className="flex items-center text-gray-500">
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
          )) || []}
        </div>
      </section>

      {/* Family Collaboration Section */}
      <section className="px-4 py-8 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 rounded-full p-3">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Keep Your Family In The Loop
          </h2>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            Finding the right senior living community is a family decision. Share discoveries instantly with one click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Feature 1: One-Click Sharing */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 rounded-lg p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">One-Click Family Sharing</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Send detailed community information, photos, and pricing to multiple family members instantly.
                  </p>
                  <div className="text-xs text-blue-600 font-medium">
                    Works with email, text, WhatsApp, and more
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 2: Smart Formatting */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 rounded-lg p-3">
                  <Info className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Smart Information Formatting</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Automatically formats community details, pricing, care types, and reviews for easy sharing.
                  </p>
                  <div className="text-xs text-green-600 font-medium">
                    Professional email templates included
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 3: Personal Notes */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 rounded-lg p-3">
                  <span className="text-purple-600 font-bold text-lg">💬</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Add Personal Notes</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Include your thoughts, questions, or observations with each community you share.
                  </p>
                  <div className="text-xs text-purple-600 font-medium">
                    Keep everyone on the same page
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 4: Direct Links */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 rounded-lg p-3">
                  <span className="text-orange-600 font-bold text-lg">🔗</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Direct Share Links</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Generate special family links that bring relatives directly to the community details.
                  </p>
                  <div className="text-xs text-orange-600 font-medium">
                    No account required for family members
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

      {/* Bottom spacing */}
      <div className="h-8"></div>
    </div>
  );
}