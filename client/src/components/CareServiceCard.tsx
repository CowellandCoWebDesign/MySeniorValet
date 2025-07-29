import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Globe, Star, Mail, MapPin, Shield, CheckCircle } from 'lucide-react';

interface CareServiceCardProps {
  service: any;
  index: number;
  borderColor: string;
  hoverBorderColor: string;
  iconBgColor: string;
  iconRingColor: string;
  icon: React.ReactNode;
  categoryBadgeColor: string;
  categoryBadgeBorder: string;
  categoryLabel: string;
  buttonColor: string;
  buttonHoverColor: string;
}

export function CareServiceCard({
  service,
  index,
  borderColor,
  hoverBorderColor,
  iconBgColor,
  iconRingColor,
  icon,
  categoryBadgeColor,
  categoryBadgeBorder,
  categoryLabel,
  buttonColor,
  buttonHoverColor
}: CareServiceCardProps) {
  // Common badges
  const badges = [
    { type: 'verified' as const, label: 'Government Verified' },
    ...(service.careTypes?.includes('Medicare') ? [{ type: 'feature' as const, label: 'Medicare Accepted' }] : []),
    ...(service.careTypes?.includes('Medicaid') ? [{ type: 'feature' as const, label: 'Medicaid Accepted' }] : []),
    { type: 'verified' as const, label: 'State Licensed' },
    ...(service.website ? [{ type: 'verified' as const, label: 'Website Verified' }] : [])
  ].slice(0, 4);

  return (
    <Card 
      key={service.id || index} 
      className={`overflow-hidden flex-shrink-0 w-64 h-[32rem] border-2 ${borderColor} ${hoverBorderColor} shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] bg-white dark:bg-gray-800 hover:-translate-y-1`} 
      style={{animationDelay: `${index * 0.05}s`}}
    >
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-14 h-14 ${iconBgColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ${iconRingColor}`}>
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={`text-xs px-2 py-0.5 ${categoryBadgeColor} ${categoryBadgeBorder}`}>
                {categoryLabel}
              </Badge>
              {service.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{service.rating}</span>
                </div>
              )}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-1 line-clamp-2">{service.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
              {service.address}, {service.city}, {service.state} {service.zipCode}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5 mb-3">
          {badges.map((badge, idx) => (
            <Badge key={idx} variant={badge.type === 'verified' ? 'default' : 'secondary'} className="text-[10px] px-2 py-0.5">
              {badge.label}
            </Badge>
          ))}
        </div>
        
        {service.phone && (
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{service.phone}</span>
          </div>
        )}
        
        {service.email && (
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{service.email}</span>
          </div>
        )}
        
        {/* Display care types if available */}
        {service.careTypes && service.careTypes.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Services offered:</p>
            <div className="flex flex-wrap gap-1">
              {service.careTypes.slice(0, 3).map((type: string, i: number) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                  {type}
                </span>
              ))}
              {service.careTypes.length > 3 && (
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                  +{service.careTypes.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Quality indicators */}
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Licensed</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Verified</span>
          </div>
        </div>
        
        <div className="mt-auto space-y-2">
          <Button className={`w-full ${buttonColor} ${buttonHoverColor} text-white py-3 text-sm font-semibold shadow-lg transform transition-all hover:scale-[1.02]`}>
            Contact Provider
          </Button>
          {service.website && (
            <a href={service.website} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="outline" className="w-full text-sm">
                <Globe className="w-3 h-3 mr-2" />
                Visit Website
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}