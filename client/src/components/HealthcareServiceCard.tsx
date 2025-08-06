import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Stethoscope } from 'lucide-react';

interface HealthcareServiceCardProps {
  service: {
    id: number | string;
    name: string;
    category: string;
    city?: string;
    state?: string;
    location?: string;
    description?: string;
    priceRange?: string;
    availability?: string;
    rating?: number;
    reviewCount?: number;
    isHospital?: boolean;
    phone?: string;
    website?: string;
  };
  onClick?: () => void;
}

export function HealthcareServiceCard({ service, onClick }: HealthcareServiceCardProps) {
  // Determine the icon and color based on service type
  const isHospital = service.isHospital || service.category?.includes('Hospital');
  const iconColor = isHospital ? 'text-red-500' : 'text-green-500';
  const borderColor = isHospital ? 'border-red-500' : 'border-green-500';
  const badgeColor = isHospital 
    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
  
  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 ${borderColor}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {isHospital ? (
                <Heart className={`w-5 h-5 ${iconColor}`} />
              ) : (
                <Stethoscope className={`w-5 h-5 ${iconColor}`} />
              )}
              {service.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="secondary" className={badgeColor}>
                {service.category}
              </Badge>
              {service.availability && (
                <Badge variant="outline" className="text-xs">
                  {service.availability}
                </Badge>
              )}
            </div>
          </div>
          {service.rating && (
            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold">{service.rating.toFixed(1)}</span>
              </div>
              {service.reviewCount && (
                <span className="text-xs text-gray-500">({service.reviewCount} reviews)</span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {service.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
            {service.description}
          </p>
        )}
        <div className="space-y-2">
          {service.priceRange && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Pricing:</span>
              <span>{service.priceRange}</span>
            </div>
          )}
          {(service.location || (service.city && service.state)) && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{service.location || (service.city ? `${service.city}, ${service.state}` : service.state || 'Nationwide')}</span>
            </div>
          )}
          {service.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">Phone:</span>
              <span>{service.phone}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}