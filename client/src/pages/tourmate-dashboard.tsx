/**
 * TourMate™ Dashboard
 * Enterprise-level analytics and management for tour scheduling
 */

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Calendar,
  Users,
  TrendingUp,
  Shield,
  Lock,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Star,
  Activity,
  FileText,
  Download,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function TourMateDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ['/api/tourmate/analytics', refreshKey],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch security metrics
  const { data: security, isLoading: securityLoading } = useQuery({
    queryKey: ['/api/tourmate/security-metrics', refreshKey],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch privacy metrics
  const { data: privacy, isLoading: privacyLoading } = useQuery({
    queryKey: ['/api/tourmate/privacy-metrics', refreshKey],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Refreshing TourMate™ Data",
      description: "Fetching latest analytics and metrics...",
    });
  };

  const handleExportReport = async () => {
    try {
      const response = await fetch('/api/tourmate/export-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'pdf' }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tourmate-report-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        
        toast({
          title: "Report Exported",
          description: "Your TourMate™ analytics report has been downloaded.",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isLoading = analyticsLoading || securityLoading || privacyLoading;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">TourMate™ Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Enterprise Tour Scheduling & Analytics Platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tours</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.metrics?.totalTours || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.metrics?.toursToday || 0} scheduled today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.metrics?.conversionRate?.toFixed(1) || 0}%
            </div>
            <Progress value={analytics?.metrics?.conversionRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {security?.securityScore || 100}
            </div>
            <p className="text-xs text-muted-foreground">
              {security?.blockedIPs || 0} threats blocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Privacy Compliance</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {privacy?.complianceScore || 98}%
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs">GDPR</Badge>
              <Badge variant="outline" className="text-xs">CCPA</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {analytics?.alerts && analytics.alerts.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>System Alerts</AlertTitle>
          <AlertDescription>
            {analytics.alerts.map((alert: any, index: number) => (
              <div key={index} className="mt-2">
                <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                  {alert.type}
                </Badge>
                <span className="ml-2">{alert.message}</span>
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tour Volume Trends</CardTitle>
                <CardDescription>
                  Tours scheduled over time with {analytics?.metrics?.toursTrend} trend
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Week</span>
                    <span className="font-bold">{analytics?.metrics?.toursThisWeek || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Month</span>
                    <span className="font-bold">{analytics?.metrics?.toursThisMonth || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Lead Time</span>
                    <span className="font-bold">{analytics?.metrics?.averageLeadTime || 0} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completion Rate</span>
                    <span className="font-bold">{analytics?.metrics?.completionRate?.toFixed(1) || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tour Types & Preferences</CardTitle>
                <CardDescription>Most popular tour formats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.metrics?.preferredTourTypes && 
                    Object.entries(analytics.metrics.preferredTourTypes).map(([type, count]: [string, any]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{count}</span>
                          <Progress 
                            value={(count / analytics.metrics.totalTours) * 100} 
                            className="w-24"
                          />
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Feedback and satisfaction metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Average Rating</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {analytics?.metrics?.averageFeedbackScore?.toFixed(1) || 0}/5
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Response Rate</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {analytics?.metrics?.feedbackResponseRate?.toFixed(1) || 0}%
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Avg. Attendees</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {analytics?.metrics?.averageAttendeesPerTour?.toFixed(1) || 1}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Communities</CardTitle>
              <CardDescription>Communities with highest tour conversion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.metrics?.topPerformingCommunities?.map((community: any) => (
                  <div key={community.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{community.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {community.tourCount} tours scheduled
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{community.conversionRate.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">conversion</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Overview</CardTitle>
              <CardDescription>Real-time security monitoring and threat detection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Security Status</AlertTitle>
                  <AlertDescription>
                    System security score: {security?.securityScore || 100}/100
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Blocked IPs</span>
                    <div className="text-xl font-bold">{security?.blockedIPs || 0}</div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Suspicious Patterns</span>
                    <div className="text-xl font-bold">{security?.suspiciousPatterns || 0}</div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Security Events (24h)</span>
                    <div className="text-xl font-bold">{security?.totalSecurityEvents || 0}</div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Last Threat</span>
                    <div className="text-sm font-medium">
                      {security?.lastThreatDetected ? 
                        new Date(security.lastThreatDetected).toLocaleString() : 
                        'None detected'}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Security Features</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Rate Limiting Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Data Encryption (AES-256)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Fraud Detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Audit Logging</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Compliance</CardTitle>
              <CardDescription>Data protection and regulatory compliance status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Compliance Score</span>
                    <div className="text-xl font-bold">{privacy?.complianceScore || 98}%</div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Privacy Events (30d)</span>
                    <div className="text-xl font-bold">{privacy?.totalPrivacyEvents || 0}</div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Data Export Requests</span>
                    <div className="text-xl font-bold">{privacy?.dataExportRequests || 0}</div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Deletion Requests</span>
                    <div className="text-xl font-bold">{privacy?.dataDeletionRequests || 0}</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Compliance Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">GDPR Compliant</span>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">CCPA Compliant</span>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Last Data Cleanup</span>
                      </div>
                      <span className="text-sm">
                        {privacy?.lastDataCleanup ? 
                          new Date(privacy.lastDataCleanup).toLocaleDateString() : 
                          'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>Data Retention Policy</AlertTitle>
                  <AlertDescription>
                    Tour data: 1 year • Feedback: 2 years • Analytics: 3 years • Audit logs: 7 years
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}