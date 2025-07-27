import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  BarChart3,
  Link,
  Database,
  Activity,
  Globe,
  Zap,
  Download
} from "lucide-react";

export default function AdminDashboard() {
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15); // Show 15 communities per page

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

  // Analytics queries
  const platformStatsQuery = useQuery({
    queryKey: ['/api/admin/analytics/platform-stats'],
    retry: false,
  });

  const userBehaviorQuery = useQuery({
    queryKey: ['/api/admin/analytics/user-behavior'],
    retry: false,
  });

  // Integration queries
  const integrationsQuery = useQuery({
    queryKey: ['/api/infrastructure/external-integrations'],
    retry: false,
  });

  const integrationHealthQuery = useQuery({
    queryKey: ['/api/infrastructure/integration-health'],
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
  const expansionData: any = expansionQuery.data || { totals: {}, counties: [] };

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage MySeniorValet platform operations</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="communities">Communities</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="expansion">Regional Expansion</TabsTrigger>
            <TabsTrigger value="security">Security & Audit</TabsTrigger>
          </TabsList>

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
                  <p className="text-xs text-muted-foreground">
                    {verifiedCommunities} verified
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
                    {totalCommunities > 0 ? Math.round((withPhotos / totalCommunities) * 100) : 0}% coverage
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usage?.totalCalls || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    ${(usage?.totalCost || 0).toFixed(2)} cost
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security Events</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auditLogs.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Last 24 hours
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events and community updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs.slice(0, 5).map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">{log.resource}</p>
                      </div>
                      <Badge variant={log.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                        {log.riskLevel}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communities Tab */}
          <TabsContent value="communities" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Community Management</h2>
              <Button onClick={() => communitiesQuery.refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Communities ({totalCommunities})</CardTitle>
                <CardDescription>
                  Manage and monitor all senior living communities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Photos</TableHead>
                      <TableHead>Reviews</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(paginatedCommunities) && paginatedCommunities.map((community: any) => (
                      <TableRow key={community?.id || Math.random()}>
                        <TableCell className="font-medium">{community?.name || 'Unknown'}</TableCell>
                        <TableCell>{community?.city || 'Unknown'}, {community?.state || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant={community?.phone && community?.website ? 'default' : 'secondary'}>
                            {community?.phone && community?.website ? 'Verified' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>{Array.isArray(community?.photos) ? community.photos.length : 0}</TableCell>
                        <TableCell>{Array.isArray(community?.reviews) ? community.reviews.length : 0}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedCommunity(community?.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!Array.isArray(communities) || communities.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No communities found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(endIndex, totalCommunities)} of {totalCommunities} communities
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regional Expansion Tab */}
          <TabsContent value="expansion" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Target Counties</CardTitle>
                  <CardDescription>Northern California expansion regions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <span>Bay Area (4 counties)</span>
                      <Badge>Active</Badge>
                    </div>
                    <div className="flex justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded">
                      <span>Sacramento Region</span>
                      <Badge>Active</Badge>
                    </div>
                    <div className="flex justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                      <span>North Coast (2 counties)</span>
                      <Badge>Planned</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                        <span className="font-bold">{expansionData.totals.communities || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Counties Covered:</span>
                        <span className="font-bold">{expansionData.totals.counties || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cities Covered:</span>
                        <span className="font-bold">{expansionData.totals.cities || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Verification Rate:</span>
                        <span className="font-bold">{expansionData.totals.verificationRate || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>With Photos:</span>
                        <span className="font-bold">{expansionData.totals.photosCoverage || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Google Places Enriched:</span>
                        <span className="font-bold">{expansionData.totals.googlePlacesEnriched || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Calls Made:</span>
                        <span className="font-bold">{usage.totalCalls || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Cost:</span>
                        <span className="font-bold">${usage.totalCost?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* County Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>County Breakdown</CardTitle>
                <CardDescription>Real discovery results by county</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(expansionData.counties) && expansionData.counties.length > 0 ? (
                    expansionData.counties.map((county: any, index: number) => (
                      <div key={index} className="flex justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <div>
                          <span className="font-medium">{county.name}</span>
                          <div className="text-xs text-muted-foreground mt-1">
                            {county.communities} communities • {county.verified} verified • {county.withPhotos} with photos
                          </div>
                        </div>
                        <Badge variant={county.verified > 0 ? "default" : "secondary"}>
                          {Math.round((county.verified / county.communities) * 100)}% verified
                        </Badge>
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
                          Regional discovery uses Google Places API. Current usage: ${usage.totalCost?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <MapPin className="h-4 w-4 mr-2" />
                      Execute Discovery
                    </Button>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Results
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

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Platform Analytics</h2>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>

            {/* Analytics Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {platformStatsQuery.data?.totalUsers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{platformStatsQuery.data?.newUsersThisMonth || 0} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {platformStatsQuery.data?.activeSessions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently online
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${platformStatsQuery.data?.totalRevenue?.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{platformStatsQuery.data?.revenueGrowth || 0}% this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Search Volume</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {platformStatsQuery.data?.searchVolume || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Searches this week
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* User Behavior Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>User Behavior Analytics</CardTitle>
                <CardDescription>Understanding user engagement patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Average Session Duration</p>
                      <p className="text-2xl font-bold">
                        {userBehaviorQuery.data?.avgSessionDuration || '0'} min
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Pages Per Session</p>
                      <p className="text-2xl font-bold">
                        {userBehaviorQuery.data?.pagesPerSession || '0'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Top Search Terms</p>
                    <div className="space-y-2">
                      {userBehaviorQuery.data?.topSearchTerms?.map((term: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span>{term.term}</span>
                          <Badge variant="secondary">{term.count} searches</Badge>
                        </div>
                      )) || <p className="text-muted-foreground">No search data available</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Popular Communities</p>
                    <div className="space-y-2">
                      {userBehaviorQuery.data?.popularCommunities?.map((community: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span>{community.name}</span>
                          <Badge variant="secondary">{community.views} views</Badge>
                        </div>
                      )) || <p className="text-muted-foreground">No community data available</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">External Integrations</h2>
              <Button>
                <Zap className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </div>

            {/* Integration Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrationsQuery.data?.integrations?.map((integration: any) => (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
                        {integration.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{integration.provider}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{integration.dataSync || 'Real-time'}</span>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Last Sync</span>
                          <span className="text-muted-foreground">
                            {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                          <span>Records Synced</span>
                          <span className="text-muted-foreground">{integration.recordsSynced || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) || (
                <Card className="col-span-3">
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No integrations configured</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Integration Health Status */}
            <Card>
              <CardHeader>
                <CardTitle>Integration Health Status</CardTitle>
                <CardDescription>Monitor the health of all external connections</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Uptime</TableHead>
                      <TableHead>Last Check</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {integrationHealthQuery.data?.services?.map((service: any) => (
                      <TableRow key={service.name}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>
                          <Badge variant={service.status === 'healthy' ? 'default' : 'destructive'}>
                            {service.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{service.responseTime}ms</TableCell>
                        <TableCell>{service.uptime}%</TableCell>
                        <TableCell>{new Date(service.lastCheck).toLocaleString()}</TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No health data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* API Usage */}
            <Card>
              <CardHeader>
                <CardTitle>API Usage Statistics</CardTitle>
                <CardDescription>Track API calls and rate limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {integrationHealthQuery.data?.apiUsage?.map((api: any) => (
                    <div key={api.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{api.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {api.callsToday} / {api.dailyLimit} calls
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(api.callsToday / api.dailyLimit) * 100}%` }}
                        />
                      </div>
                    </div>
                  )) || <p className="text-muted-foreground">No API usage data available</p>}
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
                  ×
                </Button>
              </CardHeader>
              <CardContent>
                {(() => {
                  const community = communities.find((c: any) => c.id === selectedCommunity);
                  if (!community) return <p>Community not found</p>;
                  
                  return (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">{community.name}</h3>
                        <p className="text-muted-foreground">{community.address}</p>
                        <p className="text-muted-foreground">{community.city}, {community.state} {community.zipCode}</p>
                      </div>
                      
                      {community.phone && (
                        <div>
                          <span className="font-medium">Phone: </span>
                          {community.phone}
                        </div>
                      )}
                      
                      {community.website && (
                        <div>
                          <span className="font-medium">Website: </span>
                          <a href={community.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {community.website}
                          </a>
                        </div>
                      )}
                      
                      <div>
                        <span className="font-medium">Care Types: </span>
                        {community.careTypes?.join(', ') || 'Not specified'}
                      </div>
                      
                      <div>
                        <span className="font-medium">Photos: </span>
                        {community.photos?.length || 0} available
                      </div>
                      
                      <div>
                        <span className="font-medium">Reviews: </span>
                        {community.reviews?.length || 0} available
                      </div>
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