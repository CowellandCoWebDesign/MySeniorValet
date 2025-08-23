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
  ArrowRight, Languages
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { EnhancedCommunityCard } from "@/components/EnhancedCommunityCard";
import { RedTagDeals } from "@/components/RedTagDeals";
import { MarketIntelligence } from "@/components/MarketIntelligence";
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
  const [selectedCareType, setSelectedCareType] = useState(4); // Start with Independent Living selected
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
  
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  
  // Touch and mouse event handlers for dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setIsDragging(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStartX - currentX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0 && selectedCareType < careTypes.length - 1) {
        setSelectedCareType(prev => prev + 1);
      } else if (diff < 0 && selectedCareType > 0) {
        setSelectedCareType(prev => prev - 1);
      }
      setTouchStartX(currentX);
    }
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  
  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStartX(e.clientX);
    setIsDragging(true);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const diff = touchStartX - currentX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0 && selectedCareType < careTypes.length - 1) {
        setSelectedCareType(prev => prev + 1);
      } else if (diff < 0 && selectedCareType > 0) {
        setSelectedCareType(prev => prev - 1);
      }
      setTouchStartX(currentX);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  
  const handleCareTypeClick = (index: number) => {
    if (!isDragging) {
      setSelectedCareType(index);
    }
  };
  
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
  
  // Fetch Hawaii communities - with explicit queryFn
  const { data: hawaiiCommunities, isLoading: hawaiiLoading } = useQuery({
    queryKey: ['hawaiiCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-state?state=HI');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  });
  
  // Fetch Florida communities - with explicit queryFn
  const { data: floridaCommunities, isLoading: floridaLoading } = useQuery({
    queryKey: ['floridaCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-state?state=FL');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  });
  
  // Fetch Texas communities (Fort Worth) - with explicit queryFn
  const { data: texasCommunities, isLoading: texasLoading } = useQuery({
    queryKey: ['texasCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-city?city=Fort%20Worth&state=TX');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  });
  
  // Fetch New York communities - with explicit queryFn
  const { data: newYorkCommunities, isLoading: newYorkLoading } = useQuery({
    queryKey: ['newYorkCommunities'],
    queryFn: async () => {
      const response = await fetch('/api/communities/by-state?state=NY');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
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
              Access our complete database of {((communityCount as any)?.count || '35,232').toLocaleString()}+ senior living communities across the United States, Canada, Mexico & Puerto Rico
            </p>
            
            {/* Key Stats */}
            <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-white">34,181+</div>
                  <div className="text-xs text-blue-100">Total Communities</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-300">{((hudCount as any)?.total || '5,936').toLocaleString()}</div>
                  <div className="text-xs text-blue-100">HUD Properties</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-white">4</div>
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
      <section className="px-4 py-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🚀 Wave 1: Natural Language Search
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Ask naturally! Try: "Memory care under $3,000 in Dallas with good reviews"
            </p>
          </div>
          
          {/* Natural Language Search Bar - Wave 1 Enhancement */}
          <div className="mb-6">
            <NaturalLanguageSearchBar className="mb-4" />
          </div>
          
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>or use</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
          
          <div className="mb-4 text-center">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Traditional Search
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              35,000+ Communities • Live Pricing • Real Reviews • Instant Results
            </p>
          </div>
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-2">
            <div className="flex items-center">
              <div className="flex-1">
                <AutocompleteSearch
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onSubmit={(value) => {
                    if (value) {
                      setLocation(`/map-search?q=${encodeURIComponent(value)}`);
                    }
                  }}
                  placeholder="Search communities by name, city, state, zip code, or care type..."
                  inputClassName="w-full pl-10 pr-3 py-4 text-lg border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  hideSearchButton={true}
                />
              </div>
              <div className="flex items-center gap-2 mr-2">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 text-xs px-3 py-1 font-semibold">
                  AI-Powered
                </Badge>
                <Button
                  type="submit"
                  onClick={() => {
                    if (searchTerm) {
                      setLocation(`/map-search?q=${encodeURIComponent(searchTerm)}`);
                    }
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-lg transition-all flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
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
      </section>

      {/* Browse by State */}
      <section className="px-4 py-12 bg-gradient-to-br from-blue-900 to-indigo-900 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-md border-2 border-white/20 dark:border-gray-700/50">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl text-white">
                <Globe className="h-7 w-7 text-blue-300" />
                Browse by State
              </CardTitle>
              <CardDescription className="text-gray-200">
                Select a state to explore communities in that region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {(topStates as any[]).slice(0, 15).map((state: any) => {
                  const displayName = stateNames[state.state] || state.state;
                  return (
                    <Link key={state.state} href={`/map-search?state=${state.state}`}>
                      <Card className="hover:shadow-lg transition-all cursor-pointer bg-white/90 dark:bg-gray-800/90 border hover:border-blue-400 group hover:scale-105">
                        <CardContent className="p-3 text-center">
                          <div className="font-bold text-sm md:text-base text-gray-900 dark:text-gray-100 group-hover:text-blue-600">
                            {displayName}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {parseInt(state.count).toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
                <Link href="/map-search">
                  <Card className="hover:shadow-lg transition-all cursor-pointer border hover:border-blue-400 group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 hover:scale-105">
                    <CardContent className="p-3 text-center flex flex-col justify-center h-full">
                      <div className="font-bold text-sm text-blue-600">
                        View All
                      </div>
                      <ChevronRight className="h-4 w-4 mx-auto mt-1 text-blue-600" />
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* MOVED COMMUNITY SLIDER SECTIONS - NOW POSITIONED RIGHT AFTER DATABASE FEATURES */}
      
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
            <Link href="/map-search?state=HI">
              <Button variant="outline" className="flex items-center gap-2">
                View All Hawaii
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-cyan-500 dark:scrollbar-thumb-cyan-400 hover:scrollbar-thumb-cyan-600 snap-x snap-mandatory" style={{scrollBehavior: 'smooth'}}>
            {(hawaiiLoading || !hawaiiCommunities || !(hawaiiCommunities as any)?.communities?.length) ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden flex-shrink-0 w-72 h-[420px] border border-gray-200 animate-pulse">
                  <div className="h-48 bg-gradient-to-br from-blue-200 to-teal-200 dark:bg-gray-700"></div>
                  <CardContent className="p-4">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              ((hawaiiCommunities as any)?.communities || []).slice(0, 8).map((community: any, index: number) => (
                <Link key={`hawaii-${community.id}-${index}`} href={`/community/${community.id}`} className="flex-shrink-0">
                  <Card className="w-72 hover:shadow-2xl transition-all overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl h-[420px]">
                    <div className="relative">
                      {/* Image Section with Hawaii Theme */}
                      <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center relative">
                        {community.photos && community.photos.length > 0 ? (
                          <img 
                            src={community.photos[0]} 
                            alt={community.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <div className="text-4xl mb-2">🌺</div>
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Photos Coming Soon</div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                      </div>
                      
                      {/* Badges Overlay */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                        <Badge className="bg-green-600 text-white text-xs px-2 py-1 font-semibold">
                          🌺 Hawaii
                        </Badge>
                        
                        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {community.rentPerMonth ? `$${Number(community.rentPerMonth).toLocaleString()}` : 
                             community.priceRange?.min ? `$${Number(community.priceRange.min).toLocaleString()}+` : 'Contact'}
                          </div>
                          {community.hudPropertyId && (
                            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                              HUD Verified
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Island Life Badge */}
                      <Badge className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium">
                        🌊 Island Life
                      </Badge>
                    </div>
                    
                    {/* Card Body */}
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">
                          {community.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                          <span>{community.city}, HI</span>
                        </div>
                      </div>
                      
                      {/* Care Types */}
                      <div className="flex flex-wrap gap-1">
                        {community.careTypes?.slice(0, 2).map((careType: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5">
                            {careType}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-3 py-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {community.rating ? parseFloat(community.rating).toFixed(1) : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {community.totalUnits || community.totalUnitsHud || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Units</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
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
        
          <div className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-green-500 dark:scrollbar-thumb-green-400 hover:scrollbar-thumb-green-600 snap-x snap-mandatory" style={{scrollBehavior: 'smooth', height: '32rem'}}>
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
                {/* Display first 10 HUD properties in slider */}
                {((hudProperties as any[]) || []).slice(0, 10).map((community: any, index: number) => (
                  <EnhancedCommunityCard
                    key={`hud-${community.id}-${index}`}
                    community={community}
                    index={index}
                    variant='featured'
                  />
                ))}
                
                {/* Action Card at the end */}
                <Link href="/search?certified=hud">
                  <Card className="overflow-hidden flex-shrink-0 w-64 h-[30rem] border-2 border-green-300 dark:border-green-600 hover:shadow-xl transition-all cursor-pointer group">
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
                    <CardContent className="p-4">
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
                    </CardContent>
                  </Card>
                </Link>
              </>
            )}
          </div>
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
                onClick={() => setLocation('/search?state=Florida')}
              >
                Search All Florida Communities
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-cyan-500 dark:scrollbar-thumb-cyan-400 hover:scrollbar-thumb-cyan-600 snap-x snap-mandatory" style={{height: '32rem', scrollBehavior: 'smooth'}}>
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

      {/* Fort Worth, Texas Communities - TEXAS SIZED LIVING */}
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
                <p>No Fort Worth communities available at this time.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setLocation('/search?city=Fort Worth&state=Texas')}
                >
                  Search Fort Worth Communities
                </Button>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-orange-500 dark:scrollbar-thumb-orange-400 hover:scrollbar-thumb-orange-600 snap-x snap-mandatory" style={{scrollBehavior: 'smooth'}}>
                {((texasCommunities as any)?.communities || []).slice(0, 8).map((community: any, index: number) => (
                  <Link key={`texas-${community.id}-${index}`} href={`/community/${community.id}`} className="flex-shrink-0">
                    <Card className="w-72 hover:shadow-2xl transition-all overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl h-[420px]">
                      <div className="relative">
                        {/* Image Section with Texas Theme */}
                        <div className="h-48 bg-gradient-to-br from-amber-100 to-red-100 dark:from-amber-900 dark:to-red-900 flex items-center justify-center relative">
                          {community.photos && community.photos.length > 0 ? (
                            <img 
                              src={community.photos[0]} 
                              alt={community.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center">
                              <div className="text-4xl mb-2">⭐</div>
                              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Photos Coming Soon</div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                        </div>
                        
                        {/* Badges Overlay */}
                        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                          <Badge className="bg-amber-600 text-white text-xs px-2 py-1 font-semibold">
                            ⭐ Texas
                          </Badge>
                          
                          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {community.rentPerMonth ? `$${Number(community.rentPerMonth).toLocaleString()}` : 
                               community.priceRange?.min ? `$${Number(community.priceRange.min).toLocaleString()}+` : 'Contact'}
                            </div>
                            {community.hudPropertyId && (
                              <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                HUD Verified
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Card Body */}
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">
                            {community.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                            <span>{community.city}, TX</span>
                          </div>
                        </div>
                        
                        {/* Care Types */}
                        <div className="flex flex-wrap gap-1">
                          {community.careTypes?.slice(0, 2).map((careType: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5">
                              {careType}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-3 py-2 border-t border-gray-100 dark:border-gray-800">
                          <div className="text-center">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {community.rating ? parseFloat(community.rating).toFixed(1) : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Rating</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {community.totalUnits || community.totalUnitsHud || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Units</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* New York Communities - EMPIRE STATE EXCELLENCE */}
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
        
          <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-purple-500 dark:scrollbar-thumb-purple-400 hover:scrollbar-thumb-purple-600 snap-x snap-mandatory" style={{scrollBehavior: 'smooth'}}>
            {/* Show New York communities */}
            {newYorkLoading ? (
              // Loading skeleton cards
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden flex-shrink-0 w-72 h-[420px] border border-gray-200 animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
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
              ((newYorkCommunities as any)?.communities || []).slice(0, 8).map((community: any, index: number) => (
                <Link key={`newyork-${community.id}-${index}`} href={`/community/${community.id}`} className="flex-shrink-0">
                  <Card className="w-72 hover:shadow-2xl transition-all overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl h-[420px]">
                    <div className="relative">
                      {/* Image Section with New York Theme */}
                      <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center relative">
                        {community.photos && community.photos.length > 0 ? (
                          <img 
                            src={community.photos[0]} 
                            alt={community.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <div className="text-4xl mb-2">🗽</div>
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Photos Coming Soon</div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                      </div>
                      
                      {/* Badges Overlay */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                        <Badge className="bg-purple-600 text-white text-xs px-2 py-1 font-semibold">
                          🗽 New York
                        </Badge>
                        
                        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {community.rentPerMonth ? `$${Number(community.rentPerMonth).toLocaleString()}` : 
                             community.priceRange?.min ? `$${Number(community.priceRange.min).toLocaleString()}+` : 'Contact'}
                          </div>
                          {community.hudPropertyId && (
                            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                              HUD Verified
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Body */}
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">
                          {community.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                          <span>{community.city}, NY</span>
                        </div>
                      </div>
                      
                      {/* Care Types */}
                      <div className="flex flex-wrap gap-1">
                        {community.careTypes?.slice(0, 2).map((careType: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5">
                            {careType}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-3 py-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {community.rating ? parseFloat(community.rating).toFixed(1) : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {community.totalUnits || community.totalUnitsHud || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Units</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
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
        
          <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-red-500 dark:scrollbar-thumb-red-400 hover:scrollbar-thumb-red-600 snap-x snap-mandatory" style={{scrollBehavior: 'smooth'}}>
            {/* Show Canadian communities */}
            {canadianLoading ? (
              // Loading skeleton cards
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden flex-shrink-0 w-72 h-[420px] border border-gray-200 animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-3">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : ((canadianCommunities as any)?.communities || []).length === 0 ? (
              <>
                {/* Show promotional card when no communities available */}
                <Link href="/search?location=canada">
                  <Card className="overflow-hidden flex-shrink-0 w-64 h-[30rem] border-2 border-red-300 dark:border-red-600 hover:shadow-xl transition-all cursor-pointer group">
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
                    <CardContent className="p-4">
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
                    </CardContent>
                  </Card>
                </Link>
              </>
            ) : (
              ((canadianCommunities as any)?.communities || []).slice(0, 8).map((community: any, index: number) => (
                <Link key={`canadian-${community.id}-${index}`} href={`/community/${community.id}`} className="flex-shrink-0">
                  <Card className="w-72 hover:shadow-2xl transition-all overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl h-[420px]">
                    <div className="relative">
                      {/* Image Section with Canadian Theme */}
                      <div className="h-48 bg-gradient-to-br from-red-100 to-white dark:from-red-900 dark:to-gray-800 flex items-center justify-center relative">
                        {community.photos && community.photos.length > 0 ? (
                          <img 
                            src={community.photos[0]} 
                            alt={community.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <div className="text-4xl mb-2">🍁</div>
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Photos Coming Soon</div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                      </div>
                      
                      {/* Badges Overlay */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                        <Badge className="bg-red-600 text-white text-xs px-2 py-1 font-semibold">
                          🍁 {community.state || 'Canada'}
                        </Badge>
                        
                        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {community.rentPerMonth ? `$${Number(community.rentPerMonth).toLocaleString()}` : 
                             community.priceRange?.min ? `$${Number(community.priceRange.min).toLocaleString()}+` : 'Contact'}
                          </div>
                          {community.hudPropertyId && (
                            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                              HUD Verified
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Bilingual Badge if applicable */}
                      {['QC', 'NB', 'ON'].includes(community.state) && (
                        <Badge className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium flex items-center gap-1">
                          <Languages className="w-3 h-3" />
                          {language === 'en' ? 'Bilingual' : 'Bilingue'}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Card Body */}
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">
                          {community.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                          <span>{community.city}, {community.state}</span>
                        </div>
                      </div>
                      
                      {/* Care Types */}
                      <div className="flex flex-wrap gap-1">
                        {community.careTypes?.slice(0, 2).map((careType: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5">
                            {careType}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-3 py-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {community.rating ? parseFloat(community.rating).toFixed(1) : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {community.totalUnits || community.totalUnitsHud || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Units</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
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
                onClick={() => setLocation('/search?location=Puerto Rico')}
              >
                Search All Puerto Rico Communities
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-cyan-500 dark:scrollbar-thumb-cyan-400 hover:scrollbar-thumb-cyan-600 snap-x snap-mandatory" style={{scrollBehavior: 'smooth'}}>
                {((puertoRicoCommunities as any)?.communities || []).slice(0, 8).map((community: any, index: number) => (
                  <Link key={`pr-${community.id}-${index}`} href={`/community/${community.id}`} className="flex-shrink-0">
                    <Card className="w-72 hover:shadow-2xl transition-all overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl h-[420px]">
                      <div className="relative">
                        {/* Image Section with Puerto Rico Theme */}
                        <div className="h-48 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 flex items-center justify-center relative">
                          {community.photos && community.photos.length > 0 ? (
                            <img 
                              src={community.photos[0]} 
                              alt={community.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center">
                              <div className="text-4xl mb-2">🌴</div>
                              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Photos Coming Soon</div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                        </div>
                        
                        {/* Badges Overlay */}
                        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                          <Badge className="bg-cyan-600 text-white text-xs px-2 py-1 font-semibold">
                            🌴 Puerto Rico
                          </Badge>
                          
                          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {community.rentPerMonth ? `$${Number(community.rentPerMonth).toLocaleString()}` : 
                               community.priceRange?.min ? `$${Number(community.priceRange.min).toLocaleString()}+` : 'Contact'}
                            </div>
                            {community.hudPropertyId && (
                              <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                HUD Verified
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Caribbean Paradise Badge */}
                        <Badge className="absolute bottom-3 right-3 bg-teal-600 text-white text-xs px-2 py-1 font-medium">
                          🏝️ Caribbean Living
                        </Badge>
                      </div>
                      
                      {/* Card Body */}
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">
                            {community.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                            <span>{community.city}, PR</span>
                          </div>
                        </div>
                        
                        {/* Care Types */}
                        <div className="flex flex-wrap gap-1">
                          {community.careTypes?.slice(0, 2).map((careType: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5">
                              {careType}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-3 py-2 border-t border-gray-100 dark:border-gray-800">
                          <div className="text-center">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {community.rating ? parseFloat(community.rating).toFixed(1) : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Rating</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {community.totalUnits || community.totalUnitsHud || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Units</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
                  onClick={() => setLocation('/search?location=Puerto Rico')}
                >
                  Explore All 50+ Puerto Rico Communities
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
        
          <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-green-500 dark:scrollbar-thumb-green-400 hover:scrollbar-thumb-green-600 snap-x snap-mandatory" style={{scrollBehavior: 'smooth'}}>
            {/* Show Mexican communities */}
            {mexicoLoading ? (
              // Loading skeleton cards
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden flex-shrink-0 w-72 h-[420px] border border-gray-200 animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-3">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              ((mexicoCommunities as any)?.communities || []).slice(0, 8).map((community: any, index: number) => (
                <Link key={`mexico-${community.id}-${index}`} href={`/community/${community.id}`} className="flex-shrink-0">
                  <Card className="w-72 hover:shadow-2xl transition-all overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl h-[420px]">
                    <div className="relative">
                      {/* Image Section with Mexico Theme */}
                      <div className="h-48 bg-gradient-to-br from-green-100 to-red-100 dark:from-green-900 dark:to-red-900 flex items-center justify-center relative">
                        {community.photos && community.photos.length > 0 ? (
                          <img 
                            src={community.photos[0]} 
                            alt={community.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <div className="text-4xl mb-2">🌵</div>
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Photos Coming Soon</div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                      </div>
                      
                      {/* Badges Overlay */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                        <Badge className="bg-green-600 text-white text-xs px-2 py-1 font-semibold">
                          🌵 {community.state || 'Mexico'}
                        </Badge>
                        
                        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {community.rentPerMonth ? `$${Number(community.rentPerMonth).toLocaleString()}` : 
                             community.priceRange?.min ? `$${Number(community.priceRange.min).toLocaleString()}+` : 'Contact'}
                          </div>
                          {community.hudPropertyId && (
                            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                              HUD Verified
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Expat Paradise Badge */}
                      <Badge className="absolute bottom-3 right-3 bg-red-600 text-white text-xs px-2 py-1 font-medium">
                        ✨ Expat Paradise
                      </Badge>
                    </div>
                    
                    {/* Card Body */}
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">
                          {community.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                          <span>{community.city}, {community.state || 'MX'}</span>
                        </div>
                      </div>
                      
                      {/* Care Types */}
                      <div className="flex flex-wrap gap-1">
                        {community.careTypes?.slice(0, 2).map((careType: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5">
                            {careType}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-3 py-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {community.rating ? parseFloat(community.rating).toFixed(1) : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {community.totalUnits || community.totalUnitsHud || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Units</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 3D Care Spectrum Carousel - Full Size */}
      <section className="relative py-16 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
        {/* Background overlay for depth */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Section Header */}
        <div className="relative z-10 text-center mb-8 px-4">
          <Badge className="bg-white/20 text-white px-4 py-1 mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            INTERACTIVE CARE SPECTRUM
          </Badge>
          <h2 className="text-4xl font-bold text-white mb-4">
            Explore All 10 Levels of Senior Care
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Swipe or click through our interactive care spectrum to understand each type of care, average costs, and key features
          </p>
        </div>
        
        {/* 3D Care Spectrum Carousel */}
        <div className="flex flex-col items-center justify-center px-1 relative z-10">
          <div 
            className="carousel-wrapper select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div className="carousel-3d">
              {careTypes.map((careType, index) => {
                const Icon = careType.icon;
                const offset = (selectedCareType - index) / 3;
                const absOffset = Math.abs(selectedCareType - index) / 3;
                const isActive = index === selectedCareType;
                
                return (
                  <div
                    key={careType.id}
                    className="card-container-3d"
                    style={{
                      '--offset': offset,
                      '--abs-offset': absOffset,
                      '--active': isActive ? 1 : 0,
                      pointerEvents: 'auto',
                      opacity: Math.abs(selectedCareType - index) >= 3 ? 0 : 1,
                      display: Math.abs(selectedCareType - index) > 3 ? 'none' : 'block',
                    } as React.CSSProperties}
                    onClick={() => !isDragging && handleCareTypeClick(index)}
                  >
                    <div className={`card-3d ${careType.color} rounded-xl flex flex-col items-center justify-between p-4 shadow-2xl border-2 border-white/30`}
                         style={{ 
                           opacity: isActive ? 1 : 0.7,
                           transform: isActive ? 'scale(1.05)' : 'scale(1)',
                           height: '100%'
                         }}>
                      <div className="flex flex-col items-center">
                        <Icon className="w-12 h-12 text-white drop-shadow-lg mb-2" />
                        <h3 className="text-white font-bold text-center text-lg mb-1 drop-shadow-lg">{careType.name}</h3>
                        
                        {/* Average Cost */}
                        <div className="bg-white/20 rounded-lg px-2 py-1 mb-2">
                          <p className="text-white text-xs font-bold drop-shadow-md">
                            {careType.avgCost}
                          </p>
                        </div>
                        
                        {/* Quick Details */}
                        <p className="text-white/90 text-xs text-center mb-2 drop-shadow-md">
                          {careType.details}
                        </p>
                      </div>
                      
                      {/* Key Features - Only show when active */}
                      <div style={{ 
                        opacity: isActive ? 1 : 0,
                        maxHeight: isActive ? '150px' : '0',
                        overflow: 'hidden',
                        transition: 'opacity 0.3s ease-out, max-height 0.3s ease-out'
                      }}>
                        <div className="space-y-1 mb-3">
                          {careType.keyFeatures.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 text-white/80 mt-0.5 flex-shrink-0" />
                              <p className="text-white/90 text-xs leading-tight">{feature}</p>
                            </div>
                          ))}
                        </div>
                        
                        {/* Learn More Button - Scrolls to detailed section below */}
                        <button 
                          className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Scroll to the specific care type in the detailed section below
                            const element = document.getElementById('care-spectrum');
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }}
                        >
                          <BookOpen className="w-3 h-3" />
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Navigation buttons */}
              {selectedCareType > 0 && (
                <button 
                  className="nav-3d left"
                  onClick={() => setSelectedCareType(i => i - 1)}
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              )}
              {selectedCareType < careTypes.length - 1 && (
                <button 
                  className="nav-3d right"
                  onClick={() => setSelectedCareType(i => i + 1)}
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Indicator dots */}
        <div className="flex justify-center gap-2 mt-6 relative z-10">
          {careTypes.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === selectedCareType ? 'bg-white w-8' : 'bg-white/40'
              }`}
              onClick={() => setSelectedCareType(index)}
            />
          ))}
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
                          onClick={() => setLocation(`/search?care_type=${type.id}`)}
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
                  onClick={() => setLocation('/search')}
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

      {/* Market Intelligence Section */}
      <section className="px-4 py-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <MarketIntelligence />
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