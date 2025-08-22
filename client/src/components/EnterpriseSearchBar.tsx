import React, { useState, useCallback, useEffect } from 'react';
import { Search, MapPin, Filter, TrendingUp, Sparkles, Building, DollarSign, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEnterpriseSearch } from '@/hooks/useEnterpriseSearch';
import { cn } from '@/lib/utils';

interface EnterpriseSearchBarProps {
  onResultsChange?: (results: any) => void;
  className?: string;
  showFilters?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}

export function EnterpriseSearchBar({
  onResultsChange,
  className,
  showFilters = true,
  autoFocus = false,
  placeholder = "Search 33,726+ communities, cities, or states..."
}: EnterpriseSearchBarProps) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    careType: '',
    priceRange: { min: undefined as number | undefined, max: undefined as number | undefined },
    rating: { min: undefined as number | undefined },
    hasPhotos: false,
    hudOnly: false
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    results,
    loading,
    error,
    debouncedSearch,
    quickSearch,
    getTrending,
    aiSearch
  } = useEnterpriseSearch();

  // Update parent component when results change
  useEffect(() => {
    if (onResultsChange) {
      onResultsChange(results);
    }
  }, [results, onResultsChange]);

  // Perform search with current query and filters
  const performSearch = useCallback(() => {
    const searchParams = {
      query,
      limit: 1000, // Enterprise-grade limit
      ...(activeFilters.careType && { careTypes: [activeFilters.careType] }),
      ...(activeFilters.priceRange.min || activeFilters.priceRange.max ? { priceRange: activeFilters.priceRange } : {}),
      ...(activeFilters.rating.min && { rating: activeFilters.rating }),
      hasPhotos: activeFilters.hasPhotos,
      includeHudOnly: activeFilters.hudOnly
    };

    debouncedSearch(searchParams);
  }, [query, activeFilters, debouncedSearch]);

  // Trigger search on query or filter change
  useEffect(() => {
    if (query || Object.values(activeFilters).some(v => v)) {
      performSearch();
    }
  }, [query, activeFilters, performSearch]);

  const handleQuickFilter = (filterType: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleTrendingClick = async () => {
    await getTrending();
  };

  const handleAISearch = async () => {
    if (query) {
      await aiSearch(query);
    }
  };

  const clearFilters = () => {
    setActiveFilters({
      careType: '',
      priceRange: { min: undefined, max: undefined },
      rating: { min: undefined },
      hasPhotos: false,
      hudOnly: false
    });
    setQuery('');
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="pl-10 pr-4 h-12 text-lg"
              autoFocus={autoFocus}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <Button
            onClick={handleAISearch}
            variant="outline"
            className="h-12 px-4"
            disabled={!query || loading}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Search
          </Button>
          
          <Button
            onClick={handleTrendingClick}
            variant="outline"
            className="h-12 px-4"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending
          </Button>

          {showFilters && (
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant={showAdvanced ? "default" : "outline"}
              className="h-12 px-4"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          )}
        </div>

        {/* Search Results Summary */}
        {results.total > 0 && (
          <div className="absolute -bottom-6 left-0 text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{results.total.toLocaleString()}</span> of{' '}
            <span className="font-semibold text-foreground">{results.totalAvailable.toLocaleString()}</span> communities
            {results.searchMetadata?.processingTime && (
              <span className="ml-2">({results.searchMetadata.processingTime}ms)</span>
            )}
          </div>
        )}
      </div>

      {/* Quick Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={activeFilters.hudOnly ? "default" : "outline"}
            onClick={() => handleQuickFilter('hudOnly', !activeFilters.hudOnly)}
            className="h-8"
          >
            <Building className="h-3 w-3 mr-1" />
            HUD Verified
          </Button>
          
          <Button
            size="sm"
            variant={activeFilters.hasPhotos ? "default" : "outline"}
            onClick={() => handleQuickFilter('hasPhotos', !activeFilters.hasPhotos)}
            className="h-8"
          >
            📷 With Photos
          </Button>

          <Button
            size="sm"
            variant={activeFilters.rating.min === 4 ? "default" : "outline"}
            onClick={() => handleQuickFilter('rating', { min: activeFilters.rating.min === 4 ? undefined : 4 })}
            className="h-8"
          >
            <Star className="h-3 w-3 mr-1" />
            4+ Stars
          </Button>

          <Button
            size="sm"
            variant={activeFilters.priceRange.max === 3000 ? "default" : "outline"}
            onClick={() => handleQuickFilter('priceRange', { 
              min: undefined, 
              max: activeFilters.priceRange.max === 3000 ? undefined : 3000 
            })}
            className="h-8"
          >
            <DollarSign className="h-3 w-3 mr-1" />
            Under $3000
          </Button>

          {/* Care Type Quick Filters */}
          {['Assisted Living', 'Memory Care', 'Independent Living', 'Skilled Nursing'].map(type => (
            <Button
              key={type}
              size="sm"
              variant={activeFilters.careType === type ? "default" : "outline"}
              onClick={() => handleQuickFilter('careType', activeFilters.careType === type ? '' : type)}
              className="h-8"
            >
              {type}
            </Button>
          ))}

          {activeFilterCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearFilters}
              className="h-8 text-destructive"
            >
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showAdvanced && showFilters && (
        <div className="border rounded-lg p-4 space-y-4 bg-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={activeFilters.priceRange.min || ''}
                  onChange={(e) => handleQuickFilter('priceRange', {
                    ...activeFilters.priceRange,
                    min: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="h-9"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={activeFilters.priceRange.max || ''}
                  onChange={(e) => handleQuickFilter('priceRange', {
                    ...activeFilters.priceRange,
                    max: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="h-9"
                />
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Rating</label>
              <select
                value={activeFilters.rating.min || ''}
                onChange={(e) => handleQuickFilter('rating', {
                  min: e.target.value ? parseFloat(e.target.value) : undefined
                })}
                className="w-full h-9 px-3 rounded-md border bg-background"
              >
                <option value="">Any Rating</option>
                <option value="2">2+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>

            {/* Additional Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Options</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={activeFilters.hasPhotos}
                    onChange={(e) => handleQuickFilter('hasPhotos', e.target.checked)}
                    className="rounded"
                  />
                  Only show communities with photos
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={activeFilters.hudOnly}
                    onChange={(e) => handleQuickFilter('hudOnly', e.target.checked)}
                    className="rounded"
                  />
                  Only show HUD-verified pricing
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Suggestions */}
      {results.suggestions && results.suggestions.length > 0 && (
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">Suggestions:</span>
          {results.suggestions.map((suggestion, idx) => (
            <Button
              key={idx}
              size="sm"
              variant="ghost"
              onClick={() => setQuery(suggestion)}
              className="h-7 text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}