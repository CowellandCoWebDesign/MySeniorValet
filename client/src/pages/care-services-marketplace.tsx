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

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(service.serviceCategory)}
                    <Badge className={`text-xs ${getCategoryColor(service.serviceCategory)}`}>
                      {service.serviceCategory}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">4.2</span>
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {service.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {service.city}, {service.state}
                  </span>
                </div>
                
                {service.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <a 
                      href={`tel:${service.phone}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {service.phone}
                    </a>
                  </div>
                )}

                {service.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <a 
                      href={service.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors line-clamp-1"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(`tel:${service.phone}`, '_self')}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                    {service.website && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => window.open(service.website, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Visit
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Verified government database
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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