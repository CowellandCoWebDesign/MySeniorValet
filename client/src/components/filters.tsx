import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Filter, MapPin, DollarSign, Star, Home, Users, X } from "lucide-react";

interface FiltersProps {
  onFiltersChange?: (filters: any) => void;
  initialFilters?: any;
}

export function Filters({ onFiltersChange, initialFilters }: FiltersProps) {
  const [filters, setFilters] = useState({
    distance: "Within 10 miles",
    careServices: [] as string[],
    amenities: [] as string[],
    priceRange: { min: "", max: "" },
    minRating: "any",
    availability: "all",
    verificationStatus: "all",
  });

  const [expandedSections, setExpandedSections] = useState({
    careServices: true,
    amenities: false,
  });

  // Update filters when initial filters change
  useEffect(() => {
    console.log('initialFilters changed:', initialFilters);
    if (initialFilters) {
      const convertedFilters = {
        distance: "Within 10 miles",
        careServices: [] as string[],
        amenities: [] as string[],
        priceRange: { min: "", max: "" },
        minRating: "any",
        availability: "all",
        verificationStatus: "all",
      };
      
      // Convert careType to careServices
      if (initialFilters.careType) {
        convertedFilters.careServices = initialFilters.careType.split(',');
      }
      
      // Convert budget to priceRange
      if (initialFilters.budget) {
        const budgetStr = initialFilters.budget;
        if (budgetStr.includes(' - ')) {
          const [min, max] = budgetStr.replace(/\$/g, '').split(' - ');
          convertedFilters.priceRange = { min, max };
        } else if (budgetStr.includes('+')) {
          convertedFilters.priceRange = { min: budgetStr.replace(/\$|\+/g, ''), max: "" };
        } else if (budgetStr.includes('Under')) {
          convertedFilters.priceRange = { min: "", max: budgetStr.replace(/Under \$/g, '') };
        }
      }
      
      // Convert distance
      if (initialFilters.distance) {
        convertedFilters.distance = `Within ${initialFilters.distance} miles`;
      }
      
      // Convert minRating
      if (initialFilters.minRating) {
        const ratingValue = parseFloat(initialFilters.minRating.toString()).toFixed(1);
        console.log('Converting minRating:', initialFilters.minRating, 'to:', ratingValue);
        convertedFilters.minRating = ratingValue;
      }
      
      // Convert availability
      if (initialFilters.availability) {
        convertedFilters.availability = initialFilters.availability;
      }
      
      // Convert amenities
      if (initialFilters.amenities) {
        convertedFilters.amenities = initialFilters.amenities;
      }
      
      console.log('Setting converted filters:', convertedFilters);
      setFilters(convertedFilters);
    }
  }, [JSON.stringify(initialFilters)]);

  const hasActiveFilters = () => {
    return filters.careServices.length > 0 || 
           filters.amenities.length > 0 || 
           filters.minRating !== "any" || 
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

  const updateFilters = (updates: Partial<typeof filters>) => {
    const newFilters = { ...filters, ...updates };
    console.log('Updating filters:', { old: filters, updates, new: newFilters });
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleDistanceChange = (value: string) => {
    updateFilters({ distance: value });
  };

  const handleCareServiceChange = (service: string, checked: boolean) => {
    const newCareServices = checked
      ? [...filters.careServices, service]
      : filters.careServices.filter(s => s !== service);
    updateFilters({ careServices: newCareServices });
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const newAmenities = checked
      ? [...filters.amenities, amenity]
      : filters.amenities.filter(a => a !== amenity);
    updateFilters({ amenities: newAmenities });
  };

  const handleRatingChange = (value: string) => {
    console.log('Rating changed to:', value);
    updateFilters({ minRating: value });
  };

  const handleAvailabilityChange = (value: string) => {
    updateFilters({ availability: value });
  };

  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    updateFilters({ 
      priceRange: { ...filters.priceRange, [field]: value }
    });
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      distance: "Within 10 miles",
      careServices: [],
      amenities: [],
      priceRange: { min: "", max: "" },
      minRating: "any",
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

  return (
    <div className="space-y-6">
      {/* Primary Filters - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Distance */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            Distance
          </Label>
          <Select value={filters.distance} onValueChange={handleDistanceChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Within 5 miles">Within 5 miles</SelectItem>
              <SelectItem value="Within 10 miles">Within 10 miles</SelectItem>
              <SelectItem value="Within 25 miles">Within 25 miles</SelectItem>
              <SelectItem value="Within 50 miles">Within 50 miles</SelectItem>
              <SelectItem value="Within 100 miles">Within 100 miles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            Monthly Price Range
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="Min"
              value={filters.priceRange.min}
              onChange={(e) => handlePriceRangeChange('min', e.target.value)}
              className="w-full"
            />
            <Input
              placeholder="Max"
              value={filters.priceRange.max}
              onChange={(e) => handlePriceRangeChange('max', e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4 text-gray-500" />
            Minimum Rating
          </Label>
          <Select value={filters.minRating} onValueChange={handleRatingChange}>
            <SelectTrigger>
              <SelectValue placeholder="Any rating">
                {filters.minRating === "any" 
                  ? "Any rating" 
                  : ratingOptions.find(opt => opt.value === filters.minRating)?.label || `${filters.minRating}+ Stars`
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any rating</SelectItem>
              {ratingOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Availability */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            Availability
          </Label>
          <Select value={filters.availability} onValueChange={handleAvailabilityChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All communities</SelectItem>
              <SelectItem value="Available">Available now</SelectItem>
              <SelectItem value="Waitlist">Accepting waitlist</SelectItem>
              <SelectItem value="Unavailable">Currently full</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Care Services */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Home className="h-4 w-4 text-blue-600" />
              Care Services ({filters.careServices.length} selected)
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpandSection('careServices')}
            >
              {expandedSections.careServices ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {expandedSections.careServices && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {careServiceOptions.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={`care-${service}`}
                    checked={filters.careServices.includes(service)}
                    onCheckedChange={(checked) => 
                      handleCareServiceChange(service, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`care-${service}`}
                    className="text-sm cursor-pointer"
                  >
                    {service}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-600" />
              Amenities ({filters.amenities.length} selected)
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpandSection('amenities')}
            >
              {expandedSections.amenities ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {expandedSections.amenities && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {amenityOptions.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={filters.amenities.includes(amenity)}
                    onCheckedChange={(checked) => 
                      handleAmenityChange(amenity, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`amenity-${amenity}`}
                    className="text-sm cursor-pointer"
                  >
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Clear Filters Button */}
      {hasActiveFilters() && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}