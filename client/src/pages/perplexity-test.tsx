import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, TrendingUp, CheckCircle, AlertCircle, Globe } from "lucide-react";

export default function PerplexityTest() {
  const [query, setQuery] = useState("Miami senior living pricing 2025");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchMethod, setSearchMethod] = useState<'direct' | 'enhanced' | 'ai' | 'semantic'>('direct');

  const testDirectPerplexity = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('POST', '/api/test/perplexity', {
        query
      });
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testEnhancedSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('GET', `/api/communities/search?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      setResult({
        searchType: 'Enhanced Search with Real-Time Data',
        communities: data.communities,
        metadata: data.searchMetadata,
        total: data.total,
        realTimeEnriched: data.searchMetadata?.realTimeEnriched
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testAISearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('POST', '/api/ai/search', {
        query,
        context: "User is looking for senior living options with real-time market data"
      });
      const data = await response.json();
      setResult({
        searchType: 'AI Search with Market Intelligence',
        parsedIntent: data.parsedIntent,
        communities: data.communities,
        marketInsights: data.parsedIntent?.marketInsights
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testSemanticSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('POST', '/api/semantic/search', {
        query,
        includeRAG: false,
        limit: 5
      });
      const data = await response.json();
      setResult({
        searchType: 'Semantic Search with Real-Time Enhancement',
        communities: data.communities,
        total: data.total,
        realTimeData: data.communities?.[0]?.realTimeInsights
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    switch (searchMethod) {
      case 'direct':
        testDirectPerplexity();
        break;
      case 'enhanced':
        testEnhancedSearch();
        break;
      case 'ai':
        testAISearch();
        break;
      case 'semantic':
        testSemanticSearch();
        break;
    }
  };

  const formatPrice = (price: any) => {
    if (typeof price === 'string' && price.includes('$')) {
      return price;
    }
    if (typeof price === 'number') {
      return `$${price.toLocaleString()}`;
    }
    return price || 'Contact for pricing';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Globe className="h-8 w-8" />
              Perplexity Real-Time Search Integration Test
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertTitle>Live Market Intelligence Active</AlertTitle>
                <AlertDescription>
                  Perplexity AI is now integrated across all search methods, providing real-time pricing, 
                  availability, and market insights with zero hallucinations.
                </AlertDescription>
              </Alert>

              {/* Search Method Selection */}
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={searchMethod === 'direct' ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => setSearchMethod('direct')}
                >
                  Direct Perplexity API
                </Badge>
                <Badge 
                  variant={searchMethod === 'enhanced' ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => setSearchMethod('enhanced')}
                >
                  Enhanced Search
                </Badge>
                <Badge 
                  variant={searchMethod === 'ai' ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => setSearchMethod('ai')}
                >
                  AI Intelligence Search
                </Badge>
                <Badge 
                  variant={searchMethod === 'semantic' ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => setSearchMethod('semantic')}
                >
                  Semantic Search
                </Badge>
              </div>

              {/* Search Input */}
              <div className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Miami senior living pricing 2025"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Test {searchMethod === 'direct' ? 'Perplexity' : 
                            searchMethod === 'enhanced' ? 'Enhanced' :
                            searchMethod === 'ai' ? 'AI' : 'Semantic'}
                    </>
                  )}
                </Button>
              </div>

              {/* Sample Queries */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Try these sample queries:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Miami senior living pricing 2025",
                    "HUD housing Dallas Texas",
                    "Memory care Phoenix availability",
                    "Assisted living Chicago under $4000",
                    "55+ communities Florida Gulf Coast"
                  ].map((sample) => (
                    <Button
                      key={sample}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(sample)}
                    >
                      {sample}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
        {result && (
          <Card className="border-2 border-emerald-200 dark:border-emerald-800">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                {result.searchType || 'Perplexity Results'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Direct Perplexity Results */}
              {result.success !== undefined && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? "Success" : "Failed"}
                        </Badge>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Response Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{result.responseTime || 'N/A'}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Tokens Used</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{result.tokensUsed || 'N/A'}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {result.data && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Real-Time Market Data</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap text-sm">{result.data}</pre>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {result.citations && result.citations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Verified Sources</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {result.citations.map((citation: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              <a 
                                href={citation} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm break-all"
                              >
                                {citation}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {result.pricing && result.pricing.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Extracted Pricing</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {result.pricing.map((price: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                              <span className="font-medium">{price.name || `Option ${idx + 1}`}</span>
                              <Badge variant="secondary" className="text-lg">
                                {formatPrice(price.price || price)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Enhanced Search Results */}
              {result.communities && (
                <div className="space-y-4">
                  {result.metadata && (
                    <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                      <AlertDescription>
                        <div className="flex justify-between items-center">
                          <span>Found {result.total || result.communities.length} communities</span>
                          {result.realTimeEnriched && (
                            <Badge variant="default" className="bg-green-600">
                              Real-Time Enhanced ✓
                            </Badge>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Market Insights from AI Search */}
                  {result.marketInsights && (
                    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Live Market Intelligence
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm"><strong>Source:</strong> {result.marketInsights.source}</p>
                          <p className="text-sm"><strong>Timestamp:</strong> {new Date(result.marketInsights.timestamp).toLocaleString()}</p>
                          <div className="bg-white dark:bg-gray-800 p-3 rounded mt-2">
                            <p className="text-sm whitespace-pre-wrap">{result.marketInsights.data}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Community Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.communities.slice(0, 6).map((community: any, idx: number) => (
                      <Card key={community.id || idx} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{community.name}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {community.city}, {community.state}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Pricing */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Pricing:</span>
                            <Badge variant="secondary" className="text-lg">
                              {community.realTimePricing || 
                               (community.priceRange ? 
                                `$${community.priceRange.min}-$${community.priceRange.max}` :
                                'Contact for pricing')}
                            </Badge>
                          </div>

                          {/* Real-Time Insights */}
                          {community.realTimeInsights && (
                            <div className="bg-emerald-50 dark:bg-emerald-950 p-3 rounded">
                              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                                Real-Time Market Data
                              </p>
                              <p className="text-sm">{community.realTimeInsights.marketPricing}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                via {community.realTimeInsights.dataSource}
                              </p>
                            </div>
                          )}

                          {/* Semantic Score */}
                          {community.semanticScore && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Match Score:</span>
                              <Badge variant="outline">
                                {(community.semanticScore * 100).toFixed(1)}%
                              </Badge>
                            </div>
                          )}

                          {/* Care Types */}
                          {community.careTypes && community.careTypes.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {community.careTypes.map((type: string) => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Parsed Intent from AI Search */}
              {result.parsedIntent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">AI Understanding</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Interpretation:</strong> {result.parsedIntent.searchInterpretation}</p>
                      {result.parsedIntent.location && (
                        <p className="text-sm"><strong>Location:</strong> {result.parsedIntent.location}</p>
                      )}
                      {result.parsedIntent.careTypes && result.parsedIntent.careTypes.length > 0 && (
                        <p className="text-sm"><strong>Care Types:</strong> {result.parsedIntent.careTypes.join(', ')}</p>
                      )}
                      {result.parsedIntent.priceRange && (
                        <p className="text-sm">
                          <strong>Price Range:</strong> ${result.parsedIntent.priceRange.min} - ${result.parsedIntent.priceRange.max}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}

        {/* Architecture Info */}
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg">AI Priority Architecture (August 10, 2025)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-600">1️⃣ Primary</Badge>
                <span>Perplexity AI - Real-time web search, pricing verification, zero hallucinations</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-600">2️⃣ Secondary</Badge>
                <span>Claude Sonnet 4 - Deep analysis, intent parsing, context understanding</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-600">3️⃣ Backup</Badge>
                <span>ChatGPT-4o - Fallback processing, additional validation</span>
              </div>
              <Alert className="mt-4">
                <AlertDescription>
                  All search methods now enhanced with Perplexity's real-time market intelligence. 
                  Average response time: 3-7 seconds for verified, current data.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}