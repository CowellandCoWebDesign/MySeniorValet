import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function MultiAITest() {
  const [searchQuery, setSearchQuery] = useState("memory care San Francisco");
  const [compareIds, setCompareIds] = useState("264,278");
  
  // Check AI status
  const { data: aiStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/multi-ai/status'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Multi-AI search mutation
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch('/api/multi-ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filters: {} })
      });
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    }
  });

  // Multi-AI compare mutation
  const compareMutation = useMutation({
    mutationFn: async (ids: string) => {
      const communityIds = ids.split(',').map(id => parseInt(id.trim()));
      const response = await fetch('/api/multi-ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityIds })
      });
      if (!response.ok) throw new Error('Comparison failed');
      return response.json();
    }
  });

  const operationalCount = aiStatus?.summary?.operational || 0;
  const workingAIs = aiStatus?.status ? Object.entries(aiStatus.status)
    .filter(([_, status]: [string, any]) => status.working)
    .map(([name]) => name) : [];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Multi-AI Intelligence Network Test</h1>
        <p className="text-muted-foreground">
          Test and compare MySeniorValet's 3-AI cross-verification system with Claude, OpenAI, and Perplexity
        </p>
      </div>

      {/* AI System Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            AI Systems Status
            <Button 
              onClick={() => refetchStatus()} 
              variant="outline" 
              size="sm"
              disabled={statusLoading}
            >
              {statusLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking AI systems...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {aiStatus?.status && Object.entries(aiStatus.status).map(([name, status]: [string, any]) => (
                  <div key={name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold capitalize">{name}</h3>
                      {status.working ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{status.message}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Systems</p>
                    <p className="font-semibold">{aiStatus?.summary?.totalSystems || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Operational</p>
                    <p className="font-semibold text-green-600">{workingAIs.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Accuracy Level</p>
                    <p className="font-semibold">
                      {workingAIs.length >= 3 ? 'High (3 AIs)' : 
                       workingAIs.length >= 2 ? 'Medium (2 AIs)' : 
                       workingAIs.length >= 1 ? 'Basic (1 AI)' : 'None'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cross-Verification</p>
                    <p className="font-semibold">{workingAIs.length >= 2 ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="search">AI Search Test</TabsTrigger>
          <TabsTrigger value="compare">AI Compare Test</TabsTrigger>
        </TabsList>

        {/* Search Test */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-AI Search</CardTitle>
              <CardDescription>
                Test natural language search powered by {workingAIs.length} AI systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Try: 'memory care San Francisco under $5000'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchMutation.mutate(searchQuery)}
                />
                <Button 
                  onClick={() => searchMutation.mutate(searchQuery)}
                  disabled={searchMutation.isPending}
                >
                  {searchMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {searchMutation.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Search failed: {(searchMutation.error as Error).message}
                  </AlertDescription>
                </Alert>
              )}

              {searchMutation.data && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Search Results</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Communities Found: {searchMutation.data.communities?.length || 0}</div>
                      <div>AI Systems Used: {searchMutation.data.searchMetadata?.aiSystemsActive || 0}</div>
                      <div>Query: {searchMutation.data.searchMetadata?.query}</div>
                      <div>Timestamp: {new Date(searchMutation.data.searchMetadata?.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>

                  {searchMutation.data.aiInsights && (
                    <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">AI Insights</h4>
                      <p className="text-sm mb-2">{searchMutation.data.aiInsights.interpretation}</p>
                      <p className="text-sm text-muted-foreground">
                        Analyzed by: {searchMutation.data.aiInsights.workingAIs?.join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-semibold">Top Results:</h4>
                    {searchMutation.data.communities?.slice(0, 5).map((community: any) => (
                      <div key={community.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{community.name}</h5>
                            <p className="text-sm text-muted-foreground">
                              {community.city}, {community.state}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {community.careTypes?.map((type: string) => (
                                <Badge key={type} variant="secondary" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {community.priceRange ? 
                                `$${community.priceRange.min}-${community.priceRange.max}` : 
                                community.rentPerMonth ? 
                                `$${community.rentPerMonth}` : 
                                'Contact for pricing'}
                            </p>
                            {community.hudPropertyId && (
                              <Badge className="text-xs">HUD Verified</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compare Test */}
        <TabsContent value="compare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-AI Compare</CardTitle>
              <CardDescription>
                Compare communities using {workingAIs.length} AI systems for cross-verified insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter community IDs (e.g., 264,278)"
                  value={compareIds}
                  onChange={(e) => setCompareIds(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && compareMutation.mutate(compareIds)}
                />
                <Button 
                  onClick={() => compareMutation.mutate(compareIds)}
                  disabled={compareMutation.isPending}
                >
                  {compareMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Compare"
                  )}
                </Button>
              </div>

              {compareMutation.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Comparison failed: {(compareMutation.error as Error).message}
                  </AlertDescription>
                </Alert>
              )}

              {compareMutation.data && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Comparison Metadata</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Communities Compared: {compareMutation.data.communities?.length || 0}</div>
                      <div>AI Systems Active: {compareMutation.data.metadata?.aiSystemsActive || 0}</div>
                      <div>Compared At: {new Date(compareMutation.data.metadata?.comparedAt).toLocaleTimeString()}</div>
                    </div>
                  </div>

                  {compareMutation.data.aiAnalysis && (
                    <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">AI Analysis</h4>
                      <p className="text-sm mb-2">{compareMutation.data.aiAnalysis.recommendation}</p>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Key Differences:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {compareMutation.data.aiAnalysis.keyDifferences?.map((diff: string, idx: number) => (
                            <li key={idx}>{diff}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Analysis by: {compareMutation.data.aiAnalysis.systemsUsed?.join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h4 className="font-semibold">Comparison Results:</h4>
                    {compareMutation.data.comparison?.categories?.map((category: any) => (
                      <div key={category.name} className="border rounded-lg p-4">
                        <h5 className="font-medium mb-3">{category.name}</h5>
                        <div className="space-y-2">
                          {category.comparisons?.map((comp: any) => (
                            <div key={comp.metric} className="grid grid-cols-3 gap-2 text-sm">
                              <div className="font-medium">{comp.metric}:</div>
                              <div className="col-span-2 grid grid-cols-2 gap-2">
                                {comp.values?.map((val: any, idx: number) => (
                                  <div key={idx} className="bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
                                    <p className="font-medium text-xs">{val.community}</p>
                                    <p>{val.value}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}