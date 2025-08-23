import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/NavigationHeader";
import { 
  Building2, Search, MapPin, Home, Users, DollarSign, Shield, 
  Star, Filter, Database, TrendingUp, BarChart3, Globe,
  ChevronRight, Clock, CheckCircle, Info, Heart,
  HeartHandshake, Brain, Activity, Stethoscope, UserCheck,
  Calendar, Hotel, Flower2, Sparkles, AlertCircle,
  Truck, Flag, Building, RefreshCw, BookOpen, ChevronLeft,
  ArrowRight
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { EnhancedCommunityCard } from "@/components/EnhancedCommunityCard";
import { RedTagDeals } from "@/components/RedTagDeals";
import { MarketIntelligence } from "@/components/MarketIntelligence";
import { MoveInCostCalculator } from "@/components/MoveInCostCalculator";
import { CostComparisonWorksheet } from "@/components/CostComparisonWorksheet";

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
  
  // Handle hash navigation for care spectrum section
  useEffect(() => {
    if (window.location.hash === '#care-spectrum') {
      setTimeout(() => {
        const element = document.getElementById('care-spectrum');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  // Refs for sections
  const hawaiiSectionRef = useRef<HTMLDivElement>(null);
  const floridaSectionRef = useRef<HTMLDivElement>(null);
  const texasSectionRef = useRef<HTMLDivElement>(null);
  const newYorkSectionRef = useRef<HTMLDivElement>(null);
  const canadianSectionRef = useRef<HTMLDivElement>(null);
  const californiaSectionRef = useRef<HTMLDivElement>(null);

  // Language state (default to English)
  const [language, setLanguage] = useState('en');

  // Fetch community stats
  const { data: communityCount } = useQuery({
    queryKey: ['/api/communities/count'],
  });

  const { data: hudCount } = useQuery({
    queryKey: ['/api/communities/hud-count'],
  });

  const { data: marketOverview } = useQuery({
    queryKey: ['/api/market/overview'],
  });

  // Fetch Hawaii communities
  const { data: hawaiiCommunities, isLoading: hawaiiLoading } = useQuery({
    queryKey: ['/api/communities/by-state?state=HI'],
  });

  // Fetch HUD properties
  const { data: hudProperties, isLoading: hudLoading } = useQuery({
    queryKey: ['/api/communities/hud-properties'],
  });

  // Fetch Florida communities  
  const { data: floridaCommunities, isLoading: floridaLoading } = useQuery({
    queryKey: ['/api/communities/by-state?state=FL'],
  });

  // Fetch Texas communities (specifically Fort Worth)
  const { data: texasCommunities, isLoading: texasLoading } = useQuery({
    queryKey: ['/api/communities/by-city?city=Fort Worth&state=TX'],
  });

  // Fetch New York communities
  const { data: newYorkCommunities, isLoading: newYorkLoading } = useQuery({
    queryKey: ['/api/communities/by-state?state=NY'],
  });

  // Fetch Canadian communities
  const { data: canadianCommunities, isLoading: canadianLoading } = useQuery({
    queryKey: ['/api/communities/canadian'],
  });

  // Fetch Mexican communities
  const { data: mexicoCommunities, isLoading: mexicoLoading } = useQuery({
    queryKey: ['/api/communities/mexican'],
  });

  const { data: trendingCommunities } = useQuery({
    queryKey: ['/api/communities/trending'],
  });

  const topStates = (marketOverview as any)?.marketTrends?.topStates || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Page Header */}
      <section className="px-4 py-12 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="bg-white/20 text-white px-4 py-1 mb-4">
              <Database className="h-4 w-4 mr-2" />
              COMPLETE DATABASE ACCESS
            </Badge>
            <h1 className="text-5xl font-bold text-white mb-4">
              Community Directory
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Access our complete database of {((communityCount as any)?.count || '34,181').toLocaleString()}+ senior living communities across the United States
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
                  <div className="text-3xl font-bold text-white">50</div>
                  <div className="text-xs text-blue-100">States Covered</div>
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

      {/* Search Section */}
      <section className="px-4 py-8 bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search communities by name, city, or zip code..."
                  className="pl-10 pr-4 py-6 text-lg border-2 border-gray-200 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 px-8"
              onClick={() => setLocation(`/search?q=${encodeURIComponent(searchTerm)}`)}
            >
              <Search className="mr-2 h-5 w-5" />
              Search Database
            </Button>
          </div>
          
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20">
              <Shield className="h-3 w-3 mr-1" />
              HUD Verified
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20">
              <DollarSign className="h-3 w-3 mr-1" />
              With Pricing
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20">
              <Star className="h-3 w-3 mr-1" />
              5-Star Rated
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20">
              <Home className="h-3 w-3 mr-1" />
              Memory Care
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-900/20">
              <Users className="h-3 w-3 mr-1" />
              Assisted Living
            </Badge>
          </div>
        </div>
      </section>

      {/* Browse by State and Database Features */}
      <section className="px-4 py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Browse by State */}
            <Card className="lg:col-span-2 border-2 border-blue-200 dark:border-blue-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6 text-blue-600" />
                  Browse by State
                </CardTitle>
                <CardDescription>
                  Select a state to explore communities in that region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {topStates.slice(0, 15).map((state: any) => (
                    <Link key={state.state} href={`/search?state=${state.state}`}>
                      <Card className="hover:shadow-lg transition-all cursor-pointer border hover:border-blue-400 group">
                        <CardContent className="p-3 text-center">
                          <div className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600">
                            {state.state}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {state.count.toLocaleString()} communities
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                  <Link href="/map-search">
                    <Card className="hover:shadow-lg transition-all cursor-pointer border hover:border-blue-400 group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                      <CardContent className="p-3 text-center flex flex-col justify-center h-full">
                        <div className="font-bold text-sm text-blue-600">
                          View All 50 States
                        </div>
                        <ChevronRight className="h-4 w-4 mx-auto mt-1 text-blue-600" />
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Database Features */}
            <Card className="border-2 border-purple-200 dark:border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-6 w-6 text-purple-600" />
                  Database Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">Real-Time Updates</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Live pricing and availability
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">HUD Verified Pricing</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      5,936+ government properties
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">Advanced Filtering</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Search by care type, price, location
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">Complete Details</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Photos, amenities, reviews
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  onClick={() => setLocation('/map-search')}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Start Searching
                </Button>
              </CardContent>
            </Card>
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
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                The Complete Care Spectrum Explained
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Navigate the 10 levels of senior care with confidence. Discover little-known facts and critical differences that could save you thousands.
              </p>
            </div>

            {/* Care Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Independent Living */}
              <Card className="hover:shadow-2xl transition-all duration-300 border-2 border-blue-200 dark:border-blue-700">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Home className="h-8 w-8" />
                      <CardTitle className="text-2xl">Independent Living</CardTitle>
                    </div>
                    <Badge className="bg-white/20 text-white">$2,000-$4,500/mo</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Active senior communities for those 60+ who can care for themselves. Maintenance-free lifestyle with luxury amenities and social activities.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Medicare Coverage:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">NOT covered by Medicare - considered non-medical housing. Some medical services in the facility may be covered.</p>
                        <p className="text-xs text-gray-500 mt-1">Source: Medicare.gov</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Government Insight:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">National average: $3,000/month. Communities often include pools, fitness centers, restaurants, and golf courses.</p>
                        <p className="text-xs text-gray-500 mt-1">Source: National Institute on Aging (NIA.NIH.gov)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Money-Saving Tips:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Ask about "trial stays" (1-3 months) before committing</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Negotiate "founder's rates" at new communities (20-30% savings)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Some states offer property tax exemptions for senior housing</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-sm"><strong>Typically Includes:</strong> Private apartment/home, maintenance, meals optional, activities, transportation</p>
                      <p className="text-sm mt-1"><strong>Best For:</strong> Active adults 60+ who want amenities without assistance</p>
                      <p className="text-sm mt-1"><strong>Payment Options:</strong> Private pay, long-term care insurance, reverse mortgage</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assisted Living */}
              <Card className="hover:shadow-2xl transition-all duration-300 border-2 border-green-200 dark:border-green-700">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HeartHandshake className="h-8 w-8" />
                      <CardTitle className="text-2xl">Assisted Living</CardTitle>
                    </div>
                    <Badge className="bg-white/20 text-white">$4,500-$7,000/mo</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Personal care assistance with 1-2 activities of daily living. 24/7 staff, meals, medication management in apartment-style settings.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Medicare Coverage:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Room and board NOT covered. Medical services (doctor visits, therapy) may be covered.</p>
                        <p className="text-xs text-gray-500 mt-1">Source: Medicare.gov</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">VA Aid & Attendance (2025 Rates):</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Single veteran: $2,300/month ($27,609/year)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Veteran with spouse: $2,727/month ($32,729/year)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• 75% of assisted living costs count as medical expenses</p>
                        <p className="text-xs text-gray-500 mt-1">Source: VA.gov | Apply: VA Form 21-527EZ</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Medicaid HCBS Waivers:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Many states offer waivers to cover assisted living for low-income seniors. Check your state's Medicaid office.</p>
                        <p className="text-xs text-gray-500 mt-1">Source: Medicaid.gov</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Money-Saving Tips:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Negotiate move-in fees (often $2,000-$5,000)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Ask about rate locks for 1-2 years</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Share a suite to save 20-30%</p>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="text-sm"><strong>National Average:</strong> $4,800/month (2024)</p>
                      <p className="text-sm mt-1"><strong>Services:</strong> Personal care, meals, housekeeping, medication management, transportation</p>
                      <p className="text-sm mt-1"><strong>Best For:</strong> Seniors needing help with bathing, dressing, medication</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Memory Care */}
              <Card className="hover:shadow-2xl transition-all duration-300 border-2 border-purple-200 dark:border-purple-700">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Brain className="h-8 w-8" />
                      <CardTitle className="text-2xl">Memory Care</CardTitle>
                    </div>
                    <Badge className="bg-white/20 text-white">$5,500-$9,000/mo</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Specialized secure facilities for Alzheimer's/dementia with trained staff. Higher staffing ratios and therapeutic programs.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Medicare Coverage:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Limited to medical services only. Room and board NOT covered.</p>
                        <p className="text-xs text-gray-500 mt-1">Source: Medicare.gov</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Brain className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">NIH Research Findings:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Music therapy reduces agitation by up to 50%</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Structured routines improve sleep patterns</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Pet therapy decreases anxiety and depression</p>
                        <p className="text-xs text-gray-500 mt-1">Source: National Institute on Aging (NIA.NIH.gov)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Medicaid Coverage Options:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Some states cover memory care through HCBS waivers for qualifying low-income seniors.</p>
                        <p className="text-xs text-gray-500 mt-1">Source: Medicaid.gov</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Critical Questions to Ask:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Staff-to-resident ratio (should be 1:6-1:8)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Dementia training hours for staff</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Secure outdoor spaces available?</p>
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <p className="text-sm"><strong>Features:</strong> Secured units, 24/7 supervision, specialized activities, behavior management</p>
                      <p className="text-sm mt-1"><strong>Best For:</strong> Mid to late-stage dementia requiring constant supervision</p>
                      <p className="text-sm mt-1"><strong>Payment:</strong> Private pay, long-term care insurance, VA benefits, some Medicaid waivers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skilled Nursing */}
              <Card className="hover:shadow-2xl transition-all duration-300 border-2 border-red-200 dark:border-red-700">
                <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Stethoscope className="h-8 w-8" />
                      <CardTitle className="text-2xl">Skilled Nursing</CardTitle>
                    </div>
                    <Badge className="bg-white/20 text-white">$8,200-$11,000/mo</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    24/7 medical supervision with registered nurses. Rehabilitation therapy, wound care, and complex medical management.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Medicare Coverage (Up to 100 Days):</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Days 1-20: 100% covered (after 3-day hospital stay)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Days 21-100: You pay $204/day (2025), Medicare covers rest</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Day 101+: 100% out-of-pocket unless Medicaid eligible</p>
                        <p className="text-xs text-gray-500 mt-1">Source: Medicare.gov</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">National Averages (2024):</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Semi-private room: $8,200/month</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Private room: $9,500/month</p>
                        <p className="text-xs text-gray-500 mt-1">Source: CMS.gov (Centers for Medicare & Medicaid Services)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">VA Community Living Centers:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Veterans may qualify for VA nursing homes with copays $0-$97/day based on service connection.</p>
                        <p className="text-xs text-gray-500 mt-1">Source: VA.gov</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Money-Saving Tips:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Medicare Advantage may offer extended coverage</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Apply for Medicaid before savings depleted</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Medigap policies cover Days 21-100 copays</p>
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <p className="text-sm"><strong>Services:</strong> IV therapy, wound care, PT/OT/Speech therapy, ventilator care</p>
                      <p className="text-sm mt-1"><strong>Best For:</strong> Post-hospital recovery, stroke rehab, complex medical conditions</p>
                      <p className="text-sm mt-1"><strong>Quality Check:</strong> Review ratings at Medicare.gov/care-compare</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Adult */}
              <Card className="hover:shadow-2xl transition-all duration-300 border-2 border-yellow-200 dark:border-yellow-700">
                <CardHeader className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="h-8 w-8" />
                      <CardTitle className="text-2xl">Active Adult (55+)</CardTitle>
                    </div>
                    <Badge className="bg-white/20 text-white">$1,200-$3,500/mo</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Age-restricted communities (55+ under Fair Housing Act) with resort amenities. No care services provided.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">HUD Fair Housing Act:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Communities must have 80% of units with at least one resident 55+ to qualify for age restriction.</p>
                        <p className="text-xs text-gray-500 mt-1">Source: HUD.gov Fair Housing Act</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Home className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Government Programs:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• USDA Rural Development offers loans for 55+ communities in rural areas</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Property tax exemptions available in many states</p>
                        <p className="text-xs text-gray-500 mt-1">Source: USDA.gov</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Money-Saving Tips:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Buy during developer closeouts (20-40% discounts)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• HOA fees often include $500+/mo golf memberships</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Consider manufactured home communities (50% less)</p>
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                      <p className="text-sm"><strong>Amenities:</strong> Pools, fitness centers, golf courses, social clubs, gated security</p>
                      <p className="text-sm mt-1"><strong>Best For:</strong> Active retirees 55+ wanting resort lifestyle without care</p>
                      <p className="text-sm mt-1"><strong>No Medicare/Medicaid coverage</strong> - Lifestyle choice, not medical</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* HUD Section 202 */}
              <Card className="hover:shadow-2xl transition-all duration-300 border-2 border-orange-200 dark:border-orange-700">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building className="h-8 w-8" />
                      <CardTitle className="text-2xl">HUD Section 202</CardTitle>
                    </div>
                    <Badge className="bg-white/20 text-white">30% of Income</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Government-subsidized senior housing for low-income individuals 62+. Rent based on adjusted income.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">HUD Rent Calculation:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Rent = 30% of adjusted monthly income</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• $400 elderly household deduction applied</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Medical expenses over 3% of income deducted</p>
                        <p className="text-xs text-gray-500 mt-1">Source: HUD.gov Section 202 Program</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Eligibility Requirements:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Age 62 or older (or disabled)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Income at or below 50% Area Median Income</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Example: $27,450/year for single person (varies by area)</p>
                        <p className="text-xs text-gray-500 mt-1">Source: HUD.gov Income Limits</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Additional Benefits:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Service Coordinators help access Medicare/Medicaid</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Utility allowances reduce rent further</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Often includes meals and transportation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Application Tips:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Apply to multiple properties (waiting lists are long)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Contact local HUD office for complete list</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">• Priority often given to homeless or at-risk seniors</p>
                      </div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                      <p className="text-sm"><strong>Average Wait:</strong> 9-24 months (varies by location)</p>
                      <p className="text-sm mt-1"><strong>Find Properties:</strong> HUD.gov Resource Locator or call 1-800-569-4287</p>
                      <p className="text-sm mt-1"><strong>Best For:</strong> Low-income seniors needing affordable, safe housing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Home Care */}
              <Card className="hover:shadow-2xl transition-all duration-300 border-2 border-teal-200 dark:border-teal-700">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-8 w-8" />
                      <CardTitle className="text-2xl">Home Care</CardTitle>
                    </div>
                    <Badge className="bg-white/20 text-white">$20-$30/hour</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Professional caregivers come to your home. Flexible scheduling from a few hours to 24/7 live-in care.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Little-Known Fact:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Long-term care insurance often covers home care at 100% vs 70% for facilities.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Cost-Saving Strategy:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Hire directly (vs agency) can save 30-40% but verify insurance and background checks.</p>
                      </div>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg">
                      <p className="text-sm"><strong>Includes:</strong> Personal care, companionship, meal prep, light housekeeping</p>
                      <p className="text-sm mt-1"><strong>Best For:</strong> Those preferring to age in place with support</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Adult Day Care */}
              <Card className="hover:shadow-2xl transition-all duration-300 border-2 border-indigo-200 dark:border-indigo-700">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-8 w-8" />
                      <CardTitle className="text-2xl">Adult Day Care</CardTitle>
                    </div>
                    <Badge className="bg-white/20 text-white">$75-$150/day</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Daytime care and activities while family works. Provides respite for caregivers and socialization for seniors.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Little-Known Fact:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Medicaid covers adult day care in 45 states as a home care alternative.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Tax Benefit:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Costs may qualify for dependent care tax credit up to $3,000/year.</p>
                      </div>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                      <p className="text-sm"><strong>Includes:</strong> Meals, activities, basic health monitoring, transportation</p>
                      <p className="text-sm mt-1"><strong>Best For:</strong> Working families caring for seniors at home</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Respite Care */}
              <Card className="hover:shadow-2xl transition-all duration-300 border-2 border-pink-200 dark:border-pink-700">
                <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Hotel className="h-8 w-8" />
                      <CardTitle className="text-2xl">Respite Care</CardTitle>
                    </div>
                    <Badge className="bg-white/20 text-white">$150-$500/day</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Short-term stays (days to weeks) in communities giving family caregivers a break or during transitions.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Little-Known Fact:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Medicare covers up to 5 days of respite during hospice care periods.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Smart Strategy:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Use respite stays to "test drive" communities before permanent moves.</p>
                      </div>
                    </div>
                    <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg">
                      <p className="text-sm"><strong>Includes:</strong> Full community services, meals, activities, care</p>
                      <p className="text-sm mt-1"><strong>Best For:</strong> Caregiver vacations, post-hospital transitions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hospice Care */}
              <Card className="hover:shadow-2xl transition-all duration-300 border-2 border-gray-300 dark:border-gray-600">
                <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Flower2 className="h-8 w-8" />
                      <CardTitle className="text-2xl">Hospice Care</CardTitle>
                    </div>
                    <Badge className="bg-white/20 text-white">Medicare Covered</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Comfort-focused care for terminal diagnoses. Available at home, facilities, or dedicated hospice centers.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Little-Known Fact:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Hospice can be provided for months/years if prognosis is 6 months or less.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Important Coverage:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Medicare covers 100% including equipment, medications, and 24/7 support.</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg">
                      <p className="text-sm"><strong>Includes:</strong> Pain management, emotional support, family counseling</p>
                      <p className="text-sm mt-1"><strong>Best For:</strong> End-of-life comfort and dignity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Continuing Care (CCRC) */}
              <Card className="hover:shadow-2xl transition-all duration-300 border-2 border-emerald-200 dark:border-emerald-700">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-8 w-8" />
                      <CardTitle className="text-2xl">Continuing Care (CCRC)</CardTitle>
                    </div>
                    <Badge className="bg-white/20 text-white">Entry: $100k-$500k+</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    All-inclusive campuses offering independent living through skilled nursing. Age in place as needs change.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Little-Known Fact:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Type A contracts lock in care costs for life - can save $200k+ over 10 years.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Financial Tip:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">90% refundable contracts cost more upfront but preserve estate value.</p>
                      </div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                      <p className="text-sm"><strong>Includes:</strong> All care levels, priority access, lifetime care guarantee</p>
                      <p className="text-sm mt-1"><strong>Best For:</strong> Planners wanting guaranteed lifetime care</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Key Insights Section */}
            <Card className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-300 dark:border-indigo-700">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                  Critical Decision Factors Most Families Miss
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-lg mb-2 text-indigo-700 dark:text-indigo-300">Financial Protections</h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-500">•</span>
                        <span>Ask for 3-year price history - increases over 5%/year are red flags</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-500">•</span>
                        <span>Negotiate move-in specials during Oct-Dec (slowest season)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-500">•</span>
                        <span>Request itemized fee schedules - care levels can add $2000+/month</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2 text-purple-700 dark:text-purple-300">Quality Indicators</h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Staff turnover under 50%/year is excellent (industry avg: 94%)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Visit during shift change (3pm/11pm) to see true staffing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Check state inspection reports - 3+ citations is concerning</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mt-6">
                  <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    💡 <strong>Pro Tip:</strong> The best time to tour is during lunch on a weekday - you'll see actual meal quality, resident engagement, and true staffing levels.
                  </p>
                </div>
              </CardContent>
            </Card>

          </motion.div>
        </div>
      </section>

      {/* Trending Communities and Tools */}
      <section className="px-4 py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">

          {/* Trending Communities */}
          <Card className="border-2 border-green-200 dark:border-green-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                Trending Communities
              </CardTitle>
              <CardDescription>
                Most viewed communities in the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(trendingCommunities as any[])?.slice(0, 6).map((community) => (
                  <Link key={community.id} href={`/community/${community.id}`}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm group-hover:text-blue-600 line-clamp-1">
                            {community.name}
                          </h4>
                          {community.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs font-semibold">{community.rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                          <MapPin className="h-3 w-3" />
                          {community.city}, {community.state}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {community.careTypes?.slice(0, 2).map((type: string) => (
                            <Badge key={type} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {type}
                            </Badge>
                          ))}
                        </div>
                        {community.pricing && (
                          <div className="mt-2 text-sm font-semibold text-green-600">
                            From ${community.pricing}/mo
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Tools */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => setLocation('/map')}>
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg mb-2">Interactive Map</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explore communities visually on our interactive map
                </p>
                <Button variant="ghost" className="mt-4">
                  Open Map View
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => setLocation('/costs')}>
              <CardContent className="p-6 text-center">
                <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg mb-2">Cost Calculator</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Estimate and compare senior living costs
                </p>
                <Button variant="ghost" className="mt-4">
                  Calculate Costs
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => setLocation('/ai-matching-assistant')}>
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg mb-2">AI Matching</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get personalized community recommendations
                </p>
                <Button variant="ghost" className="mt-4">
                  Get Matched
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Banner */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">About Our Database</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Our comprehensive database includes all licensed senior living communities across the United States, 
                    featuring real-time pricing, availability updates, and verified government data. We maintain strict 
                    data integrity standards to ensure you have access to the most accurate and up-to-date information.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
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
                </div>
              </div>
            </CardContent>
          </Card>
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
          
          <div className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-cyan-500 dark:scrollbar-thumb-cyan-400 hover:scrollbar-thumb-cyan-600 snap-x snap-mandatory" style={{height: '32rem', scrollBehavior: 'smooth'}}>
            {(hawaiiLoading || !hawaiiCommunities || !(hawaiiCommunities as any)?.communities?.length) ? (
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
              ((hawaiiCommunities as any)?.communities || []).slice(0, 8).map((community: any, index: number) => (
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
              <div className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-cyan-500 dark:scrollbar-thumb-cyan-400 hover:scrollbar-thumb-cyan-600 snap-x snap-mandatory" style={{height: '32rem', scrollBehavior: 'smooth'}}>
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
        
          <div className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-green-500 dark:scrollbar-thumb-green-400 hover:scrollbar-thumb-green-600 snap-x snap-mandatory" style={{scrollBehavior: 'smooth', height: '32rem'}}>
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
        
          <div className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-green-500 dark:scrollbar-thumb-green-400 hover:scrollbar-thumb-green-600 snap-x snap-mandatory" style={{scrollBehavior: 'smooth', height: '32rem'}}>
            {/* Show Canadian communities */}
            {canadianLoading ? (
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
            ) : ((canadianCommunities as any)?.communities || []).length === 0 ? (
              <>
                <div className="text-center text-gray-600 dark:text-gray-400 py-8 w-full">
                  <Flag className="w-16 h-16 mx-auto mb-4 opacity-50 text-red-600" />
                  <p className="mb-4">
                    {language === 'en' 
                      ? 'Canadian communities loading...' 
                      : 'Chargement des communautés canadiennes...'}
                  </p>
                </div>
                <Link href="/search?country=Canada">
                  <Card className="overflow-hidden flex-shrink-0 w-64 h-[30rem] border-2 border-red-300 dark:border-red-600 hover:shadow-xl transition-all cursor-pointer group">
                    <div className="aspect-[4/3] bg-gradient-to-br from-red-100 via-white to-red-100 dark:from-red-900 dark:via-gray-900 dark:to-red-900 flex items-center justify-center">
                      <div className="text-center p-6">
                        <span className="text-6xl mb-4 block">🍁</span>
                        <h3 className="text-2xl font-bold text-red-700 dark:text-red-300">
                          24
                        </h3>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {language === 'en' ? 'Communities' : 'Communautés'}
                        </p>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
                        {language === 'en' ? 'Explore Canadian Communities' : 'Explorer les communautés'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {language === 'en' 
                          ? 'Coast to coast senior living options with bilingual services' 
                          : 'Options de vie pour aînés d\'un océan à l\'autre avec services bilingues'}
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
                    </CardContent>
                  </Card>
                </Link>
              </>
            ) : (
              ((canadianCommunities as any)?.communities || []).slice(0, 10).map((community: any, index: number) => (
                <EnhancedCommunityCard
                  key={`canadian-${community.id}-${index}`}
                  community={community}
                  index={index}
                  variant='featured'
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Mexican Communities - AFFORDABLE PARADISE */}
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
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{((mexicoCommunities as any)?.communities || []).length || 101} authentic facilities • Ciudad de México, Cuernavaca, Guadalajara, Querétaro across 13 states</p>
        
          <div className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-green-500 dark:scrollbar-thumb-green-400 hover:scrollbar-thumb-green-600 snap-x snap-mandatory" style={{scrollBehavior: 'smooth', height: '32rem'}}>
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
              ((mexicoCommunities as any)?.communities || []).slice(0, 12).map((community: any, index: number) => (
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