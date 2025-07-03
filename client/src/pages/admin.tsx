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
  Download,
  Users,
  Building2,
  Flag,
  FileText,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle,
  BarChart3,
  TrendingUp,
  MessageSquare,
  Ban,
  Trash2,
  Edit3,
  UserX,
  Settings,
  Phone,
  Mail,
  HelpCircle
} from "lucide-react";

export default function AdminDashboard() {
  const [auditFilters, setAuditFilters] = useState({
    action: 'all',
    resourceType: 'all',
    severity: 'all',
    timeframe: '24h'
  });
  const [auditCurrentPage, setAuditCurrentPage] = useState(1);
  const [showFullAnalytics, setShowFullAnalytics] = useState(false);
  const [showSystemDetails, setShowSystemDetails] = useState(false);
  const [showHealthDetails, setShowHealthDetails] = useState(false);

  const auditLogsQuery = useQuery({
    queryKey: ['/api/admin/audit-logs', auditFilters, auditCurrentPage],
    retry: false,
  });

  const analyticsQuery = useQuery({
    queryKey: ['/api/admin/support/analytics'],
    retry: false,
    enabled: showFullAnalytics
  });

  const systemHealthQuery = useQuery({
    queryKey: ['/api/admin/system/health'],
    retry: false,
    enabled: showSystemDetails
  });

  const healthDetailsQuery = useQuery({
    queryKey: ['/api/admin/health/details'],
    retry: false,
    enabled: showHealthDetails
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
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1">
          <TabsTrigger value="audit" className="text-xs md:text-sm">Audit</TabsTrigger>
          <TabsTrigger value="health" className="text-xs md:text-sm">Health</TabsTrigger>
          <TabsTrigger value="flags" className="text-xs md:text-sm">Flags</TabsTrigger>
          <TabsTrigger value="users" className="text-xs md:text-sm">Users</TabsTrigger>
          <TabsTrigger value="moderation" className="text-xs md:text-sm">Moderation</TabsTrigger>
          <TabsTrigger value="support" className="text-xs md:text-sm">Support</TabsTrigger>
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
                <div 
                  className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  onClick={() => setShowSystemDetails(!showSystemDetails)}
                >
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">3/4</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Services Healthy</div>
                  <div className="text-xs text-green-500 mt-1">Click for details</div>
                </div>
                <div 
                  className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  onClick={() => setShowHealthDetails(!showHealthDetails)}
                >
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">89ms</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Avg Response Time</div>
                  <div className="text-xs text-blue-500 mt-1">Click for breakdown</div>
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

              {/* System Details Breakdown */}
              {showSystemDetails && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      System Services Status
                    </CardTitle>
                    <CardDescription>
                      Detailed status of all system services and their health metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {systemHealthQuery.isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Loading system details...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-green-700 dark:text-green-300">Database</h4>
                                <p className="text-sm text-green-600 dark:text-green-400">PostgreSQL 15.2</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-green-700">Healthy</span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-green-600">
                              • Response time: 23ms avg
                              • Connections: 8/100 active
                              • Last backup: 2 hours ago
                            </div>
                          </div>

                          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-green-700 dark:text-green-300">API Server</h4>
                                <p className="text-sm text-green-600 dark:text-green-400">Express.js v4.18</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-green-700">Healthy</span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-green-600">
                              • Response time: 89ms avg
                              • Memory usage: 256MB
                              • Uptime: 2d 14h 32m
                            </div>
                          </div>

                          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-green-700 dark:text-green-300">Search Service</h4>
                                <p className="text-sm text-green-600 dark:text-green-400">ElasticSearch 8.1</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-green-700">Healthy</span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-green-600">
                              • Index size: 2.3GB
                              • Query time: 45ms avg
                              • Cache hit rate: 89%
                            </div>
                          </div>

                          <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/20">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-red-700 dark:text-red-300">Email Service</h4>
                                <p className="text-sm text-red-600 dark:text-red-400">SendGrid API</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <span className="text-sm font-medium text-red-700">Degraded</span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-red-600">
                              • API rate limit exceeded
                              • Queue backlog: 23 messages
                              • Last successful send: 15 minutes ago
                            </div>
                            <Button variant="outline" size="sm" className="mt-2 text-xs">
                              Investigate Issue
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Response Time Breakdown */}
              {showHealthDetails && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Response Time Analysis
                    </CardTitle>
                    <CardDescription>
                      Detailed breakdown of system response times and performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {healthDetailsQuery.isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Loading performance details...</span>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-700 dark:text-blue-300">API Endpoints</h4>
                            <div className="mt-2 space-y-1 text-sm text-blue-600">
                              <div className="flex justify-between">
                                <span>/api/communities</span>
                                <span className="font-medium">45ms</span>
                              </div>
                              <div className="flex justify-between">
                                <span>/api/search</span>
                                <span className="font-medium">123ms</span>
                              </div>
                              <div className="flex justify-between">
                                <span>/api/admin/*</span>
                                <span className="font-medium">67ms</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-purple-700 dark:text-purple-300">Database Queries</h4>
                            <div className="mt-2 space-y-1 text-sm text-purple-600">
                              <div className="flex justify-between">
                                <span>SELECT queries</span>
                                <span className="font-medium">18ms</span>
                              </div>
                              <div className="flex justify-between">
                                <span>INSERT/UPDATE</span>
                                <span className="font-medium">34ms</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Complex joins</span>
                                <span className="font-medium">89ms</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-green-700 dark:text-green-300">External APIs</h4>
                            <div className="mt-2 space-y-1 text-sm text-green-600">
                              <div className="flex justify-between">
                                <span>Google Places</span>
                                <span className="font-medium">234ms</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Yelp Fusion</span>
                                <span className="font-medium">187ms</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Geocoding</span>
                                <span className="font-medium">156ms</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-medium mb-3">Performance Recommendations</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                              <span>Consider adding caching for /api/search endpoint (123ms avg)</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                              <span>Database complex joins could be optimized with better indexing</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              <span>External API response times are within acceptable ranges</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
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

        <TabsContent value="moderation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">47</p>
                    <p className="text-sm text-gray-600">Reviews Pending Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Ban className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-gray-600">Content Violations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <UserX className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-gray-600">Users Suspended</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Content Review Queue
                </CardTitle>
                <CardDescription>
                  Review flagged content and user-generated reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">Review for Sundial Assisted Living</div>
                      <div className="text-sm text-gray-600">"The staff here are terrible and..."</div>
                      <div className="text-xs text-gray-500 mt-1">Flagged for inappropriate language</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">Comment on Oakmont of Redding</div>
                      <div className="text-sm text-gray-600">"This place is overpriced and..."</div>
                      <div className="text-xs text-gray-500 mt-1">Auto-flagged for negative sentiment</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter by Type
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Date Range
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Moderation Settings
                </CardTitle>
                <CardDescription>
                  Configure automated content filtering and policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto-flagging</div>
                      <div className="text-sm text-gray-600">Automatically flag potentially problematic content</div>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-sm text-green-700 dark:text-green-300">Enabled</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Profanity Filter</div>
                      <div className="text-sm text-gray-600">Block inappropriate language in reviews</div>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-sm text-green-700 dark:text-green-300">Enabled</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Spam Detection</div>
                      <div className="text-sm text-gray-600">Detect and block spam reviews</div>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-sm text-green-700 dark:text-green-300">Enabled</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Review Verification</div>
                      <div className="text-sm text-gray-600">Require email verification for reviews</div>
                    </div>
                    <div className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded text-sm text-yellow-700 dark:text-yellow-300">Partial</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">23</p>
                    <p className="text-sm text-gray-600">Open Tickets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">2.3h</p>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">94%</p>
                    <p className="text-sm text-gray-600">Resolution Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">4.8</p>
                    <p className="text-sm text-gray-600">Customer Satisfaction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Support Tickets
                </CardTitle>
                <CardDescription>
                  Manage customer support requests and inquiries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">Login Issues - User #1247</div>
                      <div className="text-sm text-gray-600">Unable to access account after password reset</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="destructive">High Priority</Badge>
                        <Badge variant="outline">Account</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">Pricing Question - Community Owner</div>
                      <div className="text-sm text-gray-600">Inquiry about listing pricing transparency</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="default">Medium Priority</Badge>
                        <Badge variant="outline">Billing</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">Feature Request - User #987</div>
                      <div className="text-sm text-gray-600">Request for advanced search filters</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">Low Priority</Badge>
                        <Badge variant="outline">Feature</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter by Priority
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Search Tickets
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Support Analytics
                </CardTitle>
                <CardDescription>
                  Track support performance and customer satisfaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Today's Activity</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">7 tickets resolved</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">3 new tickets opened</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">This Week</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">89% resolution rate</div>
                    <div className="text-sm text-green-600 dark:text-green-400">15% improvement from last week</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Common Issues</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400 space-y-1">
                      <div>1. Account login problems (35%)</div>
                      <div>2. Pricing transparency (28%)</div>
                      <div>3. Community information (22%)</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowFullAnalytics(!showFullAnalytics)}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {showFullAnalytics ? 'Hide' : 'View'} Full Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Support Configuration
              </CardTitle>
              <CardDescription>
                Configure support channels and automated responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Support Channels</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">Email Support</span>
                      </div>
                      <div className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs text-green-700 dark:text-green-300">Active</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">Phone Support</span>
                      </div>
                      <div className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs text-green-700 dark:text-green-300">Active</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">Live Chat</span>
                      </div>
                      <div className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded text-xs text-yellow-700 dark:text-yellow-300">Limited Hours</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Auto-Response Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Immediate acknowledgment</span>
                      <div className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs text-green-700 dark:text-green-300">Enabled</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Priority escalation</span>
                      <div className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs text-green-700 dark:text-green-300">Enabled</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">After-hours responses</span>
                      <div className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded text-xs text-red-700 dark:text-red-300">Disabled</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Analytics Modal/Section */}
        {showFullAnalytics && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Detailed Support Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive support metrics and performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading analytics...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-lg">Response Time Trends</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Last 24 hours</span>
                          <span className="font-medium">2.1h avg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Last 7 days</span>
                          <span className="font-medium">2.3h avg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Last 30 days</span>
                          <span className="font-medium">2.8h avg</span>
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-lg">Channel Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <span className="text-sm">Email Support</span>
                        <span className="font-medium">3.2h avg response</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                        <span className="text-sm">Phone Support</span>
                        <span className="font-medium">0.3h avg response</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <span className="text-sm">Live Chat</span>
                        <span className="font-medium">0.1h avg response</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-lg">Resolution Metrics</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">First Contact Resolution</span>
                          <span className="font-medium text-green-600">67%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Same Day Resolution</span>
                          <span className="font-medium text-green-600">89%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Escalation Rate</span>
                          <span className="font-medium text-orange-600">8%</span>
                        </div>
                      </div>
                    </div>

                    <h4 className="font-medium text-lg">Customer Satisfaction</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                        <span className="text-sm">Very Satisfied (5★)</span>
                        <span className="font-medium">68%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                        <span className="text-sm">Satisfied (4★)</span>
                        <span className="font-medium">22%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <span className="text-sm">Neutral (3★)</span>
                        <span className="font-medium">7%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                        <span className="text-sm">Dissatisfied (1-2★)</span>
                        <span className="font-medium">3%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </Tabs>
    </div>
  );
}