import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DollarSign, TrendingUp, TrendingDown, Receipt, CreditCard,
  FileText, Download, Upload, AlertCircle, CheckCircle,
  Calculator, PieChart, BarChart3, LineChart, Target,
  Wallet, Building, Users, Calendar, Clock, ArrowUpRight,
  ArrowDownRight, Info, Filter, Search, RefreshCw
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { LineChart as RechartsLineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, 
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Area, AreaChart, ComposedChart } from 'recharts';

interface FinancialManagementProps {
  communityId: number;
}

export function FinancialManagement({ communityId }: FinancialManagementProps) {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [filterPayor, setFilterPayor] = useState('all');
  const [searchResident, setSearchResident] = useState('');

  // Financial data query
  const { data: financialData, isLoading, refetch } = useQuery({
    queryKey: ['/api/enterprise/financial', communityId, selectedPeriod],
  });

  // Mock financial data - replace with real API data
  const mockFinancials = {
    summary: {
      totalRevenue: 1425000,
      totalExpenses: 1125000,
      netIncome: 300000,
      profitMargin: 21.1,
      cashFlow: 185000,
      accountsReceivable: 342000,
      daysOutstanding: 28,
      budgetVariance: 3.2
    },
    revenue: {
      monthly: [
        { month: 'Jan', actual: 1380000, budget: 1350000, lastYear: 1290000 },
        { month: 'Feb', actual: 1395000, budget: 1370000, lastYear: 1310000 },
        { month: 'Mar', actual: 1410000, budget: 1390000, lastYear: 1325000 },
        { month: 'Apr', actual: 1418000, budget: 1400000, lastYear: 1340000 },
        { month: 'May', actual: 1422000, budget: 1410000, lastYear: 1355000 },
        { month: 'Jun', actual: 1425000, budget: 1420000, lastYear: 1370000 },
      ],
      byPayor: [
        { name: 'Private Pay', amount: 926250, percentage: 65, residents: 114 },
        { name: 'Medicare', amount: 285000, percentage: 20, residents: 35 },
        { name: 'Medicaid', amount: 142500, percentage: 10, residents: 18 },
        { name: 'Insurance', amount: 71250, percentage: 5, residents: 8 },
      ],
      byCareType: [
        { type: 'Independent Living', revenue: 225000, arpu: 5000 },
        { type: 'Assisted Living', revenue: 637500, arpu: 7500 },
        { type: 'Memory Care', revenue: 360000, arpu: 12000 },
        { type: 'Skilled Nursing', revenue: 202500, arpu: 13500 },
      ]
    },
    expenses: {
      categories: [
        { category: 'Staff Salaries', amount: 675000, percentage: 60, trend: 2.1 },
        { category: 'Operations', amount: 168750, percentage: 15, trend: -1.2 },
        { category: 'Food & Dining', amount: 112500, percentage: 10, trend: 3.5 },
        { category: 'Maintenance', amount: 67500, percentage: 6, trend: 0.8 },
        { category: 'Marketing', amount: 45000, percentage: 4, trend: -2.3 },
        { category: 'Admin', amount: 33750, percentage: 3, trend: 0.5 },
        { category: 'Other', amount: 22500, percentage: 2, trend: 1.1 },
      ],
      trending: [
        { month: 'Jan', labor: 650000, operations: 475000 },
        { month: 'Feb', labor: 655000, operations: 480000 },
        { month: 'Mar', labor: 660000, operations: 485000 },
        { month: 'Apr', labor: 665000, operations: 488000 },
        { month: 'May', labor: 670000, operations: 490000 },
        { month: 'Jun', labor: 675000, operations: 492000 },
      ]
    },
    billing: {
      outstanding: [
        { aging: '0-30 days', amount: 185000, count: 92 },
        { aging: '31-60 days', amount: 87000, count: 38 },
        { aging: '61-90 days', amount: 45000, count: 18 },
        { aging: '90+ days', amount: 25000, count: 8 },
      ],
      collections: {
        rate: 97.8,
        monthlyTarget: 98.5,
        avgDaysToCollect: 28,
        denials: 2.3,
        appeals: 0.8
      }
    },
    forecast: {
      quarterly: [
        { quarter: 'Q3 2025', revenue: 4350000, expenses: 3450000, profit: 900000 },
        { quarter: 'Q4 2025', revenue: 4425000, expenses: 3500000, profit: 925000 },
        { quarter: 'Q1 2026', revenue: 4500000, expenses: 3550000, profit: 950000 },
      ],
      annual: {
        projectedRevenue: 17400000,
        projectedExpenses: 13800000,
        projectedProfit: 3600000,
        projectedMargin: 20.7
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getVarianceColor = (variance: number) => {
    if (Math.abs(variance) <= 2) return 'text-green-600';
    if (Math.abs(variance) <= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Process payment mutation
  const processPayment = useMutation({
    mutationFn: async (paymentData: any) => {
      return apiRequest('POST', `/api/enterprise/financial/process-payment`, paymentData);
    },
    onSuccess: () => {
      toast({
        title: "Payment processed",
        description: "The payment has been successfully recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/financial'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Management</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive revenue tracking, expense management, and financial forecasting
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="quarter">Current Quarter</SelectItem>
              <SelectItem value="year">Year to Date</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(mockFinancials.summary.totalRevenue)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+5.7%</span>
                  <span className="text-xs text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Net Income</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(mockFinancials.summary.netIncome)}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm">Margin: </span>
                  <span className="text-sm font-bold ml-1">{formatPercentage(mockFinancials.summary.profitMargin)}</span>
                </div>
              </div>
              <Wallet className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cash Flow</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(mockFinancials.summary.cashFlow)}</p>
                <div className="flex items-center mt-2">
                  <Clock className="w-4 h-4 text-gray-500 mr-1" />
                  <span className="text-sm">DSO: {mockFinancials.summary.daysOutstanding} days</span>
                </div>
              </div>
              <Receipt className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Budget Variance</p>
                <p className={`text-2xl font-bold mt-1 ${getVarianceColor(mockFinancials.summary.budgetVariance)}`}>
                  +{formatPercentage(mockFinancials.summary.budgetVariance)}
                </p>
                <div className="mt-2">
                  <Progress value={103.2} className="h-2" />
                </div>
              </div>
              <Target className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Financial Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Actual vs Budget vs Last Year</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={mockFinancials.revenue.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="actual" fill="#6366f1" />
                    <Line type="monotone" dataKey="budget" stroke="#ef4444" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="lastYear" stroke="#10b981" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue by Payor */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Payor Source</CardTitle>
                <CardDescription>Current month distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={mockFinancials.revenue.byPayor}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {mockFinancials.revenue.byPayor.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'][index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Care Type */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Care Type</CardTitle>
              <CardDescription>Average revenue per unit (ARPU) analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {mockFinancials.revenue.byCareType.map((care) => (
                  <div key={care.type} className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{care.type}</p>
                    <p className="text-xl font-bold mt-2">{formatCurrency(care.revenue)}</p>
                    <div className="mt-2 pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">ARPU</span>
                        <span className="text-sm font-semibold">{formatCurrency(care.arpu)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payor Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payor Source Details</CardTitle>
              <CardDescription>Detailed breakdown by payment source</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockFinancials.revenue.byPayor.map((payor) => (
                  <div key={payor.name} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{payor.name}</p>
                        <p className="text-sm text-gray-500">{payor.residents} residents</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(payor.amount)}</p>
                      <p className="text-sm text-gray-500">{payor.percentage}% of total</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Expense Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>Current month breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockFinancials.expenses.categories.map((category) => (
                    <div key={category.category}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{category.category}</span>
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(category.trend)}
                          <span className="font-bold">{formatCurrency(category.amount)}</span>
                        </div>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{category.percentage}% of total</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expense Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Trends</CardTitle>
                <CardDescription>Labor vs Operations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockFinancials.expenses.trending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Area type="monotone" dataKey="labor" stackId="1" stroke="#6366f1" fill="#6366f1" />
                    <Area type="monotone" dataKey="operations" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Cost Control Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Control Alerts</CardTitle>
              <CardDescription>Areas requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Labor Costs Rising</AlertTitle>
                  <AlertDescription>
                    Overtime expenses up 12% this month. Consider scheduling optimization.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Food Cost Opportunity</AlertTitle>
                  <AlertDescription>
                    Vendor contract renewal due. Potential 8% savings available.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Utilities Reduced</AlertTitle>
                  <AlertDescription>
                    Energy efficiency improvements saved $3,200 this month.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Accounts Receivable Aging */}
            <Card>
              <CardHeader>
                <CardTitle>Accounts Receivable Aging</CardTitle>
                <CardDescription>Outstanding balances by age</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockFinancials.billing.outstanding}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="aging" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="amount" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-sm font-medium">Total Outstanding</p>
                  <p className="text-2xl font-bold">{formatCurrency(mockFinancials.summary.accountsReceivable)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Collections Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Collections Performance</CardTitle>
                <CardDescription>Key billing metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Collection Rate</span>
                      <span className="text-sm font-bold">{mockFinancials.billing.collections.rate}%</span>
                    </div>
                    <Progress value={mockFinancials.billing.collections.rate} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">Target: {mockFinancials.billing.collections.monthlyTarget}%</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded">
                      <p className="text-sm text-gray-600">Avg Days to Collect</p>
                      <p className="text-xl font-bold">{mockFinancials.billing.collections.avgDaysToCollect}</p>
                    </div>
                    <div className="p-3 border rounded">
                      <p className="text-sm text-gray-600">Denial Rate</p>
                      <p className="text-xl font-bold">{mockFinancials.billing.collections.denials}%</p>
                    </div>
                  </div>

                  <Button className="w-full">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Process Payments
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Processing */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Payment Entry</CardTitle>
              <CardDescription>Record resident payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Resident</Label>
                  <Input placeholder="Search resident..." value={searchResident} onChange={(e) => setSearchResident(e.target.value)} />
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="card">Credit Card</SelectItem>
                      <SelectItem value="ach">ACH Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full">Record Payment</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Quarterly Forecast */}
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Forecast</CardTitle>
                <CardDescription>Next 3 quarters projection</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockFinancials.forecast.quarterly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#6366f1" />
                    <Bar dataKey="expenses" fill="#ef4444" />
                    <Bar dataKey="profit" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Annual Projections */}
            <Card>
              <CardHeader>
                <CardTitle>Annual Projections</CardTitle>
                <CardDescription>Full year financial forecast</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Projected Revenue</span>
                      <span className="text-xl font-bold">{formatCurrency(mockFinancials.forecast.annual.projectedRevenue)}</span>
                    </div>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Projected Expenses</span>
                      <span className="text-xl font-bold text-red-600">{formatCurrency(mockFinancials.forecast.annual.projectedExpenses)}</span>
                    </div>
                  </div>
                  <div className="p-4 border rounded bg-green-50 dark:bg-green-900/20">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Projected Profit</span>
                      <span className="text-xl font-bold text-green-600">{formatCurrency(mockFinancials.forecast.annual.projectedProfit)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-600">Profit Margin</span>
                      <span className="text-sm font-semibold">{formatPercentage(mockFinancials.forecast.annual.projectedMargin)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Scenarios */}
          <Card>
            <CardHeader>
              <CardTitle>Scenario Planning</CardTitle>
              <CardDescription>Financial impact analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-2">Best Case (+10% Occupancy)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Additional Revenue</span>
                      <span className="font-medium text-green-600">+{formatCurrency(180000)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Net Impact</span>
                      <span className="font-medium text-green-600">+{formatCurrency(144000)}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-2">Base Case (Current)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Projected Revenue</span>
                      <span className="font-medium">{formatCurrency(1425000)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Net Income</span>
                      <span className="font-medium">{formatCurrency(300000)}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-2">Worst Case (-5% Occupancy)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Revenue Loss</span>
                      <span className="font-medium text-red-600">-{formatCurrency(90000)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Net Impact</span>
                      <span className="font-medium text-red-600">-{formatCurrency(72000)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate and download financial statements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="font-medium">Income Statement</p>
                      <p className="text-sm text-gray-500">P&L for selected period</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    <Download className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
                <div className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="font-medium">Balance Sheet</p>
                      <p className="text-sm text-gray-500">Assets & liabilities</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    <Download className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
                <div className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <LineChart className="w-8 h-8 text-purple-500" />
                    <div>
                      <p className="font-medium">Cash Flow</p>
                      <p className="text-sm text-gray-500">Cash position analysis</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    <Download className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
                <div className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Calculator className="w-8 h-8 text-amber-500" />
                    <div>
                      <p className="font-medium">Budget Variance</p>
                      <p className="text-sm text-gray-500">Actual vs budget</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    <Download className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
                <div className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Users className="w-8 h-8 text-pink-500" />
                    <div>
                      <p className="font-medium">Resident Billing</p>
                      <p className="text-sm text-gray-500">Individual statements</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    <Download className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
                <div className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <PieChart className="w-8 h-8 text-indigo-500" />
                    <div>
                      <p className="font-medium">Custom Report</p>
                      <p className="text-sm text-gray-500">Build your own</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    <Upload className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}