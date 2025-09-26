import { useState, useEffect, useRef, useCallback } from "react";
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
import { Search, Heart, MapPin, Star, Home, Building2, DollarSign, Users, Info, MessageCircle, Link2, Truck, Sofa, Pill, Eye, Clock, Phone, Brain, Sparkles, Building, Ambulance, Package, CheckCircle, CheckSquare, Stethoscope, Activity, ShieldCheck, Scale, Utensils, UtensilsCrossed, Car, Bus, Scissors, Users2, FileText, Calculator, ShoppingCart, Trash2, Flower, TrendingUp, Shield, ArrowRight, Shirt as ShirtIcon, RefreshCw, ExternalLink, Globe, HeartHandshake, ChevronRight, ChevronLeft, BarChart, BarChart3, Calendar, X, Flag, Languages, Layers, ShoppingBasket, AlertCircle, AlertTriangle, AlertOctagon, Briefcase, LogIn, UserCheck, Smartphone, BookOpen, ShoppingBag, GraduationCap, MessageSquare, Monitor, Flame, Filter, XCircle, Unlock, Book, Music, Send, List, Wrench, Video, Gift } from "lucide-react";
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
import { 
  CommunitiesTabContent, 
  ServicesTabContent, 
  HealthcareTabContent, 
  ResourcesTabContent, 
  VendorsTabContent 
} from './myseniorvalet-home-sections';
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
      "🌍 Try 'Walkers' or 'Medical supplies'...",
      "🌍 Search 'Mobility aids' or 'Hospital beds'...",
      "🌍 Find 'Bath safety' or 'Compression stockings'...",
      "🌍 Explore 'Supplements' or 'Daily living aids'...",
      "🌍 Discover 'Safety equipment' or 'Comfort products'..."
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
    ]
  }
};

// Simplified Hero Section with Fixed Search Bar
function HeroSectionWithTransformingSearch({ activeTab, setActiveTab }: { 
  activeTab: 'communities' | 'services' | 'healthcare' | 'resources' | 'vendors';
  setActiveTab: (tab: 'communities' | 'services' | 'healthcare' | 'resources' | 'vendors') => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<any>({ results: [], metadata: null });
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'discover'>('discover');
  const [showGlobalDiscoveryModal, setShowGlobalDiscoveryModal] = useState(false);
  const [globalDiscoveryResults, setGlobalDiscoveryResults] = useState<any>(null);
  const [forceClearAutocomplete, setForceClearAutocomplete] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const searchCategory = activeTab; // Use the prop instead of local state
  const setSearchCategory = setActiveTab; // Use the prop setter
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
            searchType: searchCategory === 'services' ? 'services' : 'location',
            limit: 50,
            discoveryMode: true  // CRITICAL: This flag tells the backend to actually search the web
          }),
          signal: AbortSignal.timeout(60000) // 60 second timeout for Discovery Mode
        });
        
        if (response.ok) {
          const data = await response.json();
          setGlobalDiscoveryResults({
            query,
            results: data.results || [],
            metadata: {...(data.metadata || {}), discoveryType: searchCategory}
          });
          setForceClearAutocomplete(true);
          setShowGlobalDiscoveryModal(true);
          setIsLoading(false);
          setSearchResults({ results: [], metadata: null });
          return;
        }
      } catch (error) {
        console.error('Discovery Mode error:', error);
        setSearchResults({ 
          results: [],
          metadata: {
            aiResponse: "Discovery Mode search timed out or failed. This usually means we're experiencing high demand. Please try again in a moment, or try a simpler search.",
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
    
    // Check for explicitly international locations (countries only, not ambiguous city names)
    const internationalCountries = [
      'canada', 'mexico', 'uk', 'united kingdom', 'england', 'scotland', 'wales', 
      'france', 'germany', 'spain', 'italy', 'japan', 'china', 'australia', 
      'brazil', 'india', 'russia', 'south africa', 'argentina', 'chile', 'sweden',
      'norway', 'denmark', 'finland', 'netherlands', 'belgium', 'switzerland',
      'austria', 'portugal', 'greece', 'poland', 'ireland', 'new zealand'
    ];
    
    const isInternationalSearch = 
      !isUSLocation && 
      internationalCountries.some(country => new RegExp(`\\b${country}\\b`, 'i').test(queryLower));
    
    // Only auto-trigger Discovery Mode for international searches if viewMode is 'discover'
    // For 'list' mode (Database Search), let it search the database normally
    if (isInternationalSearch && viewMode === 'discover') {
      console.log('🌍 International search auto-detected for:', query);
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/global-discovery/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query, 
            searchType: searchCategory === 'services' ? 'services' : 'location',
            limit: 50 
          }),
          signal: AbortSignal.timeout(60000) // 60 second timeout for international searches
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            setGlobalDiscoveryResults({
              query,
              results: data.results,
              metadata: data.metadata
            });
            setForceClearAutocomplete(true);
            setShowGlobalDiscoveryModal(true);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('International discovery error:', error);
      }
      setIsLoading(false);
    }

    // Handle map view redirect
    if (viewMode === 'map' && query) {
      const categoryParam = searchCategory !== 'communities' ? `&category=${searchCategory}` : '';
      setLocation(`/map-search?q=${encodeURIComponent(query)}${categoryParam}`);
      return;
    }

    setIsSearchActive(true);
    setVisibleResults(10); // Reset to show first 10 results for new search
    setIsLoading(true);

    try {
      // Discovery mode for Communities - use global discovery to find facilities
      if (viewMode === 'discover' && searchCategory === 'communities') {
        // Call global discovery endpoint to find actual facilities
        const response = await fetch('/api/global-discovery/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: query,
            searchType: 'location',
            limit: 20,
            discoveryMode: true  // Explicitly set Discovery Mode flag
          }),
          signal: AbortSignal.timeout(60000) // 60 second timeout for Discovery Mode
        });

        if (!response.ok) throw new Error('Discovery search failed');
        
        const data = await response.json();
        
        // Show discovered facilities in modal
        if (data.results && data.results.length > 0) {
          setGlobalDiscoveryResults({
            query,
            results: data.results,
            metadata: {...data.metadata, discoveryType: 'communities'}
          });
          setForceClearAutocomplete(true);
          setShowGlobalDiscoveryModal(true);
        } else {
          // No facilities found, show message
          setSearchResults({ 
            results: [],
            metadata: {
              aiResponse: `No senior living facilities found in ${query} yet. Try a different city or check back later as we expand our coverage.`,
              isResearchMode: false
            }
          });
        }
        
      } else if (viewMode === 'discover' && searchCategory === 'services') {
        // For services, use NLP search which searches both services and vendors tables
        // This will find hotels, restaurants, and other discovered businesses
        
        // Show immediate loading feedback for services search
        setSearchResults({ 
          results: [],
          metadata: {
            isLoading: true,
            loadingMessage: `Searching for service providers related to "${query}"...`,
            isResearchMode: false
          }
        });
        
        // Use NLP search for services (searches both services and vendors tables)
        try {
          const response = await fetch('/api/nlp/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              query: query,
              limit: 50,
              category: 'services'
            }),
            signal: AbortSignal.timeout(30000) // 30 second timeout
          });

          if (!response.ok) {
            throw new Error(`Service search failed: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Extract the actual data from the NLP search results
          const results = data.results?.map((r: any) => r.data || r) || [];
          
          // Show discovered services
          if (results.length > 0) {
            setSearchResults({ 
              results: results,
              metadata: {
                intent: data.intent,
                facets: data.facets,
                suggestions: data.suggestions
              }
            });
          } else {
            // No services found, show helpful message with suggestions
            setSearchResults({ 
              results: [],
              metadata: {
                aiResponse: `No service providers found for "${query}". Try searching for:\n• A specific city (e.g., "plumbers in Dallas")\n• A service type (e.g., "home health care")\n• A business name (e.g., "Visiting Angels")`,
                isResearchMode: false,
                suggestions: [
                  'home health care',
                  'medical supplies',
                  'senior transportation',
                  'meal delivery services'
                ]
              }
            });
          }
          
        } catch (error) {
          console.error('Service discovery search failed:', error);
          setSearchResults({ 
            results: [],
            metadata: {
              aiResponse: `Unable to search for services at the moment. Please try again in a few seconds.`,
              error: true,
              isResearchMode: false
            }
          });
        }
        
      } else if (isResearchMode || (viewMode === 'discover' && searchCategory !== 'communities' && searchCategory !== 'services')) {
        // Use Public AI Chat for research mode or non-implemented discovery categories
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
        // Regular search for list/map view - use comprehensive search for communities
        if (searchCategory === 'communities') {
          // Use the comprehensive search endpoint for community searches
          const response = await fetch(`/api/search/comprehensive?q=${encodeURIComponent(query)}&limit=50`);
          
          if (!response.ok) {
            // Fallback to unified search
            await handleUnifiedSearch(query);
          } else {
            const data = await response.json();
            const communities = data.communities || [];
            
            // Extract Discovery Mode data from searchMetadata
            const metadata = data.searchMetadata || {};
            
            setSearchResults({ 
              results: communities, 
              metadata: {
                total: data.total,
                searchMetadata: metadata,
                suggestions: data.suggestions,
                // Discovery Mode specific data
                discoveryMode: metadata.discoveryMode,
                discoveryMessage: metadata.discoveryMessage,
                aiSuggestions: metadata.aiSuggestions
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
              category: searchCategory
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
          searchType: searchCategory, // Pass the current search category
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
        
        <div className="relative z-10 flex flex-col h-full min-h-screen px-2 sm:px-4 py-4 sm:py-8">
        {/* Hero Title - Positioned at Very Top on Mobile, Better Centered on Desktop */}
        <div className="w-full text-center pt-4 sm:pt-8 md:pt-12 lg:pt-16">
          <div className="inline-block bg-black/20 backdrop-blur-sm rounded-2xl px-3 sm:px-6 py-2 sm:py-4 max-w-[95vw] lg:max-w-[90vw] sm:max-w-none animate-fade-in">
            {/* Main Tagline - Responsive Text Sizing with Gradient Effect */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-3 sm:mb-4 whitespace-nowrap">
              <span className="inline-block animate-slide-in-left bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]">One Platform.</span>
              <span className="inline-block animate-slide-in-left text-white ml-2 drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">Every Step of the Journey.</span>
            </h1>
            
            {/* Platform Description - Enhanced Readability with Better Contrast */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 sm:py-3 max-w-4xl mx-auto animate-fade-in-delayed">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white font-medium leading-relaxed">
                <span className="text-blue-200 font-semibold">My Senior Valet</span> is an AI-powered platform for transparent senior living — compare communities, pricing, and reviews, book tours instantly, reserve with ease, and access local care and resources — all in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Content Container - Search First, Then Value Props */}
        <div className={`flex-grow flex flex-col ${isSearchActive ? 'justify-start pt-2' : 'justify-center'}`}>
        
        {/* Unified Search Component */}
        <div className="w-full max-w-full sm:max-w-2xl md:max-w-xl lg:max-w-xl mx-auto px-2 sm:px-0 relative z-40 mb-6">
          {/* Category Tabs - Sleek Modern Style */}
          <div className="flex justify-center overflow-x-auto">
            <div className="inline-flex bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-lg p-0.5 rounded-t-2xl">
              <button
                type="button"
                onClick={() => setSearchCategory('communities')}
                className={`relative px-1.5 sm:px-5 md:px-6 py-1.5 sm:py-3 md:py-4 transition-all duration-300 text-xs sm:text-base md:text-lg lg:text-xl font-semibold flex items-center gap-0.5 sm:gap-2 rounded-t-xl
                  ${searchCategory === 'communities' 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span className="text-xs sm:text-lg md:text-xl lg:text-2xl">🏘️</span>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[9px] sm:text-sm">Communities</span>
                  <span className="text-[7px] sm:text-xs opacity-75 mt-0.5">{communityStats?.communities || '33.5k'}</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSearchCategory('services')}
                className={`relative px-1.5 sm:px-5 md:px-6 py-1.5 sm:py-3 md:py-4 transition-all duration-300 text-xs sm:text-base md:text-lg lg:text-xl font-semibold flex items-center gap-0.5 sm:gap-2 rounded-t-xl
                  ${searchCategory === 'services' 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span className="text-xs sm:text-lg md:text-xl lg:text-2xl">🛍️</span>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[9px] sm:text-sm">Services</span>
                  <span className="text-[7px] sm:text-xs opacity-75 mt-0.5">All Biz</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSearchCategory('healthcare')}
                className={`relative px-1.5 sm:px-5 md:px-6 py-1.5 sm:py-3 md:py-4 transition-all duration-300 text-xs sm:text-base md:text-lg lg:text-xl font-semibold flex items-center gap-0.5 sm:gap-2 rounded-t-xl
                  ${searchCategory === 'healthcare' 
                    ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span className="text-xs sm:text-lg md:text-xl lg:text-2xl">🏥</span>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[9px] sm:text-sm">Healthcare</span>
                  <span className="text-[7px] sm:text-xs opacity-75 mt-0.5">Global</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSearchCategory('resources')}
                className={`relative px-1.5 sm:px-5 md:px-6 py-1.5 sm:py-3 md:py-4 transition-all duration-300 text-xs sm:text-base md:text-lg lg:text-xl font-semibold flex items-center gap-0.5 sm:gap-2 rounded-t-xl
                  ${searchCategory === 'resources' 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span className="text-xs sm:text-lg md:text-xl lg:text-2xl">📚</span>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[9px] sm:text-sm">Resources</span>
                  <span className="text-[7px] sm:text-xs opacity-75 mt-0.5">Support</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSearchCategory('vendors')}
                className={`relative px-1.5 sm:px-5 md:px-6 py-1.5 sm:py-3 md:py-4 transition-all duration-300 text-xs sm:text-base md:text-lg lg:text-xl font-semibold flex items-center gap-0.5 sm:gap-2 rounded-t-xl
                  ${searchCategory === 'vendors' 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span className="text-xs sm:text-lg md:text-xl lg:text-2xl">🛒</span>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[9px] sm:text-sm">Vendors</span>
                  <span className="text-[7px] sm:text-xs opacity-75 mt-0.5">Products</span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Search Bar Container - Enhanced styling */}
          <div className={`w-full rounded-b-xl rounded-tr-xl relative z-10 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 backdrop-blur-xl border-2 border-t-0 pb-8 sm:pb-10 pt-2 sm:pt-3 px-2 sm:px-3 shadow-2xl ${
            searchCategory === 'services'
              ? 'border-amber-500 dark:border-amber-600' 
              : searchCategory === 'healthcare'
              ? 'border-teal-500 dark:border-teal-600' 
              : searchCategory === 'resources'
              ? 'border-purple-500 dark:border-purple-600'
              : searchCategory === 'vendors'
              ? 'border-indigo-500 dark:border-indigo-600' 
              : 'border-blue-500 dark:border-blue-600'
          }`}>
            <div className={`rounded-lg transition-all duration-300 p-1 shadow-lg border ${
              searchCategory === 'services'
                ? 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-200/50 dark:border-amber-700/50'
                : searchCategory === 'healthcare'
                ? 'bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 border-teal-200/50 dark:border-teal-700/50'
                : searchCategory === 'resources'
                ? 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200/50 dark:border-purple-700/50'
                : searchCategory === 'vendors'
                ? 'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 border-indigo-200/50 dark:border-indigo-700/50'
                : 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200/50 dark:border-blue-700/50'
            }`}>
              {/* Search component wrapper */}
              <div>
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
                isLoading={isLoading}
                inputClassName="w-full pl-10 pr-6 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl lg:text-2xl border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                forceClearSuggestions={forceClearAutocomplete}
              />
            </div>
            </div>
            
            {/* View Mode Tabs - Bottom tabs attached to search box with transparent style */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-20 w-[calc(100%-1rem)] sm:w-auto">
              <div className="flex gap-1 sm:gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`relative px-3 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 transition-all duration-300 text-xs sm:text-base md:text-lg lg:text-xl font-semibold flex items-center gap-1 sm:gap-2 rounded-xl
                    ${viewMode === 'list' 
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg'
                      : 'bg-gray-700 dark:bg-gray-800 text-white border border-gray-600 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-700 shadow-md'
                    }`}
                >
                  <span className="text-sm sm:text-lg md:text-xl lg:text-2xl">🔍</span>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[11px] sm:text-base">Database</span>
                    <span className="text-[9px] sm:text-xs md:text-sm lg:text-base opacity-75 mt-0.5">Search</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`relative px-3 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 transition-all duration-300 text-xs sm:text-base md:text-lg lg:text-xl font-semibold flex items-center gap-1 sm:gap-2 rounded-xl
                    ${viewMode === 'map' 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg'
                      : 'bg-gray-700 dark:bg-gray-800 text-white border border-gray-600 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-700 shadow-md'
                    }`}
                >
                  <span className="text-sm sm:text-lg md:text-xl lg:text-2xl">🗺️</span>
                  <span className="text-[11px] sm:text-base">Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('discover')}
                  className={`relative px-3 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 transition-all duration-300 text-xs sm:text-base md:text-lg lg:text-xl font-semibold flex items-center gap-1 sm:gap-2 rounded-xl
                    ${viewMode === 'discover' 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-gray-700 dark:bg-gray-800 text-white border border-gray-600 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-700 shadow-md'
                    }`}
                >
                  <span className="text-sm sm:text-lg md:text-xl lg:text-2xl">🌍</span>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[11px] sm:text-base">Discovery</span>
                    <span className="text-[9px] sm:text-xs md:text-sm lg:text-base opacity-75 mt-0.5">Mode</span>
                  </div>
                </button>
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
              className="h-auto bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 text-white px-2 py-2 rounded-md font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
              <div className="flex flex-col items-center">
                <span className="text-xl mb-1 animate-pulse">🔥</span>
                <div className="text-xs sm:text-sm font-semibold leading-tight">Live Heatmap</div>
                <div className="text-[10px] sm:text-xs text-white/80 leading-tight">Availability Now</div>
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
                <span className="text-xl mb-1">📊</span>
                <div className="text-xs sm:text-sm font-semibold leading-tight">Market Analysis</div>
                <div className="text-[10px] sm:text-xs text-white/80 leading-tight">Price Compare</div>
              </div>
            </Button>
          </div>
        </div>
        )}
        
        {/* Key Value Props - Below action buttons */}
        <div className="w-full max-w-full sm:max-w-2xl md:max-w-xl lg:max-w-xl mx-auto px-2 sm:px-0 mt-6 mb-4">
          <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center text-xs sm:text-sm md:text-base lg:text-lg text-green-100 font-semibold bg-green-900/30 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-2">
              <span className="mr-0.5 text-sm sm:text-base md:text-lg">🔍</span> Transparent Pricing
            </div>
            <div className="flex items-center text-xs sm:text-sm md:text-base lg:text-lg text-green-100 font-semibold bg-green-900/30 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-2">
              <span className="mr-0.5 text-sm sm:text-base md:text-lg">📅</span> Schedule Tours
            </div>
            <div className="flex items-center text-xs sm:text-sm md:text-base lg:text-lg text-green-100 font-semibold bg-green-900/30 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-2">
              <span className="mr-0.5 text-sm sm:text-base md:text-lg">✅</span> Direct Reservations
            </div>
          </div>
        </div>
        
        </div>
          
          {/* Search Results - Premium Glass Design */}
          {isSearchActive && (viewMode === 'list' || viewMode === 'discover') && (
            <div className="w-full max-w-2xl mx-auto mt-4 mb-8">
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
                            {searchCategory === 'services' ? ' services' : 
                             searchCategory === 'healthcare' ? ' healthcare providers' : 
                             searchCategory === 'resources' ? ' resources' : ' communities'}
                            {' matching "'}
                            <span className="text-green-400">{searchQuery}</span>
                            {'"'}
                          </>
                        ) : (
                          <span>
                            {searchResults?.results?.length || 0}
                            {searchCategory === 'services' ? ' Services' : 
                             searchCategory === 'healthcare' ? ' Healthcare Providers' : 
                             searchCategory === 'resources' ? ' Resources' : ' Communities'}
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
                      title={searchResults?.metadata?.loadingMessage || (searchCategory === 'services' ? 'Discovery Mode Active' : 'Searching Communities')}
                      subtitle={searchCategory === 'services' ? 'Searching across multiple global sources...' : `Analyzing ${searchQuery || 'all communities'}`}
                      showProgress={true}
                      progressDuration={searchCategory === 'services' ? 30 : 15}
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
                            {searchCategory === 'services' ? (
                              <VendorServiceCard
                                vendor={item}
                                variant="list"
                                onSelect={() => {
                                  // Navigate to service details page, not external website
                                  window.location.href = `/service/${item.id}`;
                                }}
                              />
                            ) : searchCategory === 'healthcare' ? (
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
                            ) : searchCategory === 'resources' ? (
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
                                      searchCategory === 'services' ? 'services' : 
                                      searchCategory === 'healthcare' ? 'healthcare providers' :
                                      searchCategory === 'resources' ? 'resources' :
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
        </div>
        
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
      </section>

    </>
  );
}

export default function MySeniorValetHome() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'communities' | 'services' | 'healthcare' | 'resources' | 'vendors'>('communities');
  
  // Fetch community stats for the tabs
  const { data: communityStats } = useQuery<{ count: string; communities: string; services: string; isGlobal: boolean }>({ 
    queryKey: ["/api/communities/count"],
    retry: false,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
  
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
      : 'Senior Living Made Simple - Find Communities, Real Pricing, No Hidden Fees',
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
  
  // Load community stats after initial render to improve page load speed
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  useEffect(() => {
    // Defer stats loading to improve initial page load time
    const timer = setTimeout(() => setInitialLoadComplete(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Mobile-optimized queries with reduced memory footprint
  const { isLoading } = useQuery<{ count: string; communities: string; services: string; isGlobal: boolean }>({
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
      {/* Transforming Hero Section with Search - Mobile optimized */}
      <HeroSectionWithTransformingSearch activeTab={activeTab} setActiveTab={setActiveTab} />



      {/* Personalized Banner */}
      <div className="px-4 py-6 bg-gradient-to-r from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <PersonalizedBanner />
        </div>
      </div>


      {/* Dynamic Content Section Based on Active Tab */}
      <section className="px-4 py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          {/* Show content based on active tab */}
          {activeTab === 'communities' && <CommunitiesTabContent communityStats={communityStats} />}
          {activeTab === 'services' && <ServicesTabContent />}
          {activeTab === 'healthcare' && <HealthcareTabContent />}
          {activeTab === 'resources' && <ResourcesTabContent />}
          {activeTab === 'vendors' && <VendorsTabContent />}
        </div>
      </section>
              
      {/* Senior Living News & Research Section */}
      <section className="py-12 px-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <Card className="border-2 border-red-500 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-white">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl mb-1">Senior Living News & Research</CardTitle>
                    <CardDescription className="font-semibold">Critical Information Every Family Needs to Know</CardDescription>
                  </div>
                </div>
                <Badge className="bg-red-500 text-white animate-pulse">BREAKING</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Current Crisis Data */}
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <h4 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      The Hidden Cost Crisis (2025 Data)
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span><strong>$131,583/year</strong> - Average private nursing home room cost</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span><strong>90% of families</strong> say these costs are "impossible" to pay</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span><strong>20-30% hidden fees</strong> above advertised rates industry-wide</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>Families forced to <strong>sell homes</strong> to afford care</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span><strong>"Forgotten Middle"</strong> - Too rich for Medicaid, too poor for private</span>
                      </li>
                    </ul>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                      Sources: <a href="https://kffhealthnews.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">KFF Health News</a>, <a href="https://www.governing.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">Governing.com</a>, <a href="https://www.seniorliving.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">SeniorLiving.org</a> 2025
                    </p>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <h4 className="font-bold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Caregiver Burnout Epidemic
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500">•</span>
                        <span><strong>53 million Americans</strong> provide unpaid care</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500">•</span>
                        <span>Average <strong>24.4 hours/week</strong> of caregiving</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500">•</span>
                        <span>Only <strong>23% report good mental health</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500">•</span>
                        <span><strong>650,000+ jobs lost</strong> due to caregiving demands</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500">•</span>
                        <span><strong>53% can't navigate</strong> healthcare system</span>
                      </li>
                    </ul>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                      Sources: <a href="https://www.alz.org/alzheimers-dementia/facts-figures" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">Alzheimer's Association</a>, <a href="https://www.guardianlife.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">Guardian Life</a>, <a href="https://www.cdc.gov" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">CDC</a> 2024
                    </p>
                  </div>
                </div>

                {/* Right Column - Industry Problems & Solutions */}
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <h4 className="font-bold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-2">
                      <AlertOctagon className="h-5 w-5" />
                      Industry Deception Exposed
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span><strong>Senate investigating</strong> "A Place for Mom" for steering to unsafe facilities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span><strong>37 fake 5-star reviews</strong> posted same day (StoryPoint facility)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span><strong>1/3 of "Best of" facilities</strong> had safety violations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span><strong>FTC fines $52,000</strong> per fake review violation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Referral services take <strong>hidden commissions</strong></span>
                      </li>
                    </ul>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                      Sources: <a href="https://www.washingtonpost.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">Washington Post</a>, <a href="https://www.aging.senate.gov" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">Senate Committee on Aging</a>, <a href="https://www.ftc.gov/news-events/news/press-releases/2024/08/ftc-announces-final-rule-banning-fake-reviews-testimonials" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">FTC</a> 2024
                    </p>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Housing Crisis Reality
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span><strong>520,000+ seniors</strong> on affordable housing waitlists</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>Average wait: <strong>2.5 years</strong> for Section 8</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>Only <strong>25% of eligible</strong> get assistance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span><strong>33% lonely</strong>, 50% higher dementia risk</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span><strong>No new HUD funding</strong> since 2012</span>
                      </li>
                    </ul>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                      Sources: <a href="https://www.hud.gov" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">HUD.gov</a>, <a href="https://liveon-ny.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">LiveOn NY</a>, <a href="https://www.urban.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">Urban Institute</a> 2024
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-6 p-4 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-lg">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-gray-100">MySeniorValet Solution</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Transparency, No Hidden Fees, Real Data Only</p>
                    </div>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90"
                    onClick={() => window.location.href = '/senior-news'}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Read Full Research & Citations
                  </Button>
                </div>
              </div>

              {/* Latest Updates Ticker */}
              <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 text-xs">
                  <Badge className="bg-red-500 text-white">LATEST</Badge>
                  <div className="animate-marquee whitespace-nowrap">
                    <span className="text-gray-700 dark:text-gray-300">
                      📰 FTC bans fake reviews with $52K fines • 🏛️ Senate investigates referral services • 
                      💰 Nursing home costs hit $131K/year • 🏠 520,000 seniors on housing waitlists • 
                      😔 33% of seniors report loneliness • 💔 53M family caregivers struggling
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                  onClick={() => setLocation('/care-guide')}
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

      {/* Legal Notice Section - Repositioned to Bottom */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-4 bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-sm font-bold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              IMPORTANT LEGAL NOTICE
            </p>
            <ul className="text-sm text-red-600 dark:text-red-400 space-y-2">
              <li>• MySeniorValet is a FREE platform for families providing transparency in senior care</li>
              <li>• We aggregate and display public information from verified sources with citations</li>
              <li>• We facilitate connections between families and communities - NOT a placement agency</li>
              <li>• All family features are FREE: research, tour scheduling, emergency contacts, collaboration tools</li>
              <li>• Communities and vendors pay for business services (listing management, tour management, etc.)</li>
              <li>• We may receive affiliate commissions from marketplace partners (Amazon, 1-800-Flowers)</li>
              <li>• We do NOT charge families any fees or commissions</li>
              <li>• Always verify information independently and consult professionals before making care decisions</li>
            </ul>
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
      
      {/* One-Touch Emergency Contact Shortcut - DISABLED to prevent React rendering failure */}
      {/* <EmergencyButton userId={undefined} /> */}
      
      {/* Onboarding Wizard - DISABLED: Prototype for future development */}
      {/* <OnboardingWrapper /> */}
    </div>
  );
}
