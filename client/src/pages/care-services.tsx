import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { useLocation } from "wouter";
import { 
  Heart, Search, Filter, MapPin, Phone, Globe, Mail, CheckCircle, 
  Shield, Clock, Users, Star, Building2, ChevronRight, Info, Plus,
  Activity, Package, Brain, User, MessageCircle, Car
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
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
              
              <Select value={selectedState} onValueChange={setSelectedState}>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((item) => {
              if (item.type === 'hospital') {
                const hospital = item as Hospital & { type: 'hospital' };
                return (
                  <Card 
                    key={`hospital-${hospital.id}`} 
                    className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-900/20 dark:via-gray-900 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800"
                    onClick={() => handleProviderClick(hospital)}
                  >
                    {/* CMS Rating Badge */}
                    {hospital.cmsRating && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-blue-600 text-white px-2 py-1">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          CMS {hospital.cmsRating}/5
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                            {hospital.name}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {hospital.emergencyServices && (
                              <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs">
                                🚑 Emergency
                              </Badge>
                            )}
                            {hospital.traumaLevel && (
                              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-xs">
                                {hospital.traumaLevel}
                              </Badge>
                            )}
                            {hospital.hospitalType && (
                              <Badge variant="outline" className="text-xs">
                                {hospital.hospitalType}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Rating Stars Display */}
                      {hospital.cmsRating && (
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < hospital.cmsRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`} 
                            />
                          ))}
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                            ({hospital.cmsRating}/5)
                          </span>
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
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProviderClick(hospital);
                        }}
                      >
                        View Hospital Details
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              } else {
                const provider = item as HealthcareProvider & { type: 'provider' };
                
                // Define gradient colors for each service type
                const serviceTypeColors: { [key: string]: string } = {
                  home_health: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800',
                  hospice: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800',
                  physical_therapy: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800',
                  occupational_therapy: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800',
                  speech_therapy: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-200 dark:border-teal-800',
                  adult_day: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800',
                  personal_care: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 dark:border-pink-800',
                  respite: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800',
                  medical_equipment: 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-800',
                  mental_health: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800',
                  transportation: 'from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border-slate-200 dark:border-slate-800'
                };
                
                // Define icon colors
                const iconColors: { [key: string]: string } = {
                  home_health: 'from-green-500 to-emerald-600',
                  hospice: 'from-purple-500 to-pink-600',
                  physical_therapy: 'from-orange-500 to-red-600',
                  occupational_therapy: 'from-yellow-500 to-amber-600',
                  speech_therapy: 'from-teal-500 to-cyan-600',
                  adult_day: 'from-blue-500 to-indigo-600',
                  personal_care: 'from-pink-500 to-rose-600',
                  respite: 'from-amber-500 to-yellow-600',
                  medical_equipment: 'from-gray-500 to-slate-600',
                  mental_health: 'from-indigo-500 to-purple-600',
                  transportation: 'from-slate-500 to-gray-600'
                };
                
                const serviceTypeIcons: { [key: string]: any } = {
                  home_health: Heart,
                  hospice: Heart,
                  physical_therapy: Activity,
                  occupational_therapy: Activity,
                  speech_therapy: MessageCircle,
                  adult_day: Users,
                  personal_care: User,
                  respite: Clock,
                  medical_equipment: Package,
                  mental_health: Brain,
                  transportation: Car
                };
                
                const bgColor = serviceTypeColors[provider.serviceType] || 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-800';
                const iconGradient = iconColors[provider.serviceType] || 'from-gray-500 to-slate-600';
                const IconComponent = serviceTypeIcons[provider.serviceType] || Heart;
                
                return (
                  <Card 
                    key={`provider-${provider.id}`} 
                    className={`hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br ${bgColor} border-2 relative overflow-hidden`}
                    onClick={() => handleProviderClick(provider)}
                  >
                    {/* Verified Badge - Top Right */}
                    {provider.isVerified && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-green-500 text-white px-2 py-1">
                          ✓ VERIFIED
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-14 h-14 bg-gradient-to-br ${iconGradient} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                        {/* Title and Service Type */}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                            {provider.businessName}
                          </CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {serviceTypeLabels[provider.serviceType] || provider.otherServiceType}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {provider.description}
                      </p>
                      
                      {/* Services offered - Clean list */}
                      {provider.services && provider.services.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {provider.services.slice(0, 3).map((service) => (
                              <div key={service} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>{service}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Location and Insurance */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>{provider.city}, {provider.state}</span>
                        </div>
                        
                        {/* Insurance badges */}
                        {provider.insuranceAccepted && provider.insuranceAccepted.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {provider.insuranceAccepted.slice(0, 3).map((insurance) => (
                              <Badge key={insurance} variant="secondary" className="text-xs">
                                {insurance}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Special Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {provider.metadata?.emergencyAvailable && (
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs">
                            24/7 AVAILABLE
                          </Badge>
                        )}
                        {provider.metadata?.acceptingNewPatients && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">
                            ACCEPTING NEW
                          </Badge>
                        )}
                        {provider.metadata?.yearsInBusiness && provider.metadata.yearsInBusiness > 10 && (
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                            {provider.metadata.yearsInBusiness}+ YEARS
                          </Badge>
                        )}
                      </div>
                      
                      {/* Contact Information - Clean layout */}
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <a 
                            href={`tel:${provider.phone}`}
                            className="text-sm font-medium text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {provider.phone}
                          </a>
                        </div>
                        {provider.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-500" />
                            <a 
                              href={provider.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline truncate"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Visit Website
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {/* View Details Button */}
                      <Button 
                        className="w-full mt-4" 
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProviderClick(provider);
                        }}
                      >
                        View Provider Details
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              }
            })}
          </div>
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