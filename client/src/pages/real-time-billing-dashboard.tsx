import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, DollarSign, Clock, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RealBillingData {
  realAnalysis: {
    totalCharges: number;
    chargesByService: Record<string, number>;
    recentCharges: any[];
    dailyBreakdown: { date: string; cost: number; requests: number }[];
    costProjection: {
      dailyRate: number;
      monthlyProjection: number;
      nextBillEstimate: number;
    };
  };
  todayCharges: {
    total: number;
    breakdown: Record<string, number>;
    count: number;
  };
  expensiveOperations: any[];
  summary: {
    actualTotalCost: number;
    actualTodayCost: number;
    actualRequestCount: number;
    topCostService: string;
    projectedMonthly: number;
  };
}

interface GoogleInteractionsData {
  analysis: {
    totalInteractions: number;
    totalCost: number;
    costByHour: { hour: string; cost: number; calls: number }[];
    serviceBreakdown: {
      service: string;
      totalCalls: number;
      totalCost: number;
      costPerCall: number;
      timeframe: string;
      peakUsageHour: string;
      interactions: any[];
    }[];
    suspiciousPatterns: {
      pattern: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      evidence: string[];
      estimatedExtraCost: number;
    }[];
    exactChargeSource: {
      primaryCause: string;
      costContribution: number;
      timeOfOccurrence: string;
      callDetails: any[];
    };
  };
  report: string;
  summary: {
    totalInteractions: number;
    totalCost: number;
    primaryChargeSource: string;
    primaryCost: number;
    suspiciousPatterns: number;
    criticalIssues: number;
  };
}

export default function RealTimeBillingDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Real billing data
  const { data: realBilling, refetch: refetchBilling } = useQuery({
    queryKey: ['/api/admin/real-billing'],
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds
  });

  // 48-hour Google interactions
  const { data: interactions, refetch: refetchInteractions } = useQuery({
    queryKey: ['/api/admin/google-interactions-48h'],
    refetchInterval: autoRefresh ? 60000 : false, // Refresh every 60 seconds
  });

  const realData: RealBillingData | undefined = realBilling;
  const interactionData: GoogleInteractionsData | undefined = interactions;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Google Cloud Billing Analysis</h1>
          <p className="text-muted-foreground">Track exact charges and identify the source of your $82 bill</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
          </Button>
          <Button onClick={() => { refetchBilling(); refetchInteractions(); }}>
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {interactionData?.summary.criticalIssues > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Issues Detected</AlertTitle>
          <AlertDescription>
            {interactionData.summary.criticalIssues} critical billing issues found in the last 48 hours. 
            Check suspicious patterns below for immediate action.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${realData?.summary.actualTotalCost.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              Last 48h: ${interactionData?.summary.totalCost.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Charges</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${realData?.summary.actualTodayCost.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              {realData?.summary.actualRequestCount || 0} API requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Projection</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${realData?.summary.projectedMonthly.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              Based on current usage patterns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interactionData?.summary.totalInteractions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {interactionData?.summary.suspiciousPatterns || 0} suspicious patterns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Primary Charge Source */}
      {interactionData?.analysis.exactChargeSource && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Exact Charge Source Identified
            </CardTitle>
            <CardDescription>Primary cause of your $82 Google Cloud bill</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">{interactionData.analysis.exactChargeSource.primaryCause}</h4>
                <p className="text-2xl font-bold text-destructive">
                  ${interactionData.analysis.exactChargeSource.costContribution.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Peak usage: {interactionData.analysis.exactChargeSource.timeOfOccurrence}
                </p>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">Top Call Details:</h5>
                <div className="space-y-2">
                  {interactionData.analysis.exactChargeSource.callDetails.slice(0, 3).map((call, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">{call.apiCall || call.endpoint}</span>
                      <span className="font-medium">${call.costIncurred?.toFixed(4) || '0.0000'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Service Cost Breakdown (48h)</CardTitle>
            <CardDescription>Costs by Google Cloud service</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interactionData?.analysis.serviceBreakdown.map((service, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{service.service}</p>
                    <p className="text-sm text-muted-foreground">
                      {service.totalCalls} calls • ${service.costPerCall.toFixed(4)}/call
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${service.totalCost.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Peak: {service.peakUsageHour?.slice(11, 16) || 'Unknown'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Real-Time Service Charges</CardTitle>
            <CardDescription>Today's charges by service</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realData?.todayCharges.breakdown && Object.entries(realData.todayCharges.breakdown).map(([service, cost]) => (
                <div key={service} className="flex justify-between items-center">
                  <span className="font-medium">{service}</span>
                  <span className="text-lg font-semibold">${cost.toFixed(2)}</span>
                </div>
              ))}
              {(!realData?.todayCharges.breakdown || Object.keys(realData.todayCharges.breakdown).length === 0) && (
                <p className="text-muted-foreground">No charges recorded today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suspicious Patterns */}
      {interactionData?.analysis.suspiciousPatterns && interactionData.analysis.suspiciousPatterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Suspicious Patterns Detected
            </CardTitle>
            <CardDescription>Issues that may be causing excess charges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interactionData.analysis.suspiciousPatterns.map((pattern, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(pattern.severity)}
                      <h4 className="font-semibold">{pattern.pattern}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(pattern.severity)}>
                        {pattern.severity.toUpperCase()}
                      </Badge>
                      <span className="font-semibold text-destructive">
                        +${pattern.estimatedExtraCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {pattern.evidence.map((evidence, evidenceIndex) => (
                      <p key={evidenceIndex} className="text-sm text-muted-foreground">
                        • {evidence}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Charges */}
      <Card>
        <CardHeader>
          <CardTitle>Most Expensive Recent Operations</CardTitle>
          <CardDescription>Highest cost operations from the last 48 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {realData?.expensiveOperations.slice(0, 10).map((op, index) => (
              <div key={index} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <p className="font-medium">{op.apiCall || op.service}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(op.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${op.actualCost?.toFixed(4) || op.costIncurred?.toFixed(4) || '0.0000'}</p>
                  <p className="text-sm text-muted-foreground">
                    {op.requestCount || 1} request{(op.requestCount || 1) > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
            {(!realData?.expensiveOperations || realData.expensiveOperations.length === 0) && (
              <p className="text-muted-foreground">No expensive operations recorded</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Emergency Controls</CardTitle>
          <CardDescription>Immediate actions to stop excessive charges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              variant="destructive" 
              onClick={() => {
                fetch('/api/admin/emergency-stop-apis', { method: 'POST' })
                  .then(() => alert('All Google Cloud APIs have been emergency stopped'))
                  .catch(() => alert('Failed to stop APIs'));
              }}
            >
              Emergency Stop All APIs
            </Button>
            <Button variant="outline">
              Set Daily Spending Limit
            </Button>
            <Button variant="outline">
              Enable API Quotas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}