import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  Shield, 
  Sparkle,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

interface EnhancedVendorCardProps {
  vendor: {
    id: number;
    businessName: string;
    businessType: string;
    description?: string;
    city: string;
    state: string;
    phone?: string;
    website?: string;
    rating?: number;
    reviewCount?: number;
    tier?: 'basic' | 'featured' | 'national';
    serviceAreas?: string;
    isVerified?: boolean;
    isNew?: boolean;
    specialOffer?: string;
  };
  onClick?: () => void;
}

const tierConfig = {
  basic: {
    badge: 'Basic Partner',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    borderColor: 'border-gray-400',
    icon: CheckCircle,
    coverage: '1 State Coverage'
  },
  featured: {
    badge: 'Featured Partner',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    borderColor: 'border-blue-500',
    icon: Award,
    coverage: 'Multi-State Coverage'
  },
  national: {
    badge: 'National Partner',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    borderColor: 'border-purple-500',
    icon: Shield,
    coverage: 'Nationwide Coverage'
  }
};

export default function EnhancedVendorCard({ vendor, onClick }: EnhancedVendorCardProps) {
  const tier = vendor.tier || 'basic';
  const tierInfo = tierConfig[tier];
  
  // Calculate promotional pricing
  const getPromotionalText = () => {
    if (vendor.isNew) {
      return '50% OFF First Month - New Partner Special!';
    }
    return '20% OFF Annual Plans - Limited Time';
  };

  const businessTypeColors: Record<string, string> = {
    'Home Care': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    'Medical Equipment': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    'Transportation': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    'Groceries & Essentials': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    'Legal Services': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    'Financial Planning': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    'Moving Services': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  };

  return (
    <Card 
      className={`hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 ${tierInfo.borderColor} relative overflow-hidden group`}
      onClick={onClick}
    >
      {/* Promotional Banner */}
      {(vendor.isNew || vendor.specialOffer) && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-green-500 to-emerald-600 text-white px-3 py-1 rounded-bl-lg flex items-center gap-1 text-xs font-bold shadow-lg">
          <Sparkle className="w-3 h-3 animate-pulse" />
          {vendor.isNew ? 'NEW' : 'PROMO'}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className={`w-5 h-5 ${tier === 'national' ? 'text-purple-500' : tier === 'featured' ? 'text-blue-500' : 'text-gray-500'}`} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {vendor.businessName}
              </h3>
              {vendor.isVerified && (
                <Shield className="w-4 h-4 text-green-500" title="Verified Partner" />
              )}
            </div>
            
            {/* Business Type and Tier Badges */}
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge 
                variant="secondary" 
                className={businessTypeColors[vendor.businessType] || 'bg-gray-100 text-gray-700'}
              >
                {vendor.businessType}
              </Badge>
              <Badge 
                variant="secondary" 
                className={tierInfo.color}
              >
                <tierInfo.icon className="w-3 h-3 mr-1" />
                {tierInfo.badge}
              </Badge>
              {vendor.isNew && (
                <Badge 
                  variant="secondary" 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  New Partner
                </Badge>
              )}
            </div>
          </div>
          
          {/* Rating Display */}
          {vendor.rating && (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold">{vendor.rating.toFixed(1)}</span>
              </div>
              {vendor.reviewCount && (
                <span className="text-xs text-gray-500">({vendor.reviewCount})</span>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Promotional Message */}
        {(vendor.isNew || vendor.specialOffer) && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-2 mb-3">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-semibold">
                {vendor.specialOffer || getPromotionalText()}
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        {vendor.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {vendor.description}
          </p>
        )}

        {/* Service Coverage */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {tierInfo.coverage}
            </span>
            {vendor.serviceAreas && (
              <span className="text-gray-500 dark:text-gray-400">
                • {vendor.serviceAreas}
              </span>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{vendor.city}, {vendor.state}</span>
          </div>
          <div className="flex items-center gap-2">
            {vendor.phone && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span>{vendor.phone}</span>
              </div>
            )}
            {vendor.website && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 ml-auto">
                <Globe className="w-4 h-4" />
                <span className="text-xs">Website</span>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-4 flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              console.log('View details for:', vendor.businessName);
            }}
          >
            View Details
          </Button>
          {vendor.phone && (
            <Button 
              size="sm" 
              variant="default"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `tel:${vendor.phone}`;
              }}
            >
              <Phone className="w-3 h-3 mr-1" />
              Call Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}