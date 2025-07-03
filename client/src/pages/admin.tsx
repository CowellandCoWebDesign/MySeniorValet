import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  BarChart3, 
  Flag, 
  Users, 
  Building2, 
  TrendingUp,
  Eye,
  Check,
  X,
  RefreshCw,
  MapPin,
  Phone,
  Globe,
  Star,
  Camera,
  Clock,
  MessageSquare,
  Activity,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  Search,
  Filter,
  Download,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Flag {
  id: number;
  communityId: number;
  userId?: number;
  flagType: string;
  reason: string;
  details?: string;
  reporterEmail?: string;
  reporterName?: string;
  status: "Pending" | "Reviewed" | "Resolved" | "Rejected";
  createdAt: string;
  updatedAt: string;
  reviewedBy?: number;
  reviewedAt?: string;
  adminNotes?: string;
}

interface Analytics {
  totalUsers: number;
  totalCommunities: number;
  totalFlags: number;
  pendingFlags: number;
}

interface Activity {
  id: number;
  userId: number;
  activityType: string;
  details: any;
  createdAt: string;
}

export default function AdminDashboard() {
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
  const [reviewAction, setReviewAction] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ["/api/admin/analytics"],
  });

  // Fetch pending flags
  const { data: flags, isLoading: flagsLoading } = useQuery<Flag[]>({
    queryKey: ["/api/admin/flags", "Pending"],
    queryFn: () => apiRequest("/api/admin/flags?status=Pending"),
  });

  // Fetch recent activity
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/admin/recent-activity"],
  });

  // Mutation to update flag status
  const updateFlagMutation = useMutation({
    mutationFn: async ({ flagId, status, notes }: { flagId: number; status: string; notes: string }) => {
      return await apiRequest(`/api/admin/flags/${flagId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          adminNotes: notes,
          reviewedBy: 1, // TODO: Get actual admin user ID
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/flags"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      toast({
        title: "Flag Updated",
        description: "Flag status has been updated successfully.",
      });
      setSelectedFlag(null);
      setReviewAction("");
      setAdminNotes("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update flag status.",
        variant: "destructive",
      });
    },
  });

  const handleReviewFlag = () => {
    if (!selectedFlag || !reviewAction) return;
    
    updateFlagMutation.mutate({
      flagId: selectedFlag.id,
      status: reviewAction,
      notes: adminNotes,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Reviewed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getFlagTypeColor = (type: string) => {
    switch (type) {
      case "Safety Concerns":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Incorrect Information":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Inappropriate Content":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage flags, monitor activity, and oversee platform operations
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="communities">Communities</TabsTrigger>
            <TabsTrigger value="flags">
              Flags
              {analytics?.pendingFlags ? (
                <Badge variant="destructive" className="ml-2">
                  {analytics.pendingFlags}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsLoading ? "..." : analytics?.totalUsers || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Communities</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsLoading ? "..." : analytics?.totalCommunities || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
                  <Flag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsLoading ? "..." : analytics?.totalFlags || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Flags</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">
                    {analyticsLoading ? "..." : analytics?.pendingFlags || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest user actions and platform events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities?.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-3">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-medium">{activity.activityType}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              User {activity.userId}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    )) || (
                      <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communities" className="space-y-6">
            <CommunityManagement />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="flags" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Flags</CardTitle>
                <CardDescription>
                  Review and take action on community listing flags
                </CardDescription>
              </CardHeader>
              <CardContent>
                {flagsLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Community</TableHead>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flags?.map((flag) => (
                        <TableRow key={flag.id}>
                          <TableCell>
                            <Badge className={getFlagTypeColor(flag.flagType)}>
                              {flag.flagType}
                            </Badge>
                          </TableCell>
                          <TableCell>Community {flag.communityId}</TableCell>
                          <TableCell>
                            {flag.reporterName || flag.reporterEmail || "Anonymous"}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(flag.status)}>
                              {flag.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(flag.createdAt)}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedFlag(flag)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Review Flag #{flag.id}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Flag Type</label>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {flag.flagType}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Community ID</label>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {flag.communityId}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium">Reason</label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {flag.reason}
                                    </p>
                                  </div>
                                  
                                  {flag.details && (
                                    <div>
                                      <label className="text-sm font-medium">Additional Details</label>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {flag.details}
                                      </p>
                                    </div>
                                  )}
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Action</label>
                                      <Select value={reviewAction} onValueChange={setReviewAction}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select action" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Reviewed">Mark as Reviewed</SelectItem>
                                          <SelectItem value="Resolved">Mark as Resolved</SelectItem>
                                          <SelectItem value="Rejected">Reject Flag</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium">Admin Notes</label>
                                    <Textarea
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      placeholder="Add notes about your decision..."
                                      className="mt-1"
                                    />
                                  </div>
                                  
                                  <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedFlag(null);
                                        setReviewAction("");
                                        setAdminNotes("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={handleReviewFlag}
                                      disabled={!reviewAction || updateFlagMutation.isPending}
                                    >
                                      {updateFlagMutation.isPending ? "Updating..." : "Update Flag"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400">
                            No pending flags
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>
                  Monitor user actions and platform engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="space-y-2">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities?.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{activity.activityType}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              User ID: {activity.userId}
                            </p>
                            {activity.details && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {JSON.stringify(activity.details)}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    )) || (
                      <p className="text-gray-500 dark:text-gray-400">No activity data available</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Statistics</CardTitle>
                  <CardDescription>Key metrics and performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analyticsLoading ? (
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Total Users</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {analytics?.totalUsers || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Communities</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {analytics?.totalCommunities || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Total Flags</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {analytics?.totalFlags || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Pending Reviews</span>
                        <span className="text-sm text-amber-600">
                          {analytics?.pendingFlags || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Monitor platform performance and issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        <span className="text-sm">Database</span>
                      </div>
                      <span className="text-sm text-green-600">Operational</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        <span className="text-sm">API Services</span>
                      </div>
                      <span className="text-sm text-green-600">Operational</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                        <span className="text-sm">Pending Reviews</span>
                      </div>
                      <span className="text-sm text-yellow-600">
                        {analytics?.pendingFlags || 0} Items
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CommunityManagement() {
  const queryClient = useQueryClient();
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);

  // Fetch all communities for management
  const { data: communities, isLoading: communitiesLoading } = useQuery({
    queryKey: ['/api/communities/all'],
  });

  // Refresh community data mutation
  const refreshCommunityMutation = useMutation({
    mutationFn: async (communityId: number) => {
      return await apiRequest("POST", `/api/admin/communities/${communityId}/refresh`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communities/all'] });
    },
  });

  // Enrich community data mutation  
  const enrichCommunityMutation = useMutation({
    mutationFn: async (communityId: number) => {
      return await apiRequest("POST", `/api/admin/communities/${communityId}/enrich`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communities/all'] });
    },
  });

  // Bulk refresh all communities
  const bulkRefreshMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/communities/bulk-refresh");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communities/all'] });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Community Management</CardTitle>
              <CardDescription>
                Manage community data, refresh information, and enrich listings
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <Button 
                  onClick={() => bulkRefreshMutation.mutate()}
                  disabled={bulkRefreshMutation.isPending}
                  variant="outline"
                >
                  {bulkRefreshMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh All
                </Button>
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400 max-w-xs">
                ⚠️ Bulk refresh uses Google Places API calls. Limited to first 10 communities to prevent quota overuse.
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {communitiesLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Employee Guide - Community Action Buttons:
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <div>• <strong>Refresh</strong>: Updates existing data from Google Places (costs API credits)</div>
                  <div>• <strong>Enrich</strong>: Adds Google Places data if missing (costs API credits)</div>
                  <div>• <strong>View</strong>: Shows complete community details (no API cost)</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Community</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Photos</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communities?.map((community: any) => (
                    <TableRow key={community.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{community.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            ID: {community.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">
                            {community.city}, {community.state}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {community.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{community.phone}</span>
                            </div>
                          )}
                          {community.website && (
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">Website</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {community.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-sm">{community.rating}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No rating</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Camera className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">
                            {community.photos?.length || 0} photos
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(community.updatedAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => refreshCommunityMutation.mutate(community.id)}
                            disabled={refreshCommunityMutation.isPending}
                          >
                            {refreshCommunityMutation.isPending ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => enrichCommunityMutation.mutate(community.id)}
                            disabled={enrichCommunityMutation.isPending}
                          >
                            <TrendingUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCommunity(community)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Community Details Dialog */}
      {selectedCommunity && (
        <Dialog open={!!selectedCommunity} onOpenChange={() => setSelectedCommunity(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCommunity.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>ID:</span>
                      <span>{selectedCommunity.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Address:</span>
                      <span>{selectedCommunity.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span>{selectedCommunity.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Website:</span>
                      <span>{selectedCommunity.website || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Care Types</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCommunity.careTypes?.map((type: string, index: number) => (
                      <Badge key={index} variant="secondary">{type}</Badge>
                    )) || <span className="text-sm text-gray-400">None specified</span>}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCommunity.amenities?.slice(0, 10).map((amenity: string, index: number) => (
                      <Badge key={index} variant="outline">{amenity}</Badge>
                    )) || <span className="text-sm text-gray-400">None specified</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Data Quality</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Rating:</span>
                      <span>{selectedCommunity.rating ? `${selectedCommunity.rating}⭐` : 'No rating'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Photos:</span>
                      <span>{selectedCommunity.photos?.length || 0} photos</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reviews:</span>
                      <span>{selectedCommunity.reviews?.length || 0} reviews</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Google Places ID:</span>
                      <span>{selectedCommunity.googlePlacesId ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Last Updated</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(selectedCommunity.updatedAt)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => refreshCommunityMutation.mutate(selectedCommunity.id)}
                    disabled={refreshCommunityMutation.isPending}
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                  <Button
                    onClick={() => enrichCommunityMutation.mutate(selectedCommunity.id)}
                    disabled={enrichCommunityMutation.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Enrich Data
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Mock user data for demonstration (in real app, this would come from API)
  const mockUsers = [
    {
      id: 1,
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      phone: "(555) 123-4567",
      relationshipToCare: "Seeking for Parent",
      isActive: true,
      createdAt: "2025-01-15T10:30:00Z",
      lastLogin: "2025-01-20T15:45:00Z",
      favoritesCount: 5,
      searchHistory: 12,
      flagsReported: 0,
      accountStatus: "Active"
    },
    {
      id: 2,
      email: "mary.smith@example.com",
      firstName: "Mary",
      lastName: "Smith",
      phone: "(555) 987-6543",
      relationshipToCare: "Seeking for Self",
      isActive: true,
      createdAt: "2025-01-10T09:15:00Z",
      lastLogin: "2025-01-19T11:20:00Z",
      favoritesCount: 3,
      searchHistory: 8,
      flagsReported: 1,
      accountStatus: "Active"
    },
    {
      id: 3,
      email: "bob.johnson@example.com",
      firstName: "Bob",
      lastName: "Johnson",
      phone: "(555) 456-7890",
      relationshipToCare: "Seeking for Spouse",
      isActive: false,
      createdAt: "2025-01-05T14:22:00Z",
      lastLogin: "2025-01-12T16:30:00Z",
      favoritesCount: 1,
      searchHistory: 3,
      flagsReported: 0,
      accountStatus: "Suspended"
    }
  ];

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts, permissions, and activity
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Users
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import Users
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.relationshipToCare}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.accountStatus)}>
                        {user.accountStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.favoritesCount} favorites</div>
                        <div className="text-gray-500">{user.searchHistory} searches</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(user.createdAt)}</div>
                        <div className="text-gray-500">Last: {formatDate(user.lastLogin)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={user.isActive ? "text-orange-600" : "text-green-600"}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Shield className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* User Details Modal */}
          {selectedUser && (
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>User Details: {selectedUser.firstName} {selectedUser.lastName}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{selectedUser.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{selectedUser.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{selectedUser.relationshipToCare}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Account Status</h4>
                      <div className="space-y-2">
                        <Badge className={getStatusColor(selectedUser.accountStatus)}>
                          {selectedUser.accountStatus}
                        </Badge>
                        <div className="text-sm text-gray-600">
                          {selectedUser.isActive ? "Account is active" : "Account is suspended"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Activity Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Favorites:</span>
                          <span>{selectedUser.favoritesCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Searches:</span>
                          <span>{selectedUser.searchHistory}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Flags Reported:</span>
                          <span>{selectedUser.flagsReported}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Timestamps</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Joined:</span>
                          <span>{formatDate(selectedUser.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Login:</span>
                          <span>{formatDate(selectedUser.lastLogin)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant={selectedUser.isActive ? "destructive" : "default"}
                      size="sm"
                    >
                      {selectedUser.isActive ? (
                        <>
                          <UserX className="h-4 w-4 mr-2" />
                          Suspend Account
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Activate Account
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Activity className="h-4 w-4 mr-2" />
                      View Activity Log
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {mockUsers.filter(u => u.isActive).length}
                    </div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <UserX className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {mockUsers.filter(u => !u.isActive).length}
                    </div>
                    <div className="text-sm text-gray-600">Suspended Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {mockUsers.filter(u => {
                        const joined = new Date(u.createdAt);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return joined > weekAgo;
                      }).length}
                    </div>
                    <div className="text-sm text-gray-600">New This Week</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Flag className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {mockUsers.reduce((sum, u) => sum + u.flagsReported, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Flags</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}