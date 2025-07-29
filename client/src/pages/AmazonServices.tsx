import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Star, CheckCircle, Truck, Clock, Shield } from 'lucide-react';
import { NavigationHeader } from "@/components/NavigationHeader";

const AmazonServices = () => {
  const handleAmazonLink = (url: string) => {
    window.open(url, '_blank');
  };

  const services = [
    {
      name: 'Professional Moving Box Sets',
      description: 'Heavy-duty moving boxes in multiple sizes. Includes small, medium, large, and extra-large boxes perfect for senior living transitions. Professional-grade cardboard construction.',
      priceRange: '$24.99 - $39.99',
      features: ['Heavy-duty cardboard construction', 'Multiple size options', 'Prime shipping eligible', 'Professional moving grade', 'Easy assembly', 'Recyclable materials'],
      icon: <Package className="w-6 h-6" />,
      color: 'from-orange-500 to-orange-600',
      affiliateUrl: 'https://amzn.to/4lUWCV4',
      rating: 4.8,
      reviews: '12,000+'
    },
    {
      name: 'U-Haul Small Moving Box Kit',
      description: 'U-Haul Small Moving Box Kit (10-pack with tape roll). 12-5/8" x 16-3/8" x 12-5/8" boxes with perforated handles, 65-pound capacity. Perfect for books, tools, and downsizing seniors.',
      priceRange: '$15.99 - $22.99',
      features: ['U-Haul branded quality', '65-pound weight capacity', 'Perforated handles for easy carrying', 'Includes tape roll', 'Prime shipping eligible', 'Perfect for heavy items like books'],
      icon: <Package className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      affiliateUrl: 'https://amzn.to/4mjSqxW',
      rating: 4.7,
      reviews: '1,400+'
    },
    {
      name: 'Complete Packing Supplies Kit',
      description: 'Comprehensive packing kit including bubble wrap, packing tape, markers, labels, and protective materials. Everything needed for a safe move.',
      priceRange: '$19.99 - $49.99',
      features: ['Bubble wrap rolls', 'Heavy-duty packing tape', 'Permanent markers', 'Moving labels', 'Protective padding', 'Prime shipping eligible'],
      icon: <Shield className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      affiliateUrl: 'https://amzn.to/4lUWCV4',
      rating: 4.7,
      reviews: '8,500+'
    },
    {
      name: 'Wardrobe Moving Boxes',
      description: 'Specialty wardrobe boxes with hanging bars for transporting clothes without folding. Perfect for senior closet organization during moves.',
      priceRange: '$15.99 - $29.99',
      features: ['Built-in hanging bar', 'Extra-large capacity', 'Easy assembly', 'Protects formal wear', 'Stackable design', 'Prime shipping eligible'],
      icon: <Package className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      affiliateUrl: 'https://amzn.to/4lUWCV4',
      rating: 4.6,
      reviews: '6,200+'
    },
    {
      name: 'Furniture Moving Blankets',
      description: 'Professional-grade moving blankets for protecting furniture, appliances, and fragile items during transport. Reusable and durable.',
      priceRange: '$29.99 - $59.99',
      features: ['Professional-grade protection', 'Reusable design', 'Multiple sizes available', 'Machine washable', 'Non-slip backing', 'Prime shipping eligible'],
      icon: <Shield className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      affiliateUrl: 'https://amzn.to/4lUWCV4',
      rating: 4.5,
      reviews: '4,800+'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader title="Amazon Moving Supplies" />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="text-6xl">📦</div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Amazon Moving Supplies</h1>
                <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto">
                  Professional-grade moving supplies delivered to your door with Prime shipping
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge className="bg-orange-500 text-white px-4 py-2 text-lg">
                🚚 Prime Eligible
              </Badge>
              <Badge className="bg-orange-500 text-white px-4 py-2 text-lg">
                ⭐ 4.6+ Average Rating
              </Badge>
              <Badge className="bg-orange-500 text-white px-4 py-2 text-lg">
                📱 Easy Returns
              </Badge>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <Truck className="w-12 h-12 mx-auto mb-4 text-orange-200" />
              <h3 className="text-lg font-bold text-white mb-2">Fast Shipping</h3>
              <p className="text-orange-100 text-sm">Prime members get free 2-day shipping on most items</p>
            </div>
            <div>
              <Clock className="w-12 h-12 mx-auto mb-4 text-orange-200" />
              <h3 className="text-lg font-bold text-white mb-2">24/7 Support</h3>
              <p className="text-orange-100 text-sm">Amazon customer service available around the clock</p>
            </div>
            <div>
              <Shield className="w-12 h-12 mx-auto mb-4 text-orange-200" />
              <h3 className="text-lg font-bold text-white mb-2">Easy Returns</h3>
              <p className="text-orange-100 text-sm">Hassle-free returns and customer protection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Complete Moving Supply Solutions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            5 professional moving supply options for a successful senior living transition, delivered fast with Amazon Prime
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="overflow-hidden border-2 border-orange-200 dark:border-orange-400 bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {service.rating}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({service.reviews} reviews)
                      </span>
                    </div>
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-3">
                      {service.priceRange}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {service.description}
                </p>

                <div className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => handleAmazonLink(service.affiliateUrl)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3"
                >
                  Shop on Amazon
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-orange-50 dark:bg-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Amazon Customer Service
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Phone Support</h3>
              <p className="text-orange-600 dark:text-orange-400 font-semibold text-lg">1-888-280-4331</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">24/7 customer service</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Online Help</h3>
              <p className="text-orange-600 dark:text-orange-400 font-semibold">amazon.com/help</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Comprehensive help center</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Prime Benefits</h3>
              <p className="text-orange-600 dark:text-orange-400 font-semibold">Free 2-Day Shipping</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">On eligible items</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              * MySeniorValet earns from qualifying Amazon purchases as an Amazon Associate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmazonServices;