/**
 * Weaviate Test Page
 * Comprehensive testing interface for all Weaviate AI features
 */

import React, { useState } from 'react';
import { Brain, Search, TestTube, Database, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SemanticSearch } from '@/components/SemanticSearch';
import { PersonalizedMatches } from '@/components/PersonalizedMatches';
import { SimilarCommunities } from '@/components/SimilarCommunities';
import { WeaviateIndexManager } from '@/components/WeaviateIndexManager';

export default function WeaviateTestPage() {
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  const handleCommunitySelect = (community: any) => {
    setSelectedCommunity(community);
    console.log('Selected community for testing:', community);
  };

  const runQuickTests = async () => {
    const tests = [
      {
        name: 'Semantic Search - Gardens',
        query: { query: 'peaceful communities with beautiful gardens', limit: 2 },
        endpoint: '/api/weaviate/search'
      },
      {
        name: 'Semantic Search - Memory Care',
        query: { query: 'memory care specialized facilities', limit: 2 },
        endpoint: '/api/weaviate/search'
      },
      {
        name: 'Semantic Search - Luxury',
        query: { query: 'luxury senior living with spa services', limit: 2 },
        endpoint: '/api/weaviate/search'
      },
      {
        name: 'Health Check',
        query: {},
        endpoint: '/api/weaviate/health'
      },
      {
        name: 'Status Check',
        query: {},
        endpoint: '/api/weaviate/status'
      }
    ];

    const results = [];

    for (const test of tests) {
      try {
        const method = test.endpoint.includes('health') || test.endpoint.includes('status') ? 'GET' : 'POST';
        const options: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
        };

        if (method === 'POST' && Object.keys(test.query).length > 0) {
          options.body = JSON.stringify(test.query);
        }

        const response = await fetch(test.endpoint, options);
        const data = await response.json();

        results.push({
          test: test.name,
          success: response.ok,
          status: response.status,
          results: data.results || data,
          resultCount: data.results?.length || (data.success ? 1 : 0),
          data
        });
      } catch (error) {
        results.push({
          test: test.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          resultCount: 0
        });
      }
    }

    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TestTube className="h-8 w-8" />
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Development Testing
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Weaviate AI Testing Suite
            </h1>
            <p className="text-xl text-purple-100 mb-6">
              Comprehensive testing interface for vector search, recommendations, and AI features
            </p>
          </div>
        </div>
      </div>

      {/* Quick Test Panel */}
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Quick Test Suite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Button onClick={runQuickTests} className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Run All Tests
              </Button>
              <Badge variant="outline">
                {testResults.length} tests {testResults.length > 0 && `• ${testResults.filter(t => t.success).length} passed`}
              </Badge>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{result.test}</span>
                      <div className="flex items-center gap-2">
                        {result.resultCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {result.resultCount} results
                          </Badge>
                        )}
                        <Badge 
                          variant={result.success ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {result.success ? 'PASS' : 'FAIL'}
                        </Badge>
                      </div>
                    </div>
                    {result.error && (
                      <p className="text-red-600 text-xs mt-1">{result.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Testing Interface */}
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="similar" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Similar
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-8 mt-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Semantic Search Testing</h2>
              <p className="text-gray-600">Test natural language search capabilities</p>
            </div>
            <SemanticSearch 
              onResultClick={handleCommunitySelect}
              placeholder="Test query: 'memory care with pet therapy' or 'affordable communities near downtown'"
              maxResults={5}
            />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-8 mt-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personalized Recommendations Testing</h2>
              <p className="text-gray-600">Test AI-powered personalization</p>
            </div>
            <PersonalizedMatches onCommunityClick={handleCommunitySelect} />
          </TabsContent>

          <TabsContent value="similar" className="space-y-8 mt-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Similar Communities Testing</h2>
              <p className="text-gray-600">Test vector similarity search</p>
            </div>
            
            {selectedCommunity ? (
              <SimilarCommunities 
                communityId={selectedCommunity.id}
                communityName={selectedCommunity.name}
                onCommunityClick={handleCommunitySelect}
                maxResults={5}
              />
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Community First</h3>
                  <p className="text-gray-600 mb-4">
                    Use the Search tab to find a community, then come back here to test similar community discovery.
                  </p>
                  {/* Test with hardcoded community ID */}
                  <Button 
                    onClick={() => setSelectedCommunity({ id: '1', name: 'Test Community' })}
                    variant="outline"
                  >
                    Test with Sample Community (ID: 1)
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="admin" className="space-y-8 mt-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Index Management</h2>
              <p className="text-gray-600">Manage vector database indexing</p>
            </div>
            <WeaviateIndexManager />
          </TabsContent>
        </Tabs>

        {/* Selected Community Display */}
        {selectedCommunity && (
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Currently Selected for Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-blue-900">{selectedCommunity.name}</h3>
                  <p className="text-blue-700 text-sm">ID: {selectedCommunity.id}</p>
                  {selectedCommunity.city && selectedCommunity.state && (
                    <p className="text-blue-700 text-sm">{selectedCommunity.city}, {selectedCommunity.state}</p>
                  )}
                </div>
                <div className="text-right">
                  <Button 
                    onClick={() => setSelectedCommunity(null)}
                    variant="outline"
                    size="sm"
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}