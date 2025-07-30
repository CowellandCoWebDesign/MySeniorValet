import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function PerplexityTest() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/ai/enhanced-search', searchQuery, location, searchTrigger],
    enabled: searchTrigger > 0,
    queryFn: async () => {
      const response = await fetch('/api/ai/enhanced-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, location })
      });
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    }
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchTrigger(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader 
        title="Perplexity AI Test" 
        subtitle="Real-time web intelligence search"
      />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🌐 Enhanced AI Search with Perplexity</CardTitle>
          <p className="text-muted-foreground">
            Test the new real-time web search integration
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search query (e.g., affordable assisted living)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-48"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Database Results:</strong> {searchResults.databaseResults} communities
                  </div>
                  <div>
                    <strong>Enhanced:</strong> {searchResults.enhanced ? '✅ Yes' : '❌ No'}
                  </div>
                </div>

                {searchResults.communities && searchResults.communities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Database Communities:</h3>
                    <div className="grid gap-2">
                      {searchResults.communities.slice(0, 5).map((community: any) => (
                        <div key={community.id} className="p-3 border rounded-lg">
                          <div className="font-medium">{community.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {community.city}, {community.state}
                          </div>
                          {community.rentPerMonth && (
                            <div className="text-sm text-green-600">
                              HUD Verified: ${community.rentPerMonth}/month
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.perplexityInsights && (
                  <div>
                    <h3 className="font-semibold mb-2">Real-Time Web Insights:</h3>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">
                        {searchResults.perplexityInsights}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
}