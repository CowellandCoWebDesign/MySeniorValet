import { useState, useEffect, useRef, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { FeaturedExcellenceCard } from "@/components/FeaturedExcellenceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
// Removed useDebounce - not needed with UnifiedSearch component
import { useAccessibilityPreferences } from "@/hooks/useAccessibilityPreferences";
import { Search, Heart, MapPin, Star, Home, Building2, DollarSign, Users, Info, MessageCircle, Link2, Truck, Sofa, Pill, Eye, Clock, Phone, Brain, Sparkles, Building, Ambulance, Package, CheckCircle, CheckSquare, Stethoscope, Activity, ShieldCheck, Scale, Utensils, UtensilsCrossed, Car, Bus, Scissors, Users2, FileText, Calculator, ShoppingCart, Trash2, Flower, TrendingUp, Shield, ArrowRight, Shirt as ShirtIcon, RefreshCw, ExternalLink, Globe, HeartHandshake, ChevronRight, ChevronLeft, BarChart, BarChart3, Calendar, X, Flag, Languages, Layers, ShoppingBasket, AlertCircle, AlertTriangle, AlertOctagon, Briefcase, LogIn, UserCheck, Smartphone, BookOpen, ShoppingBag, GraduationCap, MessageSquare, Monitor, Flame, Filter, XCircle, Unlock, Book, Music, Send, List, Wrench, Video, Gift, Hospital } from "lucide-react";
import { PrioritizedCommunityCard } from "@/components/PrioritizedCommunityCard";
import { VendorServiceCard } from "@/components/VendorServiceCard";
import { ServiceBadges, commonBadges } from "@/components/ServiceBadges";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PricingBreakdown } from "@/components/pricing-breakdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { CareServiceCard } from "@/components/CareServiceCard";
import { ProfessionalNavbar } from "@/components/ProfessionalNavbar";


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
import { MascotLoadingDisplay } from '@/components/MascotLoadingDisplay';
import { UnifiedSearch } from '@/components/UnifiedSearch';
import { AutocompleteSearch } from '@/components/AutocompleteSearch';
import { AIChatResponse } from '@/components/AIChatResponse';
import ComprehensiveSearch from '@/components/ComprehensiveSearch';
import LearnModeInterface from '@/components/LearnModeInterface';
import GracefulFallbackMessage from '@/components/GracefulFallbackMessage';
import { GlobalDiscoveryModal } from '@/components/GlobalDiscoveryModal';
import { DynamicSearchSEO } from '@/components/DynamicSearchSEO';
// Image paths from public directory
const heroBackgroundImage = '/starry-night-hero.png';
import thinkerSpaceImage from '@assets/generated_images/Thinker_statue_in_cosmic_space_86227ae1.png';
import sunsetThinkerHero from '@assets/generated_images/Sunset_Thinker_left_edge_1c0dfd6c.png';
import heroThinkerImage from '@assets/generated_images/Thinker_leftmost_boundary_observing_7dcdb3aa.png';
import MotelVacancySign from '@assets/generated_images/Motel_vacancy_sign_ae0ac2af.png';
import RetroMedicalSign from '@assets/generated_images/Retro_medical_clinic_neon_sign_bdc37a10.png';
import RetroShoppingSign from '@assets/generated_images/Retro_shopping_center_neon_sign_dbb6f040.png';
import RetroLibrarySign from '@assets/generated_images/Retro_library_resource_center_sign_c0d548ed.png';
import RetroFamilyLivingRoom from '@assets/generated_images/80s_Memphis_design_living_room_86518012.png';
import RetroGrandHotelMarquee from '@assets/generated_images/Retro_grand_hotel_marquee_51bb7e27.png';
import RetroVendorMarketplace from '@assets/generated_images/Retro_vendor_marketplace_sign_b412c8cc.png';
import RetroGuestServices from '@assets/generated_images/Retro_guest_services_sign_b951be1b.png';
import LuxuryValet from '@assets/generated_images/Luxury_valet_silhouette_b48f3fbd.png';

import { EmergencyButton } from "@/components/EmergencyButton";
import { VendorMarketplaceTabs } from "@/components/VendorMarketplaceTabs";

// Preload critical images immediately for faster loading
if (typeof document !== 'undefined') {
  // Preload hero background image with highest priority
  const heroLink = document.createElement('link');
  heroLink.rel = 'preload';
  heroLink.as = 'image';
  heroLink.href = "https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg";
  heroLink.type = 'image/jpeg';
  heroLink.fetchPriority = 'high';
  document.head.appendChild(heroLink);
  
  // Preload Thinker image for loading screens
  const thinkerLink = document.createElement('link');
  thinkerLink.rel = 'preload';
  thinkerLink.as = 'image';
  thinkerLink.href = thinkerSpaceImage;
  thinkerLink.type = 'image/png';
  document.head.appendChild(thinkerLink);
}

// Dynamic placeholder texts for search box
const SEARCH_PLACEHOLDERS = {
  discover: {
    communities: [
      "🌍 Try 'Senior Living in Paris' or 'Care Homes in Tokyo'...",
      "🌍 Explore 'Retirement in Sydney' or 'Elder Care in London'...",
      "🌍 Discover 'Care Facilities in Dubai' or 'Senior Homes in Rome'...",
      "🌍 Search 'Assisted Living in Berlin' or 'Nursing Homes in Toronto'...",
      "🌍 Find 'Senior Communities in Singapore' or 'Care Centers in Madrid'..."
    ],
    services: [
      "🌍 Try 'Restaurants in Tokyo' or 'Lawyers in London'...",
      "🌍 Search 'Hotels in Paris' or 'Pharmacies in Berlin'...",
      "🌍 Find 'Cafes in Rome' or 'Banks in Singapore'...",
      "🌍 Explore 'Shops in Dubai' or 'Clinics in Sydney'...",
      "🌍 Discover 'Services in Amsterdam' or 'Stores in Barcelona'..."
    ],
    healthcare: [
      "🌍 Try 'Hospitals in London' or 'Clinics in Tokyo'...",
      "🌍 Search 'Doctors in Paris' or 'Specialists in Sydney'...",
      "🌍 Find 'Emergency care in Dubai' or 'Medical centers in Berlin'...",
      "🌍 Explore 'Healthcare in Singapore' or 'Pharmacies in Rome'...",
      "🌍 Discover 'Health services in Toronto' or 'Clinics in Amsterdam'..."
    ],
    resources: [
      "🌍 Try 'Senior resources in UK' or 'Care guides for Japan'...",
      "🌍 Search 'Elder care in France' or 'Support in Australia'...",
      "🌍 Find 'Resources in Canada' or 'Guides for Germany'...",
      "🌍 Explore 'Senior help in Spain' or 'Care info in Italy'...",
      "🌍 Discover 'Support in Singapore' or 'Resources in Netherlands'..."
    ],
    vendors: [
      "🌍 Try 'Medical supplies in London' or 'Equipment in Tokyo'...",
      "🌍 Search 'Senior products in Paris' or 'Devices in Sydney'...",
      "🌍 Find 'Mobility aids in Berlin' or 'Safety gear in Dubai'...",
      "🌍 Explore 'Health monitors in Rome' or 'Alerts in Toronto'...",
      "🌍 Discover 'Senior discounts worldwide' or 'Global suppliers'..."
    ]
  },
  map: {
    communities: [
      "📍 Try 'Within 10 miles' or 'Near downtown'...",
      "📍 Search 'Along I-35' or 'Near medical district'...",
      "📍 Find 'In my neighborhood' or 'Close to family'...",
      "📍 Explore 'Waterfront communities' or 'Near shopping'...",
      "📍 Discover 'Urban centers' or 'Suburban areas'..."
    ],
    services: [
      "📍 Try 'Services nearby' or '24-hour services'...",
      "📍 Search 'Within walking distance' or 'Mobile services'...",
      "📍 Find 'Emergency services' or 'Home delivery'...",
      "📍 Explore 'Downtown services' or 'On my route'...",
      "📍 Discover 'Near work' or 'In shopping centers'..."
    ],
    healthcare: [
      "📍 Try 'Closest hospital' or 'Emergency care nearby'...",
      "📍 Search 'Walk-in clinics' or 'After-hours care'...",
      "📍 Find 'Specialists near me' or 'Medical districts'...",
      "📍 Explore 'Urgent care chains' or 'VA hospitals nearby'...",
      "📍 Discover 'Community clinics' or 'Teaching hospitals'..."
    ],
    resources: [
      "📍 Try 'Local resources' or 'Community centers'...",
      "📍 Search 'Senior centers nearby' or 'Libraries near me'...",
      "📍 Find 'Government offices' or 'Churches nearby'...",
      "📍 Explore 'Recreation centers' or 'Local programs'...",
      "📍 Discover 'Volunteer opportunities' or 'Neighborhood help'..."
    ],
    vendors: [
      "📍 Try 'Medical supply stores' or 'Equipment rental nearby'...",
      "📍 Search 'Senior product shops' or 'Assistive tech stores'...",
      "📍 Find 'Mobility stores' or 'Safety equipment dealers'...",
      "📍 Explore 'Health product stores' or 'Alert system providers'...",
      "📍 Discover 'Senior discount stores' or 'Product showrooms'..."
    ]
  },
  list: {
    communities: [
      "🔍 Try 'Houston' or 'Under $3000/month'...",
      "🔍 Search 'Memory care' or 'Pet-friendly'...",
      "🔍 Find 'Assisted living' or '5-star rated'...",
      "🔍 Explore 'Near hospitals' or 'Veterans communities'...",
      "🔍 Discover 'Independent living' or 'Active seniors'..."
    ],
    services: [
      "🔍 Try 'Home care' or 'Medical equipment'...",
      "🔍 Search 'Meal delivery' or 'Transportation'...",
      "🔍 Find 'Physical therapy' or 'Companion care'...",
      "🔍 Explore 'Adult day care' or 'Respite care'...",
      "🔍 Discover 'Emergency response' or 'Hospice services'..."
    ],
    healthcare: [
      "🔍 Try 'Hospitals' or 'Emergency rooms'...",
      "🔍 Search 'Primary care' or 'Specialists'...",
      "🔍 Find 'Urgent care' or 'Rehabilitation'...",
      "🔍 Explore 'Cancer centers' or 'Heart specialists'...",
      "🔍 Discover 'Memory care' or 'Pain management'..."
    ],
    resources: [
      "🔍 Try 'Medicare guides' or 'Medicaid help'...",
      "🔍 Search 'Care planning' or 'Legal documents'...",
      "🔍 Find 'Financial planning' or 'Insurance info'...",
      "🔍 Explore 'Caregiver support' or 'Senior benefits'...",
      "🔍 Discover 'Support groups' or 'Crisis hotlines'..."
    ],
    vendors: [
      "🔍 Search 'Medical supplies' or 'Equipment rental'...",
      "🔍 Find 'Senior products' or 'Assistive devices'...",
      "🔍 Discover 'Mobility aids' or 'Safety equipment'...",
      "🔍 Browse 'Health monitors' or 'Emergency alerts'...",
      "🔍 Explore 'Senior discounts' or 'Product reviews'..."
    ]
  }
};

// Simplified Hero Section with Fixed Search Bar
function HeroSectionWithTransformingSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<any>({ results: [], metadata: null });
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'discover'>('discover');
  const [showGlobalDiscoveryModal, setShowGlobalDiscoveryModal] = useState(false);
  const [globalDiscoveryResults, setGlobalDiscoveryResults] = useState<any>(null);
  const [forceClearAutocomplete, setForceClearAutocomplete] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [searchCategory, setSearchCategory] = useState<'communities' | 'services' | 'healthcare' | 'resources' | 'vendors'>('communities');
  const [isSearchFocused, setIsSearchFocused] = useState(false); // Track search focus state
  const [visibleResults, setVisibleResults] = useState(10); // Start with 10 visible results
  const [, setLocation] = useLocation();
  const [searchPlaceholder, setSearchPlaceholder] = useState('');
  
  // Update placeholder text when view mode or category changes
  useEffect(() => {
    const placeholders = SEARCH_PLACEHOLDERS[viewMode]?.[searchCategory] || SEARCH_PLACEHOLDERS.list.communities;
    const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
    setSearchPlaceholder(randomPlaceholder);
  }, [viewMode, searchCategory]);
  
  // Fetch dynamic community and service counts
  const { data: communityStats } = useQuery<{ count: string; communities: string; services: string; isGlobal: boolean }>({
    queryKey: ["/api/communities/count"],
    retry: false,
    staleTime: 1 * 60 * 1000, // Cache for 1 minute
    gcTime: 5 * 60 * 1000,   // Keep in cache for 5 minutes
  });

  // Handle search from AutoExpandingSearch component
  const handleAutoExpandingSearch = async (query: string, isResearchMode?: boolean) => {
    setSearchQuery(query);
    
    // Set loading state immediately for better UX
    if (query && query.length >= 2) {
      setIsLoading(true);
      setIsSearchActive(true);
    }
    
    if (!query || query.length < 2) {
      setIsSearchActive(false);
      setSearchResults({ results: [], metadata: null });
      setIsLoading(false);
      return;
    }
    
    // If isResearchMode is true (from Discovery Mode suggestion), trigger discovery
    if (isResearchMode) {
      console.log('🌍 Discovery Mode activated for:', query);
      // Loading already set above
      
      // Show loading message for Discovery Mode
      setSearchResults({ 
        results: [],
        metadata: {
          isLoading: true,
          loadingMessage: `🌍 Discovery Mode: Searching worldwide for "${query}"... This may take 30-60 seconds as we scan global databases.`,
          isResearchMode: false
        }
      })
      
      try {
        const response = await fetch('/api/global-discovery/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query,
            searchType: searchCategory,
            autoExpand: true
          })
        });
        
        if (!response.ok) throw new Error('Discovery search failed');
        
        const data = await response.json();
        
        // Open modal with results
        if (data.results && data.results.length > 0) {
          setGlobalDiscoveryResults({
            query,
            results: data.results,
            metadata: data.metadata
          });
          setShowGlobalDiscoveryModal(true);
          // Clear search to reset UI
          setSearchQuery('');
          setIsSearchActive(false);
        } else {
          // No results found
          setSearchResults({
            results: [],
            metadata: {
              totalCount: 0,
              searchType: 'discovery',
              message: `No results found for "${query}" in Discovery Mode. Try different search terms or contact support for assistance.`
            }
          });
        }
      } catch (error) {
        console.error('Discovery Mode error:', error);
        setSearchResults({
          results: [],
          metadata: {
            error: true,
            message: 'Discovery Mode encountered an error. Please try again.'
          }
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    // Regular database search
    setIsSearchActive(true);
    setVisibleResults(10); // Reset visible count on new search
    
    // Show loading message immediately for better UX
    setSearchResults({ 
      results: [],
      metadata: {
        isLoading: true,
        loadingMessage: `Searching for "${query}"...`,
        isResearchMode: false
      }
    });
    
    // Perform the actual search
    handleCommunitySearch(query);
  };
  
  const handleCommunitySearch = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults({ results: [], metadata: null });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/communities/search?q=${encodeURIComponent(query)}&limit=200&category=${searchCategory}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      // Transform the results to match the expected format
      const communities = (data.results || []).map((r: any) => ({
          id: r.id,
          hudId: r.hudPropertyId,
          propertyId: r.hudPropertyId || r.propertyId,
          name: r.name,
          address: r.address,
          city: r.city,
          state: r.state,
          careTypes: r.careTypes || [],
          priceRange: r.priceRange,
          rating: r.rating,
          reviewCount: r.reviewCount,
          photos: r.photos || [],
          hudPropertyId: r.hudPropertyId,
          rentPerMonth: r.price || r.rentPerMonth,
          availableUnits: r.availableUnits,
          communitySubtype: r.communitySubtype,
          phone: r.phone,
          website: r.website,
          description: r.description,
          totalUnits: r.totalUnits,
          occupancyRate: r.occupancyRate
        }));

      setSearchResults({ results: communities, metadata: data.metadata });
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({ results: [], metadata: null });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && viewMode === 'map' && searchQuery) {
      setLocation(`/map-search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <ProfessionalNavbar transparent />
      
      {/* Global Discovery Modal */}
      {showGlobalDiscoveryModal && globalDiscoveryResults && (
        <GlobalDiscoveryModal
          isOpen={showGlobalDiscoveryModal}
          onClose={() => setShowGlobalDiscoveryModal(false)}
          searchQuery={globalDiscoveryResults.query}
          results={globalDiscoveryResults.results}
          metadata={globalDiscoveryResults.metadata}
        />
      )}
      
      <section className={`relative ${isSearchActive ? 'min-h-screen pb-20' : 'min-h-screen'} mt-16`}
        style={{
          background: 'linear-gradient(135deg, #1a1c3d 0%, #0f1224 25%, #0a0d1a 50%, #0f1224 75%, #1a1c3d 100%)'
        }}
      >
        {/* Background Image - Optimized loading - Clickable for home navigation */}
        <div 
          className="absolute inset-0 h-full w-full cursor-pointer"
          onClick={(e) => {
            // Only trigger if clicking the background image directly
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG' || target === e.currentTarget) {
              // Check if we're already on home page
              if (window.location.pathname === '/') {
                window.location.reload(); // Refresh if already on home
              } else {
                setLocation('/'); // Navigate to home if on different page
              }
            }
          }}
        >
          <img
            src="https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg"
            alt="Cosmic space background - Infinite possibilities in senior living"
            className={`w-full h-full object-cover object-center transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="eager"
            decoding="sync"
            onLoad={() => setImageLoaded(true)}
            style={{ 
              willChange: imageLoaded ? 'auto' : 'opacity',
              contentVisibility: 'auto',
              transform: 'translateZ(0)' // Force GPU acceleration
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 sm:via-transparent to-black/60"></div>
        </div>
        
        <div className="relative z-10 flex flex-col h-full min-h-screen">
        
        {/* Hero Title - Keep Original */}
        <div className="w-full text-center pt-4 sm:pt-8 md:pt-12 lg:pt-16 px-2 sm:px-4">
          <div className="inline-block bg-black/20 backdrop-blur-sm rounded-2xl px-3 sm:px-6 py-2 sm:py-4 max-w-[95vw] lg:max-w-[90vw] sm:max-w-none animate-fade-in">
            {/* Main Tagline - Responsive Text Sizing with Gradient Effect */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-3 sm:mb-4 whitespace-nowrap">
              <span className="inline-block animate-slide-in-left bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]">One Platform.</span>
              <span className="inline-block animate-slide-in-left text-white ml-2 drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">Every Step of the Journey.</span>
            </h1>
            
            {/* Updated Subtitle */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 sm:py-3 max-w-4xl mx-auto animate-fade-in-delayed">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white font-medium leading-relaxed">
                Your comprehensive guide to senior living, services, healthcare, resources, and products
              </p>
            </div>
          </div>
        </div>

        {/* Content Container - Search First, Then Value Props */}
        <div className={`flex-grow flex flex-col ${isSearchActive ? 'justify-start pt-8' : 'justify-center'} px-2 sm:px-4`}>
        
        {/* Unified Search Component with Integrated Tabs */}
        <div className="w-full max-w-full sm:max-w-3xl md:max-w-2xl lg:max-w-3xl mx-auto px-2 sm:px-0 relative z-40 mb-6">
          {/* Tab Navigation - Right above search bar */}
          <div className="bg-black/40 backdrop-blur-lg rounded-t-xl border border-white/20 border-b-0 px-4 py-3">
            <div className="flex justify-center gap-2 md:gap-4 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSearchCategory('communities')}
                className={`flex flex-col items-center gap-1 px-4 md:px-6 py-3 rounded-lg transition-all duration-300 min-w-[100px] ${
                  searchCategory === 'communities'
                    ? 'bg-white/20 backdrop-blur-sm text-white border-2 border-white'
                    : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/10 border-2 border-transparent'
                }`}
              >
                <Building className="h-6 w-6" />
                <span className="text-sm font-semibold">Communities</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSearchCategory('services')}
                className={`flex flex-col items-center gap-1 px-4 md:px-6 py-3 rounded-lg transition-all duration-300 min-w-[100px] ${
                  searchCategory === 'services'
                    ? 'bg-white/20 backdrop-blur-sm text-white border-2 border-white'
                    : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/10 border-2 border-transparent'
                }`}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm font-semibold">Services</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSearchCategory('healthcare')}
                className={`flex flex-col items-center gap-1 px-4 md:px-6 py-3 rounded-lg transition-all duration-300 min-w-[100px] ${
                  searchCategory === 'healthcare'
                    ? 'bg-white/20 backdrop-blur-sm text-white border-2 border-white'
                    : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/10 border-2 border-transparent'
                }`}
              >
                <Stethoscope className="h-6 w-6" />
                <span className="text-sm font-semibold">Healthcare</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSearchCategory('resources')}
                className={`flex flex-col items-center gap-1 px-4 md:px-6 py-3 rounded-lg transition-all duration-300 min-w-[100px] ${
                  searchCategory === 'resources'
                    ? 'bg-white/20 backdrop-blur-sm text-white border-2 border-white'
                    : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/10 border-2 border-transparent'
                }`}
              >
                <BookOpen className="h-6 w-6" />
                <span className="text-sm font-semibold">Resources</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSearchCategory('vendors')}
                className={`flex flex-col items-center gap-1 px-4 md:px-6 py-3 rounded-lg transition-all duration-300 min-w-[100px] ${
                  searchCategory === 'vendors'
                    ? 'bg-white/20 backdrop-blur-sm text-white border-2 border-white'
                    : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/10 border-2 border-transparent'
                }`}
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="text-sm font-semibold">Vendors</span>
              </button>
            </div>
          </div>
          
          {/* Search Bar Container - Clean styling like vendor marketplace */}
          <div className="w-full relative z-10 bg-black/40 backdrop-blur-xl rounded-b-xl rounded-t-none p-4 shadow-2xl border border-white/20 border-t-0">
            {/* Clean search input wrapper */}
            <div className="relative">
              <AutocompleteSearch 
                value={searchQuery}
                onChange={(value) => {
                  setSearchQuery(value);
                  // Reset the force clear flag when user types
                  if (forceClearAutocomplete) {
                    setForceClearAutocomplete(false);
                  }
                }}
                onSubmit={(value) => {
                  // Check if it's a simple value (non-community selection)
                  // AutocompleteSearch handles community navigation internally
                  if (value && !value.startsWith('/community/')) {
                    // Respect the current view mode when searching
                    if (viewMode === 'discover') {
                      // For Discovery Mode, trigger the search with discovery flag
                      handleAutoExpandingSearch(value, true); // true = isResearchMode/Discovery
                    } else if (viewMode === 'map') {
                      // For Map view, redirect to map-search
                      setLocation(`/map-search?q=${encodeURIComponent(value)}`);
                    } else if (viewMode === 'list') {
                      // For Database Search (list mode), trigger normal search
                      handleAutoExpandingSearch(value, false); // false = normal database search
                    }
                  }
                }}
                placeholder={searchPlaceholder}
                disabled={false}
                className="flex-grow"
                forceClear={forceClearAutocomplete}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onKeyPress={handleKeyPress}
                autoFocus={false}
                showSuggestions={true}
                category={searchCategory}
              />
            </div>
            
            {/* Toggle Switches for Database/Map/Discovery Mode - Below Search Bar */}
            <div className="flex justify-center gap-6 mt-4 flex-wrap">
              {/* Database Toggle */}
              <div className="flex items-center gap-2">
                <label htmlFor="database-toggle" className="text-white text-sm font-medium">Database</label>
                <Switch
                  id="database-toggle"
                  checked={viewMode === 'list'}
                  onCheckedChange={(checked) => checked && setViewMode('list')}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-blue-500"
                />
              </div>
              
              {/* Map Toggle */}
              <div className="flex items-center gap-2">
                <label htmlFor="map-toggle" className="text-white text-sm font-medium">Map</label>
                <Switch
                  id="map-toggle"
                  checked={viewMode === 'map'}
                  onCheckedChange={(checked) => checked && setViewMode('map')}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
                />
              </div>
              
              {/* Discovery Mode Toggle */}
              <div className="flex items-center gap-2">
                <label htmlFor="discovery-toggle" className="text-white text-sm font-medium">Discovery Mode</label>
                <Switch
                  id="discovery-toggle"
                  checked={viewMode === 'discover'}
                  onCheckedChange={(checked) => checked && setViewMode('discover')}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
                />
              </div>
            </div>
            
            {/* Service Search Suggestions - Show when services category is selected and Discovery Mode is active */}
            {viewMode === 'discover' && searchCategory === 'services' && !searchQuery && (
              <div className="absolute top-full mt-2 left-0 right-0 z-30">
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg border border-purple-200/50 dark:border-purple-700/50 p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Popular service searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'home health care',
                      'medical supplies', 
                      'senior transportation',
                      'meal delivery',
                      'physical therapy',
                      'cleaning services',
                      'handyman services',
                      'legal services',
                      'financial planning'
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setSearchQuery(suggestion);
                          // Set loading immediately for instant feedback
                          setIsLoading(true);
                          setIsSearchActive(true);
                          // Show loading message immediately
                          setSearchResults({ 
                            results: [],
                            metadata: {
                              isLoading: true,
                              loadingMessage: `Searching for "${suggestion}"...`,
                              isResearchMode: false
                            }
                          });
                          // Then trigger the actual search
                          handleAutoExpandingSearch(suggestion, true);
                        }}
                        className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/40 rounded-full border border-purple-300 dark:border-purple-600 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-2">
                    💡 Tip: Include a location for better results (e.g., "plumbers in Dallas")
                  </p>
                </div>
              </div>
            )}
          </div>
          
        </div>
        
        {/* Quick Action Buttons - Moved from Community Directory Section */}
        {!isSearchActive && (
        <div className="w-full max-w-full sm:max-w-2xl md:max-w-xl lg:max-w-xl mx-auto px-2 sm:px-0 mt-4">
          <div className="grid grid-cols-4 gap-2">
            {/* Traditional Browse */}
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = '/map-search';
              }}
              className="h-auto bg-gray-800 hover:bg-gray-700 text-white px-2 py-2 rounded-md font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 border border-gray-600">
              <div className="flex flex-col items-center">
                <span className="text-xl mb-1">🔍</span>
                <div className="text-xs sm:text-sm font-semibold leading-tight">Traditional Browse</div>
                <div className="text-[10px] sm:text-xs text-gray-400 leading-tight">Filter & Sort</div>
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
                <span className="text-xl mb-1">🤖</span>
                <div className="text-xs sm:text-sm font-semibold leading-tight">AI Assistant</div>
                <div className="text-[10px] sm:text-xs text-white/80 leading-tight">Ask Questions</div>
              </div>
            </Button>

            {/* Live Heatmap */}
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = '/availability-heatmap';
              }}
              className="h-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-2 py-2 rounded-md font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
              <div className="flex flex-col items-center">
                <span className="text-xl mb-1">🔥</span>
                <div className="text-xs sm:text-sm font-semibold leading-tight">Live Heatmap</div>
                <div className="text-[10px] sm:text-xs text-white/80 leading-tight">Availability</div>
              </div>
            </Button>

            {/* Crisis Tool */}
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = '/availability-heatmap';
              }}
              className="h-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-2 py-2 rounded-md font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
              <div className="flex flex-col items-center">
                <span className="text-xl mb-1">🚨</span>
                <div className="text-xs sm:text-sm font-semibold leading-tight">Crisis Tool</div>
                <div className="text-[10px] sm:text-xs text-white/80 leading-tight">Find Today</div>
              </div>
            </Button>
          </div>
        </div>
        )}

        </div>
        </div>
      </section>

    </>
  );
}

export default function MySeniorValetHome() {
  return <HeroSectionWithTransformingSearch />;
}