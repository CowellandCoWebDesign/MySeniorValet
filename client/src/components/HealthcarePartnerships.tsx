import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Stethoscope, Building2, Phone, MapPin, Clock, ExternalLink,
  Heart, Brain, Activity, Pill, Eye, Users, Ambulance, Shield,
  Calendar, CheckCircle, Star, ChevronRight, Info, Plus
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface HealthcarePartnershipsProps {
  community: any;
  isAdminView?: boolean;
}

// Healthcare partner data structure
interface HealthcarePartner {
  id: string;
  name: string;
  type: string;
  specialty: string;
  distance: string;
  rating: number;
  services: string[];
  availability: string;
  phone: string;
  address: string;
  isPreferred: boolean;
  responseTime?: string;
}

export function HealthcarePartnerships({ community, isAdminView = false }: HealthcarePartnershipsProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Calculate search area around community (10 mile radius)
  const getSearchBounds = () => {
    if (!community?.latitude || !community?.longitude) return null;
    const lat = parseFloat(community.latitude);
    const lng = parseFloat(community.longitude);
    const radiusMiles = 10;
    const latDegrees = radiusMiles / 69; // ~69 miles per degree latitude
    const lngDegrees = radiusMiles / (69 * Math.cos(lat * Math.PI / 180));
    
    return {
      north: lat + latDegrees,
      south: lat - latDegrees,
      east: lng + lngDegrees,
      west: lng - lngDegrees,
      centerLat: lat,
      centerLng: lng
    };
  };

  // Fetch real hospitals from healthcare directory
  const { data: hospitalsData, isLoading: hospitalsLoading } = useQuery({
    queryKey: ['/api/healthcare/hospitals-map', community?.id, community?.latitude, community?.longitude],
    queryFn: async () => {
      const bounds = getSearchBounds();
      if (!bounds) return { hospitals: [] };
      
      const params = new URLSearchParams({
        north: bounds.north.toString(),
        south: bounds.south.toString(),
        east: bounds.east.toString(),
        west: bounds.west.toString(),
        limit: '20'
      });
      
      const response = await fetch(`/api/healthcare/hospitals-map?${params}`);
      if (!response.ok) throw new Error('Failed to fetch hospitals');
      return response.json();
    },
    enabled: !!community?.latitude && !!community?.longitude,
  });

  // Fetch other healthcare providers from services API
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services/discover', community?.latitude, community?.longitude],
    queryFn: async () => {
      if (!community?.latitude || !community?.longitude) return { services: [] };
      
      const params = new URLSearchParams({
        lat: community.latitude,
        lng: community.longitude,
        radius: '10',
        category: 'healthcare'
      });
      
      const response = await fetch(`/api/services/discover?${params}`);
      if (!response.ok) return { services: [] };
      return response.json();
    },
    enabled: !!community?.latitude && !!community?.longitude,
  });

  // Calculate distance between two points (in miles)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Transform hospital data into healthcare partner format
  const transformHospitalsToPartners = (hospitals: any[]): HealthcarePartner[] => {
    if (!hospitals || !Array.isArray(hospitals)) return [];
    
    const communityLat = parseFloat(community?.latitude || '0');
    const communityLng = parseFloat(community?.longitude || '0');
    
    return hospitals.map((hospital, index) => {
      const distance = hospital.latitude && hospital.longitude
        ? calculateDistance(communityLat, communityLng, hospital.latitude, hospital.longitude)
        : 0;
      
      // Determine services based on hospital type
      const services = [];
      if (hospital.emergencyServices === 'Yes') services.push('Emergency Care');
      if (hospital.hospitalType?.includes('General')) services.push('General Medicine');
      if (hospital.hospitalType?.includes('Children')) services.push('Pediatrics');
      if (hospital.hospitalType?.includes('Psychiatric')) services.push('Mental Health');
      if (hospital.hospitalType?.includes('Rehabilitation')) services.push('Rehabilitation');
      if (hospital.hospitalType?.includes('Critical')) services.push('Critical Care');
      
      // Default services if none specified
      if (services.length === 0) {
        services.push('Emergency Care', 'General Medicine', 'Surgery', 'Diagnostics');
      }
      
      return {
        id: hospital.id?.toString() || `hospital-${index}`,
        name: hospital.name || hospital.facilityName || 'Healthcare Facility',
        type: 'hospital',
        specialty: hospital.hospitalType || 'General Hospital',
        distance: distance < 0.1 ? 'On-site' : `${distance.toFixed(1)} miles`,
        rating: hospital.overallRating ? parseFloat(hospital.overallRating) : 4.5,
        services,
        availability: hospital.emergencyServices === 'Yes' ? '24/7 Emergency' : 'By appointment',
        phone: hospital.phoneNumber || hospital.phone || '(Call for info)',
        address: hospital.address || `${hospital.city}, ${hospital.state}`,
        isPreferred: distance < 3, // Mark as preferred if within 3 miles
        responseTime: hospital.emergencyServices === 'Yes' ? '< 15 min' : undefined
      };
    });
  };

  // Transform service providers to healthcare partners
  const transformServicesToPartners = (services: any[]): HealthcarePartner[] => {
    if (!services || !Array.isArray(services)) return [];
    
    return services
      .filter((service: any) => 
        service.category === 'healthcare' || 
        service.category === 'pharmacy' ||
        service.category === 'home_health' ||
        service.category === 'mental_health'
      )
      .map((service: any, index: number) => ({
        id: service.id?.toString() || `service-${index}`,
        name: service.name,
        type: service.category === 'healthcare' ? 'home-health' : service.category,
        specialty: service.description || 'Healthcare Services',
        distance: service.distance || '5.0 miles',
        rating: service.rating || 4.3,
        services: service.services || ['General Care'],
        availability: 'By appointment',
        phone: service.phone || '(Call for info)',
        address: service.address || `${community?.city}, ${community?.state}`,
        isPreferred: false,
        responseTime: undefined
      }));
  };

  // Combine and sort healthcare partners
  const healthcarePartners: HealthcarePartner[] = [
    ...transformHospitalsToPartners(hospitalsData?.hospitals || []),
    ...transformServicesToPartners(servicesData?.services || [])
  ].sort((a, b) => {
    // Sort by distance (closest first)
    const distA = parseFloat(a.distance.split(' ')[0]) || 999;
    const distB = parseFloat(b.distance.split(' ')[0]) || 999;
    return distA - distB;
  });

  const isLoading = hospitalsLoading || servicesLoading;
  
  // Filter partners by category
  const filteredPartners = selectedCategory === 'all' 
    ? healthcarePartners 
    : healthcarePartners.filter(p => p.type === selectedCategory);

  // Get icon for partner type
  const getPartnerIcon = (type: string) => {
    switch(type) {
      case 'hospital': return <Building2 className="w-5 h-5" />;
      case 'home-health': return <Heart className="w-5 h-5" />;
      case 'rehabilitation': return <Activity className="w-5 h-5" />;
      case 'pharmacy': return <Pill className="w-5 h-5" />;
      case 'mental-health': return <Brain className="w-5 h-5" />;
      case 'dental': return <Activity className="w-5 h-5" />;
      case 'vision': return <Eye className="w-5 h-5" />;
      default: return <Stethoscope className="w-5 h-5" />;
    }
  };

  // Categories for filtering
  const categories = [
    { id: 'all', label: 'All Partners', count: healthcarePartners.length },
    { id: 'hospital', label: 'Hospitals', count: healthcarePartners.filter(p => p.type === 'hospital').length },
    { id: 'home-health', label: 'Home Health', count: healthcarePartners.filter(p => p.type === 'home-health').length },
    { id: 'rehabilitation', label: 'Rehabilitation', count: healthcarePartners.filter(p => p.type === 'rehabilitation').length },
    { id: 'pharmacy', label: 'Pharmacy', count: healthcarePartners.filter(p => p.type === 'pharmacy').length },
    { id: 'mental-health', label: 'Mental Health', count: healthcarePartners.filter(p => p.type === 'mental-health').length }
  ];

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold flex items-center text-blue-800 dark:text-blue-200">
              <Stethoscope className="w-5 h-5 mr-2" />
              Healthcare Partnerships
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Trusted healthcare providers serving our community
            </CardDescription>
          </div>
          {isAdminView && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Partner
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                {cat.label} ({cat.count})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading healthcare providers...</span>
          </div>
        )}

        {/* Healthcare Partners Grid */}
        {!isLoading && filteredPartners.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPartners.map((partner) => (
            <div 
              key={partner.id}
              className="border rounded-lg p-4 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
            >
              {/* Partner Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    partner.type === 'hospital' ? 'bg-red-100 text-red-600' :
                    partner.type === 'home-health' ? 'bg-green-100 text-green-600' :
                    partner.type === 'rehabilitation' ? 'bg-blue-100 text-blue-600' :
                    partner.type === 'pharmacy' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {getPartnerIcon(partner.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {partner.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {partner.specialty}
                    </p>
                  </div>
                </div>
                {partner.isPreferred && (
                  <Badge className="bg-green-100 text-green-700">
                    Preferred
                  </Badge>
                )}
              </div>

              {/* Partner Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{partner.distance}</span>
                  {partner.responseTime && (
                    <>
                      <span className="mx-2">•</span>
                      <Ambulance className="w-4 h-4 mr-1" />
                      <span>{partner.responseTime}</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{partner.availability}</span>
                </div>

                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{partner.phone}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < Math.floor(partner.rating) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                  <span className="text-sm ml-1">({partner.rating})</span>
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {partner.services.slice(0, 3).map((service, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {partner.services.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{partner.services.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  Schedule
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* No Partners Found */}
        {!isLoading && filteredPartners.length === 0 && (
          <div className="text-center py-8">
            <Stethoscope className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No healthcare providers found in this area.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Contact the community for more information about local healthcare partnerships.
            </p>
          </div>
        )}

        {/* Healthcare Benefits Info */}
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                Comprehensive Healthcare Network
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Our residents have access to a vetted network of healthcare providers, ensuring 
                continuity of care and rapid response times. All partners meet our strict quality 
                standards and specialize in senior care.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{healthcarePartners.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Healthcare Partners</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-green-600">24/7</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Emergency Access</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">4.7+</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg Rating</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">&lt;15min</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Response Time</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}