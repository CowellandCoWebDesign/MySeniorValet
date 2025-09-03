import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import {
  Zap, Database, Activity, Shield, Settings, Key, Globe,
  CheckCircle, XCircle, AlertCircle, RefreshCw, Download,
  Upload, Link2, Copy, Eye, EyeOff, Play, Pause, Trash2,
  Calendar, Users, Building, Heart, DollarSign, FileText,
  Phone, Mail, MessageSquare, TrendingUp, Package, Cpu
} from 'lucide-react';

interface ApiIntegrationHubProps {
  corporateId: string;
  viewMode?: 'admin' | 'readonly';
}

interface Integration {
  id: string;
  name: string;
  category: 'crm' | 'erp' | 'healthcare' | 'marketing' | 'communication' | 'analytics';
  icon: React.ElementType;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync?: string;
  recordsSynced?: number;
  apiEndpoint?: string;
  webhookUrl?: string;
  apiKey?: string;
  description: string;
  features: string[];
  color: string;
}

const availableIntegrations: Integration[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'crm',
    icon: Users,
    status: 'disconnected',
    description: 'Sync resident data, leads, and opportunities with Salesforce CRM',
    features: ['Lead Management', 'Contact Sync', 'Opportunity Tracking', 'Custom Fields'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    icon: TrendingUp,
    status: 'disconnected',
    description: 'Connect with HubSpot for marketing automation and CRM',
    features: ['Marketing Automation', 'Email Campaigns', 'Lead Scoring', 'Analytics'],
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'epic',
    name: 'Epic Systems',
    category: 'healthcare',
    icon: Heart,
    status: 'disconnected',
    description: 'Integrate with Epic for comprehensive healthcare records',
    features: ['EHR Integration', 'Patient Records', 'Care Plans', 'Medication Management'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'erp',
    icon: DollarSign,
    status: 'disconnected',
    description: 'Sync financial data with QuickBooks accounting',
    features: ['Invoice Sync', 'Payment Processing', 'Financial Reports', 'Tax Management'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'communication',
    icon: Phone,
    status: 'disconnected',
    description: 'Enable SMS and voice communications through Twilio',
    features: ['SMS Notifications', 'Voice Calls', 'Emergency Alerts', 'Two-way Messaging'],
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'marketing',
    icon: Mail,
    status: 'disconnected',
    description: 'Email marketing and newsletter management',
    features: ['Email Campaigns', 'Newsletter Templates', 'Subscriber Management', 'Analytics'],
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'tableau',
    name: 'Tableau',
    category: 'analytics',
    icon: Activity,
    status: 'disconnected',
    description: 'Advanced data visualization and analytics',
    features: ['Custom Dashboards', 'Data Visualization', 'Predictive Analytics', 'Reports'],
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    icon: MessageSquare,
    status: 'disconnected',
    description: 'Team communication and notifications',
    features: ['Real-time Alerts', 'Team Channels', 'File Sharing', 'Bot Integration'],
    color: 'from-purple-600 to-pink-600'
  },
  {
    id: 'microsoft365',
    name: 'Microsoft 365',
    category: 'erp',
    icon: Package,
    status: 'disconnected',
    description: 'Complete Microsoft Office integration',
    features: ['SharePoint Sync', 'Teams Integration', 'Calendar Sync', 'Document Management'],
    color: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'analytics',
    icon: Zap,
    status: 'disconnected',
    description: 'Automate workflows between 5000+ apps',
    features: ['Custom Workflows', '5000+ App Connections', 'Multi-step Zaps', 'Filters & Paths'],
    color: 'from-orange-600 to-yellow-600'
  }
];

export default function ApiIntegrationHub({ corporateId, viewMode = 'admin' }: ApiIntegrationHubProps) {
  const [integrations, setIntegrations] = useState<Integration[]>(availableIntegrations);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [syncInProgress, setSyncInProgress] = useState<string | null>(null);

  // Mock API configuration form state
  const [apiConfig, setApiConfig] = useState({
    apiKey: '',
    apiSecret: '',
    webhookUrl: '',
    syncFrequency: 'hourly',
    dataMapping: {
      residents: true,
      staff: true,
      financials: true,
      healthcare: false,
      communications: true
    }
  });

  const handleConnect = async (integration: Integration) => {
    setSyncInProgress(integration.id);
    
    // Simulate connection process
    setTimeout(() => {
      setIntegrations(prev => prev.map(int => 
        int.id === integration.id 
          ? { ...int, status: 'connected' as const, lastSync: new Date().toISOString() }
          : int
      ));
      setSyncInProgress(null);
      toast({
        title: 'Integration Connected',
        description: `${integration.name} has been successfully connected.`,
      });
    }, 2000);
  };

  const handleDisconnect = (integration: Integration) => {
    setIntegrations(prev => prev.map(int => 
      int.id === integration.id 
        ? { ...int, status: 'disconnected' as const }
        : int
    ));
    toast({
      title: 'Integration Disconnected',
      description: `${integration.name} has been disconnected.`,
    });
  };

  const handleSync = async (integration: Integration) => {
    setSyncInProgress(integration.id);
    
    // Simulate sync process
    setTimeout(() => {
      setIntegrations(prev => prev.map(int => 
        int.id === integration.id 
          ? { 
              ...int, 
              lastSync: new Date().toISOString(),
              recordsSynced: Math.floor(Math.random() * 10000) + 1000
            }
          : int
      ));
      setSyncInProgress(null);
      toast({
        title: 'Sync Complete',
        description: `Successfully synced data with ${integration.name}.`,
      });
    }, 3000);
  };

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge className="bg-gray-100 text-gray-700">
            <XCircle className="w-3 h-3 mr-1" />
            Disconnected
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      case 'syncing':
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Syncing
          </Badge>
        );
    }
  };

  const getCategoryIcon = (category: Integration['category']) => {
    switch (category) {
      case 'crm': return Users;
      case 'erp': return Database;
      case 'healthcare': return Heart;
      case 'marketing': return Mail;
      case 'communication': return MessageSquare;
      case 'analytics': return Activity;
    }
  };

  const connectedCount = integrations.filter(int => int.status === 'connected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">API Integration Hub</h2>
          <p className="text-gray-600">
            Connect MySeniorValet with your existing systems for seamless data flow
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge className="bg-purple-100 text-purple-700">
            <Zap className="w-3 h-3 mr-1" />
            {connectedCount} Active
          </Badge>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <Settings className="w-4 h-4 mr-2" />
            API Settings
          </Button>
        </div>
      </div>

      {/* Enterprise Feature Alert */}
      <Alert className="border-purple-200 bg-purple-50">
        <Cpu className="h-4 w-4 text-purple-600" />
        <AlertDescription>
          <strong>Enterprise API Hub:</strong> Connect unlimited integrations, configure webhooks, and automate data synchronization across your entire portfolio. All API calls are secured with enterprise-grade encryption.
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="marketplace">
            <Package className="w-4 h-4 mr-2" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="connected">
            <Link2 className="w-4 h-4 mr-2" />
            Connected ({connectedCount})
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Globe className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="api-keys">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </TabsTrigger>
        </TabsList>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <Card 
                  key={integration.id}
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${
                    integration.status === 'connected' ? 'border-green-200' : ''
                  }`}
                  onClick={() => setSelectedIntegration(integration)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${integration.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {getStatusBadge(integration.status)}
                    </div>
                    <CardTitle className="mt-4">{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {integration.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {integration.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{integration.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {integration.status === 'connected' ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSync(integration);
                              }}
                              disabled={syncInProgress === integration.id}
                            >
                              {syncInProgress === integration.id ? (
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3 mr-1" />
                              )}
                              Sync Now
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDisconnect(integration);
                              }}
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConnect(integration);
                            }}
                            disabled={syncInProgress === integration.id}
                          >
                            {syncInProgress === integration.id ? (
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Zap className="w-3 h-3 mr-1" />
                            )}
                            Connect
                          </Button>
                        )}
                      </div>
                      
                      {integration.lastSync && (
                        <p className="text-xs text-gray-500">
                          Last sync: {new Date(integration.lastSync).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Connected Tab */}
        <TabsContent value="connected" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Integrations</CardTitle>
              <CardDescription>Manage your connected services and monitor sync status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.filter(int => int.status === 'connected').map((integration) => {
                  const Icon = integration.icon;
                  return (
                    <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${integration.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{integration.name}</p>
                          <p className="text-sm text-gray-600">
                            {integration.recordsSynced?.toLocaleString() || 0} records synced
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Last sync</p>
                          <p className="text-sm font-medium">
                            {integration.lastSync ? new Date(integration.lastSync).toLocaleTimeString() : 'Never'}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSync(integration)}
                          disabled={syncInProgress === integration.id}
                        >
                          {syncInProgress === integration.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                {integrations.filter(int => int.status === 'connected').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No active integrations</p>
                    <p className="text-sm mt-2">Connect your first integration from the marketplace</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>Configure webhooks to receive real-time updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Webhook URL */}
              <div className="space-y-2">
                <Label>Webhook Endpoint URL</Label>
                <div className="flex gap-2">
                  <Input
                    value="https://api.myseniorvalet.com/webhooks/enterprise/abc123"
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText('https://api.myseniorvalet.com/webhooks/enterprise/abc123');
                      toast({
                        title: 'Copied',
                        description: 'Webhook URL copied to clipboard',
                      });
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600">Use this URL to receive webhook events from MySeniorValet</p>
              </div>

              {/* Webhook Events */}
              <div className="space-y-2">
                <Label>Webhook Events</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="font-medium">Resident Updates</p>
                        <p className="text-sm text-gray-600">New admissions, discharges, status changes</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="font-medium">Tour Bookings</p>
                        <p className="text-sm text-gray-600">New tours scheduled, cancellations</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="font-medium">Payment Events</p>
                        <p className="text-sm text-gray-600">Payments received, invoices generated</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="font-medium">Emergency Alerts</p>
                        <p className="text-sm text-gray-600">Critical incidents, health emergencies</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              {/* Webhook Secret */}
              <div className="space-y-2">
                <Label>Webhook Secret</Label>
                <div className="flex gap-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value="whsec_8f7d9a8s7df98a7sdf987asdf"
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-600">Use this secret to verify webhook signatures</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for programmatic access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Key Generation */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">Production API Key</p>
                    <p className="text-sm text-gray-600">Full access to all API endpoints</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
                <div className="flex gap-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value="sk_live_abc123xyz789def456ghi012jkl345"
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText('sk_live_abc123xyz789def456ghi012jkl345');
                      toast({
                        title: 'Copied',
                        description: 'API key copied to clipboard',
                      });
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-2">Created on March 1, 2025 • Last used 2 hours ago</p>
              </div>

              {/* API Usage Stats */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-sm">API Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">45,892</p>
                      <p className="text-sm text-gray-600">Requests Today</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">1.2M</p>
                      <p className="text-sm text-gray-600">This Month</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">99.9%</p>
                      <p className="text-sm text-gray-600">Uptime</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rate Limits */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Enterprise Rate Limits:</strong> 10,000 requests per minute, 1M requests per day. Contact support to increase limits.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Detail Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${selectedIntegration.color} flex items-center justify-center`}>
                    {React.createElement(selectedIntegration.icon, { className: "w-6 h-6 text-white" })}
                  </div>
                  <div>
                    <CardTitle>{selectedIntegration.name}</CardTitle>
                    <CardDescription>{selectedIntegration.description}</CardDescription>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIntegration(null)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Configuration Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your API key"
                    value={apiConfig.apiKey}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="apiSecret">API Secret</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    placeholder="Enter your API secret"
                    value={apiConfig.apiSecret}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, apiSecret: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="syncFrequency">Sync Frequency</Label>
                  <Select value={apiConfig.syncFrequency} onValueChange={(value) => setApiConfig(prev => ({ ...prev, syncFrequency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Data Mapping */}
                <div className="space-y-2">
                  <Label>Data Synchronization</Label>
                  <div className="space-y-2">
                    {Object.entries(apiConfig.dataMapping).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm capitalize">{key}</span>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => setApiConfig(prev => ({
                            ...prev,
                            dataMapping: { ...prev.dataMapping, [key]: checked }
                          }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label>Available Features</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedIntegration.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline">
                      <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  onClick={() => {
                    handleConnect(selectedIntegration);
                    setSelectedIntegration(null);
                  }}
                  disabled={!apiConfig.apiKey || !apiConfig.apiSecret}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Connect Integration
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedIntegration(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}