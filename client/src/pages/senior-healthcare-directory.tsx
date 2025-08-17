import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/NavigationHeader";
import HospitalCarousel from "@/components/HospitalCarousel";
import { CareServiceCard } from "@/components/CareServiceCard";
import { 
  Stethoscope, Home, Activity, Users, Heart, Brain, Shield, Monitor,
  Pill, ChevronRight, CheckCircle, MapPin, Clock, Phone, Star,
  Zap, HeartHandshake, UserCheck, Calendar, AlertCircle, Search
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

interface HealthcareService {
  id: number;
  name: string;
  category: string;
  description: string;
  providerCount: number;
  verified: boolean;
  icon: any;
  link: string;
  color: string;
  badge?: string;
}

export default function SeniorHealthcareDirectory() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filteredResultsCount, setFilteredResultsCount] = useState(0);

  // Fetch care services data
  const { data: careServicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/care-services'],
  });

  const { data: careServicesAnalytics } = useQuery({
    queryKey: ['/api/care-services/analytics/summary'],
  });

  // Fetch hospitals data
  const { data: hospitalsData, isLoading: hospitalsLoading } = useQuery({
    queryKey: ['/api/hospitals'],
  });

  const services = (careServicesData as any)?.services || [];
  const hospitals = (hospitalsData as any)?.hospitals || [];

  const healthcareServices: HealthcareService[] = [
    {
      id: 1,
      name: "Hospital Services",
      category: "Medical Centers",
      description: "6,000+ CMS verified hospitals",
      providerCount: 6000,
      verified: true,
      icon: Stethoscope,
      link: "/hospitals",
      color: "from-blue-500 to-cyan-500",
      badge: "CMS RATED"
    },
    {
      id: 2,
      name: "Home Care Services",
      category: "In-Home Care",
      description: "Licensed caregivers for in-home support",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Home Care').length || 850,
      verified: true,
      icon: Home,
      link: "/home-care",
      color: "from-green-500 to-emerald-500",
      badge: "24/7"
    },
    {
      id: 3,
      name: "Therapy Services",
      category: "Rehabilitation",
      description: "Physical, occupational, and speech therapy",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Therapy Services').length || 450,
      verified: true,
      icon: Activity,
      link: "/therapy-services",
      color: "from-purple-500 to-indigo-500",
      badge: "PT/OT/SPEECH"
    },
    {
      id: 4,
      name: "Companion Care",
      category: "Social Support",
      description: "Social companionship and daily activities",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Companion Care').length || 320,
      verified: true,
      icon: Users,
      link: "/companion-care",
      color: "from-pink-500 to-rose-500"
    },
    {
      id: 5,
      name: "Personal Care",
      category: "ADL Support",
      description: "Assistance with daily living activities",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Personal Care').length || 280,
      verified: true,
      icon: Heart,
      link: "/personal-care",
      color: "from-red-500 to-orange-500"
    },
    {
      id: 6,
      name: "Memory Care",
      category: "Dementia Support",
      description: "Specialized dementia and Alzheimer's care",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Memory Care').length || 200,
      verified: true,
      icon: Brain,
      link: "/memory-care",
      color: "from-indigo-500 to-purple-500",
      badge: "SPECIALIZED"
    },
    {
      id: 7,
      name: "Hospice Care",
      category: "End-of-Life Care",
      description: "Compassionate end-of-life support",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Hospice').length || 150,
      verified: true,
      icon: HeartHandshake,
      link: "/hospice-care",
      color: "from-teal-500 to-cyan-500"
    },
    {
      id: 8,
      name: "Medical Equipment",
      category: "DME Providers",
      description: "Durable medical equipment and supplies",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Medical Equipment').length || 175,
      verified: true,
      icon: Monitor,
      link: "/medical-equipment",
      color: "from-gray-500 to-slate-500"
    },
    {
      id: 9,
      name: "Nursing Services",
      category: "Skilled Nursing",
      description: "RN and LPN skilled nursing care",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Nursing').length || 225,
      verified: true,
      icon: UserCheck,
      link: "/nursing-services",
      color: "from-blue-600 to-indigo-600",
      badge: "RN/LPN"
    }
  ];

  // Calculate total providers
  const totalProviders = (careServicesAnalytics as any)?.totalServices || 
    healthcareServices.reduce((sum, service) => sum + service.providerCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Page Header */}
      <section className="px-4 py-12 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Senior Healthcare Services Directory
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Connect with {totalProviders?.toLocaleString() || '4,210'}+ verified healthcare and caregiving services in your area
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Stethoscope className="h-8 w-8 text-white mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">6,000+</div>
                  <div className="text-sm text-blue-100">Hospitals</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Home className="h-8 w-8 text-white mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {(careServicesAnalytics as any)?.homeCare || '850+'}
                  </div>
                  <div className="text-sm text-blue-100">Home Care</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-white mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-sm text-blue-100">Verified</div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Button */}
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-xl"
              onClick={() => setLocation('/care-guide')}
            >
              <Zap className="mr-2 h-5 w-5" />
              Browse Care Guide
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Interface */}
      <section className="px-4 py-8 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-lg border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Search Healthcare Services
              </h2>
              
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search hospitals, care services, providers..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <Button 
                    onClick={() => setSearchQuery(searchQuery)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                {/* Filter Options */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Services</option>
                    <option value="hospitals">Hospitals</option>
                    <option value="home-care">Home Care Services</option>
                    <option value="therapy">Therapy Services</option>
                    <option value="adult-day">Adult Day Care</option>
                    <option value="personal-care">Personal Care</option>
                    <option value="hospice">Hospice Care</option>
                  </select>

                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Locations</option>
                    <option value="nearby">Near Me</option>
                    <option value="city">By City</option>
                    <option value="state">By State</option>
                    <option value="zipcode">By ZIP Code</option>
                  </select>

                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                  </select>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Types</option>
                    <option value="emergency">Emergency Services</option>
                    <option value="24-7">24/7 Available</option>
                    <option value="non-profit">Non-Profit</option>
                    <option value="government">Government</option>
                  </select>
                </div>

                {/* Active Filters Display */}
                {(searchQuery || filterCategory || filterLocation || filterRating || filterType) && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {searchQuery && (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Search: {searchQuery}
                        <button
                          onClick={() => setSearchQuery('')}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {filterCategory && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Category: {filterCategory}
                        <button
                          onClick={() => setFilterCategory('')}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {filterLocation && (
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        Location: {filterLocation}
                        <button
                          onClick={() => setFilterLocation('')}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {filterRating && (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Rating: {filterRating}+ Stars
                        <button
                          onClick={() => setFilterRating('')}
                          className="ml-2 text-yellow-600 hover:text-yellow-800"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {filterType && (
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        Type: {filterType}
                        <button
                          onClick={() => setFilterType('')}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('');
                        setFilterCategory('');
                        setFilterLocation('');
                        setFilterRating('');
                        setFilterType('');
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Clear All
                    </Button>
                  </div>
                )}

                {/* Results Summary */}
                <div className="text-sm text-gray-600 dark:text-gray-400 pt-2">
                  Showing {filteredResultsCount || 'all'} results
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Healthcare Services Tabs and Sliders - Moved to Top */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Healthcare Service Categories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Find the right healthcare providers for your needs
            </p>
          </div>

          {/* 1. Hospitals Tab and Slider */}
          <div className="mb-8">
            {/* Hospital Tab */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Hospital Services</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">6,000+ CMS verified hospitals</p>
                  </div>
                </div>
                <div className="hidden sm:block flex-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Teaching hospitals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Trauma centers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Emergency services</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Quality ratings</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">6,000+</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Hospitals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">CMS</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Verified</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hospital Directory Slider */}
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
              <HospitalCarousel />
            </div>
          </div>

          {/* 2. Home Care Services Tab and Slider */}
          {(() => {
            const services = (careServicesData as any)?.services || [];
            const homeCareCount = services.filter((s: any) => s.serviceCategory === 'Home Care Services').length;
            
            return (
              <div className="mb-8">
                {/* Home Care Tab */}
                <div className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Home className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Home Care Services</h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">Professional in-home support and care</p>
                      </div>
                    </div>
                    <div className="hidden sm:block flex-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-700 dark:text-green-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">24/7 availability</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-700 dark:text-green-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Licensed caregivers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-700 dark:text-green-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Personal care assistance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-700 dark:text-green-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Medication management</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{homeCareCount}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-green-700 dark:text-green-300" />
                    </div>
                  </div>
                </div>

                {/* Home Care Services Slider */}
                {(() => {
                  const homeCareServices = services.filter((s: any) => s.serviceCategory === 'Home Care Services');
                  
                  if (homeCareServices.length > 0 && (!selectedCategory || selectedCategory === 'Home Care Services')) {
                    return (
                      <section className="px-4 py-4 relative overflow-hidden">
                        <div className="absolute inset-0 z-0">
                          <div className="w-full h-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-green-100/30 via-emerald-100/20 to-teal-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
                        </div>
                        
                        <div className="relative z-10">
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Professional care in the comfort of your home • Licensed & insured providers</p>
                          
                          <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                            {homeCareServices.slice(0, 20).map((service: any, index: number) => {
                              return (
                                <CareServiceCard
                                  key={service.id || index}
                                  service={service}
                                  index={index}
                                  borderColor="border-green-200 dark:border-gray-700"
                                  hoverBorderColor="hover:border-green-300 dark:hover:border-gray-600"
                                  iconBgColor="bg-gradient-to-br from-green-500 to-green-600"
                                  iconRingColor="ring-green-100 dark:ring-green-900"
                                  icon={<Home className="w-8 h-8 text-white" />}
                                  categoryBadgeColor="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800"
                                  categoryBadgeBorder="border-green-300 dark:border-green-600"
                                  categoryLabel="Home Care"
                                  buttonColor="bg-gradient-to-r from-green-500 to-green-600"
                                  buttonHoverColor="hover:from-green-600 hover:to-green-700"
                                />
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          })()}

          {/* 3. Therapy Services Tab and Slider */}
          {(() => {
            const services = (careServicesData as any)?.services || [];
            const therapyCount = services.filter((s: any) => s.serviceCategory === 'Therapy Services').length;
            
            return (
              <div className="mb-8">
                {/* Therapy Tab */}
                <div
                  className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4"
                  onClick={() => setSelectedCategory('Therapy Services')}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Activity className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Therapy Services</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Physical, occupational, and speech therapy</p>
                      </div>
                    </div>
                    <div className="hidden sm:block flex-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Physical therapy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Occupational therapy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Speech therapy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">In-home sessions available</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{therapyCount}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-purple-700 dark:text-purple-300" />
                    </div>
                  </div>
                </div>

                {/* Therapy Services Slider */}
                {(() => {
                  const therapyServices = services.filter((s: any) => s.serviceCategory === 'Therapy Services');
                  
                  if (therapyServices.length > 0 && (!selectedCategory || selectedCategory === 'Therapy Services')) {
                    return (
                      <section className="px-4 py-4 relative overflow-hidden">
                        <div className="absolute inset-0 z-0">
                          <div className="w-full h-full bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 via-pink-100/20 to-fuchsia-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
                        </div>
                        
                        <div className="relative z-10">
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Specialized therapy services to improve mobility & independence • Medicare certified</p>
                          
                          <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                            {therapyServices.slice(0, 20).map((service: any, index: number) => {
                              return (
                                <CareServiceCard
                                  key={service.id || index}
                                  service={service}
                                  index={index}
                                  borderColor="border-purple-200 dark:border-gray-700"
                                  hoverBorderColor="hover:border-purple-300 dark:hover:border-gray-600"
                                  iconBgColor="bg-gradient-to-br from-purple-500 to-purple-600"
                                  iconRingColor="ring-purple-100 dark:ring-purple-900"
                                  icon={<Activity className="w-8 h-8 text-white" />}
                                  categoryBadgeColor="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800"
                                  categoryBadgeBorder="border-purple-300 dark:border-purple-600"
                                  categoryLabel="Therapy Services"
                                  buttonColor="bg-gradient-to-r from-purple-500 to-purple-600"
                                  buttonHoverColor="hover:from-purple-600 hover:to-purple-700"
                                />
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          })()}

          {/* 4. Adult Day Care Tab and Slider */}
          {(() => {
            const services = (careServicesData as any)?.services || [];
            const adultDayCareCount = services.filter((s: any) => s.serviceCategory === 'Adult Day Care').length;
            
            return (
              <div className="mb-8">
                {/* Adult Day Care Tab */}
                <div
                  className="bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4"
                  onClick={() => setSelectedCategory('Adult Day Care')}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Adult Day Care</h4>
                        <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">Daytime programs for social engagement and activities</p>
                      </div>
                    </div>
                    <div className="hidden sm:block flex-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Social activities</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Nutritious meals</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Exercise programs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Transportation available</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{adultDayCareCount}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Centers</div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-teal-700 dark:text-teal-300" />
                    </div>
                  </div>
                </div>

                {/* Adult Day Care Slider */}
                {(() => {
                  const adultDayCareServices = services.filter((s: any) => s.serviceCategory === 'Adult Day Care');
                  
                  if (adultDayCareServices.length > 0 && (!selectedCategory || selectedCategory === 'Adult Day Care')) {
                    return (
                      <section className="px-4 py-4 relative overflow-hidden">
                        <div className="absolute inset-0 z-0">
                          <div className="w-full h-full bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-100/30 via-cyan-100/20 to-sky-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
                        </div>
                        
                        <div className="relative z-10">
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Safe daytime care with engaging activities • Respite for caregivers</p>
                          
                          <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                            {adultDayCareServices.slice(0, 20).map((service: any, index: number) => {
                              return (
                                <CareServiceCard
                                  key={service.id || index}
                                  service={service}
                                  index={index}
                                  borderColor="border-teal-200 dark:border-gray-700"
                                  hoverBorderColor="hover:border-teal-300 dark:hover:border-gray-600"
                                  iconBgColor="bg-gradient-to-br from-teal-500 to-teal-600"
                                  iconRingColor="ring-teal-100 dark:ring-teal-900"
                                  icon={<Users className="w-8 h-8 text-white" />}
                                  categoryBadgeColor="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900 dark:to-teal-800"
                                  categoryBadgeBorder="border-teal-300 dark:border-teal-600"
                                  categoryLabel="Adult Day Care"
                                  buttonColor="bg-gradient-to-r from-teal-500 to-teal-600"
                                  buttonHoverColor="hover:from-teal-600 hover:to-teal-700"
                                />
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          })()}

          {/* 5. Personal Care Services Tab and Slider */}
          {(() => {
            const services = (careServicesData as any)?.services || [];
            const personalCareCount = services.filter((s: any) => s.serviceCategory === 'Personal Care Services').length;
            
            return (
              <div className="mb-8">
                {/* Personal Care Tab */}
                <div
                  className="bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4"
                  onClick={() => setSelectedCategory('Personal Care Services')}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Heart className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Personal Care Services</h4>
                        <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">Assistance with daily living activities</p>
                      </div>
                    </div>
                    <div className="hidden sm:block flex-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-rose-700 dark:text-rose-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Bathing assistance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-rose-700 dark:text-rose-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Dressing support</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-rose-700 dark:text-rose-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Grooming help</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-rose-700 dark:text-rose-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Mobility assistance</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{personalCareCount}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-rose-700 dark:text-rose-300" />
                    </div>
                  </div>
                </div>

                {/* Personal Care Services Slider */}
                {(() => {
                  const personalCareServices = services.filter((s: any) => s.serviceCategory === 'Personal Care Services');
                  
                  if (personalCareServices.length > 0 && (!selectedCategory || selectedCategory === 'Personal Care Services')) {
                    return (
                      <section className="px-4 py-4 relative overflow-hidden">
                        <div className="absolute inset-0 z-0">
                          <div className="w-full h-full bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-rose-100/30 via-pink-100/20 to-red-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
                        </div>
                        
                        <div className="relative z-10">
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Compassionate support for daily activities • Preserving dignity & independence</p>
                          
                          <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                            {personalCareServices.slice(0, 20).map((service: any, index: number) => {
                              return (
                                <CareServiceCard
                                  key={service.id || index}
                                  service={service}
                                  index={index}
                                  borderColor="border-rose-200 dark:border-gray-700"
                                  hoverBorderColor="hover:border-rose-300 dark:hover:border-gray-600"
                                  iconBgColor="bg-gradient-to-br from-rose-500 to-rose-600"
                                  iconRingColor="ring-rose-100 dark:ring-rose-900"
                                  icon={<Heart className="w-8 h-8 text-white" />}
                                  categoryBadgeColor="bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900 dark:to-rose-800"
                                  categoryBadgeBorder="border-rose-300 dark:border-rose-600"
                                  categoryLabel="Personal Care"
                                  buttonColor="bg-gradient-to-r from-rose-500 to-rose-600"
                                  buttonHoverColor="hover:from-rose-600 hover:to-rose-700"
                                />
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          })()}

          {/* 6. Hospice Care Tab and Slider */}
          {(() => {
            const services = (careServicesData as any)?.services || [];
            const hospiceCount = services.filter((s: any) => s.serviceCategory === 'Hospice Care').length;
            
            return (
              <div className="mb-8">
                {/* Hospice Care Tab */}
                <div
                  className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4"
                  onClick={() => setSelectedCategory('Hospice Care')}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <HeartHandshake className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Hospice Care</h4>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Compassionate end-of-life support</p>
                      </div>
                    </div>
                    <div className="hidden sm:block flex-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-indigo-700 dark:text-indigo-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">24/7 support</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-indigo-700 dark:text-indigo-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Pain management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-indigo-700 dark:text-indigo-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Family counseling</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-indigo-700 dark:text-indigo-300" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Spiritual support</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{hospiceCount}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-indigo-700 dark:text-indigo-300" />
                    </div>
                  </div>
                </div>

                {/* Hospice Care Slider */}
                {(() => {
                  const hospiceServices = services.filter((s: any) => s.serviceCategory === 'Hospice Care');
                  
                  if (hospiceServices.length > 0 && (!selectedCategory || selectedCategory === 'Hospice Care')) {
                    return (
                      <section className="px-4 py-4 relative overflow-hidden">
                        <div className="absolute inset-0 z-0">
                          <div className="w-full h-full bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/30 via-blue-100/20 to-purple-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
                        </div>
                        
                        <div className="relative z-10">
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Comprehensive comfort care with dignity • Medicare certified providers</p>
                          
                          <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                            {hospiceServices.slice(0, 20).map((service: any, index: number) => {
                              return (
                                <CareServiceCard
                                  key={service.id || index}
                                  service={service}
                                  index={index}
                                  borderColor="border-indigo-200 dark:border-gray-700"
                                  hoverBorderColor="hover:border-indigo-300 dark:hover:border-gray-600"
                                  iconBgColor="bg-gradient-to-br from-indigo-500 to-indigo-600"
                                  iconRingColor="ring-indigo-100 dark:ring-indigo-900"
                                  icon={<HeartHandshake className="w-8 h-8 text-white" />}
                                  categoryBadgeColor="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800"
                                  categoryBadgeBorder="border-indigo-300 dark:border-indigo-600"
                                  categoryLabel="Hospice Care"
                                  buttonColor="bg-gradient-to-r from-indigo-500 to-indigo-600"
                                  buttonHoverColor="hover:from-indigo-600 hover:to-indigo-700"
                                />
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          })()}
        </div>
      </section>

      {/* Featured Healthcare Providers - Real Links Section */}
      <section className="px-4 py-12 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Featured Healthcare Providers
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Click to explore detailed information about top healthcare systems
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mayo Clinic Card with Real Link */}
            <Link href="/providers/mayo-clinic">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-400">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-5"></div>
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-blue-500 text-white">TOP RANKED</Badge>
                  <CardTitle className="text-xl">Mayo Clinic</CardTitle>
                  <CardDescription>World-renowned medical care</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>Rochester, Phoenix, Jacksonville</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>507-284-2511</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>5.0 Rating • 4,500+ Physicians</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="default">
                    View Full Profile →
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Cleveland Clinic Card with Real Link */}
            <Link href="/providers/cleveland-clinic">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-green-400">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500 opacity-5"></div>
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-green-500 text-white">HEART LEADER</Badge>
                  <CardTitle className="text-xl">Cleveland Clinic</CardTitle>
                  <CardDescription>World-class healthcare innovation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>Cleveland, Weston, Las Vegas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>216-444-2200</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>5.0 Rating • #2 US Hospital</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="default">
                    View Full Profile →
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Johns Hopkins Card - Coming Soon */}
            <Card className="h-full opacity-75 border-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-5"></div>
              <CardHeader>
                <Badge className="w-fit mb-2" variant="secondary">COMING SOON</Badge>
                <CardTitle className="text-xl">Johns Hopkins Medicine</CardTitle>
                <CardDescription>Leading medical research center</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>Baltimore, Washington DC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>410-955-5000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>5.0 Rating • Research Pioneer</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline" disabled>
                  Profile Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Access Buttons */}
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

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need Help Finding the Right Care?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Our AI-powered matching system can help you find the perfect healthcare providers
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-xl"
              onClick={() => setLocation('/ai-matching-assistant')}
            >
              <Brain className="mr-2 h-5 w-5" />
              Get Personalized Matches
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/20"
              onClick={() => setLocation('/contact')}
            >
              <Phone className="mr-2 h-5 w-5" />
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}