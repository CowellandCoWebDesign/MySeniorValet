import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Phone, MapPin, ShoppingBag } from 'lucide-react';

interface VendorCardProps {
  vendor: {
    id: number;
    businessName: string;
    businessType: string;
    city: string;
    state: string;
    address?: string;
    phone?: string;
    rating?: number;
    description?: string;
  };
  onClick?: () => void;
}

export function VendorCard({ vendor, onClick }: VendorCardProps) {
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-purple-500"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-500" />
              {vendor.businessName}
            </h3>
            <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              {vendor.businessType}
            </Badge>
          </div>
          {vendor.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{vendor.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {vendor.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {vendor.description}
          </p>
        )}
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{vendor.city}, {vendor.state}</span>
          </div>
          {vendor.phone && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Phone className="w-4 h-4" />
              <span>{vendor.phone}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}