import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Pill, Car, Stethoscope, Phone, Home, DollarSign, ExternalLink, CheckCircle, Shield, Grid3X3 } from 'lucide-react';

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

  // Separate featured and regular vendors
  const featuredVendors = vendors.filter(v => v.isFeatured).sort((a, b) => a.displayOrder - b.displayOrder);
  const regularVendors = vendors.filter(v => !v.isFeatured).sort((a, b) => a.displayOrder - b.displayOrder);

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
        {/* Mobile Category Selector - Dropdown */}
        <div className="sm:hidden mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Category
          </label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {selectedCategory === 'all' ? (
                    <>
                      <Grid3X3 className="w-4 h-4" />
                      <span>All Vendors</span>
                    </>
                  ) : (
                    <>
                      {(() => {
                        const category = categories.find(c => c.slug === selectedCategory);
                        const Icon = category ? iconMap[category.icon || 'ShoppingCart'] : ShoppingCart;
                        return (
                          <>
                            <Icon className="w-4 h-4" />
                            <span>{category?.name || 'Select Category'}</span>
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  <span>All Vendors</span>
                  <Badge variant="secondary" className="ml-auto">
                    {vendors.length}
                  </Badge>
                </div>
              </SelectItem>
              {categories.map((category) => {
                const Icon = iconMap[category.icon || 'ShoppingCart'];
                const vendorCount = vendors.filter(v => v.categoryId === category.id).length;
                return (
                  <SelectItem key={category.slug} value={category.slug}>
                    <div className="flex items-center gap-2 w-full">
                      <Icon className="w-4 h-4" />
                      <span>{category.name}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {vendorCount}
                      </Badge>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Tablet Category Grid */}
        <div className="hidden sm:block lg:hidden mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Choose Category</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedCategory === 'all'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Grid3X3 className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-medium">All</div>
              <Badge variant="secondary" className="mt-1 text-xs">
                {vendors.length}
              </Badge>
            </button>
            {categories.map((category) => {
              const Icon = iconMap[category.icon || 'ShoppingCart'];
              const vendorCount = vendors.filter(v => v.categoryId === category.id).length;
              const isActive = selectedCategory === category.slug;
              
              // Category-specific colors
              const categoryColors: Record<string, string> = {
                'groceries': 'border-green-500 bg-green-50 dark:bg-green-900/20',
                'pharmacy': 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
                'transportation': 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
                'medical-supplies': 'border-red-500 bg-red-50 dark:bg-red-900/20',
                'communication': 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
                'home-services': 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
                'financial': 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
              };
              
              return (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isActive
                      ? categoryColors[category.slug] || 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-medium">{category.name.split(' ')[0]}</div>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {vendorCount}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden lg:block mb-8">
          <TabsList className="inline-flex h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-lg flex-wrap gap-2">
            <TabsTrigger 
              value="all" 
              className="inline-flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md transition-all font-medium"
            >
              <Grid3X3 className="w-4 h-4" />
              All Vendors
              <Badge variant="secondary" className="ml-1">
                {vendors.length}
              </Badge>
            </TabsTrigger>
            {categories.map((category) => {
              const Icon = iconMap[category.icon || 'ShoppingCart'];
              const vendorCount = vendors.filter(v => v.categoryId === category.id).length;
              
              // Category-specific active colors for desktop
              const categoryActiveColors: Record<string, string> = {
                'groceries': 'data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30 data-[state=active]:border-green-500',
                'pharmacy': 'data-[state=active]:bg-orange-100 dark:data-[state=active]:bg-orange-900/30 data-[state=active]:border-orange-500',
                'transportation': 'data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30 data-[state=active]:border-blue-500',
                'medical-supplies': 'data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900/30 data-[state=active]:border-red-500',
                'communication': 'data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30 data-[state=active]:border-purple-500',
                'home-services': 'data-[state=active]:bg-yellow-100 dark:data-[state=active]:bg-yellow-900/30 data-[state=active]:border-yellow-500',
                'financial': 'data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900/30 data-[state=active]:border-indigo-500',
              };
              
              return (
                <TabsTrigger 
                  key={category.slug} 
                  value={category.slug} 
                  className={`inline-flex items-center gap-2 px-4 py-2.5 border-2 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-all font-medium ${
                    categoryActiveColors[category.slug] || 'data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 data-[state=active]:border-gray-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                  <Badge variant="secondary" className="ml-1">
                    {vendorCount}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-6">
          <div className="flex flex-col space-y-6">
            {/* Featured Vendors Section */}
            {featuredVendors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Featured Partners</h3>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    Top Picks
                  </Badge>
                </div>
                <div className="flex flex-col space-y-4">
                  {featuredVendors.map(renderVendorRow)}
                </div>
              </div>
            )}
            
            {/* All Other Vendors */}
            {regularVendors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  All Service Providers
                </h3>
                <div className="flex flex-col space-y-4">
                  {regularVendors.map(renderVendorRow)}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        {categories.map((category) => {
          const categoryFeatured = vendors.filter(v => v.categoryId === category.id && v.isFeatured).sort((a, b) => a.displayOrder - b.displayOrder);
          const categoryRegular = vendors.filter(v => v.categoryId === category.id && !v.isFeatured).sort((a, b) => a.displayOrder - b.displayOrder);
          
          return (
            <TabsContent key={category.slug} value={category.slug} className="mt-6">
              <div className="flex flex-col space-y-6">
                {/* Featured Vendors in Category */}
                {categoryFeatured.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Featured {category.name}</h3>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        Top Picks
                      </Badge>
                    </div>
                    <div className="flex flex-col space-y-4">
                      {categoryFeatured.map(renderVendorRow)}
                    </div>
                  </div>
                )}
                
                {/* Regular Vendors in Category */}
                {categoryRegular.length > 0 && (
                  <div>
                    {categoryFeatured.length > 0 && (
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        More {category.name} Services
                      </h3>
                    )}
                    <div className="flex flex-col space-y-4">
                      {categoryRegular.map(renderVendorRow)}
                    </div>
                  </div>
                )}
                
                {/* Empty State */}
                {categoryFeatured.length === 0 && categoryRegular.length === 0 && (
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