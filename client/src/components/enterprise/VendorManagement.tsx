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

  // Vendor data query
  const { data: vendorData, isLoading } = useQuery({
    queryKey: ['/api/enterprise/vendors', communityId],
  });

  // Mock vendor data - replace with real API data
  const mockVendors = {
    summary: {
      totalVendors: 47,
      activeContracts: 38,
      pendingRenewals: 5,
      expiringSoon: 3,
      totalSpend: 892500,
      avgRating: 4.6,
      complianceRate: 94.2,
      costSavings: 125000
    },
    vendors: [
      {
        id: 'V001',
        name: 'MediSupply Pro',
        category: 'Medical Supplies',
        status: 'active',
        contractValue: 125000,
        contractStart: '2024-01-01',
        contractEnd: '2025-12-31',
        rating: 4.8,
        compliance: 98,
        contact: {
          name: 'Sarah Johnson',
          phone: '555-0123',
          email: 'sarah@medisupply.com'
        },
        performance: {
          onTimeDelivery: 96,
          qualityScore: 95,
          responseTime: 2.4,
          issuesResolved: 42
        },
        insurance: {
          liability: true,
          workersComp: true,
          expires: '2026-01-15'
        },
        lastOrder: '2025-08-25',
        totalOrders: 156,
        spend: 89500
      },
      {
        id: 'V002',
        name: 'CleanCare Services',
        category: 'Housekeeping',
        status: 'active',
        contractValue: 85000,
        contractStart: '2024-06-01',
        contractEnd: '2025-05-31',
        rating: 4.5,
        compliance: 92,
        contact: {
          name: 'Mike Wilson',
          phone: '555-0124',
          email: 'mike@cleancare.com'
        },
        performance: {
          onTimeDelivery: 94,
          qualityScore: 90,
          responseTime: 1.8,
          issuesResolved: 28
        },
        insurance: {
          liability: true,
          workersComp: true,
          expires: '2025-11-30'
        },
        lastOrder: '2025-08-28',
        totalOrders: 365,
        spend: 72000
      },
      {
        id: 'V003',
        name: 'FoodService Plus',
        category: 'Food & Beverage',
        status: 'renewal_pending',
        contractValue: 220000,
        contractStart: '2023-09-01',
        contractEnd: '2025-08-31',
        rating: 4.7,
        compliance: 96,
        contact: {
          name: 'Lisa Chen',
          phone: '555-0125',
          email: 'lisa@foodserviceplus.com'
        },
        performance: {
          onTimeDelivery: 98,
          qualityScore: 94,
          responseTime: 1.2,
          issuesResolved: 15
        },
        insurance: {
          liability: true,
          workersComp: true,
          expires: '2025-09-15'
        },
        lastOrder: '2025-08-29',
        totalOrders: 730,
        spend: 195000
      },
      {
        id: 'V004',
        name: 'TechCare Solutions',
        category: 'IT Services',
        status: 'active',
        contractValue: 65000,
        contractStart: '2025-01-01',
        contractEnd: '2025-12-31',
        rating: 4.9,
        compliance: 100,
        contact: {
          name: 'David Park',
          phone: '555-0126',
          email: 'david@techcare.com'
        },
        performance: {
          onTimeDelivery: 99,
          qualityScore: 98,
          responseTime: 0.5,
          issuesResolved: 89
        },
        insurance: {
          liability: true,
          workersComp: true,
          expires: '2026-02-28'
        },
        lastOrder: '2025-08-27',
        totalOrders: 48,
        spend: 42000
      }
    ],
    categories: [
      { name: 'Medical Supplies', vendors: 8, spend: 245000, percentage: 27 },
      { name: 'Food & Beverage', vendors: 5, spend: 220000, percentage: 25 },
      { name: 'Housekeeping', vendors: 6, spend: 142000, percentage: 16 },
      { name: 'Maintenance', vendors: 7, spend: 98000, percentage: 11 },
      { name: 'IT Services', vendors: 4, spend: 87000, percentage: 10 },
      { name: 'Professional Services', vendors: 9, spend: 65000, percentage: 7 },
      { name: 'Other', vendors: 8, spend: 35500, percentage: 4 }
    ],
    spendTrend: [
      { month: 'Apr', actual: 142000, budget: 150000 },
      { month: 'May', actual: 138000, budget: 150000 },
      { month: 'Jun', actual: 145000, budget: 150000 },
      { month: 'Jul', actual: 152000, budget: 150000 },
      { month: 'Aug', actual: 148000, budget: 150000 }
    ],
    performanceMetrics: [
      { metric: 'On-Time Delivery', score: 95 },
      { metric: 'Quality', score: 92 },
      { metric: 'Communication', score: 88 },
      { metric: 'Compliance', score: 94 },
      { metric: 'Value', score: 86 },
      { metric: 'Innovation', score: 78 }
    ],
    upcomingRenewals: [
      { vendor: 'FoodService Plus', endDate: '2025-08-31', value: 220000, daysLeft: 2 },
      { vendor: 'Security Systems Inc', endDate: '2025-09-15', value: 45000, daysLeft: 15 },
      { vendor: 'Landscaping Pro', endDate: '2025-09-30', value: 35000, daysLeft: 30 },
      { vendor: 'Pharmacy Direct', endDate: '2025-10-15', value: 155000, daysLeft: 45 },
      { vendor: 'Laundry Services', endDate: '2025-10-31', value: 68000, daysLeft: 61 }
    ],
    complianceIssues: [
      { vendor: 'Transport Services', issue: 'Insurance expiring', severity: 'high', dueDate: '2025-09-05' },
      { vendor: 'Equipment Rental', issue: 'Missing W-9 form', severity: 'medium', dueDate: '2025-09-10' },
      { vendor: 'Consulting Group', issue: 'Contract review needed', severity: 'low', dueDate: '2025-09-20' }
    ]
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

  const filteredVendors = mockVendors.vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || vendor.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vendor Management</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Contracts, performance tracking, and supplier relationships
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Vendors</p>
                <p className="text-2xl font-bold">{mockVendors.summary.activeContracts}</p>
                <p className="text-xs text-gray-500 mt-1">of {mockVendors.summary.totalVendors} total</p>
              </div>
              <Building className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Spend</p>
                <p className="text-2xl font-bold">${(mockVendors.summary.totalSpend / 12).toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">-5% vs last month</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Renewals</p>
                <p className="text-2xl font-bold text-yellow-600">{mockVendors.summary.pendingRenewals}</p>
                <p className="text-xs text-gray-500 mt-1">{mockVendors.summary.expiringSoon} expiring soon</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Compliance Rate</p>
                <p className="text-2xl font-bold">{mockVendors.summary.complianceRate}%</p>
                <Progress value={mockVendors.summary.complianceRate} className="h-1 mt-2" />
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Management Tabs */}
      <Tabs defaultValue="vendors" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="spending">Spending</TabsTrigger>
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                    <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="IT Services">IT Services</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="renewal_pending">Renewal Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Vendor List */}
          <div className="space-y-4">
            {filteredVendors.map((vendor) => (
              <Card key={vendor.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <Truck className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold text-lg">{vendor.name}</p>
                          {getStatusBadge(vendor.status)}
                          <Badge variant="outline">{vendor.category}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-gray-500">Contract Value</p>
                            <p className="font-semibold">${vendor.contractValue.toLocaleString()}/year</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Rating</p>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <span className="font-semibold">{vendor.rating}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500">Compliance</p>
                            <p className={`font-semibold ${getComplianceColor(vendor.compliance)}`}>
                              {vendor.compliance}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Last Order</p>
                            <p className="font-semibold">{format(new Date(vendor.lastOrder), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {vendor.contact.name}
                          </span>
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {vendor.contact.phone}
                          </span>
                          <span className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {vendor.contact.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button size="sm">View Details</Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          {/* Contract Renewals Alert */}
          <Alert className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Contract Renewals Required</AlertTitle>
            <AlertDescription>
              {mockVendors.summary.pendingRenewals} contracts need renewal within the next 60 days
            </AlertDescription>
          </Alert>

          {/* Upcoming Renewals */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Contract Renewals</CardTitle>
              <CardDescription>Contracts expiring in the next 90 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockVendors.upcomingRenewals.map((renewal, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        renewal.daysLeft <= 7 ? 'bg-red-100 dark:bg-red-900/30' :
                        renewal.daysLeft <= 30 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold">{renewal.vendor}</p>
                        <p className="text-sm text-gray-500">
                          Expires: {format(new Date(renewal.endDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold">${renewal.value.toLocaleString()}</p>
                        <Badge variant={renewal.daysLeft <= 7 ? 'destructive' : 'outline'}>
                          {renewal.daysLeft} days left
                        </Badge>
                      </div>
                      <Button size="sm">Renew</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contract Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Contract Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Active</span>
                    <span className="font-bold">{mockVendors.summary.activeContracts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Renewal</span>
                    <span className="font-bold text-yellow-600">{mockVendors.summary.pendingRenewals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expiring Soon</span>
                    <span className="font-bold text-red-600">{mockVendors.summary.expiringSoon}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Contract Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">${mockVendors.summary.totalSpend.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-2">Annual contracted spend</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  ${mockVendors.summary.costSavings.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-2">Negotiated savings this year</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Vendor Performance Overview</CardTitle>
                <CardDescription>Average scores across all vendors</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={mockVendors.performanceMetrics}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Vendors</CardTitle>
                <CardDescription>Based on overall performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockVendors.vendors
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 5)
                    .map((vendor, index) => (
                      <div key={vendor.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{vendor.name}</p>
                            <p className="text-sm text-gray-500">{vendor.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-bold">{vendor.rating}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics by Vendor */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
              <CardDescription>Individual vendor performance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Vendor</th>
                      <th className="text-center p-2">On-Time Delivery</th>
                      <th className="text-center p-2">Quality Score</th>
                      <th className="text-center p-2">Response Time</th>
                      <th className="text-center p-2">Issues Resolved</th>
                      <th className="text-center p-2">Overall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockVendors.vendors.map((vendor) => (
                      <tr key={vendor.id} className="border-b">
                        <td className="p-2">
                          <p className="font-medium">{vendor.name}</p>
                          <p className="text-sm text-gray-500">{vendor.category}</p>
                        </td>
                        <td className="text-center p-2">
                          <Badge className={vendor.performance.onTimeDelivery >= 95 ? 'bg-green-500' : 'bg-yellow-500'}>
                            {vendor.performance.onTimeDelivery}%
                          </Badge>
                        </td>
                        <td className="text-center p-2">
                          <Badge className={vendor.performance.qualityScore >= 90 ? 'bg-green-500' : 'bg-yellow-500'}>
                            {vendor.performance.qualityScore}%
                          </Badge>
                        </td>
                        <td className="text-center p-2">{vendor.performance.responseTime}h</td>
                        <td className="text-center p-2">{vendor.performance.issuesResolved}</td>
                        <td className="text-center p-2">
                          <div className="flex items-center justify-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="font-bold">{vendor.rating}</span>
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

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          {/* Compliance Issues */}
          {mockVendors.complianceIssues.length > 0 && (
            <Alert className="border-red-200 bg-red-50/50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Compliance Issues Require Attention</AlertTitle>
              <AlertDescription>
                {mockVendors.complianceIssues.length} vendors have pending compliance issues
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Compliance Issues</CardTitle>
              <CardDescription>Outstanding compliance requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockVendors.complianceIssues.map((issue, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className={`w-5 h-5 ${
                        issue.severity === 'high' ? 'text-red-500' :
                        issue.severity === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <div>
                        <p className="font-semibold">{issue.vendor}</p>
                        <p className="text-sm text-gray-500">{issue.issue}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getSeverityBadge(issue.severity)}
                      <span className="text-sm text-gray-500">
                        Due: {format(new Date(issue.dueDate), 'MMM d')}
                      </span>
                      <Button size="sm">Resolve</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insurance Status */}
          <Card>
            <CardHeader>
              <CardTitle>Insurance & Certifications</CardTitle>
              <CardDescription>Vendor insurance and certification status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockVendors.vendors.map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-semibold">{vendor.name}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm">
                        <span className="flex items-center">
                          {vendor.insurance.liability ? (
                            <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-red-500 mr-1" />
                          )}
                          General Liability
                        </span>
                        <span className="flex items-center">
                          {vendor.insurance.workersComp ? (
                            <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-red-500 mr-1" />
                          )}
                          Workers Comp
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Expires</p>
                      <p className="font-semibold">{format(new Date(vendor.insurance.expires), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spending Tab */}
        <TabsContent value="spending" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Spend by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Spend by Category</CardTitle>
                <CardDescription>Annual vendor spend distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={mockVendors.categories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="spend"
                    >
                      {mockVendors.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#94a3b8'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Spend Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spend Trend</CardTitle>
                <CardDescription>Actual vs budgeted vendor spend</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={mockVendors.spendTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="budget" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="actual" stackId="2" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Spend Vendors */}
          <Card>
            <CardHeader>
              <CardTitle>Top Vendors by Spend</CardTitle>
              <CardDescription>Highest spending vendor relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockVendors.vendors
                  .sort((a, b) => b.spend - a.spend)
                  .map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Package className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{vendor.name}</p>
                          <p className="text-sm text-gray-500">{vendor.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${vendor.spend.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{vendor.totalOrders} orders</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{mockVendors.summary.avgRating}</p>
                  <p className="text-sm text-gray-600 mt-1">Avg Vendor Rating</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">94%</p>
                  <p className="text-sm text-gray-600 mt-1">On-Time Delivery</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">2.1h</p>
                  <p className="text-sm text-gray-600 mt-1">Avg Response Time</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-600">14%</p>
                  <p className="text-sm text-gray-600 mt-1">Cost Reduction YoY</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vendor Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Category Comparison</CardTitle>
              <CardDescription>Performance metrics by vendor category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockVendors.categories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="vendors" fill="#6366f1" name="Number of Vendors" />
                  <Bar dataKey="percentage" fill="#8b5cf6" name="Spend %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}