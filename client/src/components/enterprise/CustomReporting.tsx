import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, Download, Calendar, Clock, Send, Play, Pause, Settings,
  Plus, Edit, Trash2, Copy, Filter, Search, Eye, Mail, Share2,
  BarChart3, PieChart, TrendingUp, FileSpreadsheet, Database,
  AlertTriangle, CheckCircle, Info, RefreshCw, Archive, Upload,
  Zap, Sparkles, Layers, GitBranch, Package, Globe, Lock
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface CustomReportingProps {
  communityId: number;
}

export function CustomReporting({ communityId }: CustomReportingProps) {
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Reports data query
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['/api/enterprise/reports', communityId],
  });

  // Mock reporting data - replace with real API data
  const mockReports = {
    summary: {
      totalReports: 45,
      scheduledReports: 28,
      lastGenerated: new Date(Date.now() - 30 * 60 * 1000),
      nextScheduled: new Date(Date.now() + 2 * 60 * 60 * 1000),
      storageUsed: '1.2 GB',
      emailsSent: 342,
      activeRecipients: 67,
      automationRate: 82
    },
    templates: [
      {
        id: 1,
        name: 'Executive Summary',
        description: 'High-level KPIs and metrics for leadership',
        category: 'Executive',
        dataPoints: 25,
        charts: 8,
        lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        popularity: 95
      },
      {
        id: 2,
        name: 'Financial Performance',
        description: 'Revenue, expenses, and profitability analysis',
        category: 'Finance',
        dataPoints: 42,
        charts: 12,
        lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        popularity: 88
      },
      {
        id: 3,
        name: 'Occupancy Analytics',
        description: 'Detailed occupancy trends and forecasts',
        category: 'Operations',
        dataPoints: 18,
        charts: 6,
        lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        popularity: 92
      },
      {
        id: 4,
        name: 'Resident Care Quality',
        description: 'Care metrics, health outcomes, and satisfaction',
        category: 'Healthcare',
        dataPoints: 35,
        charts: 9,
        lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        popularity: 85
      },
      {
        id: 5,
        name: 'Staff Performance',
        description: 'Productivity, training, and retention metrics',
        category: 'HR',
        dataPoints: 28,
        charts: 7,
        lastUsed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        popularity: 78
      },
      {
        id: 6,
        name: 'Compliance Dashboard',
        description: 'Regulatory compliance and audit readiness',
        category: 'Compliance',
        dataPoints: 22,
        charts: 5,
        lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        popularity: 90
      }
    ],
    scheduledReports: [
      {
        id: 1,
        name: 'Weekly Executive Report',
        template: 'Executive Summary',
        frequency: 'Weekly',
        nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        recipients: ['admin@community.com', 'director@community.com'],
        format: 'PDF',
        status: 'active',
        deliveryMethod: 'Email',
        includeCharts: true,
        dataRange: 'Last 7 days'
      },
      {
        id: 2,
        name: 'Monthly Financial Report',
        template: 'Financial Performance',
        frequency: 'Monthly',
        nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        recipients: ['cfo@community.com', 'accounting@community.com'],
        format: 'Excel',
        status: 'active',
        deliveryMethod: 'Email + Portal',
        includeCharts: true,
        dataRange: 'Last month'
      },
      {
        id: 3,
        name: 'Daily Occupancy Update',
        template: 'Occupancy Analytics',
        frequency: 'Daily',
        nextRun: new Date(Date.now() + 8 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 16 * 60 * 60 * 1000),
        recipients: ['operations@community.com'],
        format: 'Dashboard',
        status: 'active',
        deliveryMethod: 'Portal',
        includeCharts: false,
        dataRange: 'Last 24 hours'
      },
      {
        id: 4,
        name: 'Quarterly Compliance Review',
        template: 'Compliance Dashboard',
        frequency: 'Quarterly',
        nextRun: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        recipients: ['compliance@community.com', 'legal@community.com'],
        format: 'PDF',
        status: 'active',
        deliveryMethod: 'Secure Email',
        includeCharts: true,
        dataRange: 'Last quarter'
      },
      {
        id: 5,
        name: 'Ad-hoc Marketing Analysis',
        template: 'Custom',
        frequency: 'On-demand',
        nextRun: null,
        lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        recipients: ['marketing@community.com'],
        format: 'PowerPoint',
        status: 'paused',
        deliveryMethod: 'Download',
        includeCharts: true,
        dataRange: 'Custom'
      }
    ],
    recentReports: [
      {
        id: 1,
        name: 'Q3 2025 Executive Summary',
        generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        generatedBy: 'System',
        size: '2.4 MB',
        format: 'PDF',
        pages: 18,
        status: 'completed',
        downloads: 12,
        shares: 5
      },
      {
        id: 2,
        name: 'August 2025 Financial Report',
        generatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        generatedBy: 'John Martinez',
        size: '1.8 MB',
        format: 'Excel',
        pages: null,
        status: 'completed',
        downloads: 8,
        shares: 3
      },
      {
        id: 3,
        name: 'Weekly Staff Performance',
        generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        generatedBy: 'System',
        size: '890 KB',
        format: 'PDF',
        pages: 8,
        status: 'completed',
        downloads: 5,
        shares: 2
      },
      {
        id: 4,
        name: 'Custom Occupancy Analysis',
        generatedAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
        generatedBy: 'Sarah Williams',
        size: '3.2 MB',
        format: 'PowerPoint',
        pages: 24,
        status: 'completed',
        downloads: 15,
        shares: 7
      },
      {
        id: 5,
        name: 'Compliance Audit Report',
        generatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        generatedBy: 'System',
        size: '1.5 MB',
        format: 'PDF',
        pages: 32,
        status: 'processing',
        downloads: 0,
        shares: 0
      }
    ],
    dataConnections: [
      { source: 'EHR System', status: 'connected', records: 12450, lastSync: '5 min ago' },
      { source: 'Financial System', status: 'connected', records: 8923, lastSync: '1 hour ago' },
      { source: 'CRM Platform', status: 'connected', records: 4567, lastSync: '30 min ago' },
      { source: 'HR Database', status: 'disconnected', records: 0, lastSync: '2 days ago' },
      { source: 'Compliance Portal', status: 'connected', records: 2134, lastSync: '2 hours ago' }
    ],
    reportBuilder: {
      availableMetrics: [
        { category: 'Financial', metrics: ['Revenue', 'Expenses', 'Profit Margin', 'Cash Flow', 'AR/AP'] },
        { category: 'Occupancy', metrics: ['Current Rate', 'Move-ins', 'Move-outs', 'Forecast', 'Turnover'] },
        { category: 'Care', metrics: ['ADL Scores', 'Incidents', 'Medications', 'Assessments', 'Hospitalizations'] },
        { category: 'Staff', metrics: ['Headcount', 'Overtime', 'Training', 'Turnover', 'Satisfaction'] },
        { category: 'Quality', metrics: ['Satisfaction', 'NPS', 'Reviews', 'Complaints', 'Outcomes'] }
      ],
      chartTypes: ['Line', 'Bar', 'Pie', 'Area', 'Scatter', 'Heatmap', 'Gauge', 'Table'],
      exportFormats: ['PDF', 'Excel', 'PowerPoint', 'CSV', 'Dashboard', 'API'],
      deliveryOptions: ['Email', 'Portal', 'FTP', 'API', 'Slack', 'Teams']
    },
    analytics: {
      mostUsedReports: [
        { name: 'Executive Summary', uses: 145 },
        { name: 'Financial Performance', uses: 112 },
        { name: 'Occupancy Analytics', uses: 98 },
        { name: 'Compliance Dashboard', uses: 76 }
      ],
      averageGenerationTime: 45, // seconds
      successRate: 98.5,
      userSatisfaction: 4.6,
      automationSavings: '120 hours/month'
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    switch (frequency) {
      case 'Daily':
        return <Badge className="bg-green-500">Daily</Badge>;
      case 'Weekly':
        return <Badge className="bg-blue-500">Weekly</Badge>;
      case 'Monthly':
        return <Badge className="bg-purple-500">Monthly</Badge>;
      case 'Quarterly':
        return <Badge className="bg-amber-500">Quarterly</Badge>;
      case 'On-demand':
        return <Badge className="bg-gray-500">On-demand</Badge>;
      default:
        return <Badge>{frequency}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500">Paused</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-purple-500">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      case 'connected':
        return <Badge className="bg-green-500">Connected</Badge>;
      case 'disconnected':
        return <Badge className="bg-red-500">Disconnected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Executive':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'Finance':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'Operations':
        return <Settings className="w-4 h-4 text-blue-500" />;
      case 'Healthcare':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'HR':
        return <Users className="w-4 h-4 text-amber-500" />;
      case 'Compliance':
        return <Shield className="w-4 h-4 text-indigo-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <FileText className="w-6 h-6 mr-2 text-purple-500" />
            Custom Reporting Engine
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Build, schedule, and distribute automated reports
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Template
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      {/* AI Assistant Alert */}
      <Alert className="border-purple-200 bg-purple-50/50 dark:bg-purple-900/20">
        <Sparkles className="h-4 w-4" />
        <AlertTitle>AI Report Assistant Available</AlertTitle>
        <AlertDescription>
          Describe what you need in natural language and our AI will build a custom report for you
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Reports</p>
                <p className="text-2xl font-bold">{mockReports.summary.totalReports}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {mockReports.summary.scheduledReports} scheduled
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automation Rate</p>
                <p className="text-2xl font-bold">{mockReports.summary.automationRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {mockReports.analytics.automationSavings} saved
                </p>
              </div>
              <Zap className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Emails Sent</p>
                <p className="text-2xl font-bold">{mockReports.summary.emailsSent}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {mockReports.summary.activeRecipients} recipients
                </p>
              </div>
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Next Scheduled</p>
                <p className="text-lg font-bold">
                  {format(mockReports.summary.nextScheduled, 'HH:mm')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(mockReports.summary.nextScheduled, { addSuffix: true })}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reporting Tabs */}
      <Tabs defaultValue="scheduled" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="connections">Data</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Scheduled Reports</CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Schedule Report
                </Button>
              </div>
              <CardDescription>Automated report generation and distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReports.scheduledReports.map((report) => (
                  <div key={report.id} className="border rounded p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold">{report.name}</p>
                          {getFrequencyBadge(report.frequency)}
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Template: {report.template} • Format: {report.format} • {report.dataRange}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          {report.status === 'active' ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Next Run</p>
                        <p className="font-medium">
                          {report.nextRun ? format(report.nextRun, 'MMM dd, HH:mm') : 'On-demand'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Run</p>
                        <p className="font-medium">
                          {formatDistanceToNow(report.lastRun, { addSuffix: true })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Delivery</p>
                        <p className="font-medium">{report.deliveryMethod}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Recipients</p>
                        <p className="font-medium">{report.recipients.length} users</p>
                      </div>
                    </div>

                    {report.includeCharts && (
                      <div className="flex items-center mt-3 text-sm text-gray-500">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Charts included
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Pre-built templates for common reporting needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockReports.templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(template.category)}
                          <p className="font-semibold">{template.name}</p>
                        </div>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {template.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <Database className="w-3 h-3 mr-1" />
                            {template.dataPoints}
                          </span>
                          <span className="flex items-center">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            {template.charts}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-16 h-1 bg-gray-200 rounded">
                            <div 
                              className="h-1 bg-purple-500 rounded"
                              style={{ width: `${template.popularity}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-500">
                          Used {formatDistanceToNow(template.lastUsed, { addSuffix: true })}
                        </p>
                        <Button size="sm">Use Template</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Builder Tab */}
        <TabsContent value="builder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>Design your own reports with drag-and-drop simplicity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Metrics Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Select Metrics</h3>
                  {mockReports.reportBuilder.availableMetrics.map((category, idx) => (
                    <div key={idx} className="border rounded p-3">
                      <p className="font-medium mb-2">{category.category}</p>
                      <div className="space-y-2">
                        {category.metrics.map((metric, midx) => (
                          <label key={midx} className="flex items-center space-x-2">
                            <Checkbox />
                            <span className="text-sm">{metric}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Report Configuration */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Configuration</h3>
                  
                  <div>
                    <Label>Report Name</Label>
                    <Input placeholder="Enter report name" />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea placeholder="Describe the report purpose" />
                  </div>

                  <div>
                    <Label>Date Range</Label>
                    <Select defaultValue="last30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last7">Last 7 days</SelectItem>
                        <SelectItem value="last30">Last 30 days</SelectItem>
                        <SelectItem value="last90">Last 90 days</SelectItem>
                        <SelectItem value="custom">Custom range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Chart Type</Label>
                    <Select defaultValue="line">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockReports.reportBuilder.chartTypes.map((type) => (
                          <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Export Format</Label>
                    <Select defaultValue="pdf">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockReports.reportBuilder.exportFormats.map((format) => (
                          <SelectItem key={format} value={format.toLowerCase()}>{format}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Preview</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Report preview will appear here</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Button className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Generate Preview
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Reports Tab */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Reports</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input 
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Button variant="outline">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>Previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Report Name</th>
                      <th className="text-center p-2">Generated</th>
                      <th className="text-center p-2">By</th>
                      <th className="text-center p-2">Format</th>
                      <th className="text-center p-2">Size</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-center p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockReports.recentReports.map((report) => (
                      <tr key={report.id} className="border-b">
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{report.name}</span>
                          </div>
                        </td>
                        <td className="text-center p-2 text-sm">
                          {formatDistanceToNow(report.generatedAt, { addSuffix: true })}
                        </td>
                        <td className="text-center p-2 text-sm">{report.generatedBy}</td>
                        <td className="text-center p-2">
                          <Badge variant="outline">{report.format}</Badge>
                        </td>
                        <td className="text-center p-2 text-sm">{report.size}</td>
                        <td className="text-center p-2">{getStatusBadge(report.status)}</td>
                        <td className="text-center p-2">
                          <div className="flex items-center justify-center space-x-1">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Connections Tab */}
        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Source Connections</CardTitle>
              <CardDescription>Manage connections to data sources for reporting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockReports.dataConnections.map((connection, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center space-x-3">
                      <Database className={`w-5 h-5 ${
                        connection.status === 'connected' ? 'text-green-500' : 'text-red-500'
                      }`} />
                      <div>
                        <p className="font-medium">{connection.source}</p>
                        <p className="text-sm text-gray-500">
                          {connection.status === 'connected' 
                            ? `${connection.records.toLocaleString()} records • Last sync: ${connection.lastSync}`
                            : `Disconnected • Last sync: ${connection.lastSync}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(connection.status)}
                      <Button size="sm" variant="outline">
                        {connection.status === 'connected' ? (
                          <RefreshCw className="w-4 h-4" />
                        ) : (
                          <Link className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Most Used Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Most Used Reports</CardTitle>
                <CardDescription>Popular reports in your organization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={mockReports.analytics.mostUsedReports}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="uses" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Report generation efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <p className="text-sm text-gray-600">Average Generation Time</p>
                      <p className="text-xl font-bold">{mockReports.analytics.averageGenerationTime}s</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className="text-xl font-bold">{mockReports.analytics.successRate}%</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <p className="text-sm text-gray-600">User Satisfaction</p>
                      <p className="text-xl font-bold">{mockReports.analytics.userSatisfaction}/5.0</p>
                    </div>
                    <Star className="w-8 h-8 text-amber-500" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <p className="text-sm text-gray-600">Time Saved</p>
                      <p className="text-xl font-bold">{mockReports.analytics.automationSavings}</p>
                    </div>
                    <Zap className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}