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

  // Fetch healthcare partnerships data
  const { data: partnerships, isLoading } = useQuery({
    queryKey: ['/api/communities', community?.id, 'healthcare-partners'],
    enabled: !!community?.id,
  });

  // Mock data for demonstration - replace with actual API data
  const healthcarePartners: HealthcarePartner[] = partnerships || [
    {
      id: '1',
      name: 'St. Mary\'s Medical Center',
      type: 'hospital',
      specialty: 'Full-Service Hospital',
      distance: '2.3 miles',
      rating: 4.8,
      services: ['Emergency Care', 'Surgery', 'Cardiology', 'Oncology'],
      availability: '24/7',
      phone: '(555) 123-4567',
      address: '123 Medical Center Dr',
      isPreferred: true,
      responseTime: '< 10 min'
    },
    {
      id: '2',
      name: 'Comfort Care Home Health',
      type: 'home-health',
      specialty: 'Home Health Services',
      distance: 'On-site',
      rating: 4.9,
      services: ['Nursing Care', 'Physical Therapy', 'Wound Care', 'Medication Management'],
      availability: 'Daily visits',
      phone: '(555) 234-5678',
      address: 'On-site service',
      isPreferred: true
    },
    {
      id: '3',
      name: 'Valley Rehabilitation Center',
      type: 'rehabilitation',
      specialty: 'Physical & Occupational Therapy',
      distance: '1.5 miles',
      rating: 4.7,
      services: ['Physical Therapy', 'Occupational Therapy', 'Speech Therapy', 'Aquatic Therapy'],
      availability: 'Mon-Sat',
      phone: '(555) 345-6789',
      address: '456 Rehab Way',
      isPreferred: false
    },
    {
      id: '4',
      name: 'Senior Wellness Pharmacy',
      type: 'pharmacy',
      specialty: 'Geriatric Pharmacy',
      distance: '0.8 miles',
      rating: 4.6,
      services: ['Prescription Delivery', 'Medication Counseling', 'Vaccine Services', 'Compounding'],
      availability: 'Mon-Sun 8am-9pm',
      phone: '(555) 456-7890',
      address: '789 Pharmacy Blvd',
      isPreferred: true
    },
    {
      id: '5',
      name: 'MindCare Senior Mental Health',
      type: 'mental-health',
      specialty: 'Geriatric Psychiatry',
      distance: 'Virtual & On-site',
      rating: 4.8,
      services: ['Depression Treatment', 'Memory Care', 'Counseling', 'Support Groups'],
      availability: 'By appointment',
      phone: '(555) 567-8901',
      address: 'Telehealth available',
      isPreferred: true
    }
  ];

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

        {/* Healthcare Partners Grid */}
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