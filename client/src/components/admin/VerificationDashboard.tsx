import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, CheckCircle, XCircle, Clock, Activity, Database, 
  TrendingUp, Play, Pause, RefreshCw, Target, Flag, Search,
  Globe, Zap, AlertCircle, ArrowRight, Loader2
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface VerificationProgress {
  totalCities: number;
  verifiedCities: number;
  totalCommunities: number;
  verifiedCommunities: number;
  percentageComplete: number;
  currentlyProcessing: string | null;
  estimatedCompletion: string;
}

interface PriorityCity {
  state: string;
  city: string;
  communityCount: number;
  unverifiedCount: number;
  priority: number;
  reason: string;
}

export function VerificationDashboard() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCity, setSelectedCity] = useState<{ city: string; state: string } | null>(null);

  // Fetch verification progress
  const { data: progress, isLoading: progressLoading, refetch: refetchProgress } = useQuery({
    queryKey: ['/api/verification/progress'],
    refetchInterval: isProcessing ? 5000 : 30000, // Poll more frequently when processing
  });

  // Fetch priority cities
  const { data: priorityCities, isLoading: citiesLoading, refetch: refetchCities } = useQuery({
    queryKey: ['/api/verification/priority-cities?limit=10'],
  });

  // Circuit breaker health
  const { data: circuitHealth } = useQuery({
    queryKey: ['/api/circuit-breaker/health'],
    refetchInterval: 10000,
  });

  // Check if currently processing
  useEffect(() => {
    if (progress?.progress?.currentlyProcessing) {
      setIsProcessing(true);
    } else {
      setIsProcessing(false);
    }
  }, [progress]);

  // Verify specific city
  const verifyCity = useMutation({
    mutationFn: async ({ city, state }: { city: string; state: string }) => {
      return await apiRequest('POST', '/api/verification/verify-city', { city, state });
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Verification Started",
        description: `Started verification for ${variables.city}, ${variables.state}`,
      });
      setIsProcessing(true);
      refetchProgress();
      refetchCities();
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Process next city
  const processNext = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/verification/process-next');
    },
    onSuccess: () => {
      toast({
        title: "Processing Next City",
        description: "Started processing the next priority city",
      });
      setIsProcessing(true);
      refetchProgress();
      refetchCities();
    },
  });

  // Start automated verification
  const startAutomated = useMutation({
    mutationFn: async (citiesPerDay: number) => {
      return await apiRequest('POST', '/api/verification/start-automated', { citiesPerDay });
    },
    onSuccess: (data, citiesPerDay) => {
      toast({
        title: "Automated Verification Started",
        description: `Processing ${citiesPerDay} cities per day`,
      });
      setIsProcessing(true);
    },
  });

  // Bulk city search and verification
  const bulkCityVerification = useMutation({
    mutationFn: async ({ city, state }: { city: string; state: string }) => {
      // Enhanced search for all communities in the city
      const searchQuery = `List ALL senior living communities in ${city}, ${state}. Include:
        - Assisted Living facilities
        - Memory Care centers
        - Independent Living communities
        - Nursing Homes
        - Continuing Care Retirement Communities (CCRCs)
        - 55+ Active Adult communities
        
        For each community provide:
        1. Exact name
        2. Full address with zip code
        3. Phone number
        4. Website URL
        5. Care types offered
        6. Pricing ranges
        7. Number of units/beds
        8. Year established
        9. Owner/operator company
        10. Any special programs or certifications`;

      return await apiRequest('POST', '/api/perplexity/city-bulk-search', { 
        city, 
        state, 
        searchQuery 
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Bulk Search Complete",
        description: `Found and verified communities in ${variables.city}, ${variables.state}`,
      });
      refetchProgress();
      refetchCities();
    },
  });

  const progressData = progress?.progress || {
    totalCities: 0,
    verifiedCities: 0,
    totalCommunities: 0,
    verifiedCommunities: 0,
    percentageComplete: 0,
    currentlyProcessing: null,
    estimatedCompletion: 'N/A',
  };

  const cities = priorityCities?.cities || [];

  // Calculate daily rate
  const dailyRate = isProcessing ? 500 : 0;
  const remainingCommunities = progressData.totalCommunities - progressData.verifiedCommunities;
  const daysRemaining = dailyRate > 0 ? Math.ceil(remainingCommunities / dailyRate) : 0;

  // Get circuit breaker status
  const getServiceStatus = (service: string) => {
    const status = circuitHealth?.services?.[service];
    if (!status) return { color: 'gray', text: 'Unknown' };
    
    if (status.state === 'OPEN') return { color: 'red', text: 'Down' };
    if (status.state === 'HALF_OPEN') return { color: 'yellow', text: 'Recovering' };
    return { color: 'green', text: 'Operational' };
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{progressData.percentageComplete.toFixed(1)}%</div>
              <Progress value={progressData.percentageComplete} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {progressData.verifiedCommunities.toLocaleString()} of {progressData.totalCommunities.toLocaleString()} communities
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cities Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {progressData.verifiedCities.toLocaleString()} / {progressData.totalCities.toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {((progressData.verifiedCities / progressData.totalCities) * 100).toFixed(0)}% coverage
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {progressData.currentlyProcessing ? (
                <>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                    <span className="text-sm font-medium">Processing</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {progressData.currentlyProcessing}
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Idle</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estimated Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold">{progressData.estimatedCompletion}</div>
              <p className="text-xs text-muted-foreground">
                {daysRemaining > 0 ? `~${daysRemaining} days at current rate` : 'Calculate when processing'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Service Health</CardTitle>
          <CardDescription>Circuit breaker status for verification services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {['perplexity', 'claude', 'chatgpt'].map((service) => {
              const status = getServiceStatus(service);
              return (
                <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm font-medium capitalize">{service}</span>
                  </div>
                  <Badge variant={status.color === 'green' ? 'default' : status.color === 'yellow' ? 'secondary' : 'destructive'}>
                    {status.text}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Control Panel</CardTitle>
          <CardDescription>Manage city-by-city verification process</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => processNext.mutate()}
              disabled={isProcessing || processNext.isPending}
            >
              {processNext.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Process Next City
            </Button>

            <Button 
              onClick={() => startAutomated.mutate(5)}
              disabled={isProcessing || startAutomated.isPending}
              variant="secondary"
            >
              <Zap className="mr-2 h-4 w-4" />
              Start Daily Automation (5 cities)
            </Button>

            <Button 
              onClick={() => refetchProgress()}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>

            {selectedCity && (
              <Button
                onClick={() => bulkCityVerification.mutate(selectedCity)}
                disabled={bulkCityVerification.isPending}
                variant="default"
              >
                <Search className="mr-2 h-4 w-4" />
                Bulk Search {selectedCity.city}
              </Button>
            )}
          </div>

          {isProcessing && (
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertTitle>Verification in Progress</AlertTitle>
              <AlertDescription>
                Currently processing {progressData.currentlyProcessing || 'communities'}. 
                This page will auto-refresh every 5 seconds.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Priority Cities Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Cities Queue</CardTitle>
          <CardDescription>Next cities scheduled for verification based on priority scoring</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Priority</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Communities</TableHead>
                  <TableHead>Unverified</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {citiesLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : cities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No cities pending verification
                    </TableCell>
                  </TableRow>
                ) : (
                  cities.map((city: PriorityCity, index: number) => (
                    <TableRow key={`${city.city}-${city.state}`}>
                      <TableCell>
                        <Badge variant={index === 0 ? 'default' : 'secondary'}>
                          #{index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{city.city}</TableCell>
                      <TableCell>{city.state}</TableCell>
                      <TableCell>{city.communityCount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-orange-600">
                          {city.unverifiedCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {city.reason}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedCity({ city: city.city, state: city.state });
                              verifyCity.mutate({ city: city.city, state: city.state });
                            }}
                            disabled={isProcessing || verifyCity.isPending}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedCity({ city: city.city, state: city.state });
                            }}
                          >
                            <Target className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Verification Strategy Info */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Verification Strategy</CardTitle>
          <CardDescription>Using Perplexity's live web search for comprehensive city-wide verification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Current Approach</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                  Live web search for each city
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                  Bulk discovery of all communities
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                  Real-time pricing extraction
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                  Automatic data enrichment
                </li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Priority Factors</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <Flag className="h-3 w-3 text-blue-500 mt-0.5" />
                  Major metropolitan areas
                </li>
                <li className="flex items-start gap-2">
                  <Flag className="h-3 w-3 text-blue-500 mt-0.5" />
                  High senior population states
                </li>
                <li className="flex items-start gap-2">
                  <Flag className="h-3 w-3 text-blue-500 mt-0.5" />
                  User search frequency
                </li>
                <li className="flex items-start gap-2">
                  <Flag className="h-3 w-3 text-blue-500 mt-0.5" />
                  Data staleness indicators
                </li>
              </ul>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Verification Speed</p>
              <p className="text-xs text-muted-foreground">
                Current: {dailyRate} communities/day | Target: 2,500/week with ML
              </p>
            </div>
            <Badge variant="outline" className="text-green-600">
              {remainingCommunities.toLocaleString()} remaining
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}