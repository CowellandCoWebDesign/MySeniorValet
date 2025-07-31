import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin, 
  Building, 
  DollarSign,
  Activity,
  Brain,
  Zap,
  Globe,
  Clock,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Search,
  MousePointer,
  Calendar,
  Star,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";

interface AnalyticsData {
  communities: {
    total: number;
    byState: Record<string, number>;
    byCareType: Record<string, number>;
    byPriceRange: Record<string, number>;
    growth: { date: string; count: number }[];
    avgRating: number;
    avgOccupancy: number;
  };
  users: {
    total: number;
    active: number;
    new: number;
    engagement: {
      searches: number;
      views: number;
      saves: number;
      tours: number;
    };
    behavior: {
      avgSessionDuration: number;
      bounceRate: number;
      conversionRate: number;
    };
    peakHours: Record<string, number>;
  };
  financial: {
    revenue: {
      total: number;
      byService: Record<string, number>;
      trend: { date: string; amount: number }[];
    };
    commissions: {
      total: number;
      pending: number;
      paid: number;
    };
  };
  ai: {
    usage: {
      claude: number;
      openai: number;
      perplexity: number;
    };
    costs: {
      claude: number;
      openai: number;
      perplexity: number;
    };
    performance: {
      avgResponseTime: number;
      successRate: number;
    };
  };
}

interface AdvancedAnalyticsProps {
  timeRange?: "24h" | "7d" | "30d" | "90d" | "1y";
  showExport?: boolean;
  autoRefresh?: boolean;
}

export function AdvancedAnalytics({ 
  timeRange = "7d", 
  showExport = true,
  autoRefresh = false 
}: AdvancedAnalyticsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedMetric, setSelectedMetric] = useState("overview");

  // Fetch comprehensive analytics data
  const { data: analytics, isLoading, refetch } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/comprehensive", selectedTimeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/comprehensive?range=${selectedTimeRange}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
    refetchInterval: autoRefresh ? 60000 : false, // Auto-refresh every minute if enabled
  });

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, direction: "neutral" as const };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      direction: change > 0 ? "up" : change < 0 ? "down" : "neutral"
    } as const;
  };

  // Export analytics data
  const handleExport = () => {
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `analytics_${selectedTimeRange}_${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {showExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        )}
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Building className="h-8 w-8 text-blue-600" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Communities
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-blue-700">
                {analytics?.communities.total.toLocaleString() || "0"}
              </p>
              <p className="text-sm text-blue-600">Total Communities</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+12% this month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-green-600" />
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Users
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-green-700">
                {analytics?.users.active.toLocaleString() || "0"}
              </p>
              <p className="text-sm text-green-600">Active Users</p>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">
                  {analytics?.users.new || 0} new today
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Brain className="h-8 w-8 text-purple-600" />
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                AI Usage
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-purple-700">
                {((analytics?.ai.usage.claude || 0) + 
                  (analytics?.ai.usage.openai || 0) + 
                  (analytics?.ai.usage.perplexity || 0)).toLocaleString()}
              </p>
              <p className="text-sm text-purple-600">Total AI Queries</p>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-600">
                  {analytics?.ai.performance.successRate || 0}% success
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                Revenue
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-orange-700">
                ${analytics?.financial.revenue.total.toLocaleString() || "0"}
              </p>
              <p className="text-sm text-orange-600">Total Revenue</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+23% vs last period</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="users">User Behavior</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="ai">AI Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Engagement Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Engagement Funnel</CardTitle>
                <CardDescription>Conversion through the user journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Searches</span>
                      <span className="text-sm font-bold">
                        {analytics?.users.engagement.searches.toLocaleString() || "0"}
                      </span>
                    </div>
                    <Progress value={100} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Community Views</span>
                      <span className="text-sm font-bold">
                        {analytics?.users.engagement.views.toLocaleString() || "0"}
                      </span>
                    </div>
                    <Progress 
                      value={(analytics?.users.engagement.views || 0) / (analytics?.users.engagement.searches || 1) * 100} 
                      className="h-3" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Saved Communities</span>
                      <span className="text-sm font-bold">
                        {analytics?.users.engagement.saves.toLocaleString() || "0"}
                      </span>
                    </div>
                    <Progress 
                      value={(analytics?.users.engagement.saves || 0) / (analytics?.users.engagement.searches || 1) * 100} 
                      className="h-3" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Tours Scheduled</span>
                      <span className="text-sm font-bold">
                        {analytics?.users.engagement.tours.toLocaleString() || "0"}
                      </span>
                    </div>
                    <Progress 
                      value={(analytics?.users.engagement.tours || 0) / (analytics?.users.engagement.searches || 1) * 100} 
                      className="h-3" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Peak Usage Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Peak Usage Hours</CardTitle>
                <CardDescription>Platform activity by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-12 gap-1">
                  {Object.entries(analytics?.users.peakHours || {}).map(([hour, count]) => {
                    const maxCount = Math.max(...Object.values(analytics?.users.peakHours || {}));
                    const percentage = (count / maxCount) * 100;
                    return (
                      <div key={hour} className="flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t"
                          style={{ height: `${percentage}px` }}
                        />
                        <span className="text-xs mt-1">{hour}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Communities Tab */}
        <TabsContent value="communities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution by State */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Geographic Distribution</CardTitle>
                <CardDescription>Communities by state</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics?.communities.byState || {})
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([state, count]) => (
                      <div key={state} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{state}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{count.toLocaleString()}</span>
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${(count / analytics.communities.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Care Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Care Type Distribution</CardTitle>
                <CardDescription>Communities by level of care</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics?.communities.byCareType || {}).map(([type, count]) => {
                    const percentage = (count / analytics.communities.total) * 100;
                    return (
                      <div key={type}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{type}</span>
                          <span className="text-sm text-muted-foreground">
                            {count.toLocaleString()} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Growth Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Community Growth Trend</CardTitle>
              <CardDescription>New communities added over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-2">
                {analytics?.communities.growth.map((point, index) => {
                  const maxCount = Math.max(...analytics.communities.growth.map(p => p.count));
                  const height = (point.count / maxCount) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-green-600 to-emerald-600 rounded-t hover:opacity-80 transition-opacity"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs mt-2 rotate-45 origin-left">
                        {format(new Date(point.date), "MMM d")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Behavior Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Avg Session Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {Math.floor((analytics?.users.behavior.avgSessionDuration || 0) / 60)}m {(analytics?.users.behavior.avgSessionDuration || 0) % 60}s
                </p>
                <p className="text-xs text-muted-foreground mt-1">Per session</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Bounce Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {analytics?.users.behavior.bounceRate?.toFixed(1) || "0"}%
                </p>
                <p className="text-xs text-green-600 mt-1">↓ 5% from last period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {analytics?.users.behavior.conversionRate?.toFixed(1) || "0"}%
                </p>
                <p className="text-xs text-green-600 mt-1">↑ 12% from last period</p>
              </CardContent>
            </Card>
          </div>

          {/* User Activity Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Activity Heatmap</CardTitle>
              <CardDescription>User engagement patterns throughout the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-8 gap-2">
                <div></div>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-center text-xs font-medium">{day}</div>
                ))}
                {Array.from({ length: 24 }, (_, hour) => (
                  <>
                    <div key={`hour-${hour}`} className="text-xs text-right pr-2">
                      {hour.toString().padStart(2, "0")}:00
                    </div>
                    {Array.from({ length: 7 }, (_, day) => {
                      const intensity = Math.random() * 100;
                      return (
                        <div
                          key={`${day}-${hour}`}
                          className="aspect-square rounded"
                          style={{
                            backgroundColor: `hsl(259, 70%, ${95 - intensity * 0.7}%)`,
                          }}
                          title={`${intensity.toFixed(0)} activities`}
                        />
                      );
                    })}
                  </>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Service */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue by Service Type</CardTitle>
                <CardDescription>Breakdown of revenue sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics?.financial.revenue.byService || {}).map(([service, amount]) => (
                    <div key={service}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{service}</span>
                        <span className="text-sm font-bold">${amount.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={(amount / analytics.financial.revenue.total) * 100} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Commission Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Commission Overview</CardTitle>
                <CardDescription>Current commission status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="text-sm text-green-600">Paid Commissions</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${analytics?.financial.commissions.paid.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div>
                      <p className="text-sm text-orange-600">Pending Commissions</p>
                      <p className="text-2xl font-bold text-orange-700">
                        ${analytics?.financial.commissions.pending.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue Trend</CardTitle>
              <CardDescription>Daily revenue over selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-1">
                {analytics?.financial.revenue.trend.map((point, index) => {
                  const maxAmount = Math.max(...analytics.financial.revenue.trend.map(p => p.amount));
                  const height = (point.amount / maxAmount) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-green-600 to-emerald-600 rounded-t hover:opacity-80 transition-opacity"
                        style={{ height: `${height}%` }}
                        title={`$${point.amount.toLocaleString()}`}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Performance Tab */}
        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Usage by Provider */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Provider Usage</CardTitle>
                <CardDescription>Queries by AI service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Claude (Anthropic)</span>
                      <span className="text-sm">{analytics?.ai.usage.claude.toLocaleString() || "0"} queries</span>
                    </div>
                    <Progress 
                      value={(analytics?.ai.usage.claude || 0) / ((analytics?.ai.usage.claude || 0) + (analytics?.ai.usage.openai || 0) + (analytics?.ai.usage.perplexity || 0)) * 100} 
                      className="h-3 bg-purple-100" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">OpenAI (ChatGPT)</span>
                      <span className="text-sm">{analytics?.ai.usage.openai.toLocaleString() || "0"} queries</span>
                    </div>
                    <Progress 
                      value={(analytics?.ai.usage.openai || 0) / ((analytics?.ai.usage.claude || 0) + (analytics?.ai.usage.openai || 0) + (analytics?.ai.usage.perplexity || 0)) * 100} 
                      className="h-3 bg-green-100" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Perplexity AI</span>
                      <span className="text-sm">{analytics?.ai.usage.perplexity.toLocaleString() || "0"} queries</span>
                    </div>
                    <Progress 
                      value={(analytics?.ai.usage.perplexity || 0) / ((analytics?.ai.usage.claude || 0) + (analytics?.ai.usage.openai || 0) + (analytics?.ai.usage.perplexity || 0)) * 100} 
                      className="h-3 bg-blue-100" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Costs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Service Costs</CardTitle>
                <CardDescription>Monthly costs by provider</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-600 rounded-full" />
                      <span className="text-sm">Claude</span>
                    </div>
                    <span className="text-sm font-bold">${analytics?.ai.costs.claude.toFixed(2) || "0"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full" />
                      <span className="text-sm">OpenAI</span>
                    </div>
                    <span className="text-sm font-bold">${analytics?.ai.costs.openai.toFixed(2) || "0"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-600 rounded-full" />
                      <span className="text-sm">Perplexity</span>
                    </div>
                    <span className="text-sm font-bold">${analytics?.ai.costs.perplexity.toFixed(2) || "0"}</span>
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total AI Costs</span>
                      <span className="text-lg font-bold">
                        ${((analytics?.ai.costs.claude || 0) + 
                           (analytics?.ai.costs.openai || 0) + 
                           (analytics?.ai.costs.perplexity || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Performance Metrics</CardTitle>
              <CardDescription>System performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{analytics?.ai.performance.avgResponseTime || 0}ms</p>
                  <p className="text-xs text-muted-foreground">Avg Response Time</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{analytics?.ai.performance.successRate || 0}%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">99.9%</p>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-muted-foreground">Active Providers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}