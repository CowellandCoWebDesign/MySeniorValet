import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/NavigationHeader";
import { 
  ShoppingCart, Truck, Flower2, Scale, Calculator, Monitor, Users, ShieldCheck,
  Package, DollarSign, ChevronRight, Star, CheckCircle, TrendingUp, ArrowRight,
  Car, Pill, Heart, Home, Wrench, Phone, Clock, MapPin
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

interface VendorService {
  id: number;
  name: string;
  category: string;
  description: string;
  status: string;
  verified: boolean;
  rating?: number;
  price?: string;
  icon: any;
  link: string;
  badge?: string;
  color: string;
}

export default function SeniorMarketplace() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedVendor, setExpandedVendor] = useState<number | null>(null);
  const [expandedService, setExpandedService] = useState<number | null>(null);

  // Fetch marketplace vendors
  const { data: marketplaceVendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['/api/marketplace/vendors'],
  });

  // Fetch marketplace categories
  const { data: marketplaceCategories } = useQuery({
    queryKey: ['/api/marketplace/categories'],
  });

  const commercialServices: VendorService[] = [
    {
      id: 1,
      name: "Moving Services",
      category: "Relocation",
      description: "Senior move specialists for downsizing",
      status: "VERIFIED",
      verified: true,
      rating: 4.8,
      price: "Starting from $99/month",
      icon: Truck,
      link: "/moving-services",
      badge: "TWO MEN",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      name: "Rx Delivery",
      category: "Medication Services",
      description: "Medication delivery services",
      status: "VERIFIED",
      verified: true,
      rating: 4.9,
      price: "Example Service",
      icon: Pill,
      link: "/rx-delivery",
      badge: "SECURE",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: 3,
      name: "Senior Centers",
      category: "Community Programs",
      description: "Community programs and activities",
      status: "NEW",
      verified: false,
      icon: Users,
      link: "/senior-centers",
      badge: "Example Service",
      color: "from-purple-500 to-indigo-500"
    },
    {
      id: 4,
      name: "Transportation",
      category: "Medical Transport",
      description: "No smartphone needed",
      status: "VERIFIED",
      verified: true,
      rating: 4.7,
      icon: Car,
      link: "/transportation-services",
      badge: "GOOD",
      color: "from-orange-500 to-red-500"
    },
    {
      id: 5,
      name: "Family Connect",
      category: "Care Coordination",
      description: "Coordinate care together",
      status: "NEW",
      verified: false,
      icon: Heart,
      link: "/family-connect",
      badge: "SECURE",
      color: "from-pink-500 to-rose-500"
    },
    {
      id: 6,
      name: "Professional Florals",
      category: "Move-in Arrangements",
      description: "Move-in arrangements",
      status: "VERIFIED",
      verified: true,
      rating: 4.5,
      price: "1-800-FLOWERS",
      icon: Flower2,
      link: "/floral-services",
      badge: "VERIFIED",
      color: "from-yellow-500 to-orange-500"
    },
    {
      id: 7,
      name: "Vendor Marketplace",
      category: "Trusted Vendors",
      description: "Trusted senior vendors",
      status: "NEW",
      verified: false,
      icon: ShoppingCart,
      link: "/vendor-marketplace",
      badge: "CURATED",
      color: "from-teal-500 to-cyan-500"
    },
    {
      id: 8,
      name: "Legal Services",
      category: "Elder Law Attorneys",
      description: "Elder law attorneys",
      status: "NEW",
      verified: false,
      icon: Scale,
      link: "/legal-services",
      badge: "Example Service",
      color: "from-gray-500 to-slate-500"
    },
    {
      id: 9,
      name: "Financial Planning",
      category: "Senior Financial Advisors",
      description: "Senior financial advisors",
      status: "NEW",
      verified: false,
      icon: Calculator,
      link: "/financial-planning",
      badge: "Example Service",
      color: "from-indigo-500 to-purple-500"
    },
    {
      id: 10,
      name: "Tech Support",
      category: "Device & Training",
      description: "Device setup & training",
      status: "NEW",
      verified: false,
      icon: Monitor,
      link: "/tech-support",
      badge: "Example Service",
      color: "from-blue-500 to-indigo-500"
    }
  ];

  // Stats for the marketplace
  const stats = {
    totalVendors: "1,500+",
    verifiedVendors: "1,200+",
    monthlyPrice: "$99/month"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Page Header */}
      <section className="px-4 py-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Senior Marketplace
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Beyond communities - everything seniors need for independent living
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-white">{stats.totalVendors}</div>
                  <div className="text-sm text-blue-100">Trusted Vendors</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-white">{stats.verifiedVendors}</div>
                  <div className="text-sm text-blue-100">Verified Services</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-white">{stats.monthlyPrice}</div>
                  <div className="text-sm text-blue-100">Starting Price</div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 font-semibold shadow-xl"
                onClick={() => setLocation('/vendor-signup')}
              >
                <ShieldCheck className="mr-2 h-5 w-5" />
                Become a Vendor Partner
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white/20"
                onClick={() => setLocation('/vendor-login')}
              >
                Vendor Login
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Cards Grid */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Trusted Senior Services
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Carefully vetted vendors serving families nationwide
            </p>
          </div>

          {/* Category Filter */}
          {marketplaceCategories && marketplaceCategories.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={selectedCategory === "All" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("All")}
                  className="mb-2"
                >
                  All Categories
                </Button>
                {marketplaceCategories.map((category: any) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.name)}
                    className="mb-2"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {vendorsLoading && (
            <div className="text-center py-8">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading marketplace vendors...</p>
            </div>
          )}

          {/* Vendor Cards from Database */}
          {!vendorsLoading && marketplaceVendors && marketplaceVendors.length > 0 && (
            <>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {selectedCategory === "All" ? "All Vendors" : selectedCategory} ({
                  selectedCategory === "All" 
                    ? marketplaceVendors.length 
                    : marketplaceVendors.filter((v: any) => marketplaceCategories?.find((c: any) => c.id === v.categoryId)?.name === selectedCategory).length
                })
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketplaceVendors
                  .filter((vendor: any) => {
                    if (selectedCategory === "All") return true;
                    const category = marketplaceCategories?.find((c: any) => c.id === vendor.categoryId);
                    return category?.name === selectedCategory;
                  })
                  .map((vendor: any, index: number) => (
                    <motion.div
                      key={vendor.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-400 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 opacity-5 group-hover:opacity-10 transition-opacity"></div>
                        <CardHeader className="relative z-10">
                          <div className="flex justify-between items-start mb-2">
                            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                              <ShoppingCart className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {vendor.verified && (
                                <Badge className="bg-green-500 text-white">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  VERIFIED
                                </Badge>
                              )}
                              {vendor.tier && (
                                <Badge variant="secondary" className="text-xs">
                                  {vendor.tier.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <CardTitle className="text-xl">{vendor.name}</CardTitle>
                          <CardDescription className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {marketplaceCategories?.find((c: any) => c.id === vendor.categoryId)?.name || 'Services'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10">
                          <p className="text-gray-700 dark:text-gray-300 mb-3">
                            {vendor.description || 'Professional services for seniors'}
                          </p>
                          {vendor.rating && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(vendor.rating)
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {vendor.rating}
                              </span>
                            </div>
                          )}
                          {vendor.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <Phone className="h-4 w-4" />
                              {vendor.phone}
                            </div>
                          )}
                          {vendor.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="h-4 w-4" />
                              {vendor.location}
                            </div>
                          )}
                          
                          {/* Expandable Details Section */}
                          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedVendor(expandedVendor === vendor.id ? null : vendor.id)}
                              className="w-full justify-between text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                            >
                              {expandedVendor === vendor.id ? 'Hide Details' : 'View Details'}
                              <ChevronRight className={`ml-1 h-4 w-4 transition-transform ${expandedVendor === vendor.id ? 'rotate-90' : ''}`} />
                            </Button>
                            
                            {expandedVendor === vendor.id && (
                              <div className="mt-3 pt-3 space-y-3 text-sm">
                                {vendor.email && (
                                  <div className="flex items-start gap-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                                    <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:underline">
                                      {vendor.email}
                                    </a>
                                  </div>
                                )}
                                {vendor.website && (
                                  <div className="flex items-start gap-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Website:</span>
                                    <a 
                                      href={vendor.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      Visit Website →
                                    </a>
                                  </div>
                                )}
                                {vendor.services && vendor.services.length > 0 && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Services:</span>
                                    <ul className="mt-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                                      {vendor.services.map((service: string, idx: number) => (
                                        <li key={idx}>{service}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="w-full mt-3"
                                  onClick={() => vendor.website && window.open(vendor.website, '_blank')}
                                >
                                  Contact Vendor
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </>
          )}

          {/* Hardcoded Services Section */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 mt-12">
            Featured Service Categories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commercialServices.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: service.id * 0.05 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-400 relative overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                  <CardHeader className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${service.color} text-white`}>
                        <service.icon className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {service.verified && (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            VERIFIED
                          </Badge>
                        )}
                        {service.status === "NEW" && (
                          <Badge className="bg-orange-500 text-white">NEW</Badge>
                        )}
                        {service.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {service.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <CardDescription className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {service.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {service.description}
                    </p>
                    {service.rating && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(service.rating!)
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {service.rating}
                        </span>
                      </div>
                    )}
                    {service.price && (
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        {service.price}
                      </p>
                    )}
                    
                    {/* Expandable Service Details */}
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedService(expandedService === service.id ? null : service.id)}
                        className="w-full justify-between text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                      >
                        {expandedService === service.id ? 'Hide Details' : 'Learn More'}
                        <ChevronRight className={`ml-1 h-4 w-4 transition-transform ${expandedService === service.id ? 'rotate-90' : ''}`} />
                      </Button>
                      
                      {expandedService === service.id && (
                        <div className="mt-3 pt-3 space-y-3 text-sm">
                          <div className="text-gray-700 dark:text-gray-300">
                            <p className="font-medium mb-2">About {service.name}:</p>
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                              We partner with trusted {service.category.toLowerCase()} providers nationwide to help seniors and families access quality services.
                            </p>
                            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                              <li>Verified and licensed providers</li>
                              <li>Competitive pricing options</li>
                              <li>Local service availability</li>
                              <li>Quality assurance monitoring</li>
                            </ul>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setLocation('/search')}
                              className="flex-1"
                            >
                              Search Providers
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLocation('/vendor-signup')}
                              className="flex-1"
                            >
                              Become a Partner
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vendors Section */}
      {marketplaceVendors && (marketplaceVendors as any[]).length > 0 && (
        <section className="px-4 py-12 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
              Featured Vendor Partners
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(marketplaceVendors as any[]).slice(0, 6).map((vendor: any) => (
                <Card key={vendor.id} className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle>{vendor.name}</CardTitle>
                    <CardDescription>{vendor.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {vendor.description}
                    </p>
                    <Button className="w-full">
                      View Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Trusted Vendor Network
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Reach thousands of families seeking quality senior services
          </p>
          <Button 
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold shadow-xl"
            onClick={() => setLocation('/vendor-marketplace-tiers')}
          >
            Explore Vendor Plans
            <TrendingUp className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}