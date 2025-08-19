import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ShoppingCart, Pill, Car, Stethoscope, Phone, Home, DollarSign, ExternalLink, CheckCircle, Shield, Truck, Building, Users, Scale, Calculator, Scissors, Users2 } from 'lucide-react';

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
      {/* Senior Vendor Marketplace Grid - 3x4 Layout */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8 max-w-4xl mx-auto">
        <Link href="/moving">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 relative overflow-hidden h-full">
            <CardContent className="p-2 sm:p-3 text-center">
              <div className="absolute top-1 right-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-1.5" />
              <h4 className="font-semibold text-xs sm:text-sm text-green-700 dark:text-green-300 line-clamp-2">Moving Services</h4>
              <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 mt-0.5 line-clamp-2">Senior move specialists</p>
              <div className="flex flex-col gap-0.5 mt-1">
                <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ VERIFIED</Badge>
                <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5">TWO MEN</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
          <CardContent className="p-2 sm:p-3 text-center">
            <Pill className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-1.5" />
            <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Rx Delivery</h4>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">Medication services</p>
            <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
          <CardContent className="p-2 sm:p-3 text-center">
            <Building className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-1.5" />
            <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Senior Centers</h4>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">Community programs</p>
            <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
          </CardContent>
        </Card>
        
        <Link href="/transportation">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 relative overflow-hidden h-full">
            <CardContent className="p-2 sm:p-3 text-center">
              <div className="absolute top-1 right-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <Car className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-1.5" />
              <h4 className="font-semibold text-xs sm:text-sm text-blue-700 dark:text-blue-300 line-clamp-2">Transportation</h4>
              <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 mt-0.5 line-clamp-2">No smartphone needed</p>
              <div className="flex flex-col gap-0.5 mt-1">
                <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ VERIFIED</Badge>
                <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5">GOGO</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/family-connect">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 relative overflow-hidden h-full">
            <CardContent className="p-2 sm:p-3 text-center">
              <div className="absolute top-1 right-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500 mx-auto mb-1.5" />
              <h4 className="font-semibold text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 line-clamp-2">Family Connect</h4>
              <p className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 line-clamp-2">Coordinate care together</p>
              <div className="flex flex-col gap-0.5 mt-1">
                <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ NEW</Badge>
                <Badge className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5">SECURE</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/vendor/1800florals">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 relative overflow-hidden h-full">
            <CardContent className="p-2 sm:p-3 text-center">
              <div className="absolute top-1 right-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 rounded-lg overflow-hidden bg-white shadow-sm">
                <img 
                  src="https://www.800florals.com/img/4810Dmd.jpg" 
                  alt="1-800-FLORALS Arrangements"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  loading="eager"
                />
                <div className="w-full h-full hidden items-center justify-center text-pink-500 text-xl font-bold">🌸</div>
              </div>
              <h4 className="font-semibold text-xs sm:text-sm text-pink-700 dark:text-pink-300 line-clamp-2">Professional Florals</h4>
              <p className="text-[10px] sm:text-xs text-pink-600 dark:text-pink-400 mt-0.5 line-clamp-2">Move-in arrangements</p>
              <div className="flex flex-col gap-0.5 mt-1">
                <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ VERIFIED</Badge>
                <Badge className="bg-pink-500 text-white text-[10px] px-1.5 py-0.5">1-800-FLORALS</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/vendor-marketplace">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 relative overflow-hidden h-full">
            <CardContent className="p-2 sm:p-3 text-center">
              <div className="absolute top-1 right-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 mx-auto mb-1.5" />
              <h4 className="font-semibold text-xs sm:text-sm text-amber-700 dark:text-amber-300 line-clamp-2">Vendor Marketplace</h4>
              <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 mt-0.5 line-clamp-2">Trusted senior brands</p>
              <div className="flex flex-col gap-0.5 mt-1">
                <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ NEW</Badge>
                <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5">CURATED</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
          <CardContent className="p-2 sm:p-3 text-center">
            <Scale className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500 mx-auto mb-1.5" />
            <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Legal Services</h4>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">Elder law attorneys</p>
            <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
          <CardContent className="p-2 sm:p-3 text-center">
            <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500 mx-auto mb-1.5" />
            <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Financial Planning</h4>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">Senior financial advisors</p>
            <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
          <CardContent className="p-4 text-center relative">
            <Scissors className="w-10 h-10 text-pink-500 mx-auto mb-2" />
            <h4 className="font-semibold text-sm">Personal Care</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Mobile barber & beauty</p>
            <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
          <CardContent className="p-4 text-center relative">
            <Users2 className="w-10 h-10 text-cyan-500 mx-auto mb-2" />
            <h4 className="font-semibold text-sm">Companion Care</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Social companionship</p>
            <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
          <CardContent className="p-4 text-center relative">
            <Phone className="w-10 h-10 text-violet-500 mx-auto mb-2" />
            <h4 className="font-semibold text-sm">Tech Support</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Device setup & training</p>
            <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mb-8">
        <Link href="/senior-services">
          <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            Browse All Services →
          </Button>
        </Link>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        {/* Hidden tabs list for functionality */}
        <TabsList className="hidden">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.slug} value={category.slug}>
              {category.name}
            </TabsTrigger>
          ))}
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
                  <div className="text-sm text-green-600 dark:text-green-300 font-medium">Service connections available</div>
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