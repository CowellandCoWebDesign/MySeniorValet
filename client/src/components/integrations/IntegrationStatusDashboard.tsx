import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Settings,
  Shield,
  Activity,
  Globe,
  Database,
  MessageCircle,
  Video,
  Heart,
  Building,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  FileText,
  Mail,
  Phone,
  Smartphone,
  Monitor,
  Cloud,
  Lock,
  Unlock,
  TrendingUp,
  Package,
  Cpu,
  Server,
  Wifi,
  WifiOff,
  Link,
  LinkOff,
  ChevronRight,
  Play,
  Pause,
  AlertTriangle,
  Info,
  ExternalLink,
  Download,
  Upload,
  Clock,
  CheckSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IntegrationStatusDashboardProps {
  communityId: string;
  tierLevel?: 'starter' | 'growth' | 'professional' | 'premium' | 'enterprise';
}

interface Integration {
  id: string;
  name: string;
  category: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  icon: any;
  description: string;
  lastSync?: string;
  dataPoints?: number;
  uptime?: number;
  apiCalls?: number;
  errors?: number;
  tierRequired?: string;
}

export function IntegrationStatusDashboard({ communityId, tierLevel = 'enterprise' }: IntegrationStatusDashboardProps) {
  const { toast } = useToast();
  const [autoSync, setAutoSync] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // All integrations with their status
  const integrations: Integration[] = [
    // Communication & Collaboration
    {
      id: 'zoom',
      name: 'Zoom',
      category: 'Communication',
      status: 'connected',
      icon: Video,
      description: 'Virtual tours and family meetings',
      lastSync: '2 minutes ago',
      dataPoints: 45,
      uptime: 99.9,
      apiCalls: 1247,
      tierRequired: 'professional'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      category: 'Communication',
      status: 'connected',
      icon: MessageCircle,
      description: 'Direct messaging with families',
      lastSync: '1 minute ago',
      dataPoints: 189,
      uptime: 100,
      apiCalls: 3421,
      tierRequired: 'professional'
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      category: 'Communication',
      status: 'connected',
      icon: Mail,
      description: 'Email notifications and campaigns',
      lastSync: '5 minutes ago',
      dataPoints: 523,
      uptime: 99.8,
      apiCalls: 8934
    },
    {
      id: 'twilio',
      name: 'Twilio',
      category: 'Communication',
      status: 'pending',
      icon: Phone,
      description: 'SMS and voice communications',
      tierRequired: 'premium'
    },

    // Healthcare Systems
    {
      id: 'epic',
      name: 'Epic MyChart',
      category: 'Healthcare',
      status: 'connected',
      icon: Heart,
      description: 'Electronic health records',
      lastSync: '10 minutes ago',
      dataPoints: 78,
      uptime: 98.5,
      apiCalls: 567,
      tierRequired: 'premium'
    },
    {
      id: 'cerner',
      name: 'Cerner PowerChart',
      category: 'Healthcare',
      status: 'connected',
      icon: Activity,
      description: 'Clinical documentation',
      lastSync: '15 minutes ago',
      dataPoints: 92,
      uptime: 97.8,
      apiCalls: 423,
      tierRequired: 'premium'
    },
    {
      id: 'allscripts',
      name: 'Allscripts',
      category: 'Healthcare',
      status: 'disconnected',
      icon: FileText,
      description: 'Practice management',
      tierRequired: 'enterprise'
    },

    // Business Systems
    {
      id: 'salesforce',
      name: 'Salesforce CRM',
      category: 'Business',
      status: 'connected',
      icon: Users,
      description: 'Customer relationship management',
      lastSync: '3 minutes ago',
      dataPoints: 234,
      uptime: 99.9,
      apiCalls: 2156,
      tierRequired: 'professional'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      category: 'Business',
      status: 'connected',
      icon: TrendingUp,
      description: 'Marketing automation',
      lastSync: '8 minutes ago',
      dataPoints: 156,
      uptime: 99.7,
      apiCalls: 1823,
      tierRequired: 'growth'
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      category: 'Business',
      status: 'error',
      icon: DollarSign,
      description: 'Financial management',
      errors: 3,
      tierRequired: 'growth'
    },
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'Business',
      status: 'connected',
      icon: DollarSign,
      description: 'Payment processing',
      lastSync: 'Real-time',
      dataPoints: 89,
      uptime: 100,
      apiCalls: 4521
    },

    // Property Management
    {
      id: 'yardi',
      name: 'Yardi Voyager',
      category: 'Property',
      status: 'connected',
      icon: Building,
      description: 'Property management system',
      lastSync: '20 minutes ago',
      dataPoints: 145,
      uptime: 98.2,
      apiCalls: 892,
      tierRequired: 'professional'
    },
    {
      id: 'entrata',
      name: 'Entrata',
      category: 'Property',
      status: 'pending',
      icon: Building,
      description: 'Resident management',
      tierRequired: 'professional'
    },
    {
      id: 'realpage',
      name: 'RealPage',
      category: 'Property',
      status: 'disconnected',
      icon: Building,
      description: 'Revenue management',
      tierRequired: 'enterprise'
    },

    // Analytics & Data
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      category: 'Analytics',
      status: 'connected',
      icon: BarChart3,
      description: 'Website analytics',
      lastSync: 'Real-time',
      dataPoints: 512,
      uptime: 100,
      apiCalls: 15234
    },
    {
      id: 'tableau',
      name: 'Tableau',
      category: 'Analytics',
      status: 'connected',
      icon: BarChart3,
      description: 'Business intelligence',
      lastSync: '30 minutes ago',
      dataPoints: 89,
      uptime: 99.1,
      apiCalls: 342,
      tierRequired: 'enterprise'
    },
    {
      id: 'snowflake',
      name: 'Snowflake',
      category: 'Analytics',
      status: 'pending',
      icon: Database,
      description: 'Data warehouse',
      tierRequired: 'enterprise'
    }
  ];

  // Group integrations by category
  const categories = [...new Set(integrations.map(i => i.category))];
  
  // Calculate statistics
  const totalIntegrations = integrations.length;
  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;
  const pendingCount = integrations.filter(i => i.status === 'pending').length;
  const overallUptime = integrations
    .filter(i => i.uptime)
    .reduce((acc, i) => acc + (i.uptime || 0), 0) / integrations.filter(i => i.uptime).length;
  const totalApiCalls = integrations.reduce((acc, i) => acc + (i.apiCalls || 0), 0);
  const totalDataPoints = integrations.reduce((acc, i) => acc + (i.dataPoints || 0), 0);

  const reconnect = (integration: Integration) => {
    toast({
      title: "Reconnecting...",
      description: `Attempting to reconnect ${integration.name}`,
    });
  };

  const configure = (integration: Integration) => {
    toast({
      title: "Opening Configuration",
      description: `Configure ${integration.name} settings`,
    });
  };

  const viewLogs = (integration: Integration) => {
    toast({
      title: "Viewing Logs",
      description: `Opening activity logs for ${integration.name}`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <LinkOff className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500 text-white">Connected</Badge>;
      case 'error':
        return <Badge className="bg-red-500 text-white">Error</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      default:
        return <Badge variant="outline">Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-purple-500/20 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Integration Control Center</h3>
                <p className="text-sm text-muted-foreground">
                  Manage all your external connections from one dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync All
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Status
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalIntegrations}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{connectedCount}</p>
              <p className="text-xs text-muted-foreground">Connected</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{errorCount}</p>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{overallUptime.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{(totalApiCalls / 1000).toFixed(1)}k</p>
              <p className="text-xs text-muted-foreground">API Calls</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{totalDataPoints}</p>
              <p className="text-xs text-muted-foreground">Data Points</p>
            </div>
          </div>

          {/* System Health */}
          <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">System Health</span>
              <span className="text-sm text-muted-foreground">{overallUptime.toFixed(1)}%</span>
            </div>
            <Progress value={overallUptime} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {errorCount > 0 && (
        <Alert className="border-red-500">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errorCount} integration{errorCount > 1 ? 's' : ''} need attention. Review the errors below to restore full functionality.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">
            <Globe className="w-4 h-4 mr-2" />
            All ({totalIntegrations})
          </TabsTrigger>
          <TabsTrigger value="communication">
            <MessageCircle className="w-4 h-4 mr-2" />
            Communication
          </TabsTrigger>
          <TabsTrigger value="healthcare">
            <Heart className="w-4 h-4 mr-2" />
            Healthcare
          </TabsTrigger>
          <TabsTrigger value="business">
            <DollarSign className="w-4 h-4 mr-2" />
            Business
          </TabsTrigger>
          <TabsTrigger value="property">
            <Building className="w-4 h-4 mr-2" />
            Property
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* All Integrations Tab */}
        <TabsContent value="all">
          <div className="grid gap-4">
            {categories.map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category} Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {integrations
                      .filter(i => i.category === category)
                      .map((integration) => (
                        <div key={integration.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-muted">
                                <integration.icon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{integration.name}</h4>
                                  {getStatusBadge(integration.status)}
                                  {integration.tierRequired && tierLevel !== 'enterprise' && (
                                    <Badge variant="outline" className="text-xs">
                                      {integration.tierRequired}+
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{integration.description}</p>
                                {integration.lastSync && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Last sync: {integration.lastSync}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {integration.status === 'connected' && (
                                <>
                                  <Button variant="outline" size="sm" onClick={() => configure(integration)}>
                                    <Settings className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => viewLogs(integration)}>
                                    <FileText className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {integration.status === 'error' && (
                                <Button variant="outline" size="sm" className="border-red-500 text-red-600" onClick={() => reconnect(integration)}>
                                  <RefreshCw className="w-4 h-4 mr-1" />
                                  Reconnect
                                </Button>
                              )}
                              {integration.status === 'disconnected' && (
                                <Button variant="outline" size="sm" onClick={() => reconnect(integration)}>
                                  <Link className="w-4 h-4 mr-1" />
                                  Connect
                                </Button>
                              )}
                              {integration.status === 'pending' && (
                                <Button variant="outline" size="sm" disabled>
                                  <Clock className="w-4 h-4 mr-1" />
                                  Pending
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {integration.status === 'connected' && (
                            <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                              {integration.uptime && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Uptime</p>
                                  <p className="font-semibold">{integration.uptime}%</p>
                                </div>
                              )}
                              {integration.apiCalls && (
                                <div>
                                  <p className="text-xs text-muted-foreground">API Calls</p>
                                  <p className="font-semibold">{integration.apiCalls.toLocaleString()}</p>
                                </div>
                              )}
                              {integration.dataPoints && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Data Points</p>
                                  <p className="font-semibold">{integration.dataPoints}</p>
                                </div>
                              )}
                              {integration.errors !== undefined && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Errors</p>
                                  <p className="font-semibold text-red-600">{integration.errors}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Category-specific tabs */}
        {categories.map((category) => (
          <TabsContent key={category.toLowerCase()} value={category.toLowerCase()}>
            <Card>
              <CardHeader>
                <CardTitle>{category} Integrations</CardTitle>
                <CardDescription>
                  Manage your {category.toLowerCase()} system connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {integrations
                    .filter(i => i.category === category)
                    .map((integration) => (
                      <div key={integration.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              <integration.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{integration.name}</h4>
                                {getStatusBadge(integration.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">{integration.description}</p>
                              {integration.lastSync && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Last sync: {integration.lastSync}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {integration.status === 'connected' ? (
                              <>
                                <Button variant="outline" size="icon" onClick={() => configure(integration)}>
                                  <Settings className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => viewLogs(integration)}>
                                  <FileText className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => reconnect(integration)}>
                                <Link className="w-4 h-4 mr-1" />
                                Connect
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-Sync</p>
              <p className="text-sm text-muted-foreground">
                Automatically sync data every hour
              </p>
            </div>
            <Switch checked={autoSync} onCheckedChange={setAutoSync} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Real-time Updates</p>
              <p className="text-sm text-muted-foreground">
                Receive instant notifications for critical events
              </p>
            </div>
            <Switch checked={realTimeUpdates} onCheckedChange={setRealTimeUpdates} />
          </div>
          
          {tierLevel === 'enterprise' && (
            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-purple-900 dark:text-purple-100">
                    Enterprise Features Active
                  </p>
                  <p className="text-purple-700 dark:text-purple-300">
                    Unlimited integrations, real-time sync, advanced analytics, and priority support
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}