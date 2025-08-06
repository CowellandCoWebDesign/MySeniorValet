import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, MapPin, Stethoscope, Phone, Globe, Clock, Star, 
  Shield, AlertTriangle, Activity, Users, Bed, DollarSign,
  Award, TrendingUp, Building, ShieldCheck, ChevronRight
} from 'lucide-react';

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
    // Extended hospital fields
    hospitalType?: string;
    bedCount?: number;
    emergencyServices?: boolean;
    traumaLevel?: string;
    cmsRating?: number;
    specialties?: string[];
    services?: string[];
    insuranceAccepted?: string[];
    mortalityRating?: string;
    safetyRating?: string;
    readmissionRating?: string;
    experienceRating?: string;
    networkAffiliations?: string[];
    ownership?: string;
  };
  onClick?: () => void;
}

export function HealthcareServiceCard({ service, onClick }: HealthcareServiceCardProps) {
  // Determine the icon and color based on service type
  const isHospital = service.isHospital || service.category?.includes('Hospital');
  const isEmergency = service.emergencyServices || service.availability === '24/7 Emergency';
  const hasTrauma = service.traumaLevel && service.traumaLevel !== 'None';
  
  // Color schemes based on service type
  const getColorScheme = () => {
    if (isEmergency) return {
      gradient: 'from-red-500 to-orange-500',
      border: 'border-red-500',
      badge: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      icon: 'text-red-500',
      accent: 'bg-red-50 dark:bg-red-950'
    };
    if (isHospital) return {
      gradient: 'from-blue-500 to-indigo-500',
      border: 'border-blue-500',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      icon: 'text-blue-500',
      accent: 'bg-blue-50 dark:bg-blue-950'
    };
    return {
      gradient: 'from-green-500 to-teal-500',
      border: 'border-green-500',
      badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      icon: 'text-green-500',
      accent: 'bg-green-50 dark:bg-green-950'
    };
  };
  
  const colors = getColorScheme();
  
  // Quality rating badge color
  const getRatingColor = (rating?: string) => {
    if (rating === 'Above') return 'text-green-600 bg-green-50 dark:bg-green-950';
    if (rating === 'Below') return 'text-red-600 bg-red-50 dark:bg-red-950';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
  };
  
  // CMS star rating display
  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };
  
  return (
    <Card 
      className={`group hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden ${colors.border} border-l-4 hover:scale-[1.02]`}
      onClick={onClick}
    >
      {/* Gradient Header Bar */}
      <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />
      
      <CardHeader className="pb-3">
        <div className="space-y-3">
          {/* Main Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {isEmergency ? (
                  <AlertTriangle className={`w-5 h-5 ${colors.icon}`} />
                ) : isHospital ? (
                  <Heart className={`w-5 h-5 ${colors.icon}`} />
                ) : (
                  <Stethoscope className={`w-5 h-5 ${colors.icon}`} />
                )}
                {service.name}
              </h3>
              
              {/* Category and Type Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary" className={colors.badge}>
                  {service.category}
                </Badge>
                {service.hospitalType && (
                  <Badge variant="outline" className="text-xs">
                    {service.hospitalType}
                  </Badge>
                )}
                {isEmergency && (
                  <Badge className="bg-red-500 text-white animate-pulse">
                    24/7 Emergency
                  </Badge>
                )}
                {hasTrauma && (
                  <Badge className="bg-orange-500 text-white">
                    <Shield className="w-3 h-3 mr-1" />
                    {service.traumaLevel}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* CMS Rating */}
            {service.cmsRating ? (
              <div className={`text-center p-2 rounded-lg ${colors.accent}`}>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">CMS Rating</div>
                {renderStars(service.cmsRating)}
                <div className="text-lg font-bold mt-1">{service.cmsRating}/5</div>
              </div>
            ) : service.rating ? (
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-lg">{service.rating.toFixed(1)}</span>
                </div>
                {service.reviewCount && (
                  <span className="text-xs text-gray-500">({service.reviewCount})</span>
                )}
              </div>
            ) : null}
          </div>
          
          {/* Description */}
          {service.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {service.description}
            </p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Hospital Capacity & Services */}
        {(service.bedCount || service.ownership) && (
          <div className={`p-3 rounded-lg ${colors.accent} space-y-2`}>
            <div className="font-semibold text-sm flex items-center gap-2">
              <Building className="w-4 h-4" />
              Facility Information
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {service.bedCount && (
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-gray-500" />
                  <span>{service.bedCount} Beds</span>
                </div>
              )}
              {service.ownership && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-xs">{service.ownership}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Quality Metrics */}
        {(service.mortalityRating || service.safetyRating || service.readmissionRating || service.experienceRating) && (
          <div className="space-y-2">
            <div className="font-semibold text-sm flex items-center gap-2">
              <Award className="w-4 h-4" />
              Quality Metrics
            </div>
            <div className="grid grid-cols-2 gap-2">
              {service.mortalityRating && (
                <div className={`text-xs p-2 rounded-lg ${getRatingColor(service.mortalityRating)}`}>
                  <div className="font-medium">Mortality</div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    {service.mortalityRating} National Avg
                  </div>
                </div>
              )}
              {service.safetyRating && (
                <div className={`text-xs p-2 rounded-lg ${getRatingColor(service.safetyRating)}`}>
                  <div className="font-medium">Safety</div>
                  <div className="flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-3 h-3" />
                    {service.safetyRating} National Avg
                  </div>
                </div>
              )}
              {service.readmissionRating && (
                <div className={`text-xs p-2 rounded-lg ${getRatingColor(service.readmissionRating)}`}>
                  <div className="font-medium">Readmission</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Activity className="w-3 h-3" />
                    {service.readmissionRating} National Avg
                  </div>
                </div>
              )}
              {service.experienceRating && (
                <div className={`text-xs p-2 rounded-lg ${getRatingColor(service.experienceRating)}`}>
                  <div className="font-medium">Patient Experience</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3" />
                    {service.experienceRating} National Avg
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Specialties */}
        {service.specialties && service.specialties.length > 0 && (
          <div className="space-y-2">
            <div className="font-semibold text-sm">Specialties</div>
            <div className="flex flex-wrap gap-1">
              {service.specialties.slice(0, 5).map((specialty, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {service.specialties.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{service.specialties.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {/* Insurance */}
        {service.insuranceAccepted && service.insuranceAccepted.length > 0 && (
          <div className="space-y-2">
            <div className="font-semibold text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Insurance Accepted
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {service.insuranceAccepted.slice(0, 3).join(', ')}
              {service.insuranceAccepted.length > 3 && ` +${service.insuranceAccepted.length - 3} more`}
            </div>
          </div>
        )}
        
        {/* Contact Information */}
        <div className="pt-3 border-t space-y-2">
          {(service.location || (service.city && service.state)) && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{service.location || `${service.city}, ${service.state}`}</span>
            </div>
          )}
          {service.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{service.phone}</span>
            </div>
          )}
          {service.website && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Globe className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Website Available</span>
            </div>
          )}
          {service.priceRange && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <DollarSign className="w-4 h-4 flex-shrink-0" />
              <span>{service.priceRange}</span>
            </div>
          )}
        </div>
        
        {/* View Details Button */}
        <div className={`mt-4 p-3 bg-gradient-to-r ${colors.gradient} rounded-lg text-white text-center font-semibold text-sm group-hover:shadow-lg transition-all`}>
          <div className="flex items-center justify-center gap-2">
            View Full Details
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}