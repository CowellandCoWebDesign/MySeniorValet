import { useState, useEffect } from "react";
import { EnhancedCommunityCard } from "@/components/EnhancedCommunityCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, MapPin, Star, Home, Building2, DollarSign, Users, Info, MessageCircle, Link2, Truck, Sofa, Pill, Eye, Clock, Phone, Brain, Sparkles, Building, Ambulance, Package, CheckCircle, Stethoscope, Activity, ShieldCheck, Scale, Utensils, Car, Scissors, Users2, FileText, Calculator, ShoppingCart, Trash2, Flower, TrendingUp, Shield, ArrowRight, Shirt as ShirtIcon, RefreshCw, ExternalLink, Globe, HeartHandshake, ChevronRight, BarChart, BarChart3, Calendar, X, Flag, Languages, Layers, ShoppingBasket, AlertCircle, Briefcase, LogIn } from "lucide-react";
import { ServiceBadges, commonBadges } from "@/components/ServiceBadges";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PricingBreakdown } from "@/components/pricing-breakdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { CareServiceCard } from "@/components/CareServiceCard";
import { ShootingStars } from "@/components/ShootingStars";
import { VendorMarketplaceTabs } from "@/components/VendorMarketplaceTabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CanadianStatsCard } from "@/components/canadian-stats-card";
import { CareSpectrumSlider } from "@/components/CareSpectrumSlider";
import { RemovalRequestModal } from "@/components/RemovalRequestModal";
import { OnboardingWrapper } from "@/components/onboarding/OnboardingWrapper";
import { PersonalizedBanner } from "@/components/onboarding/PersonalizedBanner";




export default function MySeniorValetHome() {
  console.log("MYSENIORVALET HOME PAGE LOADED - VERSION 3 WITH CONCIERGE SERVICES PRIORITIZED - 25,376 COMMUNITIES");
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAmazonCategory, setSelectedAmazonCategory] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showProtectionModal, setShowProtectionModal] = useState(false);
  const [protectionSearchQuery, setProtectionSearchQuery] = useState('');
  const [showRemovalModal, setShowRemovalModal] = useState(false);

  const [showIntegrationSpotlight, setShowIntegrationSpotlight] = useState(true);
  
  // ONLY get cached community count - no need for full community list on homepage
  const { data: communityStats, isLoading } = useQuery({
    queryKey: ["/api/communities/count"],
    retry: false,
  });

  // Removed predictive search suggestions to improve performance

  // Hero image is now permanently set to the beautiful space image

  // Enhanced platform statistics for data-driven homepage
  const { data: platformStats } = useQuery({
    queryKey: ["/api/platform/stats"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Concierge service images for matching tropical theme
  const { data: conciergeImages } = useQuery({
    queryKey: ["/api/images/concierge-services"],
    retry: false,
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });

  // Amazon product images for enhanced marketplace display
  const { data: amazonProductImages } = useQuery({
    queryKey: ["/api/amazon-products/images"],
    retry: false,
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });

  // Real-time market data
  const { data: marketData } = useQuery({
    queryKey: ["/api/market/overview"],
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // HUD properties with live pricing
  const { data: hudProperties, isLoading: hudLoading } = useQuery({
    queryKey: ["/api/communities/hud-featured"],
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // HUD count query
  const { data: hudCount } = useQuery({
    queryKey: ["/api/communities/hud-count"],
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Fast-loading trending communities with diverse search examples
  const { data: trendingCommunities, isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/communities/trending"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
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

  // Care services analytics for accurate totals
  const { data: careServicesAnalytics } = useQuery({
    queryKey: ["/api/care-services/analytics"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  // Fetch real care services from database
  const { data: careServicesData, isLoading: careServicesLoading } = useQuery({
    queryKey: ["/api/care-services"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch VA resources data
  const { data: vaResourcesData, isLoading: vaResourcesLoading } = useQuery({
    queryKey: ["/api/va-resources/facilities"],
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const vaFacilities = (vaResourcesData as any)?.facilities || {};

  // Canadian communities query
  const { data: canadianCommunities, isLoading: canadianLoading } = useQuery({
    queryKey: ["/api/communities/canadian/featured"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const featuredCommunities = (trendingCommunities as any[])?.slice(0, 8) || [];
  
  // Combine coastal and featured communities for the top section
  const premiumCommunities = [
    ...((coastalCommunities as any[]) || []).slice(0, 4),
    ...((featuredCommunities as any[]) || []).slice(0, 4)
  ];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
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
              <LanguageSwitcher />
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
      <section className="relative min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute inset-0">
          <img
            src="https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg"
            alt="Beautiful cosmic space imagery symbolizing infinite possibilities in senior living"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60 dark:from-black/60 dark:via-black/70 dark:to-black/80"></div>
        </div>
        
        {/* Shooting Stars Animation */}
        <ShootingStars />
        
        <div className="relative z-10 flex flex-col items-center justify-center hero-content min-h-screen px-6 py-8 mobile-keyboard-safe">
          {/* Centered Headlines - Optimized for Desktop */}
          <div className="text-center mb-6 md:mb-8 max-w-7xl">
            <div className="space-y-6 mb-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white dark:text-gray-100 leading-tight drop-shadow-2xl tracking-tight">
                <span className="block mb-3 hero-text-main animate-space-entry animate-cosmic-glow">{t('hero.title')}</span>
              </h1>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white dark:text-gray-200 opacity-95 drop-shadow-lg px-4 animate-space-warp max-w-5xl mx-auto font-medium leading-relaxed" style={{ animationDelay: '0.8s' }}>
                {t('hero.subtitle')}
              </h2>
            </div>
          </div>
          


          {/* Search Bar - Enhanced for Desktop */}
          <div className="w-full max-w-5xl mb-6 relative animate-fade-in-up animation-delay-600" style={{ zIndex: 99999 }}>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!searchQuery) return;
              
              // Navigate to map-search with the query - let that page handle the AI search
              window.location.href = `/map-search?q=${encodeURIComponent(searchQuery)}`;
            }}>
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder={t('hero.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (searchQuery) {
                          window.location.href = `/map-search?q=${encodeURIComponent(searchQuery)}`;
                        }
                      }
                    }}
                    className="flex-1 px-8 py-5 text-lg md:text-xl border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <div className="flex items-center mr-3">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 text-sm md:text-base px-4 py-2 font-semibold">
                      AI-Powered
                    </Badge>
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 m-3 rounded-2xl transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    <Search className="w-7 h-7" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Streamlined Primary Actions - Clean Flow */}
          <div className="flex flex-col items-center space-y-4 mb-6 animate-fade-in-up animation-delay-700 w-full px-4">
            {/* Top Priority: Perfect Match */}
            <Link href="/quiz">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 text-base md:text-xl px-8 md:px-10 py-4 md:py-5 rounded-2xl transform hover:scale-105">
                ✨ Find My Perfect Match
              </Button>
            </Link>
            
            {/* Secondary Actions - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-4xl">
              <Link href={`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}>
                <Button variant="outline" className="w-full border-2 border-white text-white hover:bg-white hover:text-gray-900 px-6 py-3.5 rounded-2xl font-semibold text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 bg-white/10 backdrop-blur-sm">
                  Explore Communities
                </Button>
              </Link>
              <Link href="/ai-map-showcase">
                <Button variant="outline" className="w-full border-2 border-amber-300 text-amber-200 hover:bg-amber-300 hover:text-gray-900 px-6 py-3.5 rounded-2xl font-semibold text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 bg-amber-400/10 backdrop-blur-sm">
                  <Brain className="mr-1.5 h-4 w-4" />
                  AI Map Intelligence
                </Button>
              </Link>
              <Link href="/ai-search-comparison" className="sm:col-span-2 lg:col-span-1">
                <Button variant="outline" className="w-full border-2 border-purple-300 text-purple-200 hover:bg-purple-300 hover:text-gray-900 px-6 py-3.5 rounded-2xl font-semibold text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 bg-purple-400/10 backdrop-blur-sm">
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  Compare AI Search
                </Button>
              </Link>
            </div>
          </div>
          

          
          {/* Trust Indicators with 26,306+ Communities */}
          <div className="mb-3 animate-fade-in-up animation-delay-800">
            <div className="flex flex-wrap items-center justify-center gap-3">

              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full shadow-lg">
                <Building2 className="h-5 w-5 text-blue-300" />
                <span className="text-base md:text-lg font-semibold text-white">HUD + Government Sources</span>
              </div>

            </div>
          </div>
          
          {/* Community Count Text - Updated */}
          <div className="mb-2 animate-fade-in-up animation-delay-850">
            <p className="text-white/90 dark:text-gray-300 text-base md:text-lg lg:text-xl drop-shadow-md text-center font-medium">
              Serving families across <strong className="text-amber-200">{(communityStats as any)?.count ? `${(communityStats as any).count.toLocaleString()}+` : '26,306+'} verified senior living communities</strong>
            </p>
          </div>
          
          {/* Verification Badge - Larger */}
          <div className="mb-4 animate-fade-in-up animation-delay-900">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full text-white dark:text-gray-200 text-sm md:text-base font-medium shadow-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
              Verified Pricing • Real Availability • No Pressure
            </div>
          </div>
          

        </div>
      </section>

      {/* Personalized Banner */}
      <div className="px-4 py-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <PersonalizedBanner />
        </div>
      </div>

      {/* HUD Communities Showcase - Position 2 (Moved from Position 3) */}
      <section className="px-4 py-12 relative overflow-hidden dark:bg-gray-800">
        {/* Background Government Building Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Government building background"
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-50/40 to-emerald-50/40 dark:from-gray-900/60 dark:to-gray-800/60"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                HUD Communities & Government Verified
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 dark:text-green-300 font-medium">Government verified pricing</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Income-based affordable</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">$57 - $800</div>
              <div className="text-sm text-green-600 dark:text-green-300 font-medium">HUD verified</div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            {(hudCount as any)?.total || '6,078+'} affordable communities • 
            Government transparency and income-based options
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              <span className="font-bold">Platform Promise:</span> Not all senior housing requires a six-figure budget. 
              MySeniorValet shows everything — from $0 HUD properties to full-service memory care.
            </p>
          </div>
        
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
            {/* Show HUD communities */}
            {(!hudProperties || (hudProperties as any[]).length === 0) ? (
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
              <>
                {(hudProperties as any[]).slice(0, 25).map((community: any, index) => (
                  <EnhancedCommunityCard
                    key={`hud-${community.id}-${index}`}
                    community={community}
                    index={index}
                    variant='hud'
                  />
                ))}
                
                {/* View All HUD Communities Card */}
                <Link href="/search?careType=hud-affordable">
                  <Card className="overflow-hidden flex-shrink-0 w-56 h-[30rem] border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-2xl transition-all cursor-pointer group">
                    <div className="aspect-[4/3] bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Building2 className="h-16 w-16 mx-auto mb-3" />
                        <h3 className="text-xl font-bold mb-2">View All HUD</h3>
                        <p className="text-lg">Communities</p>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h4 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                          {(hudCount as any)?.total || '6,078+'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Total HUD Communities
                        </p>
                        
                        <div className="space-y-2 text-left mb-4">
                          <div className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-gray-700 dark:text-gray-300">Government verified pricing</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-gray-700 dark:text-gray-300">Income-based rates</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                            <span className="text-gray-700 dark:text-gray-300">Nationwide coverage</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                            <span className="text-gray-700 dark:text-gray-300">Live occupancy data</span>
                          </div>
                        </div>
                        
                        <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 mb-4">
                          <p className="text-xs text-green-800 dark:text-green-200 font-medium">
                            Search by income level, location, or specific needs
                          </p>
                        </div>
                        
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white group-hover:scale-105 transition-transform"
                        >
                          Search All HUD Communities
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Care Spectrum Slider Section - Interactive Housing Type Selection */}
      <section className="px-4 py-12 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <CareSpectrumSlider />
        </div>
      </section>

      {/* Featured & Coastal Communities Section - Position 3 (Moved from Position 2) */}
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
            {(((coastalCommunities as any[])?.length || 0) + ((featuredCommunities as any[])?.length || 0))} premium communities • 
            Featured selections and coastal charm
          </p>
        
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
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
              premiumCommunities.map((community: any, index) => {
                const isCoastal = index < 4;
                return (
                  <Link key={`premium-${community.id}-${index}`} href={`/community/${community.id}`}>
                    <Card className="overflow-hidden flex-shrink-0 w-56 h-[30rem] animate-float premium-card dark:bg-gray-700 hover:shadow-xl transition-all" style={{animationDelay: `${index * 0.2}s`}}>
                      <div className="relative">
                        <div className={`aspect-[4/3] bg-gradient-to-br ${isCoastal ? 'from-blue-100 to-cyan-200 dark:from-blue-900 dark:to-cyan-800' : 'from-purple-100 to-pink-200 dark:from-purple-900 dark:to-pink-800'} flex items-center justify-center`}>
                          <div className="text-center">
                            <div className="text-2xl mb-2">📷</div>
                            <div className={`text-sm font-medium ${isCoastal ? 'text-blue-800 dark:text-blue-200' : 'text-purple-800 dark:text-purple-200'}`}>Photos Coming Soon</div>
                            <div className={`text-xs ${isCoastal ? 'text-blue-600 dark:text-blue-300' : 'text-purple-600 dark:text-purple-300'}`}>Verifying authentic images</div>
                          </div>
                        </div>
                        
                        {/* Heart Icon */}
                        <div className="absolute top-3 right-3">
                          <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Heart className="w-4 h-4 text-gray-600" />
                          </div>
                        </div>
                        
                        {/* Only show verified occupancy data if available */}
                        {community.occupancyRateHud && (
                          <Badge className="absolute top-3 left-3 bg-gray-600 text-white text-xs px-2 py-1 font-medium">
                            {Math.round(100 - parseFloat(community.occupancyRateHud))}% Occupancy
                          </Badge>
                        )}
                        
                        {/* Price Badge */}
                        <Badge className="absolute bottom-3 left-3 bg-gray-900 text-white text-xs px-2 py-1 font-medium">
                          {community.priceRange && community.priceRange.min ? `$${(community.priceRange.min / 1000).toFixed(1)}K+` : '$3.5K+'}
                          {!community.claimed && (
                            <span className="text-xs text-gray-300 ml-1 font-normal">est.</span>
                          )}
                          {community.hudPropertyId && (
                            <span className="text-xs text-green-300 ml-1">🏛️</span>
                          )}
                        </Badge>
                        
                        {/* Location Type Badge */}
                        {isCoastal ? (
                          <Badge className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium">
                            🌊 Coastal
                          </Badge>
                        ) : (
                          <Badge className="absolute bottom-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 font-medium">
                            ⭐ Featured
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="p-3">
                        {/* Availability Status - Above Price */}
                        {index % 3 === 0 && (
                          <div className="flex items-center text-xs text-green-600 dark:text-green-400 font-medium mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            Available
                          </div>
                        )}
                        
                        <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          <span className="text-sm">Starting at</span> ${community.priceRange && community.priceRange.min ? community.priceRange.min.toLocaleString() : '3,500'}
                          {!community.claimed && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 font-normal">est.</span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          {community.careTypes?.length > 0 ? 
                            `${community.careTypes[0]} • ${isCoastal ? 'Ocean Views' : 'Premium Care'}` : 
                            `Assisted Living • ${isCoastal ? 'Coastal Living' : 'Featured Community'}`
                          }
                        </div>
                        
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                          {community.name}
                        </div>
                        
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                          📍 {community.city}, {community.state}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                          {community.address || 'Premium Community'} {community.zipCode}
                        </div>
                        
                        {/* Special Features */}
                        <div className="space-y-1">
                          {isCoastal && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></div>
                              Ocean or bay views
                            </div>
                          )}
                          <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-1"></div>
                            {isCoastal ? 'Premium coastal location' : 'Highly rated community'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Canadian Communities Section - NEW */}
      <section className="px-4 py-12 relative dark:bg-gray-800">
        {/* Background Canadian-themed styling */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-red-100 via-white to-red-50 dark:from-red-900/20 dark:via-gray-900 dark:to-red-900/10">
            {/* Canadian maple leaf pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-20 text-red-600 text-8xl">🍁</div>
              <div className="absolute top-40 right-40 text-red-600 text-6xl rotate-45">🍁</div>
              <div className="absolute bottom-20 left-1/3 text-red-600 text-7xl -rotate-12">🍁</div>
              <div className="absolute bottom-10 right-20 text-red-600 text-5xl rotate-180">🍁</div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                <Flag className="h-6 w-6 text-red-600" />
                {language === 'en' ? 'Featured Canadian Communities' : 'Communautés canadiennes en vedette'}
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                  {language === 'en' ? 'Coast to coast coverage' : 'Couverture d\'un océan à l\'autre'}
                </span>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  {language === 'en' ? 'Bilingual services available' : 'Services bilingues disponibles'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">$2,500 - $5,500 CAD</div>
              <div className="text-sm text-red-600 dark:text-red-300 font-medium">
                {language === 'en' ? 'Canadian communities' : 'Communautés canadiennes'}
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            {language === 'en' 
              ? '24 communities across all 13 provinces and territories • 10 with bilingual French/English services' 
              : '24 communautés dans les 13 provinces et territoires • 10 avec services bilingues français/anglais'}
          </p>
        
          <div className="relative overflow-hidden" style={{maxHeight: '400px'}}>
            <div className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
              {/* Show Canadian communities */}
              {canadianLoading ? (
              // Loading skeleton cards
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden flex-shrink-0 w-64 h-96 border border-gray-200 animate-pulse">
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
              <>
                {((canadianCommunities as any[]) || []).slice(0, 12).map((community: any, index) => (
                  <Link key={`canadian-${community.id}-${index}`} href={`/community/${community.id}`}>
                    <Card className="overflow-hidden flex-shrink-0 w-64 animate-float canadian-card dark:bg-gray-700 hover:shadow-xl transition-all border-2 border-red-200" style={{animationDelay: `${index * 0.2}s`}}>
                      <div className="relative">
                        <div className="aspect-[4/3] bg-gradient-to-br from-red-100 to-white dark:from-red-900 dark:to-gray-800 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl mb-2">🍁</div>
                            <div className="text-sm font-medium text-red-800 dark:text-red-200">
                              {language === 'en' ? 'Photos Coming Soon' : 'Photos à venir'}
                            </div>
                            <div className="text-xs text-red-600 dark:text-red-300">
                              {language === 'en' ? 'Verifying authentic images' : 'Vérification des images'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Heart Icon */}
                        <div className="absolute top-3 right-3">
                          <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Heart className="w-4 h-4 text-gray-600" />
                          </div>
                        </div>
                        
                        {/* Price Badge */}
                        <Badge className="absolute bottom-3 left-3 bg-gray-900 text-white text-xs px-2 py-1 font-medium">
                          ${community.priceRange?.min ? community.priceRange.min.toLocaleString() : '3,500'} CAD
                        </Badge>
                        
                        {/* Bilingual Badge */}
                        {community.bilingual && (
                          <Badge className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium flex items-center gap-1">
                            <Languages className="w-3 h-3" />
                            {language === 'en' ? 'Bilingual' : 'Bilingue'}
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="p-3 flex flex-col h-full">
                        <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          ${community.priceRange?.min ? community.priceRange.min.toLocaleString() : '3,500'} CAD
                        </div>
                        
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {language === 'en' ? 'Starting at' : 'À partir de'}
                        </div>
                        
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                          {community.name}
                        </div>
                        
                        <div className="text-xs text-gray-700 dark:text-gray-300 mb-1">
                          {community.careTypes?.[0] || 'Assisted Living'}
                        </div>
                        
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          📍 {community.city}, {community.state}
                        </div>
                        
                        {/* Special Features */}
                        <div className="space-y-1 mt-auto">
                          {community.bilingual && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></div>
                              {language === 'en' ? 'Bilingual services' : 'Services bilingues'}
                            </div>
                          )}
                          <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></div>
                            {language === 'en' ? 'Canadian community' : 'Communauté canadienne'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                
                {/* View All Canadian Communities Card */}
                <Link href="/canada">
                  <Card className="overflow-hidden flex-shrink-0 w-64 h-96 border-2 border-red-500 bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-900/20 hover:shadow-2xl transition-all cursor-pointer group">
                    <div className="aspect-[4/3] bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Flag className="h-16 w-16 mx-auto mb-3" />
                        <h3 className="text-xl font-bold mb-2">
                          {language === 'en' ? 'View All' : 'Voir toutes'}
                        </h3>
                        <p className="text-lg">
                          {language === 'en' ? 'Canadian Communities' : 'Communautés canadiennes'}
                        </p>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h4 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">24</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {language === 'en' ? 'Total Canadian Communities' : 'Communautés canadiennes totales'}
                        </p>
                        
                        <div className="space-y-2 text-left mb-4">
                          <div className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-gray-700 dark:text-gray-300">
                              {language === 'en' ? '13 provinces & territories' : '13 provinces et territoires'}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-gray-700 dark:text-gray-300">
                              {language === 'en' ? '10 bilingual communities' : '10 communautés bilingues'}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-gray-700 dark:text-gray-300">
                              {language === 'en' ? 'Coast to coast coverage' : 'D\'un océan à l\'autre'}
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-red-600 hover:bg-red-700 text-white group-hover:scale-105 transition-transform"
                        >
                          {language === 'en' ? 'Explore Canadian Communities' : 'Explorer les communautés'}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </>
            )}
            </div>
          </div>
        </div>
      </section>

      {/* California Communities Section */}
      <section className="px-4 py-8 relative overflow-hidden">
        {/* Background with California Golden State styling */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-100/30 via-orange-100/20 to-yellow-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
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
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{(californiaCommunities as any[])?.length || 0} communities • Silicon Valley, LA Metro, San Diego with immediate openings</p>
        
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
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
              ((californiaCommunities as any[]) || []).map((community: any, index: number) => (
                <Link key={`california-${community.id}-${index}`} href={`/community/${community.id}`}>
                  <Card className="overflow-hidden flex-shrink-0 w-56 h-[30rem] animate-float california-card dark:bg-gray-700" style={{animationDelay: `${index * 0.2}s`}}>
                    <div className="relative">
                      <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl mb-2">📷</div>
                          <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Photos Coming Soon</div>
                          <div className="text-xs text-blue-600 dark:text-blue-300">Verifying authentic images</div>
                        </div>
                      </div>
                      
                      {/* Heart Icon */}
                      <div className="absolute top-3 right-3">
                        <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Heart className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                      
                      {/* Only show verified occupancy data if available */}
                      {community.occupancyRateHud && (
                        <Badge className="absolute top-3 left-3 bg-gray-600 text-white text-xs px-2 py-1 font-medium">
                          {Math.round(100 - parseFloat(community.occupancyRateHud))}% Occupancy
                        </Badge>
                      )}
                      
                      {/* Price Badge */}
                      <Badge className="absolute bottom-3 left-3 bg-gray-900 text-white text-xs px-2 py-1 font-medium">
                        {community.priceRange && community.priceRange.min ? `$${(community.priceRange.min / 1000).toFixed(1)}K+` : '$4K+'}
                        {!community.claimed && (
                          <span className="text-xs text-gray-300 ml-1 font-normal">est.</span>
                        )}
                        {community.hudPropertyId && (
                          <span className="text-xs text-green-300 ml-1">🏛️</span>
                        )}
                      </Badge>
                      
                      {/* Only show HUD badge if it's a HUD property */}
                      {community.hudPropertyId && (
                        <Badge className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium">
                          HUD Property
                        </Badge>
                      )}
                    </div>
                    
                    <CardContent className="p-3">

                      
                      <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        <span className="text-sm">Starting at</span> ${community.priceRange && community.priceRange.min ? community.priceRange.min.toLocaleString() : '4,200'}
                        {!community.claimed && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 font-normal">est.</span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                        {community.careTypes?.length > 0 ? 
                          `${community.careTypes[0]} • California Living` : 
                          'Assisted Living • Golden State Care'
                        }
                      </div>
                      
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                        {community.name}
                      </div>
                      
                      <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
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
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <span>CA License #{20000 + community.id}</span>
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
                      
                      {/* View Details Button */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <Button size="sm" variant="outline" className="w-full text-xs py-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                          View Full Details →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Senior Services Directory Section */}
      <section className="px-4 py-16 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="mb-6">
              <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 mb-2">
                Senior Vendor Marketplace
              </h2>
              <div className="h-1 w-32 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
            </div>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 font-semibold mb-4">Beyond communities - everything seniors need for independent living</p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Join 1,500+ trusted vendors reaching families nationwide • Starting FREE or from $99/month
            </p>
            
            {/* Status Pills with Vendor Count - Smaller on mobile */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <div className="relative">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="relative">
                    <div className="absolute inset-0 w-2 sm:w-3 h-2 sm:h-3 bg-white rounded-full animate-ping"></div>
                    <div className="relative w-2 sm:w-3 h-2 sm:h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                  <span className="tracking-wide">LIVE ONLINE</span>
                </Badge>
              </div>
              
              <div className="relative">
                <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <span className="relative flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>1,500+ VERIFIED VENDORS</span>
                  </span>
                </Badge>
              </div>
              
              <div className="relative">
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <span className="relative">
                    <span className="absolute inset-0 animate-pulse">✨</span>
                    <span className="relative">FREE TO START</span>
                  </span>
                </Badge>
              </div>
            </div>
            
            {/* Quick Vendor CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/vendor-marketplace-tiers">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Become a Vendor Partner
                </Button>
              </Link>
              <Link href="/vendor-dashboard">
                <Button variant="outline" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-6 py-3 rounded-xl font-semibold transition-all duration-200">
                  <LogIn className="w-5 h-5 mr-2" />
                  Vendor Login
                </Button>
              </Link>
            </div>

          </div>

          {/* Vendor Marketplace Tabs */}
          <div className="mb-12">
            <VendorMarketplaceTabs />
          </div>








          {/* Senior Vendor Marketplace Grid - 3x3 Layout */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8 max-w-4xl mx-auto">
            <Link href="/moving">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 relative overflow-hidden h-full">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <Truck className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-xs sm:text-sm text-green-700 dark:text-green-300 line-clamp-2">Moving Services</h4>
                  <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 mt-1 line-clamp-2">Senior move specialists</p>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ VERIFIED</Badge>
                    <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5">TWO MEN</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
              <CardContent className="p-3 sm:p-4 text-center">
                <Pill className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Rx Delivery</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">Medication services</p>
                <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
              <CardContent className="p-3 sm:p-4 text-center">
                <Building className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500 mx-auto mb-2" />
                <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Senior Centers</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">Community programs</p>
                <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Link href="/transportation">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 relative overflow-hidden h-full">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <Car className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-xs sm:text-sm text-blue-700 dark:text-blue-300 line-clamp-2">Transportation</h4>
                  <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 mt-1 line-clamp-2">No smartphone needed</p>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ VERIFIED</Badge>
                    <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5">GOGO</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/family-connect">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 relative overflow-hidden h-full">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 line-clamp-2">Family Connect</h4>
                  <p className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 mt-1 line-clamp-2">Coordinate care together</p>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ NEW</Badge>
                    <Badge className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5">SECURE</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/vendor/1800florals">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 relative overflow-hidden h-full">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 rounded-lg overflow-hidden bg-white shadow-sm">
                    <img 
                      src="https://www.800florals.com/img/4810Dmd.jpg" 
                      alt="1-800-FLORALS Arrangements"
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      loading="eager"
                    />
                    <div className="w-full h-full hidden items-center justify-center text-pink-500 text-xl font-bold">🌸</div>
                  </div>
                  <h4 className="font-semibold text-xs sm:text-sm text-pink-700 dark:text-pink-300 line-clamp-2">Professional Florals</h4>
                  <p className="text-[10px] sm:text-xs text-pink-600 dark:text-pink-400 mt-1 line-clamp-2">Move-in arrangements</p>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ VERIFIED</Badge>
                    <Badge className="bg-pink-500 text-white text-[10px] px-1.5 py-0.5">1-800-FLORALS</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/vendor-marketplace">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 relative overflow-hidden h-full">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-xs sm:text-sm text-amber-700 dark:text-amber-300 line-clamp-2">Vendor Marketplace</h4>
                  <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 mt-1 line-clamp-2">Trusted senior brands</p>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ NEW</Badge>
                    <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5">CURATED</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
              <CardContent className="p-3 sm:p-4 text-center">
                <Scale className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500 mx-auto mb-2" />
                <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Legal Services</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">Elder law attorneys</p>
                <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
              <CardContent className="p-3 sm:p-4 text-center">
                <Calculator className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Financial Planning</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">Senior financial advisors</p>
                <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Scissors className="w-10 h-10 text-pink-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Personal Care</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Mobile barber & beauty</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>


            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Users2 className="w-10 h-10 text-cyan-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Companion Care</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Social companionship</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Phone className="w-10 h-10 text-violet-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Tech Support</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Device setup & training</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>

            <Link href="/amazon-supplies">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 relative overflow-hidden">
                <CardContent className="p-4 text-center">
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <Package className="w-10 h-10 text-orange-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm">Amazon Senior Essentials</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">33+ essential products</p>
                  <div className="flex gap-1 justify-center mt-1">
                    <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">LIVE</Badge>
                    <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5">✓ VERIFIED</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Trash2 className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Junk Removal</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Decluttering services</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Sofa className="w-10 h-10 text-orange-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Medical Equipment</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Mobility aids, safety items</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Ambulance className="w-10 h-10 text-red-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Medical Transport</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Non-emergency rides</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Amazon Senior Living Essentials - Moved above Browse All Services */}
          <div className="mb-12 mt-8">
            {/* Background with Amazon Orange styling */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-100/30 via-amber-100/20 to-yellow-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
              </div>
              
              <div className="relative z-10 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      Amazon Senior Living Essentials
                    </h2>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-orange-700 dark:text-orange-300 font-medium">Essential products</span>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Prime eligible</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">$12.99 - $89.99</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Product recommendations</div>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">33+ products across 6 categories • Scroll to explore all essentials with Prime delivery</p>
              
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                  {/* Amazon Products using California Communities Card Style */}
                  {(() => {
                    // Safely get products from API response with type checking
                    const productsData = amazonProductImages as { products?: any[] } | undefined;
                    const allProducts = Array.isArray(productsData?.products) ? productsData.products : [];
                    
                    if (!productsData || allProducts.length === 0) {
                      return (
                        <div className="text-center py-8 px-4 w-full">
                          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">Loading Amazon products...</p>
                        </div>
                      );
                    }

                    return allProducts.map((product: any, index: number) => {
                      const categoryBadges: Record<number, { badge: string, badgeBg: string }> = {
                        0: { badge: 'Mobility & Safety', badgeBg: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' },
                        1: { badge: 'Daily Living', badgeBg: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' },
                        2: { badge: 'Bathroom Safety', badgeBg: 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200' },
                        3: { badge: 'Medication', badgeBg: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' },
                        4: { badge: 'Home Essentials', badgeBg: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' },
                        5: { badge: 'Furniture', badgeBg: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' }
                      };
                      
                      const categoryInfo = categoryBadges[index % 6];
                      
                      return (
                        <a key={product.id || index} href={product.externalUrl || '#'} target="_blank" rel="noopener noreferrer">
                          <Card className="overflow-hidden flex-shrink-0 w-64 hover:shadow-xl transition-all duration-300 border-2 border-orange-200 dark:border-orange-400 bg-white dark:bg-gray-800">
                            <div className="relative">
                              <div className="aspect-[4/3] bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center p-4">
                                {product.imageUrl ? (
                                  <div className="bg-white rounded-lg p-2 shadow-lg w-full h-full">
                                    <img 
                                      src={product.imageUrl} 
                                      alt={product.name}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div className="text-center text-white">
                                    <Package className="w-12 h-12 mb-2 mx-auto" />
                                    <div className="text-xl font-bold">AMAZON</div>
                                    <div className="text-sm">Essentials</div>
                                  </div>
                                )}
                              </div>
                              <div className="absolute top-2 right-2">
                              </div>
                              {product.isFeatured && (
                                <div className="absolute top-2 left-2">
                                  <Badge className="bg-yellow-500 text-white text-xs px-2 py-1 font-bold">
                                    ⭐ FEATURED
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg line-clamp-1">{product.name}</h4>
                                <div className="flex items-center space-x-1">
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{product.category}</p>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{product.price}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${categoryInfo.badgeBg}`}>
                                  {categoryInfo.badge}
                                </span>
                              </div>
                              <div className="space-y-1 mb-3">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                  <span className="text-xs text-gray-600 dark:text-gray-300">Prime Eligible</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                  <span className="text-xs text-gray-600 dark:text-gray-300">2-Day Delivery</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                  <span className="text-xs text-gray-600 dark:text-gray-300">Senior-Friendly</span>
                                </div>
                              </div>
                              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm py-2">
                                View on Amazon →
                              </Button>
                            </CardContent>
                          </Card>
                        </a>
                      );
                    });
                  })()}
                </div>
                
                {/* Legal Disclaimer & Platform Independence */}
                <div className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-600" />
                    Information Aggregation Disclaimer
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                    MySeniorValet is an independent platform that aggregates publicly available information about senior services and products for your convenience. 
                    We are not affiliated with, endorsed by, or partnered with Amazon or any other vendor listed on our platform unless explicitly stated.
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                    Product information, prices, and availability are sourced from public data and may change without notice. 
                    Always verify details directly with the vendor before making purchase decisions.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    As an Amazon Associate, MySeniorValet may earn from qualifying purchases. This helps support our free platform for seniors.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/senior-services">
              <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                Browse All Services →
              </Button>
            </Link>
          </div>
        </div>
      </section>





      {/* Care Marketplace Section */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Card className="group bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-400 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20"></div>
              <CardContent className="p-8 relative z-10">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full text-white text-sm font-semibold mb-4 shadow-lg">
                    <span className="mr-2">🚀</span>
                    Now Available!
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Senior Care Services Directory</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto mb-4">
                    Connect with {(careServicesAnalytics as any)?.totalServices?.toLocaleString() || '4,210'}+ verified healthcare and caregiving services in your area
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Home Care Services Tab and Slider */}
          {(() => {
            const services = (careServicesData as any)?.services || [];
            const homeCareCount = services.filter((s: any) => s.serviceCategory === 'Home Care Services').length;
            
            return (
              <div className="mb-8">
                {/* Home Care Tab */}
                <div
                  className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4"
                  onClick={() => setSelectedCategory('Home Care Services')}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Home className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Home Care Services</h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">Professional in-home support and care</p>
                      </div>
                    </div>
                    <div className="hidden sm:block flex-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-700 dark:text-green-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">24/7 availability</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-700 dark:text-green-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Licensed caregivers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-700 dark:text-green-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Personal care assistance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-700 dark:text-green-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Medication management</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{homeCareCount}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-green-700 dark:text-green-300" />
                    </div>
                  </div>
                </div>

                {/* Home Care Services Slider */}
                {(() => {
                  const homeCareServices = services.filter((s: any) => s.serviceCategory === 'Home Care Services');
                  
                  if (homeCareServices.length > 0 && (!selectedCategory || selectedCategory === 'Home Care Services')) {
                    return (
                      <section className="px-4 py-4 relative overflow-hidden">
                        <div className="absolute inset-0 z-0">
                          <div className="w-full h-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-green-100/30 via-emerald-100/20 to-teal-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
                        </div>
                        
                        <div className="relative z-10">
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Professional care in the comfort of your home • Licensed & insured providers</p>
                          
                          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                            {homeCareServices.slice(0, 20).map((service: any, index: number) => {
                              return (
                                <CareServiceCard
                                  key={service.id || index}
                                  service={service}
                                  index={index}
                                  borderColor="border-green-200 dark:border-gray-700"
                                  hoverBorderColor="hover:border-green-300 dark:hover:border-gray-600"
                                  iconBgColor="bg-gradient-to-br from-green-500 to-green-600"
                                  iconRingColor="ring-green-100 dark:ring-green-900"
                                  icon={<Home className="w-8 h-8 text-white" />}
                                  categoryBadgeColor="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800"
                                  categoryBadgeBorder="border-green-300 dark:border-green-600"
                                  categoryLabel="Home Care"
                                  buttonColor="bg-gradient-to-r from-green-500 to-green-600"
                                  buttonHoverColor="hover:from-green-600 hover:to-green-700"
                                />
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          })()}

          {/* Therapy Services Tab and Slider */}
          {(() => {
            const services = (careServicesData as any)?.services || [];
            const therapyCount = services.filter((s: any) => s.serviceCategory === 'Therapy Services').length;
            
            return (
              <div className="mb-8">
                {/* Therapy Tab */}
                <div
                  className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4"
                  onClick={() => setSelectedCategory('Therapy Services')}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Activity className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Therapy Services</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Physical, occupational, and speech therapy</p>
                      </div>
                    </div>
                    <div className="hidden sm:block flex-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Physical therapy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Occupational therapy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Speech therapy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">In-home sessions available</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{therapyCount}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-purple-700 dark:text-purple-300" />
                    </div>
                  </div>
                </div>

                {/* Therapy Services Slider */}
                {(() => {
                  const therapyServices = services.filter((s: any) => s.serviceCategory === 'Therapy Services');
                  
                  if (therapyServices.length > 0 && (!selectedCategory || selectedCategory === 'Therapy Services')) {
                    return (
                      <section className="px-4 py-4 relative overflow-hidden">
                        <div className="absolute inset-0 z-0">
                          <div className="w-full h-full bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 via-pink-100/20 to-fuchsia-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
                        </div>
                        
                        <div className="relative z-10">
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Specialized therapy services to improve mobility & independence • Medicare certified</p>
                          
                          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                            {therapyServices.slice(0, 20).map((service: any, index: number) => {
                              return (
                                <CareServiceCard
                                  key={service.id || index}
                                  service={service}
                                  index={index}
                                  borderColor="border-purple-200 dark:border-gray-700"
                                  hoverBorderColor="hover:border-purple-300 dark:hover:border-gray-600"
                                  iconBgColor="bg-gradient-to-br from-purple-500 to-purple-600"
                                  iconRingColor="ring-purple-100 dark:ring-purple-900"
                                  icon={<Activity className="w-8 h-8 text-white" />}
                                  categoryBadgeColor="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800"
                                  categoryBadgeBorder="border-purple-300 dark:border-purple-600"
                                  categoryLabel="Therapy Services"
                                  buttonColor="bg-gradient-to-r from-purple-500 to-purple-600"
                                  buttonHoverColor="hover:from-purple-600 hover:to-purple-700"
                                />
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          })()}

          {/* Adult Day Care Tab and Slider */}
          {(() => {
            const services = (careServicesData as any)?.services || [];
            const adultDayCareCount = services.filter((s: any) => s.serviceCategory === 'Adult Day Care').length;
            
            return (
              <div className="mb-8">
                {/* Adult Day Care Tab */}
                <div
                  className="bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4"
                  onClick={() => setSelectedCategory('Adult Day Care')}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Adult Day Care</h4>
                        <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">Daytime programs for social engagement and activities</p>
                      </div>
                    </div>
                    <div className="hidden sm:block flex-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Social activities</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Meals provided</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Transportation available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Memory care programs</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{adultDayCareCount}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-teal-700 dark:text-teal-300" />
                    </div>
                  </div>
                </div>

                {/* Adult Day Care Slider */}
                {(() => {
                  const adultDayCare = services.filter((s: any) => s.serviceCategory === 'Adult Day Care');
                  
                  if (adultDayCare.length > 0 && (!selectedCategory || selectedCategory === 'Adult Day Care')) {
                    return (
                      <section className="px-4 py-4 relative overflow-hidden">
                        <div className="absolute inset-0 z-0">
                          <div className="w-full h-full bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-100/30 via-cyan-100/20 to-sky-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
                        </div>
                        
                        <div className="relative z-10">
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Social engagement & supervision during business hours • Transportation included</p>
                          
                          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                            {adultDayCare.slice(0, 20).map((service: any, index: number) => {
                              return (
                                <CareServiceCard
                                  key={service.id || index}
                                  service={service}
                                  index={index}
                                  borderColor="border-teal-200 dark:border-gray-700"
                                  hoverBorderColor="hover:border-teal-300 dark:hover:border-gray-600"
                                  iconBgColor="bg-gradient-to-br from-teal-500 to-teal-600"
                                  iconRingColor="ring-teal-100 dark:ring-teal-900"
                                  icon={<Users className="w-8 h-8 text-white" />}
                                  categoryBadgeColor="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900 dark:to-teal-800"
                                  categoryBadgeBorder="border-teal-300 dark:border-teal-600"
                                  categoryLabel="Adult Day Care"
                                  buttonColor="bg-gradient-to-r from-teal-500 to-teal-600"
                                  buttonHoverColor="hover:from-teal-600 hover:to-teal-700"
                                />
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          })()}

          {/* Personal Care Services Tab and Slider */}
          {(() => {
            const services = (careServicesData as any)?.services || [];
            const personalCareCount = services.filter((s: any) => s.serviceCategory === 'Personal Care Services').length;
            
            return (
              <div className="mb-8">
                {/* Personal Care Tab */}
                <div
                  className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4"
                  onClick={() => setSelectedCategory('Personal Care Services')}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Users2 className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Personal Care Services</h4>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">Daily living assistance and personal hygiene support</p>
                      </div>
                    </div>
                    <div className="hidden sm:block flex-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-orange-700 dark:text-orange-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Bathing assistance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-orange-700 dark:text-orange-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Dressing help</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-orange-700 dark:text-orange-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Grooming support</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-orange-700 dark:text-orange-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Mobility assistance</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{personalCareCount}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-orange-700 dark:text-orange-300" />
                    </div>
                  </div>
                </div>

                {/* Personal Care Services Slider */}
                {(() => {
                  const personalCare = services.filter((s: any) => s.serviceCategory === 'Personal Care Services');
                  
                  if (personalCare.length > 0 && (!selectedCategory || selectedCategory === 'Personal Care Services')) {
                    return (
                      <section className="px-4 py-4 relative overflow-hidden">
                        <div className="absolute inset-0 z-0">
                          <div className="w-full h-full bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-100/30 via-amber-100/20 to-yellow-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
                        </div>
                        
                        <div className="relative z-10">
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Help with bathing, dressing & personal hygiene • Compassionate caregivers</p>
                          
                          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                            {personalCare.slice(0, 20).map((service: any, index: number) => {
                              return (
                                <CareServiceCard
                                  key={service.id || index}
                                  service={service}
                                  index={index}
                                  borderColor="border-orange-200 dark:border-gray-700"
                                  hoverBorderColor="hover:border-orange-300 dark:hover:border-gray-600"
                                  iconBgColor="bg-gradient-to-br from-orange-500 to-orange-600"
                                  iconRingColor="ring-orange-100 dark:ring-orange-900"
                                  icon={<Users2 className="w-8 h-8 text-white" />}
                                  categoryBadgeColor="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800"
                                  categoryBadgeBorder="border-orange-300 dark:border-orange-600"
                                  categoryLabel="Personal Care"
                                  buttonColor="bg-gradient-to-r from-orange-500 to-orange-600"
                                  buttonHoverColor="hover:from-orange-600 hover:to-orange-700"
                                />
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          })()}

          {/* Hospice Care Tab and Slider */}
          {(() => {
            const services = (careServicesData as any)?.services || [];
            const hospiceCount = services.filter((s: any) => s.serviceCategory === 'Hospice Care').length;
            
            return (
              <div className="mb-8">
                {/* Hospice Care Tab */}
                <div
                  className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4"
                  onClick={() => setSelectedCategory('Hospice Care')}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Heart className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Hospice Care</h4>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Compassionate end-of-life care and family support</p>
                      </div>
                    </div>
                    <div className="hidden sm:block flex-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-indigo-700 dark:text-indigo-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Pain management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-indigo-700 dark:text-indigo-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Emotional support</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-indigo-700 dark:text-indigo-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Family counseling</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-indigo-700 dark:text-indigo-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">24/7 on-call team</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{hospiceCount}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-indigo-700 dark:text-indigo-300" />
                    </div>
                  </div>
                </div>

                {/* Hospice Care Slider */}
                {(() => {
                  const hospiceCare = services.filter((s: any) => s.serviceCategory === 'Hospice Care');
                  
                  if (hospiceCare.length > 0 && (!selectedCategory || selectedCategory === 'Hospice Care')) {
                    return (
                      <section className="px-4 py-4 relative overflow-hidden">
                        <div className="absolute inset-0 z-0">
                          <div className="w-full h-full bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/30 via-blue-100/20 to-purple-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
                        </div>
                        
                        <div className="relative z-10">
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Compassionate end-of-life care • Family support • 24/7 availability</p>
                          
                          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                            {hospiceCare.slice(0, 20).map((service: any, index: number) => {
                              return (
                                <CareServiceCard
                                  key={service.id || index}
                                  service={service}
                                  index={index}
                                  borderColor="border-indigo-200 dark:border-gray-700"
                                  hoverBorderColor="hover:border-indigo-300 dark:hover:border-gray-600"
                                  iconBgColor="bg-gradient-to-br from-indigo-500 to-indigo-600"
                                  iconRingColor="ring-indigo-100 dark:ring-indigo-900"
                                  icon={<Heart className="w-8 h-8 text-white" />}
                                  categoryBadgeColor="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800"
                                  categoryBadgeBorder="border-indigo-300 dark:border-indigo-600"
                                  categoryLabel="Hospice Care"
                                  buttonColor="bg-gradient-to-r from-indigo-500 to-indigo-600"
                                  buttonHoverColor="hover:from-indigo-600 hover:to-indigo-700"
                                />
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          })()}

          {/* End of reorganized care services */}

          {/* Browse All Services Button */}
          <div className="flex justify-center mt-12 mb-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => setLocation('/care-services')}
            >
              <Layers className="w-5 h-5 mr-2" />
              Browse All Services
            </Button>
          </div>
        </div>
      </section>

      {/* Consolidated Senior Resources & Support */}
      <section className="px-4 py-12 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold mb-2 gradient-text-blue">Senior Resources & Support Center</h3>
            <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-violet-500 mx-auto rounded-full"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">Essential programs, government assistance, and support services</p>
          </div>

          {/* Senior Support Programs */}
          <div className="mb-12">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Assistance Programs</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Food Banks */}
              <Card className="hover:shadow-lg transition-shadow border-2 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Utensils className="h-8 w-8 text-green-600" />
                    <h4 className="font-semibold text-xl">Food Banks</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Find senior-specific food assistance programs in your area
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Home delivery for seniors</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Commodity supplemental programs</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Brown bag programs</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Available in:</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">CA</Badge>
                      <Badge variant="secondary" className="text-xs">FL</Badge>
                      <Badge variant="secondary" className="text-xs">TX</Badge>
                      <Badge variant="secondary" className="text-xs">AZ</Badge>
                      <Badge variant="secondary" className="text-xs">NV</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* IHSS */}
              <Card className="hover:shadow-lg transition-shadow border-2 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Home className="h-8 w-8 text-blue-600" />
                    <h4 className="font-semibold text-xl">IHSS</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    In-Home Supportive Services for daily living assistance
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span>Personal care services</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span>Housekeeping & meal prep</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span>Transportation assistance</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Primary state:</p>
                    <Badge className="bg-blue-100 text-blue-800">California Program</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* SLS */}
              <Card className="hover:shadow-lg transition-shadow border-2 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="h-8 w-8 text-purple-600" />
                    <h4 className="font-semibold text-xl">SLS</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Supported Living Services for independent living
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5" />
                      <span>24/7 support available</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5" />
                      <span>Skills training</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5" />
                      <span>Community integration</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Coordinated by:</p>
                    <Badge className="bg-purple-100 text-purple-800">Regional Centers</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Contact Info */}
            <div className="mt-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-600" />
                Quick Access Hotlines
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">National Hunger Hotline</p>
                  <a href="tel:1-866-348-6479" className="text-blue-600 hover:underline">1-866-3-HUNGRY</a>
                  <p className="text-xs text-gray-500">Mon-Fri 7AM-10PM EST</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">California IHSS</p>
                  <a href="tel:1-877-323-1165" className="text-blue-600 hover:underline">1-877-323-1165</a>
                  <p className="text-xs text-gray-500">County-specific assistance</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Eldercare Locator</p>
                  <a href="tel:1-800-677-1116" className="text-blue-600 hover:underline">1-800-677-1116</a>
                  <p className="text-xs text-gray-500">Find local services</p>
                </div>
              </div>
            </div>
          </div>

          {/* Government Resources */}
          <div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Government Programs & Resources</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Essential Resources */}
            {[
              {
                category: 'Healthcare',
                name: 'Medicare',
                description: 'Federal health insurance for people 65 or older',
                phone: '1-800-MEDICARE (1-800-633-4227)',
                website: 'https://www.medicare.gov',
                icon: Stethoscope,
                color: 'blue'
              },
              {
                category: 'Financial',
                name: 'Social Security',
                description: 'Retirement, disability, and survivor benefits',
                phone: '1-800-772-1213',
                website: 'https://www.ssa.gov',
                icon: DollarSign,
                color: 'green'
              },
              {
                category: 'Veterans',
                name: 'VA Benefits',
                description: 'Healthcare and benefits for military veterans',
                phone: '1-800-827-1000',
                website: 'https://www.va.gov',
                icon: Shield,
                color: 'red'
              },
              {
                category: 'Nutrition',
                name: 'SNAP (Food Stamps)',
                description: 'Supplemental Nutrition Assistance Program',
                phone: '1-800-221-5689',
                website: 'https://www.fns.usda.gov/snap',
                icon: ShoppingBasket,
                color: 'orange'
              },
              {
                category: 'Transportation',
                name: 'Eldercare Locator',
                description: 'Connect to local transportation services',
                phone: '1-800-677-1116',
                website: 'https://eldercare.acl.gov',
                icon: Car,
                color: 'yellow'
              },
              {
                category: 'Health Info',
                name: 'NIH Senior Health',
                description: 'Health information from National Institutes',
                phone: '1-800-222-2225',
                website: 'https://www.nia.nih.gov',
                icon: Brain,
                color: 'cyan'
              },
              {
                category: 'Prescription Help',
                name: 'Extra Help/LIS',
                description: 'Medicare prescription drug cost assistance',
                phone: '1-800-772-1213',
                website: 'https://www.ssa.gov/medicare/prescriptionhelp',
                icon: Pill,
                color: 'emerald'
              },
              {
                category: 'Emergency',
                name: 'Crisis Support',
                description: '24/7 mental health crisis support',
                phone: '988',
                website: 'https://988lifeline.org',
                icon: Phone,
                color: 'rose'
              }
            ].map((resource, index) => {
              const Icon = resource.icon;
              const colorClasses = {
                blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
                green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
                red: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
                orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700',
                yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
                cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 border-cyan-300 dark:border-cyan-700',
                emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
                rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700'
              };

              const colorMap = {
                blue: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
                green: { bg: 'bg-green-500', hover: 'hover:bg-green-600' },
                red: { bg: 'bg-red-500', hover: 'hover:bg-red-600' },
                orange: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600' },
                yellow: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
                cyan: { bg: 'bg-cyan-500', hover: 'hover:bg-cyan-600' },
                emerald: { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
                rose: { bg: 'bg-rose-500', hover: 'hover:bg-rose-600' }
              };

              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden group">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-3 rounded-lg ${colorMap[resource.color as keyof typeof colorMap]?.bg || colorMap.blue.bg} bg-opacity-10 group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`w-6 h-6 ${resource.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : resource.color === 'green' ? 'text-green-600 dark:text-green-400' : resource.color === 'red' ? 'text-red-600 dark:text-red-400' : resource.color === 'orange' ? 'text-orange-600 dark:text-orange-400' : resource.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' : resource.color === 'cyan' ? 'text-cyan-600 dark:text-cyan-400' : resource.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{resource.name}</h4>
                          <Badge className={`text-xs ${colorClasses[resource.color as keyof typeof colorClasses] || colorClasses.blue} border`}>
                            {resource.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{resource.description}</p>
                        <div className="space-y-2">
                          <a href={`tel:${resource.phone.replace(/\D/g, '')}`} className="flex items-center text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <Phone className="w-4 h-4 mr-2" />
                            {resource.phone}
                          </a>
                          {resource.website && (
                            <a href={resource.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              <Globe className="w-4 h-4 mr-2" />
                              Visit Website
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          </div>
        </div>
      </section>

      {/* Partner Onboarding Section - Communities & Vendors */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Join the MySeniorValet Platform
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Whether you're a senior living community or a service provider, join thousands already connecting with families across North America
            </p>
          </div>

          {/* Two Cards Side by Side */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Communities Card - Enhanced to match Vendor quality */}
            <Card className="shadow-xl overflow-hidden border-0 hover:shadow-2xl transition-shadow duration-300 relative">
              {/* Premium badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-br from-blue-400 to-cyan-500 px-4 py-2 rounded-bl-lg">
                <span className="text-xs font-bold text-white">34,171 COMMUNITIES</span>
              </div>
              
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Senior Living Communities
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    Join thousands of communities connecting with families actively searching for care
                  </p>
                  
                  {/* Enhanced Community Benefits */}
                  <div className="space-y-3 mb-6 text-left w-full">
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0 animate-pulse" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Free Verified Listings</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Get started at no cost with verified status</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Featured Placement Options</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Boost visibility in search & maps</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Tour Scheduler Integration</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Automated booking & lead capture</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Analytics & Performance</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Track views, inquiries & conversions</p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Pricing Display */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg p-4 mb-6 w-full border border-blue-200 dark:border-blue-700">
                    <div className="text-center">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">4 TIER OPTIONS</p>
                      <p className="text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Free → $149 → $249 → $349
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Monthly subscriptions • Cancel anytime</p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 w-full"
                    onClick={() => setLocation('/community-portal')}
                  >
                    <Building className="w-5 h-5 mr-2" />
                    Claim Your Community
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Vendors Card - Enhanced */}
            <Card className="shadow-xl overflow-hidden border-0 hover:shadow-2xl transition-shadow duration-300 relative">
              {/* Premium badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-br from-yellow-400 to-amber-500 px-4 py-2 rounded-bl-lg">
                <span className="text-xs font-bold text-gray-900">3 TIERS AVAILABLE</span>
              </div>
              
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Vendor Marketplace
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    Join 1,500+ vendors reaching families nationwide with trusted senior care services
                  </p>
                  
                  {/* Enhanced Vendor Benefits */}
                  <div className="space-y-3 mb-6 text-left w-full">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0 animate-pulse" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Nationwide Coverage Available</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Reach families across all markets</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Reach 34,171 Communities</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Connect with families across North America</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Premium Analytics & Leads</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Track performance & generate quality leads</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Verified Partner Badge</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Build trust with official verification</p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Pricing Display */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg p-4 mb-6 w-full border border-purple-200 dark:border-purple-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Professional tiers starting at:</p>
                    <div className="flex flex-wrap justify-center gap-2 text-sm">
                      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">$99 Basic Listing</Badge>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">$249 Featured</Badge>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">$499 National Partner</Badge>
                    </div>
                  </div>

                  {/* Enhanced CTA Buttons */}
                  <div className="space-y-3 w-full">
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 w-full transform hover:scale-105"
                      onClick={() => setLocation('/vendor-marketplace-tiers')}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Explore Vendor Tiers
                    </Button>
                    <Button
                      variant="outline"
                      className="border-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium px-8 py-2 rounded-lg transition-all duration-200 w-full"
                      onClick={() => setLocation('/vendor-signup')}
                    >
                      Get Started Today
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Combined Disclaimer */}
          <div className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-600" />
              Platform Partnership Information
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              MySeniorValet aggregates publicly available information about senior services for your convenience. 
              We participate in the Amazon Services LLC Associates Program. All other listings are provided without formal partnerships unless explicitly marked with "Official Partner" badges.
            </p>
            
            {/* Removal Options */}
            <details className="group mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200 list-none flex items-center gap-2">
                <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                Already listed and need to update or remove your information?
              </summary>
              <div className="mt-4 pl-6 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  If you're an authorized representative and need to manage your listing:
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation('/claim-listing')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Claim Your Listing
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                    onClick={() => setShowRemovalModal(true)}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Request Removal
                  </Button>
                </div>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4">MySeniorValet</h4>
              <p className="text-sm">Your trusted platform for senior living transparency.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/communities" className="hover:text-white">Communities</Link></li>
                <li><Link href="/vendor-marketplace" className="hover:text-white">Vendor Marketplace</Link></li>
                <li><Link href="/senior-resources" className="hover:text-white">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <p className="text-sm">Questions? Contact our support team.</p>
              <p className="text-sm mt-2">hello@myseniorvalet.com</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; 2025 MySeniorValet. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Removal Request Modal */}
      <RemovalRequestModal
        open={showRemovalModal}
        onOpenChange={setShowRemovalModal}
        entityType="vendor"
      />
      
      {/* Onboarding Wizard */}
      <OnboardingWrapper />
    </div>
  );
}
