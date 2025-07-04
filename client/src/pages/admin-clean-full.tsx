import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Building2,
  Users,
  MapPin,
  TrendingUp,
  Shield,
  AlertTriangle,
  Eye,
  RefreshCw,
  Download,
  Upload,
  BarChart3,
  MessageSquare,
  Flag,
  Database,
  Zap,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe
} from "lucide-react";

export default function AdminCleanFull() {
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const { toast } = useToast();

  // Real data queries with error handling
  const communitiesQuery = useQuery({
    queryKey: ['/api/communities'],
    retry: false,
  });

  const auditLogsQuery = useQuery({
    queryKey: ['/api/admin/audit-logs'],
    retry: false,
  });

  const usageQuery = useQuery({
    queryKey: ['/api/admin/analytics/usage'],
    retry: false,
  });

  const expansionQuery = useQuery({
    queryKey: ['/api/admin/expansion/results'],
    retry: false,
  });

  // Safe data handling with error fallbacks
  const communities = Array.isArray(communitiesQuery.data) ? communitiesQuery.data : [];
  const totalCommunities = communities.length;
  const verifiedCommunities = communities.filter((c: any) => c?.phone && c?.website).length;
  const withPhotos = communities.filter((c: any) => c?.photos && Array.isArray(c.photos) && c.photos.length > 0).length;
  const withReviews = communities.filter((c: any) => c?.reviews && Array.isArray(c.reviews) && c.reviews.length > 0).length;

  // Pagination logic
  const totalPages = Math.ceil(totalCommunities / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCommunities = communities.slice(startIndex, endIndex);

  const auditData: any = auditLogsQuery.data || {};
  const auditLogs = Array.isArray(auditData.logs) ? auditData.logs : [];
  const usage: any = usageQuery.data || { totalCalls: 0, totalCost: 0 };
  const expansionData: any = expansionQuery.data || { 
    totals: { communities: 0, counties: 0, cities: 0, verificationRate: 0, photosCoverage: 0 }, 
    counties: [] 
  };

  // Mutations for admin actions
  const refreshMutation = useMutation({
    mutationFn: async (communityId: number) => {
      return await apiRequest(`/api/admin/communities/${communityId}/refresh`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communities'] });
    },
  });

  const enrichMutation = useMutation({
    mutationFn: async (communityId: number) => {
      return await apiRequest(`/api/admin/communities/${communityId}/enrich`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communities'] });
    },
  });

  // Show loading state
  if (communitiesQuery.isLoading || auditLogsQuery.isLoading || usageQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state if queries failed
  if (communitiesQuery.error || auditLogsQuery.error || usageQuery.error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading admin dashboard</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            TrueView Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enterprise administration for senior living platform management
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className="flex min-w-max gap-1 p-1">
              <TabsTrigger value="overview" className="flex items-center gap-1 text-xs px-2">
              <TrendingUp className="h-3 w-3" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="communities" className="flex items-center gap-1 text-xs px-2">
              <Building2 className="h-3 w-3" />
              <span className="hidden sm:inline">Communities</span>
            </TabsTrigger>
            <TabsTrigger value="expansion" className="flex items-center gap-1 text-xs px-2">
              <MapPin className="h-3 w-3" />
              <span className="hidden lg:inline">Expansion</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1 text-xs px-2">
              <Shield className="h-3 w-3" />
              <span className="hidden lg:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-1 text-xs px-2">
              <Flag className="h-3 w-3" />
              <span className="hidden lg:inline">Moderation</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-1 text-xs px-2">
              <MessageSquare className="h-3 w-3" />
              <span className="hidden lg:inline">Support</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-1 text-xs px-2">
              <Database className="h-3 w-3" />
              <span className="hidden lg:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs px-2">
              <BarChart3 className="h-3 w-3" />
              <span className="hidden lg:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="crm" className="flex items-center gap-1 text-xs px-2">
              <Users className="h-3 w-3" />
              <span className="hidden lg:inline">CRM</span>
            </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Communities</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCommunities}</div>
                  <p className="text-xs text-muted-foreground">Active listings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Complete Profiles</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{verifiedCommunities}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalCommunities > 0 ? Math.round((verifiedCommunities / totalCommunities) * 100) : 0}% verified
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">With Photos</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{withPhotos}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalCommunities > 0 ? Math.round((withPhotos / totalCommunities) * 100) : 0}% photo coverage
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Usage</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usage.totalCalls || 0}</div>
                  <p className="text-xs text-muted-foreground">${(usage.totalCost || 0).toFixed(2)} cost</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Quality Metrics</CardTitle>
                  <CardDescription>Community profile completeness and verification status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Complete Profiles:</span>
                      <span className="font-bold">{verifiedCommunities}/{totalCommunities}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Has Photos:</span>
                      <span className="font-bold">{withPhotos}/{totalCommunities}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Has Reviews:</span>
                      <span className="font-bold">{withReviews}/{totalCommunities}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone Verified:</span>
                      <span className="font-bold">{verifiedCommunities}/{totalCommunities}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>API usage and cost monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total API Calls:</span>
                      <span className="font-bold">{usage.totalCalls || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cost:</span>
                      <span className="font-bold">${(usage.totalCost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Response Time:</span>
                      <span className="font-bold">{usage.avgResponseTime || 0}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-bold">{usage.successRate || 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communities Tab */}
          <TabsContent value="communities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Community Management</CardTitle>
                <CardDescription>
                  Showing {startIndex + 1}-{Math.min(endIndex, totalCommunities)} of {totalCommunities} communities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Care Types</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Photos</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCommunities.map((community: any) => (
                      <TableRow key={community.id}>
                        <TableCell className="font-medium">{community.name}</TableCell>
                        <TableCell>{community.city}, {community.state}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {community.careTypes?.slice(0, 2).map((type: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={community.phone ? "default" : "secondary"}>
                            {community.phone ? "Verified" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={community.photos?.length > 0 ? "default" : "secondary"}>
                            {community.photos?.length || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => refreshMutation.mutate(community.id)}
                              disabled={refreshMutation.isPending}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Refresh
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => enrichMutation.mutate(community.id)}
                              disabled={enrichMutation.isPending}
                            >
                              <Zap className="h-4 w-4 mr-1" />
                              Enrich
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCommunity(community.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regional Expansion Tab */}
          <TabsContent value="expansion" className="space-y-6">
            {/* Status Progress Bar */}
            <Card>
              <CardHeader>
                <CardTitle>Northern California Expansion Status</CardTitle>
                <CardDescription>Live progress across 11 target counties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Expansion Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {expansionData.totals?.communities || 0} communities discovered
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(((expansionData.totals?.communities || 0) / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{expansionData.totals?.communities || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Communities</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{Object.keys(expansionData.counties || {}).length}</p>
                      <p className="text-sm text-muted-foreground">Counties Covered</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{expansionData.totals?.cities || 0}</p>
                      <p className="text-sm text-muted-foreground">Cities Covered</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Discovery Metrics</CardTitle>
                  <CardDescription>Real-time expansion statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  {expansionQuery.isLoading ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Loading...</span>
                        <div className="h-4 w-12 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Discovered:</span>
                        <span className="font-bold">{expansionData.totals?.communities || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Counties Covered:</span>
                        <span className="font-bold">{expansionData.totals?.counties || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cities Covered:</span>
                        <span className="font-bold">{expansionData.totals?.cities || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Verification Rate:</span>
                        <span className="font-bold">{expansionData.totals?.verificationRate || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>With Photos:</span>
                        <span className="font-bold">{expansionData.totals?.photosCoverage || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Google Places Enriched:</span>
                        <span className="font-bold">{expansionData.totals?.googlePlacesEnriched || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Calls Made:</span>
                        <span className="font-bold">{usage.totalCalls || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Cost:</span>
                        <span className="font-bold">${(usage.totalCost || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>County Breakdown</CardTitle>
                  <CardDescription>Discovery results by region</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {expansionData.counties?.length > 0 ? (
                      expansionData.counties.map((county: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">{county.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {county.communities} communities
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{county.verified} verified</p>
                            <p className="text-xs text-muted-foreground">{county.withPhotos} with photos</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        No county data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Expansion Controls</CardTitle>
                <CardDescription>Execute discovery campaigns with monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">API Usage Warning</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Regional discovery uses Google Places API. Current usage: ${(usage.totalCost || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={async () => {
                        try {
                          // Get next county to research
                          const nextResponse = await fetch('/api/admin/research/next-county');
                          const nextData = await nextResponse.json();
                          
                          if (nextData.nextCounty) {
                            // Research the county systematically
                            const response = await fetch(`/api/admin/research/county/${nextData.nextCounty}`, {
                              method: 'POST'
                            });
                            const data = await response.json();
                            
                            if (data.success) {
                              expansionQuery.refetch();
                              toast({
                                title: "County Research Complete",
                                description: `${nextData.nextCounty} County: ${data.result.added} communities added`,
                              });
                            }
                          } else {
                            toast({
                              title: "Research Complete",
                              description: "All counties have been researched",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Research Failed",
                            description: "Error during county research",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Research Next County
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/admin/research/progress');
                          const data = await response.json();
                          
                          if (data.success) {
                            toast({
                              title: "Research Progress",
                              description: `${data.progress.researchedCounties}/${data.progress.totalCounties} counties researched. ${data.progress.totalCommunities} total communities.`,
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to get research progress",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Progress
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security & Audit Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Audit Log</CardTitle>
                <CardDescription>Recent security events and system activity</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.slice(0, 10).map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.resource}</TableCell>
                        <TableCell>
                          <Badge variant={log.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                            {log.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation Queue</CardTitle>
                <CardDescription>Review flagged content and manage community standards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <Flag className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Pending Review</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Under Review</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Resolved</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customer Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Support Dashboard</CardTitle>
                <CardDescription>Manage customer inquiries and support tickets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Open Tickets</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Pending Response</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Resolved Today</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Avg Response Time</p>
                    <p className="text-2xl font-bold">0h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Import/Export Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management Tools</CardTitle>
                <CardDescription>Import, export, and manage community data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Data Import</h3>
                    <div className="space-y-4">
                      <Button className="w-full" variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV Data
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Bulk Operations
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Data Export</h3>
                    <div className="space-y-4">
                      <Button className="w-full" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export All Communities
                      </Button>
                      <Button className="w-full" variant="outline">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Quality Metrics Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Usage Analytics</CardTitle>
                <CardDescription>Monitor API costs, rate limits, and service breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Total Calls</p>
                    <p className="text-2xl font-bold">{usage.totalCalls || 0}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Total Cost</p>
                    <p className="text-2xl font-bold">${(usage.totalCost || 0).toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Avg Response Time</p>
                    <p className="text-2xl font-bold">{usage.avgResponseTime || 0}ms</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Success Rate</p>
                    <p className="text-2xl font-bold">{usage.successRate || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CRM Integration Tab */}
          <TabsContent value="crm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>CRM Integration</CardTitle>
                <CardDescription>Lead pipeline, sync settings, and performance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Active Leads</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Globe className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Sync Status</p>
                    <p className="text-sm font-bold">Connected</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Conversion Rate</p>
                    <p className="text-2xl font-bold">0%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Community Detail Modal */}
        {selectedCommunity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Community Details</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedCommunity(null)}
                  className="absolute top-4 right-4"
                >
                  Close
                </Button>
              </CardHeader>
              <CardContent>
                {(() => {
                  const community = communities.find((c: any) => c.id === selectedCommunity);
                  if (!community) return <p>Community not found</p>;
                  
                  return (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{community.name}</h3>
                        <p className="text-muted-foreground">{community.address}</p>
                        <p className="text-muted-foreground">{community.city}, {community.state} {community.zipCode}</p>
                      </div>
                      {community.phone && (
                        <div>
                          <p className="font-medium">Phone:</p>
                          <p>{community.phone}</p>
                        </div>
                      )}
                      {community.website && (
                        <div>
                          <p className="font-medium">Website:</p>
                          <p>{community.website}</p>
                        </div>
                      )}
                      {community.careTypes?.length > 0 && (
                        <div>
                          <p className="font-medium">Care Types:</p>
                          <div className="flex gap-2 flex-wrap mt-1">
                            {community.careTypes.map((type: string, idx: number) => (
                              <Badge key={idx} variant="secondary">{type}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {community.photos?.length > 0 && (
                        <div>
                          <p className="font-medium">Photos:</p>
                          <p className="text-sm text-muted-foreground">{community.photos.length} photos available</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}