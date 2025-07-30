import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NavigationHeader } from "@/components/NavigationHeader";

type Community = {
  id: number;
  name: string;
  city: string;
  state: string;
  address: string;
  phone: string | null;
  website: string | null;
  careTypes: string[];
  priceRange: string | null;
};

type CountResponse = {
  count: string;
};

type User = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export default function DatabaseTest() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchLocation, setSearchLocation] = useState("Sacramento");
  const [testResults, setTestResults] = useState<string[]>([]);

  // Test community search
  const { data: communities, isLoading: communitiesLoading, refetch: refetchCommunities } = useQuery<Community[]>({
    queryKey: ['/api/communities/by-location', searchLocation],
    enabled: false // Manual trigger
  });

  // Test community count
  const { data: countData, isLoading: countLoading, refetch: refetchCount } = useQuery<CountResponse>({
    queryKey: ['/api/communities/count'],
    enabled: false
  });

  // Test trending communities
  const { data: trending, isLoading: trendingLoading, refetch: refetchTrending } = useQuery<Community[]>({
    queryKey: ['/api/communities/trending'],
    enabled: false
  });

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runDatabaseTests = async () => {
    setTestResults([]);
    
    try {
      // Test 1: Community Count
      addTestResult("Testing community count...");
      const countResult = await refetchCount();
      if (countResult.data) {
        addTestResult(`✅ Community count: ${countResult.data.count} communities`);
      }

      // Test 2: Location Search
      addTestResult(`Testing location search for ${searchLocation}...`);
      const searchResult = await refetchCommunities();
      if (searchResult.data) {
        addTestResult(`✅ Found ${searchResult.data.length} communities in ${searchLocation}`);
      }

      // Test 3: Trending Communities
      addTestResult("Testing trending communities...");
      const trendingResult = await refetchTrending();
      if (trendingResult.data) {
        addTestResult(`✅ Loaded ${trendingResult.data.length} trending communities`);
      }

      addTestResult("🎉 All database tests completed successfully!");
    } catch (error) {
      addTestResult(`❌ Test failed: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationHeader 
        title="Database & Authentication Test" 
        subtitle="Test all database functionality and social login integrations"
      />
      <div className="max-w-6xl mx-auto space-y-6 p-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔐 Authentication Status
                {isAuthenticated ? (
                  <Badge className="bg-green-500">Authenticated</Badge>
                ) : (
                  <Badge variant="destructive">Not Authenticated</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {authLoading ? (
                <p>Loading authentication status...</p>
              ) : isAuthenticated ? (
                <div>
                  <p className="text-green-600 font-medium">✅ Successfully logged in!</p>
                  {user && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg">
                      <p><strong>User ID:</strong> {user.id}</p>
                      {user.email && <p><strong>Email:</strong> {user.email}</p>}
                      {user.firstName && <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>}
                    </div>
                  )}
                  <Button
                    onClick={() => window.location.href = '/api/logout'}
                    variant="outline"
                    className="mt-3"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-orange-600 mb-3">Not logged in. Test social login:</p>
                  <Button
                    onClick={() => window.location.href = '/api/login'}
                    className="w-full"
                  >
                    Login with Replit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Database Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🗄️ Database Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter location to search"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
                <Button onClick={runDatabaseTests} disabled={communitiesLoading || countLoading}>
                  Run Tests
                </Button>
              </div>
              
              {testResults.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg max-h-48 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <p key={index} className="text-sm mb-1 font-mono">{result}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Database Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Community Count */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Total Communities</CardTitle>
            </CardHeader>
            <CardContent>
              {countLoading ? (
                <p>Loading...</p>
              ) : countData ? (
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">{countData.count}</p>
                  <p className="text-gray-600">Communities in database</p>
                </div>
              ) : (
                <p className="text-gray-500">Run tests to see results</p>
              )}
            </CardContent>
          </Card>

          {/* Location Search Results */}
          <Card>
            <CardHeader>
              <CardTitle>🗺️ Location Search</CardTitle>
            </CardHeader>
            <CardContent>
              {communitiesLoading ? (
                <p>Loading...</p>
              ) : communities ? (
                <div>
                  <p className="text-2xl font-bold text-green-600">{communities.length}</p>
                  <p className="text-gray-600">Communities in {searchLocation}</p>
                  {communities.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Sample:</p>
                      <p className="text-sm text-gray-600">{communities[0]?.name}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Run tests to see results</p>
              )}
            </CardContent>
          </Card>

          {/* Trending Communities */}
          <Card>
            <CardHeader>
              <CardTitle>🔥 Trending</CardTitle>
            </CardHeader>
            <CardContent>
              {trendingLoading ? (
                <p>Loading...</p>
              ) : trending ? (
                <div>
                  <p className="text-2xl font-bold text-purple-600">{trending.length}</p>
                  <p className="text-gray-600">Trending communities</p>
                  {trending.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Top trending:</p>
                      <p className="text-sm text-gray-600">{trending[0]?.name}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Run tests to see results</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sample Community Data */}
        {communities && communities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📋 Sample Community Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {communities.slice(0, 6).map((community: Community) => (
                  <div key={community.id} className="border rounded-lg p-4 bg-white">
                    <h3 className="font-semibold text-lg mb-2">{community.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{community.address}</p>
                    <p className="text-gray-600 text-sm mb-2">{community.city}, {community.state}</p>
                    {community.phone && (
                      <p className="text-blue-600 text-sm mb-2">📞 {community.phone}</p>
                    )}
                    {community.priceRange && (
                      <p className="text-green-600 text-sm mb-2">💰 {community.priceRange}</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {community.careTypes?.slice(0, 2).map((type, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <Card>
          <CardContent className="flex justify-center gap-4 pt-6">
            <Button onClick={() => window.location.href = '/'} variant="outline">
              ← Back to Home
            </Button>
            <Button onClick={() => window.location.href = '/search'} variant="outline">
              Go to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}