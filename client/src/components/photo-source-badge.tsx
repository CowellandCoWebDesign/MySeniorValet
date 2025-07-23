
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Camera, ImageIcon, Clock, Shield } from "lucide-react";

interface PhotoSourceBadgeProps {
  hasGooglePhotos: boolean;
  hasStockPhotos: boolean;
  isClaimed: boolean;
  variant?: 'overlay' | 'inline';
  className?: string;
}

export function PhotoSourceBadge({ 
  hasGooglePhotos, 
  hasStockPhotos, 
  isClaimed, 
  variant = 'overlay',
  className = ""
}: PhotoSourceBadgeProps) {
  // Determine photo source and messaging
  const getPhotoSourceInfo = () => {
    if (hasGooglePhotos && isClaimed) {
      return {
        label: "Verified Community Photos",
        icon: <Shield className="h-3 w-3 mr-1" />,
        color: "bg-green-600 text-white",
        description: "Photos verified by community management"
      };
    } else if (hasGooglePhotos) {
      return {
        label: "Authentic Photos",
        icon: <Camera className="h-3 w-3 mr-1" />,
        color: "bg-blue-600 text-white",
        description: "Photos from Google Places database"
      };
    } else if (hasStockPhotos) {
      return {
        label: "Representative Images",
        icon: <ImageIcon className="h-3 w-3 mr-1" />,
        color: "bg-orange-600 text-white",
        description: "Stock photos - authentic photos coming soon"
      };
    } else {
      return {
        label: "Photos Coming Soon",
        icon: <Clock className="h-3 w-3 mr-1" />,
        color: "bg-gray-600 text-white",
        description: "Authentic photos will appear when community claims listing"
      };
    }
  };

  const sourceInfo = getPhotoSourceInfo();

  if (variant === 'overlay') {
    return (
      <Badge className={`${sourceInfo.color} border-0 backdrop-blur-sm text-xs font-medium ${className}`}>
        {sourceInfo.icon}
        {sourceInfo.label}
      </Badge>
    );
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center mb-1">
        {sourceInfo.icon}
        <span className="text-sm font-medium text-blue-900">{sourceInfo.label}</span>
      </div>
      <p className="text-xs text-blue-700">{sourceInfo.description}</p>
    </div>
  );
}
