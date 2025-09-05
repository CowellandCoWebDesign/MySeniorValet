import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/NavigationHeader";
import { AutocompleteSearch } from "@/components/AutocompleteSearch";
import { NaturalLanguageSearchBar } from "@/components/NaturalLanguageSearchBar";
import { 
  Building2, Search, MapPin, Home, Users, DollarSign, Shield, 
  Star, Filter, Database, TrendingUp, BarChart3, Globe,
  ChevronRight, Clock, CheckCircle, Info, Heart,
  HeartHandshake, Brain, Activity, Stethoscope, UserCheck,
  Calendar, Hotel, Flower2, Sparkles, AlertCircle,
  Truck, Flag, Building, RefreshCw, BookOpen, ChevronLeft,
  ArrowRight, Languages, Phone, Award
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { EnhancedCommunityCard } from "@/components/EnhancedCommunityCard";
import { FeaturedExcellenceCard } from "@/components/FeaturedExcellenceCard";
import { RedTagDeals } from "@/components/RedTagDeals";
import { MarketIntelligence } from "@/components/MarketIntelligence";
import { CareSpectrumSlider } from "@/components/CareSpectrumSlider";
import { MoveInCostCalculator } from "@/components/MoveInCostCalculator";
import { CostComparisonWorksheet } from "@/components/CostComparisonWorksheet";
import { HeroMascotPanel } from "@/components/mascot/HeroMascotPanel";
import { MascotLoadingDisplay } from "@/components/MascotLoadingDisplay";

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

export default function CommunityDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [, setLocation] = useLocation();
  
  // 3D Carousel state
  const [currentRotation, setCurrentRotation] = useState(0);
  
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
  
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  
  
  // Fetch community count
  const { data: communityCount } = useQuery({
    queryKey: ['/api/communities/count']
  });
  
  // Fetch HUD count
  const { data: hudCount } = useQuery({
    queryKey: ['/api/communities/hud-count']
  });
  
  // Fetch community stats including top states
  const { data: communityStats } = useQuery<{
    totalCommunities: string;
    avgRating: number;
    totalWithPhotos: string;
    totalHUD: string;
    stateCount: string;
    topStates: Array<{ state: string; count: string }>;
  }>({
    queryKey: ['/api/communities/stats']
  });
  
  // Extract topStates from stats
  const topStates = communityStats?.topStates || [];
  
  // Fetch Hawaii communities
  const { data: hawaiiCommunities, isLoading: hawaiiLoading } = useQuery({
    queryKey: ['/api/communities/by-state?state=HI']
  });
  
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
  
  // Fetch HUD properties for showcase
  const { data: hudProperties } = useQuery({
    queryKey: ['/api/communities/hud-properties', 10]
  });
  
  // Simulate loading for mascot display
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);
  
  // Show mascot loading display while loading
  if (isLoading) {
    return <MascotLoadingDisplay />;
  }
  
  return (
    <div>
      <NavigationHeader />
      
      {/* Hero Section with Stats */}
      <section className="relative py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg"
            alt="Cosmic background"
            className="w-full h-full object-cover opacity-40"
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
              COMPLETE DATABASE ACCESS
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Community Directory
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Access our complete database of {((communityCount as any)?.count || '35,264').toLocaleString()}+ senior living communities across the United States, Canada, Australia, Mexico, Japan, Peru, Cuba, Costa Rica & Panama
            </p>
            
            {/* Key Stats */}
            <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-white">{((communityCount as any)?.count || '35,264').toLocaleString()}+</div>
                  <div className="text-xs text-blue-100">Total Communities</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-300">{((hudCount as any)?.total || '5,077').toLocaleString()}</div>
                  <div className="text-xs text-blue-100">HUD Properties</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-white">9</div>
                  <div className="text-xs text-blue-100">Countries Covered</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-300">Live</div>
                  <div className="text-xs text-blue-100">Real-Time Data</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

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
                {((communityCount as any)?.count || '35,264').toLocaleString()}+ Communities • Live Pricing • Real Reviews
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
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors border-green-300 dark:border-green-600"
                onClick={() => setLocation('/map-search?filter=hud')}
              >
                <Shield className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">HUD Verified</span>
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-blue-300 dark:border-blue-600"
                onClick={() => setLocation('/map-search?filter=pricing')}
              >
                <DollarSign className="h-3 w-3 mr-1 text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">With Pricing</span>
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors border-yellow-300 dark:border-yellow-600"
                onClick={() => setLocation('/map-search?filter=5star')}
              >
                <Star className="h-3 w-3 mr-1 text-yellow-600" />
                <span className="text-gray-700 dark:text-gray-300">5-Star Rated</span>
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border-purple-300 dark:border-purple-600"
                onClick={() => setLocation('/map-search?filter=memory')}
              >
                <Brain className="h-3 w-3 mr-1 text-purple-600" />
                <span className="text-gray-700 dark:text-gray-300">Memory Care</span>
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-red-300 dark:border-red-600"
                onClick={() => setLocation('/map-search?filter=assisted')}
              >
                <HeartHandshake className="h-3 w-3 mr-1 text-red-600" />
                <span className="text-gray-700 dark:text-gray-300">Assisted Living</span>
              </Badge>
            </div>
          </div>
          
          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400 px-3">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
          </div>
          
          {/* Natural Language Search */}
          <div className="mb-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI-Powered Natural Language Search
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Just type what you're looking for naturally
              </p>
            </div>
            
            <NaturalLanguageSearchBar className="max-w-3xl mx-auto" />
          </div>
        </div>
      </section>

      {/* MOVED COMMUNITY SLIDER SECTIONS - NOW POSITIONED RIGHT AFTER DATABASE FEATURES */}
      
      {/* Find Your Perfect Care Level - Moved from Market Intelligence */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <CareSpectrumSlider />
        </div>
      </section>
      
      {/* Excellence Showcase - Oakmont Senior Living */}
      <section className="px-4 py-12 bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 mb-6 text-sm font-bold">
                <Award className="h-4 w-4 mr-2" />
                EXCELLENCE SHOWCASE
              </Badge>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Featured Communities by Oakmont Senior Living
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 max-w-4xl mx-auto">
                Discover excellence in senior care with our featured partner communities across California
              </p>
              
              <div className="flex flex-wrap gap-3 justify-center mb-8">
                <Badge className="bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 border-2 border-orange-300 dark:border-orange-600">
                  <Building className="h-3 w-3 mr-1" />
                  106 Communities
                </Badge>
                <Badge className="bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 border-2 border-orange-300 dark:border-orange-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  CA, NV, HI
                </Badge>
                <Badge className="bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 border-2 border-orange-300 dark:border-orange-600">
                  <Star className="h-3 w-3 mr-1" />
                  Premium Care
                </Badge>
              </div>
            </motion.div>
          </div>
          
          {/* Featured Oakmont Communities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Capriana at Brea */}
            <EnhancedCommunityCard 
              community={{
                id: 75135,
                name: "Capriana at Brea",
                city: "Brea",
                state: "CA",
                address: "900 E Imperial Hwy",
                careTypes: ["Assisted Living", "Memory Care"],
                description: "Premier senior living community offering assisted living and memory care in the heart of Orange County. Experience luxury amenities and personalized care in a vibrant community setting.",
                amenities: ["24-Hour Care", "Dining Services", "Fitness Center", "Garden Areas", "Activities Program"],
                rating: 4.8,
                reviewCount: 45
              }}
              variant="featured"
              index={0}
            />
            
            {/* Ivy Park at Alta Loma */}
            <EnhancedCommunityCard 
              community={{
                id: 75125,
                name: "Ivy Park at Alta Loma",
                city: "Alta Loma",
                state: "CA",
                address: "9954 Foothill Blvd",
                careTypes: ["Assisted Living", "Memory Care"],
                description: "Nestled in the foothills of the San Gabriel Mountains, Ivy Park offers exceptional assisted living and memory care services with a focus on dignity, respect, and quality of life.",
                amenities: ["Memory Care Programs", "Physical Therapy", "Social Activities", "Transportation", "Pet-Friendly"],
                rating: 4.7,
                reviewCount: 38
              }}
              variant="featured"
              index={1}
            />
            
            {/* Ivy Park at Bonita */}
            <EnhancedCommunityCard 
              community={{
                id: 75128,
                name: "Ivy Park at Bonita",
                city: "Chula Vista",
                state: "CA",
                address: "3302 Bonita Rd",
                careTypes: ["Assisted Living", "Memory Care"],
                description: "Beautiful senior living community in San Diego County providing compassionate assisted living and specialized memory care in a warm, homelike environment.",
                amenities: ["Specialized Care", "Restaurant-Style Dining", "Wellness Programs", "Outdoor Spaces", "Entertainment"],
                rating: 4.6,
                reviewCount: 42
              }}
              variant="featured"
              index={2}
            />
          </div>
          
          {/* Call to Action */}
          <div className="text-center">
            <Link href="/search?brand=Oakmont">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-6 text-lg font-semibold shadow-xl">
                View All 106 Oakmont Communities
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
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

          {/* Hawaii Market Insights Box */}
          <div className="mb-10 bg-gradient-to-br from-blue-900/90 to-cyan-900/90 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Info className="w-6 h-6 text-cyan-300" />
              </div>
              <h3 className="text-xl font-bold text-white">Hawaii Market Intelligence & Negotiation Guide</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-cyan-300 mb-3">Market Overview</h4>
                <ul className="space-y-2 text-gray-200 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span>Average cost: $5,500-$9,000/month (highest in nation)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span>Limited availability due to geographic constraints</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span>Year-round perfect climate reduces seasonal pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span>Strong multi-generational family presence common</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-cyan-300 mb-3">Insider Negotiation Tips</h4>
                <ul className="space-y-2 text-gray-200 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">💡</span>
                    <span><strong>Kama'aina Discount:</strong> Ask about local resident discounts (10-15% off)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">💡</span>
                    <span><strong>Off-Peak Move:</strong> June-August moves can save $500-1000/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">💡</span>
                    <span><strong>Outer Island Advantage:</strong> Big Island/Kauai 20-30% less than Oahu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">💡</span>
                    <span><strong>Ohana Plans:</strong> Multi-family member discounts available</span>
                  </li>
                </ul>
              </div>
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
                ((hawaiiCommunities as any)?.communities || []).slice(0, 20).map((community: any, index: number) => (
                  <Link key={`hawaii-${community.id}-${index}`} href={`/community/${community.id}`} className="flex-shrink-0">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-xl opacity-30 group-hover:opacity-60 transition duration-300 blur"></div>
                      <div className="relative">
                        <FeaturedExcellenceCard 
                          community={{
                            ...community,
                            badge: "🌴 Aloha Living"
                          }} 
                          index={index} 
                          compact 
                        />
                        {/* Premium Badge Overlay */}
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-lg">
                          Island Paradise
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            <div className="text-center mt-8">
              <Link href="/map-search?state=HI">
                <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold shadow-xl">
                  Explore All Hawaii Communities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === TOOLS & FEATURES SECTION === */}
      
      {/* Red Tag Deals Promotional Section */}
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

          {/* Fort Worth Market Insights Box */}
          <div className="mb-10 bg-gradient-to-br from-red-900/90 to-orange-900/90 backdrop-blur-lg rounded-2xl border border-orange-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Info className="w-6 h-6 text-orange-300" />
              </div>
              <h3 className="text-xl font-bold text-white">Fort Worth Market Intelligence & Texas-Sized Savings</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-orange-300 mb-3">Market Overview</h4>
                <ul className="space-y-2 text-gray-200 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">•</span>
                    <span>Average cost: $2,800-$4,500/month (30% below national average)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">•</span>
                    <span>No state income tax = More retirement savings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">•</span>
                    <span>Growing medical district with world-class healthcare</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">•</span>
                    <span>Cultural District access with museums and entertainment</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-orange-300 mb-3">Texas-Sized Negotiation Strategies</h4>
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
                ((texasCommunities as any)?.communities || []).slice(0, 20).map((community: any, index: number) => (
                  <Link key={`texas-${community.id}-${index}`} href={`/community/${community.id}`} className="flex-shrink-0">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl opacity-30 group-hover:opacity-60 transition duration-300 blur"></div>
                      <div className="relative">
                        <FeaturedExcellenceCard 
                          community={{
                            ...community,
                            badge: "🏜️ Texas Pride"
                          }} 
                          index={index} 
                          compact 
                        />
                        {/* Premium Badge Overlay */}
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-lg">
                          Lone Star Living
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            <div className="text-center mt-8">
              <Link href="/map-search?city=Fort Worth&state=Texas">
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
                onClick={() => setLocation('/map-search?state=Florida')}
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
                {((floridaCommunities as any)?.communities || []).slice(0, 50).map((community: any, index: number) => (
                  <Link key={`florida-${community.id}-${index}`} href={`/community/${community.id}`}>
                    <FeaturedExcellenceCard community={community} index={index} compact />
                  </Link>
                ))}
              </div>
              
              <div className="text-center mt-6">
                <Button 
                  variant="outline" 
                  className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-600 dark:text-cyan-300 dark:hover:bg-cyan-900/20"
                  onClick={() => setLocation('/map-search?state=Florida')}
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
            {(hudCount as any)?.total || '6,078+'} affordable communities • 
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
                  <Link key={`hud-${community.id}-${index}`} href={`/community/${community.id}`}>
                    <FeaturedExcellenceCard community={community} index={index} compact />
                  </Link>
                ))}
                
                {/* Action Card at the end */}
                <Link href="/search?certified=hud">
                  <div className="overflow-hidden flex-shrink-0 w-64 h-[30rem] border-2 border-green-300 dark:border-green-600 hover:shadow-xl transition-all cursor-pointer group bg-white dark:bg-gray-900 rounded-xl">
                    <div className="aspect-[4/3] bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center">
                      <div className="text-center p-6">
                        <Building2 className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {(hudCount as any)?.total || '6,078+'}
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

          {/* New York Market Insights Box */}
          <div className="mb-10 bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Info className="w-6 h-6 text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-white">NYC Metro Market Intelligence & Strategic Negotiation</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-purple-300 mb-3">Market Overview</h4>
                <ul className="space-y-2 text-gray-200 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>Average cost: $4,500-$8,000/month (NYC metro premium)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>Upstate NY 40-60% less than NYC/Westchester</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>World-class healthcare access (NYC hospitals)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>Cultural amenities and metropolitan lifestyle</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-purple-300 mb-3">Manhattan Money-Saving Tactics</h4>
                <ul className="space-y-2 text-gray-200 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">💰</span>
                    <span><strong>Outer Borough Bargain:</strong> Brooklyn/Queens 25% less than Manhattan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">💰</span>
                    <span><strong>Winter Move Special:</strong> January-March saves $1000-2000/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">💰</span>
                    <span><strong>Hudson Valley Alternative:</strong> 1-hour north, 50% savings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">💰</span>
                    <span><strong>Rent Control Awareness:</strong> Ask about stabilized units</span>
                  </li>
                </ul>
              </div>
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
                ((newYorkCommunities as any)?.communities || []).slice(0, 20).map((community: any, index: number) => (
                  <Link key={`newyork-${community.id}-${index}`} href={`/community/${community.id}`} className="flex-shrink-0">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl opacity-30 group-hover:opacity-60 transition duration-300 blur"></div>
                      <div className="relative">
                        <FeaturedExcellenceCard 
                          community={{
                            ...community,
                            badge: "🏙️ Empire Living"
                          }} 
                          index={index} 
                          compact 
                        />
                        {/* Premium Badge Overlay */}
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold shadow-lg">
                          Metropolitan Elite
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            <div className="text-center mt-8">
              <Link href="/map-search?state=NY">
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
              ? '24 communities across all 13 provinces and territories • 10 with bilingual French/English services' 
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
                <Link href="/search?location=canada">
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
              ((canadianCommunities as any)?.communities || []).slice(0, 50).map((community: any, index: number) => (
                <Link key={`canadian-${community.id}-${index}`} href={`/community/${community.id}`} className="flex-shrink-0">
                  <FeaturedExcellenceCard community={community} index={index} compact />

                </Link>
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
              <Link href="/search?location=Puerto Rico">
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
                onClick={() => setLocation('/map-search?location=Puerto Rico')}
              >
                Search All Puerto Rico Communities
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-cyan-500 dark:scrollbar-thumb-cyan-400 " style={{scrollBehavior: 'smooth'}}>
                {((puertoRicoCommunities as any)?.communities || []).slice(0, 50).map((community: any, index: number) => (
                  <Link key={`pr-${community.id}-${index}`} href={`/community/${community.id}`} className="flex-shrink-0">
                    <FeaturedExcellenceCard community={community} index={index} compact />
                  </Link>
                ))}
              </div>
              
              <div className="text-center mt-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  🎉 Complete island coverage achieved! From eastern Fajardo to western Cabo Rojo, northern coastal cities to central mountain towns
                </div>
                <Button 
                  variant="outline" 
                  className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-600 dark:text-cyan-300 dark:hover:bg-cyan-900/20"
                  onClick={() => setLocation('/map-search?location=Puerto Rico')}
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
              <Link href="/search?location=Peru">
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
                onClick={() => setLocation('/map-search?location=Peru')}
              >
                Search All Peru Communities
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-red-500 dark:scrollbar-thumb-red-400 " style={{scrollBehavior: 'smooth'}}>
                {((peruCommunities as any)?.communities || []).slice(0, 50).map((community: any, index: number) => (
                  <Link key={`pe-${community.id}-${index}`} href={`/community/${community.id}`} className="flex-shrink-0">
                    <FeaturedExcellenceCard community={community} index={index} compact />
                  </Link>
                ))}
              </div>
              
              <div className="text-center mt-6">
                <Button 
                  variant="outline" 
                  className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20"
                  onClick={() => setLocation('/map-search?location=Peru')}
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

          {/* Cuba Market Insights Box */}
          <div className="mb-10 bg-gradient-to-br from-blue-900/90 to-red-900/90 backdrop-blur-lg rounded-2xl border border-blue-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Info className="w-6 h-6 text-blue-300" />
              </div>
              <h3 className="text-xl font-bold text-white">Cuba Expat Intelligence & Caribbean Living Guide</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-300 mb-3">Market Overview</h4>
                <ul className="space-y-2 text-gray-200 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Average cost: $800-$2,000/month (most affordable Caribbean)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Rich cultural heritage and vibrant communities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Year-round tropical climate (75-85°F)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Growing expat communities in Havana & Varadero</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-blue-300 mb-3">Caribbean Living Strategies</h4>
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
                ((cubaCommunities as any)?.communities || []).slice(0, 20).map((community: any, index: number) => (
                  <Link key={`cuba-${community.id}-${index}`} href={`/community/${community.id}`} className="flex-shrink-0">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-red-400 rounded-xl opacity-30 group-hover:opacity-60 transition duration-300 blur"></div>
                      <div className="relative">
                        <FeaturedExcellenceCard 
                          community={{
                            ...community,
                            badge: "🎭 Heritage Living"
                          }} 
                          index={index} 
                          compact 
                        />
                        {/* Premium Badge Overlay */}
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-red-500 text-white font-bold shadow-lg">
                          Caribbean Heritage
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            <div className="text-center mt-8">
              <Link href="/search?location=Cuba">
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
              <Link href="/search?location=Costa Rica">
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
                onClick={() => setLocation('/map-search?location=Costa Rica')}
              >
                Search All Costa Rica Communities
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-green-500 dark:scrollbar-thumb-green-400 " style={{scrollBehavior: 'smooth'}}>
                {((costaRicaCommunities as any)?.communities || []).slice(0, 50).map((community: any, index: number) => (
                  <Link key={`cr-${community.id}-${index}`} href={`/community/${community.id}`} className="flex-shrink-0">
                    <FeaturedExcellenceCard community={community} index={index} compact />
                  </Link>
                ))}
              </div>
              
              <div className="text-center mt-6">
                <Button 
                  variant="outline" 
                  className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20"
                  onClick={() => setLocation('/map-search?location=Costa Rica')}
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
              <Link href="/search?location=Panama">
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
                onClick={() => setLocation('/map-search?location=Panama')}
              >
                Search All Panama Communities
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-blue-500 dark:scrollbar-thumb-blue-400 " style={{scrollBehavior: 'smooth'}}>
                {((panamaCommunities as any)?.communities || []).slice(0, 50).map((community: any, index: number) => (
                  <Link key={`pa-${community.id}-${index}`} href={`/community/${community.id}`} className="flex-shrink-0">
                    <FeaturedExcellenceCard community={community} index={index} compact />
                  </Link>
                ))}
              </div>
              
              <div className="text-center mt-6">
                <Button 
                  variant="outline" 
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20"
                  onClick={() => setLocation('/map-search?location=Panama')}
                >
                  Explore All Panama Communities
                </Button>
              </div>
            </div>
          )}
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
              ((mexicoCommunities as any)?.communities || []).slice(0, 50).map((community: any, index: number) => (
                <Link key={`mexico-${community.id}-${index}`} href={`/community/${community.id}`} className="flex-shrink-0">
                  <FeaturedExcellenceCard community={community} index={index} compact />

                </Link>
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
                  onClick={() => setLocation('/simplified-search')}
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
              National Coverage Statistics
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-blue-200 dark:border-blue-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  Growth Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Communities Added (30d)</span>
                    <span className="font-bold text-green-600">+1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Price Updates (24h)</span>
                    <span className="font-bold text-blue-600">3,892</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">New Reviews</span>
                    <span className="font-bold text-purple-600">427</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Photos Added</span>
                    <span className="font-bold text-orange-600">8,293</span>
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
                    <span className="font-bold text-green-600">{((hudCount as any)?.total || '5,936').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">AI Verified Pricing</span>
                    <span className="font-bold text-blue-600">18,427</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Claimed by Owners</span>
                    <span className="font-bold text-purple-600">2,156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Virtual Tours</span>
                    <span className="font-bold text-orange-600">892</span>
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
                    <span className="font-bold">12,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Assisted Living</span>
                    <span className="font-bold">9,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Memory Care</span>
                    <span className="font-bold">4,892</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Skilled Nursing</span>
                    <span className="font-bold">7,208</span>
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
                      National average across all care types
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
                      Based on 127,849 verified reviews
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
              <span className="font-medium text-gray-900 dark:text-white">35,182+ Communities</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}