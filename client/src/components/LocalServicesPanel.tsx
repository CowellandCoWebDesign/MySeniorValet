import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, Pill, Truck, Building2, Phone, Building, Scale, 
  Ambulance, Home, Utensils, Briefcase, DollarSign, Accessibility,
  Heart, Sun, MapPin, Star, ExternalLink, ShoppingCart
} from 'lucide-react';

// Service categories with icons
const ServiceIcons: { [key: string]: React.ReactNode } = {
  moving: <Package className="w-5 h-5" />,
  prescription_delivery: <Pill className="w-5 h-5" />,
  junk_removal: <Truck className="w-5 h-5" />,
  storage: <Building2 className="w-5 h-5" />,
  cell_phone_access: <Phone className="w-5 h-5" />,
  senior_center: <Building className="w-5 h-5" />,
  ombudsman: <Scale className="w-5 h-5" />,
  medical_transport: <Ambulance className="w-5 h-5" />,
  home_care: <Home className="w-5 h-5" />,
  meal_delivery: <Utensils className="w-5 h-5" />,
  legal_services: <Briefcase className="w-5 h-5" />,
  financial_planning: <DollarSign className="w-5 h-5" />,
  medical_equipment: <Accessibility className="w-5 h-5" />,
  hospice_care: <Heart className="w-5 h-5" />,
  adult_day_care: <Sun className="w-5 h-5" />
};

interface LocalService {
  id: string;
  category: string;
  name: string;
  description: string;
  provider: string;
  address?: string;
  phone?: string;
  website?: string;
  distance?: number;
  rating?: number;
  features?: string[];
  pricing?: string;
  verified?: boolean;
}

interface AmazonProduct {
  asin: string;
  title: string;
  price: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  productUrl: string;
  prime?: boolean;
}

interface LocalServicesPanelProps {
  location: { lat: number; lng: number };
  careTypes?: string[];
  onServiceClick?: (service: LocalService) => void;
  amazonAssociateTag?: string;
}

export const LocalServicesPanel: React.FC<LocalServicesPanelProps> = ({
  location,
  careTypes = [],
  onServiceClick,
  amazonAssociateTag
}) => {
  const [services, setServices] = useState<LocalService[]>([]);
  const [availableProducts, setAvailableProducts] = useState<AmazonProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // NO MOCK DATA - GOLDEN DATA RULE ENFORCED
  useEffect(() => {
    // Only real data from API allowed
    setServices([]);
    setAvailableProducts([]);
  }, [location, amazonAssociateTag]);

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  const categories = [
    { value: 'all', label: 'All Services' },
    { value: 'moving', label: 'Moving & Downsizing' },
    { value: 'prescription_delivery', label: 'Rx Delivery' },
    { value: 'senior_center', label: 'Senior Centers' },
    { value: 'medical_transport', label: 'Medical Transport' },
    { value: 'meal_delivery', label: 'Meal Delivery' }
  ];

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Services List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Local Senior Services ({filteredServices.length})
        </h3>
        
        <div className="grid gap-3">
          {filteredServices.map((service) => (
            <Card 
              key={service.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onServiceClick?.(service)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    {ServiceIcons[service.category] || <MapPin className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {service.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {service.description}
                        </p>
                      </div>
                      {service.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {service.features?.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Contact Info */}
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      {service.phone && (
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Phone className="w-3 h-3" />
                          {service.phone}
                        </span>
                      )}
                      {service.distance && (
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <MapPin className="w-3 h-3" />
                          {service.distance} miles
                        </span>
                      )}
                      {service.rating && (
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          {service.rating}
                        </span>
                      )}
                    </div>
                    
                    {/* Pricing */}
                    {service.pricing && (
                      <div className="mt-2 text-sm font-medium text-green-700 dark:text-green-400">
                        {service.pricing}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Available Products Section */}
      {amazonAssociateTag && availableProducts.length > 0 && (
        <div className="space-y-4 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Available Products for Senior Living
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableProducts.map((product) => (
              <a
                key={product.asin}
                href={product.productUrl}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="block"
              >
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img 
                        src={product.imageUrl} 
                        alt={product.title}
                        className="w-20 h-20 object-contain"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                          {product.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-lg font-bold text-green-700 dark:text-green-400">
                            {product.price}
                          </span>
                          {product.prime && (
                            <Badge className="bg-blue-600 text-white text-xs">
                              Prime
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{product.rating}</span>
                          <span className="text-gray-500">({product.reviewCount.toLocaleString()})</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            As an Amazon Associate, MySeniorValet earns from qualifying purchases.
          </p>
        </div>
      )}
    </div>
  );
};