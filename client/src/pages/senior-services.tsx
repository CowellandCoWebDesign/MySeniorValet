import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, Pill, Truck, Building2, Phone, Building, Scale, 
  Ambulance, Home, Utensils, Briefcase, DollarSign, Accessibility,
  Heart, Sun, MapPin, Star, ExternalLink, ShoppingCart, Search,
  Filter, ChevronRight, Info, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { Link } from 'wouter';
import { NavigationHeader } from "@/components/NavigationHeader";

const categoryIcons: Record<string, React.ReactNode> = {
  moving: <Truck className="w-5 h-5" />,
  prescription_delivery: <Pill className="w-5 h-5" />,
  junk_removal: <Package className="w-5 h-5" />,
  storage: <Building2 className="w-5 h-5" />,
  cell_phone_access: <Phone className="w-5 h-5" />,
  senior_center: <Building className="w-5 h-5" />,
  ombudsman: <Scale className="w-5 h-5" />,
  medical_transport: <Ambulance className="w-5 h-5" />,
  home_care: <Home className="w-5 h-5" />,
  meal_delivery: <Utensils className="w-5 h-5" />,
  legal_services: <Briefcase className="w-5 h-5" />,
  financial_planning: <DollarSign className="w-5 h-5" />,
  medical_equipment: <Accessibility className="w-5 h-5" />,
  hospice_care: <Heart className="w-5 h-5" />,
  adult_day_care: <Sun className="w-5 h-5" />
};

const categoryDescriptions: Record<string, string> = {
  moving: "Professional senior move management and downsizing services",
  prescription_delivery: "Pharmacy delivery services for medications",
  junk_removal: "Estate cleanout and decluttering services",
  storage: "Storage solutions for downsizing transitions",
  cell_phone_access: "Affordable cell phone programs for seniors",
  senior_center: "Community centers with activities and social programs",
  ombudsman: "Advocacy services for senior living residents",
  medical_transport: "Non-emergency medical transportation services",
  home_care: "In-home care and assistance services",
  meal_delivery: "Nutritious meal delivery for seniors",
  legal_services: "Elder law and estate planning attorneys",
  financial_planning: "Retirement and financial advisory services",
  medical_equipment: "Durable medical equipment and supplies",
  hospice_care: "End-of-life care and support services",
  adult_day_care: "Daytime care programs for seniors"
};

export default function SeniorServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get user's location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Location access denied. Showing services for default area.");
          // Default to Sacramento area
          setUserLocation({ lat: 38.5816, lng: -121.4944 });
        }
      );
    } else {
      setLocationError("Geolocation not supported. Showing services for default area.");
      setUserLocation({ lat: 38.5816, lng: -121.4944 });
    }
  }, []);

  // Fetch services based on location
  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['/api/services/discover', userLocation, selectedCategory],
    queryFn: async () => {
      if (!userLocation) return null;
      const params = new URLSearchParams({
        lat: userLocation.lat.toString(),
        lng: userLocation.lng.toString(),
        radius: '10',
        ...(selectedCategory !== 'all' && { category: selectedCategory })
      });
      const response = await fetch(`/api/services/discover?${params}`);
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    },
    enabled: !!userLocation
  });

  const filteredServices = servicesData?.services?.filter((service: any) => 
    searchQuery === '' || 
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const ServiceCard = ({ service }: { service: any }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              {categoryIcons[service.category]}
            </div>
            <div>
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {service.provider}
              </p>
            </div>
          </div>
          {service.verified && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {service.description}
        </p>

        {/* Features */}
        {service.features && service.features.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Services:</p>
            <div className="flex flex-wrap gap-1">
              {service.features.map((feature: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-2 pt-2 border-t">
          {service.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-500" />
              <a href={`tel:${service.phone}`} className="text-blue-600 hover:underline">
                {service.phone}
              </a>
            </div>
          )}
          {service.distance && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{service.distance.toFixed(1)} miles away</span>
            </div>
          )}
          {service.rating && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>{service.rating} rating</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => {
              if (service.phone) {
                window.location.href = `tel:${service.phone}`;
              }
            }}
            className="flex-1"
            variant="default"
          >
            <Phone className="w-4 h-4 mr-2" />
            Call Now
          </Button>
          {service.website && (
            <Button
              onClick={() => window.open(service.website, '_blank')}
              variant="outline"
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Website
            </Button>
          )}
        </div>

        {/* Pricing */}
        {service.pricing && (
          <div className="text-center pt-2 border-t">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              {service.pricing}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader 
        title="Senior Services Directory" 
        subtitle="Find trusted services to support your senior living journey"
      />

      {/* Location Alert */}
      {locationError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm text-yellow-800 dark:text-yellow-300">{locationError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search services by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.keys(categoryIcons).map((category) => (
                <SelectItem key={category} value={category}>
                  <div className="flex items-center gap-2">
                    {categoryIcons[category]}
                    <span className="capitalize">{category.replace(/_/g, ' ')}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="services">Available Services</TabsTrigger>
            <TabsTrigger value="categories">Browse by Category</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
                  </div>
                ))}
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service: any) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No services found matching your criteria.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categoryDescriptions).map(([category, description]) => (
                <Card 
                  key={category}
                  className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          {categoryIcons[category]}
                        </div>
                        <h3 className="font-semibold capitalize">
                          {category.replace(/_/g, ' ')}
                        </h3>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}