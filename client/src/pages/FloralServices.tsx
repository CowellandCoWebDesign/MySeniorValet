import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Gift, Calendar, Star, Truck, Phone, Globe, CheckCircle } from "lucide-react";

interface FloralProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  category: string;
  suitable_occasions: string[];
  delivery_options: string[];
}

interface FloralCatalogResponse {
  products: FloralProduct[];
  categories: string[];
  occasions: string[];
  specialOffers: Record<string, any>;
  deliveryInfo: {
    sameDay: string;
    nextDay: string;
    scheduled: string;
    coverage: string;
  };
}

export default function FloralServices() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');

  const { data: catalog, isLoading } = useQuery<FloralCatalogResponse>({
    queryKey: ['/api/florals/catalog', selectedCategory, selectedOccasion, selectedPriceRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedOccasion !== 'all') params.append('occasion', selectedOccasion);
      if (selectedPriceRange !== 'all') params.append('priceRange', selectedPriceRange);
      
      const response = await fetch(`/api/florals/catalog?${params}`);
      if (!response.ok) throw new Error('Failed to load catalog');
      return response.json();
    }
  });

  const { data: vendorInfo } = useQuery({
    queryKey: ['/api/florals/vendor-info'],
    queryFn: async () => {
      const response = await fetch('/api/florals/vendor-info');
      if (!response.ok) throw new Error('Failed to load vendor info');
      return response.json();
    }
  });

  const handleOrderProduct = (product: FloralProduct) => {
    // Track the order initiation
    fetch('/api/florals/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        orderValue: product.price
      })
    }).then(response => response.json())
      .then(data => {
        if (data.success && data.orderUrl) {
          window.open(data.orderUrl, '_blank');
        }
      })
      .catch(console.error);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading floral services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="h-8 w-8 text-pink-500" />
          <h1 className="text-4xl font-bold text-gray-900">MySeniorValet Floral Services</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Beautiful flowers delivered to senior living communities nationwide. 
          Perfect for move-ins, celebrations, and brightening any day.
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Verified Partner
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            95+ Years Experience
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Truck className="h-4 w-4" />
            Same-Day Delivery
          </Badge>
        </div>
      </div>

      {/* Vendor Info Card */}
      {vendorInfo && (
        <Card className="mb-8 border-pink-200">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Heart className="h-6 w-6 text-pink-500" />
                  {vendorInfo.name}
                </CardTitle>
                <CardDescription className="text-lg">
                  {vendorInfo.description}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">4.8/5</span>
                  <span className="text-gray-500">(15,000+ reviews)</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {vendorInfo.contact.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    Website
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Why Choose 1-800-FLORALS?</h4>
                <ul className="space-y-1">
                  {vendorInfo.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Senior Living Specialist Benefits</h4>
                <ul className="space-y-1">
                  {vendorInfo.seniorLivingBenefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4 text-pink-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Find Perfect Arrangements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {catalog?.categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Occasion</label>
              <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Occasions</SelectItem>
                  {catalog?.occasions.map(occasion => (
                    <SelectItem key={occasion} value={occasion}>
                      {occasion.charAt(0).toUpperCase() + occasion.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price Range</label>
              <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="50-80">$50 - $80</SelectItem>
                  <SelectItem value="80-120">$80 - $120</SelectItem>
                  <SelectItem value="120-160">$120 - $160</SelectItem>
                  <SelectItem value="160-200">$160+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Offers */}
      {catalog?.specialOffers && (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {Object.entries(catalog.specialOffers).map(([key, offer]: [string, any]) => (
            <Card key={key} className="border-orange-200 bg-gradient-to-br from-orange-50 to-pink-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gift className="h-5 w-5 text-orange-500" />
                  {offer.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm mb-2">{offer.description}</p>
                <p className="text-xs text-gray-600 italic">{offer.message}</p>
                <Badge variant="outline" className="mt-2">
                  {offer.discount}% OFF
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {catalog?.products.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90">
                  ${product.price}
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {product.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {product.suitable_occasions.slice(0, 3).map(occasion => (
                    <Badge key={occasion} variant="outline" className="text-xs">
                      {occasion.replace('-', ' ')}
                    </Badge>
                  ))}
                  {product.suitable_occasions.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{product.suitable_occasions.length - 3} more
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="h-4 w-4" />
                  <span>
                    {product.delivery_options.includes('same-day') ? 'Same-day available' : 'Next-day delivery'}
                  </span>
                </div>
                <Button 
                  onClick={() => handleOrderProduct(product)}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  Order Now - ${product.price}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delivery Info */}
      {catalog?.deliveryInfo && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Delivery Options</h4>
                <ul className="space-y-2 text-sm">
                  <li><strong>Same-Day:</strong> {catalog.deliveryInfo.sameDay}</li>
                  <li><strong>Next-Day:</strong> {catalog.deliveryInfo.nextDay}</li>
                  <li><strong>Scheduled:</strong> {catalog.deliveryInfo.scheduled}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Service Area</h4>
                <p className="text-sm">{catalog.deliveryInfo.coverage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}