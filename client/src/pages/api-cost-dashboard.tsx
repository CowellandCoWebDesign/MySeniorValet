import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, DollarSign, Activity, TrendingUp, RefreshCw } from "lucide-react";

interface ApiCostBreakdown {
  action: string;
  endpoint: string;
  callsPerAction: number;
  costPerCall: number;
  totalCostPerAction: number;
  frequency: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface PageLoadCosts {
  page: string;
  apiCalls: {
    endpoint: string;
    callCount: number;
    costPerCall: number;
    totalCost: number;
  }[];
  totalPageCost: number;
  estimatedDailyCost: number;
}

interface BurnAnalysis {
  possibleCauses: string[];
  calculations: { scenario: string; cost: number }[];
  recommendations: string[];
}

export default function ApiCostDashboard() {
  const { data: analysis, isLoading, refetch } = useQuery<{
    actionCosts: ApiCostBreakdown[];
    pageLoadCosts: PageLoadCosts[];
    burnAnalysis: BurnAnalysis;
    timestamp: string;
  }>({
    queryKey: ['/api/admin/api-costs/analysis'],
    // POLLING REMOVED FOR COST PROTECTION - Manual refresh only
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCost = (cost: number) => {
    if (cost < 0.01) return '$0.00';
    return `$${cost.toFixed(3)}`;
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">API Cost Analysis</h1>
          <Button disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">API Cost Analysis</h1>
        <Button onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {analysis && (
        <div className="grid gap-6">
          {/* $300 Burn Investigation */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>$300 API Burn Investigation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Possible Causes:</h3>
                  <ul className="space-y-1">
                    {analysis.burnAnalysis.possibleCauses.map((cause, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-red-600 mt-1">•</span>
                        <span className="text-sm">{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Cost Scenarios:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.burnAnalysis.calculations.map((calc, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="font-medium text-sm">{calc.scenario}</div>
                        <div className={`text-lg font-bold ${calc.cost > 100 ? 'text-red-600' : calc.cost > 50 ? 'text-orange-600' : 'text-green-600'}`}>
                          {formatCost(calc.cost)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Recommendations:</h3>
                  <ul className="space-y-1">
                    {analysis.burnAnalysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Costs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Cost Per Action</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.actionCosts.map((action, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{action.action}</div>
                      <div className="text-sm text-gray-600">{action.endpoint}</div>
                      <div className="text-xs text-gray-500">{action.frequency}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-bold text-lg">{formatCost(action.totalCostPerAction)}</div>
                      <div className="text-xs text-gray-500">
                        {action.callsPerAction} calls × {formatCost(action.costPerCall)}
                      </div>
                      <Badge className={`text-xs ${getRiskColor(action.riskLevel)} text-white`}>
                        {action.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Page Load Costs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Cost Per Page Load</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.pageLoadCosts.map((page, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{page.page}</h3>
                      <div className="text-right">
                        <div className="font-bold">{formatCost(page.totalPageCost)}</div>
                        <div className="text-xs text-gray-500">per load</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {page.apiCalls.map((call, j) => (
                        <div key={j} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{call.endpoint}</span>
                          <span>{call.callCount} calls × {formatCost(call.costPerCall)} = {formatCost(call.totalCost)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Estimated Daily Cost (1000 loads)</span>
                        <span className="font-medium">{formatCost(page.estimatedDailyCost)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Cost Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600">Normal Operations</div>
                  <div className="text-2xl font-bold text-green-700">
                    {formatCost(analysis.pageLoadCosts.reduce((sum, page) => sum + page.estimatedDailyCost, 0))}
                  </div>
                  <div className="text-xs text-green-600">per day</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-yellow-600">Photo Enrichment</div>
                  <div className="text-2xl font-bold text-yellow-700">
                    {formatCost(analysis.actionCosts.find(a => a.action === 'Photo Enrichment (ALL Communities)')?.totalCostPerAction || 0)}
                  </div>
                  <div className="text-xs text-yellow-600">per full run</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-600">High Risk Operations</div>
                  <div className="text-2xl font-bold text-red-700">
                    {formatCost(analysis.actionCosts.filter(a => a.riskLevel === 'critical').reduce((sum, a) => sum + a.totalCostPerAction, 0))}
                  </div>
                  <div className="text-xs text-red-600">per execution</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-xs text-gray-500 text-center">
            Last updated: {new Date(analysis.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}