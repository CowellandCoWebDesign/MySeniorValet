import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Pill, Car, Stethoscope, Phone, Home, DollarSign, ExternalLink } from 'lucide-react';

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

  const renderVendorRow = (vendor: MarketplaceVendor) => {
    const category = categories.find(c => c.id === vendor.categoryId);
    const Icon = iconMap[category?.icon || 'ShoppingCart'];
    
    return (
      <div 
        key={vendor.id}
        onClick={() => handleVendorClick(vendor.id)}
        className="w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <Card className="border-0 shadow-none rounded-none border-b">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Logo */}
              <div className="w-full sm:w-24 h-24 bg-white rounded-lg p-2 shadow-sm overflow-hidden flex-shrink-0 border mx-auto sm:mx-0">
                {vendor.logoUrl ? (
                  <img 
                    src={vendor.logoUrl} 
                    alt={vendor.name} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Icon className="w-12 h-12" />
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h4 className="font-bold text-lg sm:text-xl">{vendor.name}</h4>
                      {vendor.isFeatured && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          FEATURED
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3">
                      {vendor.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Icon className="w-4 h-4" />
                        {category?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <ExternalLink className="w-4 h-4" />
                        Visit Website
                      </span>
                    </div>
                  </div>
                  
                  {/* Action button */}
                  <button className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium">
                    Shop Now
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
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
          <div className="flex flex-col space-y-0">
            {vendors.map(renderVendorRow)}
          </div>
        </TabsContent>
        
        {categories.map((category) => (
          <TabsContent key={category.slug} value={category.slug} className="mt-6">
            <div className="flex flex-col space-y-0">
              {vendors
                .filter(v => v.categoryId === category.id)
                .map(renderVendorRow)}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}