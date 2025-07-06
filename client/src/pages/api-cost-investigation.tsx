import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, DollarSign, Activity, Clock, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApiInvestigationData {
  summary: {
    todayTotalCost: number;
    todayTotalCalls: number;
    discrepancyAlert: string;
    lastUpdated: string;
  };
  breakdown: {
    textSearch: { calls: number; cost: number; percentage: number };
    placeDetails: { calls: number; cost: number; percentage: number };
    placePhotos: { calls: number; cost: number; percentage: number };
  };
  recentCalls: Array<{
    timestamp: string;
    endpoint: string;
    cost: number;
    calls: number;
    operation: string;
    success: boolean;
  }>;
  alerts: string[];
}

export default function ApiCostInvestigation() {
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data: investigation, isLoading, refetch } = useQuery<ApiInvestigationData>({
    queryKey: ['/api/admin/api-costs/investigation'],
    refetchInterval: autoRefresh ? 30000 : false, // Auto-refresh every 30 seconds if enabled
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEndpointColor = (endpoint: string) => {
    switch (endpoint) {
      case 'textSearch': return 'bg-blue-100 text-blue-800';
      case 'placeDetails': return 'bg-green-100 text-green-800';
      case 'placePhotos': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertVariant = (alert: string) => {
    if (alert.includes('CRITICAL')) return 'destructive';
    if (alert.includes('WARNING')) return 'default';
    return 'default';
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!investigation) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load API cost investigation data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Cost Investigation</h1>
          <p className="text-gray-600">Real-time analysis of Google Places API usage and costs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {investigation.alerts.length > 0 && (
        <div className="space-y-2">
          {investigation.alerts.map((alert, index) => (
            <Alert key={index} variant={getAlertVariant(alert)}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(investigation.summary.todayTotalCost)}
            </div>
            <Badge variant={investigation.summary.discrepancyAlert === 'Normal' ? 'secondary' : 'destructive'}>
              {investigation.summary.discrepancyAlert}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investigation.summary.todayTotalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">calls today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost per Call</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {investigation.summary.todayTotalCalls > 0 
                ? formatCurrency(investigation.summary.todayTotalCost / investigation.summary.todayTotalCalls)
                : '$0.00'}
            </div>
            <p className="text-xs text-muted-foreground">average cost</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">{formatTimestamp(investigation.summary.lastUpdated)}</div>
            <p className="text-xs text-muted-foreground">real-time tracking</p>
          </CardContent>
        </Card>
      </div>

      {/* API Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>API Usage Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(investigation.breakdown).map(([endpoint, data]) => (
              <div key={endpoint} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getEndpointColor(endpoint)}>
                    {endpoint}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {data.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Calls:</span>
                    <span className="font-medium">{data.calls}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cost:</span>
                    <span className="font-medium text-red-600">{formatCurrency(data.cost)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent API Calls */}
      <Card>
        <CardHeader>
          <CardTitle>Recent API Calls (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          {investigation.recentCalls.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No API calls found in the last 24 hours</p>
          ) : (
            <div className="space-y-2">
              {investigation.recentCalls.map((call, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getEndpointColor(call.endpoint)}>
                      {call.endpoint}
                    </Badge>
                    <span className="text-sm text-gray-600">{call.operation}</span>
                    <Badge variant={call.success ? 'secondary' : 'destructive'}>
                      {call.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(call.timestamp)}
                    </span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(call.cost)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800">Previous Dashboard Issue</h4>
              <p className="text-sm text-yellow-700 mt-1">
                The admin dashboard previously showed hardcoded cost data ($1.40) instead of real API usage. 
                This new tracking system shows actual Google Places API costs in real-time.
              </p>
            </div>
            
            {investigation.summary.todayTotalCost > 10 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800">High Cost Alert</h4>
                <p className="text-sm text-red-700 mt-1">
                  Today's API costs ({formatCurrency(investigation.summary.todayTotalCost)}) exceed the normal threshold. 
                  Review recent operations and consider implementing additional cost controls.
                </p>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800">Cost Protection Active</h4>
              <p className="text-sm text-blue-700 mt-1">
                API cost protection system is monitoring all Google Places API calls and will automatically 
                block operations if daily limits are exceeded.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}