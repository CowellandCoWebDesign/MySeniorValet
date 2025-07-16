import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, CheckCircle, XCircle, Trash2, RefreshCw, Eye, Target, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ServiceListingAnalysis {
  id: number;
  name: string;
  isServiceProvider: boolean;
  confidenceScore: number;
  matchedPatterns: string[];
  recommendation: 'flag_as_service' | 'keep_as_community' | 'needs_review';
}

interface ServiceListingResults {
  summary: {
    flagged: number;
    needsReview: number;
    kept: number;
    dryRun: boolean;
  };
  results: ServiceListingAnalysis[];
}

export default function ServiceListingsAdmin() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ServiceListingResults | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Scan for service listings
  const scanMutation = useMutation({
    mutationFn: async ({ limit = 100, dryRun = true }: { limit?: number; dryRun?: boolean }) => {
      const response = await apiRequest(`/api/admin/service-listings/scan?limit=${limit}&dry_run=${dryRun}`);
      return response;
    },
    onSuccess: (data) => {
      setScanResults(data);
      toast({
        title: "Scan Complete",
        description: `Found ${data.summary.flagged} service listings, ${data.summary.needsReview} need review, ${data.summary.kept} kept as communities`,
      });
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Process service listings
  const processMutation = useMutation({
    mutationFn: async (dryRun: boolean = true) => {
      const response = await apiRequest('/api/admin/service-listings/process', {
        method: 'POST',
        body: { dryRun }
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: dryRun ? "Dry Run Complete" : "Processing Complete",
        description: data.message,
      });
      // Refresh scan results
      scanMutation.mutate({ limit: 100, dryRun: true });
    },
    onError: (error) => {
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Flag individual listing
  const flagMutation = useMutation({
    mutationFn: async (communityId: number) => {
      const response = await apiRequest(`/api/admin/service-listings/${communityId}/flag`, {
        method: 'POST'
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Listing Flagged",
        description: data.message,
      });
      // Refresh scan results
      scanMutation.mutate({ limit: 100, dryRun: true });
    },
    onError: (error) => {
      toast({
        title: "Flagging Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'flag_as_service':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Flag as Service</Badge>;
      case 'needs_review':
        return <Badge variant="secondary" className="gap-1"><Eye className="h-3 w-3" />Needs Review</Badge>;
      case 'keep_as_community':
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Keep as Community</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.7) return 'text-red-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const dryRun = true;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Listing Management</h1>
          <p className="text-gray-600">Identify and manage referral services and agencies to maintain platform integrity</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scan">Scan & Analysis</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Anti-Referral Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    MySeniorValet maintains a strict anti-referral fee policy. This tool helps identify and remove
                    referral services, agencies, and other 3rd party services that conflict with our mission.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Legitimate senior living communities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Referral services and agencies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Care service providers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Medical staffing agencies</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => scanMutation.mutate({ limit: 100, dryRun: true })}
                    disabled={scanMutation.isPending}
                    className="w-full"
                  >
                    {scanMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Scan for Service Listings
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => processMutation.mutate(true)}
                    disabled={processMutation.isPending}
                    variant="outline"
                    className="w-full"
                  >
                    {processMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Settings className="h-4 w-4 mr-2" />
                        Dry Run Process
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => processMutation.mutate(false)}
                    disabled={processMutation.isPending}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Execute Removal (Live)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scan">
            <Card>
              <CardHeader>
                <CardTitle>Scan Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => scanMutation.mutate({ limit: 100, dryRun: true })}
                      disabled={scanMutation.isPending}
                    >
                      {scanMutation.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Scan 100 Communities
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => scanMutation.mutate({ limit: 500, dryRun: true })}
                      disabled={scanMutation.isPending}
                      variant="outline"
                    >
                      Scan 500 Communities
                    </Button>

                    <Button
                      onClick={() => scanMutation.mutate({ limit: 1000, dryRun: true })}
                      disabled={scanMutation.isPending}
                      variant="outline"
                    >
                      Scan 1000 Communities
                    </Button>
                  </div>

                  {scanResults && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold mb-2">Latest Scan Results</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{scanResults.summary.flagged}</div>
                          <div className="text-sm text-gray-600">Flagged</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{scanResults.summary.needsReview}</div>
                          <div className="text-sm text-gray-600">Need Review</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{scanResults.summary.kept}</div>
                          <div className="text-sm text-gray-600">Kept</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            {scanResults ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {scanResults.results.map((result) => (
                        <div key={result.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold">{result.name}</h3>
                            <div className="flex items-center gap-2">
                              {getRecommendationBadge(result.recommendation)}
                              <span className={`text-sm font-medium ${getConfidenceColor(result.confidenceScore)}`}>
                                {Math.round(result.confidenceScore * 100)}%
                              </span>
                            </div>
                          </div>
                          
                          {result.matchedPatterns.length > 0 && (
                            <div className="mt-2">
                              <h4 className="text-sm font-medium mb-1">Matched Patterns:</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {result.matchedPatterns.map((pattern, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                    {pattern}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {result.recommendation === 'flag_as_service' && (
                            <div className="mt-3 pt-3 border-t">
                              <Button
                                onClick={() => flagMutation.mutate(result.id)}
                                disabled={flagMutation.isPending}
                                size="sm"
                                variant="destructive"
                              >
                                {flagMutation.isPending ? (
                                  <>
                                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                    Flagging...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Flag as Service
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No scan results available. Run a scan to see results.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}