/**
 * Personalized Matches Component
 * AI-powered community matching based on user preferences
 */

import React, { useState, useEffect } from 'react';
import { Heart, Brain, MapPin, Star, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MatchResult {
  community: {
    id: string;
    name: string;
    description: string;
    careTypes: string[];
    city: string;
    state: string;
    amenities: string[];
    pricing?: string;
    properties?: {
      overallRating?: number;
      specialties?: string[];
    };
  };
  relevanceScore: number;
  explanation: string;
}

interface UserPreferences {
  careTypes: string[];
  location: {
    city?: string;
    state?: string;
  };
  amenities: string[];
  specialNeeds: string[];
}

interface PersonalizedMatchesProps {
  onCommunityClick?: (community: MatchResult['community']) => void;
  userId?: string;
}

const CARE_TYPE_OPTIONS = [
  'hud-sponsored',
  'va-housing',
  'mobile-rv',
  '55-plus',
  'independent-living',
  'board-care',
  'assisted-living',
  'memory-care',
  'ccrc',
  'skilled-nursing'
];

const AMENITY_OPTIONS = [
  'Fitness Center',
  'Swimming Pool',
  'Library',
  'Garden/Outdoor Spaces',
  'Pet-Friendly',
  'Transportation Services',
  'Dining Options',
  'Beauty Salon',
  'Medical Services On-Site',
  'Activities Program',
  'Chapel/Spiritual Services',
  'Wi-Fi/Internet'
];

const SPECIAL_NEEDS_OPTIONS = [
  'Alzheimer\'s Care',
  'Diabetes Management',
  'Physical Therapy',
  'Occupational Therapy',
  'Speech Therapy',
  'Medication Management',
  'Mobility Assistance',
  'Vision/Hearing Support',
  'Dietary Restrictions',
  'Mental Health Support'
];

export function PersonalizedMatches({ 
  onCommunityClick,
  userId 
}: PersonalizedMatchesProps) {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    careTypes: [],
    location: {},
    amenities: [],
    specialNeeds: []
  });
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const loadMatches = async () => {
    if (preferences.careTypes.length === 0 && preferences.amenities.length === 0) {
      return; // Need some preferences to find matches
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/weaviate/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences,
          limit: 5,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMatches(data.matches || []);
      } else {
        setError(data.message || 'Failed to load matches');
      }
    } catch (err) {
      setError('Failed to load matches');
      console.error('Matches error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [preferences]);

  const updatePreferences = (section: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const formatCareTypes = (careTypes: string[]) => {
    return careTypes.map(type => 
      type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    ).join(', ');
  };

  const hasPreferences = preferences.careTypes.length > 0 || 
                        preferences.amenities.length > 0 || 
                        preferences.specialNeeds.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900">Personalized Matches</h2>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Brain className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </div>
        
        <Dialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {hasPreferences ? 'Update Preferences' : 'Set Preferences'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Your Preferences</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Care Types */}
              <div>
                <Label className="text-base font-medium">Types of Care Needed</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {CARE_TYPE_OPTIONS.map((careType) => (
                    <div key={careType} className="flex items-center space-x-2">
                      <Checkbox
                        id={careType}
                        checked={preferences.careTypes.includes(careType)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updatePreferences('careTypes', [...preferences.careTypes, careType]);
                          } else {
                            updatePreferences('careTypes', preferences.careTypes.filter(t => t !== careType));
                          }
                        }}
                      />
                      <Label htmlFor={careType} className="text-sm">
                        {careType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <Label className="text-base font-medium">Preferred Location</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="city" className="text-sm">City</Label>
                    <Input
                      id="city"
                      value={preferences.location.city || ''}
                      onChange={(e) => updatePreferences('location', {
                        ...preferences.location,
                        city: e.target.value
                      })}
                      placeholder="Enter city"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm">State</Label>
                    <Input
                      id="state"
                      value={preferences.location.state || ''}
                      onChange={(e) => updatePreferences('location', {
                        ...preferences.location,
                        state: e.target.value
                      })}
                      placeholder="Enter state"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <Label className="text-base font-medium">Important Amenities</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {AMENITY_OPTIONS.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={preferences.amenities.includes(amenity)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updatePreferences('amenities', [...preferences.amenities, amenity]);
                          } else {
                            updatePreferences('amenities', preferences.amenities.filter(a => a !== amenity));
                          }
                        }}
                      />
                      <Label htmlFor={amenity} className="text-sm">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Needs */}
              <div>
                <Label className="text-base font-medium">Special Care Needs</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {SPECIAL_NEEDS_OPTIONS.map((need) => (
                    <div key={need} className="flex items-center space-x-2">
                      <Checkbox
                        id={need}
                        checked={preferences.specialNeeds.includes(need)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updatePreferences('specialNeeds', [...preferences.specialNeeds, need]);
                          } else {
                            updatePreferences('specialNeeds', preferences.specialNeeds.filter(n => n !== need));
                          }
                        }}
                      />
                      <Label htmlFor={need} className="text-sm">
                        {need}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsPreferencesOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsPreferencesOpen(false)}>
                  Save Preferences
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* No Preferences Set */}
      {!hasPreferences && (
        <Card className="text-center py-8">
          <CardContent>
            <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Set Your Preferences</h3>
            <p className="text-gray-600 text-sm mb-4">
              Tell us what you're looking for and we'll find the perfect communities for you.
            </p>
            <Button onClick={() => setIsPreferencesOpen(true)}>
              Set Preferences
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <Card className="text-center py-8">
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Finding your perfect communities...</p>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Matches */}
      {!isLoading && matches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Your Personalized Matches
          </h3>

          <div className="grid gap-4">
            {matches.map((match, index) => (
              <Card 
                key={`${match.community.id}-${index}`}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onCommunityClick?.(match.community)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                        {match.community.name}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {match.community.city}, {match.community.state}
                        </div>
                        {match.community.properties?.overallRating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {match.community.properties.overallRating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">
                      {Math.round(match.relevanceScore * 100)}% match
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Description */}
                  {match.community.description && (
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {match.community.description.length > 200 
                        ? `${match.community.description.slice(0, 200)}...` 
                        : match.community.description
                      }
                    </p>
                  )}

                  {/* Care Types */}
                  {match.community.careTypes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">Care Types:</span>
                      <span className="text-sm text-gray-600">
                        {formatCareTypes(match.community.careTypes)}
                      </span>
                    </div>
                  )}

                  {/* AI Explanation */}
                  <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-200">
                    <p className="text-xs text-purple-800">
                      <strong>Why this matches:</strong> {match.explanation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button 
            onClick={loadMatches}
            variant="outline" 
            className="w-full"
            disabled={isLoading}
          >
            Refresh Matches
          </Button>
        </div>
      )}

      {/* No Matches */}
      {!isLoading && hasPreferences && matches.length === 0 && !error && (
        <Card className="text-center py-8">
          <CardContent>
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 text-sm mb-4">
              Try adjusting your preferences to see more communities.
            </p>
            <Button variant="outline" onClick={() => setIsPreferencesOpen(true)}>
              Update Preferences
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}