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
import { Loader2, Settings, RefreshCw, CheckCircle, XCircle, AlertCircle, ExternalLink, Shield } from "lucide-react";

interface CRMIntegrationPanelProps {
  communityId: number;
}

interface CRMIntegration {
  id: number;
  provider: 'aline' | 'yardi' | 'vitals';
  status: 'active' | 'inactive' | 'error';
  lastSync: string | null;
  configuration: {
    baseUrl: string;
    syncFrequency: 'real_time' | 'hourly' | 'daily';
    hasWebhook: boolean;
  };
}

interface CRMStats {
  totalIntegrations: number;
  activeIntegrations: number;
  lastSyncTimes: Record<string, string | null>;
  syncCounts: Record<string, number>;
}

const CRM_PROVIDERS = [
  {
    id: 'aline',
    name: 'ALINE',
    description: 'Senior living property management with lead tracking and tour scheduling',
    icon: '🏢',
    color: 'bg-blue-500',
    features: ['Lead Management', 'Tour Scheduling', 'Contact Forms', 'Follow-up Tracking']
  },
  {
    id: 'yardi',
    name: 'Yardi',
    description: 'Comprehensive real estate management platform with resident services',
    icon: '🏘️',
    color: 'bg-green-500',
    features: ['Prospect Management', 'Lease Management', 'Resident Portal', 'Financial Reporting']
  },
  {
    id: 'vitals',
    name: 'Vitals',
    description: 'Healthcare and wellness management for senior communities',
    icon: '🏥',
    color: 'bg-red-500',
    features: ['Patient Records', 'Care Plans', 'Medical Tracking', 'Health Assessments']
  }
];

export function CRMIntegrationPanel({ communityId }: CRMIntegrationPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    baseUrl: '',
    webhookUrl: '',
    syncFrequency: 'hourly' as 'real_time' | 'hourly' | 'daily'
  });

  // Fetch existing integrations
  const { data: integrations, isLoading: integrationsLoading } = useQuery<{ integrations: CRMIntegration[] }>({
    queryKey: [`/api/crm-integrations/${communityId}`],
    retry: false
  });

  // Fetch sync statistics
  const { data: stats } = useQuery<{ stats: CRMStats }>({
    queryKey: [`/api/crm-integrations/${communityId}/stats`],
    retry: false
  });

  // Configure integration mutation
  const configureIntegration = useMutation({
    mutationFn: async (data: { provider: string; config: any }) => {
      return await apiRequest("POST", `/api/crm-integrations/${communityId}/${data.provider}`, data.config);
    },
    onSuccess: (data) => {
      toast({
        title: "Integration Configured",
        description: `${selectedProvider.toUpperCase()} integration has been successfully configured and tested.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/crm-integrations/${communityId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/crm-integrations/${communityId}/stats`] });
      setConfigDialogOpen(false);
      setFormData({ apiKey: '', apiSecret: '', baseUrl: '', webhookUrl: '', syncFrequency: 'hourly' });
    },
    onError: (error: any) => {
      toast({
        title: "Configuration Failed",
        description: error.message || "Failed to configure CRM integration",
        variant: "destructive",
      });
    }
  });

  // Test connection mutation
  const testConnection = useMutation({
    mutationFn: async (data: { provider: string; config: any }) => {
      return await apiRequest("POST", `/api/crm-integrations/${communityId}/${data.provider}/test`, data.config);
    },
    onSuccess: () => {
      toast({
        title: "Connection Test Successful",
        description: "Successfully connected to the CRM system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Test Failed",
        description: error.message || "Failed to connect to CRM system",
        variant: "destructive",
      });
    }
  });

  // Sync data mutation
  const syncData = useMutation({
    mutationFn: async (data: { provider: string }) => {
      return await apiRequest("POST", `/api/crm-integrations/${communityId}/${data.provider}/sync`);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Data Sync Completed",
        description: `Successfully synced ${data.dataCount} records from ${selectedProvider.toUpperCase()}.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/crm-integrations/${communityId}/stats`] });
    },
    onError: (error: any) => {
      toast({
        title: "Data Sync Failed",
        description: error.message || "Failed to sync data from CRM system",
        variant: "destructive",
      });
    }
  });

  // Disable integration mutation
  const disableIntegration = useMutation({
    mutationFn: async (provider: string) => {
      return await apiRequest("DELETE", `/api/crm-integrations/${communityId}/${provider}`);
    },
    onSuccess: () => {
      toast({
        title: "Integration Disabled",
        description: "CRM integration has been disabled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/crm-integrations/${communityId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/crm-integrations/${communityId}/stats`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Disable",
        description: error.message || "Failed to disable CRM integration",
        variant: "destructive",
      });
    }
  });

  const handleConfigureIntegration = (providerId: string) => {
    setSelectedProvider(providerId);
    setConfigDialogOpen(true);
    
    // Set default base URLs
    const defaultUrls = {
      aline: 'https://api.aline.com',
      yardi: 'https://api.yardi.com',
      vitals: 'https://api.vitals.com'
    };
    setFormData(prev => ({
      ...prev,
      baseUrl: defaultUrls[providerId as keyof typeof defaultUrls] || ''
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields based on provider
    const config: any = {
      apiKey: formData.apiKey,
      baseUrl: formData.baseUrl,
      syncFrequency: formData.syncFrequency
    };

    if (formData.webhookUrl) {
      config.webhookUrl = formData.webhookUrl;
    }

    if (selectedProvider === 'yardi' && formData.apiSecret) {
      config.apiSecret = formData.apiSecret;
    }

    configureIntegration.mutate({ provider: selectedProvider, config });
  };

  const getIntegrationStatus = (provider: string) => {
    return integrations?.integrations.find(i => i.provider === provider);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600">Not Configured</Badge>;
    }
  };

  if (integrationsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            CRM Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            CRM Integrations
          </div>
          {stats && (
            <Badge variant="outline">
              {stats.stats.activeIntegrations} of {CRM_PROVIDERS.length} Active
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Connect your community management software to sync leads, residents, and health data automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="providers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="providers">Available Providers</TabsTrigger>
            <TabsTrigger value="stats">Sync Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="providers" className="space-y-4 mt-4">
            <div className="grid gap-4">
              {CRM_PROVIDERS.map((provider) => {
                const integration = getIntegrationStatus(provider.id);
                return (
                  <Card key={provider.id} className="border-l-4" style={{ borderLeftColor: provider.color.replace('bg-', '').replace('500', '') }}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{provider.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{provider.name}</h3>
                              {getStatusBadge(integration?.status || 'not-configured')}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {provider.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {provider.features.map((feature) => (
                                <Badge key={feature} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                            {integration && integration.lastSync && (
                              <p className="text-xs text-muted-foreground">
                                Last sync: {new Date(integration.lastSync).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {integration?.status === 'active' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => syncData.mutate({ provider: provider.id })}
                                disabled={syncData.isPending}
                              >
                                {syncData.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => disableIntegration.mutate(provider.id)}
                                disabled={disableIntegration.isPending}
                              >
                                Disable
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleConfigureIntegration(provider.id)}
                            disabled={configureIntegration.isPending}
                          >
                            {integration ? 'Reconfigure' : 'Configure'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4 mt-4">
            {stats ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Integration Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Integrations:</span>
                        <span className="font-medium">{stats.stats.totalIntegrations}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Active Integrations:</span>
                        <span className="font-medium text-green-600">{stats.stats.activeIntegrations}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Sync Counts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.stats.syncCounts).map(([provider, count]) => (
                        <div key={provider} className="flex justify-between text-sm">
                          <span className="capitalize">{provider}:</span>
                          <span className="font-medium">{count} syncs</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No integration statistics available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Configuration Dialog */}
        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Configure {selectedProvider.toUpperCase()} Integration</DialogTitle>
              <DialogDescription>
                Enter your {selectedProvider.toUpperCase()} API credentials to enable data synchronization.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key *</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                  required
                  placeholder="Enter your API key"
                />
              </div>
              
              {selectedProvider === 'yardi' && (
                <div className="space-y-2">
                  <Label htmlFor="apiSecret">API Secret *</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    value={formData.apiSecret}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiSecret: e.target.value }))}
                    required
                    placeholder="Enter your API secret"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL *</Label>
                <Input
                  id="baseUrl"
                  type="url"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                  required
                  placeholder="https://api.example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  value={formData.webhookUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://your-domain.com/webhook"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="syncFrequency">Sync Frequency</Label>
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
                    <SelectItem value="real_time">Real-time (webhook required)</SelectItem>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => testConnection.mutate({ 
                    provider: selectedProvider, 
                    config: formData 
                  })}
                  disabled={!formData.apiKey || !formData.baseUrl || testConnection.isPending}
                  className="flex-1"
                >
                  {testConnection.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Test Connection
                </Button>
                <Button 
                  type="submit" 
                  disabled={configureIntegration.isPending}
                  className="flex-1"
                >
                  {configureIntegration.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Configure
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}