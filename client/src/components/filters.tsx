import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FiltersProps {
  onFiltersChange?: (filters: any) => void;
}

export function Filters({ onFiltersChange }: FiltersProps) {
  const [filters, setFilters] = useState({
    distance: "Within 10 miles",
    careServices: [] as string[],
    amenities: [] as string[],
    transparencyScore: "",
  });

  const careServiceOptions = [
    "Independent Living",
    "Assisted Living", 
    "Memory Care",
    "Skilled Nursing"
  ];

  const amenityOptions = [
    "Pet Friendly",
    "Transportation",
    "Fitness Center",
    "Dining Options"
  ];

  const handleCareServiceChange = (service: string, checked: boolean) => {
    const newServices = checked
      ? [...filters.careServices, service]
      : filters.careServices.filter(s => s !== service);
    
    const newFilters = { ...filters, careServices: newServices };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const newAmenities = checked
      ? [...filters.amenities, amenity]
      : filters.amenities.filter(a => a !== amenity);
    
    const newFilters = { ...filters, amenities: newAmenities };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleDistanceChange = (distance: string) => {
    const newFilters = { ...filters, distance };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleTransparencyScoreChange = (score: string) => {
    const newFilters = { ...filters, transparencyScore: score };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange?.(filters);
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Refine Your Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium mb-2 block">Distance</Label>
          <Select value={filters.distance} onValueChange={handleDistanceChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Within 10 miles">Within 10 miles</SelectItem>
              <SelectItem value="Within 25 miles">Within 25 miles</SelectItem>
              <SelectItem value="Within 50 miles">Within 50 miles</SelectItem>
              <SelectItem value="Within 100 miles">Within 100 miles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Care Services</Label>
          <div className="space-y-2">
            {careServiceOptions.map((service) => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox
                  id={service}
                  checked={filters.careServices.includes(service)}
                  onCheckedChange={(checked) => handleCareServiceChange(service, !!checked)}
                />
                <Label htmlFor={service} className="text-sm text-gray-700">
                  {service}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Amenities</Label>
          <div className="space-y-2">
            {amenityOptions.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={filters.amenities.includes(amenity)}
                  onCheckedChange={(checked) => handleAmenityChange(amenity, !!checked)}
                />
                <Label htmlFor={amenity} className="text-sm text-gray-700">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Transparency Score</Label>
          <RadioGroup
            value={filters.transparencyScore}
            onValueChange={handleTransparencyScoreChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excellent" id="excellent" />
              <Label htmlFor="excellent" className="text-sm text-gray-700">
                Excellent (4.5-5.0)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="good" id="good" />
              <Label htmlFor="good" className="text-sm text-gray-700">
                Good (3.5-4.4)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fair" id="fair" />
              <Label htmlFor="fair" className="text-sm text-gray-700">
                Fair (2.5-3.4)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button onClick={applyFilters} className="w-full">
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}
