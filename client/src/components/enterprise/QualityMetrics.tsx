import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Star, TrendingUp, TrendingDown, Users, Heart, Award, ThumbsUp,
  AlertTriangle, CheckCircle, XCircle, MessageSquare, Activity,
  BarChart3, PieChart, Target, Shield, Clock, Calendar, Filter,
  Download, RefreshCw, ChevronUp, ChevronDown, Smile, Frown,
  AlertCircle, Trophy, Sparkles, FileText, Search
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface QualityMetricsProps {
  communityId: number;
}

export function QualityMetrics({ communityId }: QualityMetricsProps) {
  const [timeRange, setTimeRange] = useState('30');
  const [filterDepartment, setFilterDepartment] = useState('all');

  // Quality data query
  const { data: qualityData, isLoading } = useQuery({
    queryKey: ['/api/enterprise/quality-metrics', communityId, timeRange],
  });

  // Mock quality metrics data - replace with real API data
  const mockQuality = {
    summary: {
      overallScore: 4.6,
      residentSatisfaction: 92,
      familySatisfaction: 88,
      staffSatisfaction: 85,
      clinicalQuality: 94,
      safetyScore: 96,
      deficiencyFree: true,
      stateRanking: 3,
      nationalPercentile: 89
    },
    satisfactionScores: {
      current: [
        { category: 'Care Quality', score: 93, change: 2 },
        { category: 'Staff Responsiveness', score: 91, change: -1 },
        { category: 'Dining Services', score: 87, change: 3 },
        { category: 'Activities', score: 89, change: 1 },
        { category: 'Environment', score: 94, change: 0 },
        { category: 'Communication', score: 85, change: 4 },
        { category: 'Value', score: 82, change: -2 },
        { category: 'Safety', score: 96, change: 1 }
      ],
      trend: [
        { month: 'Apr', resident: 88, family: 85, staff: 82 },
        { month: 'May', resident: 89, family: 86, staff: 83 },
        { month: 'Jun', resident: 90, family: 87, staff: 84 },
        { month: 'Jul', resident: 91, family: 87, staff: 85 },
        { month: 'Aug', resident: 92, family: 88, staff: 85 }
      ]
    },
    qualityIndicators: {
      clinical: [
        { indicator: 'Falls with Injury', rate: 1.2, target: 2.0, status: 'excellent' },
        { indicator: 'Pressure Ulcers', rate: 0.8, target: 1.5, status: 'excellent' },
        { indicator: 'Medication Errors', rate: 0.3, target: 1.0, status: 'excellent' },
        { indicator: 'Hospital Readmissions', rate: 12.5, target: 15.0, status: 'good' },
        { indicator: 'UTI Rate', rate: 2.1, target: 3.0, status: 'good' },
        { indicator: 'Weight Loss', rate: 4.2, target: 5.0, status: 'good' }
      ],
      operational: [
        { indicator: 'Occupancy Rate', value: 94.5, target: 95, unit: '%' },
        { indicator: 'Staff Turnover', value: 18.2, target: 20, unit: '%' },
        { indicator: 'Overtime Hours', value: 8.5, target: 10, unit: '%' },
        { indicator: 'Incident Reports', value: 12, target: 15, unit: '/month' }
      ]
    },
    surveyResults: {
      responses: 145,
      responseRate: 72,
      nps: 68,
      recommendations: [
        { area: 'Increase activity variety', votes: 42, priority: 'high' },
        { area: 'Improve meal options', votes: 38, priority: 'medium' },
        { area: 'More family events', votes: 31, priority: 'medium' },
        { area: 'Better communication', votes: 28, priority: 'low' }
      ],
      verbatim: [
        { 
          comment: "The care my mother receives is exceptional. The staff treats her like family.",
          sentiment: 'positive',
          author: 'Family Member',
          date: '2025-08-28'
        },
        {
          comment: "Would love to see more variety in the dining menu options.",
          sentiment: 'neutral',
          author: 'Resident',
          date: '2025-08-27'
        },
        {
          comment: "The activities program has really improved. My dad is much more engaged.",
          sentiment: 'positive',
          author: 'Family Member',
          date: '2025-08-26'
        }
      ]
    },
    departmentScores: [
      { department: 'Nursing', score: 94, surveys: 145 },
      { department: 'Dining', score: 87, surveys: 142 },
      { department: 'Activities', score: 89, surveys: 138 },
      { department: 'Housekeeping', score: 91, surveys: 140 },
      { department: 'Maintenance', score: 88, surveys: 125 },
      { department: 'Administration', score: 85, surveys: 130 }
    ],
    benchmarks: {
      industry: [
        { metric: 'Resident Satisfaction', community: 92, industry: 85, top10: 94 },
        { metric: 'Clinical Quality', community: 94, industry: 88, top10: 96 },
        { metric: 'Staff Satisfaction', community: 85, industry: 78, top10: 90 },
        { metric: 'Safety Score', community: 96, industry: 91, top10: 98 }
      ]
    },
    awards: [
      { title: 'Best Practices Award', organization: 'AHCA', year: 2025 },
      { title: 'Five Star Rating', organization: 'CMS', year: 2025 },
      { title: 'Excellence in Care', organization: 'State Health Dept', year: 2024 }
    ],
    improvements: {
      implemented: [
        { action: 'Added evening activities program', impact: '+3% satisfaction', date: '2025-07-15' },
        { action: 'Upgraded dining menu', impact: '+5% dining score', date: '2025-06-01' },
        { action: 'Staff recognition program', impact: '-8% turnover', date: '2025-05-01' }
      ],
      planned: [
        { action: 'Renovate common areas', targetDate: '2025-10-01', expectedImpact: '+5% environment score' },
        { action: 'Implement family app', targetDate: '2025-09-15', expectedImpact: '+10% communication score' },
        { action: 'Expand therapy services', targetDate: '2025-11-01', expectedImpact: '+8% clinical outcomes' }
      ]
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="w-4 h-4 text-green-500" />;
      case 'neutral':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'negative':
        return <Frown className="w-4 h-4 text-red-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-500">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-blue-500">Good</Badge>;
      case 'fair':
        return <Badge className="bg-yellow-500">Fair</Badge>;
      case 'poor':
        return <Badge className="bg-red-500">Poor</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return <ChevronUp className="w-4 h-4 text-green-500" />;
    } else if (change < 0) {
      return <ChevronDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Metrics</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Satisfaction scores, clinical outcomes, and quality indicators
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Awards Alert */}
      {mockQuality.awards.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/20">
          <Trophy className="h-4 w-4" />
          <AlertTitle>Recent Recognition</AlertTitle>
          <AlertDescription>
            Received {mockQuality.awards.length} quality awards including {mockQuality.awards[0].title} from {mockQuality.awards[0].organization}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overall Score</p>
                <div className="flex items-center mt-1">
                  <Star className="w-5 h-5 text-yellow-500 mr-1" />
                  <p className="text-2xl font-bold">{mockQuality.summary.overallScore}</p>
                  <span className="text-sm text-gray-500 ml-1">/ 5.0</span>
                </div>
                <Progress value={mockQuality.summary.overallScore * 20} className="h-1 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resident Satisfaction</p>
                <p className="text-2xl font-bold">{mockQuality.summary.residentSatisfaction}%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+3% this month</span>
                </div>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clinical Quality</p>
                <p className="text-2xl font-bold">{mockQuality.summary.clinicalQuality}%</p>
                <Badge className="bg-green-500 mt-1">Excellent</Badge>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Safety Score</p>
                <p className="text-2xl font-bold">{mockQuality.summary.safetyScore}%</p>
                <p className="text-xs text-gray-500 mt-1">Above target</p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">State Ranking</p>
                <p className="text-2xl font-bold">#{mockQuality.summary.stateRanking}</p>
                <p className="text-xs text-gray-500 mt-1">{mockQuality.summary.nationalPercentile}th percentile</p>
              </div>
              <Award className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Metrics Tabs */}
      <Tabs defaultValue="satisfaction" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Satisfaction Tab */}
        <TabsContent value="satisfaction" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Satisfaction by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Satisfaction by Category</CardTitle>
                <CardDescription>Current scores and monthly changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockQuality.satisfactionScores.current.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.category}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold">{item.score}%</span>
                          {getChangeIndicator(item.change)}
                          <span className="text-xs text-gray-500">{item.change > 0 ? '+' : ''}{item.change}%</span>
                        </div>
                      </div>
                      <Progress value={item.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Satisfaction Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Trend</CardTitle>
                <CardDescription>Monthly satisfaction scores by group</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockQuality.satisfactionScores.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[75, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="resident" stroke="#6366f1" strokeWidth={2} />
                    <Line type="monotone" dataKey="family" stroke="#8b5cf6" strokeWidth={2} />
                    <Line type="monotone" dataKey="staff" stroke="#ec4899" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Department Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Satisfaction scores by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockQuality.departmentScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis domain={[70, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#6366f1">
                    {mockQuality.departmentScores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.score >= 90 ? '#10b981' :
                        entry.score >= 85 ? '#6366f1' :
                        entry.score >= 80 ? '#f59e0b' :
                        '#ef4444'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinical Tab */}
        <TabsContent value="clinical" className="space-y-4">
          {/* Clinical Quality Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Clinical Quality Indicators</CardTitle>
              <CardDescription>Key clinical metrics vs targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockQuality.qualityIndicators.clinical.map((indicator, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{indicator.indicator}</p>
                      {getStatusBadge(indicator.status)}
                    </div>
                    <div className="flex items-end space-x-2">
                      <p className="text-2xl font-bold">{indicator.rate}%</p>
                      <p className="text-sm text-gray-500 pb-1">/ {indicator.target}% target</p>
                    </div>
                    <Progress 
                      value={(indicator.target - indicator.rate) / indicator.target * 100} 
                      className="h-2 mt-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Operational Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Operational Quality Metrics</CardTitle>
              <CardDescription>Key operational indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mockQuality.qualityIndicators.operational.map((metric, index) => (
                  <div key={index} className="text-center p-3 border rounded">
                    <p className="text-sm text-gray-600 mb-1">{metric.indicator}</p>
                    <p className="text-2xl font-bold">
                      {metric.value}{metric.unit}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Target: {metric.target}{metric.unit}
                    </p>
                    {metric.value <= metric.target ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mx-auto mt-2" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mx-auto mt-2" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Surveys Tab */}
        <TabsContent value="surveys" className="space-y-4">
          {/* Survey Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{mockQuality.surveyResults.responses}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Responses</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{mockQuality.surveyResults.responseRate}%</p>
                  <p className="text-sm text-gray-600 mt-1">Response Rate</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">+{mockQuality.surveyResults.nps}</p>
                  <p className="text-sm text-gray-600 mt-1">Net Promoter Score</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">95%</p>
                  <p className="text-sm text-gray-600 mt-1">Would Recommend</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Survey Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Top Improvement Areas</CardTitle>
              <CardDescription>Based on recent survey feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockQuality.surveyResults.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${
                        rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
                        rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">{rec.area}</p>
                        <p className="text-sm text-gray-500">{rec.votes} respondents mentioned this</p>
                      </div>
                    </div>
                    <Badge variant={rec.priority === 'high' ? 'destructive' : 'outline'}>
                      {rec.priority} priority
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>Verbatim comments from surveys</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockQuality.surveyResults.verbatim.map((comment, index) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getSentimentIcon(comment.sentiment)}
                        <span className="text-sm font-medium">{comment.author}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{comment.comment}"</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmarking</CardTitle>
              <CardDescription>Performance compared to industry standards</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockQuality.benchmarks.industry}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis domain={[70, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="community" fill="#6366f1" name="Our Community" />
                  <Bar dataKey="industry" fill="#94a3b8" name="Industry Average" />
                  <Bar dataKey="top10" fill="#10b981" name="Top 10%" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quality Awards */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Recognition</CardTitle>
              <CardDescription>Awards and certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockQuality.awards.map((award, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="font-medium">{award.title}</p>
                        <p className="text-sm text-gray-500">{award.organization}</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-500">{award.year}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Improvements Tab */}
        <TabsContent value="improvements" className="space-y-4">
          {/* Implemented Improvements */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Implemented Improvements</CardTitle>
              <CardDescription>Actions taken based on feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockQuality.improvements.implemented.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">{item.action}</p>
                        <p className="text-sm text-gray-500">
                          Implemented {format(new Date(item.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-500">{item.impact}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Planned Improvements */}
          <Card>
            <CardHeader>
              <CardTitle>Planned Improvements</CardTitle>
              <CardDescription>Upcoming quality initiatives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockQuality.improvements.planned.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{item.action}</p>
                        <p className="text-sm text-gray-500">
                          Target: {format(new Date(item.targetDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{item.expectedImpact}</Badge>
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
                  <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">4.6/5.0</p>
                  <p className="text-sm text-gray-600 mt-1">Overall Rating</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">+5%</p>
                  <p className="text-sm text-gray-600 mt-1">YoY Improvement</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">89%</p>
                  <p className="text-sm text-gray-600 mt-1">Percentile Rank</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-600 mt-1">Deficiencies</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quality Score Radar */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Profile</CardTitle>
              <CardDescription>Multi-dimensional quality assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={[
                  { metric: 'Clinical', score: 94 },
                  { metric: 'Safety', score: 96 },
                  { metric: 'Satisfaction', score: 92 },
                  { metric: 'Staff', score: 85 },
                  { metric: 'Environment', score: 94 },
                  { metric: 'Value', score: 82 }
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}