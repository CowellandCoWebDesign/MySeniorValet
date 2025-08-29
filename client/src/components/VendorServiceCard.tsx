import React from 'react';
import { Star, MapPin, Phone, Globe, CheckCircle, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface VendorServiceCardProps {
  vendor: {
    id: number;
    business_name?: string;
    businessName?: string;
    business_type?: string;
    businessType?: string;
    description?: string;
    short_description?: string;
    shortDescription?: string;
    business_city?: string;
    businessCity?: string;
    business_state?: string;
    businessState?: string;
    website?: string;
    logo_url?: string;
    logoUrl?: string;
    service_areas?: string[];
    serviceAreas?: string[];
    subscription_tier?: string;
    subscriptionTier?: string;
    average_rating?: number;
    averageRating?: number;
    total_reviews?: number;
    totalReviews?: number;
    is_verified?: boolean;
    isVerified?: boolean;
    featured?: boolean;
    status?: string;
    primary_contact_phone?: string;
    primaryContactPhone?: string;
    primary_contact_email?: string;
    primaryContactEmail?: string;
  };
  variant?: 'list' | 'grid';
  onSelect?: () => void;
}

export function VendorServiceCard({ vendor, variant = 'list', onSelect }: VendorServiceCardProps) {
  // Handle both snake_case and camelCase properties
  const businessName = vendor.business_name || vendor.businessName || 'Unnamed Service';
  const businessType = vendor.business_type || vendor.businessType || 'Service Provider';
  const description = vendor.description || vendor.short_description || vendor.shortDescription || '';
  const city = vendor.business_city || vendor.businessCity || '';
  const state = vendor.business_state || vendor.businessState || '';
  const rating = vendor.average_rating || vendor.averageRating || 0;
  const reviews = vendor.total_reviews || vendor.totalReviews || 0;
  const isVerified = vendor.is_verified || vendor.isVerified || false;
  const logoUrl = vendor.logo_url || vendor.logoUrl;
  const phone = vendor.primary_contact_phone || vendor.primaryContactPhone;
  const tier = vendor.subscription_tier || vendor.subscriptionTier || 'basic';
  
  const getTierColor = () => {
    switch(tier) {
      case 'national': return 'bg-gradient-to-r from-purple-500 to-blue-500 text-white';
      case 'featured': return 'bg-gradient-to-r from-green-500 to-teal-500 text-white';
      default: return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };
  
  const getTierLabel = () => {
    switch(tier) {
      case 'national': return '🌟 National Partner';
      case 'featured': return '✨ Featured';
      default: return '';
    }
  };

  if (variant === 'grid') {
    return (
      <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border-2 border-gray-100 dark:border-gray-800"
            onClick={onSelect}>
        <CardHeader className="relative pb-2">
          {tier !== 'basic' && (
            <Badge className={`absolute top-2 right-2 ${getTierColor()} font-bold text-xs px-2 py-1`}>
              {getTierLabel()}
            </Badge>
          )}
          <div className="flex items-start space-x-3">
            {logoUrl ? (
              <img src={logoUrl} alt={businessName} className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-bold text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-2">
                {businessName}
                {isVerified && <CheckCircle className="w-5 h-5 text-green-500" />}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{businessType}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {city && state && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 mr-1" />
              {city}, {state}
            </div>
          )}
          
          {rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">({reviews} reviews)</span>
            </div>
          )}
          
          {description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{description}</p>
          )}
          
          <div className="flex gap-2 pt-2">
            {phone && (
              <Button size="sm" variant="outline" className="flex-1">
                <Phone className="w-3 h-3 mr-1" />
                Call
              </Button>
            )}
            {vendor.website && (
              <Button size="sm" variant="outline" className="flex-1">
                <Globe className="w-3 h-3 mr-1" />
                Website
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // List variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 cursor-pointer group border-2 border-gray-100 dark:border-gray-700"
         onClick={onSelect}>
      <div className="flex items-start gap-4">
        {logoUrl ? (
          <img src={logoUrl} alt={businessName} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-2 flex-wrap">
                {businessName}
                {isVerified && (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" title="Verified Provider" />
                )}
                {tier !== 'basic' && (
                  <Badge className={`${getTierColor()} font-bold text-xs px-2 py-0.5`}>
                    {getTierLabel()}
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{businessType}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {city && state && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                {city}, {state}
              </div>
            )}
            
            {rating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {rating.toFixed(1)} ({reviews} reviews)
                </span>
              </div>
            )}
            
            {description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{description}</p>
            )}
            
            <div className="flex gap-2 pt-2">
              {phone && (
                <Button size="sm" variant="outline" className="text-xs">
                  <Phone className="w-3 h-3 mr-1" />
                  {phone}
                </Button>
              )}
              {vendor.website && (
                <Button size="sm" variant="outline" className="text-xs" onClick={(e) => {
                  e.stopPropagation();
                  window.open(vendor.website, '_blank');
                }}>
                  <Globe className="w-3 h-3 mr-1" />
                  Visit Website
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}