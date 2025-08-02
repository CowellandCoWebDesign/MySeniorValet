import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Pill, Car, Stethoscope, Phone, Home, DollarSign, ExternalLink, CheckCircle, Shield } from 'lucide-react';

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

  // Sort all vendors by display order
  const sortedVendors = vendors.sort((a, b) => a.displayOrder - b.displayOrder);

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
      'amazon-pharmacy': {
        borderColor: vendor.isFeatured ? 'border-orange-400 dark:border-orange-500' : 'border-orange-300 dark:border-orange-600',
        bgGradient: vendor.isFeatured ? 'from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30' : 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
        iconBg: 'bg-orange-100 dark:bg-orange-800',
        iconColor: 'text-orange-600 dark:text-orange-300',
        buttonBg: 'bg-orange-600 hover:bg-orange-700',
        badge: 'Prime Eligible',
        badgeBg: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
        liveBadgeBg: 'bg-orange-500'
      },
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
        borderColor: vendor.isFeatured ? 'border-blue-400 dark:border-blue-500' : 'border-blue-300 dark:border-blue-600',
        bgGradient: vendor.isFeatured ? 'from-blue-100 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30' : 'from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20',
        iconBg: 'bg-blue-100 dark:bg-blue-800',
        iconColor: 'text-blue-600 dark:text-blue-300',
        buttonBg: 'bg-blue-600 hover:bg-blue-700',
        badge: 'Everyday Low Prices',
        badgeBg: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
        liveBadgeBg: 'bg-blue-500'
      },
      'tmobile-55plus': {
        borderColor: vendor.isFeatured ? 'border-pink-400 dark:border-pink-500' : 'border-pink-300 dark:border-pink-600',
        bgGradient: vendor.isFeatured ? 'from-pink-100 to-fuchsia-100 dark:from-pink-900/30 dark:to-fuchsia-900/30' : 'from-pink-50 to-fuchsia-50 dark:from-pink-900/20 dark:to-fuchsia-900/20',
        iconBg: 'bg-pink-100 dark:bg-pink-800',
        iconColor: 'text-pink-600 dark:text-pink-300',
        buttonBg: 'bg-pink-600 hover:bg-pink-700',
        badge: '55+ Special',
        badgeBg: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
        liveBadgeBg: 'bg-pink-500'
      },
      '1800florals': {
        borderColor: vendor.isFeatured ? 'border-purple-400 dark:border-purple-500' : 'border-purple-300 dark:border-purple-600',
        bgGradient: vendor.isFeatured ? 'from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30' : 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
        iconBg: 'bg-purple-100 dark:bg-purple-800',
        iconColor: 'text-purple-600 dark:text-purple-300',
        buttonBg: 'bg-purple-600 hover:bg-purple-700',
        badge: 'Same Day Delivery',
        badgeBg: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
        liveBadgeBg: 'bg-purple-500'
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
        badge: 'Service',
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
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 font-medium shadow-sm">
                          ⭐ Featured
                        </Badge>
                      )}

                      <Badge className={`${theme.badgeBg} text-xs px-2 py-1 font-medium`}>
                        {theme.badge}
                      </Badge>

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
                        Available Service
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
        {/* Enhanced colorful tabs in 3-column grid layout */}
        <TabsList className="grid grid-cols-3 gap-3 h-auto p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl mb-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <TabsTrigger 
            value="all" 
            className="group flex flex-col items-center justify-center gap-2 px-4 py-4 bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:shadow-lg hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl transition-all duration-200 text-sm font-medium border-2 border-gray-200 dark:border-gray-700 data-[state=active]:border-transparent h-full min-h-[100px]"
          >
            <div className="relative">
              <span className="text-3xl mb-1 group-hover:scale-110 transition-transform duration-200">🏪</span>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-md opacity-0 group-hover:opacity-20 group-data-[state=active]:opacity-30 transition-opacity duration-200"></div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 group-data-[state=active]:text-white">All Vendors</span>
            <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-full group-data-[state=active]:from-white/20 group-data-[state=active]:to-white/30 group-data-[state=active]:text-white shadow-sm group-hover:shadow-md transition-shadow duration-200">
              {vendors.length}
            </span>
          </TabsTrigger>
          {categories.map((category) => {
            const Icon = iconMap[category.icon || 'ShoppingCart'];
            const vendorCount = vendors.filter(v => v.categoryId === category.id).length;
            
            // Category-specific gradient colors
            const categoryGradients: Record<string, string> = {
              'groceries': 'data-[state=active]:from-green-500 data-[state=active]:to-emerald-500',
              'pharmacy': 'data-[state=active]:from-orange-500 data-[state=active]:to-red-500',
              'transportation': 'data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500',
              'medical-supplies': 'data-[state=active]:from-red-500 data-[state=active]:to-pink-500',
              'communication': 'data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500',
              'home-services': 'data-[state=active]:from-yellow-500 data-[state=active]:to-amber-500',
              'financial': 'data-[state=active]:from-indigo-500 data-[state=active]:to-blue-600',
            };
            
            // Category-specific hover colors
            const categoryHovers: Record<string, string> = {
              'groceries': 'hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20',
              'pharmacy': 'hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-900/20 dark:hover:to-red-900/20',
              'transportation': 'hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20',
              'medical-supplies': 'hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20',
              'communication': 'hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20',
              'home-services': 'hover:bg-gradient-to-br hover:from-yellow-50 hover:to-amber-50 dark:hover:from-yellow-900/20 dark:hover:to-amber-900/20',
              'financial': 'hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50 dark:hover:from-indigo-900/20 dark:hover:to-blue-900/20',
            };
            
            return (
              <TabsTrigger 
                key={category.slug} 
                value={category.slug} 
                className={`group flex flex-col items-center justify-center gap-2 px-4 py-4 bg-white dark:bg-gray-800 hover:shadow-lg hover:scale-105 ${categoryHovers[category.slug] || 'hover:bg-gray-50 dark:hover:bg-gray-700'} data-[state=active]:bg-gradient-to-r ${categoryGradients[category.slug] || 'data-[state=active]:from-gray-500 data-[state=active]:to-gray-600'} data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl transition-all duration-200 text-sm font-medium border-2 border-gray-200 dark:border-gray-700 data-[state=active]:border-transparent h-full min-h-[100px]`}
              >
                <div className="relative">
                  <Icon className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform duration-200" />
                  <div className={`absolute -inset-2 bg-gradient-to-r ${categoryGradients[category.slug]?.replace('data-[state=active]:', '') || 'from-gray-400 to-gray-500'} rounded-full blur-md opacity-0 group-hover:opacity-20 group-data-[state=active]:opacity-30 transition-opacity duration-200`}></div>
                </div>
                <span className="text-xs font-bold text-center line-clamp-2 uppercase tracking-wider text-gray-700 dark:text-gray-300 group-data-[state=active]:text-white">{category.name}</span>
                {vendorCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-full group-data-[state=active]:from-white/20 group-data-[state=active]:to-white/30 group-data-[state=active]:text-white shadow-sm group-hover:shadow-md transition-shadow duration-200">
                    {vendorCount}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="flex flex-col space-y-6">
            {/* Featured Partners Header with Live Status Indicators */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Featured Partners
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">Live integrations active</span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">More providers launching weekly</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">Now Available!</div>
                  <div className="text-sm text-green-600 dark:text-green-300 font-medium">Service recommendations</div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <div className="text-green-600 dark:text-green-400 mr-2">✅</div>
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    <strong>Live Provider Network:</strong> Curated selection of service providers for your senior living needs.
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Featured services • Amazon Pharmacy • Walmart • T-Mobile 55+ • 1-800-FLORALS • Two Men and a Truck 🚚 • Additional vendors being added weekly
              </p>
              
              {/* Affiliate Disclosure */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <strong>Disclosure:</strong> MySeniorValet participates in the Amazon Services LLC Associates Program. All other vendors are listed for your convenience without formal partnerships unless marked as "Official Partner."
                </p>
              </div>
            </div>

            {/* All Service Providers */}
            {sortedVendors.length > 0 && (
              <div>
                <div className="flex flex-col space-y-4">
                  {sortedVendors.map(renderVendorRow)}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        {categories.map((category) => {
          const categoryVendors = vendors.filter(v => v.categoryId === category.id).sort((a, b) => a.displayOrder - b.displayOrder);
          
          return (
            <TabsContent key={category.slug} value={category.slug} className="mt-6">
              <div className="flex flex-col space-y-6">
                {/* Vendors in Category */}
                {categoryVendors.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                      {category.name} Services
                    </h3>
                    <div className="flex flex-col space-y-4">
                      {categoryVendors.map(renderVendorRow)}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No vendors available in this category</p>
                  </div>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}