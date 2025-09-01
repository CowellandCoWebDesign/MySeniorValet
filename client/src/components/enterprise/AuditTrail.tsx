import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  History, User, Clock, Activity, Shield, FileText, Settings,
  Search, Filter, Download, Eye, Lock, Unlock, AlertTriangle,
  CheckCircle, XCircle, Info, Database, Key, UserCheck,
  Calendar, ChevronRight, RefreshCw, Archive, Trash2,
  LogIn, LogOut, Edit, Plus, Minus, Copy, Move, Share
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface AuditTrailProps {
  communityId: number;
}

export function AuditTrail({ communityId }: AuditTrailProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterDate, setFilterDate] = useState('7');
  const [selectedEntry, setSelectedEntry] = useState<number | null>(null);

  // Audit data query
  const { data: auditData, isLoading } = useQuery({
    queryKey: ['/api/enterprise/audit', communityId, filterDate],
  });

  // Mock audit trail data - replace with real API data
  const mockAudit = {
    summary: {
      totalEvents: 12456,
      todayEvents: 342,
      activeUsers: 45,
      criticalEvents: 3,
      suspiciousActivity: 2,
      complianceScore: 98,
      retentionDays: 90,
      storageUsed: '2.3 GB'
    },
    recentActivity: [
      {
        id: 1,
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        user: 'John Martinez',
        userRole: 'Administrator',
        action: 'UPDATE',
        resource: 'Resident Profile',
        details: 'Updated medication list for resident ID: 1234',
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/120.0',
        result: 'success',
        category: 'healthcare',
        severity: 'low'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        user: 'Sarah Williams',
        userRole: 'Nurse',
        action: 'ACCESS',
        resource: 'Medical Records',
        details: 'Viewed medical history for resident ID: 5678',
        ipAddress: '192.168.1.101',
        userAgent: 'Safari/17.0',
        result: 'success',
        category: 'healthcare',
        severity: 'low',
        dataAccessed: ['Vitals', 'Medications', 'Lab Results']
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        user: 'System',
        userRole: 'Automated',
        action: 'BACKUP',
        resource: 'Database',
        details: 'Automated daily backup completed successfully',
        ipAddress: 'localhost',
        userAgent: 'System Process',
        result: 'success',
        category: 'system',
        severity: 'info'
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        user: 'Emily Chen',
        userRole: 'Finance',
        action: 'EXPORT',
        resource: 'Financial Report',
        details: 'Exported Q3 2025 financial report to Excel',
        ipAddress: '192.168.1.102',
        userAgent: 'Edge/120.0',
        result: 'success',
        category: 'financial',
        severity: 'medium',
        dataExported: 4523
      },
      {
        id: 5,
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        user: 'Michael Brown',
        userRole: 'Staff',
        action: 'LOGIN_FAILED',
        resource: 'Authentication',
        details: 'Failed login attempt - incorrect password',
        ipAddress: '192.168.1.105',
        userAgent: 'Firefox/121.0',
        result: 'failed',
        category: 'security',
        severity: 'warning'
      },
      {
        id: 6,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        user: 'Admin',
        userRole: 'Super Admin',
        action: 'DELETE',
        resource: 'User Account',
        details: 'Deleted inactive user account: temp_user_2024',
        ipAddress: '192.168.1.1',
        userAgent: 'Chrome/120.0',
        result: 'success',
        category: 'administration',
        severity: 'high'
      }
    ],
    activityByUser: [
      { user: 'John Martinez', actions: 145, lastActive: '2 min ago' },
      { user: 'Sarah Williams', actions: 132, lastActive: '15 min ago' },
      { user: 'Emily Chen', actions: 98, lastActive: '45 min ago' },
      { user: 'Michael Brown', actions: 76, lastActive: '1 hour ago' },
      { user: 'System', actions: 234, lastActive: 'Active' }
    ],
    activityByCategory: [
      { category: 'Healthcare', count: 456, percentage: 35 },
      { category: 'Administration', count: 289, percentage: 22 },
      { category: 'Financial', count: 178, percentage: 14 },
      { category: 'Security', count: 145, percentage: 11 },
      { category: 'System', count: 234, percentage: 18 }
    ],
    activityTrend: [
      { hour: '00:00', events: 45 },
      { hour: '04:00', events: 23 },
      { hour: '08:00', events: 178 },
      { hour: '12:00', events: 234 },
      { hour: '16:00', events: 189 },
      { hour: '20:00', events: 145 }
    ],
    criticalEvents: [
      {
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        event: 'Unauthorized Access Attempt',
        user: 'Unknown',
        details: 'Multiple failed login attempts from IP: 203.0.113.45',
        severity: 'critical',
        status: 'investigated'
      },
      {
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        event: 'Data Export Alert',
        user: 'John Doe',
        details: 'Large data export detected: 10,000+ records',
        severity: 'high',
        status: 'approved'
      },
      {
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        event: 'Permission Escalation',
        user: 'Admin',
        details: 'User role changed from Staff to Administrator',
        severity: 'high',
        status: 'verified'
      }
    ],
    complianceEvents: [
      { regulation: 'HIPAA', compliant: 456, violations: 2, percentage: 99.6 },
      { regulation: 'GDPR', compliant: 234, violations: 0, percentage: 100 },
      { regulation: 'SOC 2', compliant: 178, violations: 1, percentage: 99.4 },
      { regulation: 'PCI DSS', compliant: 89, violations: 0, percentage: 100 }
    ],
    sessionActivity: [
      { user: 'John Martinez', loginTime: '08:15', duration: '6h 45m', actions: 145, status: 'active' },
      { user: 'Sarah Williams', loginTime: '07:30', duration: '7h 30m', actions: 132, status: 'active' },
      { user: 'Emily Chen', loginTime: '09:00', duration: '5h 15m', actions: 98, status: 'idle' },
      { user: 'Michael Brown', loginTime: '08:45', duration: '4h 30m', actions: 76, status: 'logged out' }
    ],
    dataAccessLog: [
      {
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        user: 'Sarah Williams',
        dataType: 'Medical Records',
        recordsAccessed: 5,
        purpose: 'Routine Care',
        approved: true
      },
      {
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        user: 'Emily Chen',
        dataType: 'Financial Data',
        recordsAccessed: 234,
        purpose: 'Monthly Report',
        approved: true
      },
      {
        timestamp: new Date(Date.now() - 40 * 60 * 1000),
        user: 'John Martinez',
        dataType: 'Resident Information',
        recordsAccessed: 12,
        purpose: 'Family Update',
        approved: true
      }
    ],
    statistics: {
      actionTypes: [
        { action: 'VIEW', count: 3456 },
        { action: 'UPDATE', count: 1234 },
        { action: 'CREATE', count: 567 },
        { action: 'DELETE', count: 89 },
        { action: 'EXPORT', count: 234 },
        { action: 'LOGIN', count: 456 }
      ],
      peakHours: [
        { hour: 9, activity: 'high' },
        { hour: 14, activity: 'high' },
        { hour: 16, activity: 'medium' },
        { hour: 3, activity: 'low' }
      ]
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'UPDATE':
      case 'EDIT':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'DELETE':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'ACCESS':
      case 'VIEW':
        return <Eye className="w-4 h-4 text-gray-500" />;
      case 'LOGIN':
        return <LogIn className="w-4 h-4 text-green-500" />;
      case 'LOGOUT':
        return <LogOut className="w-4 h-4 text-gray-500" />;
      case 'LOGIN_FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'EXPORT':
        return <Download className="w-4 h-4 text-purple-500" />;
      case 'BACKUP':
        return <Archive className="w-4 h-4 text-blue-500" />;
      case 'SHARE':
        return <Share className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-600">Critical</Badge>;
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'warning':
        return <Badge className="bg-orange-500">Warning</Badge>;
      case 'low':
        return <Badge className="bg-blue-500">Low</Badge>;
      case 'info':
        return <Badge className="bg-gray-500">Info</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'success':
        return <Badge className="bg-green-500">Success</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500">Partial</Badge>;
      default:
        return <Badge>{result}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'idle':
        return <Badge className="bg-yellow-500">Idle</Badge>;
      case 'logged out':
        return <Badge className="bg-gray-500">Logged Out</Badge>;
      case 'investigated':
        return <Badge className="bg-blue-500">Investigated</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'verified':
        return <Badge className="bg-green-500">Verified</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <History className="w-6 h-6 mr-2 text-purple-500" />
            Audit Trail & Activity Logging
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Complete activity tracking for compliance and security
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={filterDate} onValueChange={setFilterDate}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Today</SelectItem>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Critical Events Alert */}
      {mockAudit.summary.criticalEvents > 0 && (
        <Alert className="border-red-200 bg-red-50/50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Events Detected</AlertTitle>
          <AlertDescription>
            {mockAudit.summary.criticalEvents} critical events and {mockAudit.summary.suspiciousActivity} suspicious activities require review
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold">{mockAudit.summary.totalEvents.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {mockAudit.summary.todayEvents} today
                </p>
              </div>
              <History className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold">{mockAudit.summary.activeUsers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Currently online
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={mockAudit.summary.criticalEvents > 0 ? 'border-red-200 bg-red-50/50 dark:bg-red-900/20' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Security Alerts</p>
                <p className="text-2xl font-bold text-red-600">{mockAudit.summary.criticalEvents}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {mockAudit.summary.suspiciousActivity} suspicious
                </p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Compliance Score</p>
                <p className="text-2xl font-bold">{mockAudit.summary.complianceScore}%</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    className="bg-green-500 h-1 rounded-full" 
                    style={{ width: `${mockAudit.summary.complianceScore}%` }}
                  />
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Trail Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="data">Data Access</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search activity logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterUser} onValueChange={setFilterUser}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="admin">Administrators</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="access">Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Activity List */}
          <div className="space-y-3">
            {mockAudit.recentActivity.map((activity) => (
              <Card key={activity.id} className={activity.result === 'failed' ? 'border-red-200' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getActionIcon(activity.action)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold">{activity.user}</p>
                          <Badge variant="outline">{activity.userRole}</Badge>
                          {getSeverityBadge(activity.severity)}
                          {getResultBadge(activity.result)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.action} - {activity.resource}: {activity.details}
                        </p>
                        {activity.dataAccessed && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {activity.dataAccessed.map((data, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{data}</Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                          </span>
                          <span className="flex items-center">
                            <Globe className="w-3 h-3 mr-1" />
                            {activity.ipAddress}
                          </span>
                          <span className="flex items-center">
                            <Monitor className="w-3 h-3 mr-1" />
                            {activity.userAgent}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          {/* Critical Events */}
          <Card>
            <CardHeader>
              <CardTitle>Critical Security Events</CardTitle>
              <CardDescription>High-priority security incidents requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAudit.criticalEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">{event.event}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {event.details}
                        </p>
                        <div className="flex items-center space-x-3 mt-2 text-sm text-gray-500">
                          <span>User: {event.user}</span>
                          <span>{formatDistanceToNow(event.timestamp, { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getSeverityBadge(event.severity)}
                      {getStatusBadge(event.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Activity */}
          <Card>
            <CardHeader>
              <CardTitle>User Activity Summary</CardTitle>
              <CardDescription>Activity breakdown by user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAudit.activityByUser.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{user.user}</p>
                        <p className="text-sm text-gray-500">Last active: {user.lastActive}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{user.actions}</p>
                      <p className="text-sm text-gray-500">actions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Monitoring</CardTitle>
              <CardDescription>Regulatory compliance tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAudit.complianceEvents.map((compliance, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{compliance.regulation}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">
                          {compliance.compliant} compliant / {compliance.violations} violations
                        </span>
                        <Badge className={compliance.percentage === 100 ? 'bg-green-500' : 'bg-yellow-500'}>
                          {compliance.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${compliance.percentage === 100 ? 'bg-green-500' : 'bg-yellow-500'}`}
                        style={{ width: `${compliance.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Retention Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Data Retention Policy</CardTitle>
              <CardDescription>Audit log retention and storage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-2xl font-bold">{mockAudit.summary.retentionDays}</p>
                  <p className="text-sm text-gray-500">Days Retained</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-2xl font-bold">{mockAudit.summary.storageUsed}</p>
                  <p className="text-sm text-gray-500">Storage Used</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-2xl font-bold">10 GB</p>
                  <p className="text-sm text-gray-500">Storage Limit</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-2xl font-bold">256-bit</p>
                  <p className="text-sm text-gray-500">Encryption</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Current user sessions and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">User</th>
                      <th className="text-center p-2">Login Time</th>
                      <th className="text-center p-2">Duration</th>
                      <th className="text-center p-2">Actions</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-center p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAudit.sessionActivity.map((session, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{session.user}</span>
                          </div>
                        </td>
                        <td className="text-center p-2">{session.loginTime}</td>
                        <td className="text-center p-2">{session.duration}</td>
                        <td className="text-center p-2">{session.actions}</td>
                        <td className="text-center p-2">{getStatusBadge(session.status)}</td>
                        <td className="text-center p-2">
                          {session.status === 'active' && (
                            <Button size="sm" variant="outline">End Session</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Access Tab */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Access Log</CardTitle>
              <CardDescription>Sensitive data access tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAudit.dataAccessLog.map((access, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-start space-x-3">
                      <Database className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold">{access.user}</p>
                          <Badge variant="outline">{access.dataType}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Accessed {access.recordsAccessed} records - Purpose: {access.purpose}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(access.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {access.approved ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Activity Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Trend</CardTitle>
                <CardDescription>Hourly activity distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={mockAudit.activityTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="events" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Action Types */}
            <Card>
              <CardHeader>
                <CardTitle>Action Distribution</CardTitle>
                <CardDescription>Breakdown of action types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={mockAudit.statistics.actionTypes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="action" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Activity by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Activity by Category</CardTitle>
              <CardDescription>Event distribution across system categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAudit.activityByCategory.map((category, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{category.category}</span>
                      <span className="text-sm">{category.count} events ({category.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}