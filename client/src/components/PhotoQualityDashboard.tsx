import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  BarChart3, 
  RefreshCw, 
  Trash2,
  Eye,
  AlertCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PhotoHealthReport {
  communityId: number;
  communityName: string;
  totalPhotos: number;
  validPhotos: number;
  invalidPhotos: number;
  issues: string[];
  recommendations: string[];
}

interface PlatformPhotoStats {
  totalCommunities: number;
  communitiesWithPhotos: number;
  communitiesWithoutPhotos: number;
  averagePhotosPerCommunity: number;
  totalPhotoValidationIssues: number;
}

interface CommunityNeedingAttention {
  id: number;
  name: string;
  city: string;
  state: string;
  totalPhotos: number;
  estimatedIssues: number;
  priority: 'high' | 'medium' | 'low';
}

export function PhotoQualityDashboard() {
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Get platform-wide photo statistics
  const { data: platformStats, isLoading: statsLoading } = useQuery<{
    success: boolean;
    stats: PlatformPhotoStats;
  }>({
    queryKey: ['/api/photos/platform-stats'],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Get communities needing attention
  const { data: communitiesNeedingAttention, isLoading: communitiesLoading } = useQuery<{
    success: boolean;
    communities: CommunityNeedingAttention[];
    summary: {
      total: number;
      highPriority: number;
      mediumPriority: number;
      lowPriority: number;
    };
  }>({
    queryKey: ['/api/photos/communities-needing-attention'],
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  // Get specific community validation report
  const { data: communityReport, isLoading: reportLoading } = useQuery<{
    success: boolean;
    report: PhotoHealthReport;
  }>({
    queryKey: [`/api/communities/${selectedCommunity}/photos/validate`],
    enabled: !!selectedCommunity,
  });

  // Auto-cleanup mutation
  const autoCleanupMutation = useMutation({
    mutationFn: async ({ dryRun }: { dryRun: boolean }) => {
      return apiRequest('POST', '/api/photos/auto-cleanup', { dryRun, maxCommunities: 20 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/photos/platform-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/photos/communities-needing-attention'] });
    },
  });

  // Individual community cleanup mutation
  const cleanupMutation = useMutation({
    mutationFn: async (communityId: number) => {
      return apiRequest('POST', `/api/communities/${communityId}/photos/cleanup`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${selectedCommunity}/photos/validate`] });
      queryClient.invalidateQueries({ queryKey: ['/api/photos/communities-needing-attention'] });
    },
  });

  const stats = platformStats?.stats;
  const communities = communitiesNeedingAttention?.communities || [];
  const summary = communitiesNeedingAttention?.summary;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <XCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Photo Quality Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and maintain photo quality across all communities
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => autoCleanupMutation.mutate({ dryRun: true })}
            disabled={autoCleanupMutation.isPending}
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Cleanup
          </Button>
          <Button
            onClick={() => autoCleanupMutation.mutate({ dryRun: false })}
            disabled={autoCleanupMutation.isPending}
            variant="destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Run Cleanup
          </Button>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Communities</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalCommunities.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Photos</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.communitiesWithPhotos.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats && !statsLoading ? 
                `${Math.round((stats.communitiesWithPhotos / stats.totalCommunities) * 100)}% coverage` : 
                '...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Photos/Community</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.averagePhotosPerCommunity.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needing Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {communitiesLoading ? '...' : summary?.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary && !communitiesLoading ? 
                `${summary.highPriority} high priority` : 
                '...'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Auto-cleanup Results */}
      {autoCleanupMutation.data && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {autoCleanupMutation.data.dryRun ? 'Preview: ' : 'Completed: '}
            {autoCleanupMutation.data.summary.totalPhotosRemoved > 0 || autoCleanupMutation.data.dryRun ? 
              `Would remove ${autoCleanupMutation.data.summary.totalPhotosRemoved} invalid photos from ${autoCleanupMutation.data.summary.totalCommunities} communities` :
              'No communities found needing immediate cleanup'}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="communities" className="w-full">
        <TabsList>
          <TabsTrigger value="communities">Communities Needing Attention</TabsTrigger>
          <TabsTrigger value="details">Community Details</TabsTrigger>
        </TabsList>

        <TabsContent value="communities" className="space-y-4">
          {/* Priority Summary */}
          {summary && (
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-lg font-bold text-red-800 dark:text-red-200">
                        {summary.highPriority}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">High Priority</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                        {summary.mediumPriority}
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Medium Priority</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                        {summary.lowPriority}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Low Priority</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Communities List */}
          <Card>
            <CardHeader>
              <CardTitle>Communities Requiring Photo Attention</CardTitle>
              <CardDescription>
                Communities with invalid or missing photos that need immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {communitiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading communities...</span>
                </div>
              ) : communities.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">All communities have healthy photos!</p>
                  <p className="text-gray-600 dark:text-gray-400">No immediate photo issues detected.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {communities.slice(0, 20).map((community) => (
                    <div key={community.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant={getPriorityColor(community.priority)}>
                            {getPriorityIcon(community.priority)}
                            <span className="ml-1 capitalize">{community.priority}</span>
                          </Badge>
                          <h4 className="font-medium">{community.name}</h4>
                          <span className="text-sm text-gray-500">
                            {community.city}, {community.state}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {community.estimatedIssues} of {community.totalPhotos} photos need attention
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCommunity(community.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Inspect
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => cleanupMutation.mutate(community.id)}
                          disabled={cleanupMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Clean
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedCommunity ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Community Photo Health Report
                </CardTitle>
                <CardDescription>
                  Detailed validation results for Community ID: {selectedCommunity}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reportLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                    <span>Validating photos...</span>
                  </div>
                ) : communityReport?.report ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-2xl font-bold">{communityReport.report.totalPhotos}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Photos</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{communityReport.report.validPhotos}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Valid Photos</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{communityReport.report.invalidPhotos}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Invalid Photos</p>
                      </div>
                    </div>

                    {communityReport.report.invalidPhotos > 0 && (
                      <Progress 
                        value={(communityReport.report.validPhotos / communityReport.report.totalPhotos) * 100}
                        className="h-3"
                      />
                    )}

                    {communityReport.report.issues.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Issues Found:</h4>
                        <ul className="space-y-1">
                          {communityReport.report.issues.map((issue, index) => (
                            <li key={index} className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {communityReport.report.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {communityReport.report.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-blue-600 dark:text-blue-400 flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        onClick={() => cleanupMutation.mutate(selectedCommunity)}
                        disabled={cleanupMutation.isPending || communityReport.report.invalidPhotos === 0}
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clean Up Invalid Photos
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">
                    Select a community to view detailed photo validation results
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium">No Community Selected</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Select a community from the "Communities Needing Attention" tab to view detailed photo validation results.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}