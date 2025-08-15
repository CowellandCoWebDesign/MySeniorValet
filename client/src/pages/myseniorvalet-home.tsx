import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { EnhancedCommunityCard } from "@/components/EnhancedCommunityCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import { useAccessibilityPreferences } from "@/hooks/useAccessibilityPreferences";
import { Search, Heart, MapPin, Star, Home, Building2, DollarSign, Users, Info, MessageCircle, Link2, Truck, Sofa, Pill, Eye, Clock, Phone, Brain, Sparkles, Building, Ambulance, Package, CheckCircle, CheckSquare, Stethoscope, Activity, ShieldCheck, Scale, Utensils, Car, Scissors, Users2, FileText, Calculator, ShoppingCart, Trash2, Flower, TrendingUp, Shield, ArrowRight, Shirt as ShirtIcon, RefreshCw, ExternalLink, Globe, HeartHandshake, ChevronRight, BarChart, BarChart3, Calendar, X, Flag, Languages, Layers, ShoppingBasket, AlertCircle, Briefcase, LogIn, UserCheck, Smartphone, BookOpen, ShoppingBag, GraduationCap, MessageSquare, Monitor, Flame, Filter, XCircle, Unlock, Book } from "lucide-react";
import { AutocompleteSearch } from "@/components/AutocompleteSearch";
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
import { useSEO } from '@/hooks/useSEO';




export default function MySeniorValetHome() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  
  // Set SEO metadata for home page
  useSEO({
    title: 'Senior Living Made Simple - Find Communities, Real Pricing, No Hidden Fees',
    description: 'Search 34,494+ senior living communities with transparent pricing, verified HUD rates, and real availability. Compare assisted living, memory care, nursing homes across USA & Canada. Free tour scheduling, family sharing tools, and senior resources.',
    keywords: 'senior living, assisted living, memory care, nursing homes, HUD senior housing, independent living, retirement communities, elder care, senior care facilities, Medicare, Medicaid, VA benefits',
    canonicalUrl: 'https://www.myseniorvalet.com/'
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showProtectionModal, setShowProtectionModal] = useState(false);
  const [protectionSearchQuery, setProtectionSearchQuery] = useState('');
  const [showRemovalModal, setShowRemovalModal] = useState(false);
  const { preferences, togglePreference } = useAccessibilityPreferences();


  const [showIntegrationSpotlight, setShowIntegrationSpotlight] = useState(true);
  
  // Intersection observer refs for lazy loading
  const hudSectionRef = useRef<HTMLDivElement>(null);
  const hawaiiSectionRef = useRef<HTMLDivElement>(null);
  const floridaSectionRef = useRef<HTMLDivElement>(null);
  const texasSectionRef = useRef<HTMLDivElement>(null);
  const newYorkSectionRef = useRef<HTMLDivElement>(null);
  const californiaSectionRef = useRef<HTMLDivElement>(null);
  const canadianSectionRef = useRef<HTMLDivElement>(null);
  const careServicesSectionRef = useRef<HTMLDivElement>(null);

  // Mobile-optimized intersection observer
  const observeSection = useCallback((ref: React.RefObject<HTMLDivElement>, sectionName: string) => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSectionsLoaded(prev => ({ ...prev, [sectionName]: true }));
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        rootMargin: '100px', // Start loading 100px before section is visible
        threshold: 0.1 
      }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  // Mobile-optimized queries with reduced memory footprint
  const { data: communityStats, isLoading } = useQuery({
    queryKey: ["/api/communities/count"],
    retry: false,
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes to reduce requests
    gcTime: 60 * 60 * 1000,   // Keep in cache for 1 hour
  });

  // Lazy load platform stats only when needed
  const { data: platformStats } = useQuery({
    queryKey: ["/api/platform/stats"],
    retry: false,
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    gcTime: 60 * 60 * 1000,   // Keep in cache for 1 hour
    enabled: false, // Load on demand to reduce initial memory usage
  });



  // Real-time market data
  const { data: marketData } = useQuery({
    queryKey: ["/api/market/overview"],
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Mobile performance optimization - lazy load sections
  const [sectionsLoaded, setSectionsLoaded] = useState({
    hud: false,
    hawaii: false,
    florida: false,
    texas: false,
    newYork: false,
    california: false,
    canadian: false,
    careServices: false
  });

  // HUD properties - load only when section is visible
  const { data: hudProperties, isLoading: hudLoading } = useQuery({
    queryKey: ["/api/communities/hud-featured"],
    retry: false,
    staleTime: 30 * 60 * 1000, // Extended cache
    gcTime: 60 * 60 * 1000,
    enabled: sectionsLoaded.hud,
  });

  // HUD count query - load immediately for stats
  const { data: hudCount } = useQuery({
    queryKey: ["/api/communities/hud-count"],
    retry: false,
    staleTime: 60 * 60 * 1000, // Cache for 1 hour - rarely changes
    gcTime: 120 * 60 * 1000,
  });

  // Hawaii communities - load on demand
  const { data: hawaiiCommunities, isLoading: hawaiiLoading } = useQuery({
    queryKey: ["/api/communities/by-location/Hawaii"],
    retry: false,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: sectionsLoaded.hawaii,
  });

  // Florida communities - load on demand
  const { data: floridaCommunities, isLoading: floridaLoading } = useQuery({
    queryKey: ["/api/communities/search?state=FL"],
    retry: false,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: sectionsLoaded.florida,
  });

  // Texas communities - load on demand
  const { data: texasCommunities, isLoading: texasLoading } = useQuery({
    queryKey: ["/api/communities/search?state=TX"],
    retry: false,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: sectionsLoaded.texas,
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

  // New York communities - load on demand
  const { data: newYorkCommunities, isLoading: newYorkLoading } = useQuery({
    queryKey: ["/api/communities/search?state=NY"],
    retry: false,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: sectionsLoaded.newYork,
  });

  // Mexican communities - load on demand (real database data)
  const { data: mexicoCommunities, isLoading: mexicoLoading } = useQuery({
    queryKey: ["/api/communities/mexico-real-time"],
    retry: false,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: sectionsLoaded.california,
  });

  // Care services analytics for accurate totals
  const { data: careServicesAnalytics } = useQuery({
    queryKey: ["/api/care-services/analytics"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  // Fetch real care services from database - load on demand
  const { data: careServicesData, isLoading: careServicesLoading } = useQuery({
    queryKey: ["/api/care-services"],
    retry: false,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: sectionsLoaded.careServices,
  });

  // Fetch VA resources data
  const { data: vaResourcesData, isLoading: vaResourcesLoading } = useQuery({
    queryKey: ["/api/va-resources/facilities"],
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const vaFacilities = (vaResourcesData as any)?.facilities || {};

  // Canadian communities query - load on demand
  const { data: canadianCommunities, isLoading: canadianLoading } = useQuery({
    queryKey: ["/api/communities/canadian/featured"],
    retry: false,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: sectionsLoaded.canadian,
  });

  const featuredCommunities = (trendingCommunities as any[])?.slice(0, 8) || [];



  // Set up intersection observers on mount for mobile performance
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    const setupObserver = (ref: React.RefObject<HTMLDivElement>, sectionName: string) => {
      if (!ref.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setSectionsLoaded(prev => ({ ...prev, [sectionName]: true }));
              observer.unobserve(entry.target);
            }
          });
        },
        { 
          rootMargin: '100px',
          threshold: 0.1 
        }
      );

      observer.observe(ref.current);
      cleanupFunctions.push(() => observer.disconnect());
    };

    // Small delay to ensure refs are mounted
    const timer = setTimeout(() => {
      setupObserver(hudSectionRef, 'hud');
      setupObserver(hawaiiSectionRef, 'hawaii');
      setupObserver(floridaSectionRef, 'florida');
      setupObserver(texasSectionRef, 'texas');
      setupObserver(newYorkSectionRef, 'newYork');
      setupObserver(californiaSectionRef, 'california');
      setupObserver(canadianSectionRef, 'canadian');
      setupObserver(careServicesSectionRef, 'careServices');
    }, 100);

    return () => {
      clearTimeout(timer);
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header - Reduced height */}
      <header className="absolute top-0 left-0 right-0 z-40 bg-white/80 dark:bg-black/30 backdrop-blur-md border-b border-gray-200 dark:border-white/20">
        <div className="px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-1.5 bg-gray-200 dark:bg-white/20 rounded-lg shadow-lg hover:bg-gray-300 dark:hover:bg-white/30 transition-colors">
                    <div className="flex flex-col space-y-1">
                      <div className="w-4 h-0.5 bg-gray-700 dark:bg-white rounded-full"></div>
                      <div className="w-4 h-0.5 bg-gray-700 dark:bg-white rounded-full"></div>
                      <div className="w-4 h-0.5 bg-gray-700 dark:bg-white rounded-full"></div>
                    </div>
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
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-md flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-800 dark:text-white">MySeniorValet</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <ThemeToggle />
              <Link href="/login" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-amber-300 transition-colors font-medium text-sm">
                Sign In
              </Link>
              <Link href="/signup" className="bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 dark:bg-white/10 dark:hover:bg-white/20 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="relative min-h-screen bg-black">
        <div className="absolute inset-0">
          <img
            src="/hero-gentleman-stars.jpg"
            alt="Professional gentleman presenting under starry night sky - Your guide to senior living transparency"
            className="w-full h-full object-cover object-right"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-66% to-black"></div>
        </div>
        

        
        <div className="relative hero-content min-h-screen pt-12 sm:pt-16 md:pt-20 pb-3 md:pb-4 mobile-keyboard-safe">
          
          {/* Search Bar - Full Screen Width */}
          <div className="w-full px-2 sm:px-3 md:px-4 mb-3 animate-fade-in-up animation-delay-100" style={{ position: 'relative', zIndex: 99999 }}>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery) {
                window.location.href = `/map-search?q=${encodeURIComponent(searchQuery)}`;
              }
            }}>
              <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg" style={{ overflow: 'visible' }}>
                <div className="flex items-center">
                  <div className="flex-1 relative">
                    <AutocompleteSearch
                      value={searchQuery}
                      onChange={setSearchQuery}
                      onSubmit={(value) => {
                        if (value) {
                          window.location.href = `/map-search?q=${encodeURIComponent(value)}`;
                        }
                      }}
                      placeholder={t('hero.searchPlaceholder')}
                      hideSearchButton={true}
                      inputClassName="w-full pl-10 pr-3 py-3 text-sm border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="flex items-center mr-1.5">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 text-xs px-3 py-1 font-semibold">
                      AI-Powered
                    </Badge>
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-2 m-2 rounded-lg transition-all flex items-center justify-center shadow-md hover:shadow-lg"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Main Container - Constrained to Left 55% on mobile to avoid mascot */}
          <div className="flex flex-col items-start w-full max-w-full px-2 sm:px-3 md:px-4" style={{ paddingRight: '45%' }}>
            
            {/* Buttons Section */}
            <div className="w-full mb-2 space-y-2">

            {/* Traditional & AI Intelligence Buttons - 3/4 Width */}
            <div className="w-full mb-2 animate-fade-in-up animation-delay-200">
              <div className="grid grid-cols-2 gap-2" style={{ width: '75%' }}>
                {/* Traditional Search */}
                <Link href={`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`} className="w-full">
                  <Button className="w-full h-auto bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 border border-gray-600">
                    <div className="flex items-center justify-center space-x-1">
                      <Search className="h-3.5 w-3.5" />
                      <div className="text-left">
                        <div className="text-[10px] font-bold">Traditional</div>
                        <div className="text-[8px] text-gray-300">Browse</div>
                      </div>
                    </div>
                  </Button>
                </Link>

                {/* AI Intelligence */}
                <Link href="/ai-search-intelligence" className="w-full">
                  <Button className="w-full h-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-3 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200">
                    <div className="flex items-center justify-center space-x-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      <div className="text-left">
                        <div className="text-[10px] font-bold">AI Search</div>
                        <div className="text-[8px] text-white/90">Ask</div>
                      </div>
                    </div>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Live Availability Heatmap Button */}
            <div className="w-full mb-2 animate-fade-in-up animation-delay-300">
              <Link href="/availability-heatmap" className="block w-full">
                <Button className="w-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 px-3 py-2 rounded-xl transform hover:scale-[1.01]">
                  <div className="flex items-center justify-center space-x-2">
                    <Flame className="h-3.5 w-3.5 animate-pulse" />
                    <span className="text-[10px]">🔥 Live Availability Heatmap</span>
                  </div>
                </Button>
              </Link>
            </div>

            {/* AI Matching Assistant Button */}
            <div className="w-full mb-2 animate-fade-in-up animation-delay-400">
              <Link href="/ai-matching" className="block w-full">
                <Button className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 px-3 py-2 rounded-xl transform hover:scale-[1.01]">
                  <div className="flex items-center justify-center space-x-2">
                    <Brain className="h-3.5 w-3.5" />
                    <span className="text-[10px]">✨ AI Matching Assistant</span>
                  </div>
                </Button>
              </Link>
            </div>

            {/* Trust Indicators - Below buttons */}
            <div className="animate-fade-in-up animation-delay-500 mb-3">
              <div className="flex items-center space-x-2 bg-gray-800/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-md w-fit mx-auto">
                <Building2 className="h-3.5 w-3.5 text-blue-300" />
                <span className="text-xs font-semibold text-white">HUD + Government Sources</span>
              </div>
            </div>
          </div>
            
            {/* Hero Text Section - Constrained to Left Side */}
            <div className="w-full mr-auto ml-0 text-center sm:text-left space-y-2 sm:space-y-3 px-1 sm:px-2">
              {/* Headlines - Mobile optimized with smaller text */}
              <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black leading-tight tracking-tight">
                <span className="block text-white drop-shadow-2xl">Search 34,000+ Senior Living</span>
                <span className="block text-white drop-shadow-2xl mb-0.5 sm:mb-1">Communities</span>
                <span className="block text-red-500 text-xs sm:text-sm md:text-base">With Real HUD Pricing • Zero Paywalls</span>
              </h1>
              
              {/* Verification Badge - Smaller on mobile */}
              <div className="flex items-center justify-start gap-1 sm:gap-1.5 text-green-400 mt-2 sm:mt-4 mb-2 sm:mb-3">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-bold">Verified Pricing • Real Availability • No Pressure</span>
              </div>
              
              {/* Capability Checkmarks - Ultra compact for mobile */}
              <div className="flex flex-col gap-0.5 sm:gap-1.5 text-white/90 text-[9px] sm:text-xs leading-tight">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <CheckCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-green-400 flex-shrink-0" />
                  <span className="line-clamp-1">Compare verified government pricing & availability</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <CheckCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-green-400 flex-shrink-0" />
                  <span className="line-clamp-1">Schedule tours with TourMate™ instant booking</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <CheckCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-green-400 flex-shrink-0" />
                  <span className="line-clamp-1">Save favorites & share with family members</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <CheckCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-green-400 flex-shrink-0" />
                  <span className="line-clamp-1">Connect with senior services marketplace</span>
                </div>
              </div>
            </div>
            
          </div>
          {/* End Main Container */}
          
        </div>
        {/* End Hero Content */}
        
      </section>

      {/* TODAY, EVERYTHING CHANGES - Historic Launch Message */}
      <section className="px-4 py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-black dark:via-purple-950 dark:to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10"></div>
        <div className="max-w-6xl mx-auto text-center relative">
          <div className="mb-8">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-base font-bold shadow-2xl mb-6 animate-pulse">
              <Sparkles className="w-5 h-5 mr-2" />
              NOW LIVE ACROSS 🇺🇸 USA • 🇲🇽 MEXICO • 🇨🇦 CANADA
              <Sparkles className="w-5 h-5 ml-2" />
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 drop-shadow-2xl">
              TODAY, EVERYTHING CHANGES
            </h2>
            <p className="text-2xl md:text-3xl text-gray-200 font-bold">
              The Darkness in Senior Living Ends Now
            </p>
          </div>
          
          <Card className="bg-white/98 dark:bg-gray-900/98 backdrop-blur-sm shadow-2xl border-0">
            <CardContent className="p-10 md:p-14">
              <div className="space-y-8">
                {/* The Darkness Section */}
                <div className="bg-gray-900 dark:bg-black rounded-xl p-8 text-white">
                  <h3 className="text-2xl md:text-3xl font-bold mb-6 text-red-400">
                    For Too Long, Families Have Been Kept in the Dark
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-red-300">Information Scattered & Paywalled</p>
                          <p className="text-gray-300 text-sm">When your parent falls or gets diagnosed, you search desperately. Some info exists, but it's scattered across dozens of sites, most behind paywalls.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-red-300">Unaware of 10 Levels of Care</p>
                          <p className="text-gray-300 text-sm">Most think it's just "Assisted Living." They don't know about HUD Housing, VA Housing, Mobile & RV, 55+ Active, Independent Living, Board & Care, Memory Care, CCRC, or Skilled Nursing - 10 distinct levels!</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-red-300">"Contact for Pricing" Gatekeeping</p>
                          <p className="text-gray-300 text-sm">Every website. Every brochure. Hidden pricing everywhere. As if your family's crisis isn't stressful enough.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-red-300">Referral Services Raise Everyone's Costs</p>
                          <p className="text-gray-300 text-sm">Aggregators charge communities up to one full month's rent per move-in. These costs get passed to ALL families through higher prices.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-red-300">"White Glove" = Communication Flood</p>
                          <p className="text-gray-300 text-sm">They promise personal assistance, then hand your info to sales teams. Your phone rings, inbox fills, texts pour in - non-stop aggressive pitches.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-red-300">Unaware of Benefits You Qualify For</p>
                          <p className="text-gray-300 text-sm">VA Aid & Attendance, Medicaid waivers, state programs - families don't know what help exists or how to access it.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* The Light Section */}
                <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 border-2 border-green-400">
                  <div className="mb-6">
                    {/* Country Coverage Badge */}
                    <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-500/90 to-blue-500/90 backdrop-blur-sm text-white rounded-full text-sm sm:text-lg font-bold shadow-2xl mb-4 animate-bounce-slow">
                      <span className="flex items-center">
                        <span className="text-xl sm:text-2xl mr-1">🇺🇸</span>
                        <span>USA</span>
                      </span>
                      <span className="hidden sm:inline mx-2">•</span>
                      <span className="flex items-center">
                        <span className="text-xl sm:text-2xl mr-1">🇲🇽</span>
                        <span>MEXICO</span>
                      </span>
                      <span className="hidden sm:inline mx-2">•</span>
                      <span className="flex items-center">
                        <span className="text-xl sm:text-2xl mr-1">🇨🇦</span>
                        <span>CANADA</span>
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                      <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        THIS STOPS NOW - COMPLETE CARE SPECTRUM FOR ALL
                      </span>
                    </h3>
                    <p className="text-lg text-gray-700 dark:text-gray-200 mt-2 font-medium">
                      Master all 10+ levels of care. Real pricing, real availability. <span className="font-bold text-amber-600 dark:text-amber-400">No hidden fees, no referral markups, no communication floods.</span> Welcome to complete transparency.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">Learn All 10 Levels of Care</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">From HUD Housing to Skilled Nursing - understand all 10 care levels, pricing ranges, and when each applies to your family's needs.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">Real Pricing, Real Availability</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">Actual prices. Current availability. No more "contact us" gatekeeping.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">ALL Families Get PLATINUM Features Free</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">Every family gets our complete PLATINUM toolkit. No tiers. No upgrades. Always free, guaranteed forever.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">Shareable Tour Tracker - Hyper Rich Reviews</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">Our transparency tool prevents high prices from hiding behind lagging online reviews. Share your real tour experiences to help others see the truth.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">Tour Tracker with Family Sharing</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">Track every tour, save notes, build comparisons. Share instantly with family members for collaborative decisions.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">Communities Shine Bright</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">Every facility can represent itself honestly. No more hiding great care in the shadows.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">Discover Benefits You Qualify For</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">VA Aid & Attendance, Medicaid, state programs - we help you find and understand all available assistance.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* The Promise - 10 Levels of Care - ACTIVE BETA */}
                <div className="my-8 py-8 border-y-2 border-purple-400 dark:border-purple-600">
                  <Globe className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-6" />
                  
                  {/* Beta Launch Badge */}
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg mb-4 animate-pulse">
                    <span className="mr-2">🚀</span>
                    <span>ACTIVE BETA - LIVE NOW</span>
                  </div>
                  
                  <p className="text-2xl md:text-3xl font-bold text-white dark:text-gray-100 mb-4">
                    Master the Full 10-Level Care Spectrum
                  </p>
                  
                  {/* Ultra-Compact Care Spectrum */}
                  <div className="text-center mb-6 px-4">
                    <div className="text-lg md:text-xl text-gray-100 dark:text-gray-200">
                      <span className="text-amber-300 dark:text-purple-400 font-bold">🏛️ HUD</span> → 
                      <span className="text-amber-300 dark:text-purple-400 font-bold"> 🎖️ VA</span> → 
                      <span className="text-amber-300 dark:text-purple-400 font-bold"> 🚐 Mobile</span> → 
                      <span className="text-amber-300 dark:text-purple-400 font-bold"> ⛳ 55+</span> → 
                      <span className="text-amber-300 dark:text-purple-400 font-bold"> 🏠 Independent</span> → 
                      <span className="text-amber-300 dark:text-purple-400 font-bold"> 🏡 Board & Care</span> → 
                      <span className="text-amber-300 dark:text-purple-400 font-bold"> 🤝 Assisted</span> → 
                      <span className="text-amber-300 dark:text-purple-400 font-bold"> 🧠 Memory</span> → 
                      <span className="text-amber-300 dark:text-purple-400 font-bold"> ♾️ CCRC</span> → 
                      <span className="text-amber-300 dark:text-purple-400 font-bold"> 🏥 Skilled</span>
                    </div>
                    <p className="text-sm text-gray-200 dark:text-gray-400 mt-2">Complete care continuum from independent to full medical support</p>
                  </div>

                  <p className="text-xl md:text-2xl text-gray-100 dark:text-gray-200">
                    Finally understand every option, every transition, every cost - <strong className="text-amber-300 dark:text-purple-400">complete transparency</strong> across the entire care journey.
                  </p>
                  
                  {/* Beta Notice */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-600 rounded-lg p-4 mt-6">
                    <p className="text-lg text-blue-800 dark:text-blue-300 font-semibold mb-2">
                      🌟 Welcome to Our Active Beta Launch!
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      This platform is being released immediately for public access to rapidly deliver transparency and benefit society through immediate access to information powered by AI. We apologize for any malfunctions you may experience during this beta phase.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      <strong>Quick Fix for Most Issues:</strong> Navigate to the top navbar, return home, and refresh your browser. This resolves most beta-related glitches.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 font-semibold">
                      Thank you for your patience and support in joining this movement for transparency in senior living. Together, we're bringing light to an industry that has operated in darkness for too long.
                    </p>
                  </div>
                  
                  <p className="text-lg md:text-xl text-gray-100 dark:text-gray-300 mt-4">
                    We're not just launching a platform. We're launching a movement - and you're part of it.
                  </p>
                </div>

                <div className="pt-6">
                  <p className="text-2xl md:text-3xl font-black text-white dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-blue-400 dark:to-purple-400">
                    To every family searching in the dark: The lights are on now.
                  </p>
                  <p className="text-lg md:text-xl text-gray-100 dark:text-gray-300 mt-4">
                    <strong>You deserve the truth. Communities deserve to be found. The darkness ends today.</strong>
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-base md:text-lg text-white dark:text-gray-200 mb-6 font-bold">
                  Welcome to the Dawn of Transparency in Senior Living - All 10 Care Levels
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2 text-sm font-bold shadow-lg">
                    <Flag className="w-4 h-4 mr-2" />
                    🇺🇸 USA • 🇲🇽 MEXICO • 🇨🇦 CANADA
                  </Badge>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2 text-sm font-bold shadow-lg">
                    <Building className="w-4 h-4 mr-2" />
                    34,000+ Communities
                  </Badge>
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 text-sm font-bold shadow-lg">
                    <Unlock className="w-4 h-4 mr-2" />
                    Zero Paywalls
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Personalized Banner */}
      <div className="px-4 py-6 bg-gradient-to-r from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <PersonalizedBanner />
        </div>
      </div>

      {/* Senior Living Command Center with Integrated Marketplace */}
      <section className="relative overflow-hidden">
        {/* Command Center Header with Beautiful Gradient - matching marketplace page */}
        <div className="px-4 py-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 animate-pulse"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center">
              <h2 className="text-5xl font-bold text-white mb-4">
                Senior Living Command Center
              </h2>
              <div className="flex flex-col items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white">
                  <Brain className="w-5 h-5" />
                  <span className="text-sm font-semibold">Powered & Supported by Artificial Intelligence Orchestra</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 px-4">
                  <span className="text-xs text-white/80">Powered by:</span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-0.5 text-xs">
                      1. Perplexity AI (Primary - Web Search)
                    </Badge>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 text-xs">
                      2. Claude Sonnet 4.0 (Secondary - Analysis)
                    </Badge>
                    <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-2 py-0.5 text-xs">
                      3. ChatGPT-4o (Backup - Verification)
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-xl text-blue-100 max-w-4xl mx-auto mb-8">
                <p className="mb-6">Access the most comprehensive senior living ecosystem ever assembled - over 42,000 resources spanning communities, vendors, healthcare, and education. Every listing enhanced by AI-powered search, Red Tag specials, and real-time market intelligence.</p>
                <div className="space-y-2 text-lg">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">🏘️</span>
                    <span className="font-semibold">34,181+ Communities</span> with verified HUD pricing
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">🛍️</span>
                    <span className="font-semibold">1,500+ Vendor Services</span> for senior living needs
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">🏥</span>
                    <span className="font-semibold">6,800+ Healthcare Providers</span> nationwide
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">📚</span>
                    <span className="font-semibold">100+ Educational Resources</span> for informed decisions
                  </div>
                </div>
              </div>
              
              {/* Feature Badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                  <Flame className="w-4 h-4 mr-2" />
                  Red Tag Specials
                </Badge>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Market Intelligence
                </Badge>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                  <Calculator className="w-4 h-4 mr-2" />
                  Cost Calculators
                </Badge>
                <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                  <MapPin className="w-4 h-4 mr-2" />
                  42,481+ Total Resources
                </Badge>
                <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                  <Shield className="w-4 h-4 mr-2" />
                  Complete Care Spectrum
                </Badge>
              </div>
              
              {/* Quick Stats Bar - like marketplace page */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-white">34,181+</div>
                    <div className="text-xs text-blue-100">Communities</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-white">1,500+</div>
                    <div className="text-xs text-blue-100">Vendors</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-white">6,800+</div>
                    <div className="text-xs text-blue-100">Healthcare</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-white">100+</div>
                    <div className="text-xs text-blue-100">Resources</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Four Directory Cards Grid - Seamlessly Connected */}
      <section className="px-4 py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto">
            {/* Four Directory Cards in 2x2 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* Community Directory */}
            <Link href="/community-directory">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-blue-500 relative overflow-hidden group transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-50"></div>
                <CardHeader className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
                      <Building2 className="h-8 w-8" />
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1">
                      PRIMARY DATABASE
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">Community Directory</CardTitle>
                  <CardDescription className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Complete Database Access
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Access all 34,181+ senior living communities across the United States with verified pricing and real-time availability
                  </p>
                  
                  <div className="flex items-center gap-2 mb-6 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">34,181+</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Communities</span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">All U.S. Communities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">5,936+ HUD Properties</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Real-Time Availability</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Verified Pricing Data</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 group-hover:shadow-lg transition-all">
                    <span className="font-semibold">Explore Directory</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Senior Marketplace */}
            <Link href="/senior-marketplace">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-amber-400 relative overflow-hidden group transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 opacity-50"></div>
                <CardHeader className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                      <ShoppingCart className="h-8 w-8" />
                    </div>
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1">
                      COMMERCIAL
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">Senior Marketplace</CardTitle>
                  <CardDescription className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Commercial Vendor Services
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Professional services for your senior living needs - moving, legal, floral, transportation, and more
                  </p>
                  
                  <div className="flex items-center gap-2 mb-6 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">1,500+</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Vendor Services</span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Moving & Relocation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Legal & Financial Services</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Transportation Solutions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Personal Services</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 group-hover:shadow-lg transition-all">
                    <span className="font-semibold">Explore Directory</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Senior Healthcare Services Directory */}
            <Link href="/senior-healthcare-directory">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-teal-400 relative overflow-hidden group transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 opacity-50"></div>
                <CardHeader className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 text-white shadow-lg">
                      <Stethoscope className="h-8 w-8" />
                    </div>
                    <Badge className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-3 py-1">
                      HEALTHCARE
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">Senior Healthcare Services Directory</CardTitle>
                  <CardDescription className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Healthcare & Care Providers
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Connect with verified hospitals, home care, therapy services, and medical professionals
                  </p>
                  
                  <div className="flex items-center gap-2 mb-6 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">6,800+</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Healthcare Providers</span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">6,000+ CMS Hospitals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Home Care Services</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Therapy & Rehabilitation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Medical Equipment</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:opacity-90 group-hover:shadow-lg transition-all">
                    <span className="font-semibold">Explore Directory</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Senior Resources and Support Center */}
            <Link href="/senior-resources-center">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-purple-400 relative overflow-hidden group transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 opacity-50"></div>
                <CardHeader className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg">
                      <Book className="h-8 w-8" />
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1">
                      RESOURCES
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">Senior Resources and Support Center</CardTitle>
                  <CardDescription className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Educational Content & Support
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Comprehensive guides, government programs, support groups, and educational resources
                  </p>
                  
                  <div className="flex items-center gap-2 mb-6 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">100+</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Resources</span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Care Planning Guides</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Government Programs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Support Groups</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Educational Materials</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90 group-hover:shadow-lg transition-all">
                    <span className="font-semibold">Explore Directory</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Communities Slider - Visual Break */}
      <section ref={hawaiiSectionRef} className="px-4 py-8 bg-white dark:bg-gray-900">
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
          
          <div className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600" style={{height: '44rem'}}>
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
      <section ref={hudSectionRef} className="px-4 py-12 relative overflow-hidden dark:bg-gray-800">
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
        
          <div className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth', height: '44rem'}}>
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
      <section ref={floridaSectionRef} className="px-4 py-12 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
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
              <div className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600" style={{height: '32rem'}}>
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
      <section ref={texasSectionRef} className="px-4 py-12 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
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
              <div className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600" style={{height: '44rem'}}>
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



      {/* Featured & Coastal Communities Section - Position 3 (Moved from Position 2) */}
      <section ref={newYorkSectionRef} className="px-4 py-12 relative overflow-hidden dark:bg-gray-800">
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
        
          <div className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth', height: '44rem'}}>
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
      <section ref={canadianSectionRef} className="px-4 py-12 relative dark:bg-gray-800">
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
            <div className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth', height: '44rem'}}>
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

      {/* Featured Mexican Communities Section */}
      <section ref={californiaSectionRef} className="px-4 py-8 relative overflow-hidden">
        {/* Background with Mexican flag colors styling */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-green-50 via-white to-red-50 dark:from-green-900/20 dark:via-gray-900 dark:to-red-900/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-100/30 via-white/20 to-red-100/30 dark:from-green-700/30 dark:via-gray-800/20 dark:to-red-700/30"></div>
          {/* Mexican flag pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-20 text-green-600 text-8xl">🦅</div>
            <div className="absolute top-40 right-40 text-red-600 text-6xl rotate-45">🌮</div>
            <div className="absolute bottom-20 left-1/3 text-green-600 text-7xl -rotate-12">🌵</div>
            <div className="absolute bottom-10 right-20 text-red-600 text-5xl rotate-180">🌺</div>
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span className="text-2xl">🇲🇽</span>
              Featured Mexican Communities
            </h2>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">$800 - $1,200 USD</div>
              <div className="text-xs text-green-600 dark:text-green-400">Government-certified facilities</div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{(mexicoCommunities as any[] || []).length || 101} authentic facilities • Ciudad de México, Cuernavaca, Guadalajara, Querétaro across 13 states</p>
        
          <div className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
            {mexicoLoading ? (
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
              ((mexicoCommunities as any[] || []).slice(0, 12)).map((community: any, index: number) => (
                <EnhancedCommunityCard
                  key={`mexico-${community.id}-${index}`}
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
      <section ref={careServicesSectionRef} className="px-4 py-8">
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
              onClick={() => setLocation('/marketplace')}
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
              {/* Essential Resources - Expanded with all 32 senior resources */}
              {[
                // Government Programs
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
                // Safety & Protection
                {
                  category: 'Safety',
                  name: 'Adult Protective Services',
                  description: 'Report elder abuse and get protection services',
                  phone: '1-800-677-1116',
                  website: 'https://acl.gov/programs/elder-justice/adult-protective-services',
                  icon: Shield,
                  color: 'red'
                },
                {
                  category: 'Advocacy',
                  name: 'Long-Term Care Ombudsman',
                  description: 'Advocates for residents in nursing homes & assisted living',
                  phone: '1-800-252-2412',
                  website: 'https://theconsumervoice.org',
                  icon: Users,
                  color: 'purple'
                },
                // Support Groups & Organizations
                {
                  category: 'Support',
                  name: 'AARP',
                  description: 'Resources, advocacy, and benefits for 50+ adults',
                  phone: '1-888-687-2277',
                  website: 'https://www.aarp.org',
                  icon: Users,
                  color: 'blue'
                },
                {
                  category: 'Support',
                  name: "Alzheimer's Association",
                  description: '24/7 helpline for dementia support and resources',
                  phone: '1-800-272-3900',
                  website: 'https://www.alz.org',
                  icon: Brain,
                  color: 'purple'
                },
                {
                  category: 'Support',
                  name: 'Parkinson\'s Foundation',
                  description: 'Support and resources for Parkinson\'s patients',
                  phone: '1-800-473-4636',
                  website: 'https://www.parkinson.org',
                  icon: Heart,
                  color: 'green'
                },
                {
                  category: 'Support',
                  name: 'American Cancer Society',
                  description: '24/7 cancer support, resources, and services',
                  phone: '1-800-227-2345',
                  website: 'https://www.cancer.org',
                  icon: Heart,
                  color: 'rose'
                },
                // Healthcare Programs
                {
                  category: 'Healthcare',
                  name: 'PACE Programs',
                  description: 'All-inclusive care for the elderly',
                  phone: '1-855-435-7223',
                  website: 'https://www.medicare.gov/health-drug-plans/health-plans/your-health-plan-options/pace',
                  icon: Stethoscope,
                  color: 'blue'
                },
                {
                  category: 'Insurance',
                  name: 'MediGap/Supplemental',
                  description: 'Medicare supplement insurance information',
                  phone: '1-800-MEDICARE',
                  website: 'https://www.medicare.gov/supplements-other-insurance/whats-medicare-supplement-insurance-medigap',
                  icon: Shield,
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
                // Community Resources
                {
                  category: 'Community',
                  name: 'Senior Centers',
                  description: 'Local senior centers for activities and services',
                  phone: '1-800-677-1116',
                  website: 'https://eldercare.acl.gov',
                  icon: Home,
                  color: 'orange'
                },
                {
                  category: 'Accessibility',
                  name: 'Disability Action Centers',
                  description: 'Independent living support and advocacy',
                  phone: '1-800-514-0301',
                  website: 'https://www.ada.gov',
                  icon: Users,
                  color: 'purple'
                },
                // Nutrition Programs
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
                  category: 'Nutrition',
                  name: 'Meals on Wheels',
                  description: 'Home-delivered meals for homebound seniors',
                  phone: '1-888-998-6325',
                  website: 'https://www.mealsonwheelsamerica.org',
                  icon: Utensils,
                  color: 'green'
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
                // Transportation & Mobility
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
                  category: 'Transportation',
                  name: 'NEMT Services',
                  description: 'Non-emergency medical transportation',
                  phone: '1-800-MEDICARE',
                  website: 'https://www.cms.gov/medicare/health-plans/medicareadvtgspecratestats/ratebooks-and-supporting-data',
                  icon: Car,
                  color: 'yellow'
                },
                // Home & Living Support
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
                },
                {
                  category: 'Housing',
                  name: 'Area Agency on Aging',
                  description: 'Local aging services and support programs',
                  phone: '1-800-677-1116',
                  website: 'https://www.n4a.org',
                  icon: Home,
                  color: 'blue'
                },
                // Educational & Information
                {
                  category: 'Education',
                  name: 'OLLI (Lifelong Learning)',
                  description: 'Educational programs for adults 50+',
                  phone: '1-800-677-1116',
                  website: 'https://www.osher.net',
                  icon: GraduationCap,
                  color: 'cyan'
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
                  category: 'Technology',
                  name: 'Senior Planet',
                  description: 'Technology training and digital literacy for seniors',
                  phone: '1-888-713-3495',
                  website: 'https://seniorplanet.org',
                  icon: Monitor,
                  color: 'purple'
                },
                // Emergency & Crisis Support
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
                  category: 'Emergency',
                  name: 'Elder Abuse Hotline',
                  description: 'Report suspected elder abuse 24/7',
                  phone: '1-800-252-8966',
                  website: 'https://www.justice.gov/elderjustice',
                  icon: Shield,
                  color: 'red'
                },
                // Communication Support
                {
                  category: 'Communication',
                  name: 'Relay Services (711)',
                  description: 'Phone relay for deaf/hard of hearing',
                  phone: '711',
                  website: 'https://www.fcc.gov/consumers/guides/telecommunications-relay-service-trs',
                  icon: Phone,
                  color: 'blue'
                },
                {
                  category: 'Communication',
                  name: 'Language Line',
                  description: 'Interpretation services for non-English speakers',
                  phone: '1-866-874-3972',
                  website: 'https://www.languageline.com',
                  icon: MessageSquare,
                  color: 'purple'
                },
                // Veterans Specific
                {
                  category: 'Veterans',
                  name: 'Veterans Crisis Line',
                  description: '24/7 confidential crisis support for veterans',
                  phone: '1-800-273-8255',
                  website: 'https://www.veteranscrisisline.net',
                  icon: Shield,
                  color: 'red'
                },
                // Insurance & Benefits
                {
                  category: 'Insurance',
                  name: 'SHIP (Medicare Counseling)',
                  description: 'Free Medicare counseling and assistance',
                  phone: '1-877-839-2675',
                  website: 'https://www.shiphelp.org',
                  icon: Shield,
                  color: 'cyan'
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

                  {/* Enhanced Pricing Display with Promotions */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg p-4 mb-6 w-full border border-purple-200 dark:border-purple-700">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-center gap-4 text-xs sm:text-sm font-bold">
                        <span>🎉 50% OFF First Month</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">💰 20% OFF Annual Plans</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Professional tiers starting at:</p>
                    <div className="flex flex-wrap justify-center gap-2 text-sm">
                      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">$99 Basic (1 State)</Badge>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">$249 Featured (3 States)</Badge>
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

      {/* Mission Statement Section - Moved from top */}
      <section className="px-4 py-12 bg-gradient-to-r from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <HeartHandshake className="h-12 w-12 text-blue-600 dark:text-blue-400 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Our Mission
            </h2>
          </div>
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-0">
            <CardContent className="p-8 md:p-12">
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                Our mission at MySeniorValet is to transform the senior living experience by providing families with easy access to clear, upfront pricing and comprehensive services. We are committed to fostering transparency, empowering families to make confident decisions, and ensuring that every senior and their loved ones receive the care and support they deserve. Through a one-stop platform that connects seniors to trusted communities, healthcare resources, and essential services, we aim to simplify the journey of aging with dignity and independence.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-2 text-sm font-semibold">
                  <Shield className="w-4 h-4 mr-2" />
                  Transparency First
                </Badge>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-4 py-2 text-sm font-semibold">
                  <Heart className="w-4 h-4 mr-2" />
                  Family Focused
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-4 py-2 text-sm font-semibold">
                  <Users className="w-4 h-4 mr-2" />
                  Dignity & Independence
                </Badge>
              </div>
            </CardContent>
          </Card>
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
      
      {/* Onboarding Wizard - DISABLED: Prototype for future development */}
      {/* <OnboardingWrapper /> */}
    </div>
  );
}
