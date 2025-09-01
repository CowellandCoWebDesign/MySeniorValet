import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Users, Eye, MessageSquare, Phone,
  Mail, Calendar, Target, Award, BarChart3, PieChart, Activity,
  Download, Upload, Filter, Search, RefreshCw, ChevronUp,
  ChevronDown, MousePointer, Globe, Smartphone, Monitor,
  Share2, DollarSign, UserPlus, Clock, MapPin, Star
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, FunnelChart, Funnel, LabelList } from 'recharts';

interface MarketingAnalyticsProps {
  communityId: number;
}

export function MarketingAnalytics({ communityId }: MarketingAnalyticsProps) {
  const [dateRange, setDateRange] = useState('30');
  const [channelFilter, setChannelFilter] = useState('all');

  // Marketing data query
  const { data: marketingData, isLoading } = useQuery({
    queryKey: ['/api/enterprise/marketing', communityId, dateRange],
  });

  // Mock marketing data - replace with real API data
  const mockMarketing = {
    summary: {
      totalLeads: 342,
      qualifiedLeads: 156,
      tours: 87,
      conversions: 23,
      conversionRate: 6.7,
      avgLeadScore: 72,
      costPerLead: 125,
      roi: 4.2
    },
    leadSources: [
      { source: 'Website', leads: 125, percentage: 37, quality: 82 },
      { source: 'Referrals', leads: 89, percentage: 26, quality: 94 },
      { source: 'Google Ads', leads: 56, percentage: 16, quality: 68 },
      { source: 'Social Media', leads: 38, percentage: 11, quality: 61 },
      { source: 'Direct Mail', leads: 21, percentage: 6, quality: 75 },
      { source: 'Events', leads: 13, percentage: 4, quality: 88 }
    ],
    conversionFunnel: [
      { stage: 'Website Visitors', value: 5420 },
      { stage: 'Lead Captured', value: 342 },
      { stage: 'Qualified Lead', value: 156 },
      { stage: 'Tour Scheduled', value: 87 },
      { stage: 'Tour Completed', value: 62 },
      { stage: 'Move-In', value: 23 }
    ],
    campaignPerformance: [
      { 
        name: 'Summer Special 2025',
        status: 'active',
        channel: 'Multi-channel',
        impressions: 45200,
        clicks: 892,
        leads: 67,
        cost: 3500,
        roi: 5.2
      },
      {
        name: 'Google Search Campaign',
        status: 'active',
        channel: 'PPC',
        impressions: 28500,
        clicks: 456,
        leads: 32,
        cost: 2100,
        roi: 3.8
      },
      {
        name: 'Facebook Retargeting',
        status: 'active',
        channel: 'Social',
        impressions: 15600,
        clicks: 234,
        leads: 18,
        cost: 850,
        roi: 4.1
      },
      {
        name: 'Email Newsletter',
        status: 'completed',
        channel: 'Email',
        impressions: 8900,
        clicks: 567,
        leads: 45,
        cost: 150,
        roi: 12.3
      }
    ],
    leadActivity: {
      recentLeads: [
        { name: 'John Smith', source: 'Website', score: 85, status: 'qualified', time: '2h ago' },
        { name: 'Mary Johnson', source: 'Referral', score: 92, status: 'tour_scheduled', time: '4h ago' },
        { name: 'Robert Chen', source: 'Google Ads', score: 67, status: 'nurturing', time: '6h ago' },
        { name: 'Linda Davis', source: 'Social Media', score: 74, status: 'qualified', time: '8h ago' }
      ],
      todayStats: {
        newLeads: 8,
        toursScheduled: 3,
        followUps: 12,
        conversions: 1
      }
    },
    trafficSources: {
      organic: 42,
      paid: 28,
      social: 18,
      direct: 8,
      referral: 4
    },
    deviceBreakdown: [
      { device: 'Desktop', sessions: 2145, percentage: 45 },
      { device: 'Mobile', sessions: 2098, percentage: 44 },
      { device: 'Tablet', sessions: 523, percentage: 11 }
    ],
    leadTrend: [
      { month: 'Apr', leads: 285, qualified: 120, tours: 68, conversions: 18 },
      { month: 'May', leads: 312, qualified: 135, tours: 74, conversions: 20 },
      { month: 'Jun', leads: 298, qualified: 128, tours: 71, conversions: 19 },
      { month: 'Jul', leads: 325, qualified: 145, tours: 82, conversions: 21 },
      { month: 'Aug', leads: 342, qualified: 156, tours: 87, conversions: 23 }
    ],
    contentPerformance: [
      { title: 'Virtual Tour Page', views: 3420, engagement: 4.2, leads: 45 },
      { title: 'Pricing Calculator', views: 2156, engagement: 6.8, leads: 38 },
      { title: 'Resident Stories', views: 1890, engagement: 3.5, leads: 22 },
      { title: 'Photo Gallery', views: 1654, engagement: 2.9, leads: 18 }
    ]
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500">Paused</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getLeadStatusBadge = (status: string) => {
    switch (status) {
      case 'qualified':
        return <Badge className="bg-green-500">Qualified</Badge>;
      case 'tour_scheduled':
        return <Badge className="bg-purple-500">Tour Scheduled</Badge>;
      case 'nurturing':
        return <Badge className="bg-yellow-500">Nurturing</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Marketing Analytics</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Lead generation, campaign performance, and conversion tracking
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Leads</p>
                <p className="text-2xl font-bold">{mockMarketing.summary.totalLeads}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+12% vs last month</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold">{mockMarketing.summary.conversionRate}%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+0.5% vs last month</span>
                </div>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cost per Lead</p>
                <p className="text-2xl font-bold">${mockMarketing.summary.costPerLead}</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">-8% vs last month</span>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Marketing ROI</p>
                <p className="text-2xl font-bold">{mockMarketing.summary.roi}x</p>
                <Progress value={mockMarketing.summary.roi * 20} className="h-1 mt-2" />
              </div>
              <Award className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Marketing Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Lead Management</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Lead journey from visitor to move-in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockMarketing.conversionFunnel.map((stage, index) => {
                    const percentage = (stage.value / mockMarketing.conversionFunnel[0].value) * 100;
                    return (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{stage.stage}</span>
                          <span className="text-sm font-bold">{stage.value.toLocaleString()}</span>
                        </div>
                        <Progress value={percentage} className="h-3" />
                        <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of total</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Lead Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Where your leads come from</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={mockMarketing.leadSources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ source, percentage }) => `${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="leads"
                    >
                      {mockMarketing.leadSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Lead Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Generation Trend</CardTitle>
              <CardDescription>Monthly lead volume and conversion metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockMarketing.leadTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="leads" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="qualified" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="tours" stackId="3" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="conversions" stackId="4" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Today's Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Activity</CardTitle>
                <CardDescription>Real-time lead activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New Leads</span>
                    <span className="text-xl font-bold text-blue-600">
                      {mockMarketing.leadActivity.todayStats.newLeads}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tours Scheduled</span>
                    <span className="text-xl font-bold text-purple-600">
                      {mockMarketing.leadActivity.todayStats.toursScheduled}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Follow-ups Due</span>
                    <span className="text-xl font-bold text-amber-600">
                      {mockMarketing.leadActivity.todayStats.followUps}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conversions</span>
                    <span className="text-xl font-bold text-green-600">
                      {mockMarketing.leadActivity.todayStats.conversions}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Website visitor acquisition channels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { source: 'Organic', value: mockMarketing.trafficSources.organic },
                    { source: 'Paid', value: mockMarketing.trafficSources.paid },
                    { source: 'Social', value: mockMarketing.trafficSources.social },
                    { source: 'Direct', value: mockMarketing.trafficSources.direct },
                    { source: 'Referral', value: mockMarketing.trafficSources.referral }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
                <CardDescription>How visitors access your site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockMarketing.deviceBreakdown.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {device.device === 'Desktop' ? <Monitor className="w-4 h-4" /> :
                         device.device === 'Mobile' ? <Smartphone className="w-4 h-4" /> :
                         <Monitor className="w-4 h-4" />}
                        <span className="text-sm">{device.device}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold">{device.sessions.toLocaleString()}</span>
                        <Badge variant="outline">{device.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lead Management Tab */}
        <TabsContent value="leads" className="space-y-4">
          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>Latest lead activity and scoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMarketing.leadActivity.recentLeads.map((lead, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                          <span>Source: {lead.source}</span>
                          <span>•</span>
                          <span>{lead.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Lead Score</p>
                        <p className="text-lg font-bold">{lead.score}</p>
                      </div>
                      {getLeadStatusBadge(lead.status)}
                      <Button size="sm">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lead Source Quality */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Source Quality</CardTitle>
              <CardDescription>Average lead score by source</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMarketing.leadSources.map((source, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{source.source}</span>
                      <span className="text-sm">
                        {source.leads} leads • Quality: {source.quality}%
                      </span>
                    </div>
                    <Progress value={source.quality} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>Current marketing campaign performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMarketing.campaignPerformance.map((campaign, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="font-semibold">{campaign.name}</p>
                          {getStatusBadge(campaign.status)}
                          <Badge variant="outline">{campaign.channel}</Badge>
                        </div>
                        <div className="grid grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Impressions</p>
                            <p className="font-semibold">{campaign.impressions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Clicks</p>
                            <p className="font-semibold">{campaign.clicks.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Leads</p>
                            <p className="font-semibold">{campaign.leads}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Cost</p>
                            <p className="font-semibold">${campaign.cost.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">ROI</p>
                            <p className="font-semibold text-green-600">{campaign.roi}x</p>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Manage</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>Top performing website content and pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMarketing.contentPerformance.map((content, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{content.title}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {content.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {content.engagement}m avg time
                        </span>
                        <span className="flex items-center">
                          <UserPlus className="w-3 h-3 mr-1" />
                          {content.leads} leads
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Optimize</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Marketing KPIs</CardTitle>
              <CardDescription>Key performance indicators for marketing effectiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded">
                  <p className="text-3xl font-bold text-blue-600">6.3%</p>
                  <p className="text-sm text-gray-600 mt-1">Website Conversion</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-3xl font-bold text-green-600">72%</p>
                  <p className="text-sm text-gray-600 mt-1">Lead-to-Tour Rate</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-3xl font-bold text-purple-600">26.4%</p>
                  <p className="text-sm text-gray-600 mt-1">Tour-to-Move Rate</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-3xl font-bold text-amber-600">18d</p>
                  <p className="text-sm text-gray-600 mt-1">Avg Sales Cycle</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}