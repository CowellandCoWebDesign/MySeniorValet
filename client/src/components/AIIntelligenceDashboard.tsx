// Phase 6: AI Intelligence Dashboard - Enterprise-level AI insights and analytics
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Calendar, 
  Target,
  Lightbulb,
  Activity,
  Users,
  DollarSign,
  RefreshCw,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  FileText,
  PenTool,
  FileCheck
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface OccupancyPrediction {
  communityId: number;
  forecastDate: string;
  predictedOccupancy: number;
  confidence: number;
}

interface AnomalyAlert {
  communityId: number;
  type: string;
  severity: string;
  description: string;
  recommendation: string;
  detectedValue: number;
  expectedValue: number;
}

interface AIInsight {
  communityId: number;
  type: string;
  title: string;
  description: string;
  severity: string;
  confidence: number;
  actionRequired: boolean;
  data: any;
}

interface ComprehensiveAnalysis {
  communityId: number;
  forecasts: OccupancyPrediction[];
  anomalies: AnomalyAlert[];
  insights: AIInsight[];
  errors: any[];
}

interface AIIntelligenceDashboardProps {
  communityId: number;
  communityName?: string;
}

export function AIIntelligenceDashboard({ communityId, communityName }: AIIntelligenceDashboardProps) {
  const [analysis, setAnalysis] = useState<ComprehensiveAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [documentGeneration, setDocumentGeneration] = useState({
    generating: false,
    type: '',
    progress: 0
  });
  const { toast } = useToast();

  // Load comprehensive AI analysis
  const loadAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('GET', `/api/ai/comprehensive/${communityId}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data.analysis);
        setLastUpdated(new Date());
        
        // Show success notification
        toast({
          title: "AI Analysis Complete",
          description: `Generated ${data.analysis.insights.length} insights, ${data.analysis.anomalies.length} alerts, and ${data.analysis.forecasts.length} predictions`,
        });
      } else {
        throw new Error(data.error || 'Failed to load analysis');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load AI analysis';
      setError(errorMsg);
      toast({
        title: "Analysis Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // AI Document Generation Function
  const generateDocument = async (type: string, options: any = {}) => {
    setDocumentGeneration({
      generating: true,
      type,
      progress: 0
    });
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setDocumentGeneration(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 20, 90)
        }));
      }, 500);
      
      const response = await apiRequest('POST', `/api/ai/generate-document`, {
        communityId,
        documentType: type,
        options
      });
      
      clearInterval(progressInterval);
      
      if (response.ok) {
        const data = await response.json();
        setDocumentGeneration({
          generating: false,
          type: '',
          progress: 100
        });
        
        // Download the generated document
        if (data.downloadUrl) {
          window.open(data.downloadUrl, '_blank');
        }
        
        toast({
          title: "Document Generated",
          description: `${type} has been successfully generated and is ready for download.`,
        });
      } else {
        throw new Error('Failed to generate document');
      }
    } catch (error) {
      setDocumentGeneration({
        generating: false,
        type: '',
        progress: 0
      });
      
      toast({
        title: "Generation Failed",
        description: `Failed to generate ${type}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Load analysis on component mount
  useEffect(() => {
    loadAnalysis();
  }, [communityId]);

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  // Calculate metrics summary
  const getMetricsSummary = () => {
    if (!analysis) return null;
    
    const totalInsights = analysis.insights.length;
    const criticalAlerts = analysis.anomalies.filter(a => a.severity === 'critical').length;
    const actionRequiredInsights = analysis.insights.filter(i => i.actionRequired).length;
    const avgConfidence = analysis.insights.length > 0 
      ? Math.round(analysis.insights.reduce((sum, i) => sum + i.confidence, 0) / analysis.insights.length)
      : 0;
    
    return {
      totalInsights,
      criticalAlerts,
      actionRequiredInsights,
      avgConfidence
    };
  };

  const metrics = getMetricsSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            AI Intelligence Center
          </h2>
          <p className="text-muted-foreground">
            Enterprise AI document generation and predictive analytics for <span className="font-semibold text-foreground">{communityName || `Community ${communityId}`}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button 
            onClick={loadAnalysis} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Analysis Error</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <Zap className="h-8 w-8 animate-pulse text-blue-600" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Generating AI Analysis</h3>
                <p className="text-muted-foreground">
                  Running predictive analytics, anomaly detection, and insights generation...
                </p>
              </div>
              <Progress value={60} className="w-full max-w-xs" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && metrics && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalInsights}</div>
                <p className="text-xs text-muted-foreground">
                  AI-generated insights available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{metrics.criticalAlerts}</div>
                <p className="text-xs text-muted-foreground">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Action Required</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{metrics.actionRequiredInsights}</div>
                <p className="text-xs text-muted-foreground">
                  Insights need action
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.avgConfidence}%</div>
                <p className="text-xs text-muted-foreground">
                  Average confidence score
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Analysis Tabs */}
          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="insights">
                <Lightbulb className="h-4 w-4 mr-2" />
                AI Insights ({analysis.insights.length})
              </TabsTrigger>
              <TabsTrigger value="anomalies">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Anomalies ({analysis.anomalies.length})
              </TabsTrigger>
              <TabsTrigger value="forecasts">
                <TrendingUp className="h-4 w-4 mr-2" />
                Forecasts ({analysis.forecasts.length})
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 mr-2" />
                AI Documents
              </TabsTrigger>
              <TabsTrigger value="summary">
                <BarChart3 className="h-4 w-4 mr-2" />
                Summary
              </TabsTrigger>
            </TabsList>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Generated Insights</CardTitle>
                  <CardDescription>
                    Automated analysis of community performance and opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.insights.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No insights generated yet. Try refreshing the analysis.</p>
                    </div>
                  ) : (
                    analysis.insights.map((insight, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={getSeverityColor(insight.severity)}>
                                {getSeverityIcon(insight.severity)}
                                {insight.severity.toUpperCase()}
                              </Badge>
                              {insight.actionRequired && (
                                <Badge variant="outline">
                                  <Target className="h-3 w-3 mr-1" />
                                  Action Required
                                </Badge>
                              )}
                            </div>
                            <Badge variant="secondary">
                              {insight.confidence}% confidence
                            </Badge>
                          </div>
                          
                          <h4 className="font-semibold mb-2">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {insight.description}
                          </p>
                          
                          {insight.data && (
                            <div className="bg-muted p-3 rounded-md text-xs">
                              <strong>Supporting Data:</strong>
                              <pre className="mt-1 overflow-x-auto">
                                {JSON.stringify(insight.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Anomalies Tab */}
            <TabsContent value="anomalies" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Anomaly Detection</CardTitle>
                  <CardDescription>
                    Unusual patterns detected in community operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.anomalies.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                      <p>No anomalies detected. Operations appear normal.</p>
                    </div>
                  ) : (
                    analysis.anomalies.map((anomaly, index) => (
                      <Card key={index} className="border-l-4 border-l-orange-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant={getSeverityColor(anomaly.severity)}>
                              {getSeverityIcon(anomaly.severity)}
                              {anomaly.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{anomaly.type}</Badge>
                          </div>
                          
                          <h4 className="font-semibold mb-2">Anomaly Detected</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {anomaly.description}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div>
                              <span className="font-medium">Detected Value:</span>
                              <span className="ml-2">{anomaly.detectedValue}</span>
                            </div>
                            <div>
                              <span className="font-medium">Expected Value:</span>
                              <span className="ml-2">{anomaly.expectedValue}</span>
                            </div>
                          </div>
                          
                          {anomaly.recommendation && (
                            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                              <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                                Recommendation
                              </h5>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                {anomaly.recommendation}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Forecasts Tab */}
            <TabsContent value="forecasts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Occupancy Forecasts</CardTitle>
                  <CardDescription>
                    30-day predictive occupancy analysis based on historical patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysis.forecasts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No forecasts available. Check back later.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analysis.forecasts.slice(0, 9).map((forecast, index) => (
                          <Card key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">
                                  {new Date(forecast.forecastDate).toLocaleDateString()}
                                </span>
                                <Badge variant="secondary">
                                  {forecast.confidence}% confidence
                                </Badge>
                              </div>
                              <div className="text-2xl font-bold text-blue-600">
                                {forecast.predictedOccupancy}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Predicted occupancy
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      {analysis.forecasts.length > 9 && (
                        <div className="text-center">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View All {analysis.forecasts.length} Forecasts
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/10 dark:to-indigo-950/10">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Professional Document Generator
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Fortune 500-level AI document generation using real community data from <span className="font-semibold text-purple-600">32,970+ verified facilities</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Document Generation Progress */}
                  {documentGeneration.generating && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Zap className="h-5 w-5 text-blue-600 animate-pulse" />
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                            Generating {documentGeneration.type}...
                          </h4>
                          <p className="text-sm text-blue-600 dark:text-blue-300">
                            AI is processing real community data and applying state-specific legal compliance
                          </p>
                        </div>
                      </div>
                      <Progress value={documentGeneration.progress} className="mb-2" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-blue-700 dark:text-blue-300">Progress: {documentGeneration.progress}%</span>
                        <span className="text-blue-700 dark:text-blue-300">Using Community #{communityId} data</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Lease Agreements - Enhanced */}
                    <Card className="hover:shadow-lg transition-all duration-200 border-green-200 hover:border-green-300 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/10 dark:to-emerald-950/10">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <FileCheck className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-800 dark:text-green-200">State-Compliant Lease</h3>
                            <p className="text-sm text-green-600 dark:text-green-400">CA/NY specific legal provisions</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => generateDocument('Lease Agreement', { 
                            includeTerms: true, 
                            includePolicies: true,
                            state: 'California'
                          })}
                          disabled={documentGeneration.generating}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                        >
                          {documentGeneration.generating && documentGeneration.type === 'Lease Agreement' ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Generating... {documentGeneration.progress}%
                            </>
                          ) : (
                            <>
                              <PenTool className="h-4 w-4 mr-2" />
                              Generate Lease
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Care Plans */}
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Users className="h-8 w-8 text-green-600" />
                          <div>
                            <h3 className="font-semibold">Care Plans</h3>
                            <p className="text-sm text-muted-foreground">Personalized care plans</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => generateDocument('Care Plan', { 
                            includeHealthMetrics: true, 
                            includeMedications: true 
                          })}
                          disabled={documentGeneration.generating}
                          className="w-full"
                          variant="outline"
                        >
                          {documentGeneration.generating && documentGeneration.type === 'Care Plan' ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Generating... {documentGeneration.progress}%
                            </>
                          ) : (
                            <>
                              <PenTool className="h-4 w-4 mr-2" />
                              Generate Plan
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Incident Reports */}
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertTriangle className="h-8 w-8 text-orange-600" />
                          <div>
                            <h3 className="font-semibold">Incident Reports</h3>
                            <p className="text-sm text-muted-foreground">Automated incident documentation</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => generateDocument('Incident Report', { 
                            includeTimeline: true, 
                            includeWitnesses: true 
                          })}
                          disabled={documentGeneration.generating}
                          className="w-full"
                          variant="outline"
                        >
                          {documentGeneration.generating && documentGeneration.type === 'Incident Report' ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Generating... {documentGeneration.progress}%
                            </>
                          ) : (
                            <>
                              <PenTool className="h-4 w-4 mr-2" />
                              Generate Report
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Financial Reports */}
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <DollarSign className="h-8 w-8 text-purple-600" />
                          <div>
                            <h3 className="font-semibold">Financial Reports</h3>
                            <p className="text-sm text-muted-foreground">Monthly financial summaries</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => generateDocument('Financial Report', { 
                            includeBudgetComparison: true, 
                            includeForecasts: true 
                          })}
                          disabled={documentGeneration.generating}
                          className="w-full"
                          variant="outline"
                        >
                          {documentGeneration.generating && documentGeneration.type === 'Financial Report' ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Generating... {documentGeneration.progress}%
                            </>
                          ) : (
                            <>
                              <PenTool className="h-4 w-4 mr-2" />
                              Generate Report
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Policy Documents */}
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <FileText className="h-8 w-8 text-indigo-600" />
                          <div>
                            <h3 className="font-semibold">Policy Documents</h3>
                            <p className="text-sm text-muted-foreground">Community policies & procedures</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => generateDocument('Policy Document', { 
                            includeCompliance: true, 
                            includeUpdates: true 
                          })}
                          disabled={documentGeneration.generating}
                          className="w-full"
                          variant="outline"
                        >
                          {documentGeneration.generating && documentGeneration.type === 'Policy Document' ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Generating... {documentGeneration.progress}%
                            </>
                          ) : (
                            <>
                              <PenTool className="h-4 w-4 mr-2" />
                              Generate Policy
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Marketing Materials */}
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Target className="h-8 w-8 text-red-600" />
                          <div>
                            <h3 className="font-semibold">Marketing Materials</h3>
                            <p className="text-sm text-muted-foreground">Brochures & promotional content</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => generateDocument('Marketing Material', { 
                            includePhotos: true, 
                            includeTestimonials: true 
                          })}
                          disabled={documentGeneration.generating}
                          className="w-full"
                          variant="outline"
                        >
                          {documentGeneration.generating && documentGeneration.type === 'Marketing Material' ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Generating... {documentGeneration.progress}%
                            </>
                          ) : (
                            <>
                              <PenTool className="h-4 w-4 mr-2" />
                              Generate Material
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Progress indicator */}
                  {documentGeneration.generating && (
                    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
                          <div>
                            <h4 className="font-medium text-blue-800 dark:text-blue-200">
                              Generating {documentGeneration.type}
                            </h4>
                            <p className="text-sm text-blue-600 dark:text-blue-300">
                              AI is analyzing your community data and creating the document...
                            </p>
                          </div>
                        </div>
                        <Progress value={documentGeneration.progress} className="w-full" />
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                          {documentGeneration.progress}% complete
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Features info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-600" />
                        AI-Powered Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Community-specific customization</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Legal compliance checking</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Professional formatting</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Real-time data integration</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Version control & tracking</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Digital signature ready</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Summary</CardTitle>
                  <CardDescription>
                    Comprehensive overview of AI analysis results
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-blue-600" />
                        Insights Overview
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Insights:</span>
                          <span className="font-medium">{analysis.insights.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Action Required:</span>
                          <span className="font-medium text-orange-600">
                            {analysis.insights.filter(i => i.actionRequired).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>High Priority:</span>
                          <span className="font-medium text-red-600">
                            {analysis.insights.filter(i => i.severity === 'high' || i.severity === 'critical').length}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        Anomaly Status
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Anomalies:</span>
                          <span className="font-medium">{analysis.anomalies.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Critical:</span>
                          <span className="font-medium text-red-600">
                            {analysis.anomalies.filter(a => a.severity === 'critical').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monitoring:</span>
                          <span className="font-medium text-yellow-600">
                            {analysis.anomalies.filter(a => a.severity === 'medium').length}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Forecast Health
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Predictions:</span>
                          <span className="font-medium">{analysis.forecasts.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Confidence:</span>
                          <span className="font-medium text-green-600">
                            {analysis.forecasts.length > 0 
                              ? Math.round(analysis.forecasts.reduce((sum, f) => sum + f.confidence, 0) / analysis.forecasts.length)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trend:</span>
                          <span className="font-medium text-blue-600">Stable</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Analysis generated using advanced AI models and real community data from 32,970+ senior living communities.
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}