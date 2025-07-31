/**
 * AI Search Page
 * Comprehensive semantic search and personalized recommendations powered by Weaviate
 */

import React, { useState } from 'react';
import { Brain, Search, Heart, Target, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SemanticSearch } from '@/components/SemanticSearch';
import { PersonalizedRecommendations } from '@/components/PersonalizedRecommendations';

export default function AISearchPage() {
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [weaviateStatus, setWeaviateStatus] = useState<any>(null);

  React.useEffect(() => {
    // Check Weaviate status on page load
    fetch('/api/weaviate/status')
      .then(res => res.json())
      .then(data => setWeaviateStatus(data))
      .catch(console.error);
  }, []);

  const handleCommunityClick = (community: any) => {
    setSelectedCommunity(community);
    // Could redirect to community detail page
    console.log('Selected community:', community);
  };

  const handleIndexCommunities = async () => {
    try {
      const response = await fetch('/api/weaviate/index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 100,
          offset: 0,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Successfully indexed ${data.indexedCount} communities!`);
      } else {
        alert(`Indexing failed: ${data.message}`);
      }
    } catch (error) {
      alert('Indexing request failed');
      console.error('Indexing error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="h-8 w-8" />
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Powered by Weaviate AI
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AI-Powered Senior Living Search
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Find the perfect community using natural language and personalized AI recommendations
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <Sparkles className="h-4 w-4" />
                Semantic Search
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <Target className="h-4 w-4" />
                Personalized Recommendations
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <Heart className="h-4 w-4" />
                Similar Communities
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {weaviateStatus && (
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${weaviateStatus.status?.isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">
                    Weaviate Status: {weaviateStatus.status?.isHealthy ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                {weaviateStatus.status?.isInitialized && (
                  <Badge variant="outline" className="text-xs">
                    Schema Ready
                  </Badge>
                )}
              </div>
              <Button 
                onClick={handleIndexCommunities}
                size="sm"
                variant="outline"
                disabled={!weaviateStatus.status?.isHealthy}
              >
                Index Communities
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Semantic Search
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Search with Natural Language
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Describe what you're looking for in plain English. Our AI understands context, 
                preferences, and finds communities that truly match your needs.
              </p>
            </div>

            <SemanticSearch 
              onResultClick={handleCommunityClick}
              placeholder="Find peaceful communities with memory care and beautiful gardens..."
              maxResults={10}
            />

            {/* Example Searches */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
              <CardHeader>
                <CardTitle className="text-center text-lg">Try These Example Searches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Affordable communities near downtown with fitness centers",
                    "Memory care facilities with pet therapy programs",
                    "Luxury communities with golf courses and spa services", 
                    "Communities for couples with independent and assisted living",
                    "Quiet communities with gardens and art programs",
                    "Faith-based communities with chapel services"
                  ].map((example, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border text-sm text-gray-700">
                      "{example}"
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Personalized Recommendations
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Set your preferences and let our AI find communities perfectly tailored to your specific needs and lifestyle.
              </p>
            </div>

            <PersonalizedRecommendations 
              onCommunityClick={handleCommunityClick}
            />
          </TabsContent>
        </Tabs>

        {/* Selected Community Preview */}
        {selectedCommunity && (
          <Card className="mt-12 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-blue-600" />
                Selected Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {selectedCommunity.name}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {selectedCommunity.city}, {selectedCommunity.state}
                  </p>
                  <p className="text-sm text-gray-700">
                    Care Types: {selectedCommunity.careTypes?.join(', ')}
                  </p>
                </div>
                <Button>
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Grid */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Semantic Understanding</h3>
              <p className="text-sm text-gray-600">
                Our AI understands context and meaning, not just keywords. 
                Search naturally and get relevant results.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Target className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Personalized Matching</h3>
              <p className="text-sm text-gray-600">
                Set your preferences once and get tailored recommendations 
                that improve over time.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Similar Communities</h3>
              <p className="text-sm text-gray-600">
                Found a community you like? We'll find similar ones 
                with comparable features and amenities.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Experience the Future of Senior Living Search
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            MySeniorValet combines cutting-edge AI with comprehensive community data 
            to help families find the perfect senior living solutions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary">
              Start Searching
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}