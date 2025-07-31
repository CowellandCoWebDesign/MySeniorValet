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

  const renderVendorCard = (vendor: MarketplaceVendor) => {
    const category = categories.find(c => c.id === vendor.categoryId);
    const Icon = iconMap[category?.icon || 'ShoppingCart'];
    
    return (
      <Card 
        key={vendor.id}
        onClick={() => handleVendorClick(vendor.id)}
        className="cursor-pointer hover:shadow-xl transition-all transform hover:scale-105 border-2"
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="w-16 h-16 bg-white rounded-lg p-1 shadow-sm overflow-hidden">
              {vendor.logoUrl ? (
                <img 
                  src={vendor.logoUrl} 
                  alt={vendor.name} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Icon className="w-8 h-8" />
                </div>
              )}
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
          
          <h4 className="font-bold text-sm mb-1">{vendor.name}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
            {vendor.shortDescription}
          </p>
          
          {vendor.isFeatured && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
              FEATURED
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8">
          <TabsTrigger value="all" className="text-xs lg:text-sm">All</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.slug} value={category.slug} className="text-xs lg:text-sm">
              {category.name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {vendors.map(renderVendorCard)}
          </div>
        </TabsContent>
        
        {categories.map((category) => (
          <TabsContent key={category.slug} value={category.slug} className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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