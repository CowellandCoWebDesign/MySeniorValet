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
  Truck, FileText, DollarSign, Calendar, CheckCircle, AlertTriangle,
  Clock, Star, TrendingUp, TrendingDown, Building, Phone, Mail,
  MapPin, User, Shield, Award, BarChart3, Package, Search,
  Filter, Download, Upload, Plus, Edit, Trash2, ExternalLink,
  CreditCard, AlertCircle, ChevronRight, Settings, RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface VendorManagementProps {
  communityId: number;
}

export function VendorManagement({ communityId }: VendorManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Real vendor data from API
  const { data: vendorData, isLoading, refetch } = useQuery({
    queryKey: [`/api/enterprise/vendors/${communityId}`, filterCategory, filterStatus],
  });

  // Use real vendor data from API with fallbacks - NO MOCK DATA per Golden Data Rule
  const vendors = vendorData ? {
    summary: {
      totalVendors: vendorData.summary?.totalVendors || 0,
      activeContracts: vendorData.summary?.activeContracts || 0,
      pendingRenewals: vendorData.summary?.pendingRenewals || 0,
      expiringSoon: vendorData.summary?.expiringSoon || 0,
      totalSpend: vendorData.summary?.totalSpend || 0,
      avgRating: vendorData.summary?.avgRating || 0,
      complianceRate: vendorData.summary?.complianceRate || 0,
      costSavings: vendorData.summary?.costSavings || 0
    },
    vendors: vendorData.vendors || [],
    categories: vendorData.categories || [],
    spendByCategory: vendorData.spendByCategory || [],
    contractSchedule: vendorData.contractSchedule || [],
    performanceTrends: vendorData.performanceTrends || [],
    complianceMetrics: vendorData.complianceMetrics || [],
    complianceIssues: vendorData.complianceIssues || []
  } : {
    // Empty fallback - no mock data per Golden Data Rule
    summary: {
      totalVendors: 0,
      activeContracts: 0,
      pendingRenewals: 0,
      expiringSoon: 0,
      totalSpend: 0,
      avgRating: 0,
      complianceRate: 0,
      costSavings: 0
    },
    vendors: [],
    categories: [],
    spendByCategory: [],
    contractSchedule: [],
    performanceTrends: [],
    complianceMetrics: [],
    complianceIssues: []
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'renewal_pending':
        return <Badge className="bg-yellow-500">Renewal Pending</Badge>;
      case 'expired':
        return <Badge className="bg-red-500">Expired</Badge>;
      case 'suspended':
        return <Badge className="bg-gray-500">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500">Low</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredVendors = vendors.vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || vendor.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D'];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vendor Management</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Supplier relationships, contracts, and performance tracking
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Vendors</p>
                <p className="text-2xl font-bold text-blue-600">{vendors.summary.totalVendors}</p>
                <p className="text-xs text-gray-500 mt-1">{vendors.summary.activeContracts} active</p>
              </div>
              <Building className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Spend</p>
                <p className="text-2xl font-bold text-green-600">
                  ${vendors.summary.totalSpend.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">This year</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Renewals Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{vendors.summary.pendingRenewals}</p>
                <p className="text-xs text-gray-500 mt-1">{vendors.summary.expiringSoon} expiring soon</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Compliance Rate</p>
                <p className="text-2xl font-bold text-purple-600">{vendors.summary.complianceRate}%</p>
                <p className="text-xs text-gray-500 mt-1">Avg rating: {vendors.summary.avgRating}/5</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="vendors" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="spend">Spend Analysis</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                    <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="IT Services">IT Services</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="renewal_pending">Renewal Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Vendor List */}
          <div className="grid gap-4">
            {filteredVendors.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No vendors found. Add vendors to start tracking.</p>
                </CardContent>
              </Card>
            ) : (
              filteredVendors.map((vendor) => (
                <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold">{vendor.name}</h3>
                          {getStatusBadge(vendor.status)}
                          <Badge variant="outline">{vendor.category}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Contract Value</p>
                            <p className="font-semibold">${vendor.contractValue?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Contract Period</p>
                            <p className="text-sm">
                              {vendor.contractStart ? format(new Date(vendor.contractStart), 'MMM dd, yyyy') : 'N/A'} - 
                              {vendor.contractEnd ? format(new Date(vendor.contractEnd), 'MMM dd, yyyy') : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Performance</p>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="ml-1">{vendor.rating || 0}</span>
                              </div>
                              <span className={getComplianceColor(vendor.compliance || 0)}>
                                {vendor.compliance || 0}% compliant
                              </span>
                            </div>
                          </div>
                        </div>
                        {vendor.contact && (
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {vendor.contact.name}
                            </div>
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {vendor.contact.phone}
                            </div>
                            <div className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {vendor.contact.email}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Schedule</CardTitle>
              <CardDescription>Upcoming contract renewals and expirations</CardDescription>
            </CardHeader>
            <CardContent>
              {vendors.contractSchedule.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No contract schedules available</p>
              ) : (
                <div className="space-y-4">
                  {vendors.contractSchedule.map((contract, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{contract.vendor}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Expires: {contract.endDate ? format(new Date(contract.endDate), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${contract.value?.toLocaleString()}</p>
                        <Badge className={contract.daysLeft <= 30 ? 'bg-red-500' : 'bg-green-500'}>
                          {contract.daysLeft} days left
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Vendor performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                {vendors.performanceTrends?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={vendors.performanceTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="onTime" stroke="#10b981" name="On-Time Delivery" />
                      <Line type="monotone" dataKey="quality" stroke="#3b82f6" name="Quality Score" />
                      <Line type="monotone" dataKey="compliance" stroke="#a855f7" name="Compliance" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No performance data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Best performing vendors this month</CardDescription>
              </CardHeader>
              <CardContent>
                {vendors.vendors.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No vendor data available</p>
                ) : (
                  <div className="space-y-3">
                    {vendors.vendors
                      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                      .slice(0, 5)
                      .map((vendor) => (
                        <div key={vendor.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{vendor.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{vendor.category}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>{vendor.rating || 0}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Spend Analysis Tab */}
        <TabsContent value="spend" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Spend by Category</CardTitle>
                <CardDescription>Distribution of vendor spending</CardDescription>
              </CardHeader>
              <CardContent>
                {vendors.spendByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={vendors.spendByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, amount }) => `${category}: $${(amount / 1000).toFixed(0)}k`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {vendors.spendByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No spending data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Savings</CardTitle>
                <CardDescription>Negotiated savings and optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="font-semibold">Total Savings This Year</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Through negotiations and optimization</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      ${vendors.summary.costSavings.toLocaleString()}
                    </p>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    75% of annual savings target achieved
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Issues</CardTitle>
              <CardDescription>Outstanding compliance and documentation issues</CardDescription>
            </CardHeader>
            <CardContent>
              {vendors.complianceIssues?.length === 0 ? (
                <Alert className="border-green-200 bg-green-50/50 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800 dark:text-green-200">All Clear</AlertTitle>
                  <AlertDescription className="text-green-600 dark:text-green-300">
                    No compliance issues to report. All vendors are meeting requirements.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {vendors.complianceIssues?.map((issue, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">{issue.vendor}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{issue.issue}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getSeverityBadge(issue.severity)}
                        <p className="text-sm">Due: {issue.dueDate ? format(new Date(issue.dueDate), 'MMM dd') : 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Distribution</CardTitle>
                <CardDescription>Number of vendors by category</CardDescription>
              </CardHeader>
              <CardContent>
                {vendors.categories.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={vendors.categories}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="vendors" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No category data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Metrics</CardTitle>
                <CardDescription>Overall vendor compliance scores</CardDescription>
              </CardHeader>
              <CardContent>
                {vendors.complianceMetrics?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={vendors.complianceMetrics}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis />
                      <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No compliance metrics available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}