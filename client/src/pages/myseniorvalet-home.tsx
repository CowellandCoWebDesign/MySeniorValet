import { useState, useEffect } from "react";
import { EnhancedCommunityCard } from "@/components/EnhancedCommunityCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, Heart, MapPin, Star, Home, Building2, DollarSign, Users, Info, MessageCircle, Link2, Truck, Sofa, Pill, Eye, Clock, Phone, Brain, Sparkles, Building, Ambulance, Package, CheckCircle, Stethoscope, Activity, ShieldCheck, Scale, Utensils, Car, Scissors, Users2, FileText, Calculator, ShoppingCart, Trash2, Flower, TrendingUp, Shield, ArrowRight, Shirt as ShirtIcon, RefreshCw, ExternalLink, Globe, HeartHandshake, ChevronRight, BarChart, BarChart3, Calendar, X, Flag, Languages, Layers, ShoppingBasket, AlertCircle, Briefcase, LogIn, UserCheck, Smartphone, BookOpen, ShoppingBag } from "lucide-react";
import { ServiceBadges, commonBadges } from "@/components/ServiceBadges";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PricingBreakdown } from "@/components/pricing-breakdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { CareServiceCard } from "@/components/CareServiceCard";

import { VendorMarketplaceTabs } from "@/components/VendorMarketplaceTabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CanadianStatsCard } from "@/components/canadian-stats-card";
import { CareSpectrumSlider } from "@/components/CareSpectrumSlider";
import { RemovalRequestModal } from "@/components/RemovalRequestModal";
import { OnboardingWrapper } from "@/components/onboarding/OnboardingWrapper";
import { PersonalizedBanner } from "@/components/onboarding/PersonalizedBanner";
import { MarketIntelligence } from "@/components/MarketIntelligence";
import { MoveInCostCalculator } from "@/components/MoveInCostCalculator";
import { RedTagDeals } from "@/components/RedTagDeals";
import { AidAndAttendance } from "@/components/AidAndAttendance";
import { CostComparisonWorksheet } from "@/components/CostComparisonWorksheet";
import HospitalCarousel from "@/components/HospitalCarousel";
import { Footer } from "@/components/footer";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";




export default function MySeniorValetHome() {
  console.log("MYSENIORVALET HOME PAGE LOADED - VERSION 3 WITH CONCIERGE SERVICES PRIORITIZED - 25,376 COMMUNITIES");
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showProtectionModal, setShowProtectionModal] = useState(false);
  const [protectionSearchQuery, setProtectionSearchQuery] = useState('');
  const [showRemovalModal, setShowRemovalModal] = useState(false);

  const [showIntegrationSpotlight, setShowIntegrationSpotlight] = useState(true);
  
  // ONLY get cached community count - no need for full community list on homepage
  const { data: communityStats, isLoading } = useQuery({
    queryKey: ["/api/communities/count"],
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 30 * 60 * 1000,   // Keep in cache for 30 minutes
  });

  // Enhanced platform statistics for data-driven homepage (with longer caching)
  const { data: platformStats } = useQuery({
    queryKey: ["/api/platform/stats"],
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 30 * 60 * 1000,   // Keep in cache for 30 minutes
  });

  // Skip expensive image queries that aren't critical for initial load
  const { data: conciergeImages } = useQuery({
    queryKey: ["/api/images/concierge-services"],
    retry: false,
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
    enabled: false, // Disable automatic fetching - load on demand
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

  // Hawaii communities for featured slider
  const { data: hawaiiCommunities, isLoading: hawaiiLoading } = useQuery({
    queryKey: ["/api/communities/by-location/Hawaii"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Florida communities for Florida slider - use search with state filter
  const { data: floridaCommunities, isLoading: floridaLoading } = useQuery({
    queryKey: ["/api/communities/search?state=FL"],
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Texas communities for Fort Worth slider - use search with state filter
  const { data: texasCommunities, isLoading: texasLoading } = useQuery({
    queryKey: ["/api/communities/search?state=TX"],
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Keep trending for other sections that may need it
  const { data: trendingCommunities, isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/communities/trending"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Location-specific queries for horizontal sections (cached and deferred)
  const { data: sacramentoCommunities, isLoading: sacramentoLoading } = useQuery({
    queryKey: ["/api/communities/by-location/Sacramento"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 15 * 60 * 1000,   // Keep in cache for 15 minutes
    enabled: false, // Disable automatic fetching - load on demand
  });

  // New York communities - focus on populated results instead of coastal 
  const { data: newYorkCommunities, isLoading: newYorkLoading } = useQuery({
    queryKey: ["/api/communities/search?state=NY"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 15 * 60 * 1000,   // Keep in cache for 15 minutes
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
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm shadow-lg hover:bg-white/30 transition-colors">
                    <div className="flex flex-col space-y-1">
                      <div className="w-4 h-0.5 bg-white rounded-full"></div>
                      <div className="w-4 h-0.5 bg-white rounded-full"></div>
                      <div className="w-4 h-0.5 bg-white rounded-full"></div>
                    </div>
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="flex flex-col space-y-6 mt-8">
                    <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Home className="text-white h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-display font-bold text-gray-900 dark:text-white">MySeniorValet</span>
                        <span className="text-sm text-gray-500 font-medium -mt-1">Senior Living Search</span>
                      </div>
                    </div>
                    <nav className="flex flex-col space-y-2">
                      <Link href="/search" className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Search className="h-5 w-5" />
                        <span>Search Communities</span>
                      </Link>
                      <Link href="/services" className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Heart className="h-5 w-5" />
                        <span>Healthcare & Services</span>
                      </Link>
                      <Link href="/hospitals" className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Building2 className="h-5 w-5" />
                        <span>Hospital Directory</span>
                      </Link>
                      <Link href="/care-marketplace" className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">
                        <ShoppingBag className="h-5 w-5" />
                        <span>Care Marketplace</span>
                      </Link>
                      <Link href="/community-portal" className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Building className="h-5 w-5" />
                        <span>Community Portal</span>
                      </Link>
                      <Link href="/care-guide" className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">
                        <BookOpen className="h-5 w-5" />
                        <span>Care Guide</span>
                      </Link>
                      <Link href="/about" className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Users className="h-5 w-5" />
                        <span>About Us</span>
                      </Link>
                    </nav>
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
            <Link href="/ai-search-intelligence?mode=perfect-match">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 text-base md:text-xl px-8 md:px-10 py-4 md:py-5 rounded-2xl transform hover:scale-105">
                ✨ Find My Perfect Match
              </Button>
            </Link>
            
            {/* Secondary Actions - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
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

      {/* Breadcrumb Navigation */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <BreadcrumbNavigation 
            items={[
              { label: 'Home' }
            ]}
          />
        </div>
      </div>

      {/* Featured Communities Slider - Visual Break */}
      <section className="px-4 py-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🌺 Hawaii Communities
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Paradise living with world-class senior care in the Hawaiian Islands
              </p>
            </div>
            <Link href="/search?location=Hawaii">
              <Button variant="outline" className="flex items-center gap-2">
                View All Hawaii
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto overflow-y-visible pb-16 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600" style={{minHeight: '35rem'}}>
            {(hawaiiLoading || !hawaiiCommunities || (hawaiiCommunities as any[]).length === 0) ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden flex-shrink-0 w-64 h-80 animate-pulse">
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-200 to-teal-200 dark:bg-gray-700"></div>
                  <CardContent className="p-4">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              (hawaiiCommunities as any[]).slice(0, 8).map((community: any, index) => (
                <EnhancedCommunityCard
                  key={`hawaii-${community.id}-${index}`}
                  community={community}
                  index={index}
                  variant='featured'
                />
              ))
            )}
          </div>
        </div>
      </section>



      {/* Red Tag Deals Promotional Section */}
      <section className="px-4 py-8 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30">
        <div className="max-w-7xl mx-auto">
          <RedTagDeals />
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
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md p-2 mb-4">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <span className="font-medium">Platform Promise:</span> Not all senior housing requires a six-figure budget. 
              MySeniorValet shows everything — from $0 HUD properties to full-service memory care.
            </p>
          </div>
        
          <div className="flex space-x-4 overflow-x-auto overflow-y-visible pb-16 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth', minHeight: '35rem'}}>
            {/* Show HUD communities */}
            {(!hudProperties || (hudProperties as any[]).length === 0) ? (
              // Loading skeleton cards
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden flex-shrink-0 w-56 h-[26rem] border border-gray-200 animate-pulse">
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
                  <Card className="overflow-hidden flex-shrink-0 w-56 h-[26rem] border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-2xl transition-all cursor-pointer group">
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



      {/* Compact Benefits Bar */}
      <section className="px-4 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-700/80 px-3 py-2 rounded-full">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-900 dark:text-white">3-AI Verification</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-700/80 px-3 py-2 rounded-full">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-900 dark:text-white">HUD Verified</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-700/80 px-3 py-2 rounded-full">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-gray-900 dark:text-white">34,171+ Communities</span>
            </div>
          </div>
        </div>
      </section>

      {/* Market Intelligence Section */}
      <section className="px-4 py-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <MarketIntelligence />
        </div>
      </section>

      {/* Florida Communities Section - Authentic Data */}
      <section className="px-4 py-12 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🌴 Florida Senior Living Paradise
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              Year-round sunshine and world-class senior communities
            </p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge className="bg-cyan-600 text-white px-3 py-1">
                No State Income Tax
              </Badge>
              <Badge className="bg-blue-600 text-white px-3 py-1">
                Beach & Golf Communities
              </Badge>
            </div>
          </div>
          
          {/* Florida Communities Slider - Using Real API Data */}
          {floridaLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full"></div>
            </div>
          ) : !(floridaCommunities as any)?.communities?.length ? (
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>No Florida communities available at this time.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setLocation('/search?state=Florida')}
              >
                Search All Florida Communities
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex space-x-4 overflow-x-auto overflow-y-visible pb-16 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600" style={{minHeight: '35rem'}}>
                {((floridaCommunities as any)?.communities || []).slice(0, 6).map((community: any, index: number) => (
                  <EnhancedCommunityCard
                    key={`florida-${community.id}-${index}`}
                    community={community}
                    index={index}
                    variant='featured'
                  />
                ))}
              </div>
              
              <div className="text-center mt-6">
                <Button 
                  variant="outline" 
                  className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-600 dark:text-cyan-300 dark:hover:bg-cyan-900/20"
                  onClick={() => setLocation('/search?state=Florida')}
                >
                  View All Florida Communities
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Move-In Cost Calculator Section */}
      <section className="px-4 py-12 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <MoveInCostCalculator />
        </div>
      </section>

      {/* Cost Comparison Worksheet Section */}
      <section className="px-4 py-12 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <CostComparisonWorksheet />
        </div>
      </section>

      {/* Fort Worth, Texas Communities Promotional Section */}
      <section className="px-4 py-12 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              ⭐ Fort Worth, Texas Communities
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              Discover premier senior living options in the heart of Texas
            </p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge className="bg-orange-600 text-white px-3 py-1">
                Authentic Texas Hospitality
              </Badge>
              <Badge className="bg-red-600 text-white px-3 py-1">
                Starting from $2,800/month
              </Badge>
            </div>
          </div>
          
          {/* Fort Worth Communities Slider */}
          <div className="relative">
            {texasLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full"></div>
              </div>
            ) : !(texasCommunities as any)?.communities?.length ? (
              <div className="text-center text-gray-600 dark:text-gray-400">
                <p>No Texas communities available at this time.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/search?state=TX')}
                >
                  Search Texas Communities
                </Button>
              </div>
            ) : (
              <div className="flex space-x-4 overflow-x-auto overflow-y-visible pb-16 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600" style={{minHeight: '35rem'}}>
                {((texasCommunities as any)?.communities || []).slice(0, 6).map((community: any, index: number) => (
                  <EnhancedCommunityCard
                    key={`texas-${community.id}-${index}`}
                    community={community}
                    index={index}
                    variant='featured'
                  />
                ))}
              </div>
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
        {/* Background New York Skyline Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="New York skyline background"
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50/40 to-blue-50/40 dark:from-gray-900/60 dark:to-gray-800/60"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                🗽 New York Communities
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">Empire State living</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Metropolitan access</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">$3,200 - $4,800</div>
              <div className="text-sm text-purple-600 dark:text-purple-300 font-medium">New York State</div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            {((newYorkCommunities as any)?.communities?.length || 0)} New York communities • 
            Empire State senior living excellence
          </p>
        
          <div className="flex space-x-4 overflow-x-auto overflow-y-visible pb-16 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth', minHeight: '35rem'}}>
            {/* Show New York communities */}
            {newYorkLoading ? (
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
            ) : ((newYorkCommunities as any)?.communities || []).length === 0 ? (
              <div className="text-center text-gray-600 dark:text-gray-400 py-8 w-full">
                <Building className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No New York communities available at this time.</p>
              </div>
            ) : (
              ((newYorkCommunities as any)?.communities || []).slice(0, 6).map((community: any, index: number) => (
                <EnhancedCommunityCard
                  key={`newyork-${community.id}-${index}`}
                  community={community}
                  index={index}
                  variant='featured'
                />
              ))
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
        
          <div className="relative overflow-hidden">
            <div className="flex space-x-4 overflow-x-auto overflow-y-visible pb-16 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth', minHeight: '35rem'}}>
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
                  <EnhancedCommunityCard
                    key={`canadian-${community.id}-${index}`}
                    community={community}
                    index={index}
                    variant='featured'
                  />
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
        
          <div className="flex space-x-4 overflow-x-auto overflow-y-visible pb-16 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth', minHeight: '35rem'}}>
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
                <EnhancedCommunityCard
                  key={`california-${community.id}-${index}`}
                  community={community}
                  index={index}
                  variant='featured'
                />
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
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Healthcare and Care Services Directory</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto mb-4">
                    Connect with {(careServicesAnalytics as any)?.totalServices?.toLocaleString() || '4,210'}+ verified healthcare and caregiving services in your area
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Care Services Grid - 3x4 Layout */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8 max-w-4xl mx-auto">
            <Link href="/hospitals">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 relative overflow-hidden h-full">
                <CardContent className="p-2 sm:p-3 text-center">
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-1.5" />
                  <h4 className="font-semibold text-xs sm:text-sm text-blue-700 dark:text-blue-300 line-clamp-2">Hospital Services</h4>
                  <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 mt-0.5 line-clamp-2">6,000+ CMS verified</p>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ VERIFIED</Badge>
                    <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5">CMS RATED</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/home-care">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 relative overflow-hidden h-full">
                <CardContent className="p-2 sm:p-3 text-center">
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <Home className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-1.5" />
                  <h4 className="font-semibold text-xs sm:text-sm text-green-700 dark:text-green-300 line-clamp-2">Home Care Services</h4>
                  <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 mt-0.5 line-clamp-2">Licensed caregivers</p>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ VERIFIED</Badge>
                    <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">24/7</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            {/* Therapy Services - REAL DATA */}
            {(() => {
              const services = (careServicesData as any)?.services || [];
              const therapyCount = services.filter((s: any) => s.serviceCategory === 'Therapy Services').length;
              
              return (
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 relative overflow-hidden h-full">
                  <CardContent className="p-2 sm:p-3 text-center">
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-1.5" />
                    <h4 className="font-semibold text-xs sm:text-sm text-purple-700 dark:text-purple-300 line-clamp-2">Therapy Services</h4>
                    <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 mt-0.5 line-clamp-2">{therapyCount} providers</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ VERIFIED</Badge>
                      <Badge className="bg-purple-500 text-white text-[10px] px-1.5 py-0.5">PT/OT/SPEECH</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
            
            {/* Adult Day Care - REAL DATA */}
            {(() => {
              const services = (careServicesData as any)?.services || [];
              const adultDayCareCount = services.filter((s: any) => s.serviceCategory === 'Adult Day Care').length;
              
              return (
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 relative overflow-hidden h-full">
                  <CardContent className="p-2 sm:p-3 text-center">
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-teal-500 mx-auto mb-1.5" />
                    <h4 className="font-semibold text-xs sm:text-sm text-teal-700 dark:text-teal-300 line-clamp-2">Adult Day Programs</h4>
                    <p className="text-[10px] sm:text-xs text-teal-600 dark:text-teal-400 mt-0.5 line-clamp-2">{adultDayCareCount} programs</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ VERIFIED</Badge>
                      <Badge className="bg-teal-500 text-white text-[10px] px-1.5 py-0.5">MEALS + TRANSPORT</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
            
            {/* Personal Care Services - REAL DATA */}
            {(() => {
              const services = (careServicesData as any)?.services || [];
              const personalCareCount = services.filter((s: any) => s.serviceCategory === 'Personal Care Services').length;
              
              return (
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 relative overflow-hidden h-full">
                  <CardContent className="p-2 sm:p-3 text-center">
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <Users2 className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-1.5" />
                    <h4 className="font-semibold text-xs sm:text-sm text-orange-700 dark:text-orange-300 line-clamp-2">Personal Care</h4>
                    <p className="text-[10px] sm:text-xs text-orange-600 dark:text-orange-400 mt-0.5 line-clamp-2">{personalCareCount} providers</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ VERIFIED</Badge>
                      <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5">DAILY LIVING</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
              <CardContent className="p-2 sm:p-3 text-center">
                <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-1.5" />
                <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Telemedicine</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">Virtual consultations</p>
                <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
              <CardContent className="p-2 sm:p-3 text-center">
                <Pill className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-1.5" />
                <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Pharmacy Services</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">Medication delivery</p>
                <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
              <CardContent className="p-2 sm:p-3 text-center">
                <Car className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-1.5" />
                <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Medical Transport</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">Wheelchair accessible</p>
                <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
              <CardContent className="p-2 sm:p-3 text-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500 mx-auto mb-1.5" />
                <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Mental Health</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">Counseling & therapy</p>
                <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
              <CardContent className="p-2 sm:p-3 text-center">
                <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 mx-auto mb-1.5" />
                <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Medical Equipment</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">Mobility aids & devices</p>
                <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mb-8">
            <Link href="/care-services">
              <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                Browse All Care Services →
              </Button>
            </Link>
          </div>

          {/* 1. Hospital Directory Tab and Slider */}
          <div className="mb-8">
            {/* Hospital Directory Tab */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">US Hospital Directory</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Comprehensive hospital information with CMS ratings</p>
                  </div>
                </div>
                <div className="hidden sm:block flex-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Teaching hospitals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Trauma centers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Emergency services</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Quality ratings</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">6,000+</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Hospitals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">CMS</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Verified</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hospital Directory Slider */}
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
              <HospitalCarousel />
            </div>
          </div>

          {/* 2. Home Care Services Tab and Slider */}
          {(() => {
            const services = (careServicesData as any)?.services || [];
            const homeCareCount = services.filter((s: any) => s.serviceCategory === 'Home Care Services').length;
            
            return (
              <div className="mb-8">
                {/* Home Care Tab */}
                <div className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4">
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
                          
                          <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
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
                          
                          <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
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
                          
                          <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
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

          {/* Government Resources - moved to position 1 */}
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
                },
                {
                  category: 'Nutrition',
                  name: 'Food Banks & Assistance',
                  description: 'Senior-specific food programs with home delivery',
                  phone: '1-866-3-HUNGRY',
                  website: 'https://www.feedingamerica.org',
                  icon: Utensils,
                  color: 'green'
                },
                {
                  category: 'Home Care',
                  name: 'IHSS (In-Home Support)',
                  description: 'Personal care, housekeeping & daily living assistance',
                  phone: '1-877-323-1165',
                  website: 'https://www.cdss.ca.gov/in-home-supportive-services',
                  icon: Home,
                  color: 'blue'
                },
                {
                  category: 'Independent Living',
                  name: 'SLS (Supported Living)',
                  description: '24/7 support for independent living & skills training',
                  phone: '1-800-677-1116',
                  website: 'https://www.dds.ca.gov/services/adult-services/supported-living-services/',
                  icon: Users,
                  color: 'purple'
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
                  rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700',
                  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700'
                };

                const colorMap = {
                  blue: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
                  green: { bg: 'bg-green-500', hover: 'hover:bg-green-600' },
                  red: { bg: 'bg-red-500', hover: 'hover:bg-red-600' },
                  orange: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600' },
                  yellow: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
                  cyan: { bg: 'bg-cyan-500', hover: 'hover:bg-cyan-600' },
                  emerald: { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
                  rose: { bg: 'bg-rose-500', hover: 'hover:bg-rose-600' },
                  purple: { bg: 'bg-purple-500', hover: 'hover:bg-purple-600' }
                };

                return (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden group">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-3 rounded-lg ${colorMap[resource.color as keyof typeof colorMap]?.bg || colorMap.blue.bg} bg-opacity-10 group-hover:scale-110 transition-transform duration-200`}>
                          <Icon className={`w-6 h-6 ${resource.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : resource.color === 'green' ? 'text-green-600 dark:text-green-400' : resource.color === 'red' ? 'text-red-600 dark:text-red-400' : resource.color === 'orange' ? 'text-orange-600 dark:text-orange-400' : resource.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' : resource.color === 'cyan' ? 'text-cyan-600 dark:text-cyan-400' : resource.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : resource.color === 'purple' ? 'text-purple-600 dark:text-purple-400' : 'text-rose-600 dark:text-rose-400'}`} />
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

          {/* VA Aid & Attendance Benefits */}
          <div className="mb-12">
            <AidAndAttendance />
          </div>
        </div>
      </section>

      {/* Partner Onboarding Section - Communities & Vendors */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Partner With MySeniorValet
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              List your community or service on the platform families trust for senior care decisions
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
                    For Community Owners & Operators
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    List your senior living community and connect with qualified families actively searching for care
                  </p>
                  
                  {/* Enhanced Community Benefits */}
                  <div className="space-y-3 mb-6 text-left w-full">
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0 animate-pulse" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Start Free - No Credit Card Required</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Claim your verified listing in minutes</p>
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
                    List My Community
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
                    onClick={() => setLocation('/claim')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Update My Community Info
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

      {/* Enhanced Footer with Dashboard Login Buttons */}
      <Footer />
      
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
