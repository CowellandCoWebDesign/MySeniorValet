import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, MapPin, Building2, Heart, Users, Loader2, Phone, Star, Shield, DollarSign, Home, Brain, CheckCircle } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { apiRequest } from '@/lib/queryClient';
import { useAddFavorite, useRemoveFavorite, useFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';

interface AutocompleteSuggestion {
  label: string;
  value: string;
  type: 'city' | 'state' | 'county' | 'community' | 'care_type' | 'vendor' | 'healthcare';
  count?: number;
  id?: number;
  description?: string;
  // Enhanced fields for community suggestions
  city?: string;
  state?: string;
  address?: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: { min: number; max: number };
  careTypes?: string[];
  communitySubtype?: string;
  totalUnits?: number;
  hudPropertyId?: string;
  monthlyRentRangeStart?: number;
  monthlyRentRangeEnd?: number;
  rentPerMonth?: number;
  availabilityStatus?: string;
  photos?: string[];
}

interface AutocompleteSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  hideSearchButton?: boolean;
  inputClassName?: string;
}

export function AutocompleteSearch({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Search cities, communities, care types...",
  isLoading = false,
  hideSearchButton = false,
  inputClassName = ""
}: AutocompleteSearchProps) {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useLocation();
  const justSelectedRef = useRef(false);
  
  const debouncedValue = useDebounce(value, 300);
  
  // Fetch user authentication status
  const { data: user } = useQuery<{ success: boolean; user: any }>({
    queryKey: ['/api/auth/user'],
  });
  
  // Favorites management
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const { toast } = useToast();
  
  const isAuthenticated = user?.success && user?.user;

  // Fetch suggestions
  useEffect(() => {
    // Skip fetching if we just selected a suggestion
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    
    if (debouncedValue && debouncedValue.length >= 2) {
      setLoadingSuggestions(true);
      apiRequest('GET', `/api/autocomplete/suggestions?query=${encodeURIComponent(debouncedValue)}&limit=10`)
        .then(data => {
          console.log('Autocomplete response:', data);
          // Ensure suggestions are in the correct format
          const validSuggestions = (data.suggestions || []).filter((s: AutocompleteSuggestion) => {
            // Ensure all fields are strings, not objects
            const isValid = s && 
              typeof s.label === 'string' && 
              typeof s.value === 'string' && 
              typeof s.type === 'string';
            
            // Show ALL valid suggestions including exact matches
            return isValid;
          });
          console.log('Valid suggestions:', validSuggestions);
          setSuggestions(validSuggestions);
          setShowSuggestions(validSuggestions.length > 0);
          setLoadingSuggestions(false);
        })
        .catch(error => {
          console.error('Autocomplete error:', error);
          console.error('Error details:', error.message);
          setSuggestions([]);
          setShowSuggestions(false);
          setLoadingSuggestions(false);
        });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedValue]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else {
        onSubmit(value.trim()); // Trim spaces when submitting
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: AutocompleteSuggestion) => {
    // If it's a community suggestion with an ID, navigate to the community detail page
    if (suggestion.type === 'community' && suggestion.id) {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      setLocation(`/community/${suggestion.id}`);
    } else {
      // For other types (city, state, care_type, etc.), perform the search
      justSelectedRef.current = true; // Prevent double-triggering autocomplete
      const trimmedValue = suggestion.value.trim(); // Trim spaces
      onChange(trimmedValue);
      setShowSuggestions(false);
      setSuggestions([]); // Clear suggestions immediately
      setSelectedIndex(-1);
      onSubmit(trimmedValue);
    }
  };
  
  const handleFavorite = async (e: React.MouseEvent, suggestion: AutocompleteSuggestion) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        action: (
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        ),
      });
      return;
    }
    
    const isFavorited = favorites?.some((fav: any) => fav.communityId === suggestion.id);
    
    if (isFavorited) {
      removeFavorite.mutate(suggestion.id!);
      toast({
        title: "Removed from favorites",
        description: `${suggestion.label} has been removed from your favorites`,
      });
    } else {
      addFavorite.mutate({
        communityId: suggestion.id!,
        notes: '',
        priority: 1,
        tags: suggestion.careTypes || [],
      });
      toast({
        title: "Added to favorites",
        description: `${suggestion.label} has been saved to your favorites`,
      });
    }
  };
  
  // Helper function to get care type badge
  const getCareTypeBadge = (subtype?: string) => {
    const subtypeMap: Record<string, { emoji: string; label: string; color: string }> = {
      'hud_senior_housing': { emoji: '🏛️', label: 'HUD Senior', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      'mobile_home_park': { emoji: '🏡', label: 'Mobile Home', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      'active_adult_55_plus': { emoji: '🏌️', label: '55+ Active', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      'independent_living': { emoji: '🏢', label: 'Independent', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
      'assisted_living': { emoji: '🏥', label: 'Assisted', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
      'memory_care': { emoji: '🧠', label: 'Memory Care', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
    };
    
    if (!subtype) return null;
    return subtypeMap[subtype] || null;
  };
  
  // Helper function to get pricing display
  const getPricingDisplay = (suggestion: AutocompleteSuggestion) => {
    if (suggestion.rentPerMonth) {
      return `$${Number(suggestion.rentPerMonth).toLocaleString()}/mo`;
    }
    if (suggestion.monthlyRentRangeStart) {
      const min = Number(suggestion.monthlyRentRangeStart).toLocaleString();
      const max = suggestion.monthlyRentRangeEnd ? Number(suggestion.monthlyRentRangeEnd).toLocaleString() : null;
      return max ? `$${min}-$${max}/mo` : `From $${min}/mo`;
    }
    if (suggestion.priceRange?.min) {
      const min = Number(suggestion.priceRange.min).toLocaleString();
      const max = suggestion.priceRange.max ? Number(suggestion.priceRange.max).toLocaleString() : null;
      return max ? `$${min}-$${max}/mo` : `From $${min}/mo`;
    }
    return 'Contact for pricing';
  };

  const getIcon = (type: string | undefined) => {
    if (!type) return <Search className="h-4 w-4" />;
    
    switch (type) {
      case 'location':
      case 'city':
      case 'state':
      case 'county':
        return <MapPin className="h-4 w-4" />;
      case 'community':
        return <Building2 className="h-4 w-4" />;
      case 'care_type':
        return <Heart className="h-4 w-4" />;
      case 'vendor':
        return <Users className="h-4 w-4" />;
      case 'healthcare':
        return <Heart className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'location':
      case 'city':
      case 'state':
      case 'county':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'community':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'care_type':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'vendor':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'healthcare':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={inputClassName || "w-full pl-10 pr-6 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"}
          disabled={isLoading}
        />
        {!hideSearchButton && (
          <Button 
            onClick={() => onSubmit(value)}
            disabled={isLoading || !value}
            className="absolute right-1 top-1/2 transform -translate-y-1/2"
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        )}
      </div>

      {/* Enhanced Autocomplete Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
        <Card 
          ref={suggestionsRef}
          className="absolute w-full mt-2 max-h-[400px] overflow-y-auto shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          style={{ zIndex: 999999, position: 'absolute', top: '100%', left: 0, right: 0 }}
        >
          {loadingSuggestions ? (
            <div className="p-4 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
            </div>
          ) : (
            <div className="py-2 space-y-2">
              {suggestions.map((suggestion, index) => {
                // Render rich card for community suggestions
                if (suggestion.type === 'community') {
                  const careTypeBadge = getCareTypeBadge(suggestion.communitySubtype);
                  const pricing = getPricingDisplay(suggestion);
                  const isFavorited = favorites?.some((fav: any) => fav.communityId === suggestion.id);
                  
                  return (
                    <div
                      key={`${suggestion.type}-${suggestion.value}-${index}`}
                      className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-700 ${
                        index === selectedIndex ? 'bg-gray-50 dark:bg-gray-700' : ''
                      }`}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      {/* Header with Name, Location, and Favorite */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                              {suggestion.label}
                            </h3>
                            {suggestion.hudPropertyId && (
                              <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0">
                                <Shield className="h-3 w-3 mr-0.5" />
                                HUD
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                            <MapPin className="h-3 w-3 mr-1" />
                            {suggestion.city}, {suggestion.state}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleFavorite(e, suggestion)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart 
                            className={`h-5 w-5 ${
                              isFavorited 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-gray-400 hover:text-red-500'
                            }`} 
                          />
                        </button>
                      </div>
                      
                      {/* Care Type Badge */}
                      {careTypeBadge && (
                        <div className="mb-2">
                          <Badge className={`inline-flex items-center px-2 py-1 text-xs font-medium ${careTypeBadge.color} border-0`}>
                            <span className="mr-1">{careTypeBadge.emoji}</span>
                            {careTypeBadge.label}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Key Information Row */}
                      <div className="flex flex-wrap items-center gap-4 text-xs mb-2">
                        {/* Pricing */}
                        <div className="flex items-center font-semibold">
                          <DollarSign className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
                          <span className="text-gray-900 dark:text-white">{pricing}</span>
                        </div>
                        
                        {/* Rating */}
                        {suggestion.rating && !isNaN(Number(suggestion.rating)) && (
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                            <span className="font-medium">{Number(suggestion.rating).toFixed(1)}</span>
                            {suggestion.reviewCount && (
                              <span className="text-gray-500 dark:text-gray-400 ml-1">
                                ({suggestion.reviewCount})
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Units */}
                        {suggestion.totalUnits && (
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Building2 className="h-3 w-3 mr-1" />
                            {suggestion.totalUnits} units
                          </div>
                        )}
                      </div>
                      
                      {/* Contact Information */}
                      {suggestion.phone && (
                        <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                          <Phone className="h-3 w-3 mr-1" />
                          <a 
                            href={`tel:${suggestion.phone}`} 
                            onClick={(e) => e.stopPropagation()}
                            className="font-medium"
                          >
                            {suggestion.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  );
                }
                
                // Default rendering for non-community suggestions
                return (
                  <button
                    key={`${suggestion.type}-${suggestion.value}-${index}`}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 ${
                      index === selectedIndex ? 'bg-gray-50 dark:bg-gray-700' : ''
                    }`}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span className={`p-1.5 rounded ${getTypeColor(suggestion.type)}`}>
                      {getIcon(suggestion.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{String(suggestion.label || '')}</div>
                      {suggestion.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {suggestion.description}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {String(suggestion.type || '').replace('_', ' ')}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}