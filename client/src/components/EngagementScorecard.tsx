import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Eye, 
  Users, 
  MessageCircle, 
  Phone,
  MapPin,
  Camera,
  Play,
  FileText,
  Star,
  Target,
  BarChart3,
  AlertCircle,
  Lightbulb,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface EngagementScoreBreakdown {
  totalScore: number;
  components: {
    trafficScore: number;
    interactionScore: number;
    contentScore: number;
    leadQualityScore: number;
    responseScore: number;
  };
  trends: {
    weekOverWeek: number;
    monthOverMonth: number;
    quarterOverQuarter: number;
  };
  insights: string[];
  benchmarks: {
    industryAverage: number;
    topPercentile: number;
    peerComparison: number;
  };
}

interface ScorecardData {
  communityId: number;
  communityName: string;
  subscriptionTier: string;
  scorecard: EngagementScoreBreakdown;
}

interface Alert {
  id: number;
  alertType: string;
  alertSeverity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  currentValue?: number;
  previousValue?: number;
  changePercentage?: number;
  isRead: boolean;
  createdAt: string;
}

interface EngagementScorecardProps {
  communityId: number;
}

export default function EngagementScorecard({ communityId }: EngagementScorecardProps) {
  const [scorecardData, setScorecardData] = useState<ScorecardData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadScorecardData();
    loadAlerts();
  }, [communityId]);

  const loadScorecardData = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', `/api/engagement/scorecard/${communityId}`);
      setScorecardData(response);
    } catch (error: any) {
      console.error('Error loading scorecard:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load engagement scorecard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await apiRequest('GET', `/api/engagement/alerts/${communityId}?limit=5`);
      setAlerts(response.alerts || []);
    } catch (error: any) {
      console.error('Error loading alerts:', error);
    }
  };

  const refreshMetrics = async () => {
    try {
      setIsCalculating(true);
      await apiRequest('POST', `/api/engagement/calculate/${communityId}`, {
        periodType: 'monthly'
      });
      
      toast({
        title: "Success",
        description: "Engagement metrics updated successfully",
      });
      
      // Reload data after calculation
      await loadScorecardData();
    } catch (error: any) {
      console.error('Error refreshing metrics:', error);
      toast({
        title: "Error", 
        description: error.message || "Failed to refresh metrics",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const markAlertAsRead = async (alertId: number) => {
    try {
      await apiRequest('PATCH', `/api/engagement/alerts/${alertId}/read`);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));
    } catch (error: any) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    if (score >= 40) return 'outline';
    return 'destructive';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Community Engagement Scorecard</CardTitle>
          <CardDescription>Loading your engagement analytics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!scorecardData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Community Engagement Scorecard</CardTitle>
          <CardDescription>Unable to load engagement data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadScorecardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { scorecard, subscriptionTier } = scorecardData;

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dynamic Community Engagement Scorecard</CardTitle>
              <CardDescription>Real-time performance analytics for {scorecardData.communityName}</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={getScoreBadgeVariant(scorecard.totalScore)}>
                {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Tier
              </Badge>
              <Button 
                onClick={refreshMetrics} 
                variant="outline" 
                size="sm"
                disabled={isCalculating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
                {isCalculating ? 'Calculating...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(scorecard.totalScore)}`}>
                {scorecard.totalScore}
              </div>
              <div className="text-lg text-muted-foreground">Overall Engagement Score</div>
              <div className="flex items-center justify-center mt-2 gap-1">
                {getTrendIcon(scorecard.trends.monthOverMonth)}
                <span className="text-sm text-muted-foreground">
                  {scorecard.trends.monthOverMonth > 0 ? '+' : ''}{scorecard.trends.monthOverMonth.toFixed(1)}% vs last month
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <Alert key={alert.id} className={`cursor-pointer ${alert.isRead ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-3" onClick={() => markAlertAsRead(alert.id)}>
                    {getAlertIcon(alert.alertSeverity)}
                    <div className="flex-1">
                      <div className="font-medium">{alert.title}</div>
                      <AlertDescription>{alert.message}</AlertDescription>
                      {alert.changePercentage && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {alert.changePercentage > 0 ? '+' : ''}{alert.changePercentage}% change
                        </div>
                      )}
                    </div>
                    {!alert.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Traffic Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Traffic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(scorecard.components.trafficScore)}`}>
                  {scorecard.components.trafficScore}
                </div>
                <Progress value={scorecard.components.trafficScore} className="mt-2" />
              </CardContent>
            </Card>

            {/* Interaction Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Interaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(scorecard.components.interactionScore)}`}>
                  {scorecard.components.interactionScore}
                </div>
                <Progress value={scorecard.components.interactionScore} className="mt-2" />
              </CardContent>
            </Card>

            {/* Content Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(scorecard.components.contentScore)}`}>
                  {scorecard.components.contentScore}
                </div>
                <Progress value={scorecard.components.contentScore} className="mt-2" />
              </CardContent>
            </Card>

            {/* Lead Quality Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Lead Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(scorecard.components.leadQualityScore)}`}>
                  {scorecard.components.leadQualityScore}
                </div>
                <Progress value={scorecard.components.leadQualityScore} className="mt-2" />
              </CardContent>
            </Card>

            {/* Response Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(scorecard.components.responseScore)}`}>
                  {scorecard.components.responseScore}
                </div>
                <Progress value={scorecard.components.responseScore} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Benchmarks */}
          {subscriptionTier !== 'verified' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Industry Benchmarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-muted-foreground">
                      {scorecard.benchmarks.industryAverage}
                    </div>
                    <div className="text-sm text-muted-foreground">Industry Average</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {scorecard.benchmarks.topPercentile}
                    </div>
                    <div className="text-sm text-muted-foreground">Top 10%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {scorecard.benchmarks.peerComparison}
                    </div>
                    <div className="text-sm text-muted-foreground">Local Peers</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
              <CardDescription>
                {subscriptionTier === 'verified' 
                  ? 'Upgrade to Standard or higher for detailed metrics breakdown'
                  : 'Comprehensive engagement analytics for your community'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionTier === 'verified' ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    Detailed metrics are available with paid subscriptions
                  </div>
                  <Button variant="outline">
                    Upgrade Subscription
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Eye className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold">-</div>
                      <div className="text-sm text-muted-foreground">Profile Views</div>
                    </div>
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold">-</div>
                      <div className="text-sm text-muted-foreground">Unique Visitors</div>
                    </div>
                    <div className="text-center">
                      <Phone className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold">-</div>
                      <div className="text-sm text-muted-foreground">Phone Clicks</div>
                    </div>
                    <div className="text-center">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <div className="text-2xl font-bold">-</div>
                      <div className="text-sm text-muted-foreground">Inquiries</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                {subscriptionTier === 'verified' 
                  ? 'Historical trend analysis available with Featured or Platinum subscriptions'
                  : 'Track your engagement performance over time'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!['featured', 'platinum'].includes(subscriptionTier) ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    Historical trend analysis requires Featured or Platinum subscription
                  </div>
                  <Button variant="outline">
                    Upgrade to Featured
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Week over Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(scorecard.trends.weekOverWeek)}
                        <span className="text-lg font-semibold">
                          {scorecard.trends.weekOverWeek > 0 ? '+' : ''}{scorecard.trends.weekOverWeek.toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Month over Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(scorecard.trends.monthOverMonth)}
                        <span className="text-lg font-semibold">
                          {scorecard.trends.monthOverMonth > 0 ? '+' : ''}{scorecard.trends.monthOverMonth.toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Quarter over Quarter</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(scorecard.trends.quarterOverQuarter)}
                        <span className="text-lg font-semibold">
                          {scorecard.trends.quarterOverQuarter > 0 ? '+' : ''}{scorecard.trends.quarterOverQuarter.toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>
                Actionable insights to improve your community engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scorecard.insights.length > 0 ? (
                  scorecard.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-600" />
                      <div className="text-sm">{insight}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Great job! No specific recommendations at this time.
                    Keep maintaining your current engagement levels.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}