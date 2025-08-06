import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Stethoscope } from 'lucide-react';

interface HealthcareServiceCardProps {
  service: {
    id: number;
    serviceName: string;
    categoryName: string;
    city?: string;
    state?: string;
    description?: string;
  };
  onClick?: () => void;
}

export function HealthcareServiceCard({ service, onClick }: HealthcareServiceCardProps) {
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-green-500"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-green-500" />
              {service.serviceName}
            </h3>
            <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              {service.categoryName}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {service.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
            {service.description}
          </p>
        )}
        {(service.city || service.state) && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{service.city ? `${service.city}, ${service.state}` : service.state || 'Nationwide'}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}