import React from 'react';
import { Shield, Clock, Globe, Heart, Award, DollarSign, Star, Phone, CheckCircle, Sun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ServiceBadge {
  type: 'medicare' | 'medicaid' | 'insurance' | 'licensed' | 'accredited' | '24/7' | 'response' | 'language' | 'verified' | 'veteran';
  label: string;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  icon?: React.ReactNode;
}

const badgeConfig: Record<string, { icon: React.ReactNode; variant: any; color: string }> = {
  medicare: { 
    icon: <Shield className="w-3 h-3" />, 
    variant: 'default',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  medicaid: { 
    icon: <Heart className="w-3 h-3" />, 
    variant: 'default',
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  insurance: { 
    icon: <DollarSign className="w-3 h-3" />, 
    variant: 'outline',
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  licensed: { 
    icon: <Award className="w-3 h-3" />, 
    variant: 'default',
    color: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  accredited: { 
    icon: <Star className="w-3 h-3" />, 
    variant: 'default',
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  '24/7': { 
    icon: <Sun className="w-3 h-3" />, 
    variant: 'secondary',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  },
  response: { 
    icon: <Clock className="w-3 h-3" />, 
    variant: 'outline',
    color: 'bg-teal-100 text-teal-700 border-teal-200'
  },
  language: { 
    icon: <Globe className="w-3 h-3" />, 
    variant: 'outline',
    color: 'bg-pink-100 text-pink-700 border-pink-200'
  },
  verified: { 
    icon: <CheckCircle className="w-3 h-3" />, 
    variant: 'default',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  },
  veteran: { 
    icon: <Shield className="w-3 h-3" />, 
    variant: 'default',
    color: 'bg-red-100 text-red-700 border-red-200'
  }
};

interface ServiceBadgesProps {
  badges: ServiceBadge[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ServiceBadges({ badges, className = '', size = 'sm' }: ServiceBadgesProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {badges.map((badge, index) => {
        const config = badgeConfig[badge.type] || badgeConfig.verified;
        return (
          <div
            key={index}
            className={`inline-flex items-center gap-1 rounded-full border ${config.color} ${sizeClasses[size]} font-medium`}
          >
            {badge.icon || config.icon}
            <span>{badge.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Common badge presets
export const commonBadges = {
  medicareAccepted: { type: 'medicare' as const, label: 'Medicare' },
  medicaidAccepted: { type: 'medicaid' as const, label: 'Medicaid' },
  privateInsurance: { type: 'insurance' as const, label: 'Insurance' },
  stateLicensed: { type: 'licensed' as const, label: 'State Licensed' },
  jointCommission: { type: 'accredited' as const, label: 'Joint Commission' },
  available247: { type: '24/7' as const, label: '24/7 Available' },
  fastResponse: { type: 'response' as const, label: '<1hr Response' },
  multiLanguage: { type: 'language' as const, label: 'Multi-Language' },
  governmentVerified: { type: 'verified' as const, label: 'Gov Verified' },
  veteranFriendly: { type: 'veteran' as const, label: 'Veteran Friendly' }
};