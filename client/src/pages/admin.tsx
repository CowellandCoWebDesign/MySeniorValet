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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  AlertCircle, 
  RefreshCw, 
  Activity, 
  Shield, 
  Clock, 
  Download 
} from "lucide-react";

export default function AdminDashboard() {
  const [auditFilters, setAuditFilters] = useState({
    action: 'all',
    resourceType: 'all',
    severity: 'all',
    timeframe: '24h'
  });
  const [auditCurrentPage, setAuditCurrentPage] = useState(1);

  const auditLogsQuery = useQuery({
    queryKey: ['/api/admin/audit-logs', auditFilters, auditCurrentPage],
    retry: false,
  });

  const auditLogsResponse = auditLogsQuery.data;
  const logs = auditLogsResponse?.logs || [];
  const pagination = auditLogsResponse?.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 };

  // Calculate summary statistics from actual logs
  const summary = {
    totalEvents: pagination.total,
    highSeverityAlerts: logs.filter(log => log.severity === 'High' || log.severity === 'Critical').length,
    topActions: logs.reduce((acc, log) => {
      const existing = acc.find(item => item.action === log.action);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ action: log.action, count: 1 });
      }
      return acc;
    }, []).sort((a, b) => b.count - a.count).slice(0, 3),
    criticalEvents: logs.filter(log => log.severity === 'Critical').length
  };

  const auditLogs = {
    logs,
    summary,
    pagination: {
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      totalItems: pagination.total
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="audit" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="flags">Flags</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{auditLogs.summary.totalEvents}</p>
                    <p className="text-sm text-gray-600">Total Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{auditLogs.summary.highSeverityAlerts}</p>
                    <p className="text-sm text-gray-600">High Severity Alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{auditLogs.summary.criticalEvents}</p>
                    <p className="text-sm text-gray-600">Critical Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{auditLogs.summary.topActions[0]?.count || 0}</p>
                    <p className="text-sm text-gray-600">Top Action Count</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Comprehensive tracking of all system activities and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select value={auditFilters.action} onValueChange={(value) => setAuditFilters({...auditFilters, action: value})}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="user_login">User Login</SelectItem>
                    <SelectItem value="community_update">Community Update</SelectItem>
                    <SelectItem value="flag_submitted">Flag Submitted</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={auditFilters.severity} onValueChange={(value) => setAuditFilters({...auditFilters, severity: value})}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={auditFilters.timeframe} onValueChange={(value) => setAuditFilters({...auditFilters, timeframe: value})}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{log.resourceType} #{log.resourceId}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {log.userId ? `User #${log.userId}` : log.adminId ? `Admin #${log.adminId}` : 'System'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {log.details?.reason || 'No details available'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  Showing {auditLogs.pagination.currentPage} of {auditLogs.pagination.totalPages} pages
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAuditCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={auditCurrentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAuditCurrentPage(prev => prev + 1)}
                    disabled={auditCurrentPage === auditLogs.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health Overview</CardTitle>
              <CardDescription>
                Real-time monitoring of system services and API quotas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">3/4</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Services Healthy</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">89ms</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Avg Response Time</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">23</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Requests/Min</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0.1%</div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Error Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flags" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Listing Flags</CardTitle>
              <CardDescription>
                Review and manage community listing flags
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>No flags to review at this time.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>User management interface coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}