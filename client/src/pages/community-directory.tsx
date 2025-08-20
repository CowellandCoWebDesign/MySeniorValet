import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/NavigationHeader";
import { 
  Building2, Search, MapPin, Home, Users, DollarSign, Shield, 
  Star, Filter, Database, TrendingUp, BarChart3, Globe,
  ChevronRight, ChevronLeft, Clock, CheckCircle, Info, Heart,
  HeartHandshake, Brain, Activity, Stethoscope, UserCheck,
  Calendar, Hotel, Flower2, Sparkles, AlertCircle, Truck, Flag, BookOpen
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

export default function CommunityDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [, setLocation] = useLocation();
  
  // 3D Carousel state
  const [selectedCareType, setSelectedCareType] = useState(2); // Start with 55+ selected
  const [touchStartX, setTouchStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Care types for carousel
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
      color: 'bg-blue-500', 
      description: 'Maintenance-free senior communities offering social activities and amenities without personal care assistance.',
      details: 'Social lifestyle • No assistance • Full independence',
      avgCost: '$2,500-4,500/month',
      keyFeatures: ['No care services', 'Meals & housekeeping included', 'Social activities & outings']
    },
    { 
      id: 'assisted', 
      name: 'Assisted', 
      icon: HeartHandshake, 
      color: 'bg-green-600', 
      description: 'Personal care communities helping with daily activities while promoting independence and quality of life.',
      details: '24/7 staff • Medication management • ADL assistance',
      avgCost: '$4,000-6,500/month',
      keyFeatures: ['Help with bathing/dressing', 'Medication reminders', '24-hour emergency response']
    },
    { 
      id: 'memory', 
      name: 'Memory', 
      icon: Brain, 
      color: 'bg-purple-500', 
      description: 'Specialized secure communities for Alzheimer\'s and dementia care with trained staff and therapeutic programs.',
      details: 'Secure environment • Specialized training • Memory programs',
      avgCost: '$5,500-8,500/month',
      keyFeatures: ['Secure wandering prevention', 'Cognitive therapies', 'Specialized dementia care']
    },
    { 
      id: 'nursing', 
      name: 'Nursing', 
      icon: Stethoscope, 
      color: 'bg-red-600', 
      description: '24/7 skilled nursing facilities providing medical care and rehabilitation services for complex health needs.',
      details: 'Medical care • Rehab services • Skilled nursing',
      avgCost: '$8,000-12,000/month',
      keyFeatures: ['24/7 nursing care', 'Physical/occupational therapy', 'Complex medical management']
    },
    { 
      id: 'ccrc', 
      name: 'CCRC', 
      icon: Activity, 
      color: 'bg-indigo-600', 
      description: 'Continuing Care Retirement Communities offering all levels of care on one campus for aging in place.',
      details: 'All care levels • One campus • Lifetime care',
      avgCost: 'Entry: $100K-500K + Monthly',
      keyFeatures: ['Age in place guarantee', 'All care levels available', 'Healthcare continuum']
    },
    { 
      id: 'board', 
      name: 'Board & Care', 
      icon: Hotel, 
      color: 'bg-yellow-600', 
      description: 'Small residential homes with 4-10 residents offering personalized care in a home-like setting.',
      details: 'Home setting • Personal attention • Small groups',
      avgCost: '$2,500-5,000/month',
      keyFeatures: ['4-10 residents only', 'Home-like atmosphere', 'Personalized attention']
    }
  ];
  
  // Carousel event handlers
  const handleCareTypeClick = (index: number) => {
    setSelectedCareType(index);
  };
  
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

            {/* 3D Carousel - Half Size */}
            <div className="flex justify-center items-center mb-12">
              <div 
                className="carousel-wrapper-half select-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <div className="carousel-3d-half">
                  {careTypes.map((careType, index) => {
                    const Icon = careType.icon;
                    const offset = (selectedCareType - index) / 3;
                    const absOffset = Math.abs(selectedCareType - index) / 3;
                    const isActive = index === selectedCareType;
                    
                    return (
                      <div
                        key={careType.id}
                        className="card-container-3d-half"
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
                        <div className={`card-3d-half ${careType.color} rounded-xl flex flex-col items-center justify-between p-3 shadow-2xl border-2 border-white/30`}
                             style={{ 
                               opacity: isActive ? 1 : 0.7,
                               transform: isActive ? 'scale(1.05)' : 'scale(1)',
                               height: '100%'
                             }}>
                          <div className="flex flex-col items-center">
                            <Icon className="w-8 h-8 text-white drop-shadow-lg mb-1" />
                            <h3 className="text-white font-bold text-center text-sm mb-1 drop-shadow-lg">{careType.name}</h3>
                            
                            {/* Average Cost */}
                            <div className="bg-white/20 rounded-lg px-2 py-0.5 mb-1">
                              <p className="text-white text-xs font-bold drop-shadow-md">
                                {careType.avgCost}
                              </p>
                            </div>
                            
                            {/* Quick Details */}
                            <p className="text-white/90 text-xs text-center mb-1 drop-shadow-md">
                              {careType.details}
                            </p>
                          </div>
                          
                          {/* Key Features - Only show when active */}
                          <div style={{ 
                            opacity: isActive ? 1 : 0,
                            maxHeight: isActive ? '100px' : '0',
                            overflow: 'hidden',
                            transition: 'opacity 0.3s ease-out, max-height 0.3s ease-out'
                          }}>
                            <div className="space-y-0.5 mb-2">
                              {careType.keyFeatures.slice(0, 2).map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-1">
                                  <CheckCircle className="w-2.5 h-2.5 text-white/80 mt-0.5 flex-shrink-0" />
                                  <p className="text-white/90 text-xs leading-tight">{feature}</p>
                                </div>
                              ))}
                            </div>
                            
                            {/* Learn More Button */}
                            <button 
                              className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                              onClick={(e) => e.stopPropagation()}
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
                      className="nav-3d-half left"
                      onClick={() => setSelectedCareType(i => i - 1)}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}
                  {selectedCareType < careTypes.length - 1 && (
                    <button 
                      className="nav-3d-half right"
                      onClick={() => setSelectedCareType(i => i + 1)}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>
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
                    <Badge className="bg-white/20 text-white">$2,500-$4,500/mo</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Active senior communities for those who want maintenance-free living without assistance. Perfect for social seniors who value their independence.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Little-Known Fact:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Many communities offer "trial stays" of 1-3 months before committing to a long-term lease.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Money-Saving Tip:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ask about "founder's rates" at new communities - can save 20-30% locked in for life.</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-sm"><strong>Includes:</strong> Meals, housekeeping, activities, transportation</p>
                      <p className="text-sm mt-1"><strong>Best For:</strong> Ages 55+, fully mobile, social lifestyle seekers</p>
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
                    <Badge className="bg-white/20 text-white">$4,000-$6,500/mo</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Personal care assistance with daily activities while maintaining independence. The most popular senior living option nationwide.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Little-Known Fact:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Veterans can receive up to $2,169/month through VA Aid & Attendance benefits for assisted living.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Money-Saving Tip:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Negotiate the community fee (often $2,000-$5,000) - many will waive it during slow months.</p>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="text-sm"><strong>Includes:</strong> 24/7 staff, medication management, ADL assistance</p>
                      <p className="text-sm mt-1"><strong>Best For:</strong> Those needing help with 2+ daily activities</p>
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
                    <Badge className="bg-white/20 text-white">$5,500-$8,500/mo</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Specialized care for Alzheimer's and dementia in secure environments with trained staff and therapeutic programs.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Little-Known Fact:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Music therapy can reduce sundowning behaviors by up to 50% - ask if the facility offers it.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Critical Question:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ask about staff-to-resident ratios during nights and weekends - should be 1:8 or better.</p>
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <p className="text-sm"><strong>Includes:</strong> Secured units, specialized activities, behavior management</p>
                      <p className="text-sm mt-1"><strong>Best For:</strong> Mid to late-stage dementia requiring 24/7 supervision</p>
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
                    <Badge className="bg-white/20 text-white">$7,000-$10,000/mo</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    24/7 medical care with RNs and rehabilitation services. Often covered by Medicare for qualifying stays.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Little-Known Fact:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Medicare covers 100% of the first 20 days if admitted from a 3-day hospital stay.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Money-Saving Tip:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Days 21-100: Medicare pays all but $200/day (2024) - supplemental insurance often covers this gap.</p>
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <p className="text-sm"><strong>Includes:</strong> IV therapy, wound care, physical therapy, speech therapy</p>
                      <p className="text-sm mt-1"><strong>Best For:</strong> Post-surgery recovery, complex medical needs</p>
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
                    <Badge className="bg-white/20 text-white">$1,500-$3,500/mo</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Age-restricted communities with resort-style amenities. No care services but vibrant social life.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Little-Known Fact:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">HOA fees often include golf memberships worth $500+/month at country club communities.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Insider Tip:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Buy during developer closeouts for 20-40% discounts on final units.</p>
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                      <p className="text-sm"><strong>Includes:</strong> Pools, fitness centers, social clubs, golf courses</p>
                      <p className="text-sm mt-1"><strong>Best For:</strong> Active retirees wanting community without care</p>
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
    </div>
  );
}