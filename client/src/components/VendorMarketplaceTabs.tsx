import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Pill, Car, Stethoscope, Phone, Home, DollarSign, ExternalLink, Star, CheckCircle } from 'lucide-react';

interface MarketplaceCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

interface MarketplaceVendor {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  logoUrl: string;
  externalUrl: string;
  isFeatured: boolean;
  displayOrder: number;
}

const iconMap: Record<string, any> = {
  ShoppingCart,
  Pill,
  Car,
  Stethoscope,
  Phone,
  Home,
  DollarSign,
};

export function VendorMarketplaceTabs() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<MarketplaceCategory[]>({
    queryKey: ['/api/marketplace/categories'],
  });

  // Fetch vendors
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<MarketplaceVendor[]>({
    queryKey: ['/api/marketplace/vendors'],
  });

  const handleVendorClick = (vendorId: number) => {
    window.open(`/api/marketplace/out/${vendorId}`, '_blank');
  };

  if (categoriesLoading || vendorsLoading) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-gray-500">Loading marketplace...</p>
      </div>
    );
  }

  if (!categories.length || !vendors.length) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-gray-500">No marketplace vendors available</p>
      </div>
    );
  }

  const renderVendorCard = (vendor: MarketplaceVendor) => {
    const category = categories.find(c => c.id === vendor.categoryId);
    const Icon = iconMap[category?.icon || 'ShoppingCart'];
    
    // Define vendor-specific styling
    const vendorThemes: Record<string, any> = {
      'amazon': {
        gradient: 'from-orange-500 to-orange-600',
        borderColor: 'border-orange-200 dark:border-orange-400',
        priceColor: 'text-orange-600 dark:text-orange-400',
        buttonBg: 'bg-orange-600 hover:bg-orange-700',
        badge: 'Prime Eligible',
        badgeBg: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
      },
      'gogograndparent': {
        gradient: 'from-blue-500 to-blue-600',
        borderColor: 'border-blue-200 dark:border-blue-400',
        priceColor: 'text-blue-600 dark:text-blue-400',
        buttonBg: 'bg-blue-600 hover:bg-blue-700',
        badge: 'No Smartphone',
        badgeBg: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      },
      'two-men-and-a-truck': {
        gradient: 'from-green-500 to-green-600',
        borderColor: 'border-green-200 dark:border-green-400',
        priceColor: 'text-green-600 dark:text-green-400',
        buttonBg: 'bg-green-600 hover:bg-green-700',
        badge: '96% Success Rate',
        badgeBg: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      },
      'default': {
        gradient: 'from-gray-500 to-gray-600',
        borderColor: 'border-gray-200 dark:border-gray-400',
        priceColor: 'text-gray-600 dark:text-gray-400',
        buttonBg: 'bg-gray-600 hover:bg-gray-700',
        badge: 'Partner',
        badgeBg: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
      }
    };
    
    const theme = vendorThemes[vendor.slug] || vendorThemes.default;
    
    return (
      <div 
        key={vendor.id}
        onClick={() => handleVendorClick(vendor.id)}
        className="cursor-pointer"
      >
        <Card className={`overflow-hidden flex-shrink-0 w-64 hover:shadow-xl transition-all duration-300 border-2 ${theme.borderColor} bg-white dark:bg-gray-800`}>
          <div className="relative">
            <div className={`aspect-[4/3] bg-gradient-to-br ${theme.gradient} flex items-center justify-center p-4`}>
              {vendor.logoUrl ? (
                <div className="bg-white rounded-lg p-3 shadow-lg">
                  <img 
                    src={vendor.logoUrl} 
                    alt={vendor.name} 
                    className="h-16 w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="text-center text-white">
                  <Icon className="w-12 h-12 mb-2 mx-auto" />
                  <div className="text-xl font-bold">{vendor.name}</div>
                </div>
              )}
            </div>
            {vendor.isFeatured && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold animate-pulse">
                  🟢 LIVE NOW
                </Badge>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{vendor.name}</h4>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">4.8</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{vendor.shortDescription}</p>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-lg font-bold ${theme.priceColor}`}>
                {category?.name === 'Financial Services' ? 'Consultation' : 'Service Available'}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${theme.badgeBg}`}>
                {theme.badge}
              </span>
            </div>
            <div className="space-y-1 mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-300">Verified Partner</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-300">Senior Specialists</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-300">Trusted Since 2024</span>
              </div>
            </div>
            <Button className={`w-full ${theme.buttonBg} text-white text-sm py-2`}>
              Learn More →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="w-full">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="w-full flex justify-start mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger value="all" className="px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-md transition-all">
            All Vendors
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger 
              key={category.slug} 
              value={category.slug} 
              className="px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-md transition-all"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
            {vendors.map(renderVendorCard)}
          </div>
        </TabsContent>
        
        {categories.map((category) => (
          <TabsContent key={category.slug} value={category.slug} className="mt-6">
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
              {vendors
                .filter(v => v.categoryId === category.id)
                .map(renderVendorCard)}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}