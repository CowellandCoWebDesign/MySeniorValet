import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, Folder, Upload, Download, Share2, Lock, Unlock,
  Search, Filter, Clock, User, Calendar, CheckCircle, XCircle,
  AlertTriangle, Eye, Edit, Trash2, Plus, Archive, Shield,
  FileSignature, FileCheck, FileClock, FileX, FileArchive,
  FolderOpen, FolderPlus, ChevronRight, ExternalLink, Copy,
  RefreshCw, Settings, Info, Star, History, Users, Link
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area } from 'recharts';

interface DocumentManagementProps {
  communityId: number;
}

export function DocumentManagement({ communityId }: DocumentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);

  // Document data query
  const { data: documentData, isLoading } = useQuery({
    queryKey: ['/api/enterprise/documents', communityId],
  });

  // Mock document management data - replace with real API data
  const mockDocuments = {
    summary: {
      totalDocuments: 1247,
      activeDocuments: 892,
      pendingReview: 23,
      expiringSoon: 15,
      sharedExternally: 167,
      storageUsed: 4.2, // GB
      storageLimit: 10, // GB
      recentActivity: 45
    },
    recentDocuments: [
      {
        id: 1,
        name: 'Resident_Care_Plan_Johnson_2025.pdf',
        category: 'Care Plans',
        type: 'pdf',
        size: '2.4 MB',
        status: 'active',
        version: 3,
        owner: 'Dr. Emily Smith',
        lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        shared: ['Sarah Williams', 'John Martinez'],
        tags: ['medical', 'care-plan', 'priority'],
        compliance: true,
        signed: true
      },
      {
        id: 2,
        name: 'State_Inspection_Report_August_2025.docx',
        category: 'Compliance',
        type: 'docx',
        size: '1.8 MB',
        status: 'pending_review',
        version: 1,
        owner: 'John Martinez',
        lastModified: new Date(Date.now() - 24 * 60 * 60 * 1000),
        reviewDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        shared: ['Admin Team'],
        tags: ['inspection', 'compliance', 'urgent'],
        compliance: true,
        signed: false
      },
      {
        id: 3,
        name: 'Employee_Handbook_2025_v2.pdf',
        category: 'HR Documents',
        type: 'pdf',
        size: '5.2 MB',
        status: 'active',
        version: 2,
        owner: 'HR Department',
        lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        shared: ['All Staff'],
        tags: ['hr', 'policies', 'handbook'],
        compliance: true,
        signed: true
      },
      {
        id: 4,
        name: 'Financial_Report_Q3_2025.xlsx',
        category: 'Financial',
        type: 'xlsx',
        size: '3.1 MB',
        status: 'active',
        version: 1,
        owner: 'Finance Team',
        lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        restricted: true,
        shared: ['Board Members', 'CFO'],
        tags: ['financial', 'quarterly', 'confidential'],
        compliance: true,
        signed: true
      }
    ],
    folders: [
      { name: 'Care Plans', documents: 234, size: '892 MB', lastAccessed: '2 hours ago' },
      { name: 'Compliance', documents: 156, size: '567 MB', lastAccessed: '1 day ago' },
      { name: 'HR Documents', documents: 89, size: '234 MB', lastAccessed: '3 hours ago' },
      { name: 'Financial', documents: 67, size: '456 MB', lastAccessed: '5 hours ago' },
      { name: 'Medical Records', documents: 456, size: '1.2 GB', lastAccessed: '30 minutes ago' },
      { name: 'Policies', documents: 45, size: '123 MB', lastAccessed: '1 week ago' },
      { name: 'Training Materials', documents: 78, size: '345 MB', lastAccessed: '2 days ago' },
      { name: 'Vendor Contracts', documents: 122, size: '567 MB', lastAccessed: '4 days ago' }
    ],
    categories: [
      { name: 'Care Plans', count: 234, percentage: 19 },
      { name: 'Medical Records', count: 456, percentage: 37 },
      { name: 'Compliance', count: 156, percentage: 12 },
      { name: 'Financial', count: 67, percentage: 5 },
      { name: 'HR Documents', count: 89, percentage: 7 },
      { name: 'Policies', count: 45, percentage: 4 },
      { name: 'Vendor Contracts', count: 122, percentage: 10 },
      { name: 'Other', count: 78, percentage: 6 }
    ],
    activityLog: [
      {
        action: 'uploaded',
        document: 'Resident_Care_Plan_Johnson_2025.pdf',
        user: 'Dr. Emily Smith',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000),
        details: 'Version 3 uploaded'
      },
      {
        action: 'signed',
        document: 'Service_Agreement_2025.pdf',
        user: 'John Martinez',
        time: new Date(Date.now() - 4 * 60 * 60 * 1000),
        details: 'Document electronically signed'
      },
      {
        action: 'shared',
        document: 'State_Inspection_Report_August_2025.docx',
        user: 'Sarah Williams',
        time: new Date(Date.now() - 6 * 60 * 60 * 1000),
        details: 'Shared with Admin Team'
      },
      {
        action: 'reviewed',
        document: 'Policy_Update_Fall_2025.pdf',
        user: 'Admin',
        time: new Date(Date.now() - 8 * 60 * 60 * 1000),
        details: 'Document approved'
      },
      {
        action: 'expired',
        document: 'Insurance_Certificate_2024.pdf',
        user: 'System',
        time: new Date(Date.now() - 24 * 60 * 60 * 1000),
        details: 'Document expired - renewal required'
      }
    ],
    pendingActions: [
      { document: 'State_Inspection_Report_August_2025.docx', action: 'Review Required', dueDate: '2025-09-03', priority: 'high' },
      { document: 'Employee_Contract_Renewal_Smith.pdf', action: 'Signature Required', dueDate: '2025-09-05', priority: 'medium' },
      { document: 'Budget_Proposal_2026.xlsx', action: 'Approval Needed', dueDate: '2025-09-10', priority: 'high' },
      { document: 'Safety_Protocol_Update.pdf', action: 'Distribution Required', dueDate: '2025-09-07', priority: 'low' }
    ],
    versionHistory: [
      {
        documentId: 1,
        versions: [
          { version: 3, uploadedBy: 'Dr. Emily Smith', uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), size: '2.4 MB', changes: 'Updated medication list' },
          { version: 2, uploadedBy: 'Sarah Williams', uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), size: '2.3 MB', changes: 'Added care notes' },
          { version: 1, uploadedBy: 'Dr. Emily Smith', uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), size: '2.1 MB', changes: 'Initial version' }
        ]
      }
    ],
    permissions: {
      users: [
        { name: 'Dr. Emily Smith', role: 'Medical Director', access: 'Full Access', documents: 456 },
        { name: 'John Martinez', role: 'Facility Manager', access: 'Edit', documents: 234 },
        { name: 'Sarah Williams', role: 'Nursing Director', access: 'View & Edit', documents: 345 },
        { name: 'Finance Team', role: 'Group', access: 'Restricted', documents: 67 }
      ]
    },
    statistics: {
      uploadTrend: [
        { month: 'Apr', uploads: 145 },
        { month: 'May', uploads: 167 },
        { month: 'Jun', uploads: 189 },
        { month: 'Jul', uploads: 156 },
        { month: 'Aug', uploads: 178 }
      ],
      storageGrowth: [
        { month: 'Apr', storage: 3.2 },
        { month: 'May', storage: 3.5 },
        { month: 'Jun', storage: 3.8 },
        { month: 'Jul', storage: 4.0 },
        { month: 'Aug', storage: 4.2 }
      ]
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'xlsx':
      case 'xls':
        return <FileText className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'pending_review':
        return <Badge className="bg-yellow-500">Pending Review</Badge>;
      case 'expired':
        return <Badge className="bg-red-500">Expired</Badge>;
      case 'archived':
        return <Badge className="bg-gray-500">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'uploaded':
        return <Upload className="w-4 h-4 text-green-500" />;
      case 'signed':
        return <FileSignature className="w-4 h-4 text-blue-500" />;
      case 'shared':
        return <Share2 className="w-4 h-4 text-purple-500" />;
      case 'reviewed':
        return <FileCheck className="w-4 h-4 text-green-500" />;
      case 'expired':
        return <FileX className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const filteredDocuments = mockDocuments.recentDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Document Management</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Secure document storage with version control and compliance tracking
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
          <Button variant="outline">
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Pending Actions Alert */}
      {mockDocuments.pendingActions.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Actions Required</AlertTitle>
          <AlertDescription>
            {mockDocuments.pendingActions.length} documents require your attention
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Documents</p>
                <p className="text-2xl font-bold">{mockDocuments.summary.totalDocuments}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {mockDocuments.summary.activeDocuments} active
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Storage Used</p>
                <p className="text-2xl font-bold">{mockDocuments.summary.storageUsed} GB</p>
                <Progress 
                  value={(mockDocuments.summary.storageUsed / mockDocuments.summary.storageLimit) * 100} 
                  className="h-1 mt-2" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  of {mockDocuments.summary.storageLimit} GB
                </p>
              </div>
              <Archive className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{mockDocuments.summary.pendingReview}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {mockDocuments.summary.expiringSoon} expiring soon
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recent Activity</p>
                <p className="text-2xl font-bold">{mockDocuments.summary.recentActivity}</p>
                <p className="text-xs text-gray-500 mt-1">
                  in last 24 hours
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Management Tabs */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Care Plans">Care Plans</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="HR Documents">HR Documents</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Medical Records">Medical Records</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Document List */}
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold">{doc.name}</p>
                          {getStatusBadge(doc.status)}
                          {doc.compliance && <Shield className="w-4 h-4 text-green-500" />}
                          {doc.signed && <FileSignature className="w-4 h-4 text-blue-500" />}
                          {doc.restricted && <Lock className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <p className="text-gray-500">Category</p>
                            <p className="font-medium">{doc.category}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Size</p>
                            <p className="font-medium">{doc.size}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Version</p>
                            <p className="font-medium">v{doc.version}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Owner</p>
                            <p className="font-medium">{doc.owner}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Modified {formatDistanceToNow(doc.lastModified, { addSuffix: true })}
                          </span>
                          {doc.shared && doc.shared.length > 0 && (
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              Shared with {doc.shared.length} {doc.shared.length === 1 ? 'person' : 'people'}
                            </span>
                          )}
                          {doc.expiresAt && (
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Expires {format(doc.expiresAt, 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                        {doc.tags && (
                          <div className="flex items-center space-x-2 mt-2">
                            {doc.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Folders Tab */}
        <TabsContent value="folders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Folders</CardTitle>
              <CardDescription>Organize documents by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockDocuments.folders.map((folder, index) => (
                  <div key={index} className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FolderOpen className="w-5 h-5 text-amber-500" />
                        <p className="font-medium">{folder.name}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>{folder.documents} documents</p>
                      <p>{folder.size}</p>
                      <p className="text-xs">Accessed {folder.lastAccessed}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Actions</CardTitle>
              <CardDescription>Documents requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockDocuments.pendingActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center space-x-4">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{action.document}</p>
                        <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                          <span>{action.action}</span>
                          <span>Due: {format(new Date(action.dueDate), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(action.priority)}
                      <Button size="sm">Take Action</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Document activity log</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockDocuments.activityLog.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded">
                    {getActionIcon(activity.action)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>
                          {' '}{activity.action}{' '}
                          <span className="font-medium">{activity.document}</span>
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(activity.time, { addSuffix: true })}
                        </span>
                      </div>
                      {activity.details && (
                        <p className="text-sm text-gray-500 mt-1">{activity.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Permissions</CardTitle>
              <CardDescription>User access control and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">User/Group</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-center p-2">Access Level</th>
                      <th className="text-center p-2">Documents</th>
                      <th className="text-center p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDocuments.permissions.users.map((user, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="p-2 text-sm text-gray-600">{user.role}</td>
                        <td className="text-center p-2">
                          <Badge variant="outline">{user.access}</Badge>
                        </td>
                        <td className="text-center p-2">{user.documents}</td>
                        <td className="text-center p-2">
                          <Button size="sm" variant="outline">Edit</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Upload Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Document Upload Trend</CardTitle>
                <CardDescription>Monthly document uploads</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={mockDocuments.statistics.uploadTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="uploads" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Storage Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Storage Growth</CardTitle>
                <CardDescription>Storage usage over time (GB)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={mockDocuments.statistics.storageGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="storage" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Document Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Document Distribution</CardTitle>
              <CardDescription>Documents by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={mockDocuments.categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {mockDocuments.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#94a3b8', '#f97316'][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}