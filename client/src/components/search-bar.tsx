import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Filter } from "lucide-react";
import { useLocation } from "wouter";

interface SearchBarProps {
  onSearch?: (params: {
    location: string;
    careType: string;
    budget: string;
  }) => void;
  showAdvancedFilters?: boolean;
  onToggleAdvancedFilters?: () => void;
}

export function SearchBar({ onSearch, showAdvancedFilters, onToggleAdvancedFilters }: SearchBarProps) {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState({
    location: "",
    careType: "All Types",
    budget: "Any Budget",
  });

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchParams);
    } else {
      // Navigate to search page with params
      const params = new URLSearchParams();
      if (searchParams.location) params.set('location', searchParams.location);
      if (searchParams.careType !== 'All Types') params.set('careType', searchParams.careType);
      if (searchParams.budget !== 'Any Budget') params.set('budget', searchParams.budget);
      
      setLocation(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          <div className="md:col-span-2">
            <Label className="block text-sm font-medium text-gray-700 mb-2">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="City, State or ZIP Code"
                className="pl-10"
                value={searchParams.location}
                onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Care Type</Label>
            <Select value={searchParams.careType} onValueChange={(value) => setSearchParams(prev => ({ ...prev, careType: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Types</SelectItem>
                <SelectItem value="Independent Living">Independent Living</SelectItem>
                <SelectItem value="Assisted Living">Assisted Living</SelectItem>
                <SelectItem value="Memory Care">Memory Care</SelectItem>
                <SelectItem value="Skilled Nursing">Skilled Nursing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Budget</Label>
            <Select value={searchParams.budget} onValueChange={(value) => setSearchParams(prev => ({ ...prev, budget: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any Budget">Any Budget</SelectItem>
                <SelectItem value="$2,000 - $4,000">$2,000 - $4,000</SelectItem>
                <SelectItem value="$4,000 - $6,000">$4,000 - $6,000</SelectItem>
                <SelectItem value="$6,000 - $8,000">$6,000 - $8,000</SelectItem>
                <SelectItem value="$8,000+">$8,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Button onClick={handleSearch} className="flex-1 bg-primary hover:bg-primary/90">
            <Search className="mr-2 h-4 w-4" />
            Search Communities
          </Button>
          {onToggleAdvancedFilters && (
            <Button variant="outline" onClick={onToggleAdvancedFilters}>
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
