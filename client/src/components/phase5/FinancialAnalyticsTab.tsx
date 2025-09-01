import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, CreditCard, 
  ShoppingCart, Receipt, AlertCircle, Brain
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function FinancialAnalyticsTab() {
  const [timeRange, setTimeRange] = useState('30d');
  
  // Fetch REAL financial data from database
  const { data: financialMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/financial/metrics', timeRange]
  });
  
  // Fetch revenue trends from database
  const { data: revenueTrends } = useQuery({
    queryKey: ['/api/financial/revenue/trends', timeRange]
  });
  
  // Fetch subscription distribution from database
  const { data: subscriptionData } = useQuery({
    queryKey: ['/api/financial/subscriptions/distribution']
  });
  
  // Fetch payment sources from database
  const { data: paymentSourceData } = useQuery({
    queryKey: ['/api/financial/payment-sources']
  });

  // Use REAL data from database queries
  const revenueData = revenueTrends?.trends || [];
  const tierDistribution = subscriptionData?.tiers || [];
  const paymentSources = paymentSourceData?.sources || [];
  
  // Loading state
  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading real financial data...</p>
        </div>
      </div>
    );
  }
  
  // Default values from REAL data or zeros (NO MOCK DATA)
  const metrics = financialMetrics || {
    revenue: { current: 0, previous: 0, growth: 0, forecast: 0 },
    subscriptions: { mrr: 0, arr: 0, churn: 0, ltv: 0 },
    paymentMetrics: { successRate: 0, failedPayments: 0, pendingAmount: 0, averageTransaction: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Financial Analytics</h3>
          <p className="text-muted-foreground">Comprehensive revenue tracking and forecasting</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.revenue.current.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{metrics.revenue.growth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.subscriptions.mrr.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ARR: ${(metrics.subscriptions.mrr * 12).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payment Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.paymentMetrics.successRate}%</div>
            <Progress value={metrics.paymentMetrics.successRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.subscriptions.churn}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              LTV: ${metrics.subscriptions.ltv.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend with AI Forecast */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Revenue Trend & AI Forecast</CardTitle>
              <CardDescription>Actual revenue vs AI-predicted forecast</CardDescription>
            </div>
            <Badge className="bg-blue-100 text-blue-700">
              <Brain className="h-3 w-3 mr-1" />
              AI Forecast Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value?.toLocaleString()}`} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="actual" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.6}
                name="Actual Revenue"
              />
              <Area 
                type="monotone" 
                dataKey="forecast" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.3}
                strokeDasharray="5 5"
                name="AI Forecast"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Tiers */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Tier</CardTitle>
            <CardDescription>Distribution across pricing tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={tierDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {tierDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Revenue by payment source</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentSources.map((source) => (
                <div key={source.source}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{source.source}</span>
                    <span className="text-sm text-muted-foreground">
                      ${source.amount.toLocaleString()} ({source.percentage}%)
                    </span>
                  </div>
                  <Progress value={source.percentage} className="h-2" />
                </div>
              ))}
            </div>
            
            {/* Payment Issues Alert */}
            <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900 dark:text-yellow-400">
                    {metrics.paymentMetrics.failedPayments} failed payments
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-500">
                    ${metrics.paymentMetrics.pendingAmount.toLocaleString()} pending recovery
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}