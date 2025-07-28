import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, ShoppingCart, Star, Truck, CheckCircle, Clock, Shield, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface MoveInService {
  id: number;
  serviceName: string;
  serviceDescription: string;
  serviceFeatures: string[];
  pricingModel: string;
  priceMin: number;
  priceMax: number;
  priceUnit: string;
  completionTimeDays: number;
  successRate: number;
  isActive: boolean;
  featured: boolean;
}

interface VendorInfo {
  id: number;
  businessName: string;
  description: string;
  logoUrl?: string;
  website?: string;
}

export default function MoveInServices() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch Move-In Essential services
  const { data: services = [], isLoading } = useQuery<MoveInService[]>({
    queryKey: ["/api/vendor-services/category/move-in-essentials"],
  });

  // Fetch vendor information for Amazon
  const { data: vendor } = useQuery<VendorInfo>({
    queryKey: ["/api/vendors/8"], // Amazon vendor ID
  });

  const categories = [
    { id: "all", name: "All Essentials", icon: Package },
    { id: "bedroom", name: "Bedroom & Bedding", icon: "🛏️" },
    { id: "bathroom", name: "Bathroom & Personal Care", icon: "🚿" },
    { id: "kitchen", name: "Kitchen & Appliances", icon: "🍽️" },
    { id: "furniture", name: "Comfort & Furniture", icon: "🪑" },
    { id: "safety", name: "Safety & Accessibility", icon: "🛡️" },
    { id: "bundle", name: "Complete Bundles", icon: "📦" }
  ];

  const filteredServices = services.filter(service => {
    if (selectedCategory === "all") return true;
    return service.serviceName.toLowerCase().includes(selectedCategory);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-700">Loading Move-In Essentials...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Move-In Essentials</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for a comfortable transition to your new senior living community.
              From bedroom basics to safety essentials, we've got you covered.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="min-w-[120px]"
            >
              <span className="mr-2">{typeof category.icon === 'string' ? category.icon : <category.icon className="w-4 h-4" />}</span>
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Amazon Vendor Info */}
      {vendor && (
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <span className="text-2xl font-bold text-orange-600">A</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{vendor.businessName}</h3>
                    <p className="text-gray-600">Trusted marketplace for move-in essentials</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Prime Eligible
                      </Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Fast Delivery
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Store
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="h-full hover:shadow-lg transition-shadow duration-200 bg-white">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                    {service.serviceName}
                  </CardTitle>
                  {service.featured && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-gray-600 text-sm leading-relaxed">
                  {service.serviceDescription}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Features */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">What's Included:</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {service.serviceFeatures.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {service.serviceFeatures.length > 4 && (
                      <div className="text-sm text-gray-500 ml-5">
                        +{service.serviceFeatures.length - 4} more items
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Pricing and Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price Range:</span>
                    <span className="font-bold text-lg text-green-600">
                      ${service.priceMin} - ${service.priceMax}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Delivery Time:</span>
                    <div className="flex items-center text-sm text-gray-700">
                      <Clock className="w-3 h-3 mr-1" />
                      {service.completionTimeDays} {service.completionTimeDays === 1 ? 'day' : 'days'}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Success Rate:</span>
                    <div className="flex items-center text-sm text-green-600">
                      <Star className="w-3 h-3 mr-1" />
                      {service.successRate}%
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-auto">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      // Track click event
                      console.log(`Clicked: ${service.serviceName}`);
                      // Open Amazon or redirect to purchase
                      window.open('https://amazon.com', '_blank');
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Shop on Amazon
                  </Button>
                  
                  <div className="text-center mt-2">
                    <span className="text-xs text-gray-500">
                      Amazon Prime eligible • Free returns
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No services found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        )}

        {/* Special Offers Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Complete Move-In Bundle</h2>
            <p className="text-xl mb-6 opacity-90">
              Save 15% when you order our complete bundle with everything you need
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Truck className="w-3 h-3 mr-1" />
                Coordinated Delivery
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Package className="w-3 h-3 mr-1" />
                Everything Included
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                White Glove Setup
              </Badge>
            </div>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Order Complete Bundle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}