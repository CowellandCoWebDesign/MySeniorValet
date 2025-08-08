import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Building2, 
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Phone,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Star,
  Users,
  Calendar,
  Shield,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Link } from "wouter";

export default function AdminCommunities() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Check admin access
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // Fetch communities
  const { data: communitiesData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/communities', currentPage, searchTerm, stateFilter, typeFilter, verificationFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        state: stateFilter,
        type: typeFilter,
        verification: verificationFilter
      });
      return await apiRequest('GET', `/api/admin/communities?${params}`);
    },
    enabled: isAdmin
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/communities/stats'],
    queryFn: () => apiRequest('GET', '/api/admin/communities/stats'),
    enabled: isAdmin
  });

  // Update community mutation
  const updateCommunityMutation = useMutation({
    mutationFn: async ({ id, updates }: any) => {
      return await apiRequest('PUT', `/api/admin/communities/${id}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "Community Updated",
        description: "The community has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update community",
        variant: "destructive",
      });
    }
  });

  // Delete community mutation
  const deleteCommunityMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/admin/communities/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Community Deleted",
        description: "The community has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete community",
        variant: "destructive",
      });
    }
  });

  // Verify community mutation
  const verifyCommunityMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('POST', `/api/admin/communities/${id}/verify`);
    },
    onSuccess: () => {
      toast({
        title: "Community Verified",
        description: "The community has been verified successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities'] });
    }
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600 dark:text-gray-400">
                You need admin privileges to access this page.
              </p>
              <Button className="mt-4" onClick={() => window.location.href = "/"}>
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const communities = communitiesData?.communities || [];
  const totalPages = Math.ceil((communitiesData?.total || 0) / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Building2 className="h-8 w-8" />
                Communities Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage and monitor all communities on the platform
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin-unified">
                <Button variant="outline">
                  Back to Dashboard
                </Button>
              </Link>
              <Button>
                <Building2 className="h-4 w-4 mr-2" />
                Add Community
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Communities</p>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
                  <p className="text-2xl font-bold">{stats?.verified || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Premium</p>
                  <p className="text-2xl font-bold">{stats?.premium || 0}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active This Month</p>
                  <p className="text-2xl font-bold">{stats?.activeThisMonth || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card>
          <CardHeader>
            <CardTitle>All Communities</CardTitle>
            <CardDescription>
              Browse and manage communities across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters and Search */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, city, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-[150px]">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="PA">Pennsylvania</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="assisted_living">Assisted Living</SelectItem>
                  <SelectItem value="memory_care">Memory Care</SelectItem>
                  <SelectItem value="independent_living">Independent Living</SelectItem>
                  <SelectItem value="skilled_nursing">Skilled Nursing</SelectItem>
                  <SelectItem value="55_plus">55+ Active Adult</SelectItem>
                </SelectContent>
              </Select>

              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger className="w-[150px]">
                  <Shield className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Communities Table */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading communities...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">Failed to load communities</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Community</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {communities.map((community: any) => (
                      <TableRow key={community.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{community.name}</p>
                            <p className="text-sm text-gray-500">ID: {community.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{community.city}, {community.state}</p>
                            <p className="text-gray-500">{community.zip_code}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {community.care_type?.replace(/_/g, ' ') || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {community.is_verified ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <XCircle className="h-3 w-3 mr-1" />
                                Unverified
                              </Badge>
                            )}
                            {community.tier && (
                              <Badge variant="secondary">
                                {community.tier}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {community.pricing_from ? (
                            <div className="text-sm">
                              <p className="font-medium">${community.pricing_from}/mo</p>
                              {community.pricing_to && (
                                <p className="text-gray-500">to ${community.pricing_to}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">No pricing</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-500">
                            {community.updated_at ? 
                              format(new Date(community.updated_at), 'MMM d, yyyy') : 
                              'Never'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/community/${community.id}`}>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/community-dashboard/${community.id}`}>
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            {!community.is_verified && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600"
                                onClick={() => verifyCommunityMutation.mutate(community.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${community.name}?`)) {
                                  deleteCommunityMutation.mutate(community.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                      {Math.min(currentPage * itemsPerPage, communitiesData?.total || 0)} of{' '}
                      {communitiesData?.total || 0} communities
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = currentPage - 2 + i;
                        if (page < 1 || page > totalPages) return null;
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8"
                          >
                            {page}
                          </Button>
                        );
                      }).filter(Boolean)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}