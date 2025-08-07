import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { CareServiceCard } from "@/components/CareServiceCard";
import { useLocation } from "wouter";
import { 
  Heart, Search, Filter, MapPin, Phone, Globe, Mail, CheckCircle, 
  Shield, Clock, Users, Star, Building2, ChevronRight, Info, Plus,
  Activity, Package, Brain, User, MessageCircle, Car, Home
} from "lucide-react";

interface HealthcareProvider {
  id: number;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  serviceType: string;
  otherServiceType?: string;
  description: string;
  services: string[];
  certifications?: string[];
  insuranceAccepted?: string[];
  serviceAreas: string[];
  states: string[];
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isVerified: boolean;
  isActive: boolean;
  viewCount: number;
  metadata?: {
    yearsInBusiness?: number;
    employeeCount?: string;
    languages?: string[];
    emergencyAvailable?: boolean;
    acceptingNewPatients?: boolean;
  };
}

interface Hospital {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  emergencyPhone?: string;
  hospitalType: string;
  bedCount?: number;
  emergencyServices: boolean;
  traumaLevel?: string;
  ownership?: string;
  cmsRating?: number;
  services?: string[];
  specialties?: string[];
  website?: string;
}

type CombinedProvider = (HealthcareProvider & { type: 'provider' }) | (Hospital & { type: 'hospital' });

const serviceTypeLabels: Record<string, string> = {
  hospital: "Hospital",
  home_health: "Home Health Agency",
  hospice: "Hospice Care",
  physical_therapy: "Physical Therapy",
  occupational_therapy: "Occupational Therapy",
  speech_therapy: "Speech Therapy",
  nursing: "Skilled Nursing",
  medical_equipment: "Medical Equipment/DME",
  pharmacy: "Specialty Pharmacy",
  mental_health: "Mental Health Services",
  dental: "Dental Care",
  vision: "Vision/Eye Care",
  hearing: "Hearing/Audiology",
  podiatry: "Podiatry/Foot Care",
  nutrition: "Nutrition/Dietitian",
  transportation: "Medical Transportation",
  adult_day: "Adult Day Care",
  respite: "Respite Care",
  wound_care: "Wound Care",
  dialysis: "Dialysis Center",
  pain_management: "Pain Management",
  cardiology: "Cardiology",
  neurology: "Neurology",
  oncology: "Oncology/Cancer Care",
  pulmonology: "Pulmonology/Respiratory",
  other: "Healthcare Service",
};

export default function CareServices() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Show only 12 items per page to prevent crashes

  const { data: providers = [], isLoading: providersLoading } = useQuery<HealthcareProvider[]>({
    queryKey: ["/api/healthcare-providers"],
  });

  const { data: hospitals = [], isLoading: hospitalsLoading } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals"],
  });

  const isLoading = providersLoading || hospitalsLoading;

  // Combine hospitals and healthcare providers
  const combinedProviders: CombinedProvider[] = [
    ...hospitals.map(h => ({ ...h, type: 'hospital' as const })),
    ...providers.map(p => ({ ...p, type: 'provider' as const }))
  ];

  // Filter combined providers based on search criteria
  const filteredProviders = combinedProviders.filter((item) => {
    if (item.type === 'hospital') {
      const hospital = item as Hospital & { type: 'hospital' };
      const matchesSearch = searchTerm === "" || 
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (hospital.services?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) || false);
      
      const matchesType = selectedServiceType === "all" || selectedServiceType === "hospital";
      
      const matchesState = selectedState === "all" || hospital.state === selectedState;
      
      return matchesSearch && matchesType && matchesState;
    } else {
      const provider = item as HealthcareProvider & { type: 'provider' };
      const matchesSearch = searchTerm === "" || 
        provider.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = selectedServiceType === "all" || provider.serviceType === selectedServiceType;
      
      const matchesState = selectedState === "all" || provider.states.includes(selectedState);
      
      return matchesSearch && matchesType && matchesState;
    }
  });

  // Get unique states from all providers and hospitals
  const providerStates = providers.flatMap(p => p.states);
  const hospitalStates = hospitals.map(h => h.state);
  const allStates = Array.from(new Set([...providerStates, ...hospitalStates])).sort();
  
  // Pagination logic
  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProviders = filteredProviders.slice(startIndex, endIndex);
  
  // Reset to page 1 when filters change
  const resetPage = () => {
    setCurrentPage(1);
  };

  const handleProviderClick = async (item: CombinedProvider) => {
    if (item.type === 'provider') {
      const provider = item as HealthcareProvider & { type: 'provider' };
      // Track view
      await fetch(`/api/healthcare-providers/${provider.id}/view`, { method: "POST" });
      
      // Open website or show contact info
      if (provider.website) {
        window.open(provider.website, "_blank");
      }
    } else {
      const hospital = item as Hospital & { type: 'hospital' };
      // For hospitals, show more details or navigate to hospital detail page
      if (hospital.website) {
        window.open(hospital.website, "_blank");
      }
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-7xl mt-16">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Badge className="px-4 py-2 text-base bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 mb-4">
            <Heart className="w-4 h-4 mr-2" />
            Comprehensive Healthcare Provider Directory - 100% FREE
          </Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Complete Healthcare & Care Services Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4">
            Your gateway to hospitals, care services, and insurance networks - all in one place
          </p>
          
          {/* Healthcare Ecosystem Overview */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 max-w-6xl mx-auto mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Active Services */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  🟢 Active Healthcare Services (ALL SEARCHABLE):
                </p>
                
                {/* Primary Healthcare */}
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-3 mb-1">Primary Healthcare:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs mb-2">
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">🏥 Hospitals (6,000+)</Badge>
                </div>
                
                {/* Home & Personal Care */}
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 mb-1">Home & Personal Care:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs mb-2">
                  <Badge variant="secondary">🏠 Home Care Services</Badge>
                  <Badge variant="secondary">👥 Personal Care Services</Badge>
                  <Badge variant="secondary">🌟 Adult Day Care</Badge>
                </div>
                
                {/* Medical Services */}
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 mb-1">Medical Services:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs mb-2">
                  <Badge variant="secondary">🏥 Hospice Care</Badge>
                  <Badge variant="secondary">💊 Pharmacy Services</Badge>
                  <Badge variant="secondary">📱 Telemedicine</Badge>
                  <Badge variant="secondary">🩺 Medical Equipment</Badge>
                </div>
                
                {/* Therapy & Rehabilitation */}
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 mb-1">Therapy & Rehabilitation:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs mb-2">
                  <Badge variant="secondary">🏃 Physical Therapy</Badge>
                  <Badge variant="secondary">🤲 Occupational Therapy</Badge>
                  <Badge variant="secondary">🗣️ Speech Therapy</Badge>
                  <Badge variant="secondary">🧘 Respiratory Therapy</Badge>
                </div>
                
                {/* Specialized Services */}
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 mb-1">Specialized Services:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs mb-2">
                  <Badge variant="secondary">🧠 Mental Health</Badge>
                  <Badge variant="secondary">🦷 Dental Care</Badge>
                  <Badge variant="secondary">👁️ Vision Care</Badge>
                  <Badge variant="secondary">👂 Hearing Services</Badge>
                  <Badge variant="secondary">🦶 Podiatry</Badge>
                  <Badge variant="secondary">🩸 Dialysis Centers</Badge>
                  <Badge variant="secondary">💉 Wound Care</Badge>
                  <Badge variant="secondary">⚡ Pain Management</Badge>
                </div>
                
                {/* Support Services */}
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 mb-1">Support Services:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs">
                  <Badge variant="secondary">🚑 Medical Transport</Badge>
                  <Badge variant="secondary">🍎 Nutrition Services</Badge>
                  <Badge variant="secondary">🏥 Respite Care</Badge>
                  <Badge variant="secondary">👥 Social Services</Badge>
                </div>
              </div>
              
              {/* Coming Soon */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  🔜 Launching Soon:
                </p>
                <div className="space-y-2">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <p className="font-medium text-sm">🚑 Urgent Care Centers</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Walk-in clinics for immediate care needs</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <p className="font-medium text-sm">🏥 Insurance Provider Networks</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Direct access to in-network doctor lookup portals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Info className="w-4 h-4" />
            <span>One platform. Complete healthcare access. All for seniors.</span>
          </div>
          
          {/* Call to Action for Providers */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 max-w-3xl mx-auto border border-green-200 dark:border-green-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Are you a Healthcare Provider?
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  List your services for FREE and connect with thousands of communities
                </p>
              </div>
              <Button
                onClick={() => setLocation("/healthcare-provider-signup")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your Free Listing
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by name, service, or keyword..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      resetPage();
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedServiceType} onValueChange={(value) => {
                setSelectedServiceType(value);
                resetPage();
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Service Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Service Types</SelectItem>
                  {Object.entries(serviceTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedState} onValueChange={(value) => {
                setSelectedState(value);
                resetPage();
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {allStates.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <Filter className="w-4 h-4 text-gray-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredProviders.length} of {combinedProviders.length} healthcare services ({hospitals.length} hospitals, {providers.length} providers)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Provider Listings */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredProviders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Providers Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || selectedServiceType !== "all" || selectedState !== "all" 
                  ? "Try adjusting your search criteria"
                  : "Be the first healthcare provider to list your services!"}
              </p>
              <Button onClick={() => setLocation("/healthcare-provider-signup")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your Free Listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProviders.map((item) => {
              if (item.type === 'hospital') {
                const hospital = item as Hospital & { type: 'hospital' };
                
                // Return hospital card with exact home page styling
                return (
                  <Card 
                    key={`hospital-${hospital.id}`}
                    className="flex-shrink-0 w-full min-h-[40rem] border-2 border-blue-100 dark:border-blue-900/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20 dark:from-gray-800 dark:via-gray-900 dark:to-blue-900/20 backdrop-blur-sm relative overflow-visible group cursor-pointer"
                    onClick={() => handleProviderClick(hospital)}
                  >
                    {/* Demo Data Banner - Exact styling from home page */}
                    <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 text-center z-20">
                      ⚠️ Nationwide Hospital Expansion 2025
                    </div>
                    
                    {/* Premium Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                    
                    {/* Enhanced Header - Exact from home page */}
                    <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-4 text-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                              <Building2 className="w-6 h-6" />
                            </div>
                            <Badge className="bg-white/25 hover:bg-white/35 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                              {hospital.hospitalType}
                            </Badge>
                          </div>
                          {hospital.cmsRating && (
                            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full px-3 py-1.5 backdrop-blur-sm border border-white/20">
                              <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                              <span className="text-sm font-bold">{hospital.cmsRating}/5</span>
                            </div>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 drop-shadow-sm">
                          {hospital.name}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm opacity-95">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate font-medium">{hospital.city}, {hospital.state}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-4 flex flex-col flex-1 relative z-10">
                      {/* Feature Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hospital.ownership && (
                          <Badge className={hospital.ownership.includes("Non-profit") ? "bg-green-600 text-white" : "bg-gray-600 text-white"}>
                            {hospital.ownership.includes("Non-profit") ? "Non-Profit" : "Private"}
                          </Badge>
                        )}
                        {hospital.traumaLevel && (
                          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs">
                            {hospital.traumaLevel}
                          </Badge>
                        )}
                        {hospital.emergencyServices && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                            24/7 Emergency
                          </Badge>
                        )}
                      </div>
                      
                      {/* Enhanced Services */}
                      {hospital.services && hospital.services.length > 0 && (
                        <div className="mb-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800/50">
                          <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            Key Services
                          </h4>
                          <div className="space-y-2">
                            {hospital.services.slice(0, 5).map((service, idx) => (
                              <div key={idx} className="flex items-center gap-3 text-sm">
                                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex-shrink-0 shadow-sm"></div>
                                <span className="text-gray-700 dark:text-gray-300 truncate font-medium">{service}</span>
                              </div>
                            ))}
                            {hospital.services.length > 5 && (
                              <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold pl-5">
                                +{hospital.services.length - 5} more specialties
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Location with enhanced styling */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {hospital.city}, {hospital.state}
                          </span>
                        </div>
                        {hospital.address && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                            {hospital.address}
                          </p>
                        )}
                      </div>
                      
                      {/* Key Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {hospital.bedCount && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {hospital.bedCount}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Beds</div>
                          </div>
                        )}
                        {hospital.ownership && (
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                            <div className="text-xs font-medium text-green-600 dark:text-green-400">
                              {hospital.ownership.split(' - ')[0]}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Type</div>
                          </div>
                        )}
                      </div>
                      
                      {/* Services */}
                      {hospital.services && hospital.services.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Services:</p>
                          <div className="flex flex-wrap gap-1">
                            {hospital.services.slice(0, 3).map((service) => (
                              <Badge key={service} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                            {hospital.services.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{hospital.services.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Contact Information */}
                      <div className="space-y-2 border-t pt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a 
                            href={`tel:${hospital.phone}`} 
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {hospital.phone}
                          </a>
                        </div>
                        {hospital.website && (
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <a 
                              href={hospital.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Visit Website
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        className="w-full mt-4 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 text-white text-sm py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProviderClick(hospital);
                        }}
                      >
                        View Hospital Details
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                );
              } else {
                const provider = item as HealthcareProvider & { type: 'provider' };
                
                // Map service types to icons and colors - exactly matching home page
                const getServiceConfig = (serviceType: string) => {
                  switch (serviceType) {
                    case 'home_health':
                      return {
                        icon: <Home className="w-6 h-6 text-teal-600" />,
                        borderColor: "border-teal-200",
                        hoverBorderColor: "hover:border-teal-400",
                        iconBgColor: "bg-teal-50",
                        iconRingColor: "ring-teal-100",
                        categoryBadgeColor: "bg-teal-50 text-teal-700",
                        categoryBadgeBorder: "border-teal-200",
                        categoryLabel: "Home Health",
                        buttonColor: "bg-teal-600",
                        buttonHoverColor: "hover:bg-teal-700"
                      };
                    case 'hospice':
                      return {
                        icon: <HeartHandshake className="w-6 h-6 text-purple-600" />,
                        borderColor: "border-purple-200",
                        hoverBorderColor: "hover:border-purple-400",
                        iconBgColor: "bg-purple-50",
                        iconRingColor: "ring-purple-100",
                        categoryBadgeColor: "bg-purple-50 text-purple-700",
                        categoryBadgeBorder: "border-purple-200",
                        categoryLabel: "Hospice Care",
                        buttonColor: "bg-purple-600",
                        buttonHoverColor: "hover:bg-purple-700"
                      };
                    case 'personal_care':
                      return {
                        icon: <Users className="w-6 h-6 text-blue-600" />,
                        borderColor: "border-blue-200",
                        hoverBorderColor: "hover:border-blue-400",
                        iconBgColor: "bg-blue-50",
                        iconRingColor: "ring-blue-100",
                        categoryBadgeColor: "bg-blue-50 text-blue-700",
                        categoryBadgeBorder: "border-blue-200",
                        categoryLabel: "Personal Care",
                        buttonColor: "bg-blue-600",
                        buttonHoverColor: "hover:bg-blue-700"
                      };
                    case 'medical_equipment':
                      return {
                        icon: <Package className="w-6 h-6 text-green-600" />,
                        borderColor: "border-green-200",
                        hoverBorderColor: "hover:border-green-400",
                        iconBgColor: "bg-green-50",
                        iconRingColor: "ring-green-100",
                        categoryBadgeColor: "bg-green-50 text-green-700",
                        categoryBadgeBorder: "border-green-200",
                        categoryLabel: "Medical Equipment",
                        buttonColor: "bg-green-600",
                        buttonHoverColor: "hover:bg-green-700"
                      };
                    default:
                      return {
                        icon: <Heart className="w-6 h-6 text-rose-600" />,
                        borderColor: "border-rose-200",
                        hoverBorderColor: "hover:border-rose-400",
                        iconBgColor: "bg-rose-50",
                        iconRingColor: "ring-rose-100",
                        categoryBadgeColor: "bg-rose-50 text-rose-700",
                        categoryBadgeBorder: "border-rose-200",
                        categoryLabel: provider.otherServiceType || "Healthcare",
                        buttonColor: "bg-rose-600",
                        buttonHoverColor: "hover:bg-rose-700"
                      };
                  }
                };
                
                const config = getServiceConfig(provider.serviceType);
                
                // Transform provider data to match CareServiceCard expectations
                const serviceData = {
                  id: provider.id,
                  name: provider.businessName,
                  address: provider.address || '',
                  city: provider.city || 'Multiple Locations',
                  state: provider.state || 'Multiple States',
                  zipCode: provider.zipCode || '',
                  phone: provider.phone,
                  email: provider.email,
                  website: provider.website,
                  rating: 4.5, // Default rating for now
                  careTypes: provider.services
                };
                
                return (
                  <div key={`provider-${provider.id}`} onClick={() => handleProviderClick(provider)}>
                    <CareServiceCard
                      service={serviceData}
                      index={0}
                      {...config}
                    />
                  </div>
                );
              }
            })}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
          </>
        )}
        
        {/* Statistics Footer */}
        {(hospitals.length > 0 || providers.length > 0) && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{hospitals.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Hospitals</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{providers.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Healthcare Providers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {providers.filter(p => p.isVerified).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Verified Providers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {Array.from(new Set([...providers.flatMap(p => p.states), ...hospitals.map(h => h.state)])).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">States Covered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}