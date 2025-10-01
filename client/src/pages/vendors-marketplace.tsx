import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Package,
  Shield,
  Star,
  ShieldCheck,
  Home,
  Search,
  Heart,
  User,
  MapPin,
  Phone,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  AlertCircle,
  Info,
  CheckCircle,
  Building,
  Stethoscope,
  BookOpen,
  Users,
  TrendingUp,
  Sparkles,
  Flame,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VendorMarketplaceTabs } from '@/components/VendorMarketplaceTabs';
import { ComprehensiveSearch } from '@/components/ComprehensiveSearch';
import { LoadingMascot } from '@/components/mascot/LoadingMascot';
import { Footer } from '@/components/footer';
import { useQuery } from '@tanstack/react-query';
import { useSEO } from '@/hooks/useSEO';

export default function VendorsMarketplace() {
  const [activeTab, setActiveTab] = useState<string>('vendors');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Set SEO metadata
  useSEO({
    title: 'Vendors Marketplace - Senior Products & Affiliate Partners',
    description: 'Shop trusted senior products from verified affiliate partners. Amazon products, medical supplies, mobility aids, and more. Curated marketplace for senior living needs.',
    keywords: 'senior products, affiliate marketplace, Amazon senior items, medical supplies, mobility aids, senior shopping',
    canonicalUrl: 'https://www.myseniorvalet.com/vendors-marketplace'
  });

  const handleSearch = async (results: any) => {
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Clear search when switching tabs
    setSearchQuery('');
    setSearchResults(null);
  };

  // Get the right search placeholder based on active tab
  const getSearchPlaceholder = () => {
    switch(activeTab) {
      case 'communities':
        return "🔍 Search senior living communities, assisted living, memory care...";
      case 'services':
        return "🔍 Search any business or service (restaurants, stores, salons, etc.)...";
      case 'healthcare':
        return "🔍 Search hospitals, clinics, doctors, therapies, healthcare options...";
      case 'resources':
        return "🔍 Search government programs, support groups, educational resources...";
      case 'vendors':
        return "🔍 Search products to purchase (walkers, beds, supplements, etc.)...";
      default:
        return "🔍 Search...";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-2">
              <Link href="/">
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-xl hidden sm:block">MySeniorValet</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            MySeniorValet Complete Directory
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your comprehensive guide to senior living, services, healthcare, resources, and products
          </p>
        </div>

        {/* 5-Tab Navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger 
              value="communities" 
              className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Building className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">Communities</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="services" 
              className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-amber-500 data-[state=active]:text-white"
            >
              <Users className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">Services</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="healthcare" 
              className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <Stethoscope className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">Healthcare</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="resources" 
              className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">Resources</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="vendors" 
              className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">Vendors</span>
            </TabsTrigger>
          </TabsList>

          {/* Search Bar - Context Aware */}
          <div className="mt-6 mb-8">
            <ComprehensiveSearch
              onSearch={handleSearch}
              onQueryChange={setSearchQuery}
              placeholder={getSearchPlaceholder()}
              searchCategory={activeTab as any}
              className="max-w-4xl mx-auto"
              isSearchActive={isSearching}
            />
          </div>

          {/* Communities Tab */}
          <TabsContent value="communities" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-6 h-6 text-blue-500" />
                  Senior Living Communities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-semibold mb-2">Find Your Perfect Community</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Search from 35,000+ verified senior living communities nationwide including:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Assisted Living</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Memory Care</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Independent Living</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Nursing Homes</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/community-directory">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <Building className="w-4 h-4 mr-2" />
                      Browse All Communities
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-amber-500" />
                  All Businesses & Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <h3 className="font-semibold mb-2">Discover Any Business or Service</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Search millions of businesses and services worldwide:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Restaurants & Cafes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Retail Stores</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Home Services</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Professional Services</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Beauty & Wellness</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Transportation</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/senior-marketplace">
                    <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white">
                      <Users className="w-4 h-4 mr-2" />
                      Explore All Services
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Healthcare Tab */}
          <TabsContent value="healthcare" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-teal-500" />
                  Healthcare Facilities & Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                    <h3 className="font-semibold mb-2">Complete Healthcare Discovery</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Research all healthcare facilities and options:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Hospitals</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Medical Clinics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Specialists</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Therapy Centers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Home Healthcare</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">VA Healthcare</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/senior-healthcare-directory">
                    <Button className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white">
                      <Stethoscope className="w-4 h-4 mr-2" />
                      Research Healthcare Options
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-purple-500" />
                  Senior Resources & Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h3 className="font-semibold mb-2">Educational & Support Resources</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Access comprehensive guides and support programs:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Government Programs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Medicare/Medicaid</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Support Groups</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Food Banks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Legal Aid</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Care Planning</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/senior-resources-center">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse Resources
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendors Tab - Affiliate Products */}
          <TabsContent value="vendors" className="mt-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-indigo-500" />
                  Senior Products Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2">Shop Trusted Senior Products</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Browse and purchase products from our verified affiliate partners:
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Medical Supplies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Mobility Aids</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Safety Equipment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Daily Living Aids</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Health Supplements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Comfort Products</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-white dark:bg-gray-800 p-2 rounded">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>All products from trusted affiliate partners like Amazon</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Marketplace Component */}
            <VendorMarketplaceTabs />
          </TabsContent>
        </Tabs>

        {/* Search Results Display */}
        {searchResults && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">
              Search Results ({searchResults.totalResults || 0})
            </h2>
            {searchResults.communities?.map((item: any) => (
              <Card key={item.id} className="mb-4">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.address}</p>
                  {item.description && (
                    <p className="mt-2 text-sm">{item.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}