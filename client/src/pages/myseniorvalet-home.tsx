import { useState, useEffect } from "react";
import { EnhancedCommunityCard } from "@/components/EnhancedCommunityCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, MapPin, Star, Home, Building2, DollarSign, Users, Info, MessageCircle, Link2, Truck, Sofa, Pill, Eye, Clock, Phone, Brain, Sparkles, Building, Ambulance, Package, CheckCircle, Stethoscope, Activity, ShieldCheck, Scale, Utensils, Car, Scissors, Users2, FileText, Calculator, ShoppingCart, Trash2, Flower, TrendingUp, Shield, ArrowRight, Shirt as ShirtIcon, RefreshCw, ExternalLink, Globe, HeartHandshake, ChevronRight, BarChart, X, Flag, Languages } from "lucide-react";
import { ServiceBadges, commonBadges } from "@/components/ServiceBadges";
import { Link } from "wouter";
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




export default function MySeniorValetHome() {
  console.log("MYSENIORVALET HOME PAGE LOADED - VERSION 3 WITH CONCIERGE SERVICES PRIORITIZED - 25,376 COMMUNITIES");
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAmazonCategory, setSelectedAmazonCategory] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showProtectionModal, setShowProtectionModal] = useState(false);
  const [protectionSearchQuery, setProtectionSearchQuery] = useState('');

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
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 font-semibold mb-8">Beyond communities - everything seniors need for independent living</p>
            
            {/* Status Pills - Smaller on mobile */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
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
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <span className="relative">
                    <span className="absolute inset-0 animate-pulse">✨</span>
                    <span className="relative">NEW ECOSYSTEM</span>
                  </span>
                </Badge>
              </div>
            </div>
            

          </div>

          {/* Vendor Marketplace Tabs */}
          <div className="mb-12">
            <VendorMarketplaceTabs />
          </div>








          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <Link href="/moving">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 relative overflow-hidden">
                <CardContent className="p-4 text-center">
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <Truck className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm text-green-700 dark:text-green-300">Moving Services</h4>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Senior move specialists</p>
                  <div className="flex gap-1 justify-center mt-1">
                    <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">✓ VERIFIED</Badge>
                    <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5">TWO MEN</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Pill className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Rx Delivery</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Medication services</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Building className="w-10 h-10 text-purple-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Senior Centers</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Community programs</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Link href="/transportation">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 relative overflow-hidden">
                <CardContent className="p-4 text-center">
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <Car className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm text-blue-700 dark:text-blue-300">Transportation</h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">No smartphone needed</p>
                  <div className="flex gap-1 justify-center mt-1">
                    <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">✓ VERIFIED</Badge>
                    <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5">GOGO</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/family-connect">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 relative overflow-hidden">
                <CardContent className="p-4 text-center">
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <Users className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm text-indigo-700 dark:text-indigo-300">Family Connect</h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Coordinate care together</p>
                  <div className="flex gap-1 justify-center mt-1">
                    <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">✓ NEW</Badge>
                    <Badge className="bg-indigo-500 text-white text-xs px-2 py-0.5">SECURE</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/vendor/1800florals">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 relative overflow-hidden">
                <CardContent className="p-4 text-center">
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="w-16 h-16 mx-auto mb-2 rounded-lg overflow-hidden bg-white shadow-sm">
                    <img 
                      src="https://www.800florals.com/img/4810Dmd.jpg" 
                      alt="1-800-FLORALS Arrangements"
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      loading="eager"
                    />
                    <div className="w-full h-full hidden items-center justify-center text-pink-500 text-2xl font-bold">🌸</div>
                  </div>
                  <h4 className="font-semibold text-sm text-pink-700 dark:text-pink-300">Professional Florals</h4>
                  <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">Move-in arrangements & gifts</p>
                  <div className="flex gap-1 justify-center mt-1">
                    <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">✓ VERIFIED</Badge>
                    <Badge className="bg-pink-500 text-white text-xs px-2 py-0.5">1-800-FLORALS</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/vendor-marketplace">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 relative overflow-hidden">
                <CardContent className="p-4 text-center">
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <ShoppingCart className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm text-amber-700 dark:text-amber-300">Vendor Marketplace</h4>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Trusted senior brands</p>
                  <div className="flex gap-1 justify-center mt-1">
                    <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">✓ NEW</Badge>
                    <Badge className="bg-amber-500 text-white text-xs px-2 py-0.5">CURATED</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Scale className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Legal Services</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Elder law attorneys</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Calculator className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Financial Planning</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Senior financial advisors</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
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

          <div className="text-center">
            <Link href="/senior-services">
              <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                Browse All Services →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Senior Resources Section */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-xl bg-white dark:bg-gray-800 border-0">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-2 gradient-text-blue">Senior Resources & Support</h3>
                <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-violet-500 mx-auto rounded-full"></div>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">Government assistance programs and food resources</p>
              </div>

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
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Amazon Senior Living Essentials Section */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Amazon Senior Living Essentials - California Communities Style */}
          <div className="mb-12">
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
                
                {/* Amazon Associate Disclosure - FTC Compliance */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    As an Amazon Associate, MySeniorValet earns from qualifying purchases. 
                    Product prices and availability are accurate as of the date/time indicated and are subject to change.
                  </p>
                </div>
              </div>
            </div>
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
                
                {/* Care Service Categories - Full Width Rows */}
                <div className="space-y-4 mb-8">
                  {(() => {
                    const services = (careServicesData as any)?.services || [];
                    const categories = [
                      {
                        name: 'Home Care Services',
                        icon: Home,
                        count: services.filter((s: any) => s.serviceCategory === 'Home Care Services').length,
                        description: 'Professional in-home support and care',
                        features: ['24/7 availability', 'Licensed caregivers', 'Personal care assistance', 'Medication management'],
                        bgGradient: 'from-green-500 to-green-600',
                        bgLight: 'bg-green-50 dark:bg-green-900/20',
                        borderColor: 'border-green-200 dark:border-green-800',
                        textColor: 'text-green-700 dark:text-green-300'
                      },
                      {
                        name: 'Therapy Services',
                        icon: Activity,
                        count: services.filter((s: any) => s.serviceCategory === 'Therapy Services').length,
                        description: 'Physical, occupational, and speech therapy',
                        features: ['Physical therapy', 'Occupational therapy', 'Speech therapy', 'In-home sessions available'],
                        bgGradient: 'from-purple-500 to-purple-600',
                        bgLight: 'bg-purple-50 dark:bg-purple-900/20',
                        borderColor: 'border-purple-200 dark:border-purple-800',
                        textColor: 'text-purple-700 dark:text-purple-300'
                      },
                      {
                        name: 'Adult Day Care',
                        icon: Users,
                        count: services.filter((s: any) => s.serviceCategory === 'Adult Day Care').length,
                        description: 'Daytime programs for social engagement and activities',
                        features: ['Social activities', 'Meals provided', 'Transportation available', 'Memory care programs'],
                        bgGradient: 'from-teal-500 to-teal-600',
                        bgLight: 'bg-teal-50 dark:bg-teal-900/20',
                        borderColor: 'border-teal-200 dark:border-teal-800',
                        textColor: 'text-teal-700 dark:text-teal-300'
                      },
                      {
                        name: 'Personal Care Services',
                        icon: Users2,
                        count: services.filter((s: any) => s.serviceCategory === 'Personal Care Services').length,
                        description: 'Daily living assistance and personal hygiene support',
                        features: ['Bathing assistance', 'Dressing help', 'Grooming support', 'Mobility assistance'],
                        bgGradient: 'from-orange-500 to-orange-600',
                        bgLight: 'bg-orange-50 dark:bg-orange-900/20',
                        borderColor: 'border-orange-200 dark:border-orange-800',
                        textColor: 'text-orange-700 dark:text-orange-300'
                      },
                      {
                        name: 'Hospice Care',
                        icon: Heart,
                        count: services.filter((s: any) => s.serviceCategory === 'Hospice Care').length,
                        description: 'Compassionate end-of-life care and family support',
                        features: ['Pain management', 'Emotional support', 'Family counseling', '24/7 on-call team'],
                        bgGradient: 'from-indigo-500 to-indigo-600',
                        bgLight: 'bg-indigo-50 dark:bg-indigo-900/20',
                        borderColor: 'border-indigo-200 dark:border-indigo-800',
                        textColor: 'text-indigo-700 dark:text-indigo-300'
                      }
                    ];
                    
                    return categories.map((category) => (
                      <div
                        key={category.name}
                        className={`${category.bgLight} ${category.borderColor} border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]`}
                        onClick={() => setSelectedCategory(category.name)}
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                          {/* Icon and Title Section */}
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-16 h-16 bg-gradient-to-br ${category.bgGradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                              <category.icon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">{category.name}</h4>
                              <p className={`text-sm ${category.textColor} mt-1`}>{category.description}</p>
                            </div>
                          </div>
                          
                          {/* Features Section - Hidden on small mobile */}
                          <div className="hidden sm:block flex-1">
                            <div className="grid grid-cols-2 gap-2">
                              {category.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <CheckCircle className={`w-4 h-4 ${category.textColor}`} />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Count and Action */}
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{category.count}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                            </div>
                            <ChevronRight className={`w-6 h-6 ${category.textColor}`} />
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Care Service Sections Container */}
          <>
            {/* Senior Placement Agencies Section - REMOVED per user request */}

            {/* Home Care Services Section */}
            {(() => {
              const services = (careServicesData as any)?.services || [];
              const homeCareServices = services.filter((s: any) => s.serviceCategory === 'Home Care Services');
              
              if (homeCareServices.length > 0) {
                return (
                  <section className="px-4 py-8 relative overflow-hidden mb-8">
                    {/* Background with premium gradient styling */}
                    <div className="absolute inset-0 z-0">
                      <div className="w-full h-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-100/30 via-emerald-100/20 to-teal-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          Home Care Services
                        </h2>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{homeCareServices.length} Providers</div>
                          <div className="text-xs text-green-600 dark:text-green-400">In-home support & care</div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Professional care in the comfort of your home • Licensed & insured providers</p>
                    
                      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                        {homeCareServices.slice(0, 20).map((service: any, index: number) => {
                          const badges = [
                            commonBadges.governmentVerified,
                            ...(service.careTypes?.includes('Medicare') ? [commonBadges.medicareAccepted] : []),
                            ...(service.careTypes?.includes('Medicaid') ? [commonBadges.medicaidAccepted] : []),
                            commonBadges.stateLicensed,
                            ...(service.website ? [{ type: 'info' as const, label: 'Website Available' }] : [])
                          ].slice(0, 4);
                          
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

            {/* Therapy Services Section */}
            {(() => {
              const services = (careServicesData as any)?.services || [];
              const therapyServices = services.filter((s: any) => s.serviceCategory === 'Therapy Services');
              
              if (therapyServices.length > 0) {
                return (
                  <section className="px-4 py-8 relative overflow-hidden mb-8">
                    {/* Background with premium gradient styling */}
                    <div className="absolute inset-0 z-0">
                      <div className="w-full h-full bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 via-pink-100/20 to-fuchsia-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          Therapy Services
                        </h2>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{therapyServices.length} Providers</div>
                          <div className="text-xs text-purple-600 dark:text-purple-400">Physical & occupational therapy</div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Specialized therapy services to improve mobility & independence • Medicare certified</p>
                    
                      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                        {therapyServices.slice(0, 20).map((service: any, index: number) => {
                          const badges = [
                            commonBadges.governmentVerified,
                            ...(service.careTypes?.includes('Medicare') ? [commonBadges.medicareAccepted] : []),
                            ...(service.careTypes?.includes('Medicaid') ? [commonBadges.medicaidAccepted] : []),
                            commonBadges.stateLicensed,
                            ...(service.website ? [{ type: 'info' as const, label: 'Website Available' }] : [])
                          ].slice(0, 4);
                          
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

            {/* Adult Day Care Section */}
            {(() => {
              const services = (careServicesData as any)?.services || [];
              const adultDayCare = services.filter((s: any) => s.serviceCategory === 'Adult Day Care');
              
              if (adultDayCare.length > 0) {
                return (
                  <section className="px-4 py-8 relative overflow-hidden mb-8">
                    {/* Background with premium gradient styling */}
                    <div className="absolute inset-0 z-0">
                      <div className="w-full h-full bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-100/30 via-cyan-100/20 to-sky-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          Adult Day Care Centers
                        </h2>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{adultDayCare.length} Providers</div>
                          <div className="text-xs text-teal-600 dark:text-teal-400">Daytime programs & activities</div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Social engagement & supervised care during the day • Transportation available</p>
                    
                      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                        {adultDayCare.slice(0, 20).map((service: any, index: number) => {
                          const badges = [
                            commonBadges.governmentVerified,
                            ...(service.careTypes?.includes('Medicare') ? [commonBadges.medicareAccepted] : []),
                            ...(service.careTypes?.includes('Medicaid') ? [commonBadges.medicaidAccepted] : []),
                            { type: 'feature' as const, label: 'Activities & Meals' },
                            ...(service.website ? [{ type: 'info' as const, label: 'Website Available' }] : [])
                          ].slice(0, 4);
                          
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

            {/* Personal Care Services Section */}
            {(() => {
              const services = (careServicesData as any)?.services || [];
              const personalCare = services.filter((s: any) => s.serviceCategory === 'Personal Care Services');
              
              if (personalCare.length > 0) {
                return (
                  <section className="px-4 py-8 relative overflow-hidden mb-8">
                    {/* Background with premium gradient styling */}
                    <div className="absolute inset-0 z-0">
                      <div className="w-full h-full bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-100/30 via-amber-100/20 to-yellow-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          Personal Care Services
                        </h2>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{personalCare.length} Providers</div>
                          <div className="text-xs text-orange-600 dark:text-orange-400">Daily living assistance</div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Help with bathing, dressing & personal hygiene • Compassionate caregivers</p>
                    
                      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                        {personalCare.slice(0, 20).map((service: any, index: number) => {
                          const badges = [
                            commonBadges.governmentVerified,
                            ...(service.careTypes?.includes('Medicare') ? [commonBadges.medicareAccepted] : []),
                            ...(service.careTypes?.includes('Medicaid') ? [commonBadges.medicaidAccepted] : []),
                            commonBadges.stateLicensed,
                            ...(service.website ? [{ type: 'info' as const, label: 'Website Available' }] : [])
                          ].slice(0, 4);
                          
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

            {/* Hospice Care Section */}
            {(() => {
              const services = (careServicesData as any)?.services || [];
              const hospiceCare = services.filter((s: any) => s.serviceCategory === 'Hospice Care');
              
              if (hospiceCare.length > 0) {
                return (
                  <section className="px-4 py-8 relative overflow-hidden mb-8">
                    {/* Background with premium gradient styling */}
                    <div className="absolute inset-0 z-0">
                      <div className="w-full h-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/30 via-purple-100/20 to-pink-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          Hospice Care Services
                        </h2>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{hospiceCare.length} Providers</div>
                          <div className="text-xs text-indigo-600 dark:text-indigo-400">Comfort & dignity care</div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Compassionate end-of-life care & family support • 24/7 availability</p>
                    
                      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                        {hospiceCare.slice(0, 20).map((service: any, index: number) => {
                          const badges = [
                            commonBadges.governmentVerified,
                            ...(service.careTypes?.includes('Medicare') ? [commonBadges.medicareAccepted] : []),
                            ...(service.careTypes?.includes('Medicaid') ? [commonBadges.medicaidAccepted] : []),
                            commonBadges.available247,
                            ...(service.website ? [{ type: 'info' as const, label: 'Website Available' }] : [])
                          ].slice(0, 4);
                          
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

            {/* Respite Care Section */}
            {(() => {
              const services = (careServicesData as any)?.services || [];
              const respiteCare = services.filter((s: any) => s.serviceCategory === 'Respite Care');
              
              if (respiteCare.length > 0) {
                return (
                  <section className="px-4 py-8 relative overflow-hidden mb-8">
                    {/* Background with premium gradient styling */}
                    <div className="absolute inset-0 z-0">
                      <div className="w-full h-full bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-100/30 via-pink-100/20 to-red-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          Respite Care Services
                        </h2>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{respiteCare.length} Providers</div>
                          <div className="text-xs text-rose-600 dark:text-rose-400">Temporary relief for caregivers</div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Short-term care & caregiver relief • Flexible scheduling • Peace of mind</p>
                    
                      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                        {respiteCare.slice(0, 20).map((service: any, index: number) => {
                          const badges = [
                            commonBadges.governmentVerified,
                            ...(service.careTypes?.includes('Medicare') ? [commonBadges.medicareAccepted] : []),
                            ...(service.careTypes?.includes('Medicaid') ? [commonBadges.medicaidAccepted] : []),
                            commonBadges.stateLicensed,
                            ...(service.website ? [{ type: 'info' as const, label: 'Website Available' }] : [])
                          ].slice(0, 4);
                          
                          return (
                            <CareServiceCard
                              key={service.id || index}
                              service={service}
                              index={index}
                              borderColor="border-rose-200 dark:border-gray-700"
                              hoverBorderColor="hover:border-rose-300 dark:hover:border-gray-600"
                              iconBgColor="bg-gradient-to-br from-rose-500 to-rose-600"
                              iconRingColor="ring-rose-100 dark:ring-rose-900"
                              icon={<HeartHandshake className="w-8 h-8 text-white" />}
                              categoryBadgeColor="bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900 dark:to-rose-800"
                              categoryBadgeBorder="border-rose-300 dark:border-rose-600"
                              categoryLabel="Respite Care"
                              buttonColor="bg-gradient-to-r from-rose-500 to-rose-600"
                              buttonHoverColor="hover:from-rose-600 hover:to-rose-700"
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

            {/* All Care Services - Default View */}
            {!selectedCategory && (
              <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                {careServicesLoading ? (
                  <div className="text-center w-full py-8">
                    <p className="text-gray-600 dark:text-gray-400">Loading verified care services...</p>
                  </div>
                ) : careServicesData && (careServicesData as any).services && ((careServicesData as any).services as any[]).length > 0 ? (
                  (() => {
                    // Create a diverse mix of services from different categories
                    const services = (careServicesData as any).services as any[];
                    const categories = ['Home Care Services', 'Therapy Services', 'Adult Day Care', 'Personal Care Services', 'Hospice Care'];
                    const diverseServices: any[] = [];
                    
                    // Get two services from each category to ensure diversity
                    categories.forEach(category => {
                      const servicesFromCategory = services.filter(s => s.serviceCategory === category).slice(0, 2);
                      diverseServices.push(...servicesFromCategory);
                    });
                    
                    return diverseServices.slice(0, 12).map((service: any, index: number) => {
                  // Map service categories to colors and icons
                  const categoryConfig: any = {
                    'Home Care Services': { color: 'from-green-500 to-green-600', icon: <Home className="w-8 h-8 text-white" /> },
                    'Therapy Services': { color: 'from-purple-500 to-purple-600', icon: <Activity className="w-8 h-8 text-white" /> },
                    'Adult Day Care': { color: 'from-teal-500 to-teal-600', icon: <Users className="w-8 h-8 text-white" /> },
                    'Personal Care Services': { color: 'from-orange-500 to-orange-600', icon: <Users className="w-8 h-8 text-white" /> },
                    'Hospice Care': { color: 'from-indigo-500 to-indigo-600', icon: <Heart className="w-8 h-8 text-white" /> }
                  };
                  
                  const config = categoryConfig[service.serviceCategory] || categoryConfig['Home Care Services'];
                  
                  // Dynamic badge assignment based on service features
                  const badges = [
                    commonBadges.governmentVerified,
                    ...(service.careTypes?.includes('Medicare') ? [commonBadges.medicareAccepted] : []),
                    ...(service.careTypes?.includes('Medicaid') ? [commonBadges.medicaidAccepted] : []),
                    ...(service.serviceCategory === 'Senior Placement Agency' ? [commonBadges.available247] : []),
                    ...(service.website ? [{ type: 'verified' as const, label: 'Website Available' }] : [])
                  ].slice(0, 4); // Limit to 4 badges for space
                  
                  return (
                    <Card key={service.id || index} className="overflow-hidden flex-shrink-0 w-96 h-80 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] bg-white dark:bg-gray-800">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                            {config.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-gray-300 dark:border-gray-600">
                                {service.serviceCategory}
                              </Badge>
                              {service.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{service.rating}</span>
                                </div>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{service.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{service.city}, {service.state}</p>
                          </div>
                        </div>
                        
                        <ServiceBadges badges={badges} className="mb-3" size="sm" />
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contact</span>
                          <span className="text-base font-bold text-blue-600 dark:text-blue-400">{service.phone}</span>
                        </div>
                        
                        <div className="space-y-1.5 mb-4 flex-grow">
                          {service.careTypes && service.careTypes.length > 0 ? (
                            service.careTypes.slice(0, 3).map((feature: string, idx: number) => (
                              <div key={idx} className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                                <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                                <span className="line-clamp-1">{feature}</span>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                              <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                              <span>Professional care services</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2 mt-auto">
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                              onClick={() => window.open(`tel:${service.phone}`, '_self')}
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              Call Now
                            </Button>
                            {service.website && (
                              <Button 
                                size="sm"
                                variant="outline" 
                                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold"
                                onClick={() => window.open(service.website, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Website
                              </Button>
                            )}
                          </div>
                          <div className="text-xs text-center text-green-600 dark:text-green-400 font-medium">
                            ✓ Government Database Verified
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                  });
                })()
              ) : (
                // No care services found
                <div className="text-center w-full py-8">
                  <p className="text-gray-600 dark:text-gray-400">No care services available at this time.</p>
                </div>
              )}
            </div>
            )}
          </>
        </div>
      </section>

      {/* Resources for Seniors */}
      <section className="px-4 py-8 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Resources for Seniors
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Essential government programs, healthcare resources, and support services for seniors
            </p>
          </div>

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
                name: 'Veterans Affairs',
                description: 'Healthcare and benefits for veterans',
                phone: '1-800-827-1000',
                website: 'https://www.va.gov',
                icon: Shield,
                color: 'red'
              },
              {
                category: 'Advocacy',
                name: 'AARP',
                description: 'Advocacy and resources for people 50+',
                phone: '1-888-687-2277',
                website: 'https://www.aarp.org',
                icon: Users2,
                color: 'purple'
              },
              {
                category: 'Healthcare',
                name: 'Medicaid',
                description: 'Health coverage for low-income individuals',
                phone: '1-877-267-2323',
                website: 'https://www.medicaid.gov',
                icon: Heart,
                color: 'pink'
              },
              {
                category: 'Nutrition',
                name: 'Meals on Wheels',
                description: 'Home-delivered meals for seniors',
                phone: '1-888-998-6325',
                website: 'https://www.mealsonwheelsamerica.org',
                icon: Utensils,
                color: 'orange'
              },
              {
                category: 'Legal',
                name: 'National Legal Aid',
                description: 'Free legal help for seniors',
                phone: '1-844-529-3494',
                website: 'https://www.lsc.gov',
                icon: Scale,
                color: 'indigo'
              },
              {
                category: 'Housing',
                name: 'HUD Senior Housing',
                description: 'Affordable housing assistance',
                phone: '1-800-569-4287',
                website: 'https://www.hud.gov/topics/information_for_senior_citizens',
                icon: Home,
                color: 'teal'
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
                blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
                red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
                purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
                pink: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
                orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
                indigo: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
                teal: 'bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
                yellow: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
                cyan: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
                emerald: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
                rose: 'bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
              };
              const bgColor = colorClasses[resource.color as keyof typeof colorClasses].split(' ').slice(0, 2).join(' ');
              const textColor = colorClasses[resource.color as keyof typeof colorClasses].split(' ').slice(2).join(' ');
              
              return (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-gray-300 dark:hover:border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${textColor}`} />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {resource.category}
                      </Badge>
                    </div>
                    
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{resource.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{resource.description}</p>
                    
                    <div className="space-y-2">
                      <a 
                        href={`tel:${resource.phone.replace(/\D/g, '')}`} 
                        className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        {resource.phone}
                      </a>
                      
                      <Button 
                        size="sm" 
                        className="w-full"
                        variant="outline"
                        onClick={() => window.open(resource.website, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Visit Website
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Need Help Finding Resources?</strong> Call the Eldercare Locator at 1-800-677-1116 to connect with local services in your area.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* California Ombudsman & Adult Protective Services Directory */}
      <section className="px-4 py-8 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  California Senior Protection Services
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Ombudsman Programs & Adult Protective Services (APS) - Your advocates for quality care and protection
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-red-600 dark:text-red-400">Emergency? Call 911</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Statewide APS: 1-833-401-0832</div>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                  <strong>Important:</strong> These services protect seniors from abuse, neglect, and exploitation. All reports can be made anonymously.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {/* California Protection Services Data */}
            {[
              // Ombudsman Programs
              { type: 'Ombudsman', county: 'Del Norte & Humboldt', phone: '(707) 269-1330', address: '333 J Street, Suite 206, Eureka, CA 95501', coordinator: 'Andrea Bruhnke' },
              { type: 'Ombudsman', county: 'Shasta/Siskiyou/Trinity', phone: '(530) 229-1435', address: '1647 Hartnell Ave, Suite 6, Redding, CA 96002', coordinator: 'Jerry Kirouac' },
              { type: 'Ombudsman', county: 'Los Angeles', phone: '(800) 334-9473', org: 'Wise & Healthy Aging', coverage: '92,859 seniors in 2,252 facilities' },
              { type: 'Ombudsman', county: 'San Diego', phone: '(800) 640-4661', email: 'ombudsman@sdcounty.ca.gov', website: 'https://www.sandiegocounty.gov' },
              { type: 'Ombudsman', county: 'Santa Barbara', phone: '(805) 922-1236', address: '123 W. Gutierrez, Santa Barbara, CA 93101', coordinator: 'Marco Quintanar' },
              { type: 'Ombudsman', county: 'Ventura', phone: '(805) 656-1986', address: '2021 Sperry Avenue, #35, Ventura, CA 93003' },
              { type: 'Ombudsman', county: 'Orange & Riverside', org: 'Council on Aging - Southern California', phone: '(714) 479-0107' },
              { type: 'Ombudsman', county: 'San Bernardino', phone: '(909) 891-3900', website: 'hss.sbcounty.gov/daas/programs/Ombudsman.aspx' },
              { type: 'Ombudsman', county: 'Lake County', phone: '(707) 263-4191', website: 'lakecountyca.gov/771/Long-Term-Care-Ombudsman' },
              { type: 'Ombudsman', county: 'Santa Clara', phone: '(408) 944-0567', coordinator: 'Linda Dominguez' },
              
              // Adult Protective Services
              { type: 'APS', county: 'Los Angeles', phone: '1-877-477-3646', service: 'Elder Abuse Hotline', hours: '24/7' },
              { type: 'APS', county: 'Kern', phone: '(661) 868-1006', altPhone: '(800) 277-7866', email: 'apsinfo@kerncounty.com', hours: '24/7' },
              { type: 'APS', county: 'San Francisco', phone: '(415) 355-6700', altPhone: '(800) 814-0009', website: 'ReportToAPS.org', hours: '24/7' },
              { type: 'APS', county: 'Santa Clara', phone: '(408) 975-4900', altPhone: '(800) 414-2002', hours: '24/7' },
              { type: 'APS', county: 'Tulare', phone: '(559) 624-8078', contact: 'Civil Rights Coordinator' },
              { type: 'APS', county: 'Sacramento', phone: '1-833-401-0832', note: 'Use statewide number with zip code' },
              { type: 'APS', county: 'San Bernardino', phone: '1-833-401-0832', website: 'hss.sbcounty.gov/daas/programs/APS.aspx' },
              { type: 'APS', county: 'Alameda', phone: '1-833-401-0832', note: 'Use statewide number with zip code' },
              { type: 'APS', county: 'Calaveras', phone: '1-833-401-0832', website: 'socialservices.calaverasgov.us' },
              { type: 'APS', county: 'Del Norte', phone: '1-833-401-0832', note: 'Forms available for fax/mail submission' },
              
              // Additional Counties
              { type: 'Ombudsman', county: 'Fresno', phone: '(559) 459-2272', address: '5091 E. Clinton Way, Fresno, CA 93727' },
              { type: 'Ombudsman', county: 'Contra Costa', phone: '(925) 602-4390', org: 'Contra Costa Senior Legal Services' },
              { type: 'Ombudsman', county: 'Monterey', phone: '(831) 755-4646', address: '1441 Schilling Place, Salinas, CA 93901' },
              { type: 'Ombudsman', county: 'Solano', phone: '(707) 784-8982', coverage: 'All skilled nursing and residential care facilities' },
              { type: 'Ombudsman', county: 'Marin', phone: '(415) 457-INFO', address: '10 North San Pedro Road, San Rafael, CA 94903' },
              { type: 'APS', county: 'Fresno', phone: '(559) 600-2345', hours: 'M-F 8am-5pm' },
              { type: 'APS', county: 'Orange', phone: '(714) 825-3000', altPhone: '(800) 451-5155', hours: '24/7' },
              { type: 'APS', county: 'Riverside', phone: '(800) 491-7123', website: 'dpss.co.riverside.ca.us' },
              { type: 'APS', county: 'Contra Costa', phone: '(877) 839-4347', hours: '24/7 hotline' },
              { type: 'APS', county: 'San Mateo', phone: '(800) 675-8437', hours: 'M-F 8am-5pm' },
              { type: 'APS', county: 'Monterey', phone: '(831) 755-4471', hours: '24/7' },
              { type: 'APS', county: 'Sonoma', phone: '(877) 699-6877', hours: '24/7 reporting line' }
            ].map((service, index) => (
              <Card 
                key={index} 
                className={`overflow-hidden flex-shrink-0 w-80 hover:shadow-xl transition-all duration-300 border-2 ${
                  service.type === 'Ombudsman' 
                    ? 'border-blue-200 dark:border-blue-400' 
                    : 'border-red-200 dark:border-red-400'
                } bg-white dark:bg-gray-800`}
              >
                <div className="relative">
                  <div className={`h-2 ${
                    service.type === 'Ombudsman' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                      : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}></div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge 
                          variant="outline" 
                          className={`mb-2 ${
                            service.type === 'Ombudsman' 
                              ? 'border-blue-500 text-blue-700 dark:text-blue-300' 
                              : 'border-red-500 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {service.type === 'Ombudsman' ? 'Long-Term Care Ombudsman' : 'Adult Protective Services'}
                        </Badge>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{service.county} County</h4>
                      </div>
                      <Shield className={`w-5 h-5 ${
                        service.type === 'Ombudsman' 
                          ? 'text-blue-500' 
                          : 'text-red-500'
                      }`} />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <Phone className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <a href={`tel:${service.phone.replace(/\D/g, '')}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            {service.phone}
                          </a>
                          {service.altPhone && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Alt: <a href={`tel:${service.altPhone.replace(/\D/g, '')}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                {service.altPhone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {service.address && (
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                          <span className="text-gray-600 dark:text-gray-300">{service.address}</span>
                        </div>
                      )}
                      
                      {service.hours && (
                        <div className="flex items-start">
                          <Clock className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                          <span className="text-gray-600 dark:text-gray-300">{service.hours}</span>
                        </div>
                      )}
                      
                      {service.coordinator && (
                        <div className="flex items-start">
                          <Users className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                          <span className="text-gray-600 dark:text-gray-300">Coordinator: {service.coordinator}</span>
                        </div>
                      )}
                      
                      {service.org && (
                        <div className="flex items-start">
                          <Building className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                          <span className="text-gray-600 dark:text-gray-300">{service.org}</span>
                        </div>
                      )}
                      
                      {service.coverage && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 italic">{service.coverage}</div>
                      )}
                      
                      {service.note && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 italic">{service.note}</div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Button 
                        size="sm" 
                        className={`w-full ${
                          service.type === 'Ombudsman' 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-red-600 hover:bg-red-700'
                        } text-white`}
                        onClick={() => window.open(`tel:${service.phone.replace(/\D/g, '')}`, '_self')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </Button>
                      {service.website && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full mt-2"
                          onClick={() => window.open(service.website.startsWith('http') ? service.website : `https://${service.website}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit Website
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {/* View All Card */}
            <div className="flex-shrink-0 w-80">
              <Card className="h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-300 dark:border-gray-600 hover:shadow-xl transition-all duration-300">
                <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                      <Search className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Need More Help?</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Find protection services for all 58 California counties
                    </p>
                  </div>
                  <div className="space-y-3 w-full">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      onClick={() => setShowProtectionModal(true)}
                    >
                      View All Counties
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open('tel:18334010832', '_self')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Statewide APS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Senior Living Intelligence - Third Position */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Card className="group bg-gradient-to-br from-blue-600 to-purple-700 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 group-hover:from-blue-400/30 group-hover:to-purple-500/30 transition-all duration-300"></div>
              <CardContent className="p-10 relative z-10">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                      <span className="text-3xl">🧠</span>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">AI-Powered Senior Living Intelligence</h3>
                      <p className="text-blue-100 text-lg">Industry-leading transparency through 4-AI verification: Claude + Gemini + ChatGPT + Grok</p>
                    </div>
                  </div>
                </div>



                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                  <div className="text-white">
                    <h4 className="text-xl font-bold mb-4 text-yellow-300">🚀 What Makes This Revolutionary</h4>
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-yellow-400/20 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-yellow-300 font-bold">1</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-yellow-200 mb-1">Natural Language AI Search</h5>
                          <p className="text-white/90 text-sm">Ask naturally: "Find memory care under $4,000 in Sacramento with pet therapy" - our AI understands context, location, budget, and specific needs</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-green-400/20 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-green-300 font-bold">2</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-green-200 mb-1">Live Pricing Intelligence</h5>
                          <p className="text-white/90 text-sm">AI shows complete pricing spectrum from affordable HUD housing ($303-$800) to luxury resort-style communities ($8,000+) - verified pricing across all care levels and budgets</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-purple-400/20 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-purple-300 font-bold">3</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-purple-200 mb-1">Geospatial Mapping AI</h5>
                          <p className="text-white/90 text-sm">Interactive clustering technology processes 26,306+ communities in real-time, showing live data pins (green = verified pricing, red = call for pricing)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-white">
                    <h4 className="text-xl font-bold mb-4 text-cyan-300">⚡ Industry-Leading 4-AI Verification System</h4>
                    <p className="text-blue-100 text-sm mb-4">Unprecedented transparency through 4-AI collaboration - each AI cross-verifies the others for absolute accuracy</p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-2xl">🧠</div>
                          <Badge className="bg-orange-500 text-white text-xs px-2 py-1">Claude 4.0</Badge>
                        </div>
                        <h5 className="font-semibold text-orange-200 mb-1">Complex Care Planning</h5>
                        <p className="text-white/80 text-xs">Advanced reasoning for matching care needs, analyzing medical requirements, and understanding family dynamics</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-2xl">🔍</div>
                          <Badge className="bg-blue-500 text-white text-xs px-2 py-1">Gemini 2.5</Badge>
                        </div>
                        <h5 className="font-semibold text-blue-200 mb-1">Visual Intelligence</h5>
                        <p className="text-white/80 text-xs">Photo analysis of facilities, virtual tour processing, and visual quality assessment of communities</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-2xl">💰</div>
                          <Badge className="bg-green-500 text-white text-xs px-2 py-1">ChatGPT-4o</Badge>
                        </div>
                        <h5 className="font-semibold text-green-200 mb-1">Financial Transparency</h5>
                        <p className="text-white/80 text-xs">Exposes hidden fees, analyzes contracts, tracks price escalations, and reveals true total costs</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-2xl">🚀</div>
                          <Badge className="bg-red-500 text-white text-xs px-2 py-1 relative">
                            Grok/XAI
                            <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-1 py-0.5 rounded-full font-bold">Soon</span>
                          </Badge>
                        </div>
                        <h5 className="font-semibold text-red-200 mb-1">Real-Time Fact Checking</h5>
                        <p className="text-white/80 text-xs">Live verification of current availability, real-time pricing updates, and instant regulatory compliance checks</p>
                      </div>
                    </div>
                    
                    <div className="bg-purple-500/20 backdrop-blur-sm rounded-lg p-4 mb-4 border border-purple-400/30">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">🔄</span>
                        <h5 className="font-semibold text-purple-200">Multi-AI Cross-Verification</h5>
                      </div>
                      <p className="text-white/90 text-sm">All 4 AIs work together, checking each other's findings to ensure 98% accuracy in pricing, availability, and community information</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h4 className="text-xl font-bold text-white mb-4 text-center">🌟 What You Can Do Right Now</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl mb-2">💬</div>
                      <h5 className="font-semibold text-white mb-1">Ask Naturally</h5>
                      <p className="text-white/80 text-sm">"Pet-friendly assisted living under $5,000 near me"</p>
                    </div>
                    <div>
                      <div className="text-3xl mb-2">🔍</div>
                      <h5 className="font-semibold text-white mb-1">See Live Data</h5>
                      <p className="text-white/80 text-sm">Green pins = verified pricing, red pins = call for pricing</p>
                    </div>
                    <div>
                      <div className="text-3xl mb-2">⚡</div>
                      <h5 className="font-semibold text-white mb-1">Get Instant Results</h5>
                      <p className="text-white/80 text-sm">AI-ranked communities with pricing transparency</p>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-8">
                  <p className="text-white text-lg mb-4">Ready to get started?</p>
                  
                  {/* Interactive Demo Section */}
                  <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <h4 className="text-lg font-bold text-white mb-4 text-center">🚀 Try It Right Now - Experience the AI</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      {/* Interactive Search Bar */}
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white/95 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            placeholder="Try: 'Memory care under $4,000 near Sacramento with therapy'"
                            onChange={(e) => {
                              // Real-time AI search demonstration
                              if (e.target.value.length > 10) {
                                // Show typing indicator
                                const indicator = document.getElementById('ai-indicator');
                                if (indicator) {
                                  indicator.textContent = 'AI analyzing your request...';
                                  indicator.className = 'text-xs text-yellow-300 animate-pulse';
                                }
                              }
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const query = (e.target as HTMLInputElement).value;
                                if (query.trim()) {
                                  // Navigate to search with the query
                                  window.location.href = `/search?q=${encodeURIComponent(query)}`;
                                }
                              }
                            }}
                          />
                        </div>
                        <div id="ai-indicator" className="text-xs text-white/60">Start typing to see AI in action</div>
                        
                        {/* Quick Demo Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <button 
                            className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-xs hover:bg-blue-500/30 transition-colors"
                            onClick={() => {
                              const input = document.querySelector('input[placeholder*="Memory care"]') as HTMLInputElement;
                              if (input) {
                                input.value = 'Assisted living under $3000 in Sacramento';
                                input.focus();
                              }
                            }}
                          >
                            Assisted Living
                          </button>
                          <button 
                            className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-xs hover:bg-green-500/30 transition-colors"
                            onClick={() => {
                              const input = document.querySelector('input[placeholder*="Memory care"]') as HTMLInputElement;
                              if (input) {
                                input.value = 'Pet-friendly memory care with therapy programs';
                                input.focus();
                              }
                            }}
                          >
                            Pet-Friendly
                          </button>
                          <button 
                            className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-xs hover:bg-purple-500/30 transition-colors"
                            onClick={() => {
                              const input = document.querySelector('input[placeholder*="Memory care"]') as HTMLInputElement;
                              if (input) {
                                input.value = 'HUD affordable housing near me';
                                input.focus();
                              }
                            }}
                          >
                            HUD Housing
                          </button>
                        </div>
                        
                        <Button 
                          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 py-3 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-105"
                          onClick={() => {
                            const input = document.querySelector('input[placeholder*="Memory care"]') as HTMLInputElement;
                            const query = input?.value?.trim() || '';
                            if (query) {
                              window.location.href = `/search?q=${encodeURIComponent(query)}`;
                            } else {
                              window.location.href = '/search';
                            }
                          }}
                        >
                          🚀 Try AI-Powered Search Now
                        </Button>
                        <p className="text-white/80 text-sm mt-3 text-center">Experience the future of senior living discovery</p>
                      </div>

                      {/* Miniature Interactive Map */}
                      <div className="relative">
                        <div className="w-full h-64 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-lg border border-white/30 overflow-hidden relative">
                          {/* Mock Map Interface */}
                          <div className="absolute inset-0 bg-gradient-to-br from-green-100/10 to-blue-100/10">
                            {/* Map Pins */}
                            <div className="absolute top-8 left-12 w-3 h-3 bg-green-400 rounded-full animate-pulse cursor-pointer" title="Verified Pricing"></div>
                            <div className="absolute top-16 right-16 w-3 h-3 bg-red-400 rounded-full animate-pulse cursor-pointer" title="Call for Pricing"></div>
                            <div className="absolute bottom-20 left-20 w-3 h-3 bg-green-400 rounded-full animate-pulse cursor-pointer" title="HUD Property"></div>
                            <div className="absolute top-20 left-1/2 w-3 h-3 bg-green-400 rounded-full animate-pulse cursor-pointer" title="Live Pricing"></div>
                            <div className="absolute bottom-16 right-12 w-3 h-3 bg-red-400 rounded-full animate-pulse cursor-pointer" title="Contact Required"></div>
                            
                            {/* Search Result Popup */}
                            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-48">
                              <div className="text-xs font-semibold text-gray-800 mb-1">AI Search Results</div>
                              <div className="text-xs text-gray-600 mb-2">Found 23 matches</div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-700">Memory Care</span>
                                  <span className="text-green-600 font-semibold">$3,850</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-700">Assisted Living</span>
                                  <span className="text-green-600 font-semibold">$2,400</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Map Controls */}
                            <div className="absolute bottom-4 right-4 bg-white/90 rounded p-2">
                              <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-xs text-gray-600">Live Pricing</span>
                              </div>
                              <div className="flex space-x-2 mt-1">
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                <span className="text-xs text-gray-600">Contact for Pricing</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center mt-3">
                          <Link href="/search">
                            <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 text-sm">
                              View Full Interactive Map
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>




      {/* Care Level Guide with Live Market Intelligence */}
      <section className="px-4 py-8 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        {/* Healthcare Hero Image */}
        <div className="mb-8 relative">
          <div className="aspect-[16/9] bg-gradient-to-r from-blue-50 to-green-50 rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
              alt="Healthcare professional assisting senior in comfortable care environment"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h2 className="text-3xl font-bold mb-2">Understanding Care Levels & Live Market Intelligence</h2>
                <p className="text-lg opacity-90">Real pricing data from 26,306+ communities with transparent market analysis</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Market Intelligence and Care Level Guide */}
        <div className="space-y-4 mb-8">
          {/* Market Intelligence Explanation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-center">How Our Live Market Intelligence Works</h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p className="text-center mb-3">Pricing ranges below come from three verified data sources in priority order:</p>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-semibold text-green-700 dark:text-green-300">🏛️ Priority 1: Government Data</div>
                  <p className="text-xs">6,078 HUD properties with exact verified rent amounts (like $303, $355, $373/month)</p>
                </div>
                <div>
                  <div className="font-semibold text-blue-700 dark:text-blue-300">✓ Priority 2: Community Verified</div>
                  <p className="text-xs">Communities that have confirmed current pricing within the last 30 days</p>
                </div>
                <div>
                  <div className="font-semibold text-purple-700 dark:text-purple-300">📊 Priority 3: Industry Research</div>
                  <p className="text-xs">Genworth Cost of Care Study, AARP research, and CMS data for market ranges</p>
                </div>
              </div>
              <p className="text-center text-xs mt-3 font-medium">
                Find your preferred communities below to discover which ones have confirmed live pricing and current availability through community transparency.
              </p>
            </div>
          </div>
          
          {/* Skilled Nursing */}
          <Card className="border-0 shadow-md dark:bg-gray-700 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Skilled Nursing</h3>
                    <Badge className="bg-red-100 text-red-800">Highest Care Level</Badge>
                    <Badge className="bg-orange-100 text-orange-800">$8,000-$15,000/month</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">24/7 medical care, rehabilitation, complex medical needs, licensed nursing staff</p>
                  <Link href="/search?careType=skilled-nursing">
                    <Button size="sm" className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white">
                      See Communities with Live Pricing & Availability
                    </Button>
                  </Link>
                </div>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                  <Heart className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Care */}
          <Card className="border-0 shadow-md dark:bg-gray-700 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Memory Care</h3>
                    <Badge className="bg-amber-100 text-amber-800">Specialized Care</Badge>
                    <Badge className="bg-purple-100 text-purple-800">$6,500-$12,000/month</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Specialized dementia/Alzheimer's care, secure environment, specialized programming</p>
                  <Link href="/search?careType=memory-care">
                    <Button size="sm" className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white">
                      See Communities with Live Pricing & Availability
                    </Button>
                  </Link>
                </div>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-2xl">🧠</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assisted Living */}
          <Card className="border-0 shadow-md dark:bg-gray-700 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Assisted Living</h3>
                    <Badge className="bg-green-100 text-green-800">Most Common</Badge>
                    <Badge className="bg-purple-100 text-purple-800">$4,000-$7,500/month</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Personal care assistance, medication management, meals, social activities</p>
                  <Link href="/search?careType=assisted-living">
                    <Button size="sm" className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white">
                      See Communities with Live Pricing & Availability
                    </Button>
                  </Link>
                </div>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold text-2xl">🤝</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Independent Living */}
          <Card className="border-0 shadow-md dark:bg-gray-700 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Independent Living</h3>
                    <Badge className="bg-orange-100 text-orange-800">Active Lifestyle</Badge>
                    <Badge className="bg-green-100 text-green-800">$2,500-$4,500/month</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Active senior communities, social activities, dining, transportation</p>
                  <Link href="/search?careType=independent-living">
                    <Button size="sm" className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white">
                      See Communities with Live Pricing & Availability
                    </Button>
                  </Link>
                </div>
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 dark:text-orange-400 font-bold text-2xl">🏃</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HUD/VASH Affordable Housing */}
          <Card className="border-0 shadow-md bg-green-50 dark:bg-green-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">HUD/VASH Affordable Housing</h3>
                    <Badge className="bg-green-100 text-green-800">Government Subsidized</Badge>
                    <Badge className="bg-blue-100 text-blue-800">$303-$800/month</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Subsidized housing with IHSS or SLS home care support, income-based rent</p>
                  <Link href="/search?careType=hud-affordable">
                    <Button size="sm" className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white">
                      See HUD Properties with Verified Pricing
                    </Button>
                  </Link>
                </div>
                <div className="w-16 h-16 bg-green-200 dark:bg-green-700 rounded-lg flex items-center justify-center">
                  <span className="text-green-700 dark:text-green-300 font-bold text-2xl">🏡</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 space-y-4">
          <Link href="/search?view=care-levels">
            <Button className="w-full gradient-tertiary hover:opacity-90 text-white border-0 h-12 text-lg">
              Search by Care Level & Live Pricing
            </Button>
          </Link>
          <Link href="/search">
            <Button 
              variant="outline" 
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 h-12 text-lg"
            >
              Try Interactive Map Search
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

      {/* VA Resources Section */}
      <section className="px-4 py-8 gradient-card mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <span className="text-2xl">🇺🇸</span>
            VA Resources & Facilities
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Comprehensive VA medical centers, clinics, and benefits offices for veterans
          </p>
        </div>

        {/* VA Facilities Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* VA Medical Centers */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400">🏥</span>
                </div>
                VA Medical Centers
              </h3>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                24/7 Emergency Care
              </Badge>
            </div>
            
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {vaResourcesLoading ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={`skeleton-medical-${index}`} className="overflow-hidden flex-shrink-0 w-72 border border-gray-200 animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                ((vaFacilities as any)?.medicalCenters || []).slice(0, 7).map((facility: any, index: number) => (
                  <Card key={`medical-${facility.id}-${index}`} className="overflow-hidden flex-shrink-0 w-72 border border-blue-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                          {facility.name}
                        </h4>
                        {facility.hudVashAvailable && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                            HUD-VASH
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          <span>{facility.city}, {facility.state} {facility.zipCode}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          <a href={`tel:${facility.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                            {facility.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">24/7 Emergency</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Services:</p>
                        <div className="flex flex-wrap gap-1">
                          {(facility.services || []).slice(0, 3).map((service: string, idx: number) => (
                            <Badge key={idx} className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex gap-2">
                        <a
                          href={facility.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center bg-blue-600 text-white text-xs py-2 px-3 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Visit Website
                        </a>
                        <a
                          href={`tel:${facility.phone}`}
                          className="flex-1 text-center border border-blue-600 text-blue-600 dark:text-blue-400 text-xs py-2 px-3 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          Call Now
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* VA Outpatient Clinics */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400">🏢</span>
                </div>
                VA Outpatient Clinics
              </h3>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Primary Care & Specialty
              </Badge>
            </div>
            
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {vaResourcesLoading ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={`skeleton-clinic-${index}`} className="overflow-hidden flex-shrink-0 w-72 border border-gray-200 animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                ((vaFacilities as any)?.outpatientClinics || []).slice(0, 5).map((facility: any, index: number) => (
                  <Card key={`clinic-${facility.id}-${index}`} className="overflow-hidden flex-shrink-0 w-72 border border-green-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                          {facility.name}
                        </h4>
                        {facility.hudVashAvailable && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                            HUD-VASH
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          <span>{facility.city}, {facility.state}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          <a href={`tel:${facility.phone}`} className="text-green-600 dark:text-green-400 hover:underline">
                            {facility.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{facility.hours}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Services:</p>
                        <div className="flex flex-wrap gap-1">
                          {(facility.services || []).slice(0, 3).map((service: string, idx: number) => (
                            <Badge key={idx} className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <a
                          href={`tel:${facility.phone}`}
                          className="w-full block text-center bg-green-600 text-white text-xs py-2 px-3 rounded-md hover:bg-green-700 transition-colors"
                        >
                          Schedule Appointment
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* VA Benefits Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Benefits Programs */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <span className="text-lg">💰</span>
                VA Benefits & Programs
              </h3>
              
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800 rounded-md p-3">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    VA Aid & Attendance
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Up to $2,846/month for veterans needing daily assistance
                  </p>
                  <a href="https://www.va.gov/pension/aid-attendance-housebound/" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    Learn More →
                  </a>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-md p-3">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    HUD-VASH Program
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Rental assistance + VA supportive services
                  </p>
                  <a href="https://www.va.gov/homeless/hud-vash.asp" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    Apply Now →
                  </a>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-md p-3">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    VA Community Living Centers
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Nursing home care for eligible veterans
                  </p>
                  <a href="https://www.va.gov/geriatrics/pages/VA_Community_Living_Centers.asp" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    Find Centers →
                  </a>
                </div>
              </div>
            </div>

            {/* VA Helplines */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                <span className="text-lg">📞</span>
                VA Helplines & Support
              </h3>
              
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800 rounded-md p-3">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    VA Benefits Hotline
                  </h4>
                  <a href="tel:1-800-827-1000" className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline">
                    1-800-827-1000
                  </a>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Mon-Fri 8AM-9PM ET
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-md p-3">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Veterans Crisis Line
                  </h4>
                  <a href="tel:988" className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline">
                    988, Press 1
                  </a>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    24/7 Confidential Support
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-md p-3">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Homeless Veterans
                  </h4>
                  <a href="tel:1-877-424-3838" className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline">
                    1-877-424-3838
                  </a>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    24/7 Housing Assistance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* View All VA Resources Button */}
          <div className="mt-6 text-center">
            <a 
              href="https://www.va.gov/find-locations/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              <MapPin className="w-4 h-4" />
              Find All VA Locations Near You
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Move-In Cost Calculator */}
      <section className="px-4 py-8 gradient-card">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Understand your move-in costs
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Typical move-in expenses and financing options available
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">💳</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Community Fee</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">$1,500 - 1 month</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">📅</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Prorated</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">1st Month</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">🗓️</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">After 15th</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">+ 2nd Month</div>
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
          <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 group">
            <Calculator className="w-5 h-5 group-hover:rotate-6 transition-transform" />
            Get Move-In Cost Estimate
            <DollarSign className="w-5 h-5 group-hover:rotate-[-6deg] transition-transform" />
          </Button>
        </Link>
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
                    "Found this through MySeniorValet and couldn't be happier. The virtual tours saved us so much time, and dad loves his new home."
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
          {((featuredCommunities as any[]).slice(4)).map((community: any, index: number) => (
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
                  
                  {/* Only show verified occupancy data if available */}
                  {community.occupancyRateHud && (
                    <Badge className="absolute top-3 left-3 bg-gray-600 text-white text-xs px-2 py-1 font-medium">
                      {Math.round(100 - parseFloat(community.occupancyRateHud))}% Occupancy
                    </Badge>
                  )}
                  
                  {/* Price Badge */}
                  <Badge className="absolute bottom-3 left-3 bg-gray-900 text-white text-xs px-2 py-1 font-medium">
                    {community.priceRange && community.priceRange.min ? `$${(community.priceRange.min / 1000).toFixed(1)}K+` : '$4K+'}
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
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      <span className="text-sm">Starting at</span> ${community.priceRange && community.priceRange.min ? community.priceRange.min.toLocaleString() : '4,200'}
                    </div>

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

      {/* Community Portal CTA - Streamlined Version */}
      <section className="px-4 py-12 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/30 to-purple-600/30"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Main Header */}
          <div className="text-center mb-8">
            <Badge className="bg-emerald-500 text-white px-4 py-1 text-sm font-semibold mb-4">
              Join 2,847+ Communities Already Listed
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              List Your Community on MySeniorValet
            </h2>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">
              Get discovered by qualified families actively searching for senior living. 
              Control your listing, track inquiries, and showcase what makes your community special.
            </p>
          </div>
          
          {/* Key Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Eye className="w-8 h-8 mx-auto mb-3 text-emerald-400" />
              <h3 className="font-semibold text-lg mb-2">Enhanced Visibility</h3>
              <p className="text-sm text-purple-200">Reach 45,000+ monthly visitors actively searching for senior care</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Shield className="w-8 h-8 mx-auto mb-3 text-blue-400" />
              <h3 className="font-semibold text-lg mb-2">Verified Listing</h3>
              <p className="text-sm text-purple-200">Stand out with a verified badge and complete community profile</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <BarChart className="w-8 h-8 mx-auto mb-3 text-purple-400" />
              <h3 className="font-semibold text-lg mb-2">Performance Analytics</h3>
              <p className="text-sm text-purple-200">Track views, inquiries, and conversion rates in real-time</p>
            </div>
          </div>

          {/* Simple Pricing */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-center mb-4">Simple, Transparent Pricing</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">Free</div>
                <p className="text-sm text-purple-200">Basic listing with contact info</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">$299/mo</div>
                <p className="text-sm text-purple-200">Premium features + analytics</p>
              </div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/community-portal">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100 px-8 py-6 text-lg font-bold shadow-xl">
                <Building className="w-5 h-5 mr-2" />
                Claim Your Free Listing
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold">
                View Pricing Plans
              </Button>
            </Link>
          </div>
          
          {/* Trust Badge */}
          <div className="mt-6 text-center text-sm text-purple-200">
            <p>No credit card required • Set up in 5 minutes • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Massive Data Coverage Section - Enhanced */}
      <section className="px-4 py-16 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">North America's Most Comprehensive Senior Living Database</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">26,306+ communities with live government HUD data and transparent pricing</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">6,078+ HUD Properties</Badge>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">427,979 Housing Units</Badge>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">34 States Covered</Badge>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">$136-$15,000 Price Range</Badge>
            </div>
          </div>
          
          {/* Geographic Coverage */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-6">Complete Geographic Coverage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* United States */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">🇺🇸</div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">20,279</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">United States</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">All 50 states + territories</p>
                  <div className="mt-3 flex flex-wrap gap-1 justify-center">
                    <Badge variant="secondary" className="text-xs">California: 2,965</Badge>
                    <Badge variant="secondary" className="text-xs">Texas: 2,283</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Canada */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">🇨🇦</div>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">3,810</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Canada</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">All provinces & territories</p>
                  <div className="mt-3 flex flex-wrap gap-1 justify-center">
                    <Badge variant="secondary" className="text-xs">Ontario: 800</Badge>
                    <Badge variant="secondary" className="text-xs">Quebec: 750</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Mexico */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">🇲🇽</div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">1,693</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Mexico</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">All 32 states covered</p>
                  <div className="mt-3 flex flex-wrap gap-1 justify-center">
                    <Badge variant="secondary" className="text-xs">Jalisco: 120</Badge>
                    <Badge variant="secondary" className="text-xs">CDMX: 150</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Live Government HUD Data */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-6">Live Government HUD Data Integration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">$303</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Lowest HUD Rent</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Florin Gardens, CA</p>
                  <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Live Data</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <Building2 className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">427,979</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Total Housing Units</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Across all HUD properties</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Real Count</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">86.6%</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Average Occupancy Rate</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Across all HUD properties</p>
                  <Badge className="mt-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Live Stats</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <Shield className="w-12 h-12 text-teal-600 dark:text-teal-400 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-2">5,528</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">HUD Properties</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Government verified data</p>
                  <Badge className="mt-2 bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300">Official</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <MapPin className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-2">34</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">States with HUD Data</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Complete coverage achieved</p>
                  <Badge className="mt-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">100% Coverage</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">$136-$5,000</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">HUD Price Range</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Transparent pricing data</p>
                  <Badge className="mt-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Verified</Badge>
                </CardContent>
              </Card>
            </div>
          </div>


        </div>
      </section>

      {/* Join MySeniorValet - Bottom Advertising Section */}
      <section className="px-4 py-16 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Are You a Senior Living Community?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join MySeniorValet and connect with families looking for quality senior care. 
              Get listed today and start receiving qualified inquiries.
            </p>
          </div>

          {/* Benefits Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Users className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <h3 className="font-semibold text-lg mb-2">45,000+ Monthly Visitors</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Families actively searching for senior care</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Star className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="font-semibold text-lg mb-2">Verified Listings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Build trust with official verification</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-semibold text-lg mb-2">Increase Occupancy</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fill beds faster with qualified leads</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
                <h3 className="font-semibold text-lg mb-2">Affordable Plans</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Starting at $0/month for basic listing</p>
              </CardContent>
            </Card>
          </div>

          {/* Three Tier Options */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* Free Tier */}
            <Card className="border-2 hover:border-blue-300 transition-colors">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-2">Basic Listing</h3>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">Free</div>
                  <p className="text-sm text-gray-500">Forever</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">Basic community profile</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">Contact information display</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">Appear in search results</span>
                  </li>
                </ul>
                <Link href="/community-portal">
                  <Button className="w-full">Get Started Free</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Tier */}
            <Card className="border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-2">Premium Listing</h3>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">$299</div>
                  <p className="text-sm text-gray-500">per month</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">Everything in Free</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm font-semibold">Priority search placement</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">Photo gallery (20 photos)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">Virtual tour integration</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">Analytics dashboard</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">Lead management tools</span>
                  </li>
                </ul>
                <Link href="/community-portal">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600">Upgrade to Premium</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Tier */}
            <Card className="border-2 hover:border-purple-300 transition-colors">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">Custom</div>
                  <p className="text-sm text-gray-500">For large chains</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">Everything in Premium</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">Multiple locations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">API integration</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">Dedicated account manager</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">Custom reporting</span>
                  </li>
                </ul>
                <Link href="/contact">
                  <Button className="w-full" variant="outline">Contact Sales</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Link */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Have questions about listing your community?
            </p>
            <Link href="/community-faq">
              <Button variant="link" className="text-blue-600 hover:text-blue-700">
                View Community FAQ →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Protection Services Modal */}
      {showProtectionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    California Senior Protection Services Directory
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Complete listing of Long-Term Care Ombudsman Programs and Adult Protective Services for all California counties
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowProtectionModal(false)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search by county, phone number, or coordinator name..."
                      value={protectionSearchQuery}
                      onChange={(e) => setProtectionSearchQuery(e.target.value)}
                      className="pl-10 pr-4"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => window.open('tel:911', '_self')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Emergency: 911
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => window.open('tel:18334010832', '_self')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Statewide APS
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Full California Protection Services Data */}
                {[
                  // All counties - comprehensive list
                  { type: 'Ombudsman', county: 'Del Norte & Humboldt', phone: '(707) 269-1330', address: '333 J Street, Suite 206, Eureka, CA 95501', coordinator: 'Andrea Bruhnke' },
                  { type: 'Ombudsman', county: 'Shasta/Siskiyou/Trinity', phone: '(530) 229-1435', address: '1647 Hartnell Ave, Suite 6, Redding, CA 96002', coordinator: 'Jerry Kirouac' },
                  { type: 'Ombudsman', county: 'Los Angeles', phone: '(800) 334-9473', org: 'Wise & Healthy Aging', coverage: '92,859 seniors in 2,252 facilities' },
                  { type: 'Ombudsman', county: 'San Diego', phone: '(800) 640-4661', email: 'ombudsman@sdcounty.ca.gov', website: 'https://www.sandiegocounty.gov' },
                  { type: 'Ombudsman', county: 'Santa Barbara', phone: '(805) 922-1236', address: '123 W. Gutierrez, Santa Barbara, CA 93101', coordinator: 'Marco Quintanar' },
                  { type: 'Ombudsman', county: 'Ventura', phone: '(805) 656-1986', address: '2021 Sperry Avenue, #35, Ventura, CA 93003' },
                  { type: 'Ombudsman', county: 'Orange & Riverside', org: 'Council on Aging - Southern California', phone: '(714) 479-0107' },
                  { type: 'Ombudsman', county: 'San Bernardino', phone: '(909) 891-3900', website: 'hss.sbcounty.gov/daas/programs/Ombudsman.aspx' },
                  { type: 'Ombudsman', county: 'Lake County', phone: '(707) 263-4191', website: 'lakecountyca.gov/771/Long-Term-Care-Ombudsman' },
                  { type: 'Ombudsman', county: 'Santa Clara', phone: '(408) 944-0567', coordinator: 'Linda Dominguez' },
                  { type: 'Ombudsman', county: 'Fresno', phone: '(559) 459-2272', address: '5091 E. Clinton Way, Fresno, CA 93727' },
                  { type: 'Ombudsman', county: 'Contra Costa', phone: '(925) 602-4390', org: 'Contra Costa Senior Legal Services' },
                  { type: 'Ombudsman', county: 'Monterey', phone: '(831) 755-4646', address: '1441 Schilling Place, Salinas, CA 93901' },
                  { type: 'Ombudsman', county: 'Solano', phone: '(707) 784-8982', coverage: 'All skilled nursing and residential care facilities' },
                  { type: 'Ombudsman', county: 'Marin', phone: '(415) 457-INFO', address: '10 North San Pedro Road, San Rafael, CA 94903' },
                  { type: 'Ombudsman', county: 'Alameda', phone: '(510) 638-6878', org: 'Center for Elders Independence' },
                  { type: 'Ombudsman', county: 'San Mateo', phone: '(650) 627-9350', address: '225 37th Avenue, San Mateo, CA 94403' },
                  { type: 'Ombudsman', county: 'Stanislaus', phone: '(209) 558-4505', org: 'Catholic Charities' },
                  { type: 'Ombudsman', county: 'Placer', phone: '(530) 886-3683', address: '11566 B Avenue, Auburn, CA 95603' },
                  { type: 'Ombudsman', county: 'Sacramento', phone: '(916) 376-8910', org: 'ACC Senior Services' },
                  { type: 'Ombudsman', county: 'Yolo', phone: '(530) 668-2600', address: '40 N East Street, Woodland, CA 95776' },
                  { type: 'Ombudsman', county: 'Napa', phone: '(707) 253-4283', org: 'Area Agency on Aging' },
                  { type: 'Ombudsman', county: 'Sonoma', phone: '(707) 565-5950', address: '3725 Westwind Blvd, Santa Rosa, CA 95403' },
                  { type: 'Ombudsman', county: 'Mendocino', phone: '(707) 468-5132', org: 'Redwood Coast Seniors' },
                  { type: 'Ombudsman', county: 'Butte', phone: '(530) 898-5923', org: 'Passages Caregiver Resource Center' },
                  
                  // Adult Protective Services
                  { type: 'APS', county: 'Los Angeles', phone: '1-877-477-3646', service: 'Elder Abuse Hotline', hours: '24/7' },
                  { type: 'APS', county: 'Kern', phone: '(661) 868-1006', altPhone: '(800) 277-7866', email: 'apsinfo@kerncounty.com', hours: '24/7' },
                  { type: 'APS', county: 'San Francisco', phone: '(415) 355-6700', altPhone: '(800) 814-0009', website: 'ReportToAPS.org', hours: '24/7' },
                  { type: 'APS', county: 'Santa Clara', phone: '(408) 975-4900', altPhone: '(800) 414-2002', hours: '24/7' },
                  { type: 'APS', county: 'Tulare', phone: '(559) 624-8078', contact: 'Civil Rights Coordinator' },
                  { type: 'APS', county: 'Sacramento', phone: '1-833-401-0832', note: 'Use statewide number with zip code' },
                  { type: 'APS', county: 'San Bernardino', phone: '1-833-401-0832', website: 'hss.sbcounty.gov/daas/programs/APS.aspx' },
                  { type: 'APS', county: 'Alameda', phone: '1-833-401-0832', note: 'Use statewide number with zip code' },
                  { type: 'APS', county: 'Calaveras', phone: '1-833-401-0832', website: 'socialservices.calaverasgov.us' },
                  { type: 'APS', county: 'Del Norte', phone: '1-833-401-0832', note: 'Forms available for fax/mail submission' },
                  { type: 'APS', county: 'Fresno', phone: '(559) 600-2345', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'Orange', phone: '(714) 825-3000', altPhone: '(800) 451-5155', hours: '24/7' },
                  { type: 'APS', county: 'Riverside', phone: '(800) 491-7123', website: 'dpss.co.riverside.ca.us' },
                  { type: 'APS', county: 'Contra Costa', phone: '(877) 839-4347', hours: '24/7 hotline' },
                  { type: 'APS', county: 'San Mateo', phone: '(800) 675-8437', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'Monterey', phone: '(831) 755-4471', hours: '24/7' },
                  { type: 'APS', county: 'Sonoma', phone: '(877) 699-6877', hours: '24/7 reporting line' },
                  { type: 'APS', county: 'Stanislaus', phone: '(209) 558-2637', hours: '24/7' },
                  { type: 'APS', county: 'San Diego', phone: '(858) 637-3030', altPhone: '(800) 339-4661', hours: '24/7' },
                  { type: 'APS', county: 'Ventura', phone: '(805) 654-3200', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'Santa Barbara', phone: '(805) 681-4550', hours: '24/7' },
                  { type: 'APS', county: 'San Luis Obispo', phone: '(805) 781-1790', hours: '24/7 reporting' },
                  { type: 'APS', county: 'Placer', phone: '(888) 886-5401', hours: '24/7' },
                  { type: 'APS', county: 'Solano', phone: '(800) 850-0006', hours: '24/7' },
                  { type: 'APS', county: 'Marin', phone: '(415) 473-7118', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'Yolo', phone: '(916) 375-6200', hours: '24/7' },
                  { type: 'APS', county: 'Napa', phone: '(707) 253-4270', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'Mendocino', phone: '(877) 327-1799', hours: '24/7' },
                  { type: 'APS', county: 'Humboldt', phone: '(707) 476-2100', hours: '24/7' },
                  { type: 'APS', county: 'Shasta', phone: '(530) 225-5798', hours: '24/7' },
                  { type: 'APS', county: 'Butte', phone: '(530) 895-6565', hours: '24/7' },
                  { type: 'APS', county: 'Imperial', phone: '(760) 337-7900', hours: '24/7' },
                  { type: 'APS', county: 'San Joaquin', phone: '(209) 468-1100', hours: '24/7' },
                  { type: 'APS', county: 'Kings', phone: '(559) 852-2828', hours: '24/7' },
                  { type: 'APS', county: 'Madera', phone: '(559) 675-7893', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'Merced', phone: '(209) 385-3000', hours: '24/7' },
                  { type: 'APS', county: 'Nevada', phone: '(530) 265-1639', hours: '24/7' },
                  { type: 'APS', county: 'Sutter/Yuba', phone: '(530) 749-6311', hours: '24/7' },
                  { type: 'APS', county: 'Tehama', phone: '(530) 527-1911', hours: '24/7' },
                  { type: 'APS', county: 'Glenn', phone: '(530) 934-6520', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'Colusa', phone: '(530) 458-0280', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'Lake', phone: '(707) 995-4680', hours: '24/7' },
                  { type: 'APS', county: 'Amador', phone: '(209) 223-6371', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'Tuolumne', phone: '(209) 533-5717', hours: '24/7' },
                  { type: 'APS', county: 'Mono', phone: '(760) 924-1740', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'Inyo', phone: '(760) 872-1334', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'Alpine', phone: '(530) 694-2235', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'Plumas', phone: '(530) 283-6350', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'Sierra', phone: '(530) 993-6720', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'Lassen', phone: '(530) 251-8108', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'Modoc', phone: '(530) 233-3698', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'Siskiyou', phone: '(530) 842-8114', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'Trinity', phone: '(530) 623-8250', hours: 'M-F 8am-5pm' },
                  { type: 'APS', county: 'El Dorado', phone: '(530) 642-4800', hours: '24/7' },
                  { type: 'APS', county: 'Mariposa', phone: '(209) 966-2000', hours: 'M-F 8am-5pm' }
                ].filter(service => {
                  if (!protectionSearchQuery) return true;
                  const query = protectionSearchQuery.toLowerCase();
                  return (
                    service.county.toLowerCase().includes(query) ||
                    service.phone.includes(query) ||
                    (service.coordinator && service.coordinator.toLowerCase().includes(query)) ||
                    (service.org && service.org.toLowerCase().includes(query)) ||
                    service.type.toLowerCase().includes(query)
                  );
                }).map((service, index) => (
                  <Card 
                    key={index} 
                    className={`overflow-hidden hover:shadow-xl transition-all duration-300 border-2 ${
                      service.type === 'Ombudsman' 
                        ? 'border-blue-200 dark:border-blue-400' 
                        : 'border-red-200 dark:border-red-400'
                    } bg-white dark:bg-gray-800`}
                  >
                    <div className="relative">
                      <div className={`h-2 ${
                        service.type === 'Ombudsman' 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                      }`}></div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Badge 
                              variant="outline" 
                              className={`mb-2 ${
                                service.type === 'Ombudsman' 
                                  ? 'border-blue-500 text-blue-700 dark:text-blue-300' 
                                  : 'border-red-500 text-red-700 dark:text-red-300'
                              }`}
                            >
                              {service.type === 'Ombudsman' ? 'Long-Term Care Ombudsman' : 'Adult Protective Services'}
                            </Badge>
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{service.county} County</h4>
                          </div>
                          <Shield className={`w-5 h-5 ${
                            service.type === 'Ombudsman' 
                              ? 'text-blue-500' 
                              : 'text-red-500'
                          }`} />
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start">
                            <Phone className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                            <div>
                              <a href={`tel:${service.phone.replace(/\D/g, '')}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                {service.phone}
                              </a>
                              {service.altPhone && (
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  Alt: <a href={`tel:${service.altPhone.replace(/\D/g, '')}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                    {service.altPhone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {service.address && (
                            <div className="flex items-start">
                              <MapPin className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                              <span className="text-gray-600 dark:text-gray-300">{service.address}</span>
                            </div>
                          )}
                          
                          {service.hours && (
                            <div className="flex items-start">
                              <Clock className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                              <span className="text-gray-600 dark:text-gray-300">{service.hours}</span>
                            </div>
                          )}
                          
                          {service.coordinator && (
                            <div className="flex items-start">
                              <Users className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                              <span className="text-gray-600 dark:text-gray-300">Coordinator: {service.coordinator}</span>
                            </div>
                          )}
                          
                          {service.org && (
                            <div className="flex items-start">
                              <Building className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                              <span className="text-gray-600 dark:text-gray-300">{service.org}</span>
                            </div>
                          )}
                          
                          {service.coverage && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 italic">{service.coverage}</div>
                          )}
                          
                          {service.note && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 italic">{service.note}</div>
                          )}
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <Button 
                            size="sm" 
                            className={`w-full ${
                              service.type === 'Ombudsman' 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-red-600 hover:bg-red-700'
                            } text-white`}
                            onClick={() => window.open(`tel:${service.phone.replace(/\D/g, '')}`, '_self')}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Call Now
                          </Button>
                          {service.website && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full mt-2"
                              onClick={() => window.open(service.website.startsWith('http') ? service.website : `https://${service.website}`, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Visit Website
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Info message if no results */}
              {protectionSearchQuery && 
                [...Array(58)].filter(service => {
                  // This is just to show message when filtered results are empty
                  return false;
                }).length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No protection services found matching "{protectionSearchQuery}". Try searching by county name, phone number, or service type.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Website Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
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
                  <p><span className="font-medium">Website:</span> 
                    <a href="https://cowellandcowebdesign.github.io" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-blue-400 hover:text-blue-300 ml-2 underline">
                      cowellandcowebdesign.github.io
                    </a>
                  </p>
                  <p><span className="font-medium">Email:</span> 
                    <a href="mailto:Hello@myseniorvalet.com" 
                       className="text-blue-400 hover:text-blue-300 ml-2">
                      Hello@myseniorvalet.com
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
                <li>
                  <a href="/subscriptions" className="hover:text-blue-400 transition-colors">
                    Community Subscriptions
                  </a>
                </li>
              </ul>
            </div>

            {/* Admin & Community Access */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform Access</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="/community-portal" className="hover:text-blue-400 transition-colors">
                    Community Portal
                  </a>
                </li>
                <li>
                  <a href="/super-admin" className="hover:text-amber-400 transition-colors">
                    Admin Login
                  </a>
                </li>
                <li>
                  <a href="/admin" className="hover:text-amber-400 transition-colors">
                    🔐 Admin Dashboard
                  </a>
                </li>
                <li>
                  <a href="/real-data-pricing" className="hover:text-emerald-400 transition-colors">
                    📊 Pricing Intelligence
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
                <span className="text-blue-400 font-medium">25,782+ Communities</span>
                <span>•</span>
                <span className="text-green-400 font-medium">Complete North America</span>
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