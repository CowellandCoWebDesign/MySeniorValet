import { useState, lazy, Suspense } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Shield, 
  Users, 
  Building2, 
  DollarSign, 
  BarChart3, 
  Link, 
  Settings,
  UserPlus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Lazy load dashboard components for better performance
const AdminDashboard = lazy(() => import("./admin-clean"));
const CommunityDashboard = lazy(() => import("./community-dashboard-modern"));
const UserDashboard = lazy(() => import("./dashboard"));
const VendorDashboard = lazy(() => import("./vendor-dashboard"));
const FinancialDashboard = lazy(() => import("./financial-dashboard"));

// Role definitions
const ROLE_DEFINITIONS = {
  super_admin: {
    label: "Super Admin",
    description: "Full system access",
    dashboards: ["admin", "users", "community", "vendor", "financial", "security"],
    color: "bg-gradient-to-r from-gray-300 to-gray-100",
    textColor: "text-gray-900",
    badgeClass: "bg-gradient-to-r from-gray-300 to-gray-100 text-gray-900 border-gray-400",
    tier: "Platinum"
  },
  admin: {
    label: "Admin",
    description: "Administrative access (includes analytics & integrations)",
    dashboards: ["admin", "users", "community", "security"],
    color: "bg-gradient-to-r from-yellow-400 to-yellow-200",
    textColor: "text-yellow-900",
    badgeClass: "bg-gradient-to-r from-yellow-400 to-yellow-200 text-yellow-900 border-yellow-500",
    tier: "Gold"
  },
  financial_admin: {
    label: "Financial Admin",
    description: "Financial and revenue management",
    dashboards: ["financial", "admin"],
    color: "bg-gradient-to-r from-emerald-400 to-emerald-200",
    textColor: "text-emerald-900",
    badgeClass: "bg-gradient-to-r from-emerald-400 to-emerald-200 text-emerald-900 border-emerald-500",
    tier: "Emerald"
  },
  support_agent: {
    label: "Support Agent",
    description: "User support and community management",
    dashboards: ["users", "community"],
    color: "bg-gradient-to-r from-blue-400 to-blue-200",
    textColor: "text-blue-900",
    badgeClass: "bg-gradient-to-r from-blue-400 to-blue-200 text-blue-900 border-blue-500",
    tier: "Silver"
  },
  analytics_viewer: {
    label: "Analytics Viewer",
    description: "View-only analytics access (via admin dashboard)",
    dashboards: ["admin"],
    color: "bg-gradient-to-r from-purple-400 to-purple-200",
    textColor: "text-purple-900",
    badgeClass: "bg-gradient-to-r from-purple-400 to-purple-200 text-purple-900 border-purple-500",
    tier: "Bronze"
  },
  community_owner: {
    label: "Community Owner",
    description: "Community management access",
    dashboards: ["community"],
    color: "bg-gradient-to-r from-orange-400 to-orange-200",
    textColor: "text-orange-900",
    badgeClass: "bg-gradient-to-r from-orange-400 to-orange-200 text-orange-900 border-orange-500",
    tier: "Bronze"
  },
  vendor: {
    label: "Vendor",
    description: "Vendor dashboard access",
    dashboards: ["vendor"],
    color: "bg-gradient-to-r from-teal-400 to-teal-200",
    textColor: "text-teal-900",
    badgeClass: "bg-gradient-to-r from-teal-400 to-teal-200 text-teal-900 border-teal-500",
    tier: "Bronze"
  },
  user: {
    label: "User",
    description: "Basic user access",
    dashboards: ["user"],
    color: "bg-gray-200",
    textColor: "text-gray-700",
    badgeClass: "bg-gray-200 text-gray-700 border-gray-400",
    tier: "Standard"
  }
};

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export default function UnifiedAdminDashboard() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch current user's role and permissions
  const { data: userRole, isLoading: roleLoading } = useQuery({
    queryKey: ["/api/auth/user/role"],
    enabled: !!currentUser,
  });

  // Fetch all users for user management
  const { data: allUsers = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users", currentPage, searchTerm, roleFilter],
    enabled: !!currentUser && (userRole?.role === 'super_admin' || userRole?.role === 'admin'),
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest("PUT", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Role Updated",
        description: "User role has been successfully updated.",
      });
      setEditingUserId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  });

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser || !userRole) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/"}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get available dashboards based on user role
  const availableDashboards = ROLE_DEFINITIONS[userRole.role as keyof typeof ROLE_DEFINITIONS]?.dashboards || [];
  const canManageUsers = ['super_admin', 'admin'].includes(userRole.role);

  // Filter users based on search and role
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const renderDashboard = (dashboard: string) => {
    switch (dashboard) {
      case 'admin':
        return <AdminDashboard />;
      case 'community':
        return <CommunityDashboard />;
      case 'user':
        return <UserDashboard />;
      case 'vendor':
        return <VendorDashboard />;
      case 'financial':
        return <FinancialDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Dashboard component not found.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Tier Access Badge Banner */}
      <div className={`w-full py-2 px-4 text-center ${ROLE_DEFINITIONS[userRole?.role as keyof typeof ROLE_DEFINITIONS]?.color || 'bg-gray-200'}`}>
        <div className="flex items-center justify-center gap-2">
          <Shield className={`h-5 w-5 ${ROLE_DEFINITIONS[userRole?.role as keyof typeof ROLE_DEFINITIONS]?.textColor || 'text-gray-700'}`} />
          <span className={`text-sm font-bold uppercase tracking-wider ${ROLE_DEFINITIONS[userRole?.role as keyof typeof ROLE_DEFINITIONS]?.textColor || 'text-gray-700'}`}>
            {ROLE_DEFINITIONS[userRole?.role as keyof typeof ROLE_DEFINITIONS]?.tier} TIER ACCESS
          </span>
          <span className={`text-sm ${ROLE_DEFINITIONS[userRole?.role as keyof typeof ROLE_DEFINITIONS]?.textColor || 'text-gray-700'} opacity-80`}>
            • {ROLE_DEFINITIONS[userRole?.role as keyof typeof ROLE_DEFINITIONS]?.label}
          </span>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">MySeniorValet Admin Center</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your platform with {ROLE_DEFINITIONS[userRole?.role as keyof typeof ROLE_DEFINITIONS]?.tier} tier privileges
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {currentUser?.firstName} {currentUser?.lastName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap gap-2 h-auto p-2">
            {availableDashboards.includes('admin') && (
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Overview
              </TabsTrigger>
            )}
            {canManageUsers && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
            )}
            {availableDashboards.includes('community') && (
              <TabsTrigger value="community" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Communities
              </TabsTrigger>
            )}
            {availableDashboards.includes('vendor') && (
              <TabsTrigger value="vendor" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Vendor
              </TabsTrigger>
            )}
            {availableDashboards.includes('financial') && (
              <TabsTrigger value="financial" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          {availableDashboards.includes('admin') && (
            <TabsContent value="overview">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              }>
                {renderDashboard('admin')}
              </Suspense>
            </TabsContent>
          )}

          {/* User Management Tab */}
          {canManageUsers && (
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>
                        Manage user roles and permissions
                      </CardDescription>
                    </div>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite User
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-[200px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {Object.entries(ROLE_DEFINITIONS).map(([role, def]) => (
                          <SelectItem key={role} value={role}>
                            {def.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  {/* Users Table */}
                  {usersLoading ? (
                    <div className="text-center py-8">Loading users...</div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    ID: {user.id}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                {editingUserId === user.id ? (
                                  <Select 
                                    value={editingRole} 
                                    onValueChange={setEditingRole}
                                  >
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(ROLE_DEFINITIONS).map(([role, def]) => (
                                        <SelectItem key={role} value={role}>
                                          {def.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${ROLE_DEFINITIONS[user.role as keyof typeof ROLE_DEFINITIONS]?.badgeClass || 'bg-gray-200 text-gray-700 border-gray-400'}`}>
                                    <span className="mr-1">{ROLE_DEFINITIONS[user.role as keyof typeof ROLE_DEFINITIONS]?.tier}</span>
                                    {ROLE_DEFINITIONS[user.role as keyof typeof ROLE_DEFINITIONS]?.label || user.role}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'MMM d, yyyy') : 'Never'}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {editingUserId === user.id ? (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          updateRoleMutation.mutate({
                                            userId: user.id,
                                            role: editingRole
                                          });
                                        }}
                                      >
                                        <Save className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingUserId(null)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setEditingUserId(user.id);
                                          setEditingRole(user.role);
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={() => {
                                          if (confirm('Are you sure you want to delete this user?')) {
                                            deleteUserMutation.mutate(user.id);
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
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
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
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
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <Button
                                key={page}
                                variant={page === currentPage ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-8"
                              >
                                {page}
                              </Button>
                            ))}
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
            </TabsContent>
          )}

          {/* Other Dashboard Tabs */}
          {availableDashboards.includes('community') && (
            <TabsContent value="community">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              }>
                {renderDashboard('community')}
              </Suspense>
            </TabsContent>
          )}

          {availableDashboards.includes('vendor') && (
            <TabsContent value="vendor">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              }>
                {renderDashboard('vendor')}
              </Suspense>
            </TabsContent>
          )}

          {availableDashboards.includes('financial') && (
            <TabsContent value="financial">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              }>
                {renderDashboard('financial')}
              </Suspense>
            </TabsContent>
          )}


        </Tabs>
      </div>
    </div>
  );
}