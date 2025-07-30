// MySeniorValet - Subscription Management Page
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Crown, Zap } from 'lucide-react';
import { NavigationHeader } from "@/components/NavigationHeader";

interface SubscriptionProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year' | null;
  type: 'product' | 'add-on';
  features: string[];
}

interface SubscriptionData {
  products: SubscriptionProduct[];
  addOns: SubscriptionProduct[];
}

const SubscriptionManagement = () => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const { data: subscriptionData, isLoading } = useQuery<SubscriptionData>({
    queryKey: ['/api/subscriptions/products'],
  });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const getProductIcon = (productId: string) => {
    switch (productId) {
      case 'basic-listing':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'featured-spotlight':
        return <Star className="w-6 h-6 text-yellow-600" />;
      case 'premium-tools':
        return <Zap className="w-6 h-6 text-blue-600" />;
      case 'platinum-partner':
        return <Crown className="w-6 h-6 text-purple-600" />;
      default:
        return <CheckCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getProductBadgeColor = (productId: string) => {
    switch (productId) {
      case 'basic-listing':
        return 'bg-green-100 text-green-800';
      case 'featured-spotlight':
        return 'bg-yellow-100 text-yellow-800';
      case 'premium-tools':
        return 'bg-blue-100 text-blue-800';
      case 'platinum-partner':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubscribe = async (productId: string) => {
    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          communityId: 1, // This would come from user context
          productId
        }),
      });

      const data = await response.json();
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader 
        title="MySeniorValet Subscription Plans" 
        subtitle="Choose the perfect plan to showcase your senior living community"
      />
      <div className="container mx-auto px-4 py-8">

      {/* Main Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {subscriptionData?.products.map((product) => (
          <Card 
            key={product.id} 
            className={`relative transition-all duration-300 hover:shadow-lg ${
              product.id === 'platinum-partner' ? 'ring-2 ring-purple-600 transform scale-105' : ''
            }`}
          >
            {product.id === 'platinum-partner' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600 text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                {getProductIcon(product.id)}
              </div>
              <CardTitle className="text-xl font-bold">{product.name}</CardTitle>
              <div className="text-3xl font-bold text-gray-900">
                {product.price === 0 ? 'Free' : formatPrice(product.price)}
                {product.interval && (
                  <span className="text-sm font-normal text-gray-600">
                    /{product.interval}
                  </span>
                )}
              </div>
              <CardDescription className="text-sm">
                {product.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-2 mb-6">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => handleSubscribe(product.id)}
                disabled={product.price === 0}
                className={`w-full ${
                  product.id === 'platinum-partner' 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : ''
                }`}
                variant={product.price === 0 ? 'outline' : 'default'}
              >
                {product.price === 0 ? 'Current Plan' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add-On Products */}
      {subscriptionData?.addOns && subscriptionData.addOns.length > 0 && (
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Add-On Modules
            </h2>
            <p className="text-lg text-gray-600">
              Enhance your subscription with these optional features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionData.addOns.map((addon) => (
              <Card key={addon.id} className="transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg font-bold">{addon.name}</CardTitle>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(addon.price)}
                    <span className="text-sm font-normal text-gray-600">
                      /{addon.interval}
                    </span>
                  </div>
                  <CardDescription className="text-sm">
                    {addon.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {addon.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleSubscribe(addon.id)}
                    variant="outline"
                    className="w-full"
                  >
                    Add Module
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Features Comparison */}
      <div className="mt-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Compare All Features
          </h2>
          <p className="text-lg text-gray-600">
            See what's included with each subscription tier
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-1">
                <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
              </div>
              {subscriptionData?.products.map((product) => (
                <div key={product.id} className="text-center">
                  <Badge className={getProductBadgeColor(product.id)}>
                    {product.name}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default SubscriptionManagement;