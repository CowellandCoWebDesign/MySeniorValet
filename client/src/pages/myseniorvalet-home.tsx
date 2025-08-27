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
import { Search, Heart, MapPin, Star, Home, Building2, DollarSign, Users, Info, MessageCircle, Link2, Truck, Sofa, Pill, Eye, Clock, Phone, Brain, Sparkles, Building, Ambulance, Package, CheckCircle, CheckSquare, Stethoscope, Activity, ShieldCheck, Scale, Utensils, Car, Scissors, Users2, FileText, Calculator, ShoppingCart, Trash2, Flower, TrendingUp, Shield, ArrowRight, Shirt as ShirtIcon, RefreshCw, ExternalLink, Globe, HeartHandshake, ChevronRight, ChevronLeft, BarChart, BarChart3, Calendar, X, Flag, Languages, Layers, ShoppingBasket, AlertCircle, Briefcase, LogIn, UserCheck, Smartphone, BookOpen, ShoppingBag, GraduationCap, MessageSquare, Monitor, Flame, Filter, XCircle, Unlock, Book, Music, Send } from "lucide-react";
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
import { HeroMascotPanel } from '@/components/mascot/HeroMascotPanel';
// Image paths from public directory
const heroBackgroundImage = '/starry-night-hero.png';

import { EmergencyButton } from "@/components/EmergencyButton";




export default function MySeniorValetHome() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  
  // Set SEO metadata for home page
  useSEO({
    title: 'Senior Living Made Simple - Find Communities, Real Pricing, No Hidden Fees',
    description: 'Search 36,000+ senior living communities across USA, Canada, Mexico, Peru & Cuba with transparent pricing, verified HUD rates, and real availability. Compare assisted living, memory care, nursing homes. Free tour scheduling, family sharing tools, and senior resources.',
    keywords: 'senior living, assisted living, memory care, nursing homes, HUD senior housing, independent living, retirement communities, elder care, senior care facilities, Medicare, Medicaid, VA benefits, Canadian senior homes',
    canonicalUrl: 'https://www.myseniorvalet.com/'
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showProtectionModal, setShowProtectionModal] = useState(false);
  const [protectionSearchQuery, setProtectionSearchQuery] = useState('');
  const [showRemovalModal, setShowRemovalModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { preferences, togglePreference } = useAccessibilityPreferences();
  
  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // 3D Carousel state
  const [currentRotation, setCurrentRotation] = useState(0);
  const [selectedCareType, setSelectedCareType] = useState(2); // Start with 55+ selected
  const [touchStartX, setTouchStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const careTypes = [
    { 
      id: 'hud', 
      name: 'HUD', 
      icon: Building2, 
      color: 'bg-green-500', 
      description: 'Government-subsidized housing for low-income seniors, offering rent based on 30% of income with verified pricing.',
      details: 'Income-based rent • Federal oversight • Accessibility features',
      avgCost: '$300-900/month',
      keyFeatures: ['Income-based rent (30% of income)', 'Government subsidized', 'Accessible units available']
    },
    { 
      id: 'va', 
      name: 'VA', 
      icon: Shield, 
      color: 'bg-purple-600', 
      description: 'Veterans Affairs communities providing specialized care and benefits for military veterans and their spouses.',
      details: 'Military benefits • Medical services • Honor programs',
      avgCost: 'Varies by service connection',
      keyFeatures: ['Veterans benefits', 'Specialized medical care', 'Service-connected priority']
    },
    { 
      id: 'mobile', 
      name: 'RV & Mobile', 
      icon: Truck, 
      color: 'bg-orange-500', 
      description: 'Senior RV and mobile parks offering flexible living for adventurous retirees who enjoy travel and community amenities.',
      details: 'Lot rent • Community amenities • Flexible lifestyle',
      avgCost: '$400-1,200/month lot rent',
      keyFeatures: ['Own your home', 'Community lifestyle', 'Lower maintenance costs']
    },
    { 
      id: '55plus', 
      name: '55+', 
      icon: Flag, 
      color: 'bg-pink-600', 
      description: 'Age-restricted active adult communities for those 55 and older, focusing on lifestyle and social activities.',
      details: 'Active lifestyle • Social programs • Age-restricted',
      avgCost: '$1,500-3,500/month',
      keyFeatures: ['Age 55+ requirement', 'Active lifestyle focus', 'Golf, pools, activities']
    },
    { 
      id: 'independent', 
      name: 'Independent', 
      icon: Home, 
      color: 'bg-blue-600', 
      description: 'Senior apartments and communities for those who can live independently with minimal assistance and optional services.',
      details: 'Self-sufficient living • Optional services • Social activities',
      avgCost: '$2,000-4,500/month',
      keyFeatures: ['Full kitchen & bath', 'Maintenance-free', 'Social activities included']
    },
    { 
      id: 'residential', 
      name: 'Residential Care', 
      icon: Building, 
      color: 'bg-purple-700', 
      description: 'Small, privately-run homes with 6-10 beds offering personalized care in a family-like residential setting.',
      details: 'Home-like setting • Personal care • Small group living',
      avgCost: '$3,000-5,500/month',
      keyFeatures: ['6-10 residents only', 'Family atmosphere', 'Personalized attention']
    },
    { 
      id: 'assisted', 
      name: 'Assisted', 
      icon: HeartHandshake, 
      color: 'bg-cyan-600', 
      description: 'Communities providing help with daily activities like bathing, dressing, and medication management.',
      details: 'ADL assistance • Medication management • 24/7 staff',
      avgCost: '$4,500-7,000/month',
      keyFeatures: ['Help with daily tasks', 'Medication management', '24-hour staffing']
    },
    { 
      id: 'memory', 
      name: 'Memory', 
      icon: Brain, 
      color: 'bg-red-600', 
      description: 'Specialized secure environments for those with Alzheimer\'s, dementia, and other memory-related conditions.',
      details: 'Secure environment • Specialized programs • Expert staff',
      avgCost: '$5,500-9,000/month',
      keyFeatures: ['Secure unit', 'Memory care certified', 'Specialized activities']
    },
    { 
      id: 'ccrc', 
      name: 'CCRC', 
      icon: RefreshCw, 
      color: 'bg-indigo-600', 
      description: 'Continuing Care Retirement Communities offering all levels of care from independent to skilled nursing in one location.',
      details: 'Lifetime care • Multiple levels • Single campus',
      avgCost: 'Entry: $100K-500K + Monthly',
      keyFeatures: ['All care levels', 'Age in place', 'Healthcare guarantee']
    },
    { 
      id: 'skilled', 
      name: 'Skilled', 
      icon: Stethoscope, 
      color: 'bg-teal-600', 
      description: '24-hour medical care and rehabilitation services provided by licensed nurses and healthcare professionals.',
      details: '24/7 nursing • Rehab services • Medical equipment',
      avgCost: '$8,000-12,000/month',
      keyFeatures: ['24-hour nursing', 'Physical therapy', 'Complex medical needs']
    }
  ];
  
  const handleCareTypeClick = (index: number) => {
    setSelectedCareType(index);
  };

  // Touch/swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touchEndX = e.touches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > 50) { // Threshold for swipe
      if (diff > 0) {
        // Swipe left - next item
        setSelectedCareType(prev => (prev + 1) % careTypes.length);
      } else {
        // Swipe right - previous item
        setSelectedCareType(prev => prev === 0 ? careTypes.length - 1 : prev - 1);
      }
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const diff = touchStartX - e.clientX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setSelectedCareType(prev => (prev + 1) % careTypes.length);
      } else {
        setSelectedCareType(prev => prev === 0 ? careTypes.length - 1 : prev - 1);
      }
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };


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
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-4 hover:opacity-80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
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
                        <Link href="/map-search" className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700">
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

      {/* Hero Section with Search - Mobile optimized */}
      <section className="relative min-h-[600px] sm:min-h-screen bg-black pt-12 sm:pt-14">
        <div className="absolute inset-0">
          <img
            src={heroBackgroundImage}
            alt="Professional gentleman presenting under starry night sky - Your guide to senior living transparency"
            className="w-full h-full object-cover object-top sm:object-center"
            loading="eager"
          />
          {/* Enhanced darkening for better text readability on mobile */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 sm:via-transparent to-black/60"></div>
        </div>
        
        <div className="relative hero-content min-h-[600px] sm:min-h-screen pt-2 sm:pt-3 md:pt-4 pb-20 sm:pb-4 mobile-keyboard-safe flex flex-col px-2 sm:px-4">
          
          {/* Hero Text Section - Mobile optimized */}
          <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 md:px-8 mt-2 sm:mt-8 md:mt-12 mb-3 sm:mb-6 text-center">
            {/* Main Heading - Better sizing for all screens */}
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 animate-fade-in-up drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] sm:drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] leading-tight">
              Everything You Need.<br className="sm:hidden" /> Nothing You Pay.
            </h1>
            
            {/* Key Features - Bullet points for better readability */}
            <div className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 sm:text-gray-200 max-w-4xl mx-auto animate-fade-in-up animation-delay-300 px-2">
              <div className="hidden sm:block text-left inline-block">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-300 mr-2 mt-1">•</span>
                    <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">We NEVER sell your info or require it to show you all options</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-300 mr-2 mt-1">•</span>
                    <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Search 35,000+ communities globally with real pricing & trusted reviews</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-300 mr-2 mt-1">•</span>
                    <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Access 1,000's of move-in services, healthcare providers & support resources</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-300 mr-2 mt-1">•</span>
                    <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">A platform built for families, not profits 💙</span>
                  </li>
                </ul>
              </div>
              <div className="sm:hidden text-center">
                <p className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Search 35,000+ communities with real pricing and trusted reviews. No fees, no data selling. Welcome to MySeniorValet 💙</p>
              </div>
            </div>
          </div>
          
          {/* Search bar positioned higher up - Mobile optimized */}
          <div className="flex-grow flex items-start justify-center pt-2 sm:pt-8 md:pt-12">
            <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-8">
              {/* Search Bar - Mobile responsive */}
            <div className="w-full max-w-xl sm:max-w-2xl mx-auto px-2 sm:px-4 md:px-6 mb-2 sm:mb-3 animate-fade-in-up animation-delay-200" style={{ position: 'relative', zIndex: 99999 }}>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery) {
                  window.location.href = `/map-search?q=${encodeURIComponent(searchQuery)}`;
                }
              }}>
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl" style={{ overflow: 'visible' }}>
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
                        placeholder={isMobile ? 'Search communities...' : t('hero.searchPlaceholder')}
                        hideSearchButton={true}
                        inputClassName="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-2 sm:py-3 text-sm sm:text-base border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                    <div className="hidden sm:flex items-center mr-2">
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 text-xs px-3 py-1 font-semibold">
                        AI-Powered
                      </Badge>
                    </div>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-1.5 sm:p-2 m-1.5 sm:m-2 rounded-lg transition-all flex items-center justify-center shadow-md hover:shadow-lg"
                    >
                      <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Trust Indicators - Mobile responsive */}
            <div className="animate-fade-in-up animation-delay-300 flex justify-center items-center px-2">
              <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2">
                {/* Live Pricing Badge */}
                <span className="inline-flex items-center space-x-1 bg-gray-800/90 backdrop-blur-md px-2 sm:px-3 py-1 rounded-full shadow-md">
                  <DollarSign className="h-2 w-2 sm:h-3 sm:w-3 text-green-400 animate-pulse flex-shrink-0" />
                  <span className="text-[9px] sm:text-[10px] font-semibold text-white">Live Pricing</span>
                </span>
                
                {/* Community Reported Badge */}
                <span className="inline-flex items-center space-x-1 bg-gray-800/90 backdrop-blur-md px-2 sm:px-3 py-1 rounded-full shadow-md">
                  <Users2 className="h-2 w-2 sm:h-3 sm:w-3 text-green-300 flex-shrink-0" />
                  <span className="text-[9px] sm:text-[10px] font-semibold text-white">Family Reviews</span>
                </span>
                
                {/* AI Orchestration Badge - Hide on very small screens */}
                <span className="inline-flex items-center space-x-1 bg-gray-800/90 backdrop-blur-md px-2 sm:px-3 py-1 rounded-full shadow-md">
                  <Brain className="h-2 w-2 sm:h-3 sm:w-3 text-purple-300 animate-pulse flex-shrink-0" />
                  <span className="text-[9px] sm:text-[10px] font-semibold text-white hidden xs:inline">Live Availability</span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-white xs:hidden">Live</span>
                </span>
                
                {/* AI Orchestra Badge - Hide on mobile */}
                <span className="hidden sm:inline-flex items-center space-x-1 bg-gradient-to-r from-purple-800/90 to-indigo-800/90 backdrop-blur-md px-3 py-1 rounded-full shadow-md border border-purple-400/30">
                  <Music className="h-3 w-3 text-yellow-300 animate-pulse flex-shrink-0" />
                  <span className="text-[10px] font-semibold text-white">AI Triple-Verified</span>
                </span>
              </div>
            </div>
            </div>
          </div>
          {/* End centered positioning */}
          
        </div>
        {/* End Hero Content */}
        
        {/* Hero Mascot Panel - Hidden on mobile to prevent overlap */}
        <HeroMascotPanel className="hidden sm:block absolute bottom-4 left-0 right-0 z-30" />
        
      </section>



      {/* Personalized Banner */}
      <div className="px-4 py-6 bg-gradient-to-r from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <PersonalizedBanner />
        </div>
      </div>


      {/* Four Directory Cards Grid - Seamlessly Connected */}
      <section className="px-4 py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto">
            {/* Four Directory Cards in 2x2 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* Community Directory */}
            <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-blue-500 relative overflow-hidden group transform hover:scale-105 cursor-pointer" onClick={(e) => {
              // Only navigate if clicking on the card background, not buttons
              const target = e.target as HTMLElement;
              if (e.target === e.currentTarget || !target.closest('button')) {
                window.location.href = '/community-directory';
              }
            }}>
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
                  <CardTitle className="text-2xl mb-2">AI-Powered Community Directory</CardTitle>
                  <CardDescription className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Self-Healing Database with On-Demand Intelligence
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Revolutionary AI enrichment system that automatically improves data quality in real-time. Our self-healing architecture detects and corrects errors, enriches content on-demand, and guarantees true transparency without hidden fees or paywalls.
                  </p>

                  {/* Community count matching other cards */}
                  <div className="inline-flex items-center gap-2 mb-6 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">33,137+</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">AI-Enhanced Communities</span>
                  </div>

                  {/* Flex container for side-by-side layout */}
                  <div className="flex gap-3 mb-6">
                    {/* Left side - AI Features */}
                    <div className="space-y-2 flex-shrink-0 min-w-fit">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0 animate-pulse" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">AI On-Demand Enrichment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Self-Healing Database</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">100% Transparency</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Real-Time Web Scraping</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Duplicate Auto-Removal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">No Hidden Fees Ever</span>
                      </div>
                    </div>
                    
                    {/* Right side - Global Coverage Areas Preview */}
                    <div className="flex-1 ml-2 p-3 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wide flex items-center gap-1">
                        <span>🌍</span> Global Coverage
                      </p>
                      <div className="h-44 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-600 scrollbar-track-transparent">
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🇺🇸</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">USA (28,348)</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🇨🇦</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Canada (6,780)</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🇦🇺</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Australia (2,231)</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🇲🇽</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Mexico (405)</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🇯🇵</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Japan (67)</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🇨🇺</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Cuba (12)</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🇵🇪</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Peru (10)</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🇨🇷</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Costa Rica (5)</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🇵🇦</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Panama (5)</p>
                        </div>
                      </div>
                      <p className="text-xs text-center text-blue-600 dark:text-blue-400 mt-2 font-medium">
                        9 Countries • 3 Continents
                      </p>
                    </div>
                  </div>

                  {/* Horizontal Action Buttons Row */}
                  <div className="mb-4 grid grid-cols-4 gap-2">
                    {/* Traditional Search */}
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = '/map-search';
                      }}
                      className="h-auto bg-gray-800 hover:bg-gray-700 text-white px-2 py-2 rounded-md font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 border border-gray-600">
                      <div className="flex flex-col items-center">
                        <Search className="h-5 w-5 mb-1" />
                        <div className="text-[10px] font-semibold leading-tight">Traditional Browse</div>
                        <div className="text-[8px] text-gray-400 leading-tight">Filter & Sort</div>
                      </div>
                    </Button>

                    {/* AI Intelligence */}
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = '/ai-search-intelligence?mode=simplified';
                      }}
                      className="h-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-2 py-2 rounded-md font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
                      <div className="flex flex-col items-center">
                        <Sparkles className="h-5 w-5 mb-1" />
                        <div className="text-[10px] font-semibold leading-tight">AI Assistant</div>
                        <div className="text-[8px] text-white/80 leading-tight">Ask Questions</div>
                      </div>
                    </Button>

                    {/* Live Heatmap */}
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = '/availability-heatmap';
                      }}
                      className="h-auto bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 text-white px-2 py-2 rounded-md font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
                      <div className="flex flex-col items-center">
                        <Flame className="h-5 w-5 mb-1 animate-pulse" />
                        <div className="text-[10px] font-semibold leading-tight">Live Heatmap</div>
                        <div className="text-[8px] text-white/80 leading-tight">Availability Now</div>
                      </div>
                    </Button>

                    {/* Market Analysis */}
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = '/competitive-analysis';
                      }}
                      className="h-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white px-2 py-2 rounded-md font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
                      <div className="flex flex-col items-center">
                        <TrendingUp className="h-5 w-5 mb-1" />
                        <div className="text-[10px] font-semibold leading-tight">Market Analysis</div>
                        <div className="text-[8px] text-white/80 leading-tight">Price Compare</div>
                      </div>
                    </Button>
                  </div>

                  {/* AI Intelligence Box */}
                  <div className="mb-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="flex items-start gap-3">
                      <Brain className="h-6 w-6 text-purple-600 flex-shrink-0 animate-pulse" />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-purple-900 dark:text-purple-100 mb-1">AI-Powered Intelligence</h4>
                        <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                          Our revolutionary system enriches data only when you search, saving costs while ensuring information is always fresh. 
                          Features automatic duplicate removal, address correction, real-time photo collection, and comprehensive amenity extraction. 
                          Every community gets smarter with each search!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3D Care Spectrum Mini Carousel */}
                  <div className="mb-6 overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-4">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">EXPLORE 10 CARE LEVELS</p>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {careTypes.map((careType, index) => {
                        const Icon = careType.icon;
                        return (
                          <div
                            key={careType.id}
                            className={`flex-shrink-0 ${careType.color} rounded-lg p-3 w-32 cursor-pointer hover:scale-105 transition-transform`}
                            onClick={() => setLocation(`/care-types/${careType.id}`)}
                          >
                            <div className="flex flex-col items-center">
                              <Icon className="w-8 h-8 text-white mb-1" />
                              <p className="text-xs font-bold text-white text-center leading-tight">{careType.name}</p>
                              <p className="text-[9px] text-white/80 text-center mt-1">{careType.avgCost}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = '/community-directory';
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white hover:opacity-90 group-hover:shadow-lg transition-all relative overflow-hidden">
                    <span className="absolute inset-0 bg-white/20 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                    <span className="font-semibold">Launch AI-Enhanced Directory</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>

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
                  
                  {/* Flex container for side-by-side layout */}
                  <div className="flex gap-3 mb-6">
                    {/* Left side - Vendor count and Checkmarks */}
                    <div className="space-y-2 flex-shrink-0 min-w-fit">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">1,500+</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Vendors</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Moving & Relocation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Legal & Financial</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Transportation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Personal Services</span>
                      </div>
                    </div>
                    
                    {/* Right side - Maximum Height Scrollable Preview */}
                    <div className="flex-1 ml-2 p-3 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-lg">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2 uppercase tracking-wide flex items-center gap-1">
                        <span>🛒</span> Preview
                      </p>
                      <div className="h-52 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-amber-300 dark:scrollbar-thumb-amber-600 scrollbar-track-transparent">
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🚚</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Senior Moving Companies</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">📦</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Downsizing Specialists</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">⚖️</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Elder Law Attorneys</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">💼</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Estate Planning</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏛️</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Financial Advisors</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🚗</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Medical Transportation</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🌸</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Florists & Gift Shops</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏠</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Home Modification</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🔒</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Insurance Brokers</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏦</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Veterans Benefits Assistance</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏡</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Real Estate Agents</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🧹</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Cleaning Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">✂️</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Beauty & Barber Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">👕</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Laundry Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">📸</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Portrait Photography</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🎉</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Event Planning</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🐕</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Pet Care Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">⛪</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Spiritual Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">📚</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Library Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🎭</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Entertainment Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🍴</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Catering Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">📱</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Tech Support Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏋️</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Fitness Trainers</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🎨</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Art & Craft Supplies</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🏪</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Grocery Delivery</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">💐</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Memorial Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">📝</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Notary Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🔧</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Handyman Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🚐</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Shuttle Services</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xs">🎁</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Gift Concierge</p>
                        </div>
                      </div>
                      <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-2 font-medium">
                        +more vendors
                      </p>
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

            {/* Family & Partner Services Section - NEW ROW */}
            {/* Family Collaboration Center Card */}
            <Link href="/family-collaboration">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-rose-400 relative overflow-hidden group transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 opacity-50"></div>
                <CardHeader className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg">
                      <Users className="h-8 w-8" />
                    </div>
                    <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1">
                      FAMILIES
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">Family Collaboration Center</CardTitle>
                  <CardDescription className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tour Planning & Communication Hub
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Coordinate senior care decisions with TourMate™ scheduling, Tour Tracker reports, and family messaging.
                  </p>
                  
                  {/* Flex container for side-by-side layout */}
                  <div className="flex gap-3 mb-6">
                    {/* Left side - Key Features and Checkmarks */}
                    <div className="space-y-2 flex-shrink-0 min-w-fit">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-5 w-5 text-rose-500 animate-pulse" />
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">TourMate™</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">System</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Schedule Tours Together</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Tour Tracker Reports</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Instant Messaging</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Share Favorites</span>
                      </div>
                    </div>
                    
                    {/* Right side - Features Preview */}
                    <div className="flex-1 ml-2 p-3 bg-gradient-to-br from-rose-50/50 to-pink-50/50 dark:from-rose-900/10 dark:to-pink-900/10 rounded-lg">
                      <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 mb-2 uppercase tracking-wide flex items-center gap-1">
                        <span>👨‍👩‍👧‍👦</span> Family Tools
                      </p>
                      <div className="h-52 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-rose-300 dark:scrollbar-thumb-rose-600 scrollbar-track-transparent">
                        <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-rose-600" />
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Tour Scheduler</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Book tours at multiple communities</p>
                        </div>
                        <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-rose-600" />
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Tour Reports</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Compare visits side-by-side</p>
                        </div>
                        <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-3 w-3 text-rose-600" />
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Family Chat</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Private family discussions</p>
                        </div>
                        <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded">
                          <div className="flex items-center gap-2">
                            <Heart className="h-3 w-3 text-rose-600" />
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Favorites List</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Save & share top choices</p>
                        </div>
                        <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-rose-600" />
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Distance Calculator</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">See drive times for family</p>
                        </div>
                        <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-rose-600" />
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Cost Comparison</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Budget analysis tools</p>
                        </div>
                        <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="h-3 w-3 text-rose-600" />
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Decision Matrix</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Pros & cons for each option</p>
                        </div>
                        <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-rose-600" />
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Notifications</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Tour reminders & updates</p>
                        </div>
                        <div className="mt-3 p-2 bg-gradient-to-r from-rose-500/20 to-pink-600/20 dark:from-rose-500/10 dark:to-pink-600/10 rounded border border-rose-300 dark:border-rose-700">
                          <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 text-center">🎯 100% FREE FOR FAMILIES</p>
                          <p className="text-xs text-rose-600 dark:text-rose-400 text-center mt-1">No fees, ever!</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-90 group-hover:shadow-lg transition-all">
                    <span className="font-semibold">Start Collaborating</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Community Onboarding Card */}
            <Link href="/community-portal">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-emerald-400 relative overflow-hidden group transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 opacity-50"></div>
                <CardHeader className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                      <Building className="h-8 w-8" />
                    </div>
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1">
                      COMMUNITIES
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">List Your Community</CardTitle>
                  <CardDescription className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {isLoading ? (
                      <span className="animate-pulse">Loading community count...</span>
                    ) : (
                      `Join ${communityStats?.count ? Number(communityStats.count).toLocaleString() : '35,000'}+ Communities`
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Reach qualified families actively searching for senior care. Get your verified listing.
                  </p>
                  
                  {/* Flex container for side-by-side layout */}
                  <div className="flex gap-3 mb-6">
                    {/* Left side - Pricing and Checkmarks */}
                    <div className="space-y-2 flex-shrink-0 min-w-fit">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="h-5 w-5 text-yellow-500 animate-pulse" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">Free</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">to Start</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">No Credit Card Required</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Tour Scheduler</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Analytics Dashboard</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Featured Placement</span>
                      </div>
                    </div>
                    
                    {/* Right side - Pricing Tiers Preview */}
                    <div className="flex-1 ml-2 p-3 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-lg">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2 uppercase tracking-wide flex items-center gap-1">
                        <span>💰</span> 4 Tier Options
                      </p>
                      <div className="h-52 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-emerald-300 dark:scrollbar-thumb-emerald-600 scrollbar-track-transparent">
                        <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Free Tier</p>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">$0/mo</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Basic listing, photos, contact info</p>
                        </div>
                        <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Bronze Tier</p>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">$149/mo</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Priority search, tour scheduler</p>
                        </div>
                        <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Silver Tier</p>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">$249/mo</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Featured placement, analytics</p>
                        </div>
                        <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Gold Tier</p>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">$349/mo</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Premium visibility, lead gen tools</p>
                        </div>
                        <div className="mt-3 p-2 bg-gradient-to-r from-green-500/20 to-emerald-600/20 dark:from-green-500/10 dark:to-emerald-600/10 rounded border border-green-300 dark:border-green-700">
                          <p className="text-xs font-semibold text-green-700 dark:text-green-300 text-center">🎉 INTRODUCTORY PRICING</p>
                          <p className="text-xs text-green-600 dark:text-green-400 text-center mt-1">Lock in rates now!</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 group-hover:shadow-lg transition-all">
                    <span className="font-semibold">Get Started</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Vendor Marketplace Card */}
            <Link href="/vendor-marketplace-tiers">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-indigo-400 relative overflow-hidden group transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 opacity-50"></div>
                <CardHeader className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg">
                      <Briefcase className="h-8 w-8" />
                    </div>
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1">
                      VENDORS
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">Vendor Partnership</CardTitle>
                  <CardDescription className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Join 1,500+ Service Providers
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Reach families nationwide with your senior care services across all markets.
                  </p>
                  
                  {/* Flex container for side-by-side layout */}
                  <div className="flex gap-3 mb-6">
                    {/* Left side - Special Offer and Checkmarks */}
                    <div className="space-y-2 flex-shrink-0 min-w-fit">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">50% OFF</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">First Month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Nationwide Coverage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Verified Badge</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Premium Analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Lead Generation</span>
                      </div>
                    </div>
                    
                    {/* Right side - Coverage Tiers Preview */}
                    <div className="flex-1 ml-2 p-3 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-lg">
                      <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2 uppercase tracking-wide flex items-center gap-1">
                        <span>🌎</span> Coverage Tiers
                      </p>
                      <div className="h-52 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-indigo-300 dark:scrollbar-thumb-indigo-600 scrollbar-track-transparent">
                        <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Basic (1 State)</p>
                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">$99/mo</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Single state coverage, basic listing</p>
                        </div>
                        <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Featured (3 States)</p>
                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">$249/mo</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Regional presence, priority placement</p>
                        </div>
                        <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">National Partner</p>
                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">$499/mo</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Nationwide reach, premium features</p>
                        </div>
                        <div className="mt-3 p-2 bg-gradient-to-r from-amber-500/20 to-orange-600/20 dark:from-amber-500/10 dark:to-orange-600/10 rounded border border-amber-300 dark:border-amber-700">
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 text-center">🚀 LIMITED TIME</p>
                          <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-1">20% OFF Annual Plans</p>
                        </div>
                        <div className="p-2 bg-gradient-to-r from-purple-500/20 to-indigo-600/20 dark:from-purple-500/10 dark:to-indigo-600/10 rounded border border-purple-300 dark:border-purple-700">
                          <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 text-center">Access to 34,171+ communities</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 group-hover:shadow-lg transition-all">
                    <span className="font-semibold">View Vendor Tiers</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Senior Living Command Center Section - Moved after Resources */}
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
                  <span className="text-sm font-semibold">AI-Powered Platform • FREE FOR FAMILIES ALWAYS</span>
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

      {/* Partnership Information Section - Simplified */}
      <section className="py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          {/* Partnership Disclaimer */}
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
