import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Shield, DollarSign, Activity, Zap, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ApiUsageDashboard {
  overview: {
    totalCalls: number;
    totalCost: number;
    successRate: number;
    dailyBudgetUsed: number;
    dailyBudgetLimit: number;
    emergencyStopActive: boolean;
  };
  limits: {
    maxDailyCost: number;
    maxDailyCalls: number;
    maxCostPerOperation: number;
    maxCallsPerOperation: number;
    emergencyStopCost: number;
  };
  currentUsage: {
    totalCalls: number;
    totalCost: number;
    dailyCalls: number;
    dailyCost: number;
    lastReset: string;
    quotaExceeded: boolean;
    emergencyStop: boolean;
  };
  topEndpoints: Array<{
    endpoint: string;
    calls: number;
    cost: number;
    avgCost: number;
  }>;
  circuitBreakers: Record<string, { failures: number; lastFailure: string }>;
  emergencyControls: {
    apiDisabled: boolean;
    disabledServices: string[];
    disabledDate: string | null;
  };
  alerts: Array<{
    level: 'warning' | 'error' | 'critical';
    message: string;
  }>;
}

export default function ApiCostDashboard() {
  const queryClient = useQueryClient();

  const { data: dashboard, isLoading, error } = useQuery<ApiUsageDashboard>({
    queryKey: ['/api/admin/api-usage-dashboard'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const emergencyStopMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/api-costs/emergency-stop', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-usage-dashboard'] });
    },
  });

  const resetEmergencyMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/api-costs/reset-emergency', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-usage-dashboard'] });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 animate-spin" />
          <h1 className="text-3xl font-bold">Loading API Usage Dashboard...</h1>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Dashboard Error</AlertTitle>
          <AlertDescription>
            Failed to load API usage dashboard. {error?.message || 'Unknown error occurred.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const budgetUsagePercent = (dashboard.overview.dailyBudgetUsed / dashboard.overview.dailyBudgetLimit) * 100;
  const isCritical = budgetUsagePercent > 90 || dashboard.overview.emergencyStopActive;
  const isWarning = budgetUsagePercent > 70;

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">API Cost Protection Dashboard</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={dashboard.overview.emergencyStopActive ? "default" : "destructive"}
            onClick={() => dashboard.overview.emergencyStopActive ? 
              resetEmergencyMutation.mutate() : emergencyStopMutation.mutate()}
            disabled={emergencyStopMutation.isPending || resetEmergencyMutation.isPending}
          >
            {dashboard.overview.emergencyStopActive ? (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Reset Emergency Stop
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Emergency Stop
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Alert Section */}
      {dashboard.alerts.length > 0 && (
        <div className="space-y-2">
          {dashboard.alerts.map((alert, index) => (
            <Alert key={index} variant={alert.level === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="capitalize">{alert.level} Alert</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={isCritical ? "border-red-500 bg-red-50 dark:bg-red-950" : isWarning ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Budget Usage</CardTitle>
            <DollarSign className={`h-4 w-4 ${isCritical ? "text-red-600" : isWarning ? "text-yellow-600" : "text-green-600"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboard.overview.dailyBudgetUsed.toFixed(2)} / ${dashboard.overview.dailyBudgetLimit.toFixed(2)}
            </div>
            <Progress 
              value={budgetUsagePercent} 
              className="mt-2"
              indicatorClassName={isCritical ? "bg-red-600" : isWarning ? "bg-yellow-600" : "bg-green-600"}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {budgetUsagePercent.toFixed(1)}% of daily limit used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.overview.totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard.currentUsage.dailyCalls} calls today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.overview.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              API reliability metric
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Status</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${dashboard.overview.emergencyStopActive ? "text-red-600" : "text-green-600"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={dashboard.overview.emergencyStopActive ? "destructive" : "default"}>
                {dashboard.overview.emergencyStopActive ? "STOPPED" : "ACTIVE"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboard.overview.emergencyStopActive ? "All APIs disabled" : "APIs operational"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>Top API Endpoints by Cost</CardTitle>
            <CardDescription>Most expensive API endpoints in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard.topEndpoints.slice(0, 5).map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm truncate">{endpoint.endpoint}</p>
                    <p className="text-xs text-muted-foreground">
                      {endpoint.calls} calls • ${endpoint.avgCost.toFixed(3)} avg
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${endpoint.cost.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Circuit Breakers */}
        <Card>
          <CardHeader>
            <CardTitle>Circuit Breaker Status</CardTitle>
            <CardDescription>API endpoints currently experiencing failures</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(dashboard.circuitBreakers).length === 0 ? (
              <div className="text-center py-6">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All circuit breakers are healthy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(dashboard.circuitBreakers).map(([service, status]) => (
                  <div key={service} className="flex items-center justify-between p-3 border border-red-200 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{service}</p>
                      <p className="text-xs text-muted-foreground">
                        Last failure: {new Date(status.lastFailure).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {status.failures} failures
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emergency Controls */}
      {dashboard.emergencyControls.apiDisabled && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300">Emergency API Shutdown</CardTitle>
            <CardDescription>All external APIs have been disabled to prevent cost overruns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Disabled Date:</strong> {dashboard.emergencyControls.disabledDate ? 
                  new Date(dashboard.emergencyControls.disabledDate).toLocaleString() : 'Unknown'}
              </p>
              <p className="text-sm">
                <strong>Affected Services:</strong>
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {dashboard.emergencyControls.disabledServices.map((service) => (
                  <Badge key={service} variant="destructive" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Limits Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Protection Limits</CardTitle>
          <CardDescription>Current cost protection configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm font-medium">Daily Cost Limit</p>
              <p className="text-lg font-bold text-green-600">${dashboard.limits.maxDailyCost}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Daily Call Limit</p>
              <p className="text-lg font-bold text-blue-600">{dashboard.limits.maxDailyCalls.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Max Per Operation</p>
              <p className="text-lg font-bold text-orange-600">${dashboard.limits.maxCostPerOperation}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Calls Per Operation</p>
              <p className="text-lg font-bold text-purple-600">{dashboard.limits.maxCallsPerOperation}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Emergency Stop At</p>
              <p className="text-lg font-bold text-red-600">${dashboard.limits.emergencyStopCost}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}