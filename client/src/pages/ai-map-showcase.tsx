import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, MapPin, Search, Sparkles, Building, Users, 
  Hospital, DollarSign, Star, List, 
  BarChart3, Globe
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { NavigationHeader } from '@/components/NavigationHeader';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Leaflet icons for different types
const communityIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 21h18"/>
      <path d="M5 21V7l8-4v18"/>
      <path d="M19 21V11l-6-4"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const hospitalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 6v12"/>
      <path d="M6 12h12"/>
      <rect x="2" y="3" width="20" height="18" rx="2"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const vendorIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

interface MapItem {
  id: number;
  name: string;
  type: 'community' | 'hospital' | 'vendor' | 'service';
  lat?: number;
  lng?: number;
  address?: string;
  price?: string;
  rating?: number;
  description?: string;
  verified?: boolean;
  hudProperty?: boolean;
  category?: string;
  subtype?: string;
}

export default function AIMapShowcase() {
  const [mapItems, setMapItems] = useState<MapItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MapItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<MapItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'split'>('split');
  const [selectedLocation, setSelectedLocation] = useState<string>('California');

  // Load comprehensive data from all APIs
  const loadAllData = async (location: string) => {
    setIsLoading(true);
    try {
      const [communitiesRes, vendorsRes, servicesRes, vaRes] = await Promise.all([
        fetch(`/api/communities/by-location/${location}`),
        fetch('/api/marketplace/vendors'),
        fetch('/api/care-services'),
        fetch('/api/va-resources/facilities')
      ]);

      const [communities, vendors, services, vaFacilities] = await Promise.all([
        communitiesRes.json(),
        vendorsRes.json(),
        servicesRes.json(),
        vaRes.json()
      ]);

      const allItems: MapItem[] = [
        // Communities
        ...(communities || []).slice(0, 20).map((c: any) => ({
          id: c.id,
          name: c.name,
          type: 'community' as const,
          lat: parseFloat(c.lat),
          lng: parseFloat(c.lng),
          address: c.address,
          price: c.hudProperty ? `$${c.rentPerMonth}/month (HUD Verified)` : 'Contact for pricing',
          rating: Math.random() * 2 + 3, // Mock rating
          description: c.description || `${c.subtype || 'Senior living'} community`,
          verified: c.hudProperty || false,
          hudProperty: c.hudProperty,
          subtype: c.subtype
        })),
        
        // Vendors (simulate locations near communities)
        ...(vendors.vendors || []).slice(0, 15).map((v: any, index: number) => ({
          id: v.id + 10000,
          name: v.name,
          type: 'vendor' as const,
          lat: 37.7749 + (Math.random() - 0.5) * 0.2,
          lng: -122.4194 + (Math.random() - 0.5) * 0.2,
          address: v.location || 'Service area',
          price: v.pricing || 'Contact for quote',
          rating: Math.random() * 2 + 3,
          description: v.description,
          category: v.category
        })),
        
        // Mock hospitals (using realistic CA hospital data)
        {
          id: 90001,
          name: 'UCSF Medical Center',
          type: 'hospital' as const,
          lat: 37.7625,
          lng: -122.4583,
          address: '505 Parnassus Ave, San Francisco, CA',
          rating: 4.2,
          description: 'Top-rated academic medical center'
        },
        {
          id: 90002,
          name: 'Kaiser Permanente SF',
          type: 'hospital' as const,
          lat: 37.7849,
          lng: -122.4094,
          address: '2425 Geary Blvd, San Francisco, CA',
          rating: 3.8,
          description: 'Integrated healthcare system'
        },
        {
          id: 90003,
          name: 'California Pacific Medical Center',
          type: 'hospital' as const,
          lat: 37.7886,
          lng: -122.4342,
          address: '2333 Buchanan St, San Francisco, CA',
          rating: 4.0,
          description: 'Full-service medical center'
        }
      ];

      setMapItems(allItems);
      setFilteredItems(allItems);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter function
  const applyFilters = () => {
    let filtered = mapItems;
    
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === activeFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setFilteredItems(filtered);
  };

  // Add to comparison
  const addToComparison = (item: MapItem) => {
    if (selectedItems.length < 3 && !selectedItems.find(s => s.id === item.id)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const removeFromComparison = (itemId: number) => {
    setSelectedItems(selectedItems.filter(s => s.id !== itemId));
  };

  // Load data on mount and location change
  useEffect(() => {
    loadAllData(selectedLocation);
  }, [selectedLocation]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [activeFilter, searchQuery, mapItems]);

  const renderMapItem = (item: MapItem) => {
    const icon = item.type === 'community' ? communityIcon : 
                 item.type === 'hospital' ? hospitalIcon : vendorIcon;
    
    if (!item.lat || !item.lng) return null;
    
    return (
      <Marker key={`${item.type}-${item.id}`} position={[item.lat, item.lng]} icon={icon}>
        <Popup>
          <div className="p-2">
            <h3 className="font-bold text-sm">{item.name}</h3>
            <p className="text-xs text-gray-600 mb-1">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</p>
            {item.price && <p className="text-xs font-medium text-green-600">{item.price}</p>}
            {item.rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs">{item.rating.toFixed(1)}</span>
              </div>
            )}
            <Button 
              size="sm" 
              className="w-full mt-2 h-6 text-xs"
              onClick={() => addToComparison(item)}
              disabled={selectedItems.length >= 3}
            >
              Compare
            </Button>
          </div>
        </Popup>
      </Marker>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader 
        title="AI Map Intelligence" 
        subtitle="Complete Community Discovery + Comparison Tool"
      />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-2xl px-6 py-3 shadow-lg border border-gray-200 dark:border-gray-700 mb-4">
            <Brain className="h-6 w-6 text-blue-600" />
            <Globe className="h-5 w-5 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Map Intelligence
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Communities • Vendors • Services • Hospitals • All in One View
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-4">
            {/* Location Selector */}
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="California">California</SelectItem>
                <SelectItem value="Hawaii">Hawaii</SelectItem>
                <SelectItem value="Sacramento">Sacramento</SelectItem>
                <SelectItem value="Texas">Texas</SelectItem>
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search communities, vendors, hospitals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All', icon: Globe },
                { key: 'community', label: 'Communities', icon: Building },
                { key: 'hospital', label: 'Hospitals', icon: Hospital },
                { key: 'vendor', label: 'Vendors', icon: Users }
              ].map(filter => (
                <Button
                  key={filter.key}
                  variant={activeFilter === filter.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(filter.key)}
                  className="flex items-center gap-1"
                >
                  <filter.icon className="h-4 w-4" />
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* View Mode */}
            <div className="flex gap-1 border rounded-lg p-1">
              {[
                { key: 'map', icon: MapPin },
                { key: 'list', icon: List },
                { key: 'split', icon: BarChart3 }
              ].map(mode => (
                <Button
                  key={mode.key}
                  variant={viewMode === mode.key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode(mode.key as any)}
                >
                  <mode.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Map Section */}
          {(viewMode === 'map' || viewMode === 'split') && (
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Interactive Map
                  </div>
                  <Badge variant="secondary">
                    {filteredItems.length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 relative">
                  <MapContainer
                    center={[37.7749, -122.4194]}
                    zoom={10}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-b-lg"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    {filteredItems.map(renderMapItem)}
                  </MapContainer>
                  
                  {/* Map Legend */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[400]">
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        <span>Communities</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hospital className="h-4 w-4 text-red-600" />
                        <span>Hospitals</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span>Vendors</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* List + Analysis Section */}
          {(viewMode === 'list' || viewMode === 'split') && (
            <div className="space-y-6">
              {/* Comparison Panel */}
              {selectedItems.length > 0 && (
                <Card className="shadow-lg border-2 border-purple-200 dark:border-purple-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        Comparison ({selectedItems.length}/3)
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedItems([])}
                      >
                        Clear All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {selectedItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            {item.type === 'community' && <Building className="h-4 w-4 text-blue-600" />}
                            {item.type === 'hospital' && <Hospital className="h-4 w-4 text-red-600" />}
                            {item.type === 'vendor' && <Users className="h-4 w-4 text-green-600" />}
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-gray-600">{item.type} • {item.price}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromComparison(item.id)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Results List */}
              <Card className="shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5 text-gray-600" />
                    Results List
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {isLoading ? (
                        <div className="text-center py-8">
                          <Sparkles className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
                          <p className="text-sm text-gray-600">Loading data...</p>
                        </div>
                      ) : filteredItems.length === 0 ? (
                        <div className="text-center py-8">
                          <Search className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">No results found</p>
                        </div>
                      ) : (
                        filteredItems.map(item => (
                          <div key={`${item.type}-${item.id}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {item.type === 'community' && <Building className="h-4 w-4 text-blue-600" />}
                                  {item.type === 'hospital' && <Hospital className="h-4 w-4 text-red-600" />}
                                  {item.type === 'vendor' && <Users className="h-4 w-4 text-green-600" />}
                                  <h3 className="font-medium text-sm">{item.name}</h3>
                                  {item.verified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                                  {item.hudProperty && <Badge variant="outline" className="text-xs">HUD</Badge>}
                                </div>
                                
                                <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                                
                                <div className="flex items-center gap-4 text-xs">
                                  {item.price && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      <span>{item.price}</span>
                                    </div>
                                  )}
                                  {item.rating && (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      <span>{item.rating.toFixed(1)}</span>
                                    </div>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {item.type}
                                  </Badge>
                                </div>
                              </div>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addToComparison(item)}
                                disabled={selectedItems.length >= 3 || selectedItems.some(s => s.id === item.id)}
                                className="ml-2"
                              >
                                {selectedItems.some(s => s.id === item.id) ? 'Added' : 'Compare'}
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* AI Analysis Panel */}
              <Card className="shadow-lg border-2 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    AI Market Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{filteredItems.filter(i => i.type === 'community').length}</p>
                        <p className="text-xs text-gray-600">Communities</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{filteredItems.filter(i => i.type === 'hospital').length}</p>
                        <p className="text-xs text-gray-600">Hospitals</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{filteredItems.filter(i => i.type === 'vendor').length}</p>
                        <p className="text-xs text-gray-600">Vendors</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{filteredItems.filter(i => i.hudProperty).length}</p>
                        <p className="text-xs text-gray-600">HUD Verified</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-medium mb-2">AI Market Insights:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Strong healthcare infrastructure with {filteredItems.filter(i => i.type === 'hospital').length} major hospitals</li>
                        <li>• Diverse senior living options including {filteredItems.filter(i => i.hudProperty).length} HUD-verified affordable communities</li>
                        <li>• Comprehensive vendor network for specialized services</li>
                        <li>• Geographic distribution supports aging in place</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}