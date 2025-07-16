import { useState } from 'react';
import { PricingBreakdown } from './pricing-breakdown';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, RefreshCw } from 'lucide-react';

// Available states and their major cities
const stateOptions = [
  { code: 'CA', name: 'California', cities: ['San Francisco', 'Los Angeles', 'San Diego', 'Sacramento'] },
  { code: 'TX', name: 'Texas', cities: ['Austin', 'Dallas', 'Houston', 'San Antonio'] },
  { code: 'FL', name: 'Florida', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville'] },
  { code: 'AZ', name: 'Arizona', cities: ['Phoenix', 'Tucson', 'Scottsdale', 'Mesa'] },
  { code: 'NV', name: 'Nevada', cities: ['Las Vegas', 'Reno', 'Henderson', 'Carson City'] },
  { code: 'GA', name: 'Georgia', cities: ['Atlanta', 'Savannah', 'Augusta', 'Columbus'] }
];

interface LocationSelection {
  state: string;
  city: string;
}

export function PricingIntelligenceSelector() {
  const [selectedLocations, setSelectedLocations] = useState<LocationSelection[]>([
    { state: 'CA', city: 'San Francisco' },
    { state: 'TX', city: 'Austin' }
  ]);

  const [tempState, setTempState] = useState('');
  const [tempCity, setTempCity] = useState('');

  const handleAddLocation = () => {
    if (tempState && tempCity) {
      const newLocation = { state: tempState, city: tempCity };
      // Check if location already exists
      const exists = selectedLocations.some(
        loc => loc.state === tempState && loc.city === tempCity
      );
      
      if (!exists) {
        setSelectedLocations([...selectedLocations, newLocation]);
      }
      
      setTempState('');
      setTempCity('');
    }
  };

  const handleRemoveLocation = (index: number) => {
    setSelectedLocations(selectedLocations.filter((_, i) => i !== index));
  };

  const getAvailableCities = (stateCode: string) => {
    const state = stateOptions.find(s => s.code === stateCode);
    return state ? state.cities : [];
  };

  const resetToDefault = () => {
    setSelectedLocations([
      { state: 'CA', city: 'San Francisco' },
      { state: 'TX', city: 'Austin' }
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Location Selector */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span className="text-blue-900">Customize Your Pricing Intelligence</span>
          </CardTitle>
          <p className="text-sm text-blue-700">
            Select up to 4 locations to compare market pricing across different areas
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-blue-800 mb-2 block">State</label>
              <Select value={tempState} onValueChange={setTempState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state..." />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map(state => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-blue-800 mb-2 block">City</label>
              <Select 
                value={tempCity} 
                onValueChange={setTempCity}
                disabled={!tempState}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city..." />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableCities(tempState).map(city => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button
                onClick={handleAddLocation}
                disabled={!tempState || !tempCity || selectedLocations.length >= 4}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Location
              </Button>
              <Button
                variant="outline"
                onClick={resetToDefault}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* Current Selections */}
          {selectedLocations.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-blue-800">Current Selections:</div>
              <div className="flex flex-wrap gap-2">
                {selectedLocations.map((location, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                    onClick={() => handleRemoveLocation(index)}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {location.city}, {location.state}
                    <span className="ml-2 text-xs">×</span>
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-blue-600">
                <Users className="h-3 w-3 inline mr-1" />
                Click on location badges to remove them
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {selectedLocations.map((location, index) => (
          <PricingBreakdown
            key={`${location.state}-${location.city}-${index}`}
            state={location.state}
            city={location.city}
            className="h-full"
          />
        ))}
      </div>
    </div>
  );
}