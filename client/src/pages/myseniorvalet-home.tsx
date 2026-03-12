import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import heroImagePath from "@assets/generated_images/seniors_garden_celebration.png";
import { useTheme } from "@/components/theme-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { FeaturedExcellenceCard } from "@/components/FeaturedExcellenceCard";
import { SimplifiedMapPanel } from "@/components/SimplifiedMapPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
// Removed useDebounce - not needed with UnifiedSearch component
import { useAccessibilityPreferences } from "@/hooks/useAccessibilityPreferences";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { Search, Heart, MapPin, Star, Home, Building2, DollarSign, Users, Info, MessageCircle, Link2, Truck, Sofa, Pill, Eye, Clock, Phone, Brain, Sparkles, Building, Ambulance, Package, CheckCircle, CheckSquare, Stethoscope, Activity, ShieldCheck, Scale, Utensils, UtensilsCrossed, Car, Bus, Scissors, Users2, FileText, Calculator, ShoppingCart, Trash2, Flower, TrendingUp, Shield, ArrowRight, Shirt as ShirtIcon, RefreshCw, ExternalLink, Globe, HeartHandshake, ChevronRight, ChevronLeft, BarChart, BarChart3, Calendar, X, Flag, Languages, Layers, ShoppingBasket, AlertCircle, AlertTriangle, AlertOctagon, Briefcase, LogIn, UserCheck, Smartphone, BookOpen, ShoppingBag, GraduationCap, MessageSquare, Monitor, Flame, Filter, XCircle, Unlock, Book, Music, Send, List, Wrench, Video, Gift, Hospital, Wifi } from "lucide-react";
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
import { RedTagDeals } from "@/components/RedTagDeals";
import { NorthernCACitySections } from "@/components/NorthernCACitySections";
import { MarketIntelligence } from "@/components/MarketIntelligence";
import { MoveInCostCalculator } from "@/components/MoveInCostCalculator";
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
import { MySeniorValetChatKit } from '@/components/MySeniorValetChatKit';
import StructuredData, { organizationSchema, searchActionSchema, createBreadcrumbSchema } from '@/components/StructuredData';
import { SEOMetaTags } from '@/components/SEOMetaTags';
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
import RetroVendorMarketplace from '@assets/generated_images/Retro_vendor_marketplace_sign_b412c8cc.png';
import RetroGuestServices from '@assets/generated_images/Retro_guest_services_sign_b951be1b.png';
import LuxuryValet from '@assets/generated_images/Luxury_valet_silhouette_b48f3fbd.png';
import BusinessDistrictBg from '@assets/generated_images/Business_district_twilight_a2a388f0.png';

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
    marketplace: [
      "🌍 Try 'Medical supplies' or 'Mobility aids'...",
      "🌍 Search 'Senior products' or 'Healthcare equipment'...",
      "🌍 Find 'Daily living aids' or 'Safety devices'...",
      "🌍 Explore 'Comfort products' or 'Adaptive clothing'...",
      "🌍 Discover 'Technology for seniors' or 'Emergency systems'..."
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
    marketplace: [
      "📍 Try 'Medical supply stores' or 'Pharmacy nearby'...",
      "📍 Search 'Equipment rental' or 'Home medical supplies'...",
      "📍 Find 'Mobility stores' or 'Senior shops nearby'...",
      "📍 Explore 'Healthcare retailers' or 'Adaptive equipment'...",
      "📍 Discover 'Local vendors' or 'Medical device stores'..."
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
    marketplace: [
      "🔍 Try 'Wheelchairs' or 'Walking aids'...",
      "🔍 Search 'Hospital beds' or 'Lift chairs'...",
      "🔍 Find 'Bathroom safety' or 'Grab bars'...",
      "🔍 Explore 'Compression socks' or 'Pain relief'...",
      "🔍 Discover 'Hearing aids' or 'Vision aids'..."
    ]
  }
};

// Tab gradient configurations for each category
const TAB_GRADIENTS = {
  communities: {
    gradient: 'linear-gradient(to bottom right, #3b82f6, #4f46e5, #6366f1)',
    borderColor: '#93c5fd',
    shadowColor: 'rgba(59, 130, 246, 0.5)',
  },
  services: {
    gradient: 'linear-gradient(to bottom right, #a855f7, #9333ea, #d946ef)',
    borderColor: '#d8b4fe',
    shadowColor: 'rgba(168, 85, 247, 0.5)',
  },
  healthcare: {
    gradient: 'linear-gradient(to bottom right, #10b981, #059669, #14b8a6)',
    borderColor: '#6ee7b7',
    shadowColor: 'rgba(16, 185, 129, 0.5)',
  },
  resources: {
    gradient: 'linear-gradient(to bottom right, #f97316, #d97706, #eab308)',
    borderColor: '#fdba74',
    shadowColor: 'rgba(249, 115, 22, 0.5)',
  },
  marketplace: {
    gradient: 'linear-gradient(to bottom right, #6366f1, #7c3aed, #a855f7)',
    borderColor: '#a5b4fc',
    shadowColor: 'rgba(99, 102, 241, 0.5)',
  },
};

// Recently Discovered Services Carousel Component for Services Tab
function RecentlyDiscoveredServicesCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch recently discovered services
  const { data: recentServices, isLoading } = useQuery({
    queryKey: ['/api/services/recently-discovered'],
    queryFn: async () => {
      const response = await fetch('/api/services/recently-discovered?limit=100');
      if (!response.ok) throw new Error('Failed to fetch recent services');
      return response.json();
    }
  });

  // Check scroll position
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Scroll handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [recentServices]);

  return (
    <div className="relative">
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur rounded-full p-3 shadow-xl hover:bg-white transition-all duration-200 hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-purple-600" />
        </button>
      )}

      {/* Services Carousel */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
        onScroll={checkScrollPosition}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-72">
              <div className="bg-white rounded-lg p-4 shadow-xl animate-pulse">
                <div className="h-16 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : recentServices && recentServices.length > 0 ? (
          recentServices.map((vendor: any, index: number) => (
            <motion.div 
              key={vendor.id} 
              className="flex-shrink-0 w-72"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
            >
              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <VendorServiceCard 
                  vendor={vendor} 
                  variant="grid"
                  onSelect={() => {
                    window.location.href = `/service/${vendor.id}`;
                  }}
                />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-white/80 text-center py-8 w-full">
            No services discovered yet. Try searching for businesses above!
          </div>
        )}
      </div>

      {/* Right Scroll Button */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur rounded-full p-3 shadow-xl hover:bg-white transition-all duration-200 hover:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-purple-600" />
        </button>
      )}
    </div>
  );
}

// Recently Discovered Healthcare Carousel Component for Healthcare Tab
function RecentlyDiscoveredHealthcareCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch recently discovered healthcare providers - use simple key for consistent cache invalidation
  const { data: recentHealthcare, isLoading } = useQuery({
    queryKey: ['/api/healthcare/recently-discovered?limit=100'],
  });

  // Check scroll position
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Scroll handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [recentHealthcare]);

  return (
    <div className="relative">
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur rounded-full p-3 shadow-xl hover:bg-white transition-all duration-200 hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-teal-600" />
        </button>
      )}

      {/* Healthcare Carousel */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
        onScroll={checkScrollPosition}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-72">
              <div className="bg-white rounded-lg p-4 shadow-xl animate-pulse">
                <div className="h-16 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : recentHealthcare && recentHealthcare.length > 0 ? (
          recentHealthcare.map((provider: any, index: number) => (
            <motion.div 
              key={provider.id} 
              className="flex-shrink-0 w-72"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
            >
              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <VendorServiceCard 
                  vendor={provider} 
                  variant="grid"
                  onSelect={() => {
                    if (provider.website) {
                      window.open(provider.website, '_blank', 'noopener,noreferrer');
                    }
                  }}
                />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-white/80 text-center py-8 w-full">
            No healthcare providers discovered yet. Try searching for providers above!
          </div>
        )}
      </div>

      {/* Right Scroll Button */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur rounded-full p-3 shadow-xl hover:bg-white transition-all duration-200 hover:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-teal-600" />
        </button>
      )}
    </div>
  );
}

// Recently Discovered Resources Carousel Component for Resources Tab
function RecentlyDiscoveredResourcesCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch recently discovered resources - use simple key for consistent cache invalidation
  const { data: recentResources, isLoading } = useQuery({
    queryKey: ['/api/resources/recently-discovered?limit=100'],
  });

  // Check scroll position
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Scroll handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [recentResources]);

  return (
    <div className="relative">
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur rounded-full p-3 shadow-xl hover:bg-white transition-all duration-200 hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-orange-600" />
        </button>
      )}

      {/* Resources Carousel */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
        onScroll={checkScrollPosition}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-72">
              <div className="bg-white rounded-lg p-4 shadow-xl animate-pulse">
                <div className="h-16 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : recentResources && recentResources.length > 0 ? (
          recentResources.map((resource: any, index: number) => (
            <motion.div 
              key={resource.id} 
              className="flex-shrink-0 w-72"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
            >
              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <VendorServiceCard 
                  vendor={resource} 
                  variant="grid"
                  onSelect={() => {
                    if (resource.website) {
                      window.open(resource.website, '_blank', 'noopener,noreferrer');
                    }
                  }}
                />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-white/80 text-center py-8 w-full">
            No resources discovered yet. Try searching for resources above!
          </div>
        )}
      </div>

      {/* Right Scroll Button */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur rounded-full p-3 shadow-xl hover:bg-white transition-all duration-200 hover:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-orange-600" />
        </button>
      )}
    </div>
  );
}

// Simplified Hero Section with Fixed Search Bar
function HeroSectionWithTransformingSearch({ activeTab, onTabChange }: { activeTab: string, onTabChange: (value: string) => void }) {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [classicSearchValue, setClassicSearchValue] = useState(''); // Separate state for classic search input
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<any>({ results: [], metadata: null });
  const [isLoading, setIsLoading] = useState(false);
  
  // Helper function to get tab styles based on active state
  const getTabStyle = useCallback((tabName: string): React.CSSProperties => {
    const isActive = activeTab === tabName;
    const config = TAB_GRADIENTS[tabName as keyof typeof TAB_GRADIENTS];
    
    if (isActive && config) {
      return {
        background: config.gradient,
        color: 'white',
        border: `2px solid ${config.borderColor}`,
        boxShadow: `0 10px 25px -5px ${config.shadowColor}`,
        transform: 'scale(1.1)',
      };
    }
    
    // Inactive state
    const isDark = theme === 'dark';
    return {
      background: isDark ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      color: isDark ? '#d1d5db' : '#374151',
      border: isDark ? '1px solid #4b5563' : '1px solid #d1d5db',
    };
  }, [activeTab, theme]);
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'discover'>('list');
  const [showGlobalDiscoveryModal, setShowGlobalDiscoveryModal] = useState(false);
  const [globalDiscoveryResults, setGlobalDiscoveryResults] = useState<any>(null);
  const [forceClearAutocomplete, setForceClearAutocomplete] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false); // Track search focus state
  const [visibleResults, setVisibleResults] = useState(10); // Start with 10 visible results
  const [, setLocation] = useLocation();
  const [searchPlaceholder, setSearchPlaceholder] = useState('');
  
  // New state for search mode toggle (AI Assistant vs Classic Search)
  const [searchMode, setSearchMode] = useState<'ai' | 'classic'>(() => {
    // Load from localStorage or default to 'classic' (Classic Search is the primary experience)
    // Check if we're in the browser to prevent SSR errors
    if (typeof window !== 'undefined') {
      const savedMode = sessionStorage.getItem('searchMode');
      return (savedMode === 'classic' || savedMode === 'ai') ? savedMode : 'classic';
    }
    return 'classic';
  });
  
  // Save search mode to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('searchMode', searchMode);
    }
  }, [searchMode]);
  
  // Listen for search mode changes from the navbar
  useEffect(() => {
    const handleSearchModeChange = (e: CustomEvent) => {
      const newMode = e.detail as 'ai' | 'classic';
      if (newMode === 'ai' || newMode === 'classic') {
        setSearchMode(newMode);
      }
    };
    window.addEventListener('searchModeChange', handleSearchModeChange as EventListener);
    return () => window.removeEventListener('searchModeChange', handleSearchModeChange as EventListener);
  }, []);
  
  // Update placeholder text when view mode or category changes
  useEffect(() => {
    const placeholders = SEARCH_PLACEHOLDERS[viewMode]?.[activeTab as keyof typeof SEARCH_PLACEHOLDERS.list] || SEARCH_PLACEHOLDERS.list.communities;
    const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
    setSearchPlaceholder(randomPlaceholder);
  }, [viewMode, activeTab]);
  
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
    window.dispatchEvent(new CustomEvent('homeSearchQuery', { detail: { query } }));
    
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
            searchType: activeTab === 'services' ? 'services' : 'location',
            limit: 50,
            discoveryMode: true  // CRITICAL: This flag tells the backend to actually search the web
          }),
          signal: AbortSignal.timeout(120000) // 120 second timeout for Discovery Mode
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // CRITICAL: Invalidate recently-discovered cache after discovery search
          // This ensures new discoveries appear immediately in the Recently Discovered section
          if (data.results?.length > 0 || data.metadata?.discoveredCount > 0) {
            // Use prefix matching to invalidate all recently-discovered queries regardless of params
            queryClient.invalidateQueries({ queryKey: ['/api/communities/recently-discovered'] });
            // Also invalidate with the specific limit param used by RecentlyDiscoveredCommunities component
            queryClient.invalidateQueries({ queryKey: ['/api/communities/recently-discovered', { limit: 100 }] });
            console.log('🔄 Invalidated recently-discovered cache after Discovery Mode search');
          }
          
          // Clear loading state first to remove loading modal
          setIsLoading(false);
          setSearchResults({ results: [], metadata: null });
          // Then set results and show the modal
          setGlobalDiscoveryResults({
            query,
            results: data.results || [],
            metadata: {...(data.metadata || {}), discoveryType: activeTab}
          });
          setForceClearAutocomplete(true);
          setShowGlobalDiscoveryModal(true);
          return;
        }
      } catch (error: any) {
        console.error('Discovery Mode error:', error);
        
        // Provide specific error messages based on error type
        let errorMessage = "Discovery Mode search failed. Please try again.";
        if (error.name === 'AbortError' || error.message?.includes('timeout')) {
          errorMessage = "Discovery Mode search is taking longer than expected. We're searching for new communities across the web - please try again in a moment or try a more specific location.";
        } else if (error.message?.includes('fetch')) {
          errorMessage = "Unable to connect to our discovery service. Please check your internet connection and try again.";
        }
        
        setSearchResults({ 
          results: [],
          metadata: {
            aiResponse: errorMessage,
            isResearchMode: false
          }
        });
      }
      setIsLoading(false);
      return;
    }
    
    // Check if query contains US location indicators
    const usStates = [
      'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 
      'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 
      'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan', 
      'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire', 
      'new jersey', 'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio', 
      'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina', 'south dakota', 
      'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west virginia', 
      'wisconsin', 'wyoming', 'washington dc', 'district of columbia'
    ];
    
    const usStateAbbreviations = [
      'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 'id', 'il', 'in', 
      'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 
      'nh', 'nj', 'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 'tn', 
      'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy', 'dc'
    ];
    
    const queryLower = query.toLowerCase();
    
    // Check if query contains US location indicators
    const isUSLocation = 
      usStates.some(state => new RegExp(`\\b${state}\\b`, 'i').test(queryLower)) ||
      usStateAbbreviations.some(abbr => new RegExp(`\\b${abbr}\\b`, 'i').test(queryLower)) ||
      /\busa\b|\bunited states\b|\bamerica\b/i.test(queryLower) ||
      /\b\d{5}(-\d{4})?\b/.test(query); // ZIP code pattern
    
    // SIMPLIFIED INTERNATIONAL DETECTION: Support ALL 195 countries
    // Strategy: If it's NOT a US location, it's international. Period.
    // This automatically covers all 195 countries without needing to list them
    
    // A search is international if it's NOT a US location
    // This is the simplest and most comprehensive approach that covers ALL countries
    const isInternationalSearch = !isUSLocation;
    
    // Log international detection for debugging
    if (isInternationalSearch) {
      console.log(`🌍 International search detected: "${query}" (Not a US location)`);
    }
    
    // Handle map view redirect FIRST
    if (viewMode === 'map' && query) {
      const categoryParam = activeTab !== 'communities' ? `&category=${activeTab}` : '';
      setLocation(`/map-search?q=${encodeURIComponent(query)}${categoryParam}`);
      return;
    }

    setIsSearchActive(true);
    setVisibleResults(10); // Reset to show first 10 results for new search
    setIsLoading(true);

    try {
      if (false && viewMode === 'discover' && (activeTab === 'services' || activeTab === 'healthcare' || activeTab === 'resources' || activeTab === 'vendors')) {
        // (Discovery mode for non-community tabs kept but hidden - no longer exposed in UI)
        // Services, Healthcare, Resources, and Marketplace Discovery Mode - unified global discovery
        console.log(`🌍 ${activeTab} Discovery Mode for:`, query);
        
        const categoryLabel = activeTab === 'services' ? 'service providers' 
          : activeTab === 'healthcare' ? 'healthcare providers' 
          : activeTab === 'resources' ? 'resources' 
          : 'vendors';
        
        setSearchResults({ 
          results: [],
          metadata: {
            isLoading: true,
            loadingMessage: `🔍 Searching for ${categoryLabel} matching "${query}"...`,
            isResearchMode: false
          }
        });
        
        try {
          const response = await fetch('/api/global-discovery/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              query: query,
              searchType: activeTab,
              limit: 30,
              discoveryMode: true
            }),
            signal: AbortSignal.timeout(60000)
          });
          
          if (!response.ok) throw new Error(`${activeTab} discovery failed`);
          
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            // Show discovered results in modal
            setIsLoading(false);
            setSearchResults({ results: [], metadata: null });
            setGlobalDiscoveryResults({
              query,
              results: data.results,
              metadata: {...data.metadata, discoveryType: activeTab, aiNarrative: data.aiNarrative, citations: data.citations}
            });
            setForceClearAutocomplete(true);
            setShowGlobalDiscoveryModal(true);
          } else {
            // No results found, show message
            setSearchResults({ 
              results: [],
              metadata: {
                aiResponse: `No ${categoryLabel} found for "${query}". Try a more specific location or different search terms.`,
                isResearchMode: false
              }
            });
          }
        } catch (error) {
          console.error(`${activeTab} discovery failed:`, error);
          setSearchResults({ 
            results: [],
            metadata: {
              aiResponse: `Unable to search for ${categoryLabel} at the moment. Please try again.`,
              error: true,
              isResearchMode: false
            }
          });
        }
        
      } else if (isResearchMode) {
        // Use Public AI Chat for pure research mode (not discovery)
        const response = await fetch('/api/public/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: query
          })
        });

        if (!response.ok) throw new Error('Research request failed');
        
        const aiChatResponse = await response.json();
        
        // Set results with AI response and platform resources
        setSearchResults({ 
          results: [], // No community results in research mode initially
          metadata: {
            aiResponse: aiChatResponse.answer,
            platformResources: aiChatResponse.platformResources || [],
            suggestions: aiChatResponse.suggestions || [],
            citations: aiChatResponse.citations || [],
            isResearchMode: true,
            timestamp: aiChatResponse.timestamp,
            model: aiChatResponse.model
          }
        });

      } else {
        // Regular search - use comprehensive search for communities
        if (activeTab === 'communities') {
          const dbResponse = await fetch(`/api/search/comprehensive?q=${encodeURIComponent(query)}&limit=50`);
          
          if (!dbResponse.ok) {
            // Fallback to unified search
            await handleUnifiedSearch(query);
          } else {
            const data = await dbResponse.json();
            const dbCommunities: any[] = data.communities || [];
            const metadata = data.searchMetadata || {};

            setSearchResults({ 
              results: dbCommunities, 
              metadata: {
                total: data.total,
                searchMetadata: metadata,
                suggestions: data.suggestions,
              }
            });
          }
        } else {
          // Use NLP search for other categories (services, healthcare, resources)
          const response = await fetch('/api/nlp/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              query: query,
              limit: 50,
              category: activeTab
            })
          });

          if (!response.ok) {
            // Fallback to unified search
            await handleUnifiedSearch(query);
          } else {
            const data = await response.json();
            const results = data.results?.map((r: any) => r.data || r) || [];
            setSearchResults({ 
              results: results, 
              metadata: {
                intent: data.intent,
                facets: data.facets,
                suggestions: data.suggestions
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({ results: [], metadata: { error: 'Search failed' } });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search from UnifiedSearch component (legacy)
  const handleUnifiedSearch = async (query: string, resultsFromComponent?: any[]) => {
    setSearchQuery(query);
    
    if (!query || query.length < 2) {
      setIsSearchActive(false);
      setSearchResults({ results: [], metadata: null });
      return;
    }

    setIsSearchActive(true);
    setIsLoading(true);

    try {
      // If results are already provided from component, use them
      if (resultsFromComponent && resultsFromComponent.length > 0) {
        setSearchResults({ results: resultsFromComponent, metadata: null });
        setIsLoading(false);
        return;
      }

      // Otherwise, fetch results for list/map view
      const response = await fetch('/api/search/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: query,
          includeHospitals: true,
          includeServices: true,
          searchType: activeTab, // Pass the current search category
          limit: 50
        })
      });

      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      
      // Handle both 'communities' and 'results' field names from backend
      const rawResults = data.communities || data.results || [];
      
      // Map communities directly
      const communities = rawResults.map((r: any) => ({
          id: r.id,
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
      
      <section className={`relative mt-16 overflow-visible`}
        style={{
          background: 'linear-gradient(135deg, #3d5a1e 0%, #5a7a2e 25%, #4a6a28 50%, #5a7a2e 75%, #3d5a1e 100%)',
          minHeight: 'calc(70vh - 4rem)',
          height: isSearchActive ? 'auto' : 'calc(70vh - 4rem)',
          paddingBottom: isSearchActive ? '0.5rem' : '2rem',
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
            src={heroImagePath}
            alt="Senior friends celebrating together at a luxury resort-style community garden"
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 sm:via-black/10 to-black/65"></div>
        </div>
        
        <div className="relative z-10 flex flex-col h-full">
        
        {isAuthenticated && <div className="w-full px-2 sm:px-4 md:px-8 lg:px-16 pt-2 sm:pt-3 md:pt-4 pb-1 flex justify-center overflow-x-auto scrollbar-hide">
          <TabsList className="flex justify-center items-center gap-1.5 sm:gap-2 md:gap-3 bg-transparent h-auto p-0">
            <TabsTrigger
              value="communities"
              className="flex flex-col items-center gap-0.5 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl backdrop-blur-md shadow-md transition-all duration-300"
              style={getTabStyle('communities')}
            >
              <span className="text-lg sm:text-xl">🏘️</span>
              <span className="text-[10px] sm:text-xs font-semibold whitespace-nowrap">Senior Living</span>
            </TabsTrigger>
            
            {isAuthenticated && (
              <TabsTrigger
                value="services"
                className="flex flex-col items-center gap-0.5 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl backdrop-blur-md shadow-md transition-all duration-300"
                style={getTabStyle('services')}
              >
                <span className="text-lg sm:text-xl">👥</span>
                <span className="text-[10px] sm:text-xs font-semibold whitespace-nowrap">Services</span>
              </TabsTrigger>
            )}
            
            {isAuthenticated && (
              <TabsTrigger
                value="healthcare"
                className="flex flex-col items-center gap-0.5 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl backdrop-blur-md shadow-md transition-all duration-300"
                style={getTabStyle('healthcare')}
              >
                <span className="text-lg sm:text-xl">🩺</span>
                <span className="text-[10px] sm:text-xs font-semibold whitespace-nowrap">Healthcare</span>
              </TabsTrigger>
            )}
            
            {isAuthenticated && (
              <TabsTrigger
                value="resources"
                className="flex flex-col items-center gap-0.5 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl backdrop-blur-md shadow-md transition-all duration-300"
                style={getTabStyle('resources')}
              >
                <span className="text-lg sm:text-xl">📚</span>
                <span className="text-[10px] sm:text-xs font-semibold whitespace-nowrap">Resources</span>
              </TabsTrigger>
            )}
            
            {isAuthenticated && (
              <TabsTrigger
                value="marketplace"
                className="flex flex-col items-center gap-0.5 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl backdrop-blur-md shadow-md transition-all duration-300"
                style={getTabStyle('marketplace')}
              >
                <span className="text-lg sm:text-xl">🛍️</span>
                <span className="text-[10px] sm:text-xs font-semibold whitespace-nowrap">Marketplace</span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>}
        
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 md:px-16">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight text-center"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.4)' }}
          >
            From affordable options to luxury resorts — Find Senior Living that's right for you!
          </h1>
        </div>

        </div>

        <div className="absolute bottom-0 left-0 right-0 z-30 transform translate-y-1/2 px-2 sm:px-4">
        <div className="w-full max-w-full sm:max-w-3xl md:max-w-2xl lg:max-w-3xl mx-auto px-2 sm:px-0 relative z-50" style={{ isolation: 'isolate' }}>
          <AnimatePresence mode="wait">
            {searchMode === 'ai' ? (
              <motion.div
                key="ai-assistant"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <MySeniorValetChatKit 
                  category={activeTab as 'communities' | 'services' | 'healthcare' | 'resources' | 'vendors'}
                  onCategoryChange={(cat) => onTabChange(cat)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="classic-search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 shadow-2xl"
              >
                <div className="flex flex-col gap-2">
                  <AutocompleteSearch
                    value={classicSearchValue}
                    onChange={setClassicSearchValue}
                    onSubmit={(query) => {
                      setSearchQuery(query);
                      handleAutoExpandingSearch(query);
                    }}
                    placeholder={searchPlaceholder}
                    isLoading={isLoading}
                    forceClearSuggestions={forceClearAutocomplete}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      </section>

      <div className="pt-12 sm:pt-14 md:pt-16"></div>
          
      {/* Search Results - Premium Glass Design */}
          {isSearchActive && viewMode !== 'map' && activeTab !== 'communities' && (
            <div className="w-full max-w-2xl mx-auto mt-12 md:mt-16 mb-8">
              {/* Show AI Response directly in results area for Research mode */}
              {searchResults?.metadata?.isResearchMode && searchResults?.metadata?.aiResponse ? (
                <div className="animate-fade-in">
                  <AIChatResponse
                    aiResponse={searchResults.metadata.aiResponse}
                    platformResources={searchResults.metadata.platformResources}
                    suggestions={searchResults.metadata.suggestions}
                    citations={searchResults.metadata.citations}
                    timestamp={searchResults.metadata.timestamp}
                    model={searchResults.metadata.model}
                  />
                </div>
              ) : (
                <>
                  {/* Discovery Mode Section - Show Perplexity AI Response When No Results Found */}
                  {searchResults?.metadata?.discoveryMode && searchResults?.metadata?.aiSuggestions && (
                    <div className="mb-6 animate-fade-in">
                      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-white">Discovery Mode Activated</h3>
                        </div>
                        
                        {searchResults.metadata.discoveryMessage && (
                          <p className="text-purple-300 text-sm mb-4">{searchResults.metadata.discoveryMessage}</p>
                        )}
                        
                        {/* AI-Generated Content Section */}
                        <div className="bg-black/30 rounded-xl p-4 max-h-96 overflow-y-auto">
                          <div className="prose prose-invert prose-sm max-w-none">
                            <div className="text-gray-300 whitespace-pre-wrap">
                              {searchResults.metadata.aiSuggestions.summary || searchResults.metadata.aiSuggestions.content}
                            </div>
                            
                            {/* Sources */}
                            {searchResults.metadata.aiSuggestions.sources && searchResults.metadata.aiSuggestions.sources.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-purple-500/30">
                                <p className="text-xs text-purple-400 font-semibold mb-2">Sources:</p>
                                <div className="flex flex-wrap gap-2">
                                  {searchResults.metadata.aiSuggestions.sources.map((source: string, idx: number) => (
                                    <a
                                      key={idx}
                                      href={source}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                      [{idx + 1}]
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Regular Search Results List */}
                  {/* Only show header when not loading */}
                  {!(isLoading || searchResults?.metadata?.isLoading) && (
                    <div className="">
                      <div className="bg-white/10 backdrop-blur-md px-4 py-3 border border-white/20 rounded-xl shadow-2xl">
                        <h3 className="text-lg font-semibold text-white">
                        {searchQuery ? (
                          <>
                            Found {searchResults?.results?.length || 0}
                            {activeTab === 'services' ? ' services' : 
                             activeTab === 'healthcare' ? ' healthcare providers' : 
                             activeTab === 'resources' ? ' resources' : ' communities'}
                            {' matching "'}
                            <span className="text-green-400">{searchQuery}</span>
                            {'"'}
                          </>
                        ) : (
                          <span>
                            {searchResults?.results?.length || 0}
                            {activeTab === 'services' ? ' Services' : 
                             activeTab === 'healthcare' ? ' Healthcare Providers' : 
                             activeTab === 'resources' ? ' Resources' : ' Communities'}
                            {' Found'}
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>
                  )}
                </>
              )}
              
              {/* Results Content with premium glass design - Only show for non-Research mode */}
              {!searchResults?.metadata?.isResearchMode && (
                <div className="mt-3 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl shadow-purple-500/20 relative">
                  {(isLoading || searchResults?.metadata?.isLoading) ? (
                    <MascotLoadingDisplay
                      compact={true}
                      title={searchResults?.metadata?.loadingMessage || (activeTab === 'services' ? 'Discovery Mode Active' : 'Searching Communities')}
                      subtitle={activeTab === 'services' ? 'Searching across multiple global sources...' : `Analyzing ${searchQuery || 'all communities'}`}
                      showProgress={true}
                      progressDuration={activeTab === 'services' ? 30 : 15}
                      factRotationSpeed={5000}
                    />
                ) : (
                  <>
                    {/* Scroll indicator for more results - Outside scrollable area */}
                    {searchResults?.results && searchResults.results.length > 3 && (
                      <div className="absolute bottom-2 right-2 z-10 text-xs text-purple-400 bg-black/70 px-3 py-1 rounded-full animate-pulse flex items-center gap-1">
                        <span>↓</span>
                        <span>{searchResults.results.length - 3} more</span>
                      </div>
                    )}
                    
                    <div 
                      className="space-y-3 p-4 max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-transparent" 
                      style={{ 
                        willChange: 'auto',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#9333ea transparent'
                      }}>
                      {/* Graceful Fallback Message */}
                      {searchResults?.metadata?.fallbackApplied && (
                        <GracefulFallbackMessage
                          message={searchResults.metadata.fallbackMessage || "Oh no! We didn't find many communities matching all your filters, but here's what we found in your area!"}
                          originalResultCount={searchResults.metadata.originalResultCount || 0}
                          totalFallbackResults={searchResults?.results?.length || 0}
                          searchQuery={searchQuery}
                          location={searchResults.metadata.searchLocation}
                          careTypes={searchResults.metadata.careTypes}
                        />
                      )}
                      
                      {searchResults?.results && searchResults.results.length > 0 ? (
                        <>
                          {searchResults.results.slice(0, visibleResults).map((item: any, index: number) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.01 }}
                          >
                            {activeTab === 'services' ? (
                              <VendorServiceCard
                                vendor={item}
                                variant="list"
                                onSelect={() => {
                                  // Navigate to service details page, not external website
                                  window.location.href = `/service/${item.id}`;
                                }}
                              />
                            ) : activeTab === 'healthcare' ? (
                              // Enhanced Healthcare Provider Card with Hospital Data
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-xl transition-shadow border border-red-200 dark:border-red-800">
                                <div className="flex items-start gap-4">
                                  <div className="p-3 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-lg">
                                    <span className="text-2xl">
                                      {item.emergency_services ? '🚑' : item.hospital_type?.includes('Children') ? '👶' : '🏥'}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                          {item.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                          {item.city}, {item.state} {item.zip_code}
                                        </p>
                                      </div>
                                      {item.cms_rating && (
                                        <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">
                                          <span className="text-yellow-600 dark:text-yellow-400">⭐</span>
                                          <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                                            {item.cms_rating}/5
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Hospital Type and Emergency Status */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {item.hospital_type && (
                                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                          {item.hospital_type}
                                        </span>
                                      )}
                                      {item.emergency_services && (
                                        <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded font-semibold">
                                          24/7 Emergency
                                        </span>
                                      )}
                                      {item.trauma_level && (
                                        <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                          {item.trauma_level}
                                        </span>
                                      )}
                                      {item.bed_count && (
                                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 rounded">
                                          {item.bed_count} beds
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* Services/Specialties Preview */}
                                    {item.specialties && item.specialties.length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          Specialties: {item.specialties.slice(0, 3).join(', ')}
                                          {item.specialties.length > 3 && ` +${item.specialties.length - 3} more`}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {/* Contact Information */}
                                    <div className="flex items-center gap-4 mt-3">
                                      {item.phone && (
                                        <a href={`tel:${item.phone}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                          📞 {item.phone}
                                        </a>
                                      )}
                                      {item.emergency_phone && (
                                        <a href={`tel:${item.emergency_phone}`} className="text-sm text-red-600 dark:text-red-400 hover:underline font-semibold">
                                          🚨 Emergency: {item.emergency_phone}
                                        </a>
                                      )}
                                      {item.website && (
                                        <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                          🌐 Website
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : activeTab === 'resources' ? (
                              // Resource Card
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-xl transition-shadow border border-amber-200 dark:border-amber-800">
                                <div className="flex items-start gap-4">
                                  <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg">
                                    <span className="text-2xl">📚</span>
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                      {item.name || item.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {item.type || 'Educational Resource'} • {item.category || 'General'}
                                    </p>
                                    {item.description && (
                                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                        {item.description}
                                      </p>
                                    )}
                                    {item.url && (
                                      <button 
                                        onClick={() => window.open(item.url, '_blank')}
                                        className="mt-3 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
                                      >
                                        View Resource →
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <FeaturedExcellenceCard
                                community={item}
                                index={index}
                                disableAutoPhotoLoad={true}
                              />
                            )}
                          </motion.div>
                        ))}
                        
                        {/* Show More Button */}
                        {searchResults.results.length > visibleResults && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-center pt-4"
                          >
                            <button
                              onClick={() => setVisibleResults(prev => prev + 10)}
                              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                              Show More Results ({visibleResults} of {searchResults.results.length})
                            </button>
                          </motion.div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="inline-block"
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-40"></div>
                            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                              <MapPin className="w-16 h-16 text-white/60 mx-auto mb-4" />
                              <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
                              <p className="text-white/70">
                                {searchQuery 
                                  ? `We couldn't find any ${
                                      activeTab === 'services' ? 'services' : 
                                      activeTab === 'healthcare' ? 'healthcare providers' :
                                      activeTab === 'resources' ? 'resources' :
                                      'communities'
                                    } matching "${searchQuery}"`
                                  : "Try adjusting your search criteria"}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )}
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Combined Trust & Value Badges - Moved After Search Results */}
            <div className="w-full max-w-xl mx-auto px-2 sm:px-0 mt-4">
              <div className="flex flex-col gap-1">
                {/* First Line */}
                <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="flex items-center text-[9px] sm:text-[10px] text-emerald-300 font-semibold bg-emerald-900/30 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <span className="mr-0.5 text-[10px] sm:text-xs">💲</span> Online Bill Payment
                  </div>
                  <div className="flex items-center text-[9px] sm:text-[10px] text-cyan-300 font-semibold bg-cyan-900/30 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <span className="mr-0.5 text-[10px] sm:text-xs">🖥️</span> Resident Portal
                  </div>
                  <div className="flex items-center text-[9px] sm:text-[10px] text-pink-300 font-semibold bg-pink-900/30 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <span className="mr-0.5 text-[10px] sm:text-xs">👨‍👩‍👧‍👦</span> Family Collaboration Center
                  </div>
                </div>
                {/* Third Line - Security Badges */}
                <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="flex items-center text-[10px] sm:text-xs text-white font-semibold bg-blue-600/80 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="mr-0.5 text-[11px] sm:text-sm">🔒</span> SSL Secured
                  </div>
                  <div className="flex items-center text-[10px] sm:text-xs text-white font-semibold bg-green-600/80 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="mr-0.5 text-[11px] sm:text-sm">✓</span> No Login Required
                  </div>
                  <div className="flex items-center text-[10px] sm:text-xs text-white font-semibold bg-purple-600/80 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="mr-0.5 text-[11px] sm:text-sm">🎼</span> AI Orchestra (Perplexity, Grok, Claude, ChatGPT)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Back to Top Button - appears when there are many results */}
        {searchResults?.results?.length > 10 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
              aria-label="Back to top"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </motion.div>
        )}
        
        {/* Hero Mascot Panel - Temporarily disabled */}
        {/* {!isSearchActive && !searchQuery && !isSearchFocused && <HeroMascotPanel className="absolute bottom-2 sm:bottom-4 left-0 right-0 z-20" />} */}

    </>
  );
}

export default function MySeniorValetHome() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('communities');
  
  // Tab change handler that resets scroll position to prevent content pop glitch
  const handleTabChange = useCallback((newTab: string) => {
    // Scroll to top instantly when changing tabs to prevent content jumping
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    setActiveTab(newTab);
  }, []);
  
  // Parse URL search parameters for dynamic SEO
  const [urlSearchParams, setUrlSearchParams] = useState<URLSearchParams | null>(null);
  const [searchMetadata, setSearchMetadata] = useState<any>({});
  
  useEffect(() => {
    // Get URL parameters
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setUrlSearchParams(params);
      
      // Extract search parameters for SEO
      const location = params.get('location');
      const query = params.get('q') || params.get('query');
      const careType = params.get('careType');
      const city = params.get('city');
      const state = params.get('state');
      
      setSearchMetadata({ location, query, careType, city, state });
    }
  }, []);
  
  // Conditionally set SEO based on search parameters
  const hasSearchParams = urlSearchParams && (urlSearchParams.get('location') || urlSearchParams.get('q') || urlSearchParams.get('query'));
  
  // Always use the hook but conditionally set the parameters
  useSEO({
    title: hasSearchParams 
      ? 'Search Results | MySeniorValet' 
      : 'Assisted Living, Memory Care, Nursing Homes - Find Senior Housing Near You',
    description: hasSearchParams
      ? 'Search results for senior living communities'
      : 'Search 36,000+ senior living communities across USA, Canada, Mexico, Peru & Cuba with transparent pricing, verified HUD rates, and real availability. Compare assisted living, memory care, nursing homes. Free tour scheduling, family sharing tools, and senior resources.',
    keywords: hasSearchParams
      ? 'senior living search results'
      : 'senior living, assisted living, memory care, nursing homes, HUD senior housing, independent living, retirement communities, elder care, senior care facilities, Medicare, Medicaid, VA benefits, Canadian senior homes',
    canonicalUrl: hasSearchParams 
      ? undefined // Let DynamicSearchSEO handle canonical for search pages
      : 'https://www.myseniorvalet.com/'
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [discoveredCommunities, setDiscoveredCommunities] = useState<any[]>([]);

  // Listen for search queries dispatched from HeroSectionWithTransformingSearch
  useEffect(() => {
    const handler = (e: Event) => {
      const query = (e as CustomEvent).detail?.query;
      if (!query) return;
      setSearchQuery(query);
      setActiveTab('communities');
      setDiscoveredCommunities([]); // reset on new search

      // Fire background discovery and surface results in map panel
      fetch('/api/global-discovery/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, searchType: 'location', limit: 15, discoveryMode: true }),
        signal: AbortSignal.timeout(90000)
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return;
          const found: any[] = data.results || [];
          const newlyDiscovered = found.filter((c: any) => c.isDiscovered);
          if (newlyDiscovered.length > 0) {
            setDiscoveredCommunities(newlyDiscovered);
            queryClient.invalidateQueries({ queryKey: ['/api/communities/recently-discovered'] });
          }
        })
        .catch(() => {});
    };
    window.addEventListener('homeSearchQuery', handler);
    return () => window.removeEventListener('homeSearchQuery', handler);
  }, []);

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
  const [selectedCareType, setSelectedCareType] = useState(7); // Start with Active Adult 55+ selected
  const [touchStartX, setTouchStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const careTypes = [
    { 
      id: 'hud', 
      name: 'HUD Section 202', 
      icon: Building2, 
      color: 'bg-green-500', 
      description: 'Government-subsidized housing for very low-income seniors (50% AMI), offering rent at 30% of income with verified pricing.',
      details: 'Income-based rent • Federal oversight • Accessibility features',
      avgCost: '30% of income',
      keyFeatures: ['Income limit: 50% AMI', 'Residents pay only 30% of income', 'Long waiting lists']
    },
    {
      id: 'section811',
      name: 'Section 811',
      icon: Shield,
      color: 'bg-emerald-600',
      description: 'HUD\'s ONLY program specifically for disabled persons under 62, providing affordable accessible housing with support services.',
      details: 'Disability housing • Support services • Accessibility',
      avgCost: '30% of income',
      keyFeatures: ['For disabled under 62', 'Accessible units', 'Support services included']
    },
    {
      id: 'section8',
      name: 'Section 8',
      icon: Home,
      color: 'bg-lime-600',
      description: 'Housing Choice Vouchers allow seniors to rent from private landlords with government paying 70% of rent.',
      details: 'Rent vouchers • Private landlords • Portable benefits',
      avgCost: '30% of income',
      keyFeatures: ['Choose any approved housing', 'Government pays 70%', 'Portable vouchers']
    },
    { 
      id: 'senior-apartments',
      name: 'Senior Apartments',
      icon: Building,
      color: 'bg-sky-600',
      description: 'Age-restricted affordable apartment buildings for seniors 55+ or 62+, often with income limits.',
      details: 'Affordable rentals • Age-restricted • Community amenities',
      avgCost: '$800-2,000/month',
      keyFeatures: ['Age 55+ or 62+', 'Income qualified', 'Maintenance-free living']
    },
    { 
      id: 'mobile', 
      name: 'Mobile/RV Parks', 
      icon: Truck, 
      color: 'bg-orange-500', 
      description: 'Senior mobile home and RV communities where residents own their home but lease the land.',
      details: 'Lot rent • Community amenities • Flexible lifestyle',
      avgCost: '$300-1,200/month lot',
      keyFeatures: ['Own your home', 'Community lifestyle', 'Lower maintenance costs']
    },
    {
      id: 'cooperative',
      name: 'Co-op Housing',
      icon: Users,
      color: 'bg-violet-600',
      description: 'Cooperative senior housing where members own shares and participate in community decisions.',
      details: 'Member-owned • Shared costs • Democratic control',
      avgCost: '$600-1,500/month',
      keyFeatures: ['Own shares not unit', 'Vote on decisions', 'Shared maintenance']
    },
    {
      id: 'shared-housing',
      name: 'Shared Housing',
      icon: HeartHandshake,
      color: 'bg-rose-600',
      description: 'Home-sharing programs matching seniors as roommates to reduce costs and combat isolation.',
      details: 'Roommate matching • Cost sharing • Companionship',
      avgCost: '$400-800/month',
      keyFeatures: ['Split living costs', 'Background checks', 'Combat loneliness']
    },
    { 
      id: '55plus', 
      name: 'Active Adult 55+', 
      icon: Flag, 
      color: 'bg-pink-600', 
      description: 'Resort-style ownership communities for active adults 55+, with golf courses and luxury amenities.',
      details: 'Active lifestyle • Social programs • Age-restricted',
      avgCost: 'HOA $99-800/month',
      keyFeatures: ['Home ownership', 'Resort amenities', 'Golf, pools, activities']
    },
    {
      id: 'disability-centers',
      name: 'Disability Centers',
      icon: Heart,
      color: 'bg-amber-600',
      description: 'Centers for Independent Living and Action Centers helping disabled seniors find housing and services.',
      details: 'Resource centers • Advocacy • Housing assistance',
      avgCost: 'Free services',
      keyFeatures: ['Run by disabled people', 'Housing navigation', 'Benefits assistance']
    },
    { 
      id: 'independent', 
      name: 'Independent Living', 
      icon: Home, 
      color: 'bg-blue-600', 
      description: 'Senior rental communities with meals and services for those who don\'t need daily care.',
      details: 'Self-sufficient living • Optional services • Social activities',
      avgCost: '$3,065-3,145/month',
      keyFeatures: ['Meals included', 'Maintenance-free', 'Social activities']
    },
    {
      id: 'adult-day',
      name: 'Adult Day Centers',
      icon: Clock,
      color: 'bg-yellow-600',
      description: 'Daytime care programs providing activities, meals, and supervision while caregivers work.',
      details: 'Daytime only • Activities • Caregiver respite',
      avgCost: '$80-120/day',
      keyFeatures: ['Weekday programs', 'Social activities', 'Caregiver relief']
    },
    { 
      id: 'residential', 
      name: 'Personal Care Homes', 
      icon: Building, 
      color: 'bg-purple-700', 
      description: 'Small residential homes limited to 6-10 residents by state regulations, offering personalized care.',
      details: 'Home-like setting • Personal care • Small group living',
      avgCost: '$2,500-5,000/month',
      keyFeatures: ['6-10 residents only', 'Family atmosphere', 'High staff ratios']
    },
    {
      id: 'foster-care',
      name: 'Adult Foster Care',
      icon: Heart,
      color: 'bg-indigo-700',
      description: 'Licensed private homes providing care for 1-5 adults who need assistance with daily living.',
      details: 'Private home care • Very small setting • Family environment',
      avgCost: '$2,000-4,000/month',
      keyFeatures: ['1-5 residents', 'Family home setting', 'Personalized care']
    },
    { 
      id: 'assisted', 
      name: 'Assisted Living', 
      icon: HeartHandshake, 
      color: 'bg-cyan-600', 
      description: 'Communities providing help with activities of daily living (ADLs) with 24-hour staffing.',
      details: 'ADL assistance • Medication management • 24/7 staff',
      avgCost: '$5,190-6,129/month',
      keyFeatures: ['Help with daily tasks', 'Medication management', '24-hour staffing']
    },
    { 
      id: 'memory', 
      name: 'Memory Care', 
      icon: Brain, 
      color: 'bg-red-600', 
      description: 'Secure specialized care for Alzheimer\'s and dementia with wandering prevention systems.',
      details: 'Secure environment • Specialized programs • Expert staff',
      avgCost: '$6,450-7,292/month',
      keyFeatures: ['Secure unit', 'Dementia certified', 'Specialized activities']
    },
    {
      id: 'respite',
      name: 'Respite Care',
      icon: RefreshCw,
      color: 'bg-teal-700',
      description: 'Short-term temporary care giving family caregivers a break from caregiving duties.',
      details: 'Short-term stays • Caregiver relief • Trial periods',
      avgCost: '$150-500/day',
      keyFeatures: ['Few days to weeks', 'Caregiver vacation', 'Try before moving']
    },
    { 
      id: 'skilled', 
      name: 'Skilled Nursing', 
      icon: Stethoscope, 
      color: 'bg-teal-600', 
      description: '24-hour medical care and rehabilitation. Medicare covers first 20 days, then $209.50/day copay.',
      details: '24/7 nursing • Rehab services • Medical equipment',
      avgCost: '$9,555-10,965/month',
      keyFeatures: ['Medicare coverage', 'Physical therapy', 'Complex medical']
    },
    {
      id: 'hospice',
      name: 'Hospice Care',
      icon: Heart,
      color: 'bg-gray-600',
      description: 'End-of-life comfort care focusing on quality of life, pain management, and family support.',
      details: 'Comfort care • Pain management • Family support',
      avgCost: 'Medicare covered',
      keyFeatures: ['Medicare/Medicaid covered', 'Comfort focused', 'Family support']
    },
    { 
      id: 'ccrc', 
      name: 'CCRC/Life Plan', 
      icon: RefreshCw, 
      color: 'bg-indigo-600', 
      description: 'Continuing Care Retirement Communities with all levels on one campus.',
      details: 'Lifetime care • Multiple levels • Single campus',
      avgCost: 'Entry $300K + $3,747/mo',
      keyFeatures: ['All care levels', 'Age in place', 'Healthcare guarantee']
    },
    { 
      id: 'va', 
      name: 'VA Homes', 
      icon: Shield, 
      color: 'bg-purple-600', 
      description: 'Veterans Affairs facilities providing specialized care for military veterans and spouses.',
      details: 'Military benefits • Medical services • Honor programs',
      avgCost: 'Service-connected',
      keyFeatures: ['Veterans priority', 'Specialized care', 'Honor programs']
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
  
  // Load community stats after initial render to improve page load speed
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  useEffect(() => {
    // Defer stats loading to improve initial page load time
    const timer = setTimeout(() => setInitialLoadComplete(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Mobile-optimized queries with reduced memory footprint
  const { data: communityStats, isLoading } = useQuery<{ count: string; communities: string; services: string; isGlobal: boolean }>({
    queryKey: ["/api/communities/count"],
    retry: false,
    staleTime: 1 * 60 * 1000, // Cache for 1 minute for dynamic updates
    gcTime: 5 * 60 * 1000,   // Keep in cache for 5 minutes
    enabled: initialLoadComplete, // Defer to improve initial load time
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
      {/* SEO Meta Tags for Social Sharing */}
      <SEOMetaTags
        title="MySeniorValet - Find Assisted Living, Memory Care & Senior Housing"
        description="Compare assisted living, memory care, independent living, nursing homes & 24/7 caregiving options across 33,837+ communities. Verified pricing, real availability, no hidden fees."
        url="/"
        type="website"
        image="/og-image.png"
      />
      
      {/* JSON-LD Structured Data for SEO */}
      <StructuredData 
        data={[
          organizationSchema, 
          searchActionSchema,
          createBreadcrumbSchema([{ name: 'Home' }])
        ]} 
      />
      
      {/* Dynamic SEO for search pages */}
      {hasSearchParams && (
        <DynamicSearchSEO
          location={searchMetadata.location}
          query={searchMetadata.query}
          careType={searchMetadata.careType}
          city={searchMetadata.city}
          state={searchMetadata.state}
          totalResults={0} // Will be updated when search results are fetched
        />
      )}
      
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
      
      {/* Old header removed - using ProfessionalNavbar */}
      {/* Unified Tab System for Hero and Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Transforming Hero Section with Search - Mobile optimized */}
        {/* Hero section needs higher z-index so search dropdown appears above content */}
        <div className="relative z-20">
          <HeroSectionWithTransformingSearch activeTab={activeTab} onTabChange={handleTabChange} />
          
          {/* Tab Content - Peeks up into hero bottom */}
          <div className="relative -mt-[80px] sm:-mt-[100px] z-30">
            {/* Single unified content container */}
            <section className="px-4 pt-0 pb-8 rounded-t-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              {/* Personalized Banner - Compact */}
              <div className="max-w-6xl mx-auto mb-4">
                <PersonalizedBanner />
              </div>
              
              <div className="max-w-7xl mx-auto">
                {/* Communities Tab */}
                <TabsContent value="communities" className="mt-1">
              {/* Simplified Map Panel - shown above community directory content */}
              <div className="mb-8 px-2 sm:px-0">
                <SimplifiedMapPanel locationQuery={searchQuery} discoveredCommunities={discoveredCommunities} />
              </div>

              <div className="mb-8">
                <CareSpectrumSlider />
              </div>

              <NorthernCACitySections />

              <div className="mt-8">
                <RedTagDeals savingsOnly={true} />
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => window.location.href = '/map-search'}
                  className="h-auto bg-gray-800 hover:bg-gray-700 text-white px-3 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 border border-gray-600">
                  <div className="flex flex-col items-center">
                    <span className="text-xl mb-1">🔍</span>
                    <div className="text-xs sm:text-sm font-semibold leading-tight">Traditional Browse</div>
                    <div className="text-[10px] sm:text-xs text-gray-400 leading-tight">Filter & Sort</div>
                  </div>
                </Button>
                <Button 
                  onClick={() => window.location.href = '/ai-search-intelligence?mode=simplified'}
                  className="h-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-3 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
                  <div className="flex flex-col items-center">
                    <span className="text-xl mb-1">⚖️</span>
                    <div className="text-xs sm:text-sm font-semibold leading-tight">Side-by-Side</div>
                    <div className="text-[10px] sm:text-xs text-white/80 leading-tight">Compare Communities</div>
                  </div>
                </Button>
              </div>

              <Button 
                onClick={() => window.location.href = '/community-directory'}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white hover:opacity-90 shadow-lg transition-all relative overflow-hidden">
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                <span className="font-semibold">Explore Full National Directory</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </TabsContent>

      {/* Services Tab */}
      <TabsContent value="services" className="mt-1">
          {/* Recently Discovered Services Section */}
          <section className="relative overflow-hidden py-12 mt-8 rounded-xl">
            {/* Business District Twilight Background Image */}
            <div 
              className="absolute inset-0 z-0 rounded-xl"
              style={{
                backgroundImage: `url(${BusinessDistrictBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-purple-900/70 via-indigo-900/60 to-black/80 rounded-xl"></div>
            </div>
            
            <div className="relative z-10 container mx-auto px-4">
              {/* Section Title */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-8"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
                  <h2 className="text-xl sm:text-2xl font-medium text-white/90">Recently Discovered Services</h2>
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    HOT
                  </Badge>
                </div>
              </motion.div>

              {/* Services Carousel - Using VendorMarketplaceTabs for browsing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative max-w-7xl mx-auto"
              >
                <RecentlyDiscoveredServicesCarousel />
              </motion.div>
            </div>
          </section>

          {/* Browse Vendors by Category Section */}
          <section className="py-12 mt-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                Browse Vendors by Category
              </h2>
              <VendorMarketplaceTabs />
            </motion.div>
          </section>

      {/* Global Business & Services Discovery Section */}
      <section className="py-12 px-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="max-w-6xl mx-auto">
          <Link to="/senior-marketplace">
            <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-amber-400 relative overflow-hidden group transform hover:scale-[1.02]">
              <CardHeader className="relative z-10 pb-2">
                <CardTitle className="text-2xl sm:text-3xl">🌍 Global Business & Services Directory</CardTitle>
                <CardDescription className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  Market Transparency Through Public Data Citations
                </CardDescription>
              </CardHeader>
              <div className="relative h-48 sm:h-56 md:h-64 w-full">
                <img 
                  src={RetroShoppingSign} 
                  alt="Retro shopping center neon sign" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
                <div className="absolute top-4 left-4 p-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                  <span className="text-3xl">🛍️</span>
                </div>
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1">
                  COMMERCIAL
                </Badge>
              </div>
              <CardContent className="relative z-10">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  🌍 Research global businesses & services - All information cited from public sources for transparency
                </p>
                
                <div className="flex gap-3 mb-6">
                  <div className="space-y-2 flex-shrink-0 min-w-fit">
                    <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-300 dark:border-purple-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-purple-500 animate-pulse" />
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300">Affiliate Partners</span>
                        <Badge className="bg-purple-500 text-white text-[9px] px-1 py-0">AFFILIATE</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-3 w-3 text-purple-500" />
                          <span className="text-xs text-gray-700 dark:text-gray-300">Amazon Services</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gift className="h-3 w-3 text-purple-500" />
                          <span className="text-xs text-gray-700 dark:text-gray-300">1-800-Flowers™</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">1,500+</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Public Listings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Moving & Relocation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Legal & Financial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Transportation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Personal Services</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 ml-2 p-3 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-lg">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2 uppercase tracking-wide flex items-center gap-1">
                      <span>📊</span> Research Categories (Citation-Based)
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
                    </div>
                    <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-2 font-medium">
                      +more vendors
                    </p>
                  </div>
                </div>

                <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 flex items-start gap-1">
                    <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Research Methodology:</strong> Data aggregated from Google Maps, Yelp, public directories, and government databases. 
                      All sources are cited. Premium partnerships are transparently disclosed.
                    </span>
                  </p>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 group-hover:shadow-lg transition-all">
                  <Search className="mr-2 h-4 w-4" />
                  <span className="font-semibold">Research Businesses & Services</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Vendor Portal & Partner CTAs Section */}
      <section className="py-12 px-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <div className="max-w-6xl mx-auto">
          {/* Vendor Portal Card */}
          <Link to="/vendor-marketplace-tiers">
            <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-indigo-400 relative overflow-hidden group transform hover:scale-[1.02] mb-8">
              <div className="relative h-64 w-full">
                <img 
                  src={RetroVendorMarketplace} 
                  alt="Retro vendor marketplace sign" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
                <div className="absolute top-4 left-4 p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg">
                  <span className="text-3xl">🤝</span>
                </div>
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1">
                  VENDORS
                </Badge>
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl mb-2">Vendor Portal & Dashboard</CardTitle>
                <CardDescription className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Your Complete Vendor Management Experience
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Join 1,500+ Service Providers - Reach families nationwide with your senior care services.
                </p>
                
                <div className="flex gap-3 mb-6">
                  <div className="space-y-2 flex-shrink-0 min-w-fit">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
                      <span className="text-xl font-bold text-gray-900 dark:text-gray-100">$99-$499/mo</span>
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
                      <span className="text-sm text-gray-700 dark:text-gray-300">Lead Management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Premium Analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">API Integration</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 ml-2 p-3 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-lg">
                    <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2 uppercase tracking-wide flex items-center gap-1">
                      <span>🌎</span> 3 Partnership Tiers
                    </p>
                    <div className="h-52 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-indigo-300 dark:scrollbar-thumb-indigo-600 scrollbar-track-transparent">
                      <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Basic</p>
                          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">$99/mo</p>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Nationwide, up to 10 leads/mo</p>
                      </div>
                      <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded border border-purple-300 dark:border-purple-600">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">Featured ⭐</p>
                          <p className="text-xs font-bold text-purple-600 dark:text-purple-400">$249/mo</p>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Premium placement, up to 50 leads/mo</p>
                      </div>
                      <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 dark:from-purple-500/10 dark:to-blue-500/10 rounded">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">National Partner</p>
                          <p className="text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">$499/mo</p>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Unlimited leads, API access, white-label</p>
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

                <div className="mt-4 p-3 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-lg">
                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">🚀 Vendor Features Roadmap</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <CheckSquare className="h-3 w-3 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Smart Lead Routing</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckSquare className="h-3 w-3 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">ROI Analytics</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckSquare className="h-3 w-3 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Service Scheduler</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckSquare className="h-3 w-3 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Contract Manager</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckSquare className="h-3 w-3 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Multi-Territory</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckSquare className="h-3 w-3 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">White-Label</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 group-hover:shadow-lg transition-all mt-4">
                  <span className="font-semibold">Access Portal & Dashboard</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Partner CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/vendor-partner">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <Briefcase className="w-5 h-5 mr-2" />
                Become a Vendor Partner
              </Button>
            </Link>
            
            <Link to="/vendor-login">
              <Button size="lg" variant="outline" className="border-2 border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <LogIn className="w-5 h-5 mr-2" />
                Vendor Login Portal
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      </TabsContent>

      {/* Resources Tab */}
      <TabsContent value="resources" className="mt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* Senior Resources and Support Center */}
            <Link to="/senior-resources-center">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-purple-400 relative overflow-hidden group transform hover:scale-105">
                {/* Title ABOVE the image */}
                <CardHeader className="relative z-10 pb-2">
                  <CardTitle className="text-xl sm:text-2xl">📚 Senior Resources & Support Center</CardTitle>
                  <CardDescription className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Your Guide to Benefits, Legal, Financial & Community Resources
                  </CardDescription>
                </CardHeader>
                {/* Full-size Retro Library Sign Image */}
                <div className="relative h-48 sm:h-56 md:h-64 w-full">
                  <img 
                    src={RetroLibrarySign} 
                    alt="Retro library resource center sign" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Overlay elements on the image */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
                  <div className="absolute top-4 left-4 p-4 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg">
                    <span className="text-3xl">📚</span>
                  </div>
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1">
                    RESOURCES
                  </Badge>
                </div>
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
            <Link to="/family-collaboration">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-rose-400 relative overflow-hidden group transform hover:scale-105">
                {/* Full-size Retro Family Living Room Image at top of card */}
                <div className="relative h-64 w-full">
                  <img 
                    src={RetroGuestServices} 
                    alt="Retro guest services welcome sign" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Overlay elements on the image */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
                  <div className="absolute top-4 left-4 p-4 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg">
                    <span className="text-3xl">👨‍👩‍👧‍👦</span>
                  </div>
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1">
                    FAMILIES
                  </Badge>
                </div>
                <CardHeader className="relative z-10">
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

          </div>

          {/* Recently Discovered Resources Section */}
          <div className="mt-12">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Recently Discovered Resources
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Real-time discoveries from across the web with verified pricing information
              </p>
            </div>
            <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl p-6">
              <RecentlyDiscoveredResourcesCarousel />
            </div>
          </div>
      </TabsContent>

      {/* Healthcare Tab */}
      <TabsContent value="healthcare" className="mt-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {/* Global Healthcare Discovery Platform */}
          <Link to="/senior-healthcare-directory">
            <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-teal-400 relative overflow-hidden group transform hover:scale-105">
              {/* Title ABOVE the image */}
              <CardHeader className="relative z-10 pb-2">
                <CardTitle className="text-xl sm:text-2xl">🏥 Global Healthcare Discovery Platform</CardTitle>
                <CardDescription className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Research Healthcare Providers Worldwide
                </CardDescription>
              </CardHeader>
              {/* Full-size Retro Medical Sign Image */}
              <div className="relative h-48 sm:h-56 md:h-64 w-full">
                <img 
                  src={RetroMedicalSign} 
                  alt="Retro medical clinic neon sign" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Overlay elements on the image */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
                <div className="absolute top-4 left-4 p-4 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 text-white shadow-lg">
                  <span className="text-3xl">🏥</span>
                </div>
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-3 py-1">
                  HEALTHCARE
                </Badge>
              </div>
              <CardContent className="relative z-10">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  🌍 Research hospitals, clinics, specialists, and healthcare services globally. From CMS-certified facilities in the US to international medical centers, therapy services, and specialized care providers anywhere in the world.
                </p>
                
                {/* Flex container for side-by-side layout */}
                <div className="flex gap-3 mb-6">
                  {/* Left side - Provider count and Checkmarks */}
                  <div className="space-y-2 flex-shrink-0 min-w-fit">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="h-5 w-5 text-green-500" />
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">Unlimited</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Global Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Hospitals Worldwide</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">International Clinics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Medical Tourism</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Specialists Globally</span>
                    </div>
                  </div>
                  
                  {/* Right side - Maximum Height Scrollable Preview */}
                  <div className="flex-1 ml-2 p-3 bg-gradient-to-br from-teal-50/50 to-blue-50/50 dark:from-teal-900/10 dark:to-blue-900/10 rounded-lg">
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2 uppercase tracking-wide flex items-center gap-1">
                      <span>🌍</span> Healthcare Categories Worldwide
                    </p>
                    <div className="h-52 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-teal-300 dark:scrollbar-thumb-teal-600 scrollbar-track-transparent">
                      <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <span className="text-xs">🏥</span>
                        <p className="text-xs text-gray-700 dark:text-gray-300">CMS-Certified Hospitals</p>
                      </div>
                      <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <span className="text-xs">🏠</span>
                        <p className="text-xs text-gray-700 dark:text-gray-300">Respite Care Services</p>
                      </div>
                      <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <span className="text-xs">💊</span>
                        <p className="text-xs text-gray-700 dark:text-gray-300">Personal Care Services</p>
                      </div>
                      <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <span className="text-xs">🩺</span>
                        <p className="text-xs text-gray-700 dark:text-gray-300">Home Care Services</p>
                      </div>
                      <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <span className="text-xs">🔬</span>
                        <p className="text-xs text-gray-700 dark:text-gray-300">Therapy Services</p>
                      </div>
                      <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <span className="text-xs">🌿</span>
                        <p className="text-xs text-gray-700 dark:text-gray-300">Hospice Care</p>
                      </div>
                      <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <span className="text-xs">🏥</span>
                        <p className="text-xs text-gray-700 dark:text-gray-300">Adult Day Programs</p>
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
                      All Countries • Real-Time Discovery
                    </p>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:opacity-90 group-hover:shadow-lg transition-all">
                  <Search className="mr-2 h-4 w-4" />
                  <span className="font-semibold">Research Healthcare Worldwide</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recently Discovered Healthcare Section */}
        <div className="mt-12">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
              Recently Discovered Healthcare Providers
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Real-time discoveries from across the web with verified pricing information
            </p>
          </div>
          <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-xl p-6">
            <RecentlyDiscoveredHealthcareCarousel />
          </div>
        </div>
      </TabsContent>

      {/* Marketplace Tab - Consumer Products */}
      <TabsContent value="marketplace" className="mt-1">
        <div className="space-y-8">
          {/* Resident Portal Section at Top */}
          <div className="max-w-4xl mx-auto">
            <Link to="/resident-dashboard">
              <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-indigo-400 relative overflow-hidden group transform hover:scale-[1.02]">
                {/* Title ABOVE the image */}
                <CardHeader className="relative z-10 pb-2">
                  <CardTitle className="text-xl sm:text-2xl">Resident Portal & Dashboard</CardTitle>
                  <CardDescription className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Your Complete Community Living Experience
                  </CardDescription>
                </CardHeader>
                {/* Full-size Cosmic Image */}
                <div className="relative h-48 sm:h-56 md:h-64 w-full">
                  <img 
                    src={RetroFamilyLivingRoom}
                    alt="Home Sweet Home - Your warm welcome" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Overlay elements on the image */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent"></div>
                  <div className="absolute top-4 left-4 p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                    <Home className="h-8 w-8" />
                  </div>
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1">
                    RESIDENT ACCESS
                  </Badge>
                </div>
                <CardContent className="relative z-10">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Access all resident services in one place - billing, dining, transportation, maintenance, activities & more
                  </p>
                  
                  {/* Flex container for side-by-side layout - stacks on mobile */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Left side - Service Categories */}
                    <div className="space-y-2 md:flex-shrink-0 md:min-w-fit">
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="h-5 w-5 text-indigo-500" />
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">All Services</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Billing & Payments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Dining Menus</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Transportation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Maintenance Requests</span>
                      </div>
                    </div>
                    
                    {/* Right side - Features Preview */}
                    <div className="flex-1 md:ml-2 p-3 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-lg">
                      <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2 uppercase tracking-wide flex items-center gap-1">
                        <span>🏠</span> Quick Access
                      </p>
                      <div className="h-52 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-indigo-300 dark:scrollbar-thumb-indigo-600 scrollbar-track-transparent">
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <DollarSign className="h-3 w-3 text-green-600" />
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Pay Monthly Rent</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <Calendar className="h-3 w-3 text-blue-600" />
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Daily Activities Schedule</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <UtensilsCrossed className="h-3 w-3 text-orange-600" />
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Today's Menu</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <Bus className="h-3 w-3 text-purple-600" />
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Book Transportation</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <Wrench className="h-3 w-3 text-gray-600" />
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Submit Maintenance Request</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <Heart className="h-3 w-3 text-red-600" />
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Wellness Check-In</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <Users className="h-3 w-3 text-indigo-600" />
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Family Communication</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <FileText className="h-3 w-3 text-teal-600" />
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">View Statements</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <MessageSquare className="h-3 w-3 text-yellow-600" />
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Community Announcements</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <Shield className="h-3 w-3 text-emerald-600" />
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Emergency Contacts</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <Video className="h-3 w-3 text-pink-600" />
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Video Call Family</p>
                        </div>
                        <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <Briefcase className="h-3 w-3 text-brown-600" />
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Personal Documents</p>
                        </div>
                      </div>
                      <p className="text-xs text-center text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
                        Your Community Life • All in One Place
                      </p>
                    </div>
                  </div>

                  {/* Horizontal Action Buttons Row */}
                  <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Quick Bill Pay */}
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        window.location.href = '/resident-billing-portal';
                      }}
                      className="h-auto bg-green-600 hover:bg-green-700 text-white px-2 py-2 rounded-md font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
                      <div className="flex flex-col items-center">
                        <DollarSign className="h-5 w-5 mb-1" />
                        <div className="text-[10px] font-semibold leading-tight">Pay Bill</div>
                        <div className="text-[8px] text-white/80 leading-tight">Quick Pay</div>
                      </div>
                    </Button>

                    {/* Dining Menu */}
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        window.location.href = '/dining-menu-viewer';
                      }}
                      className="h-auto bg-orange-600 hover:bg-orange-700 text-white px-2 py-2 rounded-md font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
                      <div className="flex flex-col items-center">
                        <UtensilsCrossed className="h-5 w-5 mb-1" />
                        <div className="text-[10px] font-semibold leading-tight">Dining</div>
                        <div className="text-[8px] text-white/80 leading-tight">Today's Menu</div>
                      </div>
                    </Button>

                    {/* Transportation */}
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        window.location.href = '/transportation-scheduler';
                      }}
                      className="h-auto bg-purple-600 hover:bg-purple-700 text-white px-2 py-2 rounded-md font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
                      <div className="flex flex-col items-center">
                        <Bus className="h-5 w-5 mb-1" />
                        <div className="text-[10px] font-semibold leading-tight">Transport</div>
                        <div className="text-[8px] text-white/80 leading-tight">Book Ride</div>
                      </div>
                    </Button>

                    {/* Maintenance */}
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        window.location.href = '/maintenance-request-portal';
                      }}
                      className="h-auto bg-gray-600 hover:bg-gray-700 text-white px-2 py-2 rounded-md font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
                      <div className="flex flex-col items-center">
                        <Wrench className="h-5 w-5 mb-1" />
                        <div className="text-[10px] font-semibold leading-tight">Maintenance</div>
                        <div className="text-[8px] text-white/80 leading-tight">Request</div>
                      </div>
                    </Button>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:opacity-90 group-hover:shadow-lg transition-all relative overflow-hidden">
                    <span className="absolute inset-0 bg-white/20 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
                    <Home className="mr-2 h-4 w-4" />
                    <span className="font-semibold">Access Your Resident Dashboard</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Vendor Categories Title */}
          <div className="text-center">
            <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 mb-4">
              <ShoppingCart className="h-4 w-4 mr-2" />
              SENIOR LIVING MARKETPLACE
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Products & Services for Senior Living
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Carefully curated products and services to enhance quality of life, safety, and comfort
            </p>
          </div>
          
          {/* Vendor Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Medical Equipment & Supplies */}
            <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-red-400 hover:border-red-500 group cursor-pointer">
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-red-500 to-pink-500">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Stethoscope className="h-20 w-20 text-white opacity-50" />
                </div>
                <Badge className="absolute top-4 right-4 bg-white text-red-600 px-3 py-1">
                  MEDICAL
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Medical Equipment & Supplies</CardTitle>
                <CardDescription>Hospital beds, wheelchairs, oxygen equipment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Hospital beds & mattresses</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Wheelchairs & scooters</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Oxygen & respiratory</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Wound care supplies</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white hover:opacity-90">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Browse Medical Supplies
                </Button>
              </CardContent>
            </Card>
            
            {/* Mobility & Safety */}
            <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-blue-400 hover:border-blue-500 group cursor-pointer">
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="h-20 w-20 text-white opacity-50" />
                </div>
                <Badge className="absolute top-4 right-4 bg-white text-blue-600 px-3 py-1">
                  SAFETY
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Mobility & Safety Solutions</CardTitle>
                <CardDescription>Walking aids, bathroom safety, fall prevention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Walking aids & canes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Grab bars & rails</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Shower chairs & benches</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Fall detection systems</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90">
                  <Shield className="mr-2 h-4 w-4" />
                  Shop Safety Products
                </Button>
              </CardContent>
            </Card>
            
            {/* Daily Living Aids */}
            <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-green-400 hover:border-green-500 group cursor-pointer">
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-green-500 to-emerald-500">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Home className="h-20 w-20 text-white opacity-50" />
                </div>
                <Badge className="absolute top-4 right-4 bg-white text-green-600 px-3 py-1">
                  DAILY LIVING
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Daily Living Aids</CardTitle>
                <CardDescription>Adaptive clothing, eating aids, personal care</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Adaptive clothing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Eating & drinking aids</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Dressing aids</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Medication organizers</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90">
                  <Home className="mr-2 h-4 w-4" />
                  Explore Living Aids
                </Button>
              </CardContent>
            </Card>
            
            {/* Technology & Communication */}
            <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-purple-400 hover:border-purple-500 group cursor-pointer">
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-500">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wifi className="h-20 w-20 text-white opacity-50" />
                </div>
                <Badge className="absolute top-4 right-4 bg-white text-purple-600 px-3 py-1">
                  TECHNOLOGY
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Technology & Communication</CardTitle>
                <CardDescription>Emergency systems, tablets, hearing devices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Medical alert systems</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Senior-friendly tablets</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Hearing amplifiers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Video calling devices</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90">
                  <Wifi className="mr-2 h-4 w-4" />
                  View Tech Solutions
                </Button>
              </CardContent>
            </Card>
            
            {/* Comfort & Wellness */}
            <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-amber-400 hover:border-amber-500 group cursor-pointer">
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="h-20 w-20 text-white opacity-50" />
                </div>
                <Badge className="absolute top-4 right-4 bg-white text-amber-600 px-3 py-1">
                  COMFORT
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Comfort & Wellness</CardTitle>
                <CardDescription>Lift chairs, massage, therapy products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Lift chairs & recliners</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Massage equipment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Therapy products</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Comfort bedding</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90">
                  <Heart className="mr-2 h-4 w-4" />
                  Browse Comfort Items
                </Button>
              </CardContent>
            </Card>
            
            {/* Vision & Hearing */}
            <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-teal-400 hover:border-teal-500 group cursor-pointer">
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-teal-500 to-cyan-500">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Eye className="h-20 w-20 text-white opacity-50" />
                </div>
                <Badge className="absolute top-4 right-4 bg-white text-teal-600 px-3 py-1">
                  SENSORY
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Vision & Hearing Solutions</CardTitle>
                <CardDescription>Magnifiers, large print, hearing aids</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Magnifying devices</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Large print items</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Hearing aids</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">TV audio systems</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:opacity-90">
                  <Eye className="mr-2 h-4 w-4" />
                  Shop Sensory Aids
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
            </div>
          </section>
          </div>
        </div>
      </Tabs>

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

      {/* Quick Access Tools Section */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 border-2 border-blue-200 dark:border-blue-600">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
                Quick Access Tools
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setLocation('/emergency-contacts')}
                >
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <span className="text-xs">Emergency</span>
                </Button>
                <Button 
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setLocation('/tours')}
                >
                  <Calendar className="h-6 w-6 text-blue-500" />
                  <span className="text-xs">Schedule Tour</span>
                </Button>
                <Button 
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setLocation('/senior-healthcare-directory')}
                >
                  <Brain className="h-6 w-6 text-purple-500" />
                  <span className="text-xs">Care Guide</span>
                </Button>
                <Button 
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setLocation('/ai-support')}
                >
                  <HeartHandshake className="h-6 w-6 text-green-500" />
                  <span className="text-xs">AI Support</span>
                </Button>
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
