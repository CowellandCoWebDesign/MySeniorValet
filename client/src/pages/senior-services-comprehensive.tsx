import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { NavigationHeader } from "@/components/NavigationHeader";
import { 
  Package, Pill, Truck, Building2, Phone, Building, Scale, 
  Ambulance, Home, Utensils, Briefcase, DollarSign, Accessibility,
  Heart, Sun, MapPin, Star, ExternalLink, ShoppingCart, Search,
  Filter, ChevronRight, Info, Clock, CheckCircle, XCircle, 
  Users, Activity, Shield, Brain, HeartHandshake, Car, Apple,
  Eye, Ear, Footprints, TestTube, BedDouble, Palette, Smile,
  Zap, UserCheck, Calendar, AlertCircle, Gift, Sparkles,
  HandHeart, Stethoscope, ShieldCheck, Wrench, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

// Comprehensive service categories based on actual database content
const serviceCategories = [
  {
    id: 'all',
    name: 'All Services',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    description: 'Browse all available services'
  },
  {
    id: 'moving',
    name: 'Moving & Relocation',
    icon: Truck,
    color: 'from-blue-500 to-cyan-500',
    description: 'Professional moving and downsizing services',
    keywords: ['TWO MEN AND A TRUCK', 'moving', 'relocation', 'downsizing']
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: Car,
    color: 'from-green-500 to-emerald-500',
    description: 'Ride services and medical transport',
    keywords: ['GoGoGrandparent', 'transport', 'ride', 'shuttle']
  },
  {
    id: 'home_care',
    name: 'Home Care',
    icon: Home,
    color: 'from-teal-500 to-cyan-500',
    description: 'In-home care and support services',
    keywords: ['home care', 'home health', 'caregiving', 'in-home']
  },
  {
    id: 'dental',
    name: 'Dental Care',
    icon: Smile,
    color: 'from-pink-500 to-rose-500',
    description: 'Dental services and oral health',
    keywords: ['dental', 'Aspen Dental', 'CareMore', 'DentaQuest', 'oral']
  },
  {
    id: 'medical_equipment',
    name: 'Medical Equipment',
    icon: Accessibility,
    color: 'from-indigo-500 to-purple-500',
    description: 'Durable medical equipment and supplies',
    keywords: ['equipment', 'DME', 'medical supply', 'wheelchair', 'walker']
  },
  {
    id: 'therapy',
    name: 'Therapy Services',
    icon: Activity,
    color: 'from-orange-500 to-red-500',
    description: 'Physical, occupational, and speech therapy',
    keywords: ['therapy', 'rehabilitation', 'physical therapy', 'OT', 'PT', 'speech']
  },
  {
    id: 'nutrition',
    name: 'Nutrition & Meals',
    icon: Apple,
    color: 'from-yellow-500 to-orange-500',
    description: 'Meal delivery and nutrition services',
    keywords: ['meal', 'nutrition', 'food', 'dietitian', 'delivery']
  },
  {
    id: 'companion',
    name: 'Companion Care',
    icon: Users,
    color: 'from-purple-600 to-pink-600',
    description: 'Social companionship and daily support',
    keywords: ['companion', 'social', 'friendship', 'accompaniment']
  },
  {
    id: 'hospice',
    name: 'Hospice Care',
    icon: HeartHandshake,
    color: 'from-gray-600 to-gray-700',
    description: 'End-of-life care and support',
    keywords: ['hospice', 'end-of-life', 'palliative']
  },
  {
    id: 'adult_day',
    name: 'Adult Day Programs',
    icon: Sun,
    color: 'from-amber-500 to-yellow-500',
    description: 'Daytime care and activities',
    keywords: ['adult day', 'day program', 'day care']
  },
  {
    id: 'vision',
    name: 'Vision Care',
    icon: Eye,
    color: 'from-violet-500 to-purple-500',
    description: 'Eye care and vision services',
    keywords: ['vision', 'eye', 'optical', 'optometry', 'glasses']
  },
  {
    id: 'hearing',
    name: 'Hearing Services',
    icon: Ear,
    color: 'from-red-500 to-pink-500',
    description: 'Hearing tests and hearing aids',
    keywords: ['hearing', 'audiology', 'hearing aid']
  },
  {
    id: 'legal',
    name: 'Legal Services',
    icon: Scale,
    color: 'from-slate-600 to-gray-700',
    description: 'Elder law and legal assistance',
    keywords: ['legal', 'attorney', 'lawyer', 'elder law']
  },
  {
    id: 'financial',
    name: 'Financial Planning',
    icon: DollarSign,
    color: 'from-green-600 to-emerald-600',
    description: 'Financial and insurance services',
    keywords: ['financial', 'insurance', 'planning', 'advisor']
  },
  {
    id: 'gifts',
    name: 'Gifts & Flowers',
    icon: Gift,
    color: 'from-pink-400 to-purple-400',
    description: 'Floral delivery and gift services',
    keywords: ['floral', 'flowers', 'gifts', '1-800-FLORALS']
  }
];

export default function SeniorServicesComprehensive() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch services from multiple sources
  const { data: vendorServices, isLoading: vendorsLoading } = useQuery({
    queryKey: ['/api/vendors/search', searchQuery],
    queryFn: async () => {
      const response = await fetch('/api/vendors/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 200 })
      });
      if (!response.ok) throw new Error('Failed to fetch vendor services');
      return response.json();
    }
  });

  const { data: careServices, isLoading: careLoading } = useQuery({
    queryKey: ['/api/care-services'],
  });

  // Filter services based on selected category
  const filterServicesByCategory = (services: any[]) => {
    if (!services) return [];
    if (selectedCategory === 'all') return services;

    const category = serviceCategories.find(cat => cat.id === selectedCategory);
    if (!category || !category.keywords) return services;

    return services.filter(service => {
      const searchText = `${service.name} ${service.description || ''} ${service.business_type || ''}`.toLowerCase();
      return category.keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
    });
  };

  const filteredVendorServices = filterServicesByCategory(vendorServices?.communities || []);
  const filteredCareServices = filterServicesByCategory(careServices?.services || []);
  
  // Combine and deduplicate services
  const allServices = [...filteredVendorServices, ...filteredCareServices];
  const isLoading = vendorsLoading || careLoading;

  // Statistics for each category
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return allServices.length;
    const category = serviceCategories.find(cat => cat.id === categoryId);
    if (!category || !category.keywords) return 0;
    
    return allServices.filter(service => {
      const searchText = `${service.name} ${service.description || ''}`.toLowerCase();
      return category.keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
    }).length;
  };

  const ServiceCard = ({ service }: { service: any }) => {
    const Icon = service.icon || Building;
    const isPartner = service.is_partner || service.featured;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="h-full hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  isPartner ? 'bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30' : 
                  'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <Icon className={`h-5 w-5 ${isPartner ? 'text-amber-600' : 'text-gray-600 dark:text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{service.name}</CardTitle>
                  {service.business_type && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {service.business_type}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {isPartner && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Partner
                  </Badge>
                )}
                {service.is_verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {service.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                {service.description}
              </p>
            )}
            
            {/* Service Details */}
            <div className="space-y-2">
              {service.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <a href={`tel:${service.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {service.phone}
                  </a>
                </div>
              )}
              
              {service.city && service.state && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{service.city}, {service.state}</span>
                </div>
              )}
              
              {service.average_rating && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="ml-1 font-medium">{service.average_rating.toFixed(1)}</span>
                  </div>
                  {service.total_reviews && (
                    <span className="text-gray-600 dark:text-gray-400">
                      ({service.total_reviews} reviews)
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Service Categories */}
            {service.serviceCategory && (
              <div className="pt-2 border-t">
                <Badge variant="outline" className="text-xs">
                  {service.serviceCategory}
                </Badge>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {service.phone && (
                <Button 
                  size="sm"
                  className="flex-1"
                  onClick={() => window.location.href = `tel:${service.phone}`}
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
              )}
              {service.website && (
                <Button 
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(service.website, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Website
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Hero Section */}
      <section className="px-4 py-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Comprehensive Senior Services Directory
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Discover {allServices.length.toLocaleString()}+ verified services to support your senior living journey
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for services, providers, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-6 text-lg bg-white dark:bg-gray-800 border-0"
            />
          </div>
        </div>
      </section>
      
      {/* Category Tabs */}
      <section className="px-4 py-8 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {serviceCategories.map((category) => {
                const Icon = category.icon;
                const count = getCategoryCount(category.id);
                const isActive = selectedCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-lg border transition-all whitespace-nowrap
                      ${isActive 
                        ? 'bg-gradient-to-r ' + category.color + ' text-white border-transparent shadow-lg scale-105' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{category.name}</span>
                    <Badge 
                      variant={isActive ? "secondary" : "outline"} 
                      className={isActive ? "bg-white/20 text-white border-white/30" : ""}
                    >
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </section>
      
      {/* Selected Category Info */}
      {selectedCategory !== 'all' && (
        <section className="px-4 py-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {serviceCategories.find(cat => cat.id === selectedCategory)?.description}
              </p>
            </div>
          </div>
        </section>
      )}
      
      {/* Services Grid */}
      <section className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {selectedCategory === 'all' ? 'All Services' : serviceCategories.find(cat => cat.id === selectedCategory)?.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Showing {allServices.length} services
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading services...</span>
            </div>
          )}
          
          {/* Services Display */}
          {!isLoading && allServices.length > 0 && (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {allServices.map((service, idx) => (
                <ServiceCard key={service.id || idx} service={service} />
              ))}
            </div>
          )}
          
          {/* No Results */}
          {!isLoading && allServices.length === 0 && (
            <Card className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No services found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or selecting a different category
              </p>
            </Card>
          )}
        </div>
      </section>
      
      {/* Featured Services Section */}
      <section className="px-4 py-12 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Why Choose MySeniorValet Services?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              All services in our directory are verified and vetted for quality and reliability
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <ShieldCheck className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verified Providers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All service providers are verified and background-checked
              </p>
            </Card>
            <Card className="text-center p-6">
              <HeartHandshake className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Senior-Focused</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Services specifically tailored for senior needs and preferences
              </p>
            </Card>
            <Card className="text-center p-6">
              <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Partner services meet our high standards for senior care
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}