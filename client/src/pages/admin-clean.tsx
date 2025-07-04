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
  RefreshCw
} from "lucide-react";

export default function AdminDashboard() {
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);

  // Real data queries
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

  // Calculate real metrics from actual data
  const communities = communitiesQuery.data || [];
  const totalCommunities = communities.length;
  const verifiedCommunities = communities.filter((c: any) => c.phone && c.website).length;
  const withPhotos = communities.filter((c: any) => c.photos && c.photos.length > 0).length;
  const withReviews = communities.filter((c: any) => c.reviews && c.reviews.length > 0).length;

  const auditLogs = auditLogsQuery.data?.logs || [];
  const usage = usageQuery.data || { totalCalls: 0, totalCost: 0 };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage TrueView platform operations</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="communities">Communities</TabsTrigger>
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
                  <div className="text-2xl font-bold">{usage.totalCalls}</div>
                  <p className="text-xs text-muted-foreground">
                    ${usage.totalCost?.toFixed(2)} cost
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
                    {communities.slice(0, 10).map((community: any) => (
                      <TableRow key={community.id}>
                        <TableCell className="font-medium">{community.name}</TableCell>
                        <TableCell>{community.city}, {community.state}</TableCell>
                        <TableCell>
                          <Badge variant={community.phone && community.website ? 'default' : 'secondary'}>
                            {community.phone && community.website ? 'Verified' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>{community.photos?.length || 0}</TableCell>
                        <TableCell>{community.reviews?.length || 0}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedCommunity(community.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Discovered:</span>
                      <span className="font-bold">{totalCommunities}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Counties Covered:</span>
                      <span className="font-bold">1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verification Rate:</span>
                      <span className="font-bold">
                        {totalCommunities > 0 ? Math.round((verifiedCommunities / totalCommunities) * 100) : 0}%
                      </span>
                    </div>
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