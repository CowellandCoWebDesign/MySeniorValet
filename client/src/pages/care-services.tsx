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
  Shield, Clock, Users, Star, Building2, ChevronRight, Info, Plus
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

const serviceTypeLabels: Record<string, string> = {
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

  const { data: providers = [], isLoading } = useQuery<HealthcareProvider[]>({
    queryKey: ["/api/healthcare-providers"],
  });

  // Filter providers based on search criteria
  const filteredProviders = providers.filter((provider) => {
    const matchesSearch = searchTerm === "" || 
      provider.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedServiceType === "all" || provider.serviceType === selectedServiceType;
    
    const matchesState = selectedState === "all" || provider.states.includes(selectedState);
    
    return matchesSearch && matchesType && matchesState;
  });

  // Get unique states from all providers
  const allStates = Array.from(new Set(providers.flatMap(p => p.states))).sort();

  const handleProviderClick = async (provider: HealthcareProvider) => {
    // Track view
    await fetch(`/api/healthcare-providers/${provider.id}/view`, { method: "POST" });
    
    // Open website or show contact info
    if (provider.website) {
      window.open(provider.website, "_blank");
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
                Showing {filteredProviders.length} of {providers.length} healthcare providers
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
            {filteredProviders.map((provider) => (
              <Card 
                key={provider.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleProviderClick(provider)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {provider.businessName}
                        {provider.isVerified && (
                          <Shield className="w-4 h-4 text-blue-600" title="Verified Provider" />
                        )}
                      </CardTitle>
                      <Badge variant="outline" className="mt-2">
                        {serviceTypeLabels[provider.serviceType] || provider.otherServiceType}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {provider.description}
                  </p>
                  
                  {/* Services */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {provider.services.slice(0, 3).map((service) => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {provider.services.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{provider.services.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Coverage Area */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {provider.states.length === 1 
                        ? provider.states[0]
                        : `${provider.states.length} states`}
                    </span>
                  </div>
                  
                  {/* Metadata Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {provider.metadata?.emergencyAvailable && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        24/7 Available
                      </Badge>
                    )}
                    {provider.metadata?.acceptingNewPatients && (
                      <Badge variant="outline" className="text-xs text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Accepting Patients
                      </Badge>
                    )}
                    {provider.certifications?.includes("Medicare Certified") && (
                      <Badge variant="outline" className="text-xs">
                        Medicare
                      </Badge>
                    )}
                    {provider.certifications?.includes("Medicaid Certified") && (
                      <Badge variant="outline" className="text-xs">
                        Medicaid
                      </Badge>
                    )}
                  </div>
                  
                  {/* Contact Information */}
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a 
                        href={`tel:${provider.phone}`}
                        className="text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {provider.phone}
                      </a>
                    </div>
                    {provider.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a 
                          href={provider.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a 
                        href={`mailto:${provider.email}`}
                        className="text-blue-600 hover:underline truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {provider.email}
                      </a>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProviderClick(provider);
                    }}
                  >
                    View Details
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Statistics Footer */}
        {providers.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{providers.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Healthcare Providers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {providers.filter(p => p.isVerified).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Verified Providers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {Array.from(new Set(providers.flatMap(p => p.states))).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">States Covered</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {providers.reduce((sum, p) => sum + p.services.length, 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Services</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}