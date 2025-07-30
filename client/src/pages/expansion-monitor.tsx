import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { Search, MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { NavigationHeader } from '@/components/NavigationHeader';

interface ExpansionProgress {
  currentCounty: string;
  currentRegion: string;
  currentQuery: string;
  currentCity: string;
  countiesProcessed: number;
  totalCounties: number;
  communitiesFound: number;
  totalQueries: number;
  completedQueries: number;
  isActive: boolean;
  startTime: Date;
  estimatedCompletion: Date;
}

interface CountyResult {
  county: string;
  region: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  newCommunities: number;
  totalQueries: number;
  completedQueries: number;
  discoveryMethods: string[];
  errors: string[];
  processingTime: number;
}

export default function ExpansionMonitor() {
  const [expansionActive, setExpansionActive] = useState(false);
  const [realTimeProgress, setRealTimeProgress] = useState<ExpansionProgress | null>(null);
  const [countyResults, setCountyResults] = useState<CountyResult[]>([]);

  // POLLING REMOVED FOR COST PROTECTION - Manual refresh only
  const { data: progressData, refetch: refetchProgress } = useQuery({
    queryKey: ['/api/regional-expansion/progress'],
    enabled: expansionActive,
  });

  // Get expansion results - POLLING REMOVED FOR COST PROTECTION
  const { data: resultsData, refetch: refetchResults } = useQuery({
    queryKey: ['/api/regional-expansion/results'],
  });

  // Start expansion
  const startExpansion = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/regional-expansion/execute', 'POST');
    },
    onSuccess: () => {
      setExpansionActive(true);
      refetchProgress();
    },
  });

  // Update real-time progress
  useEffect(() => {
    if (progressData) {
      setRealTimeProgress(progressData as ExpansionProgress);
      if (!(progressData as ExpansionProgress).isActive) {
        setExpansionActive(false);
      }
    }
  }, [progressData]);

  // Update county results
  useEffect(() => {
    if ((resultsData as any)?.detailedResults) {
      setCountyResults((resultsData as any).detailedResults);
    }
  }, [resultsData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const progressPercentage = realTimeProgress 
    ? (realTimeProgress.completedQueries / realTimeProgress.totalQueries) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader 
        title="Regional Expansion Monitor" 
        subtitle="Real-time monitoring of Northern California expansion progress"
      />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              onClick={() => startExpansion.mutate()}
              disabled={expansionActive || startExpansion.isPending}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {expansionActive ? 'Expansion Running...' : 'Start Expansion'}
            </Button>
          </div>
        </div>

      {/* Real-time Progress */}
      {realTimeProgress && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Live Progress
            </CardTitle>
            <CardDescription>
              Currently processing {realTimeProgress.currentCounty} County
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {realTimeProgress.countiesProcessed}/{realTimeProgress.totalCounties}
                </div>
                <div className="text-sm text-gray-600">Counties</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {realTimeProgress.communitiesFound}
                </div>
                <div className="text-sm text-gray-600">Communities Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {realTimeProgress.completedQueries}/{realTimeProgress.totalQueries}
                </div>
                <div className="text-sm text-gray-600">Search Queries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(progressPercentage)}%
                </div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
            
            <Progress value={progressPercentage} className="h-3" />
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Searching: "{realTimeProgress.currentQuery}" in {realTimeProgress.currentCity}</span>
              <span>Region: {realTimeProgress.currentRegion}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="counties" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="counties">County Results</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="counties" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {countyResults.map((county, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{county.county}</CardTitle>
                    <Badge className={getStatusColor(county.status)}>
                      {getStatusIcon(county.status)}
                      <span className="ml-1 capitalize">{county.status}</span>
                    </Badge>
                  </div>
                  <CardDescription>{county.region}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">New Communities:</span>
                      <span className="font-semibold">{county.newCommunities}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Search Progress:</span>
                      <span className="font-semibold">
                        {county.completedQueries}/{county.totalQueries}
                      </span>
                    </div>
                    {county.processingTime > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Processing Time:</span>
                        <span className="font-semibold">
                          {Math.round(county.processingTime / 1000)}s
                        </span>
                      </div>
                    )}
                    {county.discoveryMethods.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600">Discovery Methods:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {county.discoveryMethods.slice(0, 3).map((method, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                          {county.discoveryMethods.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{county.discoveryMethods.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Counties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{countyResults.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Communities Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {countyResults.reduce((sum, c) => sum + c.newCommunities, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Completed Counties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {countyResults.filter(c => c.status === 'completed').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {countyResults.length > 0 
                    ? Math.round((countyResults.filter(c => c.status === 'completed').length / countyResults.length) * 100)
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expansion Timeline</CardTitle>
              <CardDescription>
                Historical view of expansion progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {countyResults
                  .filter(c => c.status === 'completed')
                  .sort((a, b) => b.processingTime - a.processingTime)
                  .map((county, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-semibold">{county.county} County</div>
                          <div className="text-sm text-gray-600">{county.region}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{county.newCommunities} communities</div>
                        <div className="text-sm text-gray-600">
                          {Math.round(county.processingTime / 1000)}s processing
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}