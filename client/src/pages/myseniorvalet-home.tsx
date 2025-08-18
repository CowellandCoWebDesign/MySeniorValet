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
import { Search, Heart, MapPin, Star, Home, Building2, DollarSign, Users, Info, MessageCircle, Link2, Truck, Sofa, Pill, Eye, Clock, Phone, Brain, Sparkles, Building, Ambulance, Package, CheckCircle, CheckSquare, Stethoscope, Activity, ShieldCheck, Scale, Utensils, Car, Scissors, Users2, FileText, Calculator, ShoppingCart, Trash2, Flower, TrendingUp, Shield, ArrowRight, Shirt as ShirtIcon, RefreshCw, ExternalLink, Globe, HeartHandshake, ChevronRight, BarChart, BarChart3, Calendar, X, Flag, Languages, Layers, ShoppingBasket, AlertCircle, Briefcase, LogIn, UserCheck, Smartphone, BookOpen, ShoppingBag, GraduationCap, MessageSquare, Monitor, Flame, Filter, XCircle, Unlock, Book, Music } from "lucide-react";
import { AutocompleteSearch } from "@/components/AutocompleteSearch";
import { ServiceBadges, commonBadges } from "@/components/ServiceBadges";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PricingBreakdown } from "@/components/pricing-breakdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { CareServiceCard } from "@/components/CareServiceCard";


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
// Temporarily disable asset imports to fix rendering issue
// import heroBackgroundImage from '@assets/file_00000000715861f6ba1d823cc2455100 (1)_1755292957645.png';
// import lighthouseBackground from '@assets/file_00000000f554622f979774949c6d60bd_1755365135902.png';
const heroBackgroundImage = '/hero-background.jpg';
const lighthouseBackground = '/lighthouse-sunset-final.png';
import { EmergencyButton } from "@/components/EmergencyButton";




export default function MySeniorValetHome() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  
  // Set SEO metadata for home page
  useSEO({
    title: 'Senior Living Made Simple - Find Communities, Real Pricing, No Hidden Fees',
    description: 'Search 36,000+ senior living communities across USA, Canada & Mexico with transparent pricing, verified HUD rates, and real availability. Compare assisted living, memory care, nursing homes. Free tour scheduling, family sharing tools, and senior resources.',
    keywords: 'senior living, assisted living, memory care, nursing homes, HUD senior housing, independent living, retirement communities, elder care, senior care facilities, Medicare, Medicaid, VA benefits, Canadian senior homes',
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



  // Real-time market data - disabled for performance
  const { data: marketData } = useQuery({
    queryKey: ["/api/market/overview"],
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    enabled: false, // Disabled to improve initial load time
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

  // HUD count query - deferred for performance
  const { data: hudCount } = useQuery({
    queryKey: ["/api/communities/hud-count"],
    retry: false,
    staleTime: 60 * 60 * 1000, // Cache for 1 hour - rarely changes
    gcTime: 120 * 60 * 1000,
    enabled: false, // Disabled to improve initial load time
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

  // Keep trending for other sections that may need it - deferred for performance
  const { data: trendingCommunities, isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/communities/trending"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: false, // Disabled to improve initial load time
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

  // Care services analytics for accurate totals - deferred for performance
  const { data: careServicesAnalytics } = useQuery({
    queryKey: ["/api/care-services/analytics"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: false, // Disabled to improve initial load time
  });
  
  // Fetch real care services from database - load on demand
  const { data: careServicesData, isLoading: careServicesLoading } = useQuery({
    queryKey: ["/api/care-services"],
    retry: false,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: sectionsLoaded.careServices,
  });

  // Fetch VA resources data - deferred for performance
  const { data: vaResourcesData, isLoading: vaResourcesLoading } = useQuery({
    queryKey: ["/api/va-resources/facilities"],
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    enabled: false, // Disabled to improve initial load time
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
      {/* Header - Fixed to top */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
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
                <SheetContent side="left" className="w-80 h-full flex flex-col">
                  <div className="flex flex-col space-y-6 mt-8 overflow-y-auto pb-6" style={{ maxHeight: 'calc(100vh - 80px)' }}>
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
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">MySeniorValet</span>
              </div>
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

      {/* Hero Section with Search */}
      <section className="relative min-h-screen bg-black pt-14">
        <div className="absolute inset-0">
          <img
            src={heroBackgroundImage}
            alt="Professional gentleman presenting under starry night sky - Your guide to senior living transparency"
            className="w-full h-full object-contain sm:object-cover object-center sm:object-right"
            loading="eager"
          />
          {/* Minimal darkening only at the very bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-90% to-black/30"></div>
        </div>
        

        
        <div className="relative hero-content min-h-screen pt-12 sm:pt-16 md:pt-20 pb-3 md:pb-4 mobile-keyboard-safe flex flex-col">
          
          {/* All Action Buttons - Compact Horizontal Layout - Full Screen Width */}
          <div className="w-full px-2 sm:px-3 md:px-4 mb-2 animate-fade-in-up animation-delay-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
              {/* Traditional Search */}
              <Link href={`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`} className="w-full">
                <Button className="w-full h-auto bg-gray-800 hover:bg-gray-700 text-white px-1.5 py-1.5 rounded-md font-medium shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-200 border border-gray-600">
                  <div className="flex items-center justify-start space-x-1">
                    <Search className="h-3 w-3 flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-[8px] font-semibold leading-tight">Traditional Browse</div>
                      <div className="text-[7px] text-gray-400 leading-tight">Filter & Sort</div>
                    </div>
                  </div>
                </Button>
              </Link>

              {/* AI Intelligence */}
              <Link href="/ai-search-intelligence" className="w-full">
                <Button className="w-full h-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-1.5 py-1.5 rounded-md font-medium shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-200">
                  <div className="flex items-center justify-start space-x-1">
                    <Sparkles className="h-3 w-3 flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-[8px] font-semibold leading-tight">AI Assistant</div>
                      <div className="text-[7px] text-white/80 leading-tight">Ask Questions</div>
                    </div>
                  </div>
                </Button>
              </Link>

              {/* Live Availability Heatmap */}
              <Link href="/availability-heatmap" className="w-full">
                <Button className="w-full h-auto bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 px-1.5 py-1.5 rounded-md transform hover:scale-[1.01]">
                  <div className="flex items-center justify-start space-x-1">
                    <Flame className="h-3 w-3 flex-shrink-0 animate-pulse" />
                    <div className="text-left">
                      <div className="text-[8px] font-semibold leading-tight">Live Heatmap</div>
                      <div className="text-[7px] text-white/80 leading-tight">Availability Now</div>
                    </div>
                  </div>
                </Button>
              </Link>

              {/* AI Matching Assistant */}
              <Link href="/ai-matching" className="w-full">
                <Button className="w-full h-auto bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 px-1.5 py-1.5 rounded-md transform hover:scale-[1.01]">
                  <div className="flex items-center justify-start space-x-1">
                    <Brain className="h-3 w-3 flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-[8px] font-semibold leading-tight">Smart Match</div>
                      <div className="text-[7px] text-white/80 leading-tight">Personalized</div>
                    </div>
                  </div>
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar - Full Screen Width - Slimmer Design */}
          <div className="w-full px-2 sm:px-3 md:px-4 mb-2 animate-fade-in-up animation-delay-200" style={{ position: 'relative', zIndex: 99999 }}>
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
                      inputClassName="w-full pl-10 pr-3 py-2 text-sm border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="flex items-center mr-1.5">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 text-xs px-2 py-0.5 font-semibold">
                      AI-Powered
                    </Badge>
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-1.5 m-1.5 rounded-lg transition-all flex items-center justify-center shadow-md hover:shadow-lg"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Trust Indicators - Below buttons, FULL WIDTH for proper centering */}
          <div className="animate-fade-in-up animation-delay-300 mb-3 w-full flex justify-center items-center px-2">
            <div className="flex flex-wrap justify-center items-center gap-1">
              {/* Government Sources Badge */}
              <span className="inline-flex items-center space-x-1 bg-gray-800/80 backdrop-blur-md px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                <Building2 className="h-2.5 w-2.5 text-blue-300 flex-shrink-0" />
                <span className="text-[9px] font-semibold text-white">Real HUD Pricing</span>
              </span>
              
              {/* Community Reported Badge */}
              <span className="inline-flex items-center space-x-1 bg-gray-800/80 backdrop-blur-md px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                <Users2 className="h-2.5 w-2.5 text-green-300 flex-shrink-0" />
                <span className="text-[9px] font-semibold text-white">Family Reviews</span>
              </span>
              
              {/* AI Orchestration Badge */}
              <span className="inline-flex items-center space-x-1 bg-gray-800/80 backdrop-blur-md px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                <Brain className="h-2.5 w-2.5 text-purple-300 animate-pulse flex-shrink-0" />
                <span className="text-[9px] font-semibold text-white">Live Availability</span>
              </span>
              
              {/* AI Orchestra Badge - Attribution to the 3 AIs */}
              <span className="inline-flex items-center space-x-1 bg-gradient-to-r from-purple-800/80 to-indigo-800/80 backdrop-blur-md px-2 py-0.5 rounded-full shadow-md whitespace-nowrap border border-purple-400/30">
                <Music className="h-2.5 w-2.5 text-yellow-300 animate-pulse flex-shrink-0" />
                <span className="text-[9px] font-semibold text-white">AI Triple-Verified</span>
              </span>
            </div>
          </div>

          {/* Spacer to push content to bottom */}
          <div className="flex-grow"></div>
          
          {/* Main Container - Constrained to Left 55% on mobile to avoid mascot - Bottom Aligned */}
          <div className="flex flex-col items-start w-full max-w-full px-2 sm:px-3 md:px-4 mt-auto pb-8 sm:pb-12 md:pb-16" style={{ paddingRight: '45%' }}>
            
            {/* Hero Text Section - Constrained to Left Side */}
            <div className="w-full mr-auto ml-0 text-center sm:text-left space-y-2 sm:space-y-3 px-1 sm:px-2">
              {/* Headlines - Further reduced text sizes */}
              <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black leading-tight tracking-tight">
                <span className="block text-white drop-shadow-2xl">Search 34,000+ Senior Living</span>
                <span className="block text-white drop-shadow-2xl mb-0.5 sm:mb-1">Communities</span>
                <span className="block text-red-500 text-[10px] sm:text-xs md:text-sm font-bold">With Real HUD Pricing • Zero Paywalls</span>
              </h1>
              
              {/* Verification Badge - Smaller on mobile */}
              <div className="flex items-center justify-start gap-1 sm:gap-1.5 text-green-400 mt-1.5 sm:mt-2 mb-1.5 sm:mb-2">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] sm:text-xs font-bold">Verified Pricing • Real Availability • No Pressure</span>
              </div>
              
              {/* Capability Checkmarks - Enhanced differentiation with backgrounds */}
              <div className="flex flex-col gap-1 sm:gap-1.5">
                {/* Government Pricing Feature - Premium highlight */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-md px-1.5 py-0.5 sm:px-2 sm:py-1">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs text-white font-semibold">Compare verified government pricing & availability</span>
                </div>
                
                {/* TourMate Feature - Secondary highlight */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-blue-500/15 border border-blue-400/20 rounded-md px-1.5 py-0.5 sm:px-2 sm:py-1">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs text-white">Schedule tours with TourMate™ instant booking</span>
                </div>
                
                {/* Family Sharing Feature */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-purple-500/10 border border-purple-400/15 rounded-md px-1.5 py-0.5 sm:px-2 sm:py-1">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs text-white">Save favorites & share with family members</span>
                </div>
                
                {/* Marketplace Feature */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-orange-500/10 border border-orange-400/15 rounded-md px-1.5 py-0.5 sm:px-2 sm:py-1">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs text-white">Connect with senior services marketplace</span>
                </div>
              </div>
            </div>
            
          </div>
          {/* End Main Container */}
          
        </div>
        {/* End Hero Content */}
        
      </section>

      {/* Combined Beta Launch & Industry Darkness Section */}
      <section className="px-4 py-8 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
              Welcome to Our Active Beta Launch
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            </h2>
            <p className="text-xl text-yellow-400 font-bold">
              We're not just launching a platform. We're launching a movement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left side - The Darkness */}
            <Card className="bg-gray-900/95 dark:bg-black/95 border-red-500/30">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 text-red-400">
                  For Too Long, Families Have Been Kept in the Dark
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-300">Information Scattered & Paywalled</p>
                      <p className="text-gray-400">Desperately searching across dozens of sites, most behind paywalls.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-300">Unaware of 10 Levels of Care</p>
                      <p className="text-gray-400">Most don't know about HUD, VA, Memory Care, CCRC - 10 distinct levels!</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-300">"Contact for Pricing" Gatekeeping</p>
                      <p className="text-gray-400">Hidden pricing everywhere adds stress to family crisis.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-300">Referral Services Raise Costs</p>
                      <p className="text-gray-400">Aggregators charge up to one month's rent, passed to ALL families.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right side - Beta Info */}
            <Card className="bg-blue-900/95 dark:bg-blue-900/95 border-blue-400/30">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 text-white">
                  Bringing Light to Senior Living
                </h3>
                <div className="space-y-4">
                  <p className="text-white/90">
                    This platform is being released immediately to rapidly deliver transparency through AI-powered information access.
                  </p>
                  
                  <div className="bg-blue-800/70 rounded-lg p-3 border border-blue-400/30">
                    <p className="font-semibold text-yellow-400 text-sm">Quick Fix for Issues:</p>
                    <p className="text-blue-100 text-sm">
                      Navigate home and refresh browser to resolve most beta glitches.
                    </p>
                  </div>
                  
                  <p className="text-white/90 font-semibold">
                    Thank you for joining this movement. Together, we're bringing transparency to an industry that has operated in darkness for too long.
                  </p>
                  
                  <div className="pt-2">
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold animate-pulse">
                      NOW LIVE: USA • MEXICO • CANADA
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* TODAY, EVERYTHING CHANGES - Historic Launch Message with Care Spectrum */}
      <section 
        className="relative overflow-hidden min-h-[900px]"
        style={{
          backgroundImage: `url('${lighthouseBackground}')`,
          backgroundColor: '#f3b585',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        
        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-between min-h-[900px] px-4 py-8">
          
          {/* Top Header */}
          <div className="text-center pt-4">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-2 drop-shadow-2xl">
              TODAY, EVERYTHING CHANGES
            </h2>
            <p className="text-2xl md:text-3xl text-gray-200 font-bold drop-shadow-lg mb-4">
              The Darkness in Senior Living Ends Now
            </p>
          </div>
          
          {/* Care Spectrum Evolution Circle - full width */}
          <div className="flex items-center justify-center px-1 flex-1">
            <div className="care-evolution-circle" style={{ width: '98vw', height: '88vh' }}>
              
              {/* Center Text */}
              <div className="care-evolution-center">
                <p className="text-white font-bold text-2xl mb-1" style={{ textShadow: '0 0 20px rgba(0,0,0,0.9)' }}>10-Level</p>
                <p className="text-white font-bold text-3xl" style={{ textShadow: '0 0 20px rgba(0,0,0,0.9)' }}>Care</p>
                <p className="text-white font-bold text-2xl" style={{ textShadow: '0 0 20px rgba(0,0,0,0.9)' }}>Spectrum</p>
              </div>
              
              {/* Care Items positioned in circle - properly distributed */}
              {/* Top */}
              <div className="care-evolution-item" style={{ top: '0%', left: '50%', transform: 'translateX(-50%)' }}>
                <Building2 className="w-8 h-8 mb-1 text-white" />
                <span className="text-sm text-white font-bold">HUD</span>
              </div>
              
              {/* Top Right */}
              <div className="care-evolution-item" style={{ top: '15%', right: '15%' }}>
                <Shield className="w-8 h-8 mb-1 text-white" />
                <span className="text-sm text-white font-bold">VA</span>
              </div>
              
              {/* Right */}
              <div className="care-evolution-item" style={{ top: '45%', right: '0%' }}>
                <Truck className="w-8 h-8 mb-1 text-white" />
                <span className="text-sm text-white font-bold">Mobile</span>
              </div>
              
              {/* Bottom Right */}
              <div className="care-evolution-item" style={{ bottom: '20%', right: '10%' }}>
                <Flag className="w-8 h-8 mb-1 text-white" />
                <span className="text-sm text-white font-bold">55+</span>
              </div>
              
              {/* Bottom Right-Center */}
              <div className="care-evolution-item" style={{ bottom: '5%', right: '28%' }}>
                <Home className="w-8 h-8 mb-1 text-white" />
                <span className="text-sm text-white font-bold">Independent</span>
              </div>
              
              {/* Bottom Center */}
              <div className="care-evolution-item" style={{ bottom: '0%', left: '50%', transform: 'translateX(-50%)' }}>
                <Building className="w-8 h-8 mb-1 text-white" />
                <span className="text-sm text-white font-bold">Board & Care</span>
              </div>
              
              {/* Bottom Left-Center */}
              <div className="care-evolution-item" style={{ bottom: '5%', left: '28%' }}>
                <HeartHandshake className="w-8 h-8 mb-1 text-white" />
                <span className="text-sm text-white font-bold">Assisted</span>
              </div>
              
              {/* Bottom Left */}
              <div className="care-evolution-item" style={{ bottom: '20%', left: '10%' }}>
                <Brain className="w-8 h-8 mb-1 text-white" />
                <span className="text-sm text-white font-bold">Memory</span>
              </div>
              
              {/* Left */}
              <div className="care-evolution-item" style={{ top: '45%', left: '0%' }}>
                <RefreshCw className="w-8 h-8 mb-1 text-white" />
                <span className="text-sm text-white font-bold">CCRC</span>
              </div>
              
              {/* Top Left */}
              <div className="care-evolution-item" style={{ top: '15%', left: '15%' }}>
                <Stethoscope className="w-8 h-8 mb-1 text-white" />
                <span className="text-sm text-white font-bold">Skilled</span>
              </div>
            </div>
          </div>
          
          {/* Bottom Text */}
          <div className="text-center pb-8">
            <p className="text-xl md:text-2xl text-white mb-4">
              Finally understand every option, every transition, every cost
            </p>
            <p className="text-lg text-gray-300 mb-6">
              Complete care continuum from independent to full medical support
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-base font-bold shadow-2xl animate-pulse">
              <Sparkles className="w-5 h-5 mr-2" />
              NOW LIVE ACROSS USA • MEXICO • CANADA
              <Sparkles className="w-5 h-5 ml-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Content Section */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/98 backdrop-blur-sm shadow-2xl border-0">
            <CardContent className="p-10 md:p-14">
              <div className="space-y-8">
                {/* The Light Section */}
                <div className="bg-white rounded-xl p-8 border-2 border-green-400">
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
                    <h3 className="text-2xl md:text-3xl font-bold text-black dark:text-green-300">
                      THIS STOPS NOW - COMPLETE CARE SPECTRUM FOR ALL
                    </h3>
                    <p className="text-lg text-black/90 dark:text-gray-100 mt-2 font-medium">
                      Master all 10+ levels of care. Real pricing, real availability. <span className="font-bold text-orange-950 dark:text-amber-300">No hidden fees, no referral markups, no communication floods.</span> Welcome to complete transparency.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-black dark:text-gray-100">Learn All 10 Levels of Care</p>
                          <p className="text-black/80 dark:text-gray-200 text-sm">From HUD Housing to Skilled Nursing - understand all 10 care levels, pricing ranges, and when each applies to your family's needs.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-black dark:text-gray-100">Real Pricing, Real Availability</p>
                          <p className="text-black/80 dark:text-gray-200 text-sm">Actual prices. Current availability. No more "contact us" gatekeeping.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-black dark:text-gray-100">ALL Families Get PLATINUM Features Free</p>
                          <p className="text-black/80 dark:text-gray-200 text-sm">Every family gets our complete PLATINUM toolkit. No tiers. No upgrades. Always free, guaranteed forever.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-black dark:text-gray-100">Shareable Tour Tracker - Hyper Rich Reviews</p>
                          <p className="text-black/80 dark:text-gray-200 text-sm">Our transparency tool prevents high prices from hiding behind lagging online reviews. Share your real tour experiences to help others see the truth.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-black dark:text-gray-100">Tour Tracker with Family Sharing</p>
                          <p className="text-black/80 dark:text-gray-200 text-sm">Track every tour, save notes, build comparisons. Share instantly with family members for collaborative decisions.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-black dark:text-gray-100">Communities Shine Bright</p>
                          <p className="text-black/80 dark:text-gray-200 text-sm">Every facility can represent itself honestly. No more hiding great care in the shadows.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-black dark:text-gray-100">Discover Benefits You Qualify For</p>
                          <p className="text-black/80 dark:text-gray-200 text-sm">VA Aid & Attendance, Medicaid, state programs - we help you find and understand all available assistance.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>



                <div className="pt-6">
                  <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-blue-400 dark:to-purple-400">
                    To every family searching in the dark: The lights are on now.
                  </p>
                  <p className="text-lg md:text-xl text-gray-900 dark:text-gray-300 mt-4">
                    <strong>You deserve the truth. Communities deserve to be found. The darkness ends today.</strong>
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-base md:text-lg text-gray-900 dark:text-gray-200 mb-6 font-bold">
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
                  
                  {/* Flex container for side-by-side layout */}
                  <div className="flex gap-3 mb-6">
                    {/* Left side - Provider count and Checkmarks */}
                    <div className="space-y-2 flex-shrink-0 min-w-fit">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">6,800+</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Providers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">1,956 CMS Hospitals</span>
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
                    
                    {/* Right side - Maximum Height Scrollable Preview */}
                    <div className="flex-1 ml-2 p-3 bg-gradient-to-br from-teal-50/50 to-blue-50/50 dark:from-teal-900/10 dark:to-blue-900/10 rounded-lg">
                      <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2 uppercase tracking-wide flex items-center gap-1">
                        <span>🏥</span> Preview
                      </p>
                      <div className="h-52 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-teal-300 dark:scrollbar-thumb-teal-600 scrollbar-track-transparent">
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏥</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">CMS Hospitals (1,956)</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏠</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Respite Care (561)</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">💊</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Personal Care Services (470)</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🩺</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Home Care Services (191)</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🔬</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Therapy Services (144)</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🌿</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Hospice Care (78)</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏥</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Adult Day Programs (707)</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🦴</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Physical Therapy</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🧠</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Memory Care Centers</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🗣️</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Speech Therapy</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🎯</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Occupational Therapy</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🦽</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Medical Equipment Suppliers</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">💉</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Infusion Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🩹</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Wound Care Centers</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🔬</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Dialysis Centers</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏥</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Urgent Care Clinics</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🦷</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Senior Dental Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">👁️</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Vision Care Centers</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🎧</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Hearing Centers</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🧘</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Pain Management</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🫀</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Cardiac Rehabilitation</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🫁</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Pulmonary Rehab</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🦴</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Orthopedic Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🧬</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Lab Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">📸</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Imaging Centers</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">💊</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Specialty Pharmacies</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🩺</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Geriatric Specialists</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🧠</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Neurological Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🦶</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Podiatry Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🌟</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Palliative Care</p>
                        </div>
                      </div>
                      <p className="text-xs text-center text-teal-600 dark:text-teal-400 mt-2 font-medium">
                        +more providers
                      </p>
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
                  
                  {/* Flex container for side-by-side layout */}
                  <div className="flex gap-3 mb-6">
                    {/* Left side - Resource count and Checkmarks */}
                    <div className="space-y-2 flex-shrink-0 min-w-fit">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">100+</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Resources</span>
                      </div>
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
                    
                    {/* Right side - Maximum Height Scrollable Preview */}
                    <div className="flex-1 ml-2 p-3 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-lg">
                      <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2 uppercase tracking-wide flex items-center gap-1">
                        <span>📋</span> Preview
                      </p>
                      <div className="h-52 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-600 scrollbar-track-transparent">
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏛️</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Medicare</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">💰</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Social Security</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏥</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Medicaid</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🎖️</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Veterans Affairs</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🍽️</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">SNAP Benefits</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏠</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">HUD Housing</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">📞</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Elder Helpline</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">⚕️</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Prescription Assistance</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🚐</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Transportation Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">📚</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Legal Aid</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🤝</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Alzheimer's Support</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏪</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Meals on Wheels</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">💊</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Medicare Part D</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🦴</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Osteoporosis Resources</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🧠</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Memory Care Info</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🌡️</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Home Health Care</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏃</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Senior Fitness Programs</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🎨</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Adult Day Programs</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏡</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Aging in Place Guide</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">👥</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Caregiver Resources</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">💸</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">SSI Benefits</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">📋</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Long-Term Care Insurance</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏛️</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">State Aging Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🆘</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Emergency Alert Systems</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🌿</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Hospice Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🦷</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Dental Assistance</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">👓</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Vision Care Programs</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🎧</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Hearing Aid Resources</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏢</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Senior Centers</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">💼</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">PACE Programs</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏦</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Reverse Mortgages</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🎯</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Care Coordination</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">📝</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Advance Directives</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏛️</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Area Agencies on Aging</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🌡️</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">LIHEAP Energy Assistance</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">📱</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Lifeline Phone Service</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🎓</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Senior Education Programs</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏥</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Medicare Advantage</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🌟</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Silver Sneakers</p>
                        </div>
                      </div>
                      <p className="text-xs text-center text-purple-600 dark:text-purple-400 mt-2 font-medium">
                        +59 more resources
                      </p>
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


















      {/* Care Marketplace Section - Removed and consolidated into Senior Healthcare Services Directory */}

      {/* Hospital Directory Section - Removed and consolidated into Senior Healthcare Services Directory */}
      {/* Government Resources Section - Removed and consolidated into Senior Resources Center page */}

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

      {/* Emergency Quick Access Section - Moved above mission for better flow */}
      <section className="px-4 py-8 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-y-2 border-red-200 dark:border-red-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left side - Emergency Information */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-900 dark:text-red-100">
                    One-Touch Emergency Access
                  </h2>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Quick access to 911 and your personal emergency contacts
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our emergency contact system provides instant access to critical phone numbers when you need them most. 
                Save your family contacts, medical providers, and facility numbers for one-touch dialing.
              </p>
            </div>
            
            {/* Right side - Quick Access Numbers */}
            <div className="flex gap-4">
              {/* 911 Button */}
              <a 
                href="tel:911"
                className="flex flex-col items-center justify-center p-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <AlertCircle className="h-8 w-8 mb-2" />
                <span className="text-2xl font-bold">911</span>
                <span className="text-xs">Emergency</span>
              </a>
              
              {/* Poison Control */}
              <a 
                href="tel:18002221222"
                className="flex flex-col items-center justify-center p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <Pill className="h-8 w-8 mb-2" />
                <span className="text-lg font-bold">Poison</span>
                <span className="text-xs">1-800-222-1222</span>
              </a>
              
              {/* Crisis Hotline */}
              <a 
                href="tel:988"
                className="flex flex-col items-center justify-center p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <Heart className="h-8 w-8 mb-2" />
                <span className="text-2xl font-bold">988</span>
                <span className="text-xs">Crisis Line</span>
              </a>
            </div>
          </div>
          
          {/* Notice */}
          <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> Look for the red emergency button in the bottom-right corner of your screen for instant access to all emergency contacts. 
                Create an account to save your personal emergency contacts for quick dialing.
              </p>
            </div>
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
      
      {/* One-Touch Emergency Contact Shortcut - DISABLED to prevent React rendering failure */}
      {/* <EmergencyButton userId={undefined} /> */}
      
      {/* Onboarding Wizard - DISABLED: Prototype for future development */}
      {/* <OnboardingWrapper /> */}
    </div>
  );
}
