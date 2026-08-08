import { useState, useEffect, useRef } from "react";
import { getLocationSearchUrl } from "@/lib/location-url";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { AutocompleteSearch } from "@/components/AutocompleteSearch";
import { 
  Building2, Search, MapPin, Home, Users, DollarSign, Shield, 
  Star, Filter, Database, TrendingUp, BarChart3, Globe,
  ChevronRight, Clock, CheckCircle, Info, Heart,
  HeartHandshake, Brain, Activity, Stethoscope, UserCheck,
  Calendar, Hotel, Flower2, Sparkles, AlertCircle,
  Truck, Flag, Building, BookOpen, ChevronLeft,
  ArrowRight, Languages, Phone, Award, Trophy, Gem, ShieldCheck
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { getCommunityUrl } from "@/lib/community-url";
import { motion } from "framer-motion";
import { CommunityCard } from "@/components/CommunityCard";
import {
  SupportingPortfolioSections,
  dedupeCommunitiesById,
} from "@/components/SupportingPortfolioSections";
import { RedTagDeals } from "@/components/RedTagDeals";
import { MarketIntelligence } from "@/components/MarketIntelligence";
import { CareSpectrumSlider } from "@/components/CareSpectrumSlider";
import { MoveInCostCalculator } from "@/components/MoveInCostCalculator";
import { CostComparisonWorksheet } from "@/components/CostComparisonWorksheet";
import { HeroMascotPanel } from "@/components/mascot/HeroMascotPanel";
import { MascotLoadingDisplay } from "@/components/MascotLoadingDisplay";
import resortGardenImage from '@assets/generated_images/Resort_courtyard_garden_f7db92ce.png';
import GlobalNetwork from '@assets/generated_images/Global_network_connections_3f9d63f4.png';
// State abbreviation to full name mapping
const stateNames: Record<string, string> = {
  // US States
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'Washington DC',
  // Canadian Provinces
  'AB': 'Alberta', 'BC': 'British Columbia', 'MB': 'Manitoba',
  'NB': 'New Brunswick', 'NL': 'Newfoundland', 'NS': 'Nova Scotia',
  'NT': 'Northwest Territories', 'NU': 'Nunavut', 'ON': 'Ontario',
  'PE': 'Prince Edward Island', 'QC': 'Quebec', 'SK': 'Saskatchewan',
  'YT': 'Yukon',
  // US Territories
  'PR': 'Puerto Rico', 'VI': 'Virgin Islands', 'GU': 'Guam'
};

interface DirectoryPageSettings {
  defaultSort: string;
  promoBannerEnabled: boolean;
  promoBannerText: string;
  pinnedCommunityIds: number[];
}

export function CommunityDirectorySections({ showHero = false }: { showHero?: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [location, setLocation] = useLocation();
  
  // 3D Carousel state
  const [currentRotation, setCurrentRotation] = useState(0);

  // Fetch admin page settings (public endpoint, no auth required)
  const { data: pageSettings } = useQuery<DirectoryPageSettings>({
    queryKey: ['/api/settings/directory-page'],
    staleTime: 60_000,
  });
  
  // Check for location query parameter and scroll to section
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const locationParam = urlParams.get('location');
    
    if (locationParam) {
      // Map location parameter to section refs
      const locationToRef: Record<string, React.RefObject<HTMLElement>> = {
        'hawaii': hawaiiSectionRef,
        'fort-worth': texasSectionRef,
        'new-york': newYorkSectionRef,
        'canada': canadianSectionRef,
        'puerto-rico': puertoRicoSectionRef,
        'peru': peruSectionRef,
        'cuba': cubaSectionRef,
        'costa-rica': costaRicaSectionRef,
        'panama': panamaSectionRef,
        'oakmont': oakmontSectionRef,
        'japan': japanSectionRef,
        'singapore': singaporeSectionRef,
        'scotland': scotlandSectionRef,
        'australia': australiaSectionRef
      };
      
      const targetRef = locationToRef[locationParam];
      if (targetRef?.current) {
        setTimeout(() => {
          targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
      }
    }
  }, []);
  
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  // Opt-in toggle: HUD/subsidized listings are excluded from the directory by default
  const [includeHud, setIncludeHud] = useState(false);

  // Derive pinned community IDs from admin settings
  const pinnedCommunityIds: number[] = pageSettings?.pinnedCommunityIds ?? [];

  // Fetch pinned communities through the gated list endpoint. Using the public
  // list route (GET /api/communities/pinned?ids=...) rather than direct
  // per-ID detail fetches ensures pinned selections cannot bypass the shared
  // eligibility policy: an admin can pin an id, but the server still filters
  // out any community that is not publicly visible / not referral-approved.
  const { data: pinnedCommunitiesRaw } = useQuery({
    queryKey: ['/api/communities/pinned', pinnedCommunityIds],
    queryFn: async () => {
      if (pinnedCommunityIds.length === 0) return [];
      const res = await fetch(
        `/api/communities/pinned?ids=${encodeURIComponent(pinnedCommunityIds.join(','))}`,
        { credentials: 'include' },
      );
      if (!res.ok) return [];
      const body = await res.json();
      const list = Array.isArray(body) ? body : (body?.communities ?? []);
      return dedupeCommunitiesById(list);
    },
    enabled: pinnedCommunityIds.length > 0,
    staleTime: 60_000,
  });

  // Sort pinned communities by admin-configured default sort
  const pinnedCommunities = [...((pinnedCommunitiesRaw as any[]) ?? [])].sort((a, b) => {
    const sort = pageSettings?.defaultSort ?? 'newest';
    if (sort === 'highest-rated') return (b.rating ?? 0) - (a.rating ?? 0);
    if (sort === 'most-reviewed') return (b.reviewCount ?? b.review_count ?? 0) - (a.reviewCount ?? a.review_count ?? 0);
    return 0;
  });

  // Map admin defaultSort to the section-data API type
  const sortTypeMap: Record<string, string> = {
    'newest': 'recently_discovered',
    'highest-rated': 'highest_rated',
    'most-reviewed': 'most_reviewed',
  };
  const activeSortType = sortTypeMap[pageSettings?.defaultSort ?? 'newest'] ?? 'recently_discovered';

  // Fetch main directory listing driven by defaultSort
  const { data: sortedListingRaw, isLoading: sortedListingLoading } = useQuery({
    queryKey: ['/api/communities/section-data', activeSortType, verifiedOnly, includeHud],
    queryFn: async () => {
      const r = await fetch(
        `/api/communities/section-data?type=${activeSortType}&limit=12${verifiedOnly ? '&verifiedOnly=true' : ''}${includeHud ? '&includeHud=true' : ''}`,
        { credentials: 'include' },
      );
      if (!r.ok) throw new Error('Failed to fetch sorted communities');
      return await r.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Exclude pinned communities from the main listing and deduplicate by
  // community id so the same community never renders twice.
  const sortedListing: any[] = dedupeCommunitiesById(
    ((sortedListingRaw as any)?.communities ?? sortedListingRaw ?? [])
      .filter((c: any) => !pinnedCommunityIds.includes(c.id)),
  );

  // Approved operator-family portfolios (Discovery, Atria/Holiday, Oakmont,
  // Brookdale, Provincial, etc.) are rendered by <SupportingPortfolioSections>,
  // which sources them from the canonical, admin-gated
  // GET /api/communities/supporting-portfolios endpoint. The previous literal
  // comprehensive-search brand queries (Discovery/Atria/Brookdale/Oakmont/LCS/
  // Provincial) were removed because they matched by brittle brand name and
  // could bypass eligibility. The unapproved LCS section was removed entirely.

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
      avgCost: '$1,500-3,000/month',
      keyFeatures: ['Active lifestyle focus', 'Resort-style amenities', 'Social clubs & activities']
    },
    { 
      id: 'independent', 
      name: 'Independent', 
      icon: Home, 
      color: 'bg-blue-600', 
      description: 'Senior apartments and cottages for fully independent seniors who want maintenance-free living with optional services.',
      details: 'Private apartments • Optional services • Social activities',
      avgCost: '$2,000-4,500/month',
      keyFeatures: ['Private apartment living', 'Maintenance-free', 'Optional meal plans']
    },
    { 
      id: 'personal', 
      name: 'Personal Care', 
      icon: Heart, 
      color: 'bg-yellow-500', 
      description: 'Personal care homes providing help with daily activities in a residential setting with personalized support.',
      details: 'ADL assistance • Medication management • Home-like setting',
      avgCost: '$2,500-5,000/month',
      keyFeatures: ['Help with daily activities', 'Medication management', 'Smaller, home-like setting']
    },
    { 
      id: 'assisted', 
      name: 'Assisted', 
      icon: HeartHandshake, 
      color: 'bg-red-600', 
      description: 'Assisted living communities offering 24/7 support with daily activities while maintaining independence.',
      details: '24/7 staff • Personal care • Dining included',
      avgCost: '$3,500-7,000/month',
      keyFeatures: ['24/7 care staff', 'All meals included', 'Personal care services']
    },
    { 
      id: 'memory', 
      name: 'Memory', 
      icon: Brain, 
      color: 'bg-indigo-600', 
      description: 'Specialized memory care units for those with Alzheimer\'s and dementia, featuring secure environments and trained staff.',
      details: 'Secure environment • Specialized programs • Expert staff',
      avgCost: '$4,500-9,000/month',
      keyFeatures: ['Secure environment', 'Dementia-trained staff', 'Structured daily programs']
    },
    { 
      id: 'skilled', 
      name: 'Skilled', 
      icon: Stethoscope, 
      color: 'bg-cyan-600', 
      description: 'Skilled nursing facilities providing 24-hour medical care and rehabilitation services for complex health needs.',
      details: '24-hour nursing • Rehab services • Medical equipment',
      avgCost: '$7,000-12,000/month',
      keyFeatures: ['24-hour nursing care', 'Rehabilitation services', 'Complex medical needs']
    },
    { 
      id: 'ccrc', 
      name: 'CCRC', 
      icon: Building, 
      color: 'bg-teal-600', 
      description: 'Continuing Care Retirement Communities offering all levels of care on one campus with lifetime care contracts.',
      details: 'All care levels • Life care contracts • Campus setting',
      avgCost: 'Entry: $100K-500K + $3-7K/mo',
      keyFeatures: ['All levels of care', 'Lifetime care guarantee', 'Single campus convenience']
    }
  ];
  
  // Section refs for smooth scrolling
  const hawaiiSectionRef = useRef<HTMLElement>(null);
  const californiaSectionRef = useRef<HTMLElement>(null);
  const floridaSectionRef = useRef<HTMLElement>(null);
  const texasSectionRef = useRef<HTMLElement>(null);
  const newYorkSectionRef = useRef<HTMLElement>(null);
  const canadianSectionRef = useRef<HTMLElement>(null);
  const puertoRicoSectionRef = useRef<HTMLElement>(null);
  const peruSectionRef = useRef<HTMLElement>(null);
  const cubaSectionRef = useRef<HTMLElement>(null);
  const costaRicaSectionRef = useRef<HTMLElement>(null);
  const panamaSectionRef = useRef<HTMLElement>(null);
  const oakmontSectionRef = useRef<HTMLElement>(null);
  const japanSectionRef = useRef<HTMLElement>(null);
  const singaporeSectionRef = useRef<HTMLElement>(null);
  const scotlandSectionRef = useRef<HTMLElement>(null);
  const australiaSectionRef = useRef<HTMLElement>(null);
  
  // Slider container refs for navigation
  const hawaiiSliderRef = useRef<HTMLDivElement>(null);
  const floridaSliderRef = useRef<HTMLDivElement>(null);
  const hudSliderRef = useRef<HTMLDivElement>(null);
  const texasSliderRef = useRef<HTMLDivElement>(null);
  const newYorkSliderRef = useRef<HTMLDivElement>(null);
  const canadianSliderRef = useRef<HTMLDivElement>(null);
  const puertoRicoSliderRef = useRef<HTMLDivElement>(null);
  const mexicoSliderRef = useRef<HTMLDivElement>(null);
  const peruSliderRef = useRef<HTMLDivElement>(null);
  const cubaSliderRef = useRef<HTMLDivElement>(null);
  const costaRicaSliderRef = useRef<HTMLDivElement>(null);
  const panamaSliderRef = useRef<HTMLDivElement>(null);

  // Scroll navigation functions
  const scrollSlider = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 320; // Width of one card plus gap
      const currentScroll = ref.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      ref.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };
  
  const [language, setLanguage] = useState('en');
  
  
  // Fetch HUD count
  const { data: hudCount } = useQuery({
    queryKey: ['/api/communities/hud-count']
  });
  
  // Fetch community stats including top states - COMPREHENSIVE REAL DATA
  const { data: communityStats, isLoading: statsLoading } = useQuery<{
    totalCommunities: string;
    avgRating: number;
    totalWithPhotos: string;
    totalHUD: string;
    stateCount: string;
    countryCount: string;
    totalVerified: string;
    totalClaimed: string;
    topStates: Array<{ state: string; count: string }>;
    countryDistribution: Array<{ country: string; count: string }>;
    recentlyDiscovered30d: number;
    careTypeDistribution: {
      independentLiving: string;
      assistedLiving: string;
      memoryCare: string;
      skilledNursing: string;
    };
  }>({
    queryKey: ['/api/communities/stats'],
    staleTime: 60000, // Refresh every minute
  });
  
  // Extract topStates from stats
  const topStates = communityStats?.topStates || [];
  
  // Helper to format numbers with loading state
  const formatCount = (value: string | number | undefined, loading: boolean = false) => {
    if (loading) return '...';
    if (!value) return '-';
    const num = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) : value;
    return isNaN(num) ? '-' : num.toLocaleString();
  };
  
  // Fetch Hawaii communities. Hawaii stays a geographic section but consumes a
  // gated, list-based server endpoint (by-state applies the shared
  // publicVisibleFilter / eligibility policy) rather than direct detail fetches
  // by ID, so unapproved or excluded Hawaii records cannot leak in. Cards are
  // deduplicated by community id before rendering.
  const { data: hawaiiCommunitiesRaw, isLoading: hawaiiLoading } = useQuery({
    queryKey: ['/api/communities/by-state?state=HI'],
    queryFn: async () => {
      const res = await fetch('/api/communities/by-state?state=HI', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch Hawaii communities');
      return res.json();
    },
  });
  const hawaiiCommunities = {
    communities: dedupeCommunitiesById(
      (hawaiiCommunitiesRaw as any)?.communities ?? [],
    ),
  };
  
  // Fetch Florida communities
  const { data: floridaCommunities, isLoading: floridaLoading } = useQuery({
    queryKey: ['/api/communities/by-state?state=FL']
  });
  
  // Fetch Texas communities (Fort Worth)
  const { data: texasCommunities, isLoading: texasLoading } = useQuery({
    queryKey: ['/api/communities/by-city?city=Fort%20Worth&state=TX']
  });
  
  // Fetch New York communities
  const { data: newYorkCommunities, isLoading: newYorkLoading } = useQuery({
    queryKey: ['/api/communities/by-state?state=NY']
  });
  
  // Fetch Canadian communities
  const { data: canadianCommunities, isLoading: canadianLoading } = useQuery({
    queryKey: ['/api/communities/canadian', 6],
    enabled: true
  });
  
  // Fetch Puerto Rico communities
  const { data: puertoRicoCommunities, isLoading: puertoRicoLoading } = useQuery({
    queryKey: ['/api/communities/puerto-rico', 12],
    enabled: true
  });
  
  // Fetch Mexican communities
  const { data: mexicoCommunities, isLoading: mexicoLoading } = useQuery({
    queryKey: ['/api/communities/mexican', 12],
    enabled: true
  });
  
  // Fetch Peru communities
  const { data: peruCommunities, isLoading: peruLoading } = useQuery({
    queryKey: ['peruCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-country?country=PE');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    enabled: true
  });
  
  // Fetch Cuba communities
  const { data: cubaCommunities, isLoading: cubaLoading } = useQuery({
    queryKey: ['cubaCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-country?country=CU');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    enabled: true
  });
  
  // Fetch Costa Rica communities
  const { data: costaRicaCommunities, isLoading: costaRicaLoading } = useQuery({
    queryKey: ['costaRicaCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-country?country=CR');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    enabled: true
  });
  
  // Fetch Panama communities
  const { data: panamaCommunities, isLoading: panamaLoading } = useQuery({
    queryKey: ['panamaCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-country?country=PA');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    enabled: true
  });

  // Fetch Canadian Province communities
  const { data: ontarioCommunities } = useQuery({
    queryKey: ['ontarioCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-state?state=ON');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  });

  const { data: quebecCommunities } = useQuery({
    queryKey: ['quebecCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-state?state=QC');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  });

  const { data: britishColumbiaCommunities } = useQuery({
    queryKey: ['bcCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-state?state=BC');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  });

  const { data: albertaCommunities } = useQuery({
    queryKey: ['albertaCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-state?state=AB');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  });

  // Fetch Australian State communities
  const { data: nswCommunities } = useQuery({
    queryKey: ['nswCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-state?state=NSW');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  });

  const { data: queenslandCommunities } = useQuery({
    queryKey: ['qldCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-state?state=QLD');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  });

  const { data: victoriaCommunities } = useQuery({
    queryKey: ['vicCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-state?state=VIC');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  });

  // Fetch Japan communities
  const { data: japanCommunities } = useQuery({
    queryKey: ['japanCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-state?state=Tokyo');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  });

  // Fetch Singapore communities
  const { data: singaporeCommunities } = useQuery({
    queryKey: ['singaporeCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-state?state=Singapore');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  });

  // Fetch Scotland communities
  const { data: scotlandCommunities } = useQuery({
    queryKey: ['scotlandCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-state?state=Scotland');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  });
  
  // Fetch HUD properties for showcase
  const { data: hudProperties } = useQuery({
    queryKey: ['/api/communities/hud-properties', 10]
  });

  return (
    <>
      {showHero && (
        <>
      {/* Hero Section with Stats */}
      <section className="relative py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={GlobalNetwork}
            alt="Global network connections"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="bg-white/20 text-white px-4 py-1 mb-4">
              <Database className="h-4 w-4 mr-2" />
              VERIFIED SENIOR LIVING DIRECTORY
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Community Directory
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Browse {formatCount(communityStats?.totalCommunities, statsLoading)}+ verified senior living communities across {formatCount(communityStats?.countryCount, statsLoading)}+ countries — with transparent, source-attributed details.
            </p>
            
            {/* Key Stats — computed over the public, family-visible set */}
            <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-white">{formatCount(communityStats?.totalCommunities, statsLoading)}+</div>
                  <div className="text-xs text-blue-100">Verified Communities</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-300">{formatCount(communityStats?.totalHUD, statsLoading)}</div>
                  <div className="text-xs text-blue-100">HUD Properties</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-white">{formatCount(communityStats?.countryCount, statsLoading)}</div>
                  <div className="text-xs text-blue-100">Countries Covered</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-300">{formatCount(communityStats?.totalVerified, statsLoading)}</div>
                  <div className="text-xs text-blue-100">Verified Listings</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>
        </>
      )}
      {/* Search Section - Powered by AI */}
      <section className="px-4 py-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
        <div className="max-w-4xl mx-auto">
          {/* Traditional Search */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Search Communities
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatCount(communityStats?.totalCommunities, statsLoading)}+ Verified Communities • Transparent Pricing • Real Reviews
              </p>
            </div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center p-2">
                <Search className="ml-3 h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <AutocompleteSearch
                    value={searchTerm}
                    onChange={setSearchTerm}
                    onSubmit={(value) => {
                      if (value) {
                        setLocation(`/map-search?q=${encodeURIComponent(value)}`);
                      }
                    }}
                    placeholder="Search by name, city, state, or zip..."
                    inputClassName="w-full pl-3 pr-3 py-3 text-base border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    hideSearchButton={true}
                  />
                </div>
                <Button
                  onClick={() => {
                    if (searchTerm) {
                      setLocation(`/map-search?q=${encodeURIComponent(searchTerm)}`);
                    }
                  }}
                  className="mr-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
                >
                  Search
                </Button>
              </div>
            </div>
            
            {/* Database Features & Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-3 mt-6">
              <span className="inline-flex items-center space-x-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md">
                <DollarSign className="h-3 w-3 text-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Live Pricing</span>
              </span>
              <span className="inline-flex items-center space-x-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md">
                <Users className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Family Reviews</span>
              </span>
              <span className="inline-flex items-center space-x-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md">
                <Brain className="h-3 w-3 text-purple-500 animate-pulse" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Live Availability</span>
              </span>
              <span className="inline-flex items-center space-x-1 bg-gradient-to-r from-purple-800/80 to-indigo-800/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-purple-400/30">
                <Shield className="h-3 w-3 text-yellow-300 animate-pulse" />
                <span className="text-xs font-semibold text-white">AI Triple-Verified</span>
              </span>
            </div>

            {/* Quick Filters & Database Features */}
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              <Link href="/map-search?filter=hud" className="inline-flex items-center rounded-md border border-green-300 dark:border-green-600 px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer">
                <Shield className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">HUD Verified</span>
              </Link>
              <Link href="/map-search?filter=pricing" className="inline-flex items-center rounded-md border border-blue-300 dark:border-blue-600 px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer">
                <DollarSign className="h-3 w-3 mr-1 text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">With Pricing</span>
              </Link>
              <Link href="/map-search?filter=5star" className="inline-flex items-center rounded-md border border-yellow-300 dark:border-yellow-600 px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-yellow-50 dark:hover:bg-yellow-900/20 cursor-pointer">
                <Star className="h-3 w-3 mr-1 text-yellow-600" />
                <span className="text-gray-700 dark:text-gray-300">5-Star Rated</span>
              </Link>
              <Link href="/map-search?filter=memory" className="inline-flex items-center rounded-md border border-purple-300 dark:border-purple-600 px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer">
                <Brain className="h-3 w-3 mr-1 text-purple-600" />
                <span className="text-gray-700 dark:text-gray-300">Memory Care</span>
              </Link>
              <Link href="/map-search?filter=assisted" className="inline-flex items-center rounded-md border border-red-300 dark:border-red-600 px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer">
                <HeartHandshake className="h-3 w-3 mr-1 text-red-600" />
                <span className="text-gray-700 dark:text-gray-300">Assisted Living</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ★ ADMIN-PINNED RECOMMENDED COMMUNITIES ★ */}
      {pinnedCommunities.length > 0 && (
        <section className="px-4 py-10 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-950/20 dark:to-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-7 h-7 text-amber-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended Communities</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {pageSettings?.defaultSort === 'highest-rated' ? 'Sorted by highest rating' :
                   pageSettings?.defaultSort === 'most-reviewed' ? 'Sorted by most reviews' :
                   'Curated by our team'}
                </p>
              </div>
              <Badge className="ml-auto bg-amber-500 text-white">Editor's Picks</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pinnedCommunities.map((community: any) => (
                <CommunityCard key={community.id} community={community} variant="grid" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ★ ADMIN-SORTED DIRECTORY LISTING ★ */}
      {(sortedListing.length > 0 || sortedListingLoading) && (
        <section className="px-4 py-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pageSettings?.defaultSort === 'highest-rated' ? 'Top Rated Communities' :
                   pageSettings?.defaultSort === 'most-reviewed' ? 'Most Popular Communities' :
                   'Recently Added Communities'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {pageSettings?.defaultSort === 'highest-rated' ? 'Sorted by highest community rating' :
                   pageSettings?.defaultSort === 'most-reviewed' ? 'Sorted by popularity & reviews' :
                   'Latest communities added to our database'}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVerifiedOnly((v) => !v)}
                  aria-pressed={verifiedOnly}
                  data-testid="toggle-verified-only"
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
                    verifiedOnly
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-green-500'
                  }`}
                  title="Show only HUD government-verified, claimed, or featured communities"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified only
                </button>
                <button
                  type="button"
                  onClick={() => setIncludeHud((v) => !v)}
                  aria-pressed={includeHud}
                  data-testid="toggle-include-hud"
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
                    includeHud
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-blue-500'
                  }`}
                  title="Include government-subsidized (HUD) housing in the listings"
                >
                  <Home className="h-3.5 w-3.5" />
                  Subsidized/HUD housing
                </button>
                <Badge className="bg-indigo-600 text-white capitalize">
                  {pageSettings?.defaultSort === 'highest-rated' ? 'Highest Rated' :
                   pageSettings?.defaultSort === 'most-reviewed' ? 'Most Popular' : 'Newest First'}
                </Badge>
              </div>
            </div>
            {sortedListingLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl h-52 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedListing.slice(0, 12).map((community: any) => (
                  <CommunityCard key={community.id} community={community} variant="grid" />
                ))}
              </div>
            )}
            <div className="mt-6 text-center">
              <a href="/map-search" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">
                View all communities <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Recently Discovered carousel removed — the "Recently Added Communities"
          grid above already shows these freshly-added communities (unified grid). */}

      {/* MOVED COMMUNITY SLIDER SECTIONS - NOW POSITIONED RIGHT AFTER DATABASE FEATURES */}
      
      {/* Red Tag Deals Promotional Section - MOVED TO TOP FOR FEATURED COMMUNITIES */}
      <section className="px-4 py-8 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30">
        <div className="max-w-7xl mx-auto">
          <RedTagDeals />
        </div>
      </section>

      {/* Hero Mascot Panel - Platform Differentiators */}
      <section className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <HeroMascotPanel />
        </div>
      </section>
      
      {/* Find Your Perfect Care Level - Moved from Market Intelligence */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <CareSpectrumSlider />
        </div>
      </section>

      {/* ★ ADMIN-APPROVED OPERATOR-FAMILY PORTFOLIOS ★
          Rendered dynamically from the canonical, admin-gated
          GET /api/communities/supporting-portfolios endpoint. This replaces the
          previous hardcoded Discovery / Provincial / LCS / Atria / Brookdale /
          Oakmont brand sliders that searched a few literal brand names. Only
          admin-approved operator families (with community-level exclusions
          already applied server-side) are returned and displayed. */}
      <SupportingPortfolioSections />

      
      {/* Hawaii Paradise Excellence - Premium Tropical Living */}
      <section ref={hawaiiSectionRef} className="relative px-4 py-16 overflow-hidden">
        {/* Premium Tropical Paradise Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 via-teal-800 to-blue-900 dark:from-cyan-950 dark:via-teal-900 dark:to-blue-950"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                             radial-gradient(circle at 40% 20%, rgba(34, 211, 238, 0.2) 0%, transparent 40%)`,
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Premium Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-4xl md:text-5xl font-bold mb-4">
              <span className="text-5xl">🌺</span>
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Hawaii Paradise Communities
              </span>
            </div>
            <p className="text-xl text-gray-200 mb-8">
              Exceptional senior living in America's tropical paradise across {((hawaiiCommunities as any)?.communities?.length || 0)} communities
            </p>
          </div>

          {/* Hawaii Insider Savings Tips */}
          <div className="mb-10 bg-gradient-to-br from-blue-900/90 to-cyan-900/90 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Info className="w-6 h-6 text-cyan-300" />
              </div>
              <h3 className="text-xl font-bold text-white">Hawaii Insider Savings Tips</h3>
            </div>
            
            <div className="space-y-2">
              <ul className="space-y-2 text-gray-200 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🏝️</span>
                  <span><strong>Kama'aina Discount:</strong> Ask about local resident discounts (10-15% off)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🏝️</span>
                  <span><strong>Off-Peak Move:</strong> June-August moves can save $500-1000/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🏝️</span>
                  <span><strong>Outer Island Advantage:</strong> Big Island/Kauai 20-30% less than Oahu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🏝️</span>
                  <span><strong>Ohana Plans:</strong> Multi-family member discounts available</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-4 p-3 bg-cyan-800/30 rounded-lg border border-cyan-600/30">
              <p className="text-sm text-cyan-200">
                <span className="font-semibold text-cyan-300">Pro Tip:</span> Hawaii communities often have 6-12 month waitlists. 
                Secure your spot with a deposit while negotiating terms. Many offer "preview stays" for 1-2 weeks at reduced rates.
              </p>
            </div>
          </div>

          {/* Excellence Showcase Header */}
          <div className="mb-8 bg-gradient-to-r from-cyan-900/60 to-blue-900/60 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Paradise Excellence Showcase</h3>
                  <p className="text-sm text-gray-300">Premium island communities across Hawaii</p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 text-lg font-bold">
                {((hawaiiCommunities as any)?.communities?.length || 0)} Featured
              </Badge>
            </div>
          </div>

          {/* Premium Communities Display */}
          <div className="relative">
            <div ref={hawaiiSliderRef} className="flex gap-6 overflow-x-auto overflow-y-hidden pb-6 scrollbar-thin scrollbar-thumb-cyan-500 dark:scrollbar-thumb-cyan-400" style={{scrollBehavior: 'smooth'}}>
              {(hawaiiLoading || !hawaiiCommunities || !(hawaiiCommunities as any)?.communities?.length) ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-80 h-[520px] bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-xl border border-cyan-500/30 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gradient-to-br from-cyan-800/50 to-blue-800/50"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-cyan-800/50 rounded"></div>
                      <div className="h-4 bg-cyan-800/50 rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              ) : (
                ((hawaiiCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <div key={`hawaii-${community.id}-${index}`} className="flex-shrink-0">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-xl opacity-30 group-hover:opacity-60 transition duration-300 blur"></div>
                      <div className="relative">
                        <CommunityCard community={community} variant="compact" />
                        {/* Premium Badge Overlay */}
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-lg">
                          Island Paradise
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="text-center mt-8">
              <Link to={getLocationSearchUrl('Hawaii')}>
                <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold shadow-xl">
                  Explore All Hawaii Communities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fort Worth Texas Excellence - Lone Star Premium Living */}
      <section ref={texasSectionRef} className="relative px-4 py-16 overflow-hidden">
        {/* Premium Texas Western Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900 via-red-800 to-amber-900 dark:from-orange-950 dark:via-red-900 dark:to-amber-950"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(251, 146, 60, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(220, 38, 38, 0.2) 0%, transparent 50%),
                             radial-gradient(circle at 40% 20%, rgba(245, 158, 11, 0.2) 0%, transparent 40%)`,
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Premium Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-4xl md:text-5xl font-bold mb-4">
              <span className="text-5xl">⭐</span>
              <span className="bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent">
                Fort Worth Lone Star Excellence
              </span>
            </div>
            <p className="text-xl text-gray-200 mb-8">
              Texas-sized luxury and authentic southern hospitality
            </p>
          </div>

          {/* Texas-Sized Savings Tips */}
          <div className="mb-10 bg-gradient-to-br from-red-900/90 to-orange-900/90 backdrop-blur-lg rounded-2xl border border-orange-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Info className="w-6 h-6 text-orange-300" />
              </div>
              <h3 className="text-xl font-bold text-white">Texas-Sized Savings Tips</h3>
            </div>
            
            <div className="space-y-2">
              <ul className="space-y-2 text-gray-200 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🤠</span>
                  <span><strong>Summer Special:</strong> July-August moves save 20-30% (heat advantage)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🤠</span>
                  <span><strong>Veteran Benefits:</strong> Fort Worth military discounts 10-15% off</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🤠</span>
                  <span><strong>Corporate Partnerships:</strong> Ask about employer/alumni discounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🤠</span>
                  <span><strong>Bundle & Save:</strong> Couples save $800-1200/month sharing units</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-4 p-3 bg-orange-800/30 rounded-lg border border-orange-600/30">
              <p className="text-sm text-orange-200">
                <span className="font-semibold text-orange-300">Insider Secret:</span> Fort Worth communities compete heavily with Dallas. 
                Mention you're comparing both markets for immediate 5-10% concessions. Best deals: May and September move-ins.
              </p>
            </div>
          </div>

          {/* Excellence Showcase Header */}
          <div className="mb-8 bg-gradient-to-r from-orange-900/60 to-red-900/60 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Lone Star Excellence Showcase</h3>
                  <p className="text-sm text-gray-300">Premium Texas hospitality in Fort Worth</p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-lg font-bold">
                {((texasCommunities as any)?.communities?.length || 0)} Featured
              </Badge>
            </div>
          </div>
          
          {/* Premium Communities Display */}
          <div className="relative">
            <div ref={texasSliderRef} className="flex gap-6 overflow-x-auto overflow-y-hidden pb-6 scrollbar-thin scrollbar-thumb-orange-500 dark:scrollbar-thumb-orange-400" style={{scrollBehavior: 'smooth'}}>
              {(texasLoading || !texasCommunities || !(texasCommunities as any)?.communities?.length) ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-80 h-[520px] bg-gradient-to-br from-orange-900/50 to-red-900/50 rounded-xl border border-orange-500/30 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gradient-to-br from-orange-800/50 to-red-800/50"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-orange-800/50 rounded"></div>
                      <div className="h-4 bg-orange-800/50 rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              ) : (
                ((texasCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <div key={`texas-${community.id}-${index}`} className="flex-shrink-0">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl opacity-30 group-hover:opacity-60 transition duration-300 blur"></div>
                      <div className="relative">
                        <CommunityCard community={community} variant="compact" />
                        {/* Premium Badge Overlay */}
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-lg">
                          Lone Star Living
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="text-center mt-8">
              <Link to={getLocationSearchUrl('Fort Worth, Texas')}>
                <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-6 text-lg font-semibold shadow-xl">
                  Explore All Fort Worth Communities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
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

      {/* Florida Communities Section - SUNSHINE STATE ADVENTURE */}
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
                onClick={() => setLocation(getLocationSearchUrl('Florida'))}
              >
                Search All Florida Communities
              </Button>
            </div>
          ) : (
            <div className="relative">
              {/* Navigation Arrows */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 rounded-full"
                onClick={() => scrollSlider(floridaSliderRef, 'left')}
              >
                <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 rounded-full"
                onClick={() => scrollSlider(floridaSliderRef, 'right')}
              >
                <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </Button>
              
              <div ref={floridaSliderRef} className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-cyan-500 dark:scrollbar-thumb-cyan-400 " style={{scrollBehavior: 'smooth'}}>
                {((floridaCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <CommunityCard key={`florida-${community.id}-${index}`} community={community} variant="compact" className="flex-shrink-0" />
                ))}
              </div>
              
              <div className="text-center mt-6">
                <Button 
                  variant="outline" 
                  className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-600 dark:text-cyan-300 dark:hover:bg-cyan-900/20"
                  onClick={() => setLocation(getLocationSearchUrl('Florida'))}
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

      {/* HUD Communities Showcase - MOVED UP FOR AFFORDABILITY VISIBILITY */}
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
            {(hudCount as any)?.total ? `${(hudCount as any).total} affordable communities • ` : 'Affordable communities • '}
            Government transparency and income-based options
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md p-2 mb-4">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <span className="font-medium">Platform Promise:</span> Not all senior housing requires a six-figure budget. 
              MySeniorValet shows everything — from $0 HUD properties to full-service memory care.
            </p>
          </div>
        
          <div className="relative">
            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 rounded-full"
              onClick={() => scrollSlider(hudSliderRef, 'left')}
            >
              <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 rounded-full"
              onClick={() => scrollSlider(hudSliderRef, 'right')}
            >
              <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </Button>
            
            <div ref={hudSliderRef} className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-green-500 dark:scrollbar-thumb-green-400 " style={{scrollBehavior: 'smooth'}}>
              {/* Show HUD communities with critical information */}
            {(!hudProperties || (hudProperties as any[]).length === 0) ? (
              // Loading skeleton cards
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-80 h-[520px] bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gradient-to-br from-green-200 to-emerald-200 dark:from-gray-700 dark:to-gray-800"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              <>
                {/* Display first 10 HUD properties with complete information */}
                {((hudProperties as any[]) || []).slice(0, 10).map((community: any, index: number) => (
                  <CommunityCard key={`hud-${community.id}-${index}`} community={community} variant="compact" className="flex-shrink-0" />
                ))}
                
                {/* Action Card at the end */}
                <Link to="/ai-search-intelligence?query=HUD">
                  <div className="overflow-hidden flex-shrink-0 w-64 h-[30rem] border-2 border-green-300 dark:border-green-600 hover:shadow-xl transition-all cursor-pointer group bg-white dark:bg-gray-900 rounded-xl">
                    <div className="aspect-[4/3] bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center">
                      <div className="text-center p-6">
                        <Building2 className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {(hudCount as any)?.total ?? '...'}
                        </h3>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          HUD Communities
                        </p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
                        Explore All HUD Housing
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Income-based affordable housing with government-verified pricing
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-gray-700 dark:text-gray-300">30% of income</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-gray-700 dark:text-gray-300">Section 8 accepted</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                          <span className="text-gray-700 dark:text-gray-300">No hidden fees</span>
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
                  </div>
                </Link>
              </>
            )}
            </div>
          </div>
        </div>
      </section>


      {/* New York Empire State Excellence - Metropolitan Premium Living */}
      <section ref={newYorkSectionRef} className="relative px-4 py-16 overflow-hidden">
        {/* Premium Metropolitan Skyline Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 dark:from-purple-950 dark:via-indigo-900 dark:to-blue-950"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
                             radial-gradient(circle at 40% 20%, rgba(129, 140, 248, 0.2) 0%, transparent 40%)`,
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Premium Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-4xl md:text-5xl font-bold mb-4">
              <span className="text-5xl">🗽</span>
              <span className="bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
                New York Empire Excellence
              </span>
            </div>
            <p className="text-xl text-gray-200 mb-8">
              World-class senior living in the Empire State across {((newYorkCommunities as any)?.communities?.length || 0)} communities
            </p>
          </div>

          {/* NYC Strategic Savings Tips */}
          <div className="mb-10 bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Info className="w-6 h-6 text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-white">NYC Strategic Savings Tips</h3>
            </div>
            
            <div className="space-y-2">
              <ul className="space-y-2 text-gray-200 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🗽</span>
                  <span><strong>Outer Borough Bargain:</strong> Brooklyn/Queens 25% less than Manhattan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🗽</span>
                  <span><strong>Winter Move Special:</strong> January-March saves $1000-2000/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🗽</span>
                  <span><strong>Hudson Valley Alternative:</strong> 1-hour north, 50% savings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🗽</span>
                  <span><strong>Rent Control Awareness:</strong> Ask about stabilized units</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-4 p-3 bg-purple-800/30 rounded-lg border border-purple-600/30">
              <p className="text-sm text-purple-200">
                <span className="font-semibold text-purple-300">NYC Pro Tip:</span> Manhattan communities have 3-24 month waitlists. 
                Consider "bridge communities" in Westchester while waiting. Many offer shuttle service to NYC for cultural events.
              </p>
            </div>
          </div>

          {/* Excellence Showcase Header */}
          <div className="mb-8 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Empire State Excellence Showcase</h3>
                  <p className="text-sm text-gray-300">Premium metropolitan communities across New York</p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 text-lg font-bold">
                {((newYorkCommunities as any)?.communities?.length || 0)} Featured
              </Badge>
            </div>
          </div>

          {/* Premium Communities Display */}
          <div className="relative">
            <div ref={newYorkSliderRef} className="flex gap-6 overflow-x-auto overflow-y-hidden pb-6 scrollbar-thin scrollbar-thumb-purple-500 dark:scrollbar-thumb-purple-400" style={{scrollBehavior: 'smooth'}}>
              {(newYorkLoading || !newYorkCommunities || !(newYorkCommunities as any)?.communities?.length) ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-80 h-[520px] bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-xl border border-purple-500/30 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gradient-to-br from-purple-800/50 to-indigo-800/50"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-purple-800/50 rounded"></div>
                      <div className="h-4 bg-purple-800/50 rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              ) : (
                ((newYorkCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <div key={`newyork-${community.id}-${index}`} className="flex-shrink-0">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl opacity-30 group-hover:opacity-60 transition duration-300 blur"></div>
                      <div className="relative">
                        <CommunityCard community={community} variant="compact" />
                        {/* Premium Badge Overlay */}
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold shadow-lg">
                          Metropolitan Elite
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="text-center mt-8">
              <Link to={getLocationSearchUrl('New York')}>
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-lg font-semibold shadow-xl">
                  Explore All New York Communities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Canadian Communities - INTERNATIONAL ADVENTURE */}
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
              ? 'Communities across all 13 provinces and territories • bilingual French/English services available' 
              : '24 communautés dans les 13 provinces et territoires • 10 avec services bilingues français/anglais'}
          </p>
        
          <div className="relative">
            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 rounded-full"
              onClick={() => scrollSlider(canadianSliderRef, 'left')}
            >
              <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 rounded-full"
              onClick={() => scrollSlider(canadianSliderRef, 'right')}
            >
              <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </Button>
            
            <div ref={canadianSliderRef} className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-red-500 dark:scrollbar-thumb-red-400 " style={{scrollBehavior: 'smooth'}}>
              {/* Show Canadian communities */}
            {canadianLoading ? (
              // Loading skeleton cards
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-72 h-[420px] bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gradient-to-br from-purple-200 to-blue-200 dark:from-gray-700 dark:to-gray-800"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : ((canadianCommunities as any)?.communities || []).length === 0 ? (
              <>
                {/* Show promotional card when no communities available */}
                <Link to={getLocationSearchUrl('canada')}>
                  <div className="overflow-hidden flex-shrink-0 w-64 h-[30rem] border-2 border-red-300 dark:border-red-600 hover:shadow-xl transition-all cursor-pointer group bg-white dark:bg-gray-900 rounded-xl">
                    <div className="aspect-[4/3] bg-gradient-to-br from-red-100 to-white dark:from-red-900 dark:to-gray-900 flex items-center justify-center">
                      <div className="text-center p-6">
                        <Flag className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-red-700 dark:text-red-300">
                          24+
                        </h3>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {language === 'en' ? 'Canadian Communities' : 'Communautés'}
                        </p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
                        {language === 'en' ? 'Explore Canadian Communities' : 'Explorer les communautés'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {language === 'en' 
                          ? 'Discover senior living across all provinces and territories' 
                          : 'Découvrez les résidences pour aînés dans toutes les provinces'}
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-gray-700 dark:text-gray-300">
                            {language === 'en' ? 'Vancouver to Halifax' : 'De Vancouver à Halifax'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-gray-700 dark:text-gray-300">
                            {language === 'en' ? 'Bilingual services' : 'Services bilingues'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-gray-700 dark:text-gray-300">
                            {language === 'en' ? 'Provincial healthcare' : 'Soins de santé provinciaux'}
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
                  </div>
                </Link>
              </>
            ) : (
              ((canadianCommunities as any)?.communities || []).map((community: any, index: number) => (
                <CommunityCard key={`canadian-${community.id}-${index}`} community={community} variant="compact" className="flex-shrink-0" />
              ))
            )}
            </div>
          </div>
        </div>
      </section>

      {/* Puerto Rico Communities - CARIBBEAN PARADISE */}
      <section className="px-4 py-8 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-teal-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🏝️ Puerto Rico Communities
              </h2>
              <Link to={getLocationSearchUrl('Puerto Rico')}>
                <Button variant="outline" className="flex items-center gap-2 border-cyan-300 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-600 dark:text-cyan-300 dark:hover:bg-cyan-900/20">
                  View All Puerto Rico
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                Complete island coverage with senior living options from San Juan to Ponce, Fajardo to Cabo Rojo
              </p>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Communities<br/>Island-wide</div>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <Badge className="bg-cyan-600 text-white px-3 py-1">🏖️ Caribbean Paradise Living</Badge>
              <Badge className="bg-teal-600 text-white px-3 py-1">🌴 Year-Round Tropical Climate</Badge>
              <Badge className="bg-blue-600 text-white px-3 py-1">🇺🇸 U.S. Territory - No Passport Needed</Badge>
              <Badge className="bg-emerald-600 text-white px-3 py-1">💰 Tax Advantages for Retirees</Badge>
            </div>
          </div>
          
          {/* Puerto Rico Insider Savings Tips */}
          <div className="mb-8 bg-gradient-to-br from-cyan-900/90 to-teal-900/90 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Info className="w-6 h-6 text-cyan-300" />
              </div>
              <h3 className="text-xl font-bold text-white">Puerto Rico Insider Savings Tips</h3>
            </div>
            
            <div className="space-y-2">
              <ul className="space-y-2 text-gray-200 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🏝️</span>
                  <span><strong>Act 60 Tax Benefits:</strong> Retirees pay 0% federal tax on retirement income</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🏝️</span>
                  <span><strong>Medicare Advantage:</strong> Full Medicare coverage unlike other Caribbean islands</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🏝️</span>
                  <span><strong>Mountain vs Coast:</strong> Central mountain towns 40% less than San Juan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🏝️</span>
                  <span><strong>Hurricane Season Deals:</strong> September-November moves save 20-30%</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-4 p-3 bg-cyan-800/30 rounded-lg border border-cyan-600/30">
              <p className="text-sm text-cyan-200">
                <span className="font-semibold text-cyan-300">Pro Tip:</span> As a U.S. territory, Puerto Rico offers unique benefits - no passport needed, 
                use of U.S. dollar, and access to familiar brands while enjoying Caribbean living at 50% less than Hawaii.
              </p>
            </div>
          </div>
          
          {/* Puerto Rico Communities Slider */}
          {puertoRicoLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full"></div>
            </div>
          ) : !(puertoRicoCommunities as any)?.communities?.length ? (
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>Loading Puerto Rico communities...</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setLocation(getLocationSearchUrl('Puerto Rico'))}
              >
                Search All Puerto Rico Communities
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-cyan-500 dark:scrollbar-thumb-cyan-400 " style={{scrollBehavior: 'smooth'}}>
                {((puertoRicoCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <CommunityCard key={`pr-${community.id}-${index}`} community={community} variant="compact" className="flex-shrink-0" />
                ))}
              </div>
              
              <div className="text-center mt-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  🎉 Complete island coverage achieved! From eastern Fajardo to western Cabo Rojo, northern coastal cities to central mountain towns
                </div>
                <Button 
                  variant="outline" 
                  className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-600 dark:text-cyan-300 dark:hover:bg-cyan-900/20"
                  onClick={() => setLocation(getLocationSearchUrl('Puerto Rico'))}
                >
                  Explore All 50+ Puerto Rico Communities
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Peru Communities - ANDEAN RETIREMENT */}
      <section className="px-4 py-8 bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-950/30 dark:via-gray-900 dark:to-red-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🇵🇪 Peru Communities
              </h2>
              <Link to={getLocationSearchUrl('Peru')}>
                <Button variant="outline" className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20">
                  View All Peru
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                Discover retirement communities in Lima, Cusco, Arequipa, and coastal regions with affordable healthcare
              </p>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">25+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Communities<br/>Nationwide</div>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <Badge className="bg-red-600 text-white px-3 py-1">🏔️ Andean Mountain Views</Badge>
              <Badge className="bg-yellow-600 text-white px-3 py-1">💰 Low Cost of Living</Badge>
              <Badge className="bg-green-600 text-white px-3 py-1">🏥 Quality Healthcare</Badge>
              <Badge className="bg-purple-600 text-white px-3 py-1">🌍 Expat-Friendly Culture</Badge>
            </div>
          </div>
          
          {/* Peru Insider Savings Tips */}
          <div className="mb-8 bg-gradient-to-br from-red-900/90 to-yellow-900/90 backdrop-blur-lg rounded-2xl border border-red-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Info className="w-6 h-6 text-red-300" />
              </div>
              <h3 className="text-xl font-bold text-white">Peru Expat Insider Savings Tips</h3>
            </div>
            
            <div className="space-y-2">
              <ul className="space-y-2 text-gray-200 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🏔️</span>
                  <span><strong>Healthcare Bargain:</strong> Private hospitals 70-80% less than US costs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🏔️</span>
                  <span><strong>Lima vs Provinces:</strong> Arequipa and Cusco 40% cheaper than Lima</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🏔️</span>
                  <span><strong>Rentista Visa:</strong> Show $1,000/month income for residency benefits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🏔️</span>
                  <span><strong>Sacred Valley Secret:</strong> Best climate year-round, 50% less than Cusco city</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-4 p-3 bg-red-800/30 rounded-lg border border-red-600/30">
              <p className="text-sm text-red-200">
                <span className="font-semibold text-red-300">Pro Tip:</span> Peru's affordable healthcare system attracts many expat retirees. 
                Join local expat groups in Lima or Arequipa for insider housing deals and trusted healthcare provider recommendations.
              </p>
            </div>
          </div>
          
          {/* Peru Communities Display */}
          {peruLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
            </div>
          ) : !(peruCommunities as any)?.communities?.length ? (
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>Loading Peru communities...</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setLocation(getLocationSearchUrl('Peru'))}
              >
                Search All Peru Communities
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-red-500 dark:scrollbar-thumb-red-400 " style={{scrollBehavior: 'smooth'}}>
                {((peruCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <CommunityCard key={`pe-${community.id}-${index}`} community={community} variant="compact" className="flex-shrink-0" />
                ))}
              </div>
              
              <div className="text-center mt-6">
                <Button 
                  variant="outline" 
                  className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20"
                  onClick={() => setLocation(getLocationSearchUrl('Peru'))}
                >
                  Explore All Peru Communities
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Cuba Caribbean Excellence - Vintage Paradise Living */}
      <section className="relative px-4 py-16 overflow-hidden">
        {/* Premium Caribbean Vintage Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-red-800 to-amber-900 dark:from-blue-950 dark:via-red-900 dark:to-amber-950"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(220, 38, 38, 0.2) 0%, transparent 50%),
                             radial-gradient(circle at 40% 20%, rgba(245, 158, 11, 0.2) 0%, transparent 40%)`,
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Premium Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-4xl md:text-5xl font-bold mb-4">
              <span className="text-5xl">🇨🇺</span>
              <span className="bg-gradient-to-r from-blue-300 to-red-300 bg-clip-text text-transparent">
                Cuba Caribbean Heritage
              </span>
            </div>
            <p className="text-xl text-gray-200 mb-8">
              Authentic Caribbean retirement in the Pearl of the Antilles
            </p>
          </div>

          {/* Cuba Insider Living Tips */}
          <div className="mb-10 bg-gradient-to-br from-blue-900/90 to-red-900/90 backdrop-blur-lg rounded-2xl border border-blue-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Info className="w-6 h-6 text-blue-300" />
              </div>
              <h3 className="text-xl font-bold text-white">Cuba Insider Living Tips</h3>
            </div>
            
            <div className="space-y-2">
              <ul className="space-y-2 text-gray-200 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🌴</span>
                  <span><strong>Casa Particular:</strong> Private homes 40% less than hotels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🌴</span>
                  <span><strong>Havana vs Beach:</strong> Beach towns 30% more affordable</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🌴</span>
                  <span><strong>Long-term Stays:</strong> 6+ months saves 20-25%</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🌴</span>
                  <span><strong>Community Living:</strong> Shared amenities reduce costs</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-4 p-3 bg-blue-800/30 rounded-lg border border-blue-600/30">
              <p className="text-sm text-blue-200">
                <span className="font-semibold text-blue-300">Caribbean Pro Tip:</span> Cuba offers unique cultural immersion opportunities. 
                Many communities include Spanish lessons, salsa dancing, and cultural exchanges as part of their programs.
              </p>
            </div>
          </div>

          {/* Excellence Showcase Header */}
          <div className="mb-8 bg-gradient-to-r from-blue-900/60 to-red-900/60 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-red-500 flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Caribbean Heritage Showcase</h3>
                  <p className="text-sm text-gray-300">Authentic Cuban retirement communities</p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-blue-500 to-red-500 text-white px-4 py-2 text-lg font-bold">
                {((cubaCommunities as any)?.communities?.length || 0)} Featured
              </Badge>
            </div>
          </div>

          {/* Premium Communities Display */}
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto overflow-y-hidden pb-6 scrollbar-thin scrollbar-thumb-blue-500 dark:scrollbar-thumb-blue-400" style={{scrollBehavior: 'smooth'}}>
              {(cubaLoading || !cubaCommunities || !(cubaCommunities as any)?.communities?.length) ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-80 h-[520px] bg-gradient-to-br from-blue-900/50 to-red-900/50 rounded-xl border border-blue-500/30 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gradient-to-br from-blue-800/50 to-red-800/50"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-blue-800/50 rounded"></div>
                      <div className="h-4 bg-blue-800/50 rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              ) : (
                ((cubaCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <div key={`cuba-${community.id}-${index}`} className="flex-shrink-0">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-red-400 rounded-xl opacity-30 group-hover:opacity-60 transition duration-300 blur"></div>
                      <div className="relative">
                        <CommunityCard community={community} variant="compact" />
                        {/* Premium Badge Overlay */}
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-red-500 text-white font-bold shadow-lg">
                          Caribbean Heritage
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="text-center mt-8">
              <Link to={getLocationSearchUrl('Cuba')}>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white px-8 py-6 text-lg font-semibold shadow-xl">
                  Explore All Cuba Communities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Costa Rica Communities - RETIREMENT PARADISE */}
      <section className="px-4 py-8 bg-gradient-to-br from-green-50 via-blue-50 to-green-50 dark:from-green-950/30 dark:via-blue-950/30 dark:to-green-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🇨🇷 Costa Rica Communities
              </h2>
              <Link to={getLocationSearchUrl('Costa Rica')}>
                <Button variant="outline" className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20">
                  View All Costa Rica
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                Top retirement destination with world-class healthcare and perfect climate
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-blue-600 text-white px-3 py-1">🏥 CIMA Hospital Network</Badge>
              <Badge className="bg-green-600 text-white px-3 py-1">🌴 Perfect Climate Year-Round</Badge>
              <Badge className="bg-purple-600 text-white px-3 py-1">💰 Pensionado Benefits</Badge>
              <Badge className="bg-yellow-600 text-white px-3 py-1">🏖️ Beach & Mountain Options</Badge>
            </div>
          </div>
          
          {/* Costa Rica Insider Savings Tips */}
          <div className="mb-8 bg-gradient-to-br from-green-900/90 to-blue-900/90 backdrop-blur-lg rounded-2xl border border-green-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Info className="w-6 h-6 text-green-300" />
              </div>
              <h3 className="text-xl font-bold text-white">Costa Rica Pensionado Insider Tips</h3>
            </div>
            
            <div className="space-y-2">
              <ul className="space-y-2 text-gray-200 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🦜</span>
                  <span><strong>Pensionado Program:</strong> Show $1,000/month pension for discounts on everything</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🦜</span>
                  <span><strong>Central Valley Advantage:</strong> Perfect climate, 30% less than coastal areas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🦜</span>
                  <span><strong>CAJA Healthcare:</strong> Join public system for $75-150/month full coverage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">🦜</span>
                  <span><strong>Rainy Season Deals:</strong> May-November moves save 20-40% on everything</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-4 p-3 bg-green-800/30 rounded-lg border border-green-600/30">
              <p className="text-sm text-green-200">
                <span className="font-semibold text-green-300">Pro Tip:</span> Costa Rica's Pensionado visa offers automatic discounts - 50% off entertainment, 
                25% off airlines, 20% off medical bills. Many expat communities in Atenas and Grecia offer built-in social networks.
              </p>
            </div>
          </div>
          
          {/* Costa Rica Communities Display */}
          {costaRicaLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
            </div>
          ) : !(costaRicaCommunities as any)?.communities?.length ? (
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>Loading Costa Rica communities...</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setLocation(getLocationSearchUrl('Costa Rica'))}
              >
                Search All Costa Rica Communities
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-green-500 dark:scrollbar-thumb-green-400 " style={{scrollBehavior: 'smooth'}}>
                {((costaRicaCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <CommunityCard key={`cr-${community.id}-${index}`} community={community} variant="compact" className="flex-shrink-0" />
                ))}
              </div>
              
              <div className="text-center mt-6">
                <Button 
                  variant="outline" 
                  className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20"
                  onClick={() => setLocation(getLocationSearchUrl('Costa Rica'))}
                >
                  Explore All Costa Rica Communities
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Panama Communities - PENSIONADO PARADISE */}
      <section className="px-4 py-8 bg-gradient-to-br from-blue-50 via-red-50 to-blue-50 dark:from-blue-950/30 dark:via-red-950/30 dark:to-blue-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🇵🇦 Panama Communities
              </h2>
              <Link to={getLocationSearchUrl('Panama')}>
                <Button variant="outline" className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20">
                  View All Panama
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                Premier retirement haven with Pensionado visa program and US dollar economy
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-blue-600 text-white px-3 py-1">💵 US Dollar Economy</Badge>
              <Badge className="bg-green-600 text-white px-3 py-1">🏥 Johns Hopkins Affiliate</Badge>
              <Badge className="bg-purple-600 text-white px-3 py-1">🎫 Pensionado Discounts</Badge>
              <Badge className="bg-orange-600 text-white px-3 py-1">🏔️ Boquete Mountain Living</Badge>
            </div>
          </div>
          
          {/* Panama Insider Savings Tips */}
          <div className="mb-8 bg-gradient-to-br from-blue-900/90 to-red-900/90 backdrop-blur-lg rounded-2xl border border-blue-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Info className="w-6 h-6 text-blue-300" />
              </div>
              <h3 className="text-xl font-bold text-white">Panama Dollar Economy Savings Tips</h3>
            </div>
            
            <div className="space-y-2">
              <ul className="space-y-2 text-gray-200 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">💵</span>
                  <span><strong>US Dollar Advantage:</strong> No currency exchange fees or fluctuation risks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">💵</span>
                  <span><strong>Boquete vs City:</strong> Mountain towns 40% cheaper than Panama City</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">💵</span>
                  <span><strong>Pensionado Perks:</strong> 50% off hotels, 30% off restaurants, 25% off utilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">💵</span>
                  <span><strong>Friendly Nations Visa:</strong> Fast-track residency for US & Canadian citizens</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-4 p-3 bg-blue-800/30 rounded-lg border border-blue-600/30">
              <p className="text-sm text-blue-200">
                <span className="font-semibold text-blue-300">Pro Tip:</span> Panama's territorial tax system means foreign-sourced income is tax-free. 
                Combined with Pensionado discounts and US dollar stability, retirees can stretch their dollars 30-50% further than in the US.
              </p>
            </div>
          </div>
          
          {/* Panama Communities Display */}
          {panamaLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : !(panamaCommunities as any)?.communities?.length ? (
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>Loading Panama communities...</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setLocation(getLocationSearchUrl('Panama'))}
              >
                Search All Panama Communities
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-blue-500 dark:scrollbar-thumb-blue-400 " style={{scrollBehavior: 'smooth'}}>
                {((panamaCommunities as any)?.communities || []).map((community: any, index: number) => (
                  <CommunityCard key={`pa-${community.id}-${index}`} community={community} variant="compact" className="flex-shrink-0" />
                ))}
              </div>
              
              <div className="text-center mt-6">
                <Button 
                  variant="outline" 
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20"
                  onClick={() => setLocation(getLocationSearchUrl('Panama'))}
                >
                  Explore All Panama Communities
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 🔥 CANADA SECTION 🇨🇦 */}
      <section className="px-4 py-16 bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-950/30 dark:via-gray-900 dark:to-red-950/30">
        <div className="max-w-7xl mx-auto">
          {/* Canada Header with Maple Leaf Theme */}
          <div className="mb-12 text-center">
            <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 mb-6 text-lg">
              <span className="text-2xl mr-2">🇨🇦</span>
              COMMUNITIES ACROSS CANADA
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Canadian Senior Living & Long-Term Care
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Complete coverage of retirement homes, long-term care facilities, and assisted living across all 13 provinces and territories. 
              From Ontario's retirement residences to Yukon's specialized care homes.
            </p>
          </div>

          {/* Province Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="border-2 border-red-200 dark:border-red-800 bg-white dark:bg-gray-900">
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-2xl text-red-600">ON</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ontario</p>
                <Link to={getLocationSearchUrl('Ontario')}>
                  <Button size="sm" variant="link" className="mt-2 text-red-600">
                    View All →
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 border-red-200 dark:border-red-800 bg-white dark:bg-gray-900">
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-2xl text-red-600">QC</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quebec</p>
                <Link to={getLocationSearchUrl('Quebec')}>
                  <Button size="sm" variant="link" className="mt-2 text-red-600">
                    View All →
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 border-red-200 dark:border-red-800 bg-white dark:bg-gray-900">
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-2xl text-red-600">BC</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">British Columbia</p>
                <Link to={getLocationSearchUrl('British Columbia')}>
                  <Button size="sm" variant="link" className="mt-2 text-red-600">
                    View All →
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 border-red-200 dark:border-red-800 bg-white dark:bg-gray-900">
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-2xl text-red-600">AB</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Alberta</p>
                <Link to={getLocationSearchUrl('Alberta')}>
                  <Button size="sm" variant="link" className="mt-2 text-red-600">
                    View All →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Featured Ontario Communities */}
          {ontarioCommunities && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="text-red-600" />
                Featured Ontario Communities ({((ontarioCommunities as any)?.communities?.length || 0).toLocaleString()})
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-red-500">
                {((ontarioCommunities as any)?.communities || []).slice(0, 20).map((community: any, index: number) => (
                  <CommunityCard key={`on-${community.id}`} community={community} variant="compact" className="flex-shrink-0" />
                ))}
              </div>
            </div>
          )}

          {/* Featured Quebec Communities */}
          {quebecCommunities && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="text-blue-600" />
                Featured Quebec Communities ({((quebecCommunities as any)?.communities?.length || 0).toLocaleString()})
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-blue-500">
                {((quebecCommunities as any)?.communities || []).slice(0, 20).map((community: any, index: number) => (
                  <CommunityCard key={`qc-${community.id}`} community={community} variant="compact" className="flex-shrink-0" />
                ))}
              </div>
            </div>
          )}

          {/* All Provinces Links Grid */}
          <div className="bg-gradient-to-r from-red-100 to-white dark:from-red-900/20 dark:to-gray-900 rounded-xl p-6">
            <h3 className="font-bold text-xl mb-4">Explore All Provinces & Territories:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'Ontario', code: 'ON' },
                { name: 'Quebec', code: 'QC' },
                { name: 'British Columbia', code: 'BC' },
                { name: 'Alberta', code: 'AB' },
                { name: 'Nova Scotia', code: 'NS' },
                { name: 'Saskatchewan', code: 'SK' },
                { name: 'New Brunswick', code: 'NB' },
                { name: 'Manitoba', code: 'MB' },
                { name: 'Newfoundland', code: 'NL' },
                { name: 'NW Territories', code: 'NT' },
                { name: 'PEI', code: 'PE' },
                { name: 'Nunavut', code: 'NU' },
                { name: 'Yukon', code: 'YT' }
              ].map((province) => (
                <Link key={province.code} to={getLocationSearchUrl(province.name)}>
                  <Button variant="outline" className="w-full justify-between border-red-300 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/20">
                    <span>{province.name}</span>
                    
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 🔥 AUSTRALIA SECTION 🇦🇺 */}
      <section className="px-4 py-16 bg-gradient-to-br from-green-50 via-yellow-50 to-green-50 dark:from-green-950/30 dark:via-yellow-950/30 dark:to-green-950/30">
        <div className="max-w-7xl mx-auto">
          {/* Australia Header */}
          <div className="mb-12 text-center">
            <Badge className="bg-gradient-to-r from-green-700 to-yellow-600 text-white px-6 py-2 mb-6 text-lg">
              <span className="text-2xl mr-2">🇦🇺</span>
              AGED CARE FACILITIES
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Australian Aged Care & Retirement Villages
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive directory of aged care homes, retirement villages, and residential care across all Australian states and territories.
            </p>
          </div>

          {/* State Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            <Card className="border-2 border-green-200 dark:border-green-800 bg-white dark:bg-gray-900">
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-2xl text-green-600">NSW</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">New South Wales</p>
                <Link to={getLocationSearchUrl('New South Wales')}>
                  <Button size="sm" variant="link" className="mt-2 text-green-600">
                    View NSW →
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-white dark:bg-gray-900">
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-2xl text-yellow-600">QLD</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Queensland</p>
                <Link to={getLocationSearchUrl('Queensland')}>
                  <Button size="sm" variant="link" className="mt-2 text-yellow-600">
                    View QLD →
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900">
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-2xl text-blue-600">VIC</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Victoria</p>
                <Link to={getLocationSearchUrl('Victoria')}>
                  <Button size="sm" variant="link" className="mt-2 text-blue-600">
                    View VIC →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Featured NSW Communities */}
          {nswCommunities && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Building className="text-green-600" />
                New South Wales Aged Care ({((nswCommunities as any)?.communities?.length || 0)})
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-green-500">
                {((nswCommunities as any)?.communities || []).slice(0, 15).map((community: any, index: number) => (
                  <CommunityCard key={`nsw-${community.id}`} community={community} variant="compact" className="flex-shrink-0" />
                ))}
              </div>
            </div>
          )}

          {/* All States Links */}
          <div className="bg-gradient-to-r from-yellow-100 to-green-100 dark:from-yellow-900/20 dark:to-green-900/20 rounded-xl p-6">
            <h3 className="font-bold text-xl mb-4">Browse All Australian States:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'New South Wales', code: 'NSW' },
                { name: 'Queensland', code: 'QLD' },
                { name: 'Victoria', code: 'VIC' },
                { name: 'South Australia', code: 'SA' },
                { name: 'Tasmania', code: 'TAS' },
                { name: 'ACT', code: 'ACT' },
                { name: 'Western Australia', code: 'WA' }
              ].map((state) => (
                <Link key={state.code} to={getLocationSearchUrl(state.name)}>
                  <Button variant="outline" className="w-full justify-between border-green-300 hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-900/20">
                    <span>{state.name}</span>
                    
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GLOBAL DESTINATIONS - Japan, Singapore, Scotland */}
      <section className="px-4 py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-purple-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 mb-6 text-lg">
              <Globe className="h-5 w-5 mr-2" />
              GLOBAL SENIOR LIVING
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              International Senior Care Destinations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Japan */}
            <Card className="border-2 border-red-200 dark:border-red-800">
              <CardHeader className="bg-gradient-to-r from-red-500 to-white text-white">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🇯🇵</span>
                  Japan - Tokyo Region
                </CardTitle>
                <CardDescription className="text-red-100">
                  {japanCommunities ? ((japanCommunities as any)?.communities?.length || 49) : 49} Senior Care Facilities
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm mb-4">Premium elder care in Tokyo metropolitan area with traditional Japanese hospitality and modern healthcare.</p>
                <Link to={getLocationSearchUrl('Japan')}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Explore Japan Senior Care →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Singapore */}
            <Card className="border-2 border-red-200 dark:border-red-800">
              <CardHeader className="bg-gradient-to-r from-red-600 to-white text-white">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🇸🇬</span>
                  Singapore
                </CardTitle>
                <CardDescription className="text-red-100">
                  {singaporeCommunities ? ((singaporeCommunities as any)?.communities?.length || 27) : 27} Care Facilities
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm mb-4">World-class healthcare and modern senior living in Asia's premier city-state.</p>
                <Link to={getLocationSearchUrl('Singapore')}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    View Singapore Facilities →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Scotland */}
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-white text-white">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🏴󐁧󐁢󐁳󐁣󐁴󐁿</span>
                  Scotland
                </CardTitle>
                <CardDescription className="text-blue-100">
                  {scotlandCommunities ? ((scotlandCommunities as any)?.communities?.length || 31) : 31} Care Homes
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm mb-4">Traditional Scottish care homes with stunning Highland and city locations.</p>
                <Link to={getLocationSearchUrl('Scotland')}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Explore Scotland Care →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mexican Communities - AFFORDABLE PARADISE */}
      <section ref={californiaSectionRef} className="px-4 py-8 relative overflow-hidden">
        {/* Background Mexico-themed styling */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-green-100 via-white to-red-100 dark:from-green-900/20 dark:via-gray-900 dark:to-red-900/20 opacity-40"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                <span className="text-2xl">🇲🇽</span>
                Featured Mexican Communities
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 dark:text-green-300 font-medium">Affordable retirement paradise</span>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-700 dark:text-red-300 font-medium">English-speaking communities</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">$1,200 - $3,500 USD</div>
              <div className="text-sm text-green-600 dark:text-green-300 font-medium">Mexican retirement havens</div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            {((mexicoCommunities as any)?.communities?.length || 0)} premium communities • 
            Expat-friendly locations with modern amenities
          </p>
        
          <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-green-500 dark:scrollbar-thumb-green-400 " style={{scrollBehavior: 'smooth'}}>
            {/* Show Mexican communities with critical information */}
            {mexicoLoading ? (
              // Loading skeleton cards
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-80 h-[520px] bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gradient-to-br from-green-200 to-emerald-200 dark:from-gray-700 dark:to-gray-800"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              ((mexicoCommunities as any)?.communities || []).map((community: any, index: number) => (
                <CommunityCard key={`mexico-${community.id}-${index}`} community={community} variant="compact" className="flex-shrink-0" />
              ))
            )}
          </div>
        </div>
      </section>


      {/* Comprehensive Care Spectrum Section */}
      <section id="care-spectrum" className="px-4 py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 mb-4">
                <Sparkles className="h-4 w-4 mr-2" />
                UNDERSTANDING SENIOR CARE
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Complete Care Spectrum Guide
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                From independent living to 24-hour medical care, understand all your options with transparent pricing and features
              </p>
            </div>
            
            {/* Care Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {careTypes.map((type, index) => {
                const Icon = type.icon;
                return (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-xl transition-all h-full border-2 hover:border-blue-400">
                      <CardHeader className={`${type.color} text-white`}>
                        <div className="flex items-center justify-between">
                          <Icon className="h-8 w-8" />
                          <Badge className="bg-white/20 text-white">
                            Level {index + 1}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl mt-3">{type.name}</CardTitle>
                        <div className="text-lg font-bold">{type.avgCost}</div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {type.description}
                        </p>
                        <div className="space-y-2">
                          {type.keyFeatures.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full mt-4"
                          onClick={() => setLocation(`/map-search?care_type=${type.id}`)}
                        >
                          Search {type.name} Communities
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Call to Action */}
            <div className="text-center mt-12">
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">
                  Ready to Find the Perfect Community?
                </h3>
                <p className="text-lg mb-6 text-blue-100">
                  Use our AI-powered search to match your needs with the right care level and budget
                </p>
                <Button 
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => setLocation('/ai-search-intelligence')}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Start Your Search
                </Button>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistical Data Section */}
      <section className="px-4 py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 mb-4">
              <BarChart3 className="h-4 w-4 mr-2" />
              DATABASE INSIGHTS
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Worldwide Coverage Statistics
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-blue-200 dark:border-blue-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  Database Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Communities</span>
                    <span className="font-bold text-green-600">{formatCount(communityStats?.totalCommunities, statsLoading)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Countries Covered</span>
                    <span className="font-bold text-blue-600">{formatCount(communityStats?.countryCount, statsLoading)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">AI Discovered (30d)</span>
                    <span className="font-bold text-purple-600">+{formatCount(communityStats?.recentlyDiscovered30d, statsLoading)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">With Photos</span>
                    <span className="font-bold text-orange-600">{formatCount(communityStats?.totalWithPhotos, statsLoading)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-green-200 dark:border-green-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-green-600" />
                  Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">HUD Verified</span>
                    <span className="font-bold text-green-600">{formatCount(communityStats?.totalHUD, statsLoading)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Verified Listings</span>
                    <span className="font-bold text-blue-600">{formatCount(communityStats?.totalVerified, statsLoading)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Claimed by Owners</span>
                    <span className="font-bold text-purple-600">{formatCount(communityStats?.totalClaimed, statsLoading)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">States/Regions</span>
                    <span className="font-bold text-orange-600">{formatCount(communityStats?.stateCount, statsLoading)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-purple-200 dark:border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-purple-600" />
                  Care Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Independent Living</span>
                    <span className="font-bold">{formatCount(communityStats?.careTypeDistribution?.independentLiving, statsLoading)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Assisted Living</span>
                    <span className="font-bold">{formatCount(communityStats?.careTypeDistribution?.assistedLiving, statsLoading)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Memory Care</span>
                    <span className="font-bold">{formatCount(communityStats?.careTypeDistribution?.memoryCare, statsLoading)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Skilled Nursing</span>
                    <span className="font-bold">{formatCount(communityStats?.careTypeDistribution?.skilledNursing, statsLoading)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Average Monthly Cost
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">$4,287</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Global average across all care types
                    </p>
                  </div>
                  <DollarSign className="h-12 w-12 text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Family Satisfaction
                    </h3>
                    <p className="text-3xl font-bold text-green-600">4.3/5.0</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Based on verified reviews
                    </p>
                  </div>
                  <Star className="h-12 w-12 text-green-400 opacity-50" />
                </div>
                <div className="mt-4 flex gap-1">
                  {[1,2,3,4].map(i => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <Star className="h-5 w-5 text-gray-300" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Trust Indicators */}
          <Card className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Platform Trust Indicators
                </h3>
              </div>
              <div className="flex flex-wrap gap-4 justify-center text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Daily Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Government Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No Hidden Fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>100% Free Access</span>
                </div>
              </div>
            </CardContent>
          </Card>
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
              <span className="font-medium text-gray-900 dark:text-white">{formatCount(communityStats?.totalCommunities, statsLoading)}+ Communities</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default CommunityDirectorySections;
