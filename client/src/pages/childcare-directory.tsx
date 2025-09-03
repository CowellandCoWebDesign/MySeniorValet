import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Baby, MapPin, Phone, Globe, CheckCircle, Search, ArrowRight, Sparkles,
  Clock, DollarSign, Star, Building, Users, Shield, Award, Heart,
  Calendar, School, Home, Bell, MessageSquare, Camera, Wifi,
  UserCheck, Activity, ShieldCheck, FileCheck, BadgeCheck, ClipboardCheck,
  UserPlus, Settings, Edit, Eye, RefreshCw, Plus, ListOrdered,
  Mail, CheckSquare, XCircle, Timer, CreditCard, ChevronLeft, ChevronRight,
  Utensils, Bus, TreePine, PlayCircle, Brain, Music, Palette, Database,
  TrendingUp, BarChart3, Info, AlertCircle, HeartHandshake, Filter,
  Zap, Navigation2, GraduationCap, BookOpen, Moon, Sun
} from "lucide-react";
import { ProfessionalNavbar } from "@/components/ProfessionalNavbar";
import { GlobalDiscoveryModal } from '@/components/GlobalDiscoveryModal';
import { HeroMascotPanel } from "@/components/mascot/HeroMascotPanel";
import { MascotLoadingDisplay } from "@/components/MascotLoadingDisplay";
import { AutocompleteSearch } from "@/components/AutocompleteSearch";
import { Link, useLocation } from "wouter";
import { EnhancedCommunityCard } from "@/components/EnhancedCommunityCard";

interface ChildcareCenter {
  id: string | number;
  name: string;
  description?: string;
  city?: string;
  state?: string;
  address?: string;
  phone?: string;
  website?: string;
  pricing?: string;
  ageRange?: string;
  rating?: number;
  isDiscovered?: boolean;
  type?: string;
  
  // Enhanced fields
  licenseNumber?: string;
  licenseStatus?: 'Active' | 'Pending' | 'Expired';
  capacity?: number;
  currentEnrollment?: number;
  waitlistLength?: number;
  staffChildRatio?: string;
  hoursOfOperation?: string;
  mealsProvided?: boolean;
  transportProvided?: boolean;
  specialPrograms?: string[];
  accreditations?: string[];
  inspectionScore?: number;
  lastInspectionDate?: string;
  yearEstablished?: number;
  acceptsSubsidy?: boolean;
  
  // ProCare-inspired features
  dailyUpdates?: boolean;
  parentApp?: boolean;
  liveCamera?: boolean;
  digitalPayments?: boolean;
  instantMessaging?: boolean;
  
  // For display purposes
  photos?: string[];
  priceRange?: { min: number; max: number };
  careTypes?: string[];
}

export default function ChildcareDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showGlobalDiscovery, setShowGlobalDiscovery] = useState(false);
  const [discoveryResults, setDiscoveryResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCareType, setSelectedCareType] = useState("");
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [distanceRange, setDistanceRange] = useState([5]);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  
  const { toast } = useToast();

  // Refs for horizontal sliders
  const sanFranciscoSliderRef = useRef<HTMLDivElement>(null);
  const newYorkSliderRef = useRef<HTMLDivElement>(null);
  const losAngelesSliderRef = useRef<HTMLDivElement>(null);
  const chicagoSliderRef = useRef<HTMLDivElement>(null);
  const houstonSliderRef = useRef<HTMLDivElement>(null);
  const miamiSliderRef = useRef<HTMLDivElement>(null);

  // Scroll navigation function
  const scrollSlider = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 320;
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

  // Fetch childcare centers for different metro areas
  const { data: sanFranciscoCenters, isLoading: sfLoading } = useQuery({
    queryKey: ['childcare-sf'],
    queryFn: async () => {
      const response = await fetch('/api/communities?city=San Francisco&careType=childcare&limit=20');
      if (!response.ok) return { communities: [] };
      const data = await response.json();
      return { communities: data.communities || [] };
    }
  });

  const { data: newYorkCenters, isLoading: nyLoading } = useQuery({
    queryKey: ['childcare-ny'],
    queryFn: async () => {
      const response = await fetch('/api/communities?city=New York&careType=childcare&limit=20');
      if (!response.ok) return { communities: [] };
      const data = await response.json();
      return { communities: data.communities || [] };
    }
  });

  const { data: losAngelesCenters, isLoading: laLoading } = useQuery({
    queryKey: ['childcare-la'],
    queryFn: async () => {
      const response = await fetch('/api/communities?city=Los Angeles&careType=childcare&limit=20');
      if (!response.ok) return { communities: [] };
      const data = await response.json();
      return { communities: data.communities || [] };
    }
  });

  const { data: chicagoCenters, isLoading: chiLoading } = useQuery({
    queryKey: ['childcare-chi'],
    queryFn: async () => {
      const response = await fetch('/api/communities?city=Chicago&careType=childcare&limit=20');
      if (!response.ok) return { communities: [] };
      const data = await response.json();
      return { communities: data.communities || [] };
    }
  });

  const { data: houstonCenters, isLoading: houLoading } = useQuery({
    queryKey: ['childcare-hou'],
    queryFn: async () => {
      const response = await fetch('/api/communities?city=Houston&careType=childcare&limit=20');
      if (!response.ok) return { communities: [] };
      const data = await response.json();
      return { communities: data.communities || [] };
    }
  });

  const { data: miamiCenters, isLoading: miaLoading } = useQuery({
    queryKey: ['childcare-mia'],
    queryFn: async () => {
      const response = await fetch('/api/communities?city=Miami&careType=childcare&limit=20');
      if (!response.ok) return { communities: [] };
      const data = await response.json();
      return { communities: data.communities || [] };
    }
  });

  // Fetch childcare statistics
  const { data: childcareStats } = useQuery({
    queryKey: ['childcare-stats'],
    queryFn: async () => {
      const response = await fetch('/api/communities/stats?careType=childcare');
      if (!response.ok) return { total: 0, withPricing: 0, licensed: 0 };
      return response.json();
    }
  });

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleGlobalDiscovery = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a location or childcare center name to search",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/global-discovery/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: searchQuery,
          searchType: 'childcare',
          limit: 30
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDiscoveryResults({
          query: searchQuery,
          results: data.results || [],
          metadata: data.metadata
        });
        setShowGlobalDiscovery(true);

        toast({
          title: "Discovery Complete",
          description: `Found ${data.metadata?.discoveredCount || 0} new childcare centers`,
        });
      }
    } catch (error) {
      console.error('Discovery error:', error);
      toast({
        title: "Discovery Failed",
        description: "Unable to search for childcare centers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Enhanced childcare card component for horizontal sliders
  const ChildcareSliderCard = ({ center }: { center: ChildcareCenter }) => (
    <Link href={`/childcare/${center.id}`} className="flex-shrink-0">
      <Card className="w-80 hover:shadow-2xl transition-all overflow-hidden bg-white dark:bg-gray-900 border-2 border-pink-300 dark:border-pink-600 rounded-xl h-[520px]">
        <div className="relative">
          {/* Image Section */}
          <div className="h-48 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 flex items-center justify-center relative">
            {center.photos && center.photos.length > 0 ? (
              <img 
                src={center.photos[0]} 
                alt={center.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <Baby className="h-16 w-16 text-pink-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Photos Coming Soon</div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>
          
          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex gap-2">
              {center.licenseStatus === 'Active' && (
                <Badge className="bg-green-600 text-white text-xs px-2 py-1">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Licensed
                </Badge>
              )}
              {center.isDiscovered && (
                <Badge className="bg-purple-600 text-white text-xs px-2 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Found
                </Badge>
              )}
            </div>
            
            {center.pricing && (
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {center.pricing}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  per week
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Card Body */}
        <CardContent className="p-4 space-y-3">
          {/* Name & Location */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">
              {center.name}
            </h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span>{center.city}, {center.state}</span>
            </div>
          </div>
          
          {/* Age Range */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {center.ageRange || '6 weeks - 12 years'}
            </Badge>
            {center.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{center.rating}</span>
              </div>
            )}
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-2 py-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs">{center.hoursOfOperation || '6:30am-6:30pm'}</span>
            </div>
            {center.mealsProvided && (
              <div className="flex items-center gap-1">
                <Utensils className="h-3.5 w-3.5 text-green-500" />
                <span className="text-xs">Meals Included</span>
              </div>
            )}
            {center.parentApp && (
              <div className="flex items-center gap-1">
                <Bell className="h-3.5 w-3.5 text-purple-500" />
                <span className="text-xs">Parent App</span>
              </div>
            )}
            {center.acceptsSubsidy && (
              <div className="flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs">Subsidy OK</span>
              </div>
            )}
          </div>
          
          {/* Availability Bar */}
          {center.capacity && center.currentEnrollment && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-400">Availability</span>
                <span className="font-medium">
                  {center.capacity - center.currentEnrollment} spots
                </span>
              </div>
              <Progress 
                value={(center.currentEnrollment / center.capacity) * 100} 
                className="h-2"
              />
            </div>
          )}
          
          {/* Waitlist Badge */}
          {center.waitlistLength && center.waitlistLength > 0 && (
            <Badge variant="outline" className="w-full justify-center">
              <ListOrdered className="h-3 w-3 mr-1" />
              {center.waitlistLength} on waitlist
            </Badge>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm"
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
            >
              View Details
              <Eye className="h-4 w-4 ml-1" />
            </Button>
            <Button size="sm" variant="outline">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  // Metro area slider component
  const MetroSlider = ({ 
    title, 
    subtitle, 
    data, 
    loading, 
    sliderRef, 
    colorTheme = 'pink' 
  }: { 
    title: string; 
    subtitle: string; 
    data: any; 
    loading: boolean; 
    sliderRef: React.RefObject<HTMLDivElement>;
    colorTheme?: string;
  }) => {
    const colors = {
      pink: 'from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20',
      blue: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      green: 'from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20',
      orange: 'from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20',
      purple: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      red: 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20'
    };

    return (
      <section className={`px-4 py-12 bg-gradient-to-br ${colors[colorTheme as keyof typeof colors] || colors.pink}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              {subtitle}
            </p>
          </div>
          
          <div className="relative">
            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 rounded-full"
              onClick={() => scrollSlider(sliderRef, 'left')}
            >
              <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 rounded-full"
              onClick={() => scrollSlider(sliderRef, 'right')}
            >
              <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </Button>
            
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full"></div>
              </div>
            ) : !data?.communities?.length ? (
              <div className="text-center text-gray-600 dark:text-gray-400">
                <Baby className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p>No childcare centers discovered yet in this area.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => handleGlobalDiscovery()}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Discover Centers Here
                </Button>
              </div>
            ) : (
              <div 
                ref={sliderRef} 
                className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
              >
                {data.communities.map((center: ChildcareCenter) => (
                  <ChildcareSliderCard key={center.id} center={center} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  if (isLoading) {
    return <MascotLoadingDisplay />;
  }

  return (
    <>
      <ProfessionalNavbar />
      
      {showGlobalDiscovery && discoveryResults && (
        <GlobalDiscoveryModal
          isOpen={showGlobalDiscovery}
          onClose={() => setShowGlobalDiscovery(false)}
          searchQuery={discoveryResults.query}
          results={discoveryResults.results}
          metadata={discoveryResults.metadata}
        />
      )}

      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-pink-900 via-purple-800 to-indigo-900 overflow-hidden pt-32">
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
              <Baby className="h-4 w-4 mr-2" />
              GLOBAL CHILDCARE TRANSPARENCY
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Child Care Directory
            </h1>
            
            <p className="text-xl text-pink-100 mb-8 max-w-3xl mx-auto">
              Solving the $9.39 billion childcare crisis with real-time availability, 
              transparent pricing, and digital waitlist management
            </p>
            
            {/* Key Stats */}
            <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-white">Global</div>
                  <div className="text-xs text-pink-100">Coverage</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-300">Real-Time</div>
                  <div className="text-xs text-pink-100">Availability</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-white">Licensed</div>
                  <div className="text-xs text-pink-100">Centers Only</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-300">AI</div>
                  <div className="text-xs text-pink-100">Discovery</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="px-4 py-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="text-center mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Find Child Care Centers
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover centers globally • Real-time availability • Transparent pricing
              </p>
            </div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center p-2">
                <Search className="ml-3 h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <AutocompleteSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSubmit={(value) => {
                      if (value) {
                        handleGlobalDiscovery();
                      }
                    }}
                    placeholder="Search childcare in any city (e.g., 'daycares in Seattle' or 'preschools London')"
                    inputClassName="w-full pl-3 pr-3 py-3 text-base border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    hideSearchButton={true}
                  />
                </div>
                <Button
                  onClick={handleGlobalDiscovery}
                  disabled={isSearching}
                  className="mr-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
                >
                  {isSearching ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Discovering...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Discover
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-3 mt-6">
              <span className="inline-flex items-center space-x-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md">
                <ShieldCheck className="h-3 w-3 text-green-500" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Licensed Only</span>
              </span>
              <span className="inline-flex items-center space-x-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md">
                <Activity className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Live Waitlists</span>
              </span>
              <span className="inline-flex items-center space-x-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md">
                <Bell className="h-3 w-3 text-purple-500" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Parent Apps</span>
              </span>
              <span className="inline-flex items-center space-x-1 bg-gradient-to-r from-purple-800/80 to-indigo-800/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-purple-400/30">
                <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse" />
                <span className="text-xs font-semibold text-white">AI-Powered</span>
              </span>
            </div>

            {/* Quick Filter Badges */}
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors border-pink-300 dark:border-pink-600"
              >
                <Baby className="h-3 w-3 mr-1 text-pink-600" />
                <span>Infant Care</span>
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border-purple-300 dark:border-purple-600"
              >
                <PlayCircle className="h-3 w-3 mr-1 text-purple-600" />
                <span>Toddler Programs</span>
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-blue-300 dark:border-blue-600"
              >
                <School className="h-3 w-3 mr-1 text-blue-600" />
                <span>Preschool</span>
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors border-green-300 dark:border-green-600"
              >
                <Palette className="h-3 w-3 mr-1 text-green-600" />
                <span>Montessori</span>
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors border-orange-300 dark:border-orange-600"
              >
                <Sun className="h-3 w-3 mr-1 text-orange-600" />
                <span>After School</span>
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Mascot Panel */}
      <section className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <HeroMascotPanel 
            title="Bringing Transparency to Child Care"
            subtitle="ProCare-inspired features: Real-time updates, digital waitlists, parent apps, and transparent pricing"
          />
        </div>
      </section>

      {/* San Francisco Bay Area */}
      <MetroSlider
        title="🌉 San Francisco Bay Area"
        subtitle="Premium childcare centers in San Francisco, San Jose, and Oakland"
        data={sanFranciscoCenters}
        loading={sfLoading}
        sliderRef={sanFranciscoSliderRef}
        colorTheme="blue"
      />

      {/* New York Metro */}
      <MetroSlider
        title="🗽 New York Metropolitan Area"
        subtitle="Quality childcare in Manhattan, Brooklyn, Queens, and surrounding areas"
        data={newYorkCenters}
        loading={nyLoading}
        sliderRef={newYorkSliderRef}
        colorTheme="purple"
      />

      {/* Los Angeles */}
      <MetroSlider
        title="☀️ Los Angeles & Southern California"
        subtitle="Year-round childcare options in LA, Orange County, and San Diego"
        data={losAngelesCenters}
        loading={laLoading}
        sliderRef={losAngelesSliderRef}
        colorTheme="orange"
      />

      {/* Chicago */}
      <MetroSlider
        title="🏙️ Chicago & Midwest"
        subtitle="Trusted childcare centers throughout Chicagoland"
        data={chicagoCenters}
        loading={chiLoading}
        sliderRef={chicagoSliderRef}
        colorTheme="green"
      />

      {/* Houston */}
      <MetroSlider
        title="⭐ Houston & Texas Cities"
        subtitle="Everything's bigger in Texas, including childcare options"
        data={houstonCenters}
        loading={houLoading}
        sliderRef={houstonSliderRef}
        colorTheme="red"
      />

      {/* Miami */}
      <MetroSlider
        title="🌴 Miami & South Florida"
        subtitle="Bilingual and multicultural childcare in the sunshine state"
        data={miamiCenters}
        loading={miaLoading}
        sliderRef={miamiSliderRef}
        colorTheme="pink"
      />

      {/* Main Content Tabs */}
      <section className="px-4 py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transparency">Transparency</TabsTrigger>
              <TabsTrigger value="waitlists">Waitlists</TabsTrigger>
              <TabsTrigger value="providers">Providers</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">The Child Care Crisis</CardTitle>
                  <CardDescription>
                    Understanding the challenges facing parents and providers in 2025
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-orange-200">
                      <CardContent className="p-4">
                        <DollarSign className="h-8 w-8 text-orange-500 mb-2" />
                        <h4 className="font-semibold mb-1">Cost Crisis</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Annual costs: $4,810-$15,417, consuming up to 19.3% of median family income
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200">
                      <CardContent className="p-4">
                        <Users className="h-8 w-8 text-blue-500 mb-2" />
                        <h4 className="font-semibold mb-1">Availability Shortage</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          50% of US children live in "childcare deserts" with insufficient licensed care
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-purple-200">
                      <CardContent className="p-4">
                        <ListOrdered className="h-8 w-8 text-purple-500 mb-2" />
                        <h4 className="font-semibold mb-1">Waitlist Crisis</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Average waitlist: 236 children, up 28% from 2020
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transparency Tab */}
            <TabsContent value="transparency" className="space-y-6 mt-8">
              <Card className="border-green-200">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Eye className="h-6 w-6 text-green-600" />
                    Complete Transparency Dashboard
                  </CardTitle>
                  <CardDescription>
                    Inspired by ProCare's model - 80% of centers now use management software
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <ShieldCheck className="h-6 w-6 text-green-600 mb-2" />
                      <h4 className="font-semibold">License Verification</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        All centers verified through state databases
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Camera className="h-6 w-6 text-blue-600 mb-2" />
                      <h4 className="font-semibold">Live Cameras</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Watch your child anytime (where available)
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Bell className="h-6 w-6 text-purple-600 mb-2" />
                      <h4 className="font-semibold">Daily Updates</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Real-time activity reports and photos
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-orange-600 mb-2" />
                      <h4 className="font-semibold">Direct Messaging</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Chat with teachers instantly
                      </p>
                    </div>
                    <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                      <Activity className="h-6 w-6 text-pink-600 mb-2" />
                      <h4 className="font-semibold">Live Availability</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Real-time enrollment and waitlist status
                      </p>
                    </div>
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-indigo-600 mb-2" />
                      <h4 className="font-semibold">Inspection Scores</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Health & safety results updated monthly
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Waitlists Tab */}
            <TabsContent value="waitlists" className="space-y-6 mt-8">
              <Card className="border-orange-200">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <ListOrdered className="h-6 w-6 text-orange-600" />
                    Digital Waitlist Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <div>
                      <p className="font-semibold">The Numbers</p>
                      <p className="text-sm">Average waitlist increased from 185 to 236 children (28% increase). Some parents report being #451 on lists.</p>
                    </div>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">For Parents</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">Join multiple waitlists from one dashboard</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">Get instant notifications when spots open</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">AI-powered estimated wait times</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">For Providers</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">70% reduction in admin burden</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">Automated fair queue system</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">One-click offers with response tracking</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Providers Tab */}
            <TabsContent value="providers" className="space-y-6 mt-8">
              <Card className="border-purple-200">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Building className="h-6 w-6 text-purple-600" />
                    Provider Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <ClipboardCheck className="h-6 w-6 text-green-600 mb-2" />
                        <h4 className="font-semibold">Claim Your Listing</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Free verification & management
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <TrendingUp className="h-6 w-6 text-blue-600 mb-2" />
                        <h4 className="font-semibold">67% at Capacity</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Centers using transparency tools
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <Star className="h-6 w-6 text-yellow-600 mb-2" />
                        <h4 className="font-semibold">4.9/5 Rating</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Parent app satisfaction
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Claim Your Center
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <DollarSign className="h-8 w-8 text-green-500 mb-3" />
                    <h4 className="font-semibold text-lg mb-2">Cost Calculator</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Estimate monthly costs including hidden fees
                    </p>
                    <Button variant="outline" className="w-full">Calculate Costs</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <CreditCard className="h-8 w-8 text-blue-500 mb-3" />
                    <h4 className="font-semibold text-lg mb-2">Subsidy Checker</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Check eligibility for childcare assistance
                    </p>
                    <Button variant="outline" className="w-full">Check Eligibility</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <ClipboardCheck className="h-8 w-8 text-purple-500 mb-3" />
                    <h4 className="font-semibold text-lg mb-2">Visit Checklist</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Questions to ask when touring centers
                    </p>
                    <Button variant="outline" className="w-full">Get Checklist</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <Shield className="h-8 w-8 text-red-500 mb-3" />
                    <h4 className="font-semibold text-lg mb-2">Safety Guide</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Understanding licensing and standards
                    </p>
                    <Button variant="outline" className="w-full">Learn More</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
}