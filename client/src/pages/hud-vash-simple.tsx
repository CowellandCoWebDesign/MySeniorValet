import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Phone, Globe, Users, Home, Shield } from 'lucide-react';

interface HudVashFacility {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  type: string;
  veteran_programs?: string;
  care_types: string[];
}

interface HudVashData {
  total: number;
  facilities: HudVashFacility[];
  categories: {
    hudVash: HudVashFacility[];
    section202: HudVashFacility[];
    section811: HudVashFacility[];
    housingAuthority: HudVashFacility[];
    veterans: HudVashFacility[];
    affordable: HudVashFacility[];
    other: HudVashFacility[];
  };
  states: string[];
}

export default function HudVashSimple() {
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: hudVashData, isLoading } = useQuery<HudVashData>({
    queryKey: ['/api/hud-facilities', selectedState],
    queryFn: async () => {
      const response = await fetch(`/api/hud-facilities?state=${selectedState}`);
      if (!response.ok) {
        throw new Error('Failed to fetch HUD facilities');
      }
      return response.json();
    }
  });

  // Filter facilities based on selected category
  const filteredFacilities = hudVashData?.facilities.filter(facility => {
    if (selectedCategory === 'all') return true;
    
    const name = facility.name.toLowerCase();
    const type = facility.type;
    
    switch (selectedCategory) {
      case 'hudVash':
        return name.includes('vash') || type === 'HUD-VASH';
      case 'section202':
        return name.includes('section 202') || name.includes('202');
      case 'section811':
        return name.includes('section 811') || name.includes('811');
      case 'housingAuthority':
        return name.includes('housing authority') || name.includes('pha');
      case 'veterans':
        return name.includes('veterans') || facility.veteran_programs;
      case 'affordable':
        return name.includes('affordable') || type === 'Affordable Senior';
      default:
        return true;
    }
  }) || [];

  // Get facility type badge
  const getFacilityTypeBadge = (facility: HudVashFacility) => {
    const name = facility.name.toLowerCase();
    const type = facility.type;
    
    if (name.includes('vash') || type === 'HUD-VASH') {
      return <Badge variant="destructive">HUD-VASH</Badge>;
    }
    if (name.includes('section 202') || name.includes('202')) {
      return <Badge variant="default">Section 202</Badge>;
    }
    if (name.includes('section 811') || name.includes('811')) {
      return <Badge variant="secondary">Section 811</Badge>;
    }
    if (name.includes('housing authority') || name.includes('pha')) {
      return <Badge className="bg-purple-100 text-purple-800">Housing Authority</Badge>;
    }
    if (name.includes('veterans') || facility.veteran_programs) {
      return <Badge className="bg-orange-100 text-orange-800">Veterans</Badge>;
    }
    if (name.includes('affordable') || type === 'Affordable Senior') {
      return <Badge className="bg-cyan-100 text-cyan-800">Affordable</Badge>;
    }
    return <Badge variant="outline">Other</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading HUD/VASH facilities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HUD/VASH Facilities</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Veterans housing, affordable senior housing, and supportive services nationwide
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Shield className="h-8 w-8 text-blue-600" />
                <Home className="h-8 w-8 text-green-600" />
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {hudVashData?.states.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="hudVash">HUD-VASH</SelectItem>
              <SelectItem value="section202">Section 202</SelectItem>
              <SelectItem value="section811">Section 811</SelectItem>
              <SelectItem value="housingAuthority">Housing Authority</SelectItem>
              <SelectItem value="veterans">Veterans</SelectItem>
              <SelectItem value="affordable">Affordable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {filteredFacilities.length} Facilities Found
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedState !== 'all' && `in ${selectedState} • `}
                  {selectedCategory !== 'all' && `${selectedCategory} category`}
                </p>
              </div>
              <div className="flex space-x-2">
                {hudVashData?.categories.hudVash.length > 0 && (
                  <Badge variant="destructive">{hudVashData.categories.hudVash.length} HUD-VASH</Badge>
                )}
                {hudVashData?.categories.veterans.length > 0 && (
                  <Badge className="bg-orange-100 text-orange-800">{hudVashData.categories.veterans.length} Veterans</Badge>
                )}
                {hudVashData?.categories.affordable.length > 0 && (
                  <Badge className="bg-cyan-100 text-cyan-800">{hudVashData.categories.affordable.length} Affordable</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Facilities List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFacilities.map(facility => (
            <Card key={facility.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{facility.name}</CardTitle>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {facility.city}, {facility.state}
                    </div>
                  </div>
                  {getFacilityTypeBadge(facility)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p>{facility.address}</p>
                    <p>{facility.city}, {facility.state}</p>
                  </div>

                  {facility.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {facility.phone}
                    </div>
                  )}

                  {facility.website && (
                    <div className="flex items-center text-sm text-blue-600">
                      <Globe className="h-4 w-4 mr-2" />
                      <a href={facility.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}

                  {facility.veteran_programs && (
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Veterans Programs:</p>
                      <p className="text-gray-600">{facility.veteran_programs}</p>
                    </div>
                  )}

                  {facility.care_types.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {facility.care_types.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open(`https://maps.google.com?q=${facility.latitude},${facility.longitude}`, '_blank')}
                    >
                      View on Map
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFacilities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <Home className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">No facilities found</p>
              <p className="text-sm mt-2">Try adjusting your filters to see more results.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}