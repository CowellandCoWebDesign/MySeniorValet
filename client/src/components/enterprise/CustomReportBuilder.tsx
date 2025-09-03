import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import {
  FileText, Download, Calendar, Clock, Filter, Layers,
  BarChart3, LineChart, PieChart, TrendingUp, Database,
  Save, Play, Pause, Trash2, Copy, Share2, Mail, Plus,
  Settings, Eye, Grid, List, CheckCircle, XCircle, AlertCircle,
  Sparkles, Zap, Crown, FileSpreadsheet, FileBarChart, Brain
} from 'lucide-react';

interface CustomReportBuilderProps {
  corporateId: string;
  viewMode?: 'builder' | 'viewer';
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'occupancy' | 'clinical' | 'operational' | 'marketing' | 'compliance';
  icon: React.ElementType;
  metrics: string[];
  filters: string[];
  visualizations: string[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  lastRun?: string;
  nextRun?: string;
  status: 'active' | 'paused' | 'draft';
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'revenue-analysis',
    name: 'Revenue Analysis',
    description: 'Comprehensive revenue tracking across all properties',
    category: 'financial',
    icon: TrendingUp,
    metrics: ['Total Revenue', 'Revenue by Property', 'Revenue by Care Level', 'YoY Growth'],
    filters: ['Date Range', 'Property', 'Region', 'Care Type'],
    visualizations: ['Line Chart', 'Bar Chart', 'Heat Map'],
    frequency: 'monthly',
    status: 'active'
  },
  {
    id: 'occupancy-trends',
    name: 'Occupancy Trends',
    description: 'Track occupancy rates and predict future availability',
    category: 'occupancy',
    icon: BarChart3,
    metrics: ['Occupancy Rate', 'Available Units', 'Move-ins', 'Move-outs'],
    filters: ['Date Range', 'Property', 'Unit Type'],
    visualizations: ['Area Chart', 'Stacked Bar', 'Gauge'],
    frequency: 'weekly',
    status: 'active'
  },
  {
    id: 'care-quality',
    name: 'Care Quality Metrics',
    description: 'Monitor clinical outcomes and quality indicators',
    category: 'clinical',
    icon: LineChart,
    metrics: ['Falls', 'Hospitalizations', 'Medication Errors', 'Satisfaction Scores'],
    filters: ['Date Range', 'Property', 'Care Level'],
    visualizations: ['Line Chart', 'Scatter Plot', 'Control Chart'],
    frequency: 'monthly',
    status: 'draft'
  },
  {
    id: 'staff-performance',
    name: 'Staff Performance',
    description: 'Analyze staffing levels and performance metrics',
    category: 'operational',
    icon: PieChart,
    metrics: ['Staff-to-Resident Ratio', 'Overtime Hours', 'Training Completion', 'Turnover Rate'],
    filters: ['Date Range', 'Property', 'Department'],
    visualizations: ['Pie Chart', 'Bar Chart', 'Table'],
    frequency: 'monthly',
    status: 'active'
  }
];

export default function CustomReportBuilder({ corporateId, viewMode = 'builder' }: CustomReportBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('templates');
  const [isBuilding, setIsBuilding] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    dataSource: 'all',
    metrics: [] as string[],
    dimensions: [] as string[],
    filters: {} as Record<string, any>,
    visualization: 'bar',
    schedule: 'monthly',
    recipients: [] as string[],
    format: 'pdf'
  });

  // Available data points for building custom reports
  const availableMetrics = [
    { category: 'Financial', items: ['Revenue', 'Expenses', 'Profit Margin', 'AR Days', 'Cash Flow'] },
    { category: 'Occupancy', items: ['Occupancy Rate', 'Available Units', 'Pending Move-ins', 'Notice Given'] },
    { category: 'Clinical', items: ['Falls per 1000', 'Hospitalizations', 'Weight Loss', 'Pressure Ulcers'] },
    { category: 'Operational', items: ['Staff Hours', 'Agency Usage', 'Supply Costs', 'Maintenance Requests'] },
    { category: 'Marketing', items: ['Leads', 'Tours', 'Conversion Rate', 'Web Traffic', 'Inquiries'] },
    { category: 'Satisfaction', items: ['Family Satisfaction', 'Resident Satisfaction', 'Staff Satisfaction', 'NPS Score'] }
  ];

  const availableDimensions = [
    'Time Period', 'Property', 'Region', 'Care Level', 'Unit Type', 
    'Department', 'Staff Member', 'Resident', 'Payer Type', 'Age Group'
  ];

  const handleRunReport = async (template: ReportTemplate) => {
    setIsBuilding(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsBuilding(false);
      toast({
        title: 'Report Generated',
        description: `${template.name} has been generated successfully.`,
      });
    }, 3000);
  };

  const handleSaveReport = () => {
    if (!reportConfig.name) {
      toast({
        title: 'Error',
        description: 'Please provide a name for your report.',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Report Saved',
      description: `${reportConfig.name} has been saved to your templates.`,
    });
  };

  const handleScheduleReport = (template: ReportTemplate) => {
    toast({
      title: 'Report Scheduled',
      description: `${template.name} will run ${template.frequency} and be delivered to specified recipients.`,
    });
  };

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    toast({
      title: 'Exporting Report',
      description: `Report is being exported as ${format.toUpperCase()}.`,
    });
  };

  const getCategoryBadge = (category: ReportTemplate['category']) => {
    const colors = {
      financial: 'bg-green-100 text-green-700',
      occupancy: 'bg-blue-100 text-blue-700',
      clinical: 'bg-purple-100 text-purple-700',
      operational: 'bg-orange-100 text-orange-700',
      marketing: 'bg-pink-100 text-pink-700',
      compliance: 'bg-red-100 text-red-700'
    };
    return colors[category];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">Custom Report Builder</h2>
          <p className="text-gray-600">
            Create, schedule, and distribute custom reports tailored to your needs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Grid className="w-4 h-4 mr-2" />
            Gallery View
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Enterprise Alert */}
      <Alert className="border-purple-200 bg-purple-50">
        <Brain className="h-4 w-4 text-purple-600" />
        <AlertDescription>
          <strong>AI-Powered Insights:</strong> Our report builder uses machine learning to suggest optimal metrics, identify trends, and predict future outcomes based on your historical data.
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="templates">
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="builder">
            <Layers className="w-4 h-4 mr-2" />
            Report Builder
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Clock className="w-4 h-4 mr-2" />
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getCategoryBadge(template.category)}>
                        {template.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Metrics */}
                    <div>
                      <p className="text-sm font-medium mb-2">Key Metrics</p>
                      <div className="flex flex-wrap gap-1">
                        {template.metrics.slice(0, 3).map((metric, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {metric}
                          </Badge>
                        ))}
                        {template.metrics.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.metrics.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Schedule Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Runs {template.frequency}</span>
                      </div>
                      {template.status === 'active' ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : template.status === 'paused' ? (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          <Pause className="w-3 h-3 mr-1" />
                          Paused
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700">
                          <FileText className="w-3 h-3 mr-1" />
                          Draft
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRunReport(template)}
                        disabled={isBuilding}
                      >
                        {isBuilding ? (
                          <Clock className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3 mr-1" />
                        )}
                        Run Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleScheduleReport(template)}
                      >
                        <Clock className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Report Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Build Custom Report</CardTitle>
              <CardDescription>Drag and drop metrics to create your perfect report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Basics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportName">Report Name</Label>
                  <Input
                    id="reportName"
                    placeholder="Monthly Executive Summary"
                    value={reportConfig.name}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataSource">Data Source</Label>
                  <Select value={reportConfig.dataSource} onValueChange={(value) => setReportConfig(prev => ({ ...prev, dataSource: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      <SelectItem value="region">By Region</SelectItem>
                      <SelectItem value="property">Single Property</SelectItem>
                      <SelectItem value="custom">Custom Selection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this report shows and who it's for..."
                  value={reportConfig.description}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Metrics Selection */}
              <div className="space-y-2">
                <Label>Select Metrics</Label>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                  {availableMetrics.map((category) => (
                    <div key={category.category} className="mb-4">
                      <p className="font-medium text-sm mb-2">{category.category}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {category.items.map((item) => (
                          <label key={item} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={reportConfig.metrics.includes(item)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setReportConfig(prev => ({
                                    ...prev,
                                    metrics: [...prev.metrics, item]
                                  }));
                                } else {
                                  setReportConfig(prev => ({
                                    ...prev,
                                    metrics: prev.metrics.filter(m => m !== item)
                                  }));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dimensions */}
              <div className="space-y-2">
                <Label>Group By (Dimensions)</Label>
                <div className="flex flex-wrap gap-2">
                  {availableDimensions.map((dimension) => (
                    <Button
                      key={dimension}
                      size="sm"
                      variant={reportConfig.dimensions.includes(dimension) ? "default" : "outline"}
                      onClick={() => {
                        if (reportConfig.dimensions.includes(dimension)) {
                          setReportConfig(prev => ({
                            ...prev,
                            dimensions: prev.dimensions.filter(d => d !== dimension)
                          }));
                        } else {
                          setReportConfig(prev => ({
                            ...prev,
                            dimensions: [...prev.dimensions, dimension]
                          }));
                        }
                      }}
                    >
                      {dimension}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Visualization Type */}
              <div className="space-y-2">
                <Label>Visualization Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant={reportConfig.visualization === 'bar' ? 'default' : 'outline'}
                    onClick={() => setReportConfig(prev => ({ ...prev, visualization: 'bar' }))}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Bar Chart
                  </Button>
                  <Button
                    variant={reportConfig.visualization === 'line' ? 'default' : 'outline'}
                    onClick={() => setReportConfig(prev => ({ ...prev, visualization: 'line' }))}
                  >
                    <LineChart className="w-4 h-4 mr-2" />
                    Line Chart
                  </Button>
                  <Button
                    variant={reportConfig.visualization === 'pie' ? 'default' : 'outline'}
                    onClick={() => setReportConfig(prev => ({ ...prev, visualization: 'pie' }))}
                  >
                    <PieChart className="w-4 h-4 mr-2" />
                    Pie Chart
                  </Button>
                  <Button
                    variant={reportConfig.visualization === 'table' ? 'default' : 'outline'}
                    onClick={() => setReportConfig(prev => ({ ...prev, visualization: 'table' }))}
                  >
                    <Grid className="w-4 h-4 mr-2" />
                    Table
                  </Button>
                </div>
              </div>

              {/* Schedule & Distribution */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <Select value={reportConfig.schedule} onValueChange={(value) => setReportConfig(prev => ({ ...prev, schedule: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="on-demand">On Demand Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={reportConfig.format} onValueChange={(value) => setReportConfig(prev => ({ ...prev, format: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="powerpoint">PowerPoint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  onClick={handleSaveReport}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Report Template
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  Run Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  Based on your selection, consider adding <strong>"Staff Turnover Rate"</strong> - 
                  properties with this metric show 23% better resident satisfaction.
                </AlertDescription>
              </Alert>
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Your peers in similar portfolios typically include <strong>"Revenue per Available Unit"</strong> 
                  in their executive reports for better financial insights.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Manage your automated report delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportTemplates.filter(t => t.status === 'active').map((template) => {
                  const Icon = template.icon;
                  return (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-gray-600">
                            Runs {template.frequency} • Next: Tomorrow at 8:00 AM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Pause className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">247</p>
                  <p className="text-sm text-gray-600 mt-1">Reports Generated This Month</p>
                  <div className="mt-4 text-xs text-green-600 flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>+18% from last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Most Popular</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Revenue Analysis</span>
                    <Badge variant="outline">89 runs</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Occupancy Trends</span>
                    <Badge variant="outline">67 runs</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Staff Performance</span>
                    <Badge variant="outline">45 runs</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Time Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">142 hrs</p>
                  <p className="text-sm text-gray-600 mt-1">Saved Through Automation</p>
                  <div className="mt-4">
                    <Badge className="bg-purple-100 text-purple-700">
                      <Zap className="w-3 h-3 mr-1" />
                      $28,400 Value
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Report Performance Metrics</CardTitle>
              <CardDescription>Monitor report generation and delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">99.8%</p>
                    <p className="text-sm text-gray-600">Delivery Success</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">2.3s</p>
                    <p className="text-sm text-gray-600">Avg Generation Time</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1,247</p>
                    <p className="text-sm text-gray-600">Active Recipients</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">47</p>
                    <p className="text-sm text-gray-600">Custom Templates</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Configuration Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Configure: {selectedTemplate.name}</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedTemplate(null)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recipients */}
              <div className="space-y-2">
                <Label>Email Recipients</Label>
                <Textarea
                  placeholder="Enter email addresses separated by commas..."
                  rows={3}
                />
                <p className="text-xs text-gray-600">
                  Reports will be delivered to these addresses based on the schedule
                </p>
              </div>

              {/* Filters */}
              <div className="space-y-2">
                <Label>Report Filters</Label>
                <div className="space-y-2">
                  {selectedTemplate.filters.map((filter) => (
                    <div key={filter} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{filter}</span>
                      <Select>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div className="space-y-2">
                <Label>Export Settings</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Include raw data</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Add executive summary</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Include AI insights</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  onClick={() => {
                    handleScheduleReport(selectedTemplate);
                    setSelectedTemplate(null);
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}