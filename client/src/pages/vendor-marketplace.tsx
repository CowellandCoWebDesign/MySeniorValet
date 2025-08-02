import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Pill, Car, Stethoscope, Phone, Home, DollarSign, ExternalLink, Star, TrendingUp, Sparkles } from 'lucide-react';

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

export default function VendorMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch categories
  const { data: categories = [] } = useQuery<MarketplaceCategory[]>({
    queryKey: ['/api/marketplace/categories'],
  });

  // Fetch vendors from the main vendor system with tier-based sorting
  const { data: vendors = [] } = useQuery<any[]>({
    queryKey: ['/api/vendors'],
  });

  // Filter vendors by category (vendors now come from main vendor system)
  const filteredVendors = selectedCategory === 'all' 
    ? vendors 
    : vendors.filter(v => {
        // Check if vendor's service categories include the selected category
        return v.serviceCategories?.includes(selectedCategory);
      });

  // Group vendors by subscription tier
  const nationalVendors = filteredVendors.filter(v => v.subscriptionTier === 'national');
  const featuredVendors = filteredVendors.filter(v => v.subscriptionTier === 'featured');
  const basicVendors = filteredVendors.filter(v => v.subscriptionTier === 'basic' || !v.subscriptionTier);
  
  // Calculate statistics
  const totalVendors = vendors.length;
  const totalCategories = categories.length;

  const handleVendorClick = (vendorId: number) => {
    // Navigate to vendor detail page
    window.location.href = `/vendor/${vendorId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:text-gray-200 mb-4">
              ← Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Senior Services & Vendor Marketplace</h1>
          <p className="text-xl opacity-90 mb-8">
            Trusted services and products to support your senior living journey
          </p>
          
          {/* Statistics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{totalVendors || 50}+</div>
              <div className="text-sm opacity-80">Verified Vendors</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{totalCategories || 7}</div>
              <div className="text-sm opacity-80">Service Categories</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">34K+</div>
              <div className="text-sm opacity-80">Communities Served</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">50%</div>
              <div className="text-sm opacity-80">Limited Time Savings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <div className="container mx-auto px-4 py-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Vendors shown are for your convenience and do not imply partnership. 
            MySeniorValet does not currently receive compensation from these listings.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 h-auto p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              All Services & Vendors
            </TabsTrigger>
            {categories.map(category => {
              const Icon = iconMap[category.icon || 'ShoppingCart'];
              return (
                <TabsTrigger 
                  key={category.slug} 
                  value={category.slug}
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  <Icon className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{category.name.split(' ')[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {/* National Partners (Premium) */}
            {nationalVendors.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-purple-500" />
                  National Partners
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nationalVendors.map(vendor => (
                    <Card 
                      key={vendor.id} 
                      className="hover:shadow-xl transition-all cursor-pointer border-2 border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
                      onClick={() => handleVendorClick(vendor.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl flex items-center">
                              {vendor.businessName}
                              <Badge className="ml-2 bg-purple-600 text-white">National Partner</Badge>
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {vendor.description || 'Premium senior service provider'}
                            </p>
                          </div>
                          {vendor.logoUrl && (
                            <img 
                              src={vendor.logoUrl} 
                              alt={vendor.businessName} 
                              className="w-20 h-20 object-contain ml-4"
                            />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                          {vendor.description?.substring(0, 100)}...
                        </p>
                        <Button className="w-full group bg-purple-600 hover:bg-purple-700">
                          Visit {vendor.businessName}
                          <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Vendors */}
            {featuredVendors.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Star className="w-6 h-6 mr-2 text-blue-500" />
                  Featured Vendors
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredVendors.map(vendor => (
                    <Card 
                      key={vendor.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                      onClick={() => handleVendorClick(vendor.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl flex items-center">
                              {vendor.businessName}
                              <Badge className="ml-2 bg-blue-600 text-white">Featured</Badge>
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {vendor.description || 'Trusted senior service provider'}
                            </p>
                          </div>
                          {vendor.logoUrl && (
                            <img 
                              src={vendor.logoUrl} 
                              alt={vendor.businessName} 
                              className="w-16 h-16 object-contain ml-4"
                            />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                          {vendor.description?.substring(0, 100)}...
                        </p>
                        <Button className="w-full group bg-blue-600 hover:bg-blue-700">
                          Visit {vendor.businessName}
                          <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Vendors */}
            {basicVendors.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  {selectedCategory === 'all' ? 'All Services & Vendors' : categories.find(c => c.slug === selectedCategory)?.name}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {basicVendors.map(vendor => (
                    <Card 
                      key={vendor.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleVendorClick(vendor.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{vendor.businessName}</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {vendor.description || 'Senior service provider'}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                          {vendor.description?.substring(0, 80)}...
                        </p>
                        <Button variant="outline" className="w-full group">
                          View Details
                          <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredVendors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  No vendors found in this category.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Why Join Section */}
        <div className="mt-16 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            Why Join Our Marketplace?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-500 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-center">Reach 34,000+ Communities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Connect with senior living communities across all 50 states and Canada. Your services reach families when they need them most.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-purple-500 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-center">Get Verified Partner Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Stand out with official partner badges, featured placements, and priority in search results. Build trust with families instantly.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-green-500 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-center">Limited Time: 50% Off</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Join now and save 50% on all vendor partnerships. Starting at just $49/month for full marketplace access and lead generation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Grow Your Senior Service Business?</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Join thousands of trusted vendors already connecting with families through MySeniorValet. 
            Get started today and claim your 50% discount before it expires!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/vendor-signup">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                <Sparkles className="w-5 h-5 mr-2" />
                Become a Verified Partner
              </Button>
            </Link>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Limited time offer • No setup fees
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}