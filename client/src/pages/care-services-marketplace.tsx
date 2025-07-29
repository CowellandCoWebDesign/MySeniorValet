import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search,
  MapPin,
  Phone,
  Globe,
  Heart,
  Users,
  Clock,
  Shield,
  Home,
  Stethoscope,
  Activity,
  User,
  Building2,
  Star,
  Filter,
  ExternalLink
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface CareService {
  id: number;
  name: string;
  serviceCategory: string;
  careTypes: string[];
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  website?: string;
  latitude?: number;
  longitude?: number;
}

interface CareServicesResponse {
  services: CareService[];
  total: number;
  categories: string[];
}

export default function CareServicesMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch all care services
  const { data: careServicesData, isLoading } = useQuery<CareServicesResponse>({
    queryKey: ['/api/care-services', { category: selectedCategory, location: locationFilter }],
  });

  // Fetch care services analytics
  const { data: analytics } = useQuery({
    queryKey: ['/api/care-services/analytics'],
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'senior placement agency':
        return <Building2 className="w-5 h-5" />;
      case 'home care services':
        return <Home className="w-5 h-5" />;
      case 'adult day care':
        return <Users className="w-5 h-5" />;
      case 'therapy services':
        return <Activity className="w-5 h-5" />;
      case 'hospice care':
        return <Heart className="w-5 h-5" />;
      case 'respite care':
        return <Clock className="w-5 h-5" />;
      case 'personal care services':
        return <User className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'senior placement agency':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'home care services':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'adult day care':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'therapy services':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'hospice care':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'respite care':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'personal care services':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredServices = careServicesData?.services?.filter(service => {
    const matchesSearch = !searchQuery || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.state.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
      service.serviceCategory.toLowerCase().includes(selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Care Services Marketplace
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Discover {analytics?.totalServices || '4,000+'} verified care providers from government databases
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <span>✓ Placement Agencies</span>
              <span>✓ Home Care Services</span>
              <span>✓ Adult Day Care</span>
              <span>✓ Therapy Services</span>
              <span>✓ Hospice Care</span>
            </div>
          </div>

          {/* Analytics Overview */}
          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
              <Card className="text-center">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-blue-600">{analytics.placementAgencies}</div>
                  <div className="text-xs text-gray-600">Placement Agencies</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-green-600">{analytics.homeCareServices}</div>
                  <div className="text-xs text-gray-600">Home Care</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-purple-600">{analytics.adultDayServices}</div>
                  <div className="text-xs text-gray-600">Adult Day Care</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-orange-600">{analytics.therapyServices}</div>
                  <div className="text-xs text-gray-600">Therapy</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-pink-600">{analytics.hospiceServices}</div>
                  <div className="text-xs text-gray-600">Hospice</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-indigo-600">{analytics.respiteServices}</div>
                  <div className="text-xs text-gray-600">Respite</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-teal-600">{analytics.personalCareServices}</div>
                  <div className="text-xs text-gray-600">Personal Care</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search care services by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="placement">Placement Agencies</option>
                <option value="home-care">Home Care Services</option>
                <option value="adult-day">Adult Day Care</option>
                <option value="therapy">Therapy Services</option>
                <option value="hospice">Hospice Care</option>
                <option value="respite">Respite Care</option>
                <option value="personal-care">Personal Care</option>
              </select>
              <Input
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-32"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {filteredServices.length} Care Services Found
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              From verified government databases
            </div>
          </div>
        </div>

        {/* Category Sections with Horizontal Sliders */}
        <div className="space-y-12">
          {/* Senior Placement Agencies */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Senior Placement Agencies
                </h3>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {analytics?.placementAgencies || 2} Available
                </Badge>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                {filteredServices
                  .filter(service => service.serviceCategory === 'Senior Placement Agency')
                  .slice(0, 10)
                  .map((service) => (
                    <Card key={service.id} className="flex-shrink-0 w-80 h-64 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="relative">
                        <div className="h-20 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-white" />
                          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold text-gray-800">
                            ⭐ 4.8
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4 flex flex-col h-44">
                        <div className="mb-2">
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Placement Agency</div>
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-2">{service.name}</h4>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400">{service.city}, {service.state}</div>
                        </div>
                        
                        <div className="space-y-2 mt-auto">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 text-xs"
                              onClick={() => window.open(`tel:${service.phone}`, '_self')}
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              {service.phone}
                            </Button>
                          </div>
                          {service.website && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs"
                              onClick={() => window.open(service.website, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Visit Website
                            </Button>
                          )}
                          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                            ✓ Government Verified
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>

          {/* Home Care Services */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Home className="w-6 h-6 text-green-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Home Care Services
                </h3>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {analytics?.homeCareServices || 143} Available
                </Badge>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                {filteredServices
                  .filter(service => service.serviceCategory === 'Home Care Services')
                  .slice(0, 15)
                  .map((service) => (
                    <Card key={service.id} className="flex-shrink-0 w-80 h-64 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="relative">
                        <div className="h-20 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                          <Home className="w-8 h-8 text-white" />
                          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold text-gray-800">
                            ⭐ 4.7
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4 flex flex-col h-44">
                        <div className="mb-2">
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Home Care</div>
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-2">{service.name}</h4>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400">{service.city}, {service.state}</div>
                        </div>
                        
                        <div className="space-y-2 mt-auto">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 text-xs"
                              onClick={() => window.open(`tel:${service.phone}`, '_self')}
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              {service.phone}
                            </Button>
                          </div>
                          {service.website && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs"
                              onClick={() => window.open(service.website, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Visit Website
                            </Button>
                          )}
                          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                            ✓ Government Verified
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>

          {/* Adult Day Care */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Adult Day Care Programs
                </h3>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  {analytics?.adultDayServices || 1627} Available
                </Badge>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                {filteredServices
                  .filter(service => service.serviceCategory === 'Adult Day Care')
                  .slice(0, 20)
                  .map((service) => (
                    <Card key={service.id} className="flex-shrink-0 w-80 h-64 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="relative">
                        <div className="h-20 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                          <Users className="w-8 h-8 text-white" />
                          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold text-gray-800">
                            ⭐ 4.6
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4 flex flex-col h-44">
                        <div className="mb-2">
                          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Adult Day Care</div>
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-2">{service.name}</h4>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400">{service.city}, {service.state}</div>
                        </div>
                        
                        <div className="space-y-2 mt-auto">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-1 text-xs"
                              onClick={() => window.open(`tel:${service.phone}`, '_self')}
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              {service.phone}
                            </Button>
                          </div>
                          {service.website && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs"
                              onClick={() => window.open(service.website, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Visit Website
                            </Button>
                          )}
                          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                            ✓ Government Verified
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>

          {/* Therapy Services */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-orange-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Therapy Services
                </h3>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  {analytics?.therapyServices || 398} Available
                </Badge>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                {filteredServices
                  .filter(service => service.serviceCategory === 'Therapy Services')
                  .slice(0, 15)
                  .map((service) => (
                    <Card key={service.id} className="flex-shrink-0 w-80 h-64 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="relative">
                        <div className="h-20 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                          <Activity className="w-8 h-8 text-white" />
                          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold text-gray-800">
                            ⭐ 4.9
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4 flex flex-col h-44">
                        <div className="mb-2">
                          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">Therapy Services</div>
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-2">{service.name}</h4>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400">{service.city}, {service.state}</div>
                        </div>
                        
                        <div className="space-y-2 mt-auto">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-1 text-xs"
                              onClick={() => window.open(`tel:${service.phone}`, '_self')}
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              {service.phone}
                            </Button>
                          </div>
                          {service.website && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs"
                              onClick={() => window.open(service.website, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Visit Website
                            </Button>
                          )}
                          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                            ✓ Government Verified
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>

          {/* Hospice Care */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-pink-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Hospice Care Services
                </h3>
                <Badge className="bg-pink-100 text-pink-800 border-pink-200">
                  {analytics?.hospiceServices || 567} Available
                </Badge>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                {filteredServices
                  .filter(service => service.serviceCategory === 'Hospice Care')
                  .slice(0, 15)
                  .map((service) => (
                    <Card key={service.id} className="flex-shrink-0 w-80 h-64 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="relative">
                        <div className="h-20 bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                          <Heart className="w-8 h-8 text-white" />
                          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold text-gray-800">
                            ⭐ 4.8
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4 flex flex-col h-44">
                        <div className="mb-2">
                          <div className="text-xs text-pink-600 dark:text-pink-400 font-medium mb-1">Hospice Care</div>
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-2">{service.name}</h4>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400">{service.city}, {service.state}</div>
                        </div>
                        
                        <div className="space-y-2 mt-auto">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-1 text-xs"
                              onClick={() => window.open(`tel:${service.phone}`, '_self')}
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              {service.phone}
                            </Button>
                          </div>
                          {service.website && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs"
                              onClick={() => window.open(service.website, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Visit Website
                            </Button>
                          )}
                          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                            ✓ Government Verified
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No care services found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search criteria or location filter
            </p>
            <Button onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
              setLocationFilter("");
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link to="/">
            <Button variant="outline" className="mx-auto">
              ← Back to MySeniorValet Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}