import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealtimeAnalytics, useRealtimeFinancial, useRealtimeCompliance, useRealtimeMetrics } from '@/hooks/useEnterpriseWebSocket';
import { Activity, DollarSign, Shield, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealtimeDashboardProps {
  communityId?: number;
}

export function RealtimeDashboard({ communityId }: RealtimeDashboardProps) {
  const { analyticsData, isConnected: analyticsConnected } = useRealtimeAnalytics(communityId);
  const { financialData, isConnected: financialConnected } = useRealtimeFinancial(communityId);
  const { complianceData, isConnected: complianceConnected } = useRealtimeCompliance(communityId);
  const { metricsData, isConnected: metricsConnected } = useRealtimeMetrics(communityId);

  const isConnected = analyticsConnected || financialConnected || complianceConnected || metricsConnected;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Real-time Enterprise Dashboard</h2>
        <Badge 
          variant={isConnected ? 'default' : 'secondary'}
          className={cn(
            'transition-all',
            isConnected && 'animate-pulse'
          )}
        >
          {isConnected ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Live Updates
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-gray-500 rounded-full mr-2" />
              Connecting...
            </>
          )}
        </Badge>
      </div>

      {/* Analytics Card */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Analytics
            {analyticsConnected && (
              <Badge variant="outline" className="ml-auto">
                Real-time
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Live visitor and engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Recent Events</p>
                <p className="text-2xl font-bold">
                  {analyticsData.recentEvents?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">
                  {formatNumber(analyticsData.totalEvents || 0)}
                </p>
              </div>
              {analyticsData.newEvents && analyticsData.newEvents.length > 0 && (
                <div className="col-span-2 mt-2">
                  <p className="text-sm text-muted-foreground mb-2">Latest Activity</p>
                  <div className="space-y-1">
                    {analyticsData.newEvents.slice(0, 3).map((event: any, idx: number) => (
                      <div key={idx} className="text-xs bg-secondary/50 rounded p-2">
                        <span className="font-medium">{event.eventType}</span>
                        {event.pageUrl && (
                          <span className="text-muted-foreground ml-2">{event.pageUrl}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-secondary rounded w-3/4"></div>
              <div className="h-8 bg-secondary rounded w-1/2"></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Card */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Financial
            {financialConnected && (
              <Badge variant="outline" className="ml-auto">
                Real-time
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Live revenue and expense tracking</CardDescription>
        </CardHeader>
        <CardContent>
          {financialData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(financialData.totalRevenue || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expenses</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(financialData.totalExpenses || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Income</p>
                  <p className={cn(
                    "text-xl font-bold",
                    (financialData.netIncome || 0) >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatCurrency(financialData.netIncome || 0)}
                  </p>
                </div>
              </div>
              {financialData.newTransactions && financialData.newTransactions.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Recent Transactions</p>
                  <div className="space-y-1">
                    {financialData.newTransactions.slice(0, 3).map((txn: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-secondary/50 rounded p-2">
                        <span className="font-medium">{txn.category}</span>
                        <span className={cn(
                          "font-bold",
                          txn.type === 'revenue' ? "text-green-600" : "text-red-600"
                        )}>
                          {txn.type === 'revenue' ? '+' : '-'}{formatCurrency(Number(txn.amount))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-secondary rounded w-3/4"></div>
              <div className="h-8 bg-secondary rounded w-1/2"></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Card */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            Compliance
            {complianceConnected && (
              <Badge variant="outline" className="ml-auto">
                Real-time
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Live compliance and audit tracking</CardDescription>
        </CardHeader>
        <CardContent>
          {complianceData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">
                      {Math.round(complianceData.averageScore || 100)}%
                    </p>
                    {complianceData.averageScore >= 90 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Critical Issues</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    complianceData.criticalIssues > 0 ? "text-red-600" : "text-green-600"
                  )}>
                    {complianceData.criticalIssues || 0}
                  </p>
                </div>
              </div>
              {complianceData.recentAudits && complianceData.recentAudits.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Recent Audits</p>
                  <div className="space-y-1">
                    {complianceData.recentAudits.slice(0, 3).map((audit: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-secondary/50 rounded p-2">
                        <span className="font-medium">{audit.auditCategory}</span>
                        <Badge variant={audit.result === 'passed' ? 'default' : 'destructive'} className="text-xs">
                          {audit.result || 'pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-secondary rounded w-3/4"></div>
              <div className="h-8 bg-secondary rounded w-1/2"></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics Card */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Key Metrics
            {metricsConnected && (
              <Badge variant="outline" className="ml-auto">
                Real-time
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Live operational KPIs</CardDescription>
        </CardHeader>
        <CardContent>
          {metricsData?.currentMetrics ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold">
                  {metricsData.currentMetrics.occupancyRate || 0}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Revenue/Unit</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(Number(metricsData.currentMetrics.avgRevenuePerUnit || 0))}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">
                  {metricsData.currentMetrics.customerSatisfaction || 0}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Staff Turnover</p>
                <p className="text-2xl font-bold">
                  {metricsData.currentMetrics.staffTurnover || 0}%
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-secondary rounded w-3/4"></div>
              <div className="h-8 bg-secondary rounded w-1/2"></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Update Timestamp */}
      {(analyticsData?.timestamp || financialData?.timestamp || complianceData?.timestamp || metricsData?.timestamp) && (
        <div className="text-center text-xs text-muted-foreground">
          Last update: {new Date(
            analyticsData?.timestamp || 
            financialData?.timestamp || 
            complianceData?.timestamp || 
            metricsData?.timestamp
          ).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}