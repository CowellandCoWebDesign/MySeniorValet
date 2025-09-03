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
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Baby, MapPin, Phone, Globe, CheckCircle, Search, ArrowRight, Sparkles,
  Clock, DollarSign, Star, Building, Users, Shield, Award, Heart,
  Calendar, School, Home, Sun, Moon, Zap, AlertCircle, BookOpen,
  UserCheck, Activity, Bell, MessageSquare, ChevronLeft, ChevronRight,
  TrendingUp, BarChart3, Filter, Info, Lock, Unlock, Coffee,
  PlayCircle, Palette, Music, TreePine, Utensils, Bus, Camera,
  Smartphone, Wifi, ShieldCheck, FileCheck, BadgeCheck, ClipboardCheck,
  UserPlus, Settings, Edit, Eye, RefreshCw, Plus, ListOrdered,
  Mail, CheckSquare, XCircle, Timer, CreditCard
} from "lucide-react";
import { ProfessionalNavbar } from "@/components/ProfessionalNavbar";
import { GlobalDiscoveryModal } from '@/components/GlobalDiscoveryModal';
import { HeroMascotPanel } from "@/components/mascot/HeroMascotPanel";
import { MascotLoadingDisplay } from "@/components/MascotLoadingDisplay";
import { Link } from "wouter";

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
  
  // Enhanced fields based on research
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
  incidentReports?: number;
  yearEstablished?: number;
  acceptsSubsidy?: boolean;
  
  // ProCare-inspired features
  dailyUpdates?: boolean;
  parentApp?: boolean;
  liveCamera?: boolean;
  digitalPayments?: boolean;
  instantMessaging?: boolean;
}

interface WaitlistEntry {
  parentName: string;
  childName: string;
  childAge: string;
  desiredStartDate: string;
  position: number;
  estimatedAvailability?: string;
  status: 'active' | 'pending' | 'offered' | 'expired';
}

export default function ChildcareDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [childcareCenters, setChildcareCenters] = useState<ChildcareCenter[]>([]);
  const [showGlobalDiscovery, setShowGlobalDiscovery] = useState(false);
  const [discoveryResults, setDiscoveryResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("search");
  const [selectedCareType, setSelectedCareType] = useState("");
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [distanceRange, setDistanceRange] = useState([5]);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [showProviderPanel, setShowProviderPanel] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [selectedCenter, setSelectedCenter] = useState<ChildcareCenter | null>(null);
  
  const { toast } = useToast();

  // Care types with detailed information (addressing parent pain points from research)
  const careTypes = [
    { 
      id: 'infant', 
      name: 'Infant Care', 
      icon: Baby, 
      color: 'bg-pink-500',
      ageRange: '6 weeks - 18 months',
      description: 'Specialized care for infants with low ratios and dedicated nurseries',
      avgCost: '$1,200-2,500/month',
      keyFeatures: ['1:3 or 1:4 ratio', 'Bottle & diaper service', 'Nap schedules'],
      waitlistAvg: '6-12 months'
    },
    { 
      id: 'toddler', 
      name: 'Toddler Care', 
      icon: PlayCircle, 
      color: 'bg-purple-500',
      ageRange: '18 months - 3 years',
      description: 'Active learning and potty training support for toddlers',
      avgCost: '$1,000-2,000/month',
      keyFeatures: ['1:5 or 1:6 ratio', 'Potty training', 'Early learning activities'],
      waitlistAvg: '3-6 months'
    },
    { 
      id: 'preschool', 
      name: 'Preschool', 
      icon: School, 
      color: 'bg-blue-500',
      ageRange: '3 - 5 years',
      description: 'Pre-K education with structured curriculum and kindergarten prep',
      avgCost: '$800-1,800/month',
      keyFeatures: ['1:8 or 1:10 ratio', 'Pre-K curriculum', 'Social skills development'],
      waitlistAvg: '2-4 months'
    },
    { 
      id: 'montessori', 
      name: 'Montessori', 
      icon: Palette, 
      color: 'bg-green-500',
      ageRange: '2.5 - 6 years',
      description: 'Child-led learning with Montessori certified teachers and materials',
      avgCost: '$1,200-2,500/month',
      keyFeatures: ['Mixed age groups', 'Self-directed learning', 'Montessori materials'],
      waitlistAvg: '6-9 months'
    },
    { 
      id: 'homebased', 
      name: 'Home-Based', 
      icon: Home, 
      color: 'bg-yellow-500',
      ageRange: 'All ages',
      description: 'Family childcare in home settings with mixed age groups',
      avgCost: '$600-1,200/month',
      keyFeatures: ['Small group size', 'Home-like setting', 'Flexible hours'],
      waitlistAvg: '1-2 months'
    },
    { 
      id: 'afterschool', 
      name: 'After School', 
      icon: Sun, 
      color: 'bg-orange-500',
      ageRange: '5 - 12 years',
      description: 'Before/after school care with homework help and activities',
      avgCost: '$300-800/month',
      keyFeatures: ['Homework help', 'Snacks provided', 'Activity programs'],
      waitlistAvg: '1 month'
    },
    { 
      id: 'dropin', 
      name: 'Drop-In', 
      icon: Clock, 
      color: 'bg-red-500',
      ageRange: 'All ages',
      description: 'Flexible hourly care without long-term commitments',
      avgCost: '$15-30/hour',
      keyFeatures: ['No commitment', 'Hourly rates', 'Backup care option'],
      waitlistAvg: 'Usually available'
    },
    { 
      id: 'overnight', 
      name: 'Overnight', 
      icon: Moon, 
      color: 'bg-indigo-500',
      ageRange: 'All ages',
      description: '24-hour and overnight care for shift workers and emergencies',
      avgCost: '$100-200/night',
      keyFeatures: ['24/7 availability', 'Overnight staff', 'Evening meals'],
      waitlistAvg: 'Varies'
    },
    { 
      id: 'special', 
      name: 'Special Needs', 
      icon: Heart, 
      color: 'bg-teal-500',
      ageRange: 'All ages',
      description: 'Specialized care for children with developmental or physical needs',
      avgCost: '$1,500-3,000/month',
      keyFeatures: ['Trained staff', 'IEP support', 'Therapy services'],
      waitlistAvg: '3-6 months'
    },
    { 
      id: 'corporate', 
      name: 'Corporate', 
      icon: Building, 
      color: 'bg-gray-600',
      ageRange: 'All ages',
      description: 'Employer-sponsored onsite childcare with employee discounts',
      avgCost: '$800-2,000/month',
      keyFeatures: ['Onsite convenience', 'Employee discounts', 'Extended hours'],
      waitlistAvg: 'Priority for employees'
    }
  ];

  // Load initial childcare centers on mount
  useEffect(() => {
    loadChildcareCenters();
  }, []);

  const loadChildcareCenters = async () => {
    try {
      const response = await fetch('/api/communities?careType=childcare&limit=20');
      if (response.ok) {
        const data = await response.json();
        setChildcareCenters(data.communities || []);
      }
    } catch (error) {
      console.error('Error loading childcare centers:', error);
    }
  };

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
        
        if (data.results && data.results.length > 0) {
          setChildcareCenters(prev => [...data.results, ...prev]);
        }

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

  // Enhanced childcare card with transparency features
  const EnhancedChildcareCard = ({ center }: { center: ChildcareCenter }) => (
    <Card className="hover:shadow-xl transition-all hover:scale-105 border-pink-200 dark:border-pink-800 overflow-hidden">
      {/* Trust Indicators Bar */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 px-4 py-2 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {center.licenseStatus === 'Active' && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Licensed
              </Badge>
            )}
            {center.inspectionScore && center.inspectionScore >= 90 && (
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                <Award className="h-3 w-3 mr-1" />
                {center.inspectionScore}% Score
              </Badge>
            )}
            {center.parentApp && (
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100">
                <Smartphone className="h-3 w-3 mr-1" />
                Parent App
              </Badge>
            )}
          </div>
          {center.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-semibold">{center.rating}</span>
            </div>
          )}
        </div>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Baby className="h-5 w-5 text-pink-500" />
              {center.name}
            </CardTitle>
            {center.isDiscovered && (
              <Badge className="mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Discovered
              </Badge>
            )}
            {center.waitlistLength && center.waitlistLength > 10 && (
              <Badge variant="outline" className="mt-1 border-orange-500 text-orange-600">
                <Users className="h-3 w-3 mr-1" />
                {center.waitlistLength} on waitlist
              </Badge>
            )}
          </div>
        </div>
        
        {/* Availability Indicator */}
        {center.capacity && center.currentEnrollment && (
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Availability</span>
              <span className="font-medium">
                {center.capacity - center.currentEnrollment} spots
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  (center.currentEnrollment / center.capacity) > 0.9 
                    ? 'bg-red-500' 
                    : (center.currentEnrollment / center.capacity) > 0.7 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
                }`}
                style={{ width: `${(center.currentEnrollment / center.capacity) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {center.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {center.description}
          </p>
        )}
        
        {/* Key Information Grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {center.ageRange && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-pink-400" />
              <span>Ages: {center.ageRange}</span>
            </div>
          )}
          
          {center.staffChildRatio && (
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-400" />
              <span>Ratio: {center.staffChildRatio}</span>
            </div>
          )}
          
          {center.hoursOfOperation && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-400" />
              <span>{center.hoursOfOperation}</span>
            </div>
          )}
          
          {center.pricing && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {center.pricing}
              </span>
            </div>
          )}
        </div>

        {/* Features & Programs */}
        <div className="flex flex-wrap gap-1">
          {center.mealsProvided && (
            <Badge variant="secondary" className="text-xs">
              <Utensils className="h-3 w-3 mr-1" />
              Meals
            </Badge>
          )}
          {center.transportProvided && (
            <Badge variant="secondary" className="text-xs">
              <Bus className="h-3 w-3 mr-1" />
              Transport
            </Badge>
          )}
          {center.liveCamera && (
            <Badge variant="secondary" className="text-xs">
              <Camera className="h-3 w-3 mr-1" />
              Live Cam
            </Badge>
          )}
          {center.dailyUpdates && (
            <Badge variant="secondary" className="text-xs">
              <Bell className="h-3 w-3 mr-1" />
              Daily Updates
            </Badge>
          )}
          {center.acceptsSubsidy && (
            <Badge variant="secondary" className="text-xs">
              <CreditCard className="h-3 w-3 mr-1" />
              Subsidy OK
            </Badge>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-2 pt-2 border-t">
          {(center.city || center.state) && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-pink-400" />
              <span>{center.city}{center.city && center.state ? ', ' : ''}{center.state}</span>
            </div>
          )}
          
          {center.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-pink-400" />
              <span>{center.phone}</span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Link href={`/childcare/${center.id}`} className="flex-1">
            <Button 
              size="sm" 
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
            >
              View Details
              <Eye className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Button 
            size="sm" 
            variant="outline"
            className="border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/20"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Provider Dashboard Component
  const ProviderDashboard = () => (
    <div className="space-y-6">
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-purple-600" />
            Provider Dashboard
          </CardTitle>
          <CardDescription>
            Manage your childcare center listing and connect with families
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <ClipboardCheck className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Claim Your Listing</p>
                    <p className="text-lg font-semibold">Free Verification</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <ListOrdered className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage Waitlist</p>
                    <p className="text-lg font-semibold">Digital System</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Parent Communication</p>
                    <p className="text-lg font-semibold">Real-time Updates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Benefits of Transparency
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>67% of centers report being at capacity with transparent pricing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Parents are 3x more likely to choose centers with real-time updates</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Digital waitlists reduce administrative burden by 70%</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Claim Your Center
            </Button>
            <Button variant="outline" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // 3D Carousel Component for Care Types
  const CareTypeCarousel = () => {
    const handleRotate = (direction: 'left' | 'right') => {
      const increment = direction === 'left' ? 36 : -36;
      setCurrentRotation(prev => prev + increment);
    };

    return (
      <div className="relative h-[400px] flex items-center justify-center mb-8">
        <button
          onClick={() => handleRotate('left')}
          className="absolute left-0 z-10 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <div className="relative w-full max-w-4xl h-full perspective-1000">
          <div 
            className="absolute inset-0 flex items-center justify-center transform-style-preserve-3d transition-transform duration-500"
            style={{ transform: `rotateY(${currentRotation}deg)` }}
          >
            {careTypes.map((type, index) => {
              const angle = (index * 360) / careTypes.length;
              return (
                <div
                  key={type.id}
                  className="absolute w-80 h-64 backface-hidden"
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(400px)`
                  }}
                >
                  <Card 
                    className={`h-full cursor-pointer transition-all hover:scale-105 ${
                      selectedCareType === type.id ? 'ring-2 ring-pink-500' : ''
                    }`}
                    onClick={() => setSelectedCareType(type.id)}
                  >
                    <CardHeader className={`${type.color} bg-opacity-10`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 ${type.color} rounded-lg`}>
                            <type.icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{type.name}</CardTitle>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{type.ageRange}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{type.avgCost}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {type.description}
                      </p>
                      <div className="space-y-2">
                        {type.keyFeatures.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      {type.waitlistAvg && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Typical wait:</span>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {type.waitlistAvg}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => handleRotate('right')}
          className="absolute right-0 z-10 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    );
  };

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

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 dark:from-gray-900 dark:via-pink-900/20 dark:to-purple-900/20 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section with Mascot */}
          <div className="mb-8">
            <HeroMascotPanel 
              title="Global Child Care Transparency Platform"
              subtitle="Addressing the $9.39 billion childcare crisis with real-time availability, transparent pricing, and digital waitlist management"
              showStats={false}
            />
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 bg-white/80 dark:bg-gray-800/80">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Find Care</span>
              </TabsTrigger>
              <TabsTrigger value="transparency" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Transparency</span>
              </TabsTrigger>
              <TabsTrigger value="waitlist" className="flex items-center gap-2">
                <ListOrdered className="h-4 w-4" />
                <span className="hidden sm:inline">Waitlists</span>
              </TabsTrigger>
              <TabsTrigger value="providers" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">Providers</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Resources</span>
              </TabsTrigger>
            </TabsList>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-6">
              {/* Care Type Carousel */}
              <Card className="border-pink-200 dark:border-pink-800">
                <CardHeader>
                  <CardTitle className="text-2xl">Choose Your Care Type</CardTitle>
                  <CardDescription>
                    Explore different childcare options with transparent pricing and availability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CareTypeCarousel />
                </CardContent>
              </Card>

              {/* Advanced Search Filters */}
              <Card className="border-pink-200 dark:border-pink-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-pink-500" />
                    Advanced Search Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Location Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="City, state, or zip code"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Age Group</Label>
                      <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="infant">Infant (0-18 months)</SelectItem>
                          <SelectItem value="toddler">Toddler (18m-3y)</SelectItem>
                          <SelectItem value="preschool">Preschool (3-5y)</SelectItem>
                          <SelectItem value="schoolage">School Age (5-12y)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Special Requirements</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select requirements" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="meals">Meals Included</SelectItem>
                          <SelectItem value="transport">Transportation</SelectItem>
                          <SelectItem value="subsidy">Accepts Subsidy</SelectItem>
                          <SelectItem value="special">Special Needs</SelectItem>
                          <SelectItem value="bilingual">Bilingual Program</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between">
                        <span>Monthly Budget</span>
                        <span className="text-sm font-normal text-gray-600">
                          ${priceRange[0]} - ${priceRange[1]}
                        </span>
                      </Label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={3000}
                        step={100}
                        className="mt-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center justify-between">
                        <span>Distance</span>
                        <span className="text-sm font-normal text-gray-600">
                          {distanceRange[0]} miles
                        </span>
                      </Label>
                      <Slider
                        value={distanceRange}
                        onValueChange={setDistanceRange}
                        min={1}
                        max={25}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleGlobalDiscovery}
                      disabled={isSearching}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                    >
                      {isSearching ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Discovering...
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4 mr-2" />
                          Discover Centers
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="border-pink-300">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results Grid */}
              {childcareCenters.length > 0 && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {childcareCenters.length} Centers Found
                    </h2>
                    <div className="flex gap-2">
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified Data
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                        <Shield className="h-3 w-3 mr-1" />
                        Licensed Only
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {childcareCenters.map((center) => (
                      <EnhancedChildcareCard key={center.id} center={center} />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Transparency Tab */}
            <TabsContent value="transparency" className="space-y-6">
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Eye className="h-6 w-6 text-green-600" />
                    Complete Transparency Dashboard
                  </CardTitle>
                  <CardDescription>
                    Real-time information inspired by ProCare's transparency model
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <ShieldCheck className="h-8 w-8 text-green-500 mb-2" />
                        <h4 className="font-semibold">License Verification</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          All centers verified through state licensing databases
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <BarChart3 className="h-8 w-8 text-blue-500 mb-2" />
                        <h4 className="font-semibold">Inspection Scores</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Health & safety inspection results updated monthly
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <Activity className="h-8 w-8 text-purple-500 mb-2" />
                        <h4 className="font-semibold">Live Availability</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Real-time enrollment and waitlist status
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">What Parents Can See:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { icon: Camera, text: "Live classroom cameras (where available)" },
                        { icon: Bell, text: "Real-time daily activity updates" },
                        { icon: MessageSquare, text: "Direct messaging with teachers" },
                        { icon: Calendar, text: "Digital calendar and event updates" },
                        { icon: Utensils, text: "Daily meal menus and dietary info" },
                        { icon: FileCheck, text: "Digital forms and documents" },
                        { icon: Timer, text: "Check-in/out times and attendance" },
                        { icon: Heart, text: "Mood and behavior updates" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 text-pink-500" />
                          <span className="text-sm">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">Industry Impact (2024 Data)</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-2xl font-bold text-indigo-600">80%</p>
                          <p className="text-gray-600 dark:text-gray-400">Centers using management software</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">67%</p>
                          <p className="text-gray-600 dark:text-gray-400">Report being at capacity</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-pink-600">4.9/5</p>
                          <p className="text-gray-600 dark:text-gray-400">Parent app rating</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">3x</p>
                          <p className="text-gray-600 dark:text-gray-400">More likely to choose transparent centers</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Waitlist Tab */}
            <TabsContent value="waitlist" className="space-y-6">
              <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <ListOrdered className="h-6 w-6 text-orange-600" />
                    Digital Waitlist Management
                  </CardTitle>
                  <CardDescription>
                    Solving the waitlist crisis with transparency and automation
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="font-semibold">The Waitlist Crisis</p>
                      <p className="text-sm mt-1">Average waitlist length increased 28% (185 to 236 children) from 2020-2023. Some parents report being #451 on waitlists.</p>
                    </div>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        For Parents
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium">Join Multiple Waitlists</p>
                            <p className="text-gray-600 dark:text-gray-400">Track your position across multiple centers in one dashboard</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium">Real-Time Updates</p>
                            <p className="text-gray-600 dark:text-gray-400">Get notified immediately when spots open up</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium">Estimated Wait Times</p>
                            <p className="text-gray-600 dark:text-gray-400">AI-powered predictions based on historical data</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Building className="h-5 w-5 text-purple-500" />
                        For Providers
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium">Automated Management</p>
                            <p className="text-gray-600 dark:text-gray-400">70% reduction in administrative burden</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium">Fair Queue System</p>
                            <p className="text-gray-600 dark:text-gray-400">Transparent, first-come-first-served with priority rules</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium">Instant Communication</p>
                            <p className="text-gray-600 dark:text-gray-400">One-click offers with 48-hour response windows</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Sample Waitlist Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                          <span className="text-sm">Sunshine Daycare</span>
                          <Badge className="bg-green-100 text-green-700">Position: 3</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                          <span className="text-sm">Little Learners Academy</span>
                          <Badge className="bg-yellow-100 text-yellow-700">Position: 12</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                          <span className="text-sm">Rainbow Preschool</span>
                          <Badge className="bg-orange-100 text-orange-700">Position: 28</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Providers Tab */}
            <TabsContent value="providers">
              <ProviderDashboard />
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              <Card className="border-teal-200 dark:border-teal-800">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-teal-600" />
                    Parent Resources & Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <DollarSign className="h-6 w-6 text-green-500 mb-2" />
                        <h4 className="font-semibold">Cost Calculator</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">
                          Estimate your monthly childcare costs including hidden fees
                        </p>
                        <Button size="sm" variant="outline">Calculate Costs</Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <CreditCard className="h-6 w-6 text-blue-500 mb-2" />
                        <h4 className="font-semibold">Subsidy Eligibility</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">
                          Check if you qualify for childcare assistance programs
                        </p>
                        <Button size="sm" variant="outline">Check Eligibility</Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <ClipboardCheck className="h-6 w-6 text-purple-500 mb-2" />
                        <h4 className="font-semibold">Visit Checklist</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">
                          Questions to ask when touring childcare centers
                        </p>
                        <Button size="sm" variant="outline">Get Checklist</Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <Shield className="h-6 w-6 text-red-500 mb-2" />
                        <h4 className="font-semibold">Safety Guide</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">
                          Understanding licensing, ratios, and safety standards
                        </p>
                        <Button size="sm" variant="outline">Learn More</Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Quick Facts from Research</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span>Annual childcare costs range from $4,810 to $15,417, consuming up to 19.3% of median family income</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-orange-500 mt-0.5" />
                        <span>Over 50% of US children live in "childcare deserts" without enough licensed care</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-purple-500 mt-0.5" />
                        <span>The childcare industry is short 60,000 teachers nationwide with median wage of $12/hour</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-red-500 mt-0.5" />
                        <span>Texas alone loses $9.39 billion annually due to insufficient childcare</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}