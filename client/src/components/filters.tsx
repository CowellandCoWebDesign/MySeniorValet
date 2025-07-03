import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";

interface FiltersProps {
  onFiltersChange?: (filters: any) => void;
}

export function Filters({ onFiltersChange }: FiltersProps) {
  const [filters, setFilters] = useState({
    distance: "Within 10 miles",
    careServices: [] as string[],
    amenities: [] as string[],
    priceRange: { min: "", max: "" },
    minRating: "",
    availability: "all",
    verificationStatus: "all",
  });

  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    careServices: false,
    amenities: false,
  });

  const hasActiveFilters = () => {
    return filters.careServices.length > 0 || 
           filters.amenities.length > 0 || 
           filters.minRating !== "" || 
           filters.availability !== "all" ||
           filters.verificationStatus !== "all" ||
           filters.priceRange.min !== "" ||
           filters.priceRange.max !== "";
  };

  const careServiceOptions = [
    "Independent Living",
    "Assisted Living", 
    "Memory Care",
    "Skilled Nursing",
    "55+ Housing"
  ];

  const amenityOptions = [
    "WiFi",
    "Parking", 
    "Dining",
    "Fitness",
    "Restaurant",
    "Activities",
    "Library",
    "Pool",
    "Gardens",
    "Spa",
    "Beauty Salon"
  ];

  const ratingOptions = [
    { value: "4.5", label: "4.5+ Stars" },
    { value: "4.0", label: "4.0+ Stars" },
    { value: "3.5", label: "3.5+ Stars" },
    { value: "3.0", label: "3.0+ Stars" }
  ];

  const handleDistanceChange = (value: string) => {
    const newFilters = { ...filters, distance: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleCareServiceChange = (service: string, checked: boolean) => {
    const newCareServices = checked
      ? [...filters.careServices, service]
      : filters.careServices.filter(s => s !== service);
    
    const newFilters = { ...filters, careServices: newCareServices };
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

  const handleRatingChange = (value: string) => {
    const newFilters = { ...filters, minRating: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleAvailabilityChange = (value: string) => {
    const newFilters = { ...filters, availability: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleVerificationStatusChange = (value: string) => {
    const newFilters = { ...filters, verificationStatus: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const applyFilters = () => {
    setIsExpanded(false);
    onFiltersChange?.(filters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      distance: "Within 10 miles",
      careServices: [],
      amenities: [],
      priceRange: { min: "", max: "" },
      minRating: "",
      availability: "all",
      verificationStatus: "all",
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const toggleExpandSection = (section: 'careServices' | 'amenities') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Collapsed view
  if (!isExpanded && hasActiveFilters()) {
    return (
      <Card className="sticky top-24">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">
                {filters.careServices.length + filters.amenities.length} filters applied
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="flex items-center space-x-1"
            >
              <span>Edit</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Active filter tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {filters.careServices.map(service => (
              <span key={service} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                {service}
              </span>
            ))}
            {filters.amenities.slice(0, 3).map(amenity => (
              <span key={amenity} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                {amenity}
              </span>
            ))}
            {filters.amenities.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                +{filters.amenities.length - 3} more
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Refine Your Search</CardTitle>
          {hasActiveFilters() && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="flex items-center space-x-1"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
          )}
        </div>
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
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">Care Services</Label>
            {careServiceOptions.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpandSection('careServices')}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {expandedSections.careServices ? 'Show less' : `+${careServiceOptions.length - 3} more`}
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {(expandedSections.careServices ? careServiceOptions : careServiceOptions.slice(0, 3)).map((service) => (
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
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">Amenities</Label>
            {amenityOptions.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpandSection('amenities')}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {expandedSections.amenities ? 'Show less' : `+${amenityOptions.length - 3} more`}
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {(expandedSections.amenities ? amenityOptions : amenityOptions.slice(0, 3)).map((amenity) => (
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
          <Label className="text-sm font-medium mb-2 block">Minimum Rating</Label>
          <Select value={filters.minRating} onValueChange={handleRatingChange}>
            <SelectTrigger>
              <SelectValue placeholder="Any rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any rating</SelectItem>
              {ratingOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Availability</Label>
          <Select value={filters.availability} onValueChange={handleAvailabilityChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Communities</SelectItem>
              <SelectItem value="Available Now">Available Now</SelectItem>
              <SelectItem value="Waitlist">Waitlist Available</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Verification Status</Label>
          <Select value={filters.verificationStatus} onValueChange={handleVerificationStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Communities</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
              <SelectItem value="partial">Partially Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2 pt-4">
          <Button onClick={applyFilters} className="flex-1">
            Apply Filters
          </Button>
          {hasActiveFilters() && (
            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}