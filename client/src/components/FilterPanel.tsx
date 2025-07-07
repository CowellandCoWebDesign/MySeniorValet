import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { 
  X, 
  ChevronDown, 
  MapPin, 
  DollarSign,
  Heart,
  Users,
  Stethoscope,
  Clock,
  Car,
  Wifi,
  Utensils
} from "lucide-react";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    careTypes: string[];
    priceRange: [number, number];
    amenities: string[];
    region: string;
  };
  onFiltersChange: (filters: any) => void;
}

const careTypeOptions = [
  { id: 'independent', label: 'Independent Living', icon: Heart },
  { id: 'assisted', label: 'Assisted Living', icon: Users },
  { id: 'memory', label: 'Memory Care', icon: Stethoscope },
  { id: 'skilled', label: 'Skilled Nursing', icon: Clock },
];

const amenityOptions = [
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'dining', label: 'Dining Services', icon: Utensils },
  { id: 'transportation', label: 'Transportation', icon: Car },
  { id: 'fitness', label: 'Fitness Center', icon: Heart },
  { id: 'activities', label: 'Activity Programs', icon: Users },
];

const regionOptions = [
  'Bay Area',
  'Sacramento Region',
  'North Coast',
  'Central Valley',
  'Redding Area',
  'Eureka Area'
];

export default function FilterPanel({ isOpen, onClose, filters, onFiltersChange }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  if (!isOpen) return null;

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const toggleCareType = (careType: string) => {
    const current = localFilters.careTypes;
    const updated = current.includes(careType)
      ? current.filter(t => t !== careType)
      : [...current, careType];
    updateFilter('careTypes', updated);
  };

  const toggleAmenity = (amenity: string) => {
    const current = localFilters.amenities;
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    updateFilter('amenities', updated);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const resetFilters = () => {
    const resetFilters = {
      careTypes: [],
      priceRange: [1000, 8000] as [number, number],
      amenities: [],
      region: ''
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Filters</h1>
        </div>
        <Button variant="ghost" onClick={resetFilters} className="text-blue-600">
          Reset
        </Button>
      </div>

      {/* Save Search Bar */}
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-700">Get updates on your search</span>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5">
            Save Search
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Care Type Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Care Level</h3>
          <div className="grid grid-cols-1 gap-3">
            {careTypeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = localFilters.careTypes.includes(option.id);
              return (
                <Button
                  key={option.id}
                  variant={isSelected ? "default" : "outline"}
                  className={`justify-start h-12 ${
                    isSelected 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleCareType(option.id)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Monthly Cost</h3>
          <div className="space-y-4">
            <div className="px-3">
              <Slider
                value={localFilters.priceRange}
                onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                max={10000}
                min={1000}
                step={100}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>${localFilters.priceRange[0].toLocaleString()}</span>
              <span>${localFilters.priceRange[1].toLocaleString()}+</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Min</label>
                <input
                  type="number"
                  value={localFilters.priceRange[0]}
                  onChange={(e) => updateFilter('priceRange', [parseInt(e.target.value), localFilters.priceRange[1]])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="No min"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Max</label>
                <input
                  type="number"
                  value={localFilters.priceRange[1]}
                  onChange={(e) => updateFilter('priceRange', [localFilters.priceRange[0], parseInt(e.target.value)])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="No max"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Region */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Region</h3>
          <div className="space-y-2">
            {regionOptions.map((region) => (
              <Button
                key={region}
                variant={localFilters.region === region ? "default" : "outline"}
                className={`justify-start w-full h-10 ${
                  localFilters.region === region
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => updateFilter('region', localFilters.region === region ? '' : region)}
              >
                <MapPin className="w-4 h-4 mr-3" />
                {region}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Amenities */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Amenities</h3>
          <div className="grid grid-cols-2 gap-3">
            {amenityOptions.map((amenity) => {
              const Icon = amenity.icon;
              const isSelected = localFilters.amenities.includes(amenity.id);
              return (
                <Button
                  key={amenity.id}
                  variant={isSelected ? "default" : "outline"}
                  className={`justify-start h-12 text-sm ${
                    isSelected 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleAmenity(amenity.id)}
                >
                  <Icon className="w-3 h-3 mr-2" />
                  {amenity.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          onClick={applyFilters}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold"
        >
          See Results
        </Button>
      </div>
    </div>
  );
}