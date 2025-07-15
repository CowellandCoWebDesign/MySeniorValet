import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Phone, Globe, Users, Home, Shield } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom markers for different facility types
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    className: 'custom-marker'
  });
};

const hudVashIcon = createCustomIcon('#dc2626'); // Red for HUD-VASH
const section202Icon = createCustomIcon('#2563eb'); // Blue for Section 202
const section811Icon = createCustomIcon('#16a34a'); // Green for Section 811
const housingAuthorityIcon = createCustomIcon('#7c3aed'); // Purple for Housing Authority
const veteransIcon = createCustomIcon('#ea580c'); // Orange for Veterans
const affordableIcon = createCustomIcon('#0891b2'); // Cyan for Affordable Housing
const otherIcon = createCustomIcon('#6b7280'); // Gray for Other

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

export default function HudVashMap() {
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]); // Center of USA
  const [mapZoom, setMapZoom] = useState(4);

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

  // Also fetch affordable housing from the main search API
  const { data: affordableHousingData, isLoading: affordableLoading } = useQuery({
    queryKey: ['/api/communities/search', 'affordable-housing-all'],
    queryFn: async () => {
      const response = await fetch('/api/communities/search?careType=Affordable%20Housing&limit=10000');
      if (!response.ok) {
        throw new Error('Failed to fetch affordable housing');
      }
      return response.json();
    }
  });

  // Combine HUD facilities with affordable housing communities
  const combinedData = {
    ...hudVashData,
    facilities: [
      ...(hudVashData?.facilities || []),
      ...(affordableHousingData?.map((community: any) => ({
        id: community.id,
        name: community.name,
        address: community.address,
        city: community.city,
        state: community.state,
        latitude: community.latitude,
        longitude: community.longitude,
        phone: community.phone,
        website: community.website,
        type: community.type,
        care_types: community.care_types || []
      })) || [])
    ]
  };

  // Filter facilities based on selected category
  const filteredFacilities = combinedData?.facilities.filter(facility => {
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

  // Get marker icon based on facility type
  const getMarkerIcon = (facility: HudVashFacility) => {
    const name = facility.name.toLowerCase();
    const type = facility.type;
    
    if (name.includes('vash') || type === 'HUD-VASH') return hudVashIcon;
    if (name.includes('section 202') || name.includes('202')) return section202Icon;
    if (name.includes('section 811') || name.includes('811')) return section811Icon;
    if (name.includes('housing authority') || name.includes('pha')) return housingAuthorityIcon;
    if (name.includes('veterans') || facility.veteran_programs) return veteransIcon;
    if (name.includes('affordable') || type === 'Affordable Senior') return affordableIcon;
    return otherIcon;
  };

  // Get facility type label
  const getFacilityTypeLabel = (facility: HudVashFacility) => {
    const name = facility.name.toLowerCase();
    const type = facility.type;
    
    if (name.includes('vash') || type === 'HUD-VASH') return 'HUD-VASH';
    if (name.includes('section 202') || name.includes('202')) return 'Section 202';
    if (name.includes('section 811') || name.includes('811')) return 'Section 811';
    if (name.includes('housing authority') || name.includes('pha')) return 'Housing Authority';
    if (name.includes('veterans') || facility.veteran_programs) return 'Veterans Housing';
    if (name.includes('affordable') || type === 'Affordable Senior') return 'Affordable Housing';
    return 'Other';
  };

  // Update map center when state changes
  useEffect(() => {
    if (selectedState !== 'all') {
      const stateCenters: Record<string, [number, number]> = {
        'CA': [36.7783, -119.4179],
        'TX': [31.9686, -99.9018],
        'HI': [21.0943, -157.4983],
        'FL': [27.6648, -81.5158],
        'NY': [42.1657, -74.9481],
        'WA': [47.0379, -120.8018],
        'CO': [39.0598, -105.3111],
        'OR': [44.5720, -122.0709],
        'PA': [40.5908, -77.2098]
      };
      
      if (stateCenters[selectedState]) {
        setMapCenter(stateCenters[selectedState]);
        setMapZoom(7);
      }
    } else {
      setMapCenter([39.8283, -98.5795]);
      setMapZoom(4);
    }
  }, [selectedState]);

  if (isLoading || affordableLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading HUD and affordable housing facilities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">HUD & Affordable Housing Map</h1>
              <p className="mt-2 text-gray-600">
                Veterans Affairs Supportive Housing, Section 202/811, and Affordable Housing facilities nationwide
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                <Shield className="w-4 h-4 mr-1" />
                {combinedData?.facilities?.length || 0} Facilities
              </Badge>
              <Badge variant="outline" className="text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {hudVashData?.states.length || 0} States
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="map">Interactive Map</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="states">By State</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">State:</label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {hudVashData?.states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Category:</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="hudVash">HUD-VASH</SelectItem>
                    <SelectItem value="section202">Section 202 (Elderly)</SelectItem>
                    <SelectItem value="section811">Section 811 (Disabled)</SelectItem>
                    <SelectItem value="housingAuthority">Housing Authority</SelectItem>
                    <SelectItem value="veterans">Veterans Housing</SelectItem>
                    <SelectItem value="affordable">Affordable Housing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {filteredFacilities.length} facilities shown
                </Badge>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-96">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  className="h-full w-full"
                  key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {filteredFacilities.map(facility => (
                    facility.latitude && facility.longitude && (
                      <Marker
                        key={facility.id}
                        position={[facility.latitude, facility.longitude]}
                        icon={getMarkerIcon(facility)}
                      >
                        <Popup>
                          <div className="p-2 min-w-64">
                            <h3 className="font-semibold text-gray-900 mb-2">{facility.name}</h3>
                            <Badge variant="outline" className="mb-2">
                              {getFacilityTypeLabel(facility)}
                            </Badge>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {facility.address}, {facility.city}, {facility.state}
                              </div>
                              {facility.phone && (
                                <div className="flex items-center">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {facility.phone}
                                </div>
                              )}
                              {facility.website && (
                                <div className="flex items-center">
                                  <Globe className="w-3 h-3 mr-1" />
                                  <a href={facility.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    Website
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    )
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span className="text-sm">HUD-VASH</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">Section 202</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Section 811</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  <span className="text-sm">Housing Authority</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                  <span className="text-sm">Veterans</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-cyan-600 rounded-full"></div>
                  <span className="text-sm">Affordable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                  <span className="text-sm">Other</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hudVashData?.categories && Object.entries(hudVashData.categories).map(([category, facilities]) => (
                <Card key={category} className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <Badge variant="secondary">{facilities.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {facilities.slice(0, 10).map((facility: HudVashFacility) => (
                        <div key={facility.id} className="p-2 border rounded">
                          <div className="font-medium text-sm">{facility.name}</div>
                          <div className="text-xs text-gray-500">{facility.city}, {facility.state}</div>
                        </div>
                      ))}
                      {facilities.length > 10 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{facilities.length - 10} more facilities
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="states" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hudVashData?.states.map(state => {
                const stateFacilities = hudVashData.facilities.filter(f => f.state === state);
                return (
                  <Card key={state} className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{state}</span>
                        <Badge variant="secondary">{stateFacilities.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {stateFacilities.slice(0, 10).map(facility => (
                          <div key={facility.id} className="p-2 border rounded">
                            <div className="font-medium text-sm">{facility.name}</div>
                            <div className="text-xs text-gray-500">{facility.city}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {getFacilityTypeLabel(facility)}
                            </Badge>
                          </div>
                        ))}
                        {stateFacilities.length > 10 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{stateFacilities.length - 10} more facilities
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}