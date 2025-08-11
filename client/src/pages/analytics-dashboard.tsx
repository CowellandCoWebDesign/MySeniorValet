import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, UserCheck, AlertCircle, Target } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsDashboard() {
  // Fetch comprehensive analytics
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/comprehensive'],
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading advanced analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load analytics. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const healthColor = analytics?.summary?.healthScore >= 80 ? 'text-green-500' : 
                     analytics?.summary?.healthScore >= 60 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Comprehensive business intelligence and insights</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            Platform Health Score
          </div>
          <div className={`text-4xl font-bold ${healthColor}`}>
            {analytics?.summary?.healthScore || 0}%
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.behavioralAnalytics?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active: {analytics?.behavioralAnalytics?.activeUsers || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Lifetime Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(analytics?.cohortAnalysis?.averageLifetimeValue || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Trend: {analytics?.cohortAnalysis?.trends?.valueTrend || 'stable'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics?.cohortAnalysis?.overallRetention || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Trend: {analytics?.cohortAnalysis?.trends?.retentionTrend || 'stable'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Forecast</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(analytics?.revenueForecasting?.scenarios?.realistic || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Next 12 months projected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="cohort" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="segmentation">User Segments</TabsTrigger>
          <TabsTrigger value="forecast">Revenue Forecast</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
        </TabsList>

        {/* Cohort Analysis Tab */}
        <TabsContent value="cohort" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Retention Analysis</CardTitle>
              <CardDescription>User retention by signup month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.cohortAnalysis?.cohorts?.slice(0, 6).map((cohort: any) => (
                  <div key={cohort.cohortMonth} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{cohort.cohortMonth}</span>
                      <span className="text-sm text-muted-foreground">
                        {cohort.cohortSize} users
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4, 5, 6].map(month => {
                        const retention = cohort.retentionByMonth[month];
                        const intensity = retention ? retention.retentionRate / 100 : 0;
                        return (
                          <div
                            key={month}
                            className="flex-1 h-8 rounded flex items-center justify-center text-xs"
                            style={{
                              backgroundColor: `rgba(0, 136, 254, ${intensity})`,
                              color: intensity > 0.5 ? 'white' : 'black'
                            }}
                            title={`Month ${month}: ${retention?.retentionRate?.toFixed(1) || 0}%`}
                          >
                            {retention?.retentionRate?.toFixed(0) || 0}%
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Best Performing Cohort</p>
                  <p className="text-2xl font-bold text-green-500">
                    {analytics?.cohortAnalysis?.bestPerformingCohort}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Worst Performing Cohort</p>
                  <p className="text-2xl font-bold text-red-500">
                    {analytics?.cohortAnalysis?.worstPerformingCohort}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Segmentation Tab */}
        <TabsContent value="segmentation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {analytics?.userSegmentation?.segments?.map((segment: any) => (
              <Card key={segment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{segment.name}</CardTitle>
                      <CardDescription>{segment.description}</CardDescription>
                    </div>
                    <Badge variant={segment.characteristics.engagementLevel === 'high' ? 'default' : 'secondary'}>
                      {segment.characteristics.engagementLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">User Count</span>
                      <span className="font-bold">{segment.userCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Searches/Month</span>
                      <span className="font-bold">{segment.characteristics.avgSearchesPerMonth.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Spend/Month</span>
                      <span className="font-bold">${segment.characteristics.avgSpendPerMonth.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Revenue</span>
                      <span className="font-bold text-green-500">
                        ${segment.revenue.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Recommendations:</p>
                      <ul className="text-xs space-y-1">
                        {segment.recommendations.slice(0, 2).map((rec: string, idx: number) => (
                          <li key={idx} className="text-muted-foreground">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Growth Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Growth Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analytics?.userSegmentation?.growthOpportunities?.map((opp: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">{opp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>12-Month Revenue Forecast</CardTitle>
              <CardDescription>Predicted revenue with confidence intervals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.revenueForecasting?.longTerm}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `$${Number(value).toFixed(0)}`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="predictedRevenue" 
                    stroke="#8884d8" 
                    name="Predicted"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="confidenceInterval.upper" 
                    stroke="#82ca9d" 
                    strokeDasharray="5 5"
                    name="Upper Bound"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="confidenceInterval.lower" 
                    stroke="#ff7c7c" 
                    strokeDasharray="5 5"
                    name="Lower Bound"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Scenario Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Optimistic</span>
                      <span className="font-bold text-green-500">
                        ${analytics?.revenueForecasting?.scenarios?.optimistic?.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Realistic</span>
                      <span className="font-bold">
                        ${analytics?.revenueForecasting?.scenarios?.realistic?.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Pessimistic</span>
                      <span className="font-bold text-red-500">
                        ${analytics?.revenueForecasting?.scenarios?.pessimistic?.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Revenue Drivers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.revenueForecasting?.keyDrivers?.map((driver: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          driver.trend === 'positive' ? 'bg-green-500' : 
                          driver.trend === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                        <span className="text-sm">{driver.factor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{driver.contribution}%</span>
                        {driver.trend === 'positive' ? 
                          <TrendingUp className="h-3 w-3 text-green-500" /> :
                          driver.trend === 'negative' ?
                          <TrendingDown className="h-3 w-3 text-red-500" /> :
                          <Activity className="h-3 w-3 text-gray-500" />
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Behavioral Analytics Tab */}
        <TabsContent value="behavioral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>User journey through the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.behavioralAnalytics?.aggregatePatterns?.conversionFunnel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Usage Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Peak Usage Hours</p>
                    <div className="flex gap-2">
                      {analytics?.behavioralAnalytics?.aggregatePatterns?.peakUsageHours?.map((hour: number) => (
                        <Badge key={hour} variant="outline">{hour}:00</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Peak Usage Days</p>
                    <div className="flex gap-2">
                      {analytics?.behavioralAnalytics?.aggregatePatterns?.peakUsageDays?.map((day: string) => (
                        <Badge key={day} variant="outline">{day}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Session Duration</p>
                      <p className="text-xl font-bold">
                        {Math.floor((analytics?.behavioralAnalytics?.aggregatePatterns?.avgSessionDuration || 0) / 60)}m {(analytics?.behavioralAnalytics?.aggregatePatterns?.avgSessionDuration || 0) % 60}s
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Page Views</p>
                      <p className="text-xl font-bold">
                        {analytics?.behavioralAnalytics?.aggregatePatterns?.avgPageViews?.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.behavioralAnalytics?.insights?.map((insight: any, idx: number) => (
                    <div key={idx} className="pb-3 border-b last:border-0">
                      <div className="flex items-start gap-2">
                        <Badge 
                          variant={insight.impact === 'high' ? 'destructive' : 'secondary'}
                          className="mt-0.5"
                        >
                          {insight.impact}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{insight.type}</p>
                          <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                          <p className="text-xs text-blue-500 mt-2">→ {insight.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Actions</CardTitle>
          <CardDescription>Recommended actions based on analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                Top Priorities
              </h4>
              <ul className="space-y-1">
                {analytics?.summary?.topPriorities?.map((priority: string, idx: number) => (
                  <li key={idx} className="text-sm text-muted-foreground">• {priority}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Risk Factors
              </h4>
              <ul className="space-y-1">
                {analytics?.summary?.risks?.length > 0 ? (
                  analytics.summary.risks.map((risk: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground">• {risk}</li>
                  ))
                ) : (
                  <li className="text-sm text-green-500">No significant risks identified</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}