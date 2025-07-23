
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users, 
  CreditCard, 
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  Package,
  Zap,
  Star,
  Activity
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueData {
  date: string;
  revenue: number;
  transactions: number;
  newCustomers: number;
  churn: number;
}

interface ServicePerformance {
  serviceName: string;
  revenue: number;
  transactions: number;
  commissionRate: number;
  commissionEarned: number;
  growth: number;
}

interface FinancialMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageTransactionValue: number;
  customerLifetimeValue: number;
  churnRate: number;
  growthRate: number;
  totalCustomers: number;
  activeSubscriptions: number;
  totalCommissions: number;
  topServices: ServicePerformance[];
  revenueData: RevenueData[];
}

const mockFinancialData: FinancialMetrics = {
  totalRevenue: 847293,
  monthlyRecurringRevenue: 156780,
  averageTransactionValue: 195,
  customerLifetimeValue: 2847,
  churnRate: 3.2,
  growthRate: 24.8,
  totalCustomers: 8247,
  activeSubscriptions: 1653,
  totalCommissions: 127842,
  topServices: [
    {
      serviceName: "Professional Moving Services",
      revenue: 185420,
      transactions: 247,
      commissionRate: 10,
      commissionEarned: 18542,
      growth: 34.2
    },
    {
      serviceName: "Medicare Insurance Planning",
      revenue: 127850,
      transactions: 389,
      commissionRate: 12,
      commissionEarned: 15342,
      growth: 28.7
    },
    {
      serviceName: "Estate Sale & Downsizing",
      revenue: 95620,
      transactions: 156,
      commissionRate: 20,
      commissionEarned: 19124,
      growth: 18.9
    },
    {
      serviceName: "Home Healthcare Services",
      revenue: 89340,
      transactions: 203,
      commissionRate: 15,
      commissionEarned: 13401,
      growth: 22.3
    },
    {
      serviceName: "Senior Real Estate Services",
      revenue: 76890,
      transactions: 89,
      commissionRate: 25,
      commissionEarned: 19223,
      growth: 31.5
    }
  ],
  revenueData: [
    { date: "Jan", revenue: 52400, transactions: 268, newCustomers: 145, churn: 12 },
    { date: "Feb", revenue: 61200, transactions: 314, newCustomers: 189, churn: 18 },
    { date: "Mar", revenue: 78900, transactions: 405, newCustomers: 234, churn: 15 },
    { date: "Apr", revenue: 85600, transactions: 439, newCustomers: 267, churn: 22 },
    { date: "May", revenue: 94300, transactions: 483, newCustomers: 298, churn: 19 },
    { date: "Jun", revenue: 108700, transactions: 557, newCustomers: 334, churn: 25 },
    { date: "Jul", revenue: 125400, transactions: 643, newCustomers: 389, churn: 28 },
    { date: "Aug", revenue: 142800, transactions: 732, newCustomers: 445, churn: 31 },
    { date: "Sep", revenue: 156200, transactions: 801, newCustomers: 467, churn: 29 },
    { date: "Oct", revenue: 167900, transactions: 861, newCustomers: 523, churn: 33 },
    { date: "Nov", revenue: 189300, transactions: 971, newCustomers: 578, churn: 35 },
    { date: "Dec", revenue: 198450, transactions: 1018, newCustomers: 612, churn: 38 }
  ]
};

export default function FinancialDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("12m");
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Financial Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Real-time revenue, commissions, and service performance metrics
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(mockFinancialData.totalRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">
                      {formatPercent(mockFinancialData.growthRate)}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Recurring Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(mockFinancialData.monthlyRecurringRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+18.3%</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Commission Earnings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(mockFinancialData.totalCommissions)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+31.7%</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Percent className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer LTV</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(mockFinancialData.customerLifetimeValue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+12.4%</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Revenue Overview</TabsTrigger>
            <TabsTrigger value="services">Service Performance</TabsTrigger>
            <TabsTrigger value="commissions">Commission Tracking</TabsTrigger>
            <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          </TabsList>

          {/* Revenue Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockFinancialData.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Acquisition</CardTitle>
                  <CardDescription>New customers vs churn rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockFinancialData.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="newCustomers" fill="#10B981" name="New Customers" />
                      <Bar dataKey="churn" fill="#EF4444" name="Churned" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>Monthly transaction count and average value</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={mockFinancialData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="transactions" stroke="#3B82F6" strokeWidth={3} name="Transactions" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Performance Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Services</CardTitle>
                <CardDescription>Revenue and commission breakdown by service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockFinancialData.topServices.map((service, index) => (
                    <div key={service.serviceName} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{service.serviceName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {service.transactions} transactions • {service.commissionRate}% commission
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(service.revenue)}
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          Commission: {formatCurrency(service.commissionEarned)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          {formatPercent(service.growth)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commission Tracking Tab */}
          <TabsContent value="commissions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commissions</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(mockFinancialData.totalCommissions)}
                      </p>
                    </div>
                    <Percent className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Commission Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">15.2%</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Commission Growth</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">+31.7%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Commission Breakdown by Partner</CardTitle>
                <CardDescription>Commission earnings from affiliate partnerships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { partner: "Two Men and a Truck", commission: 18542, rate: 10, category: "Moving" },
                    { partner: "Humana / AARP", commission: 15342, rate: 12, category: "Insurance" },
                    { partner: "EstateSales.net", commission: 19124, rate: 20, category: "Estate Sales" },
                    { partner: "Visiting Angels", commission: 13401, rate: 15, category: "Healthcare" },
                    { partner: "Seniors Real Estate Specialists", commission: 19223, rate: 25, category: "Real Estate" }
                  ].map((partner) => (
                    <div key={partner.partner} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{partner.partner}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{partner.category} • {partner.rate}% commission</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(partner.commission)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Customer Acquisition Cost</span>
                    <span className="font-medium">{formatCurrency(127)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Customer Lifetime Value</span>
                    <span className="font-medium">{formatCurrency(mockFinancialData.customerLifetimeValue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Payback Period</span>
                    <span className="font-medium">3.2 months</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</span>
                    <span className="font-medium text-orange-600">{mockFinancialData.churnRate}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Quality</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Recurring Revenue %</span>
                    <span className="font-medium">68.4%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Average Transaction Value</span>
                    <span className="font-medium">{formatCurrency(mockFinancialData.averageTransactionValue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Revenue per Customer</span>
                    <span className="font-medium">{formatCurrency(103)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gross Margin</span>
                    <span className="font-medium text-green-600">87.3%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Predictive Analytics</CardTitle>
                <CardDescription>AI-powered revenue forecasting and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Revenue Forecast</h4>
                      <p className="text-blue-800 dark:text-blue-200 mb-4">
                        Based on current trends, projected revenue for next quarter: <strong>{formatCurrency(284500)}</strong>
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Moving services showing 34% growth momentum
                        </div>
                        <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Recommend expanding real estate partnerships
                        </div>
                        <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
                          <Target className="h-4 w-4 mr-2" />
                          Opportunity to increase avg transaction value by 23%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
