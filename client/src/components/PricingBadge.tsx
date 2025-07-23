import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, DollarSign, Star, Shield } from 'lucide-react';

interface PricingBadgeProps {
  transparencyScore: number;
  pricingBadge: string;
  dataQuality?: {
    isAuthentic: boolean;
    source: string;
    qualityScore: number;
  };
  className?: string;
}

export function PricingBadge({ 
  transparencyScore, 
  pricingBadge, 
  dataQuality,
  className = ""
}: PricingBadgeProps) {
  
  const getBadgeVariant = (score: number) => {
    if (score >= 95) return 'default'; // Gold
    if (score >= 85) return 'secondary'; // Silver  
    if (score >= 75) return 'outline'; // Bronze
    return 'outline'; // Standard
  };
  
  const getBadgeIcon = (badge: string) => {
    if (badge === 'Price Pioneer') return <CheckCircle className="w-3 h-3" />;
    if (badge === 'Transparency Leader') return <Star className="w-3 h-3" />;
    if (badge.includes('Government') || badge.includes('HUD')) return <Shield className="w-3 h-3" />;
    return <DollarSign className="w-3 h-3" />;
  };
  
  const getBadgeColor = (score: number) => {
    if (score >= 95) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black';
    if (score >= 85) return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    if (score >= 75) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={getBadgeVariant(transparencyScore)}
        className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold ${getBadgeColor(transparencyScore)}`}
      >
        {getBadgeIcon(pricingBadge)}
        {pricingBadge}
      </Badge>
      
      {dataQuality?.isAuthentic && (
        <Badge variant="outline" className="text-xs text-green-600 border-green-600">
          <Shield className="w-3 h-3 mr-1" />
          {dataQuality.source === 'HUD Official Database' ? 'HUD Verified' : 'Authentic'}
        </Badge>
      )}
    </div>
  );
}

export default PricingBadge;