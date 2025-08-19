import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import CommunityMatchingQuiz from '@/components/CommunityMatchingQuiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, ExternalLink, Heart, ArrowLeft, Sparkles } from 'lucide-react';
import { NavigationHeader } from '@/components/NavigationHeader';

interface QuizAnswers {
  [key: string]: string | string[] | number;
}

interface Community {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  careTypes: string[];
  rating: number;
  reviewCount: number;
  phone: string;
  website: string;
  priceRange: { min: number; max: number };
  photos: string[];
  description: string;
  matchScore?: number;
  matchReasons?: string[];
}

export default function QuizPage() {
  const [, setLocation] = useLocation();
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Fetch matched communities based on quiz answers
  const { data: matchedCommunities, isLoading } = useQuery({
    queryKey: ['quiz-matches', quizAnswers],
    queryFn: async () => {
      if (!quizAnswers) return [];
      
      const response = await fetch('/api/communities/quiz-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizAnswers),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      
      return response.json();
    },
    enabled: !!quizAnswers && showResults,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleQuizComplete = (answers: QuizAnswers) => {
    setQuizAnswers(answers);
    setShowResults(true);
  };

  const handleStartOver = () => {
    setQuizAnswers(null);
    setShowResults(false);
  };

  if (showResults && quizAnswers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
              <div className="flex-1" />
              <Button variant="outline" onClick={handleStartOver}>
                Take Quiz Again
              </Button>
            </div>
            
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Your Perfect Matches</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">
              We Found {matchedCommunities?.length || 0} Communities For You
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Based on your preferences, here are the senior living communities that best match your needs and lifestyle.
            </p>
          </div>

          {/* Quiz Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-600" />
                Your Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(quizAnswers).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {Array.isArray(value) ? value.join(', ') : value.toString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Finding your perfect matches...</p>
            </div>
          )}

          {/* Matched Communities */}
          {matchedCommunities && matchedCommunities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedCommunities.map((community: Community, index: number) => (
                <Card key={community.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {community.photos && community.photos[0] && (
                      <img 
                        src={community.photos[0]} 
                        alt={community.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        {community.matchScore || 85 + index * 2}% Match
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">{community.name}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{community.city}, {community.state}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{community.rating} ({community.reviewCount} reviews)</span>
                      </div>
                      
                      {community.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{community.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {community.careTypes.map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    
                    {community.matchReasons && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-green-600 mb-2">Why this matches:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {community.matchReasons.map((reason, idx) => (
                            <li key={idx}>• {reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium text-green-600 mb-2">
                        ${community.priceRange.min.toLocaleString()} - ${community.priceRange.max.toLocaleString()}/month
                      </p>
                      
                      <Button 
                        className="w-full"
                        onClick={() => setLocation(`/communities/${community.id}`)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Matches */}
          {matchedCommunities && matchedCommunities.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No exact matches found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your preferences or browse all communities to find your perfect fit.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleStartOver}>
                  Retake Quiz
                </Button>
                <Button onClick={() => setLocation('/map-search')}>
                  Browse All Communities
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <NavigationHeader 
        title="Community Matching Quiz" 
        subtitle="Find your perfect senior living match"
      />
      <div className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Find Your Perfect Match</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">
            Community Matching Quiz
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Answer a few questions about your care needs, lifestyle preferences, and budget to find senior living communities that are perfect for you.
          </p>
        </div>

        {/* Quiz Component */}
        <CommunityMatchingQuiz onComplete={handleQuizComplete} />
      </div>
      </div>
    </div>
  );
}