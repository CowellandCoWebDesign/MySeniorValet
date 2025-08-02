import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Pill, Car, Stethoscope, Phone, Home, DollarSign, ExternalLink, Star, TrendingUp } from 'lucide-react';

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

  // Fetch vendors
  const { data: vendors = [] } = useQuery<MarketplaceVendor[]>({
    queryKey: ['/api/marketplace/vendors'],
  });

  // Filter vendors by category
  const filteredVendors = selectedCategory === 'all' 
    ? vendors 
    : vendors.filter(v => {
        const category = categories.find(c => c.id === v.categoryId);
        return category?.slug === selectedCategory;
      });

  // Group featured vendors
  const featuredVendors = filteredVendors.filter(v => v.isFeatured);
  const regularVendors = filteredVendors.filter(v => !v.isFeatured);

  const handleVendorClick = (vendorId: number) => {
    // Track click and redirect through our tracking endpoint
    window.open(`/api/marketplace/out/${vendorId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:text-gray-200 mb-4">
              ← Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-4">Senior Services Marketplace</h1>
          <p className="text-xl opacity-90">
            Trusted services and products to support your senior living journey
          </p>
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
              All Services
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
            {/* Featured Vendors */}
            {featuredVendors.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Star className="w-6 h-6 mr-2 text-yellow-500" />
                  Featured Services
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredVendors.map(vendor => (
                    <Card 
                      key={vendor.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-yellow-200"
                      onClick={() => handleVendorClick(vendor.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl flex items-center">
                              {vendor.name}
                              <Badge className="ml-2 bg-yellow-500">Featured</Badge>
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {vendor.shortDescription}
                            </p>
                          </div>
                          {vendor.logoUrl && (
                            <img 
                              src={vendor.logoUrl} 
                              alt={vendor.name} 
                              className="w-16 h-16 object-contain ml-4"
                            />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          {vendor.description}
                        </p>
                        <Button className="w-full group">
                          Visit {vendor.name}
                          <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Vendors */}
            {regularVendors.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  {selectedCategory === 'all' ? 'All Services' : categories.find(c => c.slug === selectedCategory)?.name}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularVendors.map(vendor => (
                    <Card 
                      key={vendor.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleVendorClick(vendor.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl">{vendor.name}</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {vendor.shortDescription}
                            </p>
                          </div>
                          {vendor.logoUrl && (
                            <img 
                              src={vendor.logoUrl} 
                              alt={vendor.name} 
                              className="w-16 h-16 object-contain ml-4"
                            />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          {vendor.description}
                        </p>
                        <Button variant="outline" className="w-full group">
                          Visit {vendor.name}
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

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Want to be listed here?</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            If you provide services or products for seniors and their families, 
            apply to be featured in our marketplace.
          </p>
          <Link href="/vendor-signup">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              Apply to Be a Vendor
              <TrendingUp className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}