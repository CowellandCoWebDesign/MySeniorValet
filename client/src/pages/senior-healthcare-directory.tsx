import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/NavigationHeader";
import HospitalCarousel from "@/components/HospitalCarousel";
import { CareServiceCard } from "@/components/CareServiceCard";
import { CareServices3DCarousel } from "@/components/CareServices3DCarousel";
import { 
  Stethoscope, Home, Activity, Users, Heart, Brain, Shield, Monitor,
  Pill, ChevronRight, CheckCircle, MapPin, Clock, Phone, Star,
  Zap, HeartHandshake, UserCheck, Calendar, AlertCircle, Search,
  Car, Apple, Eye, Ear, Footprints, TestTube, BedDouble, Palette,
  Smile, Package, Filter, Video, BrainCircuit, DollarSign, Sun, Moon, Info
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

  // Fetch care services data - get ALL services without limit for proper categorization
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
  
  // Categorize real services for display
  const homeHealthServices = services.filter((s: any) => 
    s.serviceCategory === 'Home Care Services' || 
    s.name?.toLowerCase().includes('home health') ||
    s.name?.toLowerCase().includes('home care')
  );
  
  const therapyServices = services.filter((s: any) => 
    s.serviceCategory === 'Therapy Services' ||
    s.name?.toLowerCase().includes('therapy') ||
    s.name?.toLowerCase().includes('rehabilitation')
  );
  
  const adultDayCareServices = services.filter((s: any) => 
    s.serviceCategory === 'Adult Day Programs' ||
    s.name?.toLowerCase().includes('adult day')
  );
  
  const hospiceServices = services.filter((s: any) => 
    s.serviceCategory === 'Hospice Care' ||
    s.name?.toLowerCase().includes('hospice')
  );
  
  const respiteServices = services.filter((s: any) => 
    s.serviceCategory === 'Respite Care' ||
    s.name?.toLowerCase().includes('respite')
  );
  
  const personalCareServices = services.filter((s: any) => 
    s.serviceCategory === 'Personal Care Services' ||
    s.name?.toLowerCase().includes('personal care')
  );
  
  // Additional service categorization for all healthcare types
  const companionCareServices = services.filter((s: any) => 
    s.serviceCategory === 'Companion Care' ||
    s.name?.toLowerCase().includes('companion')
  );
  
  const palliativeCareServices = services.filter((s: any) => 
    s.serviceCategory === 'Palliative Care' ||
    s.name?.toLowerCase().includes('palliative')
  );
  
  const skilledNursingServices = services.filter((s: any) => 
    s.serviceCategory === 'Skilled Nursing' ||
    s.name?.toLowerCase().includes('skilled nursing')
  );
  
  const transportServices = services.filter((s: any) => 
    s.serviceCategory === 'Transport Services' ||
    s.name?.toLowerCase().includes('transport') ||
    s.name?.toLowerCase().includes('shuttle')
  );
  
  const nutritionServices = services.filter((s: any) => 
    s.serviceCategory === 'Nutrition Services' ||
    s.name?.toLowerCase().includes('nutrition') ||
    s.name?.toLowerCase().includes('meal')
  );
  
  const dentalServices = services.filter((s: any) => 
    s.serviceCategory === 'Dental Services' ||
    s.name?.toLowerCase().includes('dental')
  );
  
  const visionServices = services.filter((s: any) => 
    s.serviceCategory === 'Vision Services' ||
    s.name?.toLowerCase().includes('vision') ||
    s.name?.toLowerCase().includes('eye')
  );
  
  const hearingServices = services.filter((s: any) => 
    s.serviceCategory === 'Hearing Services' ||
    s.name?.toLowerCase().includes('hearing')
  );
  
  const podiatryServices = services.filter((s: any) => 
    s.serviceCategory === 'Podiatry Services' ||
    s.name?.toLowerCase().includes('podiatry') ||
    s.name?.toLowerCase().includes('foot')
  );
  
  const pharmacyServices = services.filter((s: any) => 
    s.serviceCategory === 'Pharmacy Services' ||
    s.name?.toLowerCase().includes('pharmacy')
  );

  const healthcareServices: HealthcareService[] = [
    {
      id: 1,
      name: "Hospital Services",
      category: "Medical Centers",
      description: "1,956 CMS verified hospitals",
      providerCount: 1956,
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
      providerCount: services.filter((s: any) => s.serviceCategory === 'Home Care Services').length,
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
      providerCount: services.filter((s: any) => s.serviceCategory === 'Therapy Services').length,
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
      providerCount: services.filter((s: any) => s.serviceCategory === 'Companion Care').length,
      verified: services.filter((s: any) => s.serviceCategory === 'Companion Care').length > 0,
      icon: Users,
      link: "/companion-care",
      color: "from-pink-500 to-rose-500"
    },
    {
      id: 5,
      name: "Personal Care",
      category: "ADL Support",
      description: "Assistance with daily living activities",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Personal Care Services').length,
      verified: true,
      icon: Heart,
      link: "/personal-care",
      color: "from-red-500 to-orange-500"
    },
    {
      id: 6,
      name: "Hospice Care",
      category: "End-of-Life Care",
      description: "Compassionate end-of-life support",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Hospice Care').length,
      verified: true,
      icon: HeartHandshake,
      link: "/hospice-care",
      color: "from-teal-500 to-cyan-500"
    },
    {
      id: 7,
      name: "Medical Equipment",
      category: "DME Providers",
      description: "Durable medical equipment and supplies",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Medical Equipment').length,
      verified: services.filter((s: any) => s.serviceCategory === 'Medical Equipment').length > 0,
      icon: Monitor,
      link: "/medical-equipment",
      color: "from-gray-500 to-slate-500"
    },
    {
      id: 8,
      name: "Nursing Services",
      category: "Skilled Nursing",
      description: "RN and LPN skilled nursing care",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Nursing').length,
      verified: services.filter((s: any) => s.serviceCategory === 'Nursing').length > 0,
      icon: UserCheck,
      link: "/nursing-services",
      color: "from-blue-600 to-indigo-600",
      badge: "RN/LPN"
    },
    {
      id: 9,
      name: "Adult Day Programs",
      category: "Day Programs",
      description: "Daytime care and social activities",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Adult Day Programs').length,
      verified: true,
      icon: Zap,
      link: "/adult-day-programs",
      color: "from-yellow-500 to-orange-500",
      badge: "DAY PROGRAMS"
    },
    {
      id: 10,
      name: "Respite Care",
      category: "Temporary Relief",
      description: "Short-term care for caregiver relief",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Respite Care').length,
      verified: true,
      icon: BedDouble,
      link: "/respite-care",
      color: "from-indigo-500 to-purple-500"
    },
    {
      id: 11,
      name: "Palliative Care",
      category: "Comfort Care",
      description: "Specialized medical care for serious illness",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Palliative Care').length,
      verified: services.filter((s: any) => s.serviceCategory === 'Palliative Care').length > 0,
      icon: Palette,
      link: "/palliative-care",
      color: "from-purple-600 to-pink-600"
    },
    {
      id: 12,
      name: "Skilled Nursing",
      category: "Medical Care",
      description: "24/7 skilled nursing facilities",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Skilled Nursing').length,
      verified: services.filter((s: any) => s.serviceCategory === 'Skilled Nursing').length > 0,
      icon: Shield,
      link: "/skilled-nursing",
      color: "from-blue-700 to-teal-600",
      badge: "24/7 CARE"
    },
    {
      id: 13,
      name: "Transport Services",
      category: "Medical Transport",
      description: "Non-emergency medical transportation",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Transport').length,
      verified: services.filter((s: any) => s.serviceCategory === 'Transport').length > 0,
      icon: Car,
      link: "/transport-services",
      color: "from-green-600 to-teal-600"
    },
    {
      id: 14,
      name: "Nutrition Services",
      category: "Dietary Support",
      description: "Meal delivery and nutrition counseling",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Nutrition Services').length,
      verified: services.filter((s: any) => s.serviceCategory === 'Nutrition Services').length > 0,
      icon: Apple,
      link: "/nutrition-services",
      color: "from-orange-500 to-red-500"
    },
    {
      id: 15,
      name: "Dental Services",
      category: "Oral Health",
      description: "Senior-focused dental care",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Dental Services').length,
      verified: services.filter((s: any) => s.serviceCategory === 'Dental Services').length > 0,
      icon: Smile,
      link: "/dental-services",
      color: "from-cyan-500 to-blue-500"
    },
    {
      id: 16,
      name: "Vision Services",
      category: "Eye Care",
      description: "Eye exams and vision care",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Vision Services').length,
      verified: services.filter((s: any) => s.serviceCategory === 'Vision Services').length > 0,
      icon: Eye,
      link: "/vision-services",
      color: "from-violet-500 to-purple-500"
    },
    {
      id: 17,
      name: "Hearing Services",
      category: "Audiology",
      description: "Hearing tests and hearing aids",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Hearing Services').length,
      verified: services.filter((s: any) => s.serviceCategory === 'Hearing Services').length > 0,
      icon: Ear,
      link: "/hearing-services",
      color: "from-pink-600 to-red-600"
    },
    {
      id: 18,
      name: "Podiatry Services",
      category: "Foot Care",
      description: "Specialized foot and ankle care",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Podiatry').length,
      verified: services.filter((s: any) => s.serviceCategory === 'Podiatry').length > 0,
      icon: Footprints,
      link: "/podiatry",
      color: "from-emerald-500 to-green-600"
    },
    {
      id: 19,
      name: "Pharmacy Services",
      category: "Medications",
      description: "Medication management and delivery",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Pharmacy').length,
      verified: services.filter((s: any) => s.serviceCategory === 'Pharmacy').length > 0,
      icon: Pill,
      link: "/pharmacy-services",
      color: "from-red-600 to-pink-600"
    },
    {
      id: 20,
      name: "Home Health",
      category: "Medical at Home",
      description: "Medicare-certified home health agencies",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Home Health').length,
      verified: services.filter((s: any) => s.serviceCategory === 'Home Health').length > 0,
      icon: Home,
      link: "/home-health",
      color: "from-teal-600 to-cyan-600",
      badge: "MEDICARE"
    },
    {
      id: 21,
      name: "Diagnostic Services",
      category: "Testing & Labs",
      description: "Lab tests and diagnostic imaging",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Diagnostic').length,
      verified: services.filter((s: any) => s.serviceCategory === 'Diagnostic').length > 0,
      icon: TestTube,
      link: "/diagnostic-services",
      color: "from-gray-600 to-blue-600"
    },
    {
      id: 22,
      name: "Telemedicine",
      category: "Virtual Care",
      description: "Virtual consultations with healthcare providers",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Telemedicine').length,
      verified: services.filter((s: any) => s.serviceCategory === 'Telemedicine').length > 0,
      icon: Video,
      link: "/telemedicine",
      color: "from-violet-600 to-indigo-600",
      badge: "VIRTUAL"
    },
    {
      id: 23,
      name: "Mental Health",
      category: "Behavioral Health",
      description: "Counseling & therapy services",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Mental Health').length,
      verified: services.filter((s: any) => s.serviceCategory === 'Mental Health').length > 0,
      icon: BrainCircuit,
      link: "/mental-health",
      color: "from-emerald-600 to-teal-600"
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
                  <div className="text-2xl font-bold text-white">1,956</div>
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

      {/* 3D Care Services Carousel - Showcasing 23 Government-Verified Care Levels */}
      <CareServices3DCarousel />

      {/* Detailed Care Spectrum Sections with Government Research & Citations */}
      <section className="px-4 py-12 bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Complete Healthcare Services Spectrum
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive guide to all healthcare services with 2025 Medicare coverage, eligibility requirements, and authoritative government sources
            </p>
          </div>

          {/* Medicare Home Health Services */}
          <Card className="mb-8 shadow-lg border-2 border-teal-200 dark:border-teal-800">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Home className="h-6 w-6" />
                Medicare Home Health Services
              </CardTitle>
              <CardDescription className="text-teal-100">
                Skilled care in your home with specific eligibility requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Eligibility Requirements (2025)
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600">•</span>
                      <span><strong>Homebound Status:</strong> Must be unable to leave home without considerable effort</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600">•</span>
                      <span><strong>Doctor Certification:</strong> Physician must certify need and create care plan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600">•</span>
                      <span><strong>Skilled Care Need:</strong> Requires skilled nursing or therapy services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600">•</span>
                      <span><strong>Intermittent Care:</strong> Part-time or intermittent care (less than 7 days/week)</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Coverage & Costs
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>100% Coverage:</strong> No copay for approved services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>Part B Deductible:</strong> $257 for 2025</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>Services Covered:</strong> Nursing, PT, OT, speech therapy, aide services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>Medical Equipment:</strong> 80% coverage for DME</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Source:</strong> Medicare.gov Home Health Services Guide 2025 | CMS.gov Medicare Benefits Policy Manual Chapter 7
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Adult Day Services */}
          <Card className="mb-8 shadow-lg border-2 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sun className="h-6 w-6" />
                Adult Day Services & PACE Programs
              </CardTitle>
              <CardDescription className="text-yellow-100">
                Daytime care with social activities and health services
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    Medicaid HCBS Waiver Coverage
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span><strong>Income Limit:</strong> $2,901/month (2025 Federal Poverty Level)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span><strong>Asset Limit:</strong> $2,000 individual / $3,000 couple</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span><strong>Functional Need:</strong> Require nursing home level of care</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span><strong>State Programs:</strong> Varies by state waiver availability</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    PACE Program Benefits
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>All-Inclusive Care:</strong> Medical, social, and daily services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>Transportation:</strong> To/from center and medical appointments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>Meals:</strong> Nutritious meals and snacks provided</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>260K+ Enrolled:</strong> Nationwide PACE participants</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Source:</strong> National PACE Association 2025 | Medicaid.gov HCBS Waiver Programs | ACL National Adult Day Services Association
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Palliative vs Hospice Care */}
          <Card className="mb-8 shadow-lg border-2 border-purple-200 dark:border-purple-800">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <HeartHandshake className="h-6 w-6" />
                Palliative Care vs. Hospice Care
              </CardTitle>
              <CardDescription className="text-purple-100">
                Understanding the critical differences in comfort care options
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Palette className="h-5 w-5 text-purple-600" />
                    Palliative Care (No Time Limit)
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span><strong>Any Stage:</strong> Available at any illness stage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span><strong>With Treatment:</strong> Concurrent with curative care</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span><strong>Medicare Part B:</strong> Covered as medical treatment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span><strong>Focus:</strong> Symptom management & quality of life</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Moon className="h-5 w-5 text-teal-600" />
                    Hospice Care (6-Month Prognosis)
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600">•</span>
                      <span><strong>Terminal:</strong> 6-month life expectancy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600">•</span>
                      <span><strong>Comfort Only:</strong> No curative treatments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600">•</span>
                      <span><strong>Medicare Hospice:</strong> Comprehensive benefit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600">•</span>
                      <span><strong>$0 Cost:</strong> No deductibles or copays</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Source:</strong> Center to Advance Palliative Care 2025 | Medicare.gov Hospice Compare | National Hospice and Palliative Care Organization
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Skilled Nursing Facilities */}
          <Card className="mb-8 shadow-lg border-2 border-blue-200 dark:border-blue-800">
            <CardHeader className="bg-gradient-to-r from-blue-700 to-teal-600 text-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Skilled Nursing Facility (SNF) Coverage
              </CardTitle>
              <CardDescription className="text-blue-100">
                Post-hospital rehabilitation and 24/7 nursing care
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Medicare Part A Coverage (2025)
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>Days 1-20:</strong> $0 copay (100% covered)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>Days 21-100:</strong> $212/day coinsurance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>After Day 100:</strong> Full cost responsibility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>3-Day Rule:</strong> Requires 3-day inpatient hospital stay</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    Services Included
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>Nursing:</strong> 24/7 skilled nursing care</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>Therapy:</strong> PT, OT, speech therapy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>Room & Board:</strong> Semi-private room standard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>Medications:</strong> All prescribed drugs covered</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Source:</strong> Medicare.gov SNF Coverage 2025 | CMS Nursing Home Compare | Medicare Rights Center
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Transportation Services */}
          <Card className="mb-8 shadow-lg border-2 border-green-200 dark:border-green-800">
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Car className="h-6 w-6" />
                Medical Transportation Services
              </CardTitle>
              <CardDescription className="text-green-100">
                Non-emergency medical transportation (NEMT) coverage options
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Medicaid NEMT Benefits
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span><strong>Mandatory Benefit:</strong> Required in all state Medicaid programs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span><strong>Covered Trips:</strong> Medical appointments, pharmacy, therapy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span><strong>Vehicle Types:</strong> Wheelchair vans, ambulettes, taxis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span><strong>Scheduling:</strong> 48-72 hour advance notice typical</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Medicare Coverage Gaps
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">⚠</span>
                      <span><strong>Limited Coverage:</strong> Only emergency ambulance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>Medicare Advantage:</strong> Some plans offer NEMT</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>Community Programs:</strong> Local senior shuttles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>VA Benefits:</strong> Veterans may qualify for transport</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Source:</strong> Medicaid.gov NEMT Guidelines 2025 | National Aging and Disability Transportation Center | CMS Transportation Benefits
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Specialty Care Services */}
          <Card className="mb-8 shadow-lg border-2 border-indigo-200 dark:border-indigo-800">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Eye className="h-6 w-6" />
                Specialty Healthcare Services
              </CardTitle>
              <CardDescription className="text-indigo-100">
                Vision, hearing, dental, and podiatry coverage details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-violet-600" />
                    Vision & Hearing Services
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600">•</span>
                      <span><strong>Eye Exams:</strong> Medicare Part B for diabetes/glaucoma</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600">•</span>
                      <span><strong>Cataract Surgery:</strong> 80% covered after deductible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600">•</span>
                      <span><strong>Hearing Aids:</strong> Not covered by Original Medicare</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600">•</span>
                      <span><strong>MA Plans:</strong> Some offer hearing aid benefits</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Smile className="h-5 w-5 text-sky-600" />
                    Dental & Podiatry Coverage
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">⚠</span>
                      <span><strong>Dental:</strong> Not covered except hospital procedures</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600">•</span>
                      <span><strong>MA Dental:</strong> 70% of plans offer coverage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600">•</span>
                      <span><strong>Podiatry:</strong> Covered for diabetes/medical need</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600">•</span>
                      <span><strong>Foot Exams:</strong> Annual diabetes foot exams covered</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Source:</strong> Medicare.gov Vision Services 2025 | National Eye Institute | American Podiatric Medical Association
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Telehealth Services */}
          <Card className="mb-8 shadow-lg border-2 border-violet-200 dark:border-violet-800">
            <CardHeader className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Video className="h-6 w-6" />
                Telehealth & Virtual Care Services
              </CardTitle>
              <CardDescription className="text-violet-100">
                Expanded Medicare telehealth coverage post-pandemic
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-violet-600" />
                    Medicare Telehealth Coverage
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600">•</span>
                      <span><strong>From Home:</strong> No longer requires healthcare facility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600">•</span>
                      <span><strong>Audio-Only:</strong> Phone visits for mental health</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600">•</span>
                      <span><strong>Same Cost:</strong> Same as in-person visit copays</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-600">•</span>
                      <span><strong>All Providers:</strong> Any Medicare provider can offer</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-emerald-600" />
                    Mental Health Telehealth
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>Therapy Sessions:</strong> Individual & group covered</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>Psychiatric Care:</strong> Medication management visits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>Crisis Support:</strong> 988 Suicide & Crisis Lifeline</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>Part B Coverage:</strong> 80% after $257 deductible</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Source:</strong> CMS Telehealth Services List 2025 | Medicare.gov Telehealth | HHS Telehealth Policy Changes
                </p>
              </div>
            </CardContent>
          </Card>
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

          {/* 4. Adult Day Programs Tab and Slider */}
          {(() => {
            const services = (careServicesData as any)?.services || [];
            const adultDayCareCount = services.filter((s: any) => s.serviceCategory === 'Adult Day Programs').length;
            
            return (
              <div className="mb-8">
                {/* Adult Day Programs Tab */}
                <div
                  className="bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4"
                  onClick={() => setSelectedCategory('Adult Day Programs')}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Adult Day Programs</h4>
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

          {/* Remaining Healthcare Service Sections */}
          {/* 7. Companion Care */}
          <div className="mb-8">
            <div className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4 cursor-pointer">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Companion Care</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">Social support and companionship</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">132</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>
            
            {/* Companion Care Slider */}
            <section className="px-4 py-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-100/30 via-yellow-100/20 to-orange-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
              </div>
              
              <div className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Compassionate companionship services • Social engagement & support</p>
                
                <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                  {companionCareServices.length > 0 ? (
                    companionCareServices.slice(0, 15).map((service: any, index: number) => (
                      <CareServiceCard
                        key={service.id}
                        service={{
                          ...service,
                          serviceCategory: 'Companion Care',
                          description: 'Social support, errands, and companionship',
                          rating: 4.5,
                          reviewCount: 0,
                          verified: true,
                          location: `${service.city}, ${service.state}`,
                          availability: 'Contact for availability',
                          medicare: false,
                          medicaid: false
                        }}
                        index={index}
                        borderColor="border-amber-200 dark:border-gray-700"
                        hoverBorderColor="hover:border-amber-300 dark:hover:border-gray-600"
                        iconBgColor="bg-gradient-to-br from-amber-500 to-amber-600"
                        iconRingColor="ring-amber-100 dark:ring-amber-900"
                        icon={<Users className="w-8 h-8 text-white" />}
                        categoryBadgeColor="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800"
                        categoryBadgeBorder="border-amber-300 dark:border-amber-600"
                        categoryLabel="Companion Care"
                        buttonColor="bg-gradient-to-r from-amber-500 to-amber-600"
                        buttonHoverColor="hover:from-amber-600 hover:to-amber-700"
                      />
                    ))
                  ) : (
                    <div className="w-full text-center py-8">
                      <div className="text-gray-500 dark:text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">No companion care providers available</p>
                        <p className="text-sm mt-2">Check back soon as we add more verified providers</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* 8. Medical Equipment */}
          <div className="mb-8">
            <div className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4 cursor-pointer">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Medical Equipment</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">Medical supplies and equipment rental</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">85</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Suppliers</div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">DME</Badge>
                  <ChevronRight className="w-6 h-6 text-orange-700 dark:text-orange-300" />
                </div>
              </div>
            </div>
            
            {/* Medical Equipment Slider */}
            <section className="px-4 py-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-100/30 via-red-100/20 to-yellow-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
              </div>
              
              <div className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Durable medical equipment (DME) • Rental & purchase options</p>
                
                <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                  <div className="w-full text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No medical equipment suppliers available</p>
                      <p className="text-sm mt-2">Check back soon as we add more verified suppliers</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>



          {/* 10. Respite Care */}
          <div className="mb-8">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4 cursor-pointer">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BedDouble className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Respite Care</h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Short-term care for caregiver relief</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">125</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-indigo-700 dark:text-indigo-300" />
                </div>
              </div>
            </div>
            
            {/* Respite Care Slider */}
            <section className="px-4 py-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
              </div>
              
              <div className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Temporary relief for family caregivers • Day and overnight options</p>
                
                <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                  <div className="w-full text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">
                      <BedDouble className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No respite care providers available</p>
                      <p className="text-sm mt-2">Check back soon as we add more verified providers</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 11. Palliative Care */}
          <div className="mb-8">
            <div className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4 cursor-pointer">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Palette className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Palliative Care</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Specialized medical care for serious illness</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">95</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-purple-700 dark:text-purple-300" />
                </div>
              </div>
            </div>
            
            {/* Palliative Care Slider */}
            <section className="px-4 py-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
              </div>
              
              <div className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Comfort care for serious conditions • Pain and symptom management</p>
                
                <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                  <div className="w-full text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No palliative care providers available</p>
                      <p className="text-sm mt-2">Check back soon as we add more verified providers</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 12. Skilled Nursing */}
          <div className="mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4 cursor-pointer">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Skilled Nursing</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">24/7 skilled nursing facilities</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">310</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Facilities</div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">24/7 CARE</Badge>
                  <ChevronRight className="w-6 h-6 text-blue-700 dark:text-blue-300" />
                </div>
              </div>
            </div>
            
            {/* Skilled Nursing Slider */}
            <section className="px-4 py-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
              </div>
              
              <div className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">24-hour skilled nursing facilities • Post-acute care</p>
                
                <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                  <div className="w-full text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No skilled nursing facilities available</p>
                      <p className="text-sm mt-2">Check back soon as we add more verified facilities</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 13. Transport Services */}
          <div className="mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4 cursor-pointer">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Car className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Transport Services</h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">Non-emergency medical transportation</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">145</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-green-700 dark:text-green-300" />
                </div>
              </div>
            </div>
            
            {/* Transport Services Slider */}
            <section className="px-4 py-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
              </div>
              
              <div className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Medical appointments • Wheelchair accessible vehicles</p>
                
                <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                  <div className="w-full text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No transport services available</p>
                      <p className="text-sm mt-2">Check back soon as we add more verified providers</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 14. Nutrition Services */}
          <div className="mb-8">
            <div className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4 cursor-pointer">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Apple className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Nutrition Services</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">Meal delivery and nutrition counseling</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">85</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-orange-700 dark:text-orange-300" />
                </div>
              </div>
            </div>
            
            {/* Nutrition Services Slider */}
            <section className="px-4 py-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
              </div>
              
              <div className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Meal delivery • Dietitian consultations • Special diets</p>
                
                <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                  <div className="w-full text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Apple className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No nutrition services available</p>
                      <p className="text-sm mt-2">Check back soon as we add more verified providers</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 15. Dental Services */}
          <div className="mb-8">
            <div className="bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4 cursor-pointer">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Smile className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dental Services</h4>
                    <p className="text-sm text-cyan-700 dark:text-cyan-300 mt-1">Senior-focused dental care</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">210</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-cyan-700 dark:text-cyan-300" />
                </div>
              </div>
            </div>
            
            {/* Dental Services Slider */}
            <section className="px-4 py-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
              </div>
              
              <div className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Senior dental care • Dentures • Mobile dental services</p>
                
                <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                  <div className="w-full text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Smile className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No dental services available</p>
                      <p className="text-sm mt-2">Check back soon as we add more verified providers</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 16. Vision Services */}
          <div className="mb-8">
            <div className="bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4 cursor-pointer">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Vision Services</h4>
                    <p className="text-sm text-violet-700 dark:text-violet-300 mt-1">Eye exams and vision care</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">175</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-violet-700 dark:text-violet-300" />
                </div>
              </div>
            </div>
            
            {/* Vision Services Slider */}
            <section className="px-4 py-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
              </div>
              
              <div className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Eye exams • Cataract care • Low vision aids</p>
                
                <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                  <div className="w-full text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No vision services available</p>
                      <p className="text-sm mt-2">Check back soon as we add more verified providers</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 17. Hearing Services */}
          <div className="mb-8">
            <div className="bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4 cursor-pointer">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Ear className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Hearing Services</h4>
                    <p className="text-sm text-pink-700 dark:text-pink-300 mt-1">Hearing tests and hearing aids</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">155</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-pink-700 dark:text-pink-300" />
                </div>
              </div>
            </div>
            
            {/* Hearing Services Slider */}
            <section className="px-4 py-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
              </div>
              
              <div className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Audiology services • Hearing aid fitting • Tinnitus care</p>
                
                <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                  <div className="w-full text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Ear className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No hearing services available</p>
                      <p className="text-sm mt-2">Check back soon as we add more verified providers</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 18. Podiatry Services */}
          <div className="mb-8">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4 cursor-pointer">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Footprints className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Podiatry Services</h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">Specialized foot and ankle care</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">120</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-emerald-700 dark:text-emerald-300" />
                </div>
              </div>
            </div>
            
            {/* Podiatry Services Slider */}
            <section className="px-4 py-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
              </div>
              
              <div className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Diabetic foot care • Orthotics • Foot surgery</p>
                
                <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                  <div className="w-full text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Footprints className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No podiatry services available</p>
                      <p className="text-sm mt-2">Check back soon as we add more verified providers</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 19. Pharmacy Services */}
          <div className="mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4 cursor-pointer">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Pill className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Pharmacy Services</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">Medication management and delivery</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">290</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Providers</div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-red-700 dark:text-red-300" />
                </div>
              </div>
            </div>
            
            {/* Pharmacy Services Slider */}
            <section className="px-4 py-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
              </div>
              
              <div className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Prescription delivery • Medication therapy management</p>
                
                <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                  <div className="w-full text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No pharmacy services available</p>
                      <p className="text-sm mt-2">Check back soon as we add more verified providers</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 20. Home Health */}
          <div className="mb-8">
            <div className="bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4 cursor-pointer">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Home Health</h4>
                    <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">Medicare-certified home health agencies</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">385</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Agencies</div>
                  </div>
                  <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">MEDICARE</Badge>
                  <ChevronRight className="w-6 h-6 text-teal-700 dark:text-teal-300" />
                </div>
              </div>
            </div>
            
            {/* Home Health Slider */}
            <section className="px-4 py-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
              </div>
              
              <div className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Medicare-certified agencies • Skilled nursing at home</p>
                
                <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                  {homeHealthServices.length > 0 ? (
                    homeHealthServices.slice(0, 20).map((service: any, index: number) => (
                      <CareServiceCard
                        key={service.id}
                        service={{
                          ...service,
                          serviceCategory: 'Home Health',
                          description: service.website ? 'Medicare-certified home care provider' : 'Licensed home healthcare services',
                          rating: 4.3,
                          reviewCount: 0,
                          verified: true,
                          location: `${service.city}, ${service.state}`,
                          availability: 'Contact for availability',
                          medicare: true,
                          medicaid: false
                        }}
                        index={index}
                        borderColor="border-teal-200 dark:border-gray-700"
                        hoverBorderColor="hover:border-teal-300 dark:hover:border-gray-600"
                        iconBgColor="bg-gradient-to-br from-teal-500 to-teal-600"
                        iconRingColor="ring-teal-100 dark:ring-teal-900"
                        icon={<Home className="w-8 h-8 text-white" />}
                        categoryBadgeColor="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900 dark:to-teal-800"
                        categoryBadgeBorder="border-teal-300 dark:border-teal-600"
                        categoryLabel="Home Health"
                        buttonColor="bg-gradient-to-r from-teal-500 to-teal-600"
                        buttonHoverColor="hover:from-teal-600 hover:to-teal-700"
                      />
                    ))
                  ) : (
                    <div className="w-full text-center py-8">
                      <div className="text-gray-500 dark:text-gray-400">
                        <Home className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">No home health providers available</p>
                        <p className="text-sm mt-2">Check back soon as we add more verified providers</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* 21. Diagnostic Services */}
          <div className="mb-8">
            <div className="bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4 cursor-pointer">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TestTube className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Diagnostic Services</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">Lab tests and diagnostic imaging</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">195</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Centers</div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
              </div>
            </div>
            
            {/* Diagnostic Services Slider */}
            <section className="px-4 py-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
              </div>
              
              <div className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Laboratory testing • X-ray • Ultrasound • MRI services</p>
                
                <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                  {hospitals && hospitals.length > 0 && hospitals.some((h: any) => h.services?.includes('Diagnostic Imaging') || h.services?.includes('Laboratory Services')) ? (
                    hospitals.filter((h: any) => h.services?.includes('Diagnostic Imaging') || h.services?.includes('Laboratory Services'))
                      .slice(0, 10)
                      .map((hospital: any, index: number) => (
                        <CareServiceCard
                          key={hospital.id}
                          service={{
                            id: hospital.id,
                            name: hospital.name,
                            serviceCategory: 'Diagnostic Services',
                            description: 'Lab work, imaging, diagnostic testing',
                            rating: hospital.cms_rating || 0,
                            reviewCount: 0,
                            verified: true,
                            location: `${hospital.city}, ${hospital.state}`,
                            availability: hospital.emergency_services ? '24/7 Emergency Lab' : 'By appointment',
                            medicare: true,
                            medicaid: true,
                            phone: hospital.phone,
                            address: hospital.address,
                            website: hospital.website
                          }}
                          index={index}
                          borderColor="border-gray-200 dark:border-gray-700"
                          hoverBorderColor="hover:border-gray-300 dark:hover:border-gray-600"
                          iconBgColor="bg-gradient-to-br from-gray-500 to-gray-600"
                          iconRingColor="ring-gray-100 dark:ring-gray-900"
                          icon={<TestTube className="w-8 h-8 text-white" />}
                          categoryBadgeColor="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
                          categoryBadgeBorder="border-gray-300 dark:border-gray-600"
                          categoryLabel="Diagnostic Services"
                          buttonColor="bg-gradient-to-r from-gray-500 to-gray-600"
                          buttonHoverColor="hover:from-gray-600 hover:to-gray-700"
                        />
                      ))
                  ) : (
                    <div className="w-full text-center py-8">
                      <div className="text-gray-500 dark:text-gray-400">
                        <TestTube className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">No diagnostic centers available</p>
                        <p className="text-sm mt-2">Check back soon as we add more verified providers</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
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