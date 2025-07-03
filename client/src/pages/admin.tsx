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
  Clock,
  MessageSquare,
  Activity
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
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