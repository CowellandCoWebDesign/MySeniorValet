import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  Home, 
  BarChart3,
  Target,
  Zap,
  Calendar,
  Users
} from "lucide-react";

interface RMSIntegrationPanelProps {
  communityId: number;
}

interface RMSIntegration {
  id: number;
  provider: 'aline' | 'yardi' | 'lcs' | 'reps' | 'onesite' | 'entrata';
  status: 'active' | 'inactive' | 'error' | 'testing';
  lastSync: string | null;
  dataQualityScore: number;
  pricingAccuracy: number;
  configuration: {
    baseUrl: string;
    syncFrequency: 'real_time' | 'hourly' | 'daily';
    enabledFeatures: Array<'pricing' | 'occupancy' | 'revenue' | 'forecasting' | 'competitive'>;
  };
}

interface RMSRevenueData {
  id: number;
  unitType: string;
  baseRate: string;
  careRate: string;
  totalRate: string;
  totalUnits: number;
  occupiedUnits: number;
  availableUnits: number;
  occupancyRate: string;
  revpar: string;
  adr: string;
  monthlyRevenue: string;
  marketRate: string;
  pricePosition: 'below' | 'at' | 'above';
  demandScore: number;
  projectedOccupancy: string;
  dataDate: string;
  provider: string;
}

interface RMSAnalytics {
  totalRevenue: number;
  occupancyRate: number;
  averageRate: number;
  availableUnits: number;
  revenueGrowth: number;
  marketPosition: 'above' | 'at' | 'below' | 'unknown';
}

const RMS_PROVIDERS = [
  {
    id: 'aline',
    name: 'ALINE (Glennis)',
    description: 'Complete revenue management with dynamic pricing and market intelligence',
    icon: '💰',
    color: 'bg-emerald-500',
    features: ['Dynamic Pricing', 'Market Analysis', 'Revenue Forecasting', 'Competitive Intelligence', 'Occupancy Optimization']
  },
  {
    id: 'yardi',
    name: 'Yardi RMS',
    description: 'Comprehensive property revenue management with rent optimization',
    icon: '📊',
    color: 'bg-blue-500',
    features: ['Rent Optimization', 'Market Rent Analysis', 'Lease Management', 'Revenue Analytics', 'Concession Management']
  },
  {
    id: 'lcs',
    name: 'LCS RMS',
    description: 'Senior living specific revenue management and pricing optimization',
    icon: '🏠',
    color: 'bg-purple-500',
    features: ['Care Level Pricing', 'Occupancy Analytics', 'Senior Living Metrics', 'Market Positioning']
  },
  {
    id: 'reps',
    name: 'REPS',
    description: 'Real Estate Portfolio Solutions revenue management platform',
    icon: '📈',
    color: 'bg-orange-500',
    features: ['Portfolio Analytics', 'Revenue Optimization', 'Market Intelligence', 'Performance Tracking']
  }
];

export function RMSIntegrationPanel({ communityId }: RMSIntegrationPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    baseUrl: '',
    revenueEndpoint: '',
    pricingEndpoint: '',
    occupancyEndpoint: '',
    syncFrequency: 'hourly' as 'real_time' | 'hourly' | 'daily',
    enabledFeatures: ['pricing', 'occupancy', 'revenue'] as Array<'pricing' | 'occupancy' | 'revenue' | 'forecasting' | 'competitive'>
  });

  // Fetch RMS integrations
  const { data: rmsIntegrations, isLoading: integrationsLoading } = useQuery({
    queryKey: [`/api/rms/integrations/${communityId}`],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch RMS revenue data
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: [`/api/rms/revenue-data/${communityId}`],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch RMS analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: [`/api/rms/analytics/${communityId}`],
    refetchInterval: 60000,
  });

  // Configure RMS integration
  const configureIntegration = useMutation({
    mutationFn: async (data: { provider: string; config: typeof formData }) => {
      return await apiRequest("POST", `/api/rms/configure`, {
        communityId,
        provider: data.provider,
        config: data.config
      });
    },
    onSuccess: () => {
      toast({
        title: "RMS Integration Configured",
        description: "Revenue management system integration has been set up successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/rms/integrations/${communityId}`] });
      setConfigDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Configuration Failed",
        description: error.message || "Failed to configure RMS integration.",
        variant: "destructive",
      });
    },
  });

  // Sync RMS data
  const syncData = useMutation({
    mutationFn: async (provider: string) => {
      return await apiRequest("POST", `/api/rms/sync`, {
        communityId,
        provider
      });
    },
    onSuccess: () => {
      toast({
        title: "RMS Data Synced",
        description: "Revenue management data has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/rms/revenue-data/${communityId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/rms/analytics/${communityId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync RMS data.",
        variant: "destructive",
      });
    },
  });

  const handleConfigure = () => {
    if (!selectedProvider) return;
    configureIntegration.mutate({ provider: selectedProvider, config: formData });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      error: 'destructive',
      testing: 'secondary',
      inactive: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatPercentage = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Revenue Management System</h2>
          <p className="text-muted-foreground">Real-time pricing, occupancy, and market intelligence</p>
        </div>
        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Configure RMS
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure RMS Integration</DialogTitle>
              <DialogDescription>
                Connect your revenue management system to get real-time pricing and occupancy data.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Provider Selection */}
              <div className="space-y-2">
                <Label>RMS Provider</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an RMS provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {RMS_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex items-center space-x-2">
                          <span>{provider.icon}</span>
                          <span>{provider.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedProvider && (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <div className="text-sm">
                      <strong>{RMS_PROVIDERS.find(p => p.id === selectedProvider)?.name}</strong>
                      <p className="text-muted-foreground mt-1">
                        {RMS_PROVIDERS.find(p => p.id === selectedProvider)?.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {RMS_PROVIDERS.find(p => p.id === selectedProvider)?.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedProvider && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key *</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={formData.apiKey}
                        onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder="Your RMS API key"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiSecret">API Secret</Label>
                      <Input
                        id="apiSecret"
                        type="password"
                        value={formData.apiSecret}
                        onChange={(e) => setFormData(prev => ({ ...prev, apiSecret: e.target.value }))}
                        placeholder="API secret (if required)"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="baseUrl">Base URL *</Label>
                    <Input
                      id="baseUrl"
                      value={formData.baseUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                      placeholder={`https://api.${selectedProvider}.com`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sync Frequency</Label>
                    <Select 
                      value={formData.syncFrequency} 
                      onValueChange={(value: 'real_time' | 'hourly' | 'daily') => 
                        setFormData(prev => ({ ...prev, syncFrequency: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="real_time">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleConfigure} 
                      disabled={configureIntegration.isPending}
                      className="flex-1"
                    >
                      {configureIntegration.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Configure Integration
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Data</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {analyticsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Total Revenue */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    +{analytics.revenueGrowth}% from last month
                  </p>
                </CardContent>
              </Card>

              {/* Occupancy Rate */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(analytics.occupancyRate)}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.availableUnits} units available
                  </p>
                </CardContent>
              </Card>

              {/* Average Rate */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.averageRate)}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.marketPosition} market average
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No RMS Data Available</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Configure an RMS integration to see real-time revenue and pricing data.
                </p>
                <Button onClick={() => setConfigDialogOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Setup RMS Integration
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pricing Data Tab */}
        <TabsContent value="pricing" className="space-y-4">
          {revenueLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : revenueData && revenueData.length > 0 ? (
            <div className="grid gap-4">
              {revenueData.map((data: RMSRevenueData) => (
                <Card key={data.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="capitalize">{data.unitType.replace('_', ' ')}</CardTitle>
                      <Badge className={`${data.provider === 'aline' ? 'bg-emerald-500' : 'bg-blue-500'} text-white`}>
                        {data.provider.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Base Rate</p>
                        <p className="text-xl font-semibold">{formatCurrency(data.baseRate)}</p>
                      </div>
                      {data.careRate && (
                        <div>
                          <p className="text-sm text-muted-foreground">Care Rate</p>
                          <p className="text-xl font-semibold">{formatCurrency(data.careRate)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Total Rate</p>
                        <p className="text-xl font-semibold text-green-600">{formatCurrency(data.totalRate)}</p>
                      </div>
                      {data.marketRate && (
                        <div>
                          <p className="text-sm text-muted-foreground">Market Rate</p>
                          <p className="text-xl font-semibold">{formatCurrency(data.marketRate)}</p>
                          <Badge 
                            variant={
                              data.pricePosition === 'above' ? 'destructive' : 
                              data.pricePosition === 'below' ? 'default' : 'secondary'
                            }
                            className="text-xs mt-1"
                          >
                            {data.pricePosition} market
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pricing data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Occupancy Tab */}
        <TabsContent value="occupancy" className="space-y-4">
          {revenueData && revenueData.length > 0 ? (
            <div className="grid gap-4">
              {revenueData.map((data: RMSRevenueData) => (
                <Card key={data.id}>
                  <CardHeader>
                    <CardTitle className="capitalize">{data.unitType.replace('_', ' ')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Units</p>
                        <p className="text-2xl font-semibold">{data.totalUnits}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Occupied</p>
                        <p className="text-2xl font-semibold text-green-600">{data.occupiedUnits}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Available</p>
                        <p className="text-2xl font-semibold text-orange-600">{data.availableUnits}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                        <p className="text-2xl font-semibold">{formatPercentage(data.occupancyRate)}</p>
                        {data.projectedOccupancy && (
                          <p className="text-xs text-muted-foreground">
                            Projected: {formatPercentage(data.projectedOccupancy)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Demand Score */}
                    {data.demandScore && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Demand Score</span>
                          <Badge variant={data.demandScore > 80 ? 'default' : data.demandScore > 60 ? 'secondary' : 'outline'}>
                            {data.demandScore}/100
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${data.demandScore}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No occupancy data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          {integrationsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : rmsIntegrations && rmsIntegrations.length > 0 ? (
            <div className="grid gap-4">
              {rmsIntegrations.map((integration: RMSIntegration) => (
                <Card key={integration.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(integration.status)}
                      <div>
                        <CardTitle className="text-lg">
                          {RMS_PROVIDERS.find(p => p.id === integration.provider)?.name}
                        </CardTitle>
                        <CardDescription>
                          {RMS_PROVIDERS.find(p => p.id === integration.provider)?.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(integration.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => syncData.mutate(integration.provider)}
                        disabled={syncData.isPending}
                      >
                        {syncData.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Last Sync</p>
                        <p className="text-sm">
                          {integration.lastSync 
                            ? new Date(integration.lastSync).toLocaleString()
                            : 'Never'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Data Quality</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${integration.dataQualityScore}%` }}
                            />
                          </div>
                          <span className="text-sm">{integration.dataQualityScore}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pricing Accuracy</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${integration.pricingAccuracy}%` }}
                            />
                          </div>
                          <span className="text-sm">{integration.pricingAccuracy}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sync Frequency</p>
                        <Badge variant="outline" className="text-xs">
                          {integration.configuration.syncFrequency.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Enabled Features</p>
                      <div className="flex flex-wrap gap-1">
                        {integration.configuration.enabledFeatures.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No RMS Integrations</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Set up your first RMS integration to start managing revenue data.
                </p>
                <Button onClick={() => setConfigDialogOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Add RMS Integration
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}