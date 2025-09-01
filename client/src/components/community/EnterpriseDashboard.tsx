import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, BarChart3, 
  FileCheck, Shield, AlertTriangle, Calendar, Building,
  Activity, ChevronRight, Download, RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface EnterpriseDashboardProps {
  communityId: number;
  subscriptionTier: string;
}

export const EnterpriseDashboard: React.FC<EnterpriseDashboardProps> = ({ 
  communityId, 
  subscriptionTier 
}) => {
  const [dateRange, setDateRange] = useState('30d');
  
  // Check if user has access to enterprise features (Professional tier and above)
  const hasAccess = ['professional', 'premium', 'enterprise'].includes(subscriptionTier.toLowerCase());
  
  if (!hasAccess) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enterprise Dashboard
          </CardTitle>
          <CardDescription>
            Upgrade to Professional tier or above to access enterprise features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get advanced analytics, financial management, and compliance monitoring
            </p>
            <Button>Upgrade Now</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fetch analytics data
  const { data: analytics } = useQuery({
    queryKey: ['/api/enterprise/analytics', communityId],
    queryFn: () => apiRequest('GET', `/api/enterprise/analytics/${communityId}`)
  });

  // Fetch real-time data
  const { data: realtime } = useQuery({
    queryKey: ['/api/enterprise/analytics', communityId, 'realtime'],
    queryFn: () => apiRequest('GET', `/api/enterprise/analytics/${communityId}/realtime`),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch financial data
  const { data: financials } = useQuery({
    queryKey: ['/api/enterprise/financials', communityId],
    queryFn: () => apiRequest('GET', `/api/enterprise/financials/${communityId}`)
  });

  // Fetch compliance data
  const { data: compliance } = useQuery({
    queryKey: ['/api/enterprise/compliance', communityId],
    queryFn: () => apiRequest('GET', `/api/enterprise/compliance/${communityId}`)
  });

  return (
    <div className="space-y-6">
      {/* Real-time Status Bar */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                <span className="text-sm font-medium">Active Visitors: {realtime?.activeVisitors || 0}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Today's Views:</span> {realtime?.todayViews || 0}
              </div>
              <div className="text-sm">
                <span className="font-medium">Today's Inquiries:</span> {realtime?.todayInquiries || 0}
              </div>
            </div>
            <Button size="sm" variant="outline">
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="financial">
            <DollarSign className="h-4 w-4 mr-2" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <Shield className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                    <p className="text-2xl font-bold">{analytics?.summary?.totalViews || 0}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                    <p className="text-2xl font-bold">{analytics?.summary?.conversionRate || '0%'}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tour Requests</p>
                    <p className="text-2xl font-bold">{analytics?.engagement?.tourRequests || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Time on Page</p>
                    <p className="text-2xl font-bold">{analytics?.summary?.avgTimeOnPage || '0m'}</p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Sources & Conversion Funnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.traffic?.sources?.map((source: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm">{source.source}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={source.percentage} className="w-24 h-2" />
                        <span className="text-sm font-medium w-12">{source.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Views → Inquiry</span>
                    <Badge variant="outline">{analytics?.conversion?.viewsToInquiry || '0%'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Inquiry → Tour</span>
                    <Badge variant="outline">{analytics?.conversion?.inquiryToTour || '0%'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tour → Move-In</span>
                    <Badge variant="outline">{analytics?.conversion?.tourToMoveIn || '0%'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Avg Days to Convert</span>
                    <Badge>{analytics?.conversion?.avgDaysToConvert || 0} days</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {analytics?.recommendations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>Actions to improve performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <Badge 
                        variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                      >
                        {rec.priority}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{rec.suggestion}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{rec.impact}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold">${(financials?.summary?.totalRevenue || 0).toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Net Income</p>
                    <p className="text-2xl font-bold">${(financials?.summary?.netIncome || 0).toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Occupancy Rate</p>
                    <p className="text-2xl font-bold">{financials?.summary?.occupancyRate || '0%'}</p>
                  </div>
                  <Building className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
                    <p className="text-2xl font-bold">{financials?.summary?.profitMargin || '0%'}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue & Expenses Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Monthly revenue by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financials?.revenue?.breakdown?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">${item.amount.toLocaleString()}</span>
                        <Badge variant="outline">{item.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Monthly expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financials?.expenses?.breakdown?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">${item.amount.toLocaleString()}</span>
                        <Badge variant="outline">{item.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget Performance */}
          {financials?.budgetPerformance && (
            <Card>
              <CardHeader>
                <CardTitle>Budget Performance</CardTitle>
                <CardDescription>Actual vs Budgeted</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">${financials.budgetPerformance.revenue.actual.toLocaleString()}</span>
                      <Badge variant={financials.budgetPerformance.revenue.variance > 0 ? "default" : "destructive"}>
                        {financials.budgetPerformance.revenue.percentageVar}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Expenses</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">${financials.budgetPerformance.expenses.actual.toLocaleString()}</span>
                      <Badge variant={financials.budgetPerformance.expenses.variance < 0 ? "default" : "destructive"}>
                        {financials.budgetPerformance.expenses.percentageVar}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Net Income</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">${financials.budgetPerformance.netIncome.actual.toLocaleString()}</span>
                      <Badge variant={financials.budgetPerformance.netIncome.variance > 0 ? "default" : "destructive"}>
                        {financials.budgetPerformance.netIncome.percentageVar}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          {/* Compliance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Compliance Score</p>
                    <p className="text-2xl font-bold">{compliance?.summary?.overallScore || 0}%</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Open Issues</p>
                    <p className="text-2xl font-bold">{compliance?.summary?.openIssues || 0}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Certs</p>
                    <p className="text-2xl font-bold">{compliance?.summary?.certificationsActive || 0}</p>
                  </div>
                  <FileCheck className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Next Audit</p>
                    <p className="text-lg font-bold">{new Date(compliance?.summary?.nextAudit || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Regulatory Compliance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Federal Compliance</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={compliance?.regulatory?.federal?.status === 'Compliant' ? 'default' : 'destructive'}>
                    {compliance?.regulatory?.federal?.status || 'Unknown'}
                  </Badge>
                  <span className="text-sm font-medium">{compliance?.regulatory?.federal?.score || 0}%</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {compliance?.regulatory?.federal?.items?.slice(0, 3).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="truncate">{item.item}</span>
                      <Badge variant={item.status === 'Pass' ? 'default' : 'destructive'} className="text-xs">
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">State Compliance</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={compliance?.regulatory?.state?.status === 'Compliant' ? 'default' : 'destructive'}>
                    {compliance?.regulatory?.state?.status || 'Unknown'}
                  </Badge>
                  <span className="text-sm font-medium">{compliance?.regulatory?.state?.score || 0}%</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {compliance?.regulatory?.state?.items?.slice(0, 3).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="truncate">{item.item}</span>
                      <Badge variant={item.status === 'Pass' ? 'default' : item.status === 'Warning' ? 'secondary' : 'destructive'} className="text-xs">
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Local Compliance</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={compliance?.regulatory?.local?.status === 'Compliant' ? 'default' : 'destructive'}>
                    {compliance?.regulatory?.local?.status || 'Unknown'}
                  </Badge>
                  <span className="text-sm font-medium">{compliance?.regulatory?.local?.score || 0}%</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {compliance?.regulatory?.local?.items?.slice(0, 3).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="truncate">{item.item}</span>
                      <Badge variant={item.status === 'Pass' ? 'default' : 'destructive'} className="text-xs">
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Open Issues */}
          {compliance?.issues?.open?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Open Compliance Issues</CardTitle>
                <CardDescription>Action required</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {compliance.issues.open.map((issue: any) => (
                    <div key={issue.id} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <Badge 
                        variant={issue.severity === 'High' ? 'destructive' : issue.severity === 'Medium' ? 'default' : 'secondary'}
                      >
                        {issue.severity}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{issue.issue}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Due: {new Date(issue.dueDate).toLocaleDateString()}</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">Assigned: {issue.assignedTo}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Export Actions */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {new Date().toLocaleString()}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-3 w-3 mr-1" />
                Export Analytics
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-3 w-3 mr-1" />
                Export Financial Report
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-3 w-3 mr-1" />
                Export Compliance Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};