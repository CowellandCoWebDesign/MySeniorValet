import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  DollarSign, 
  Activity, 
  Search, 
  ExternalLink, 
  RefreshCw,
  Cloud,
  BarChart3,
  Settings,
  MapPin,
  Database,
  HardDrive
} from 'lucide-react';

interface GoogleCloudService {
  serviceName: string;
  description: string;
  pricingModel: string;
  potentialCauses: string[];
  costPerUnit: string;
  investigationQueries: string[];
  commonIssues: string[];
}

interface BillingInvestigation {
  suspectedServices: GoogleCloudService[];
  investigationSteps: string[];
  costBreakdownAnalysis: {
    mapsAPI: number;
    placesAPI: number;
    geocodingAPI: number;
    computeEngine: number;
    cloudStorage: number;
    cloudSQL: number;
    otherServices: number;
  };
  timeframeAnalysis: {
    dailyCosts: { date: string; cost: number }[];
    peakUsageTimes: string[];
    suspiciousSpikes: { date: string; cost: number; possibleCause: string }[];
  };
  recommendations: string[];
}

interface GoogleCloudBillingData {
  investigation: BillingInvestigation;
  investigationQueries: string[];
  immediateActions: string[];
  consoleNavigation: { section: string; instructions: string[] }[];
  summary: {
    totalEstimatedCost: number;
    topSuspectedServices: string[];
    criticalFindings: string[];
  };
}

export default function GoogleCloudBilling() {
  const [selectedService, setSelectedService] = useState<GoogleCloudService | null>(null);

  const { data: billingData, isLoading, refetch } = useQuery<GoogleCloudBillingData>({
    queryKey: ['/api/admin/google-cloud-billing'],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.includes('Maps')) return <MapPin className="h-4 w-4" />;
    if (serviceName.includes('Places')) return <Search className="h-4 w-4" />;
    if (serviceName.includes('Storage')) return <HardDrive className="h-4 w-4" />;
    if (serviceName.includes('SQL') || serviceName.includes('Database')) return <Database className="h-4 w-4" />;
    if (serviceName.includes('Compute')) return <Activity className="h-4 w-4" />;
    return <Cloud className="h-4 w-4" />;
  };

  const getSeverityColor = (cost: number) => {
    if (cost > 30) return 'bg-red-100 text-red-800 border-red-200';
    if (cost > 15) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (cost > 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!billingData) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Investigation Failed</AlertTitle>
          <AlertDescription>
            Could not load Google Cloud billing investigation. Please try refreshing.
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
          <h1 className="text-3xl font-bold text-gray-900">Google Cloud Billing Investigation</h1>
          <p className="text-gray-600 mt-2">Comprehensive analysis of your $82 Google Cloud charge</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>

      {/* Critical Findings Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="text-red-800">Critical Cost Analysis</AlertTitle>
        <AlertDescription className="text-red-700">
          <div className="space-y-2 mt-2">
            {billingData.summary.criticalFindings.map((finding, index) => (
              <div key={index} className="flex items-center gap-2">
                <DollarSign className="h-3 w-3" />
                <span className="text-sm">{finding}</span>
              </div>
            ))}
          </div>
        </AlertDescription>
      </Alert>

      {/* Cost Breakdown Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-700">Estimated Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(billingData.summary.totalEstimatedCost)}
            </div>
            <p className="text-xs text-red-500 mt-1">vs $82.00 actual</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-700">Places API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600">
              {formatCurrency(billingData.investigation.costBreakdownAnalysis.placesAPI)}
            </div>
            <p className="text-xs text-orange-500 mt-1">Highest suspect</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700">Maps API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">
              {formatCurrency(billingData.investigation.costBreakdownAnalysis.mapsAPI)}
            </div>
            <p className="text-xs text-blue-500 mt-1">Repeated loads</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700">Other Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(billingData.investigation.costBreakdownAnalysis.otherServices)}
            </div>
            <p className="text-xs text-green-500 mt-1">Unknown costs</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">Suspected Services</TabsTrigger>
          <TabsTrigger value="console">Console Guide</TabsTrigger>
          <TabsTrigger value="queries">Investigation Queries</TabsTrigger>
          <TabsTrigger value="actions">Immediate Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {billingData.investigation.suspectedServices.map((service, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedService?.serviceName === service.serviceName ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedService(selectedService?.serviceName === service.serviceName ? null : service)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getServiceIcon(service.serviceName)}
                      <div>
                        <CardTitle className="text-lg">{service.serviceName}</CardTitle>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(
                      service.serviceName.includes('Places') ? billingData.investigation.costBreakdownAnalysis.placesAPI :
                      service.serviceName.includes('Maps') ? billingData.investigation.costBreakdownAnalysis.mapsAPI :
                      service.serviceName.includes('Geocoding') ? billingData.investigation.costBreakdownAnalysis.geocodingAPI :
                      5
                    )}>
                      {service.pricingModel.split(' ')[0]}
                    </Badge>
                  </div>
                </CardHeader>
                
                {selectedService?.serviceName === service.serviceName && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Potential Cost Causes:</h4>
                        <ul className="space-y-1">
                          {service.potentialCauses.map((cause, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 mt-0.5 text-orange-500 flex-shrink-0" />
                              {cause}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Common Issues:</h4>
                        <ul className="space-y-1">
                          {service.commonIssues.map((issue, idx) => (
                            <li key={idx} className="text-sm text-red-600 flex items-start gap-2">
                              <DollarSign className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="console" className="space-y-4">
          {billingData.consoleNavigation.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {section.section}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {section.instructions.map((instruction, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-3">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      {instruction}
                    </li>
                  ))}
                </ol>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <a href="https://console.cloud.google.com" target="_blank" rel="noopener">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Google Cloud Console
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="queries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Billing Export SQL Queries
              </CardTitle>
              <p className="text-sm text-gray-600">
                Run these queries in BigQuery if you have billing export enabled
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingData.investigationQueries.map((query, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm text-gray-800">{query}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                Immediate Cost Control Actions
              </CardTitle>
              <p className="text-sm text-red-600">
                Implement these immediately to prevent further charges
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {billingData.immediateActions.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm text-red-800">{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Suspicious Cost Spikes */}
      {billingData.investigation.timeframeAnalysis.suspiciousSpikes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suspicious Cost Spikes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingData.investigation.timeframeAnalysis.suspiciousSpikes.map((spike, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{spike.date}</div>
                    <div className="text-sm text-gray-600">{spike.possibleCause}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">{formatCurrency(spike.cost)}</div>
                    <div className="text-xs text-gray-500">estimated</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}