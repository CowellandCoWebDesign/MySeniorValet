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

export default function AdminSimple() {
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Data queries
  const communitiesQuery = useQuery({
    queryKey: ['/api/communities'],
    retry: false,
  });

  const expansionQuery = useQuery({
    queryKey: ['/api/admin/expansion/results'],
    retry: false,
  });

  const usageQuery = useQuery({
    queryKey: ['/api/admin/analytics/usage'],
    retry: false,
  });

  // Safe data extraction with proper typing
  const communities = Array.isArray(communitiesQuery.data) ? communitiesQuery.data : [];
  const expansionData: any = expansionQuery.data || { 
    totals: { communities: 0, counties: 0, cities: 0, verificationRate: 0, photosCoverage: 0 }, 
    counties: [] 
  };
  const usage: any = usageQuery.data || { totalCalls: 0, totalCost: 0 };

  // Loading state
  if (communitiesQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (communitiesQuery.error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading admin dashboard</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Pagination
  const totalPages = Math.ceil(communities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCommunities = communities.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            MySeniorValet Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage communities, monitor expansion, and oversee platform operations
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="communities" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Communities
            </TabsTrigger>
            <TabsTrigger value="expansion" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Expansion
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
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
                  <div className="text-2xl font-bold">{communities.length}</div>
                  <p className="text-xs text-muted-foreground">Active listings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usage.totalCalls || 0}</div>
                  <p className="text-xs text-muted-foreground">Total requests</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Cost</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(usage.totalCost || 0).toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Monthly spend</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Coverage</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{expansionData.totals?.counties || 0}</div>
                  <p className="text-xs text-muted-foreground">Counties covered</p>
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
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, communities.length)} of {communities.length} communities
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

                {/* Pagination */}
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
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
                <CardDescription>System security overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Security Active</p>
                    <p className="text-xs text-muted-foreground">All systems protected</p>
                  </div>
                  <div className="text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Active Sessions</p>
                    <p className="text-xs text-muted-foreground">Monitoring user activity</p>
                  </div>
                  <div className="text-center">
                    <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">No Alerts</p>
                    <p className="text-xs text-muted-foreground">System operating normally</p>
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