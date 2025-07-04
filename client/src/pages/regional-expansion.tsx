import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Building2, 
  Target, 
  TrendingUp, 
  Database, 
  CheckCircle, 
  AlertCircle,
  Play,
  BarChart3
} from "lucide-react";

interface County {
  county: string;
  region: string;
  primaryCities: string[];
  priority: number;
  marketSize: "Urban" | "Suburban" | "Rural";
  searchRadius: number;
}

interface ExpansionResult {
  county: string;
  region: string;
  totalFound: number;
  newCommunities: number;
  duplicatesFiltered: number;
  enrichedCommunities: number;
  verificationLevel: "High" | "Medium" | "Low";
  discoveryMethods: string[];
  errors: string[];
}

export default function RegionalExpansion() {
  const [expansionResults, setExpansionResults] = useState<ExpansionResult[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string>("");

  // Get target counties
  const { data: countiesData, isLoading: countiesLoading } = useQuery({
    queryKey: ['/api/regional-expansion/counties'],
  });

  // Execute regional expansion
  const executionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/regional-expansion/execute', 'POST');
    },
    onSuccess: (data) => {
      setExpansionResults(data.detailedResults || []);
    },
  });

  // Get county statistics
  const { data: countyStats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/regional-expansion/county', selectedCounty, 'stats'],
    enabled: !!selectedCounty,
  });

  const counties: County[] = countiesData?.counties || [];

  const getMarketSizeColor = (size: string) => {
    switch (size) {
      case "Urban": return "bg-red-100 text-red-800";
      case "Suburban": return "bg-yellow-100 text-yellow-800";
      case "Rural": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getVerificationColor = (level: string) => {
    switch (level) {
      case "High": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🌍 Regional Expansion Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Strategic expansion to 7 target counties across Northern California with enhanced 
              data collection and multi-source verification.
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="counties">Target Counties</TabsTrigger>
              <TabsTrigger value="execute">Execute Expansion</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Target Markets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 mb-2">7</div>
                    <p className="text-sm text-gray-600">Counties across Bay Area, Sacramento, and North Coast</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="h-5 w-5 text-green-600" />
                      Discovery Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 mb-2">6</div>
                    <p className="text-sm text-gray-600">Query types per region with deduplication</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Market Priority
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600 mb-2">10K+</div>
                    <p className="text-sm text-gray-600">Potential users in target demographics</p>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Regional Expansion Strategy:</strong> Using Google Places API with 6-query approach per region:
                  "senior living", "assisted living", "retirement community", "senior apartments", "Senior Park", "retirement home".
                  All discoveries include photo enrichment, review collection, and verification.
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Target Counties Tab */}
            <TabsContent value="counties" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {countiesLoading ? (
                  <div className="col-span-full text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading target counties...</p>
                  </div>
                ) : (
                  counties.map((county) => (
                    <Card key={county.county} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            {county.county} County
                          </span>
                          <Badge className={getMarketSizeColor(county.marketSize)}>
                            {county.marketSize}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{county.region}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="font-medium text-sm text-gray-700 mb-2">Primary Cities:</p>
                          <div className="flex flex-wrap gap-1">
                            {county.primaryCities.map((city) => (
                              <Badge key={city} variant="outline" className="text-xs">
                                {city}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Priority:</span>
                            <div className="font-semibold text-lg">{county.priority}/10</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Search Radius:</span>
                            <div className="font-semibold text-lg">{county.searchRadius}km</div>
                          </div>
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setSelectedCounty(county.county);
                            refetchStats();
                          }}
                          className="w-full"
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Statistics
                        </Button>

                        {selectedCounty === county.county && countyStats && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                            <h4 className="font-medium text-gray-900">Current Statistics</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">Total Communities:</span>
                                <div className="font-semibold">{countyStats.statistics.totalCommunities}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">New (24h):</span>
                                <div className="font-semibold text-green-600">{countyStats.statistics.newCommunities}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Enriched (24h):</span>
                                <div className="font-semibold text-blue-600">{countyStats.statistics.enrichedCommunities}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Verification:</span>
                                <div className="font-semibold">{countyStats.statistics.verificationLevel}%</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Execute Expansion Tab */}
            <TabsContent value="execute" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-green-600" />
                    Execute Regional Expansion
                  </CardTitle>
                  <CardDescription>
                    Launch comprehensive discovery across all 7 target counties using the 6-query strategy.
                    This will discover, verify, and enrich senior living communities with photos and reviews.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Process Overview:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Execute 6 discovery queries per county (42 total searches)</li>
                        <li>• Cross-reference with existing database for deduplication</li>
                        <li>• Verify community authenticity through multiple sources</li>
                        <li>• Enrich with Google Places photos and review data</li>
                        <li>• Add regional tags for search filtering</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={() => executionMutation.mutate()}
                    disabled={executionMutation.isPending}
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {executionMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Executing Regional Expansion...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Regional Expansion
                      </>
                    )}
                  </Button>

                  {executionMutation.isPending && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing counties...</span>
                        <span>This may take several minutes</span>
                      </div>
                      <Progress value={33} className="w-full" />
                    </div>
                  )}

                  {executionMutation.isError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Expansion failed: {executionMutation.error?.message || 'Unknown error'}
                      </AlertDescription>
                    </Alert>
                  )}

                  {executionMutation.isSuccess && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Regional expansion completed successfully! Check the Results tab for detailed information.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6">
              {expansionResults.length > 0 ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {expansionResults.reduce((sum, r) => sum + r.totalFound, 0)}
                        </div>
                        <p className="text-sm text-gray-600">Total Found</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {expansionResults.reduce((sum, r) => sum + r.newCommunities, 0)}
                        </div>
                        <p className="text-sm text-gray-600">New Communities</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-purple-600">
                          {expansionResults.reduce((sum, r) => sum + r.enrichedCommunities, 0)}
                        </div>
                        <p className="text-sm text-gray-600">Enriched</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-orange-600">
                          {expansionResults.reduce((sum, r) => sum + r.duplicatesFiltered, 0)}
                        </div>
                        <p className="text-sm text-gray-600">Duplicates Filtered</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* County Results */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {expansionResults.map((result) => (
                      <Card key={result.county}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{result.county} County</span>
                            <Badge className={getVerificationColor(result.verificationLevel)}>
                              {result.verificationLevel} Verification
                            </Badge>
                          </CardTitle>
                          <CardDescription>{result.region}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Total Found:</span>
                              <div className="font-semibold text-lg">{result.totalFound}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">New Added:</span>
                              <div className="font-semibold text-lg text-green-600">{result.newCommunities}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Enriched:</span>
                              <div className="font-semibold text-lg text-blue-600">{result.enrichedCommunities}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Duplicates:</span>
                              <div className="font-semibold text-lg text-orange-600">{result.duplicatesFiltered}</div>
                            </div>
                          </div>

                          {result.discoveryMethods.length > 0 && (
                            <div>
                              <p className="font-medium text-sm text-gray-700 mb-2">Discovery Methods:</p>
                              <div className="text-xs text-gray-600">
                                {result.discoveryMethods.length} successful query strategies
                              </div>
                            </div>
                          )}

                          {result.errors.length > 0 && (
                            <div>
                              <p className="font-medium text-sm text-red-700 mb-2">Errors:</p>
                              <div className="text-xs text-red-600 space-y-1">
                                {result.errors.slice(0, 3).map((error, index) => (
                                  <div key={index} className="truncate">{error}</div>
                                ))}
                                {result.errors.length > 3 && (
                                  <div className="text-gray-500">+{result.errors.length - 3} more errors</div>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Execute the regional expansion to see detailed results and statistics.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => document.querySelector('[value="execute"]')?.click()}
                    >
                      Go to Execute Tab
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}