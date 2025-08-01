import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Pill, Car, Stethoscope, Phone, Home, DollarSign, ExternalLink, Star, CheckCircle, Shield } from 'lucide-react';

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
    
    // Define vendor-specific styling
    const vendorThemes: Record<string, any> = {
      'amazon': {
        borderColor: 'border-orange-300 dark:border-orange-600',
        bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
        iconBg: 'bg-orange-100 dark:bg-orange-800',
        iconColor: 'text-orange-600 dark:text-orange-300',
        buttonBg: 'bg-orange-600 hover:bg-orange-700',
        badge: 'Prime Eligible',
        badgeBg: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
        liveBadgeBg: 'bg-orange-500'
      },
      'walmart': {
        borderColor: 'border-blue-300 dark:border-blue-600',
        bgGradient: 'from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20',
        iconBg: 'bg-blue-100 dark:bg-blue-800',
        iconColor: 'text-blue-600 dark:text-blue-300',
        buttonBg: 'bg-blue-600 hover:bg-blue-700',
        badge: 'Everyday Low Prices',
        badgeBg: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
        liveBadgeBg: 'bg-blue-500'
      },
      'gogograndparent': {
        borderColor: 'border-purple-300 dark:border-purple-600',
        bgGradient: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
        iconBg: 'bg-purple-100 dark:bg-purple-800',
        iconColor: 'text-purple-600 dark:text-purple-300',
        buttonBg: 'bg-purple-600 hover:bg-purple-700',
        badge: 'No Smartphone Needed',
        badgeBg: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
        liveBadgeBg: 'bg-purple-500'
      },
      'two-men-and-a-truck': {
        borderColor: 'border-green-300 dark:border-green-600',
        bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
        iconBg: 'bg-green-100 dark:bg-green-800',
        iconColor: 'text-green-600 dark:text-green-300',
        buttonBg: 'bg-green-600 hover:bg-green-700',
        badge: '96% Success Rate',
        badgeBg: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        liveBadgeBg: 'bg-green-500'
      },
      '1-800-flowers': {
        borderColor: 'border-pink-300 dark:border-pink-600',
        bgGradient: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
        iconBg: 'bg-pink-100 dark:bg-pink-800',
        iconColor: 'text-pink-600 dark:text-pink-300',
        buttonBg: 'bg-pink-600 hover:bg-pink-700',
        badge: 'Same Day Delivery',
        badgeBg: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
        liveBadgeBg: 'bg-pink-500'
      },
      'default': {
        borderColor: 'border-gray-300 dark:border-gray-600',
        bgGradient: 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
        iconBg: 'bg-gray-100 dark:bg-gray-800',
        iconColor: 'text-gray-600 dark:text-gray-300',
        buttonBg: 'bg-gray-600 hover:bg-gray-700',
        badge: 'Partner',
        badgeBg: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
        liveBadgeBg: 'bg-gray-500'
      }
    };
    
    const theme = vendorThemes[vendor.slug] || vendorThemes.default;
    
    return (
      <div 
        key={vendor.id}
        onClick={() => handleVendorClick(vendor.id)}
        className="w-full cursor-pointer hover:shadow-lg transition-all duration-200"
      >
        <Card className={`border-2 ${theme.borderColor} bg-gradient-to-r ${theme.bgGradient} hover:shadow-xl transition-all duration-300`}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Logo with brand colors */}
              <div className={`w-full sm:w-24 h-24 ${theme.iconBg} rounded-lg p-2 shadow-sm overflow-hidden flex-shrink-0 border border-white/50 dark:border-gray-700/50 mx-auto sm:mx-0`}>
                {vendor.logoUrl ? (
                  <img 
                    src={vendor.logoUrl} 
                    alt={vendor.name} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${theme.iconColor}`}>
                    <Icon className="w-12 h-12" />
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h4 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100">{vendor.name}</h4>
                      {vendor.isFeatured && (
                        <Badge className={`${theme.liveBadgeBg} text-white text-xs px-2 py-1 font-bold animate-pulse`}>
                          🟢 LIVE NOW
                        </Badge>
                      )}
                      <Badge className={`${theme.badgeBg} text-xs px-2 py-1 font-medium`}>
                        {theme.badge}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">4.8</span>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3">
                      {vendor.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                      <span className={`flex items-center gap-1 ${theme.iconColor} font-medium`}>
                        <Icon className="w-4 h-4" />
                        {category?.name}
                      </span>
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Verified Partner
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                        <Shield className="w-4 h-4" />
                        Senior Specialists
                      </span>
                    </div>
                  </div>
                  
                  {/* Action button with brand colors */}
                  <Button className={`w-full sm:w-auto px-6 py-3 ${theme.buttonBg} text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl`}>
                    Shop Now
                    <ExternalLink className="w-4 h-4" />
                  </Button>
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
          <div className="flex flex-col space-y-4">
            {vendors.map(renderVendorRow)}
          </div>
        </TabsContent>
        
        {categories.map((category) => (
          <TabsContent key={category.slug} value={category.slug} className="mt-6">
            <div className="flex flex-col space-y-4">
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