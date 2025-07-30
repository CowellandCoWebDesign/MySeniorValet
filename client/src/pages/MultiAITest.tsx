import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function MultiAITest() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Query all AI services
  const { data: claudeResults, isLoading: claudeLoading } = useQuery({
    queryKey: ['/api/ai/enhanced-search', searchQuery, location, searchTrigger],
    enabled: searchTrigger > 0,
    queryFn: async () => {
      const response = await fetch('/api/ai/enhanced-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, location })
      });
      if (!response.ok) throw new Error('Claude search failed');
      return response.json();
    }
  });

  const { data: perplexityResults, isLoading: perplexityLoading } = useQuery({
    queryKey: ['/api/perplexity/enhanced-search', searchQuery, location, searchTrigger],
    enabled: searchTrigger > 0,
    queryFn: async () => {
      const response = await fetch('/api/perplexity/enhanced-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, location })
      });
      if (!response.ok) throw new Error('Perplexity search failed');
      return response.json();
    }
  });

  // DeepSeek removed due to payment processing issues

  // Health checks
  const { data: healthStatus } = useQuery({
    queryKey: ['/api/health-checks'],
    queryFn: async () => {
      const [claude, perplexity] = await Promise.allSettled([
        fetch('/api/ai/health').then(r => r.json()),
        fetch('/api/perplexity/health').then(r => r.json())
      ]);
      
      return {
        claude: claude.status === 'fulfilled' ? claude.value : { status: 'error' },
        perplexity: perplexity.status === 'fulfilled' ? perplexity.value : { status: 'error' }
      };
    }
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchTrigger(prev => prev + 1);
    }
  };

  const isAnyLoading = claudeLoading || perplexityLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader 
        title="Multi-AI Intelligence Network" 
        subtitle="Test all 4 AI engines together"
      />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 Multi-AI Intelligence Network
            <div className="flex gap-2 ml-auto">
              <Badge variant={healthStatus?.claude?.status === 'healthy' ? 'default' : 'destructive'}>
                Claude {healthStatus?.claude?.status === 'healthy' ? '✅' : '❌'}
              </Badge>
              <Badge variant={healthStatus?.perplexity?.status === 'healthy' ? 'default' : 'destructive'}>
                Perplexity {healthStatus?.perplexity?.status === 'healthy' ? '✅' : '❌'}
              </Badge>
              <Badge variant="secondary">
                DeepSeek ⏸️ (Disabled)
              </Badge>
            </div>
          </CardTitle>
          <p className="text-muted-foreground">
            Cross-verification search across all AI engines for maximum accuracy
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search query (e.g., affordable assisted living with memory care)"
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
            <Button onClick={handleSearch} disabled={isAnyLoading}>
              {isAnyLoading ? "Searching..." : "Multi-AI Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {(claudeResults || perplexityResults) && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="claude">Claude AI</TabsTrigger>
            <TabsTrigger value="perplexity">Perplexity</TabsTrigger>
            <TabsTrigger value="consensus">Consensus</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Search Results Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {claudeResults?.databaseResults || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Claude Results</div>
                    <Badge variant={claudeResults?.enhanced ? 'default' : 'secondary'}>
                      {claudeResults?.enhanced ? 'Enhanced' : 'Database Only'}
                    </Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {perplexityResults?.databaseResults || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Perplexity Results</div>
                    <Badge variant={perplexityResults?.enhanced ? 'default' : 'secondary'}>
                      {perplexityResults?.enhanced ? 'Enhanced' : 'Database Only'}
                    </Badge>
                  </div>
                </div>

                {(claudeResults?.communities || perplexityResults?.communities) && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-4">Sample Communities Found</h3>
                    <div className="grid gap-3">
                      {(claudeResults?.communities || perplexityResults?.communities)?.slice(0, 3).map((community: any) => (
                        <div key={community.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{community.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {community.city}, {community.state}
                              </div>
                              {community.careType && (
                                <Badge variant="outline" className="mt-1">
                                  {community.careType}
                                </Badge>
                              )}
                            </div>
                            {community.rentPerMonth && (
                              <div className="text-right">
                                <div className="text-lg font-semibold text-green-600">
                                  ${community.rentPerMonth}/mo
                                </div>
                                <div className="text-xs text-muted-foreground">HUD Verified</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claude">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🧠 Claude AI Analysis
                  <Badge variant={claudeLoading ? 'secondary' : 'default'}>
                    {claudeLoading ? 'Loading...' : 'Complete'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {claudeResults?.aiInsights && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap">
                      {claudeResults.aiInsights}
                    </pre>
                  </div>
                )}
                {!claudeResults?.aiInsights && claudeResults && (
                  <p className="text-muted-foreground">Database search completed, AI analysis not available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perplexity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌐 Perplexity Web Intelligence
                  <Badge variant={perplexityLoading ? 'secondary' : 'default'}>
                    {perplexityLoading ? 'Loading...' : 'Complete'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {perplexityResults?.perplexityInsights && (
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap">
                      {perplexityResults.perplexityInsights}
                    </pre>
                  </div>
                )}
                {!perplexityResults?.perplexityInsights && perplexityResults && (
                  <p className="text-muted-foreground">Database search completed, web intelligence not available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disabled">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⏸️ DeepSeek Disabled
                  <Badge variant="secondary">Payment Issues</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-lg text-center">
                  <p className="text-muted-foreground">
                    DeepSeek AI has been disabled due to payment processing issues with their API service.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consensus">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Multi-AI Consensus (Coming Soon)</CardTitle>
                <p className="text-muted-foreground">
                  Unified insights combining all AI analyses for maximum accuracy
                </p>
              </CardHeader>
              <CardContent>
                <div className="p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                  Multi-AI consensus feature will be available when all engines provide insights
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      </div>
    </div>
  );
}