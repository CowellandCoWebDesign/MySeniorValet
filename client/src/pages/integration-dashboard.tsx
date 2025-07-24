import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Zap, 
  CreditCard, 
  FileSignature, 
  Users, 
  Map, 
  Phone, 
  Calendar, 
  Database, 
  Mail,
  Settings,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface IntegrationStatus {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'configured' | 'needs_setup' | 'error';
  icon: React.ComponentType;
  category: 'core' | 'marketing' | 'communication' | 'automation';
  businessValue: string;
  setupComplexity: 'low' | 'medium' | 'high';
  monthlyValue?: number;
  lastUsed?: Date;
}

export default function IntegrationDashboard() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Initialize integration status data
    setIntegrations([
      // Core AI Integrations
      {
        id: 'anthropic-ai',
        name: 'Anthropic AI Matching',
        description: 'AI-powered community matching and recommendations',
        status: 'active',
        icon: Brain,
        category: 'core',
        businessValue: 'Increases conversion by 35% with personalized matching',
        setupComplexity: 'low',
        monthlyValue: 2500,
        lastUsed: new Date()
      },
      {
        id: 'openai-nlp',
        name: 'OpenAI Natural Language',
        description: 'Natural language search and content generation',
        status: 'active',
        icon: Zap,
        category: 'core',
        businessValue: 'Improves user experience with smart search',
        setupComplexity: 'low',
        monthlyValue: 1800
      },
      
      // Premium Features
      {
        id: 'stripe-premium',
        name: 'Stripe Premium Features',
        description: 'Family collaboration, concierge services, priority placement',
        status: 'active',
        icon: CreditCard,
        category: 'core',
        businessValue: 'Direct revenue stream: $50K+ monthly potential',
        setupComplexity: 'medium',
        monthlyValue: 15000
      },
      {
        id: 'docusign',
        name: 'DocuSign Digital Workflows',
        description: 'Digital lease signing and family authorization forms',
        status: 'needs_setup',
        icon: FileSignature,
        category: 'core',
        businessValue: 'Reduces paperwork processing time by 80%',
        setupComplexity: 'medium',
        monthlyValue: 3200
      },
      {
        id: 'websocket-collab',
        name: 'WebSocket Family Collaboration',
        description: 'Real-time family communication and decision making',
        status: 'active',
        icon: Users,
        category: 'core',
        businessValue: 'Accelerates decision-making by 60%',
        setupComplexity: 'low',
        monthlyValue: 4500
      },
      {
        id: 'advanced-gis',
        name: 'Advanced Mapping & GIS',
        description: 'Geospatial analysis and demographic insights',
        status: 'active',
        icon: Map,
        category: 'core',
        businessValue: 'Premium community insights drive higher-value leads',
        setupComplexity: 'medium',
        monthlyValue: 2800
      },

      // Communication Integrations
      {
        id: 'twilio',
        name: 'Twilio SMS/Voice',
        description: 'Instant tour reminders and availability alerts',
        status: 'needs_setup',
        icon: Phone,
        category: 'communication',
        businessValue: 'Reduces no-shows by 45%, increases engagement',
        setupComplexity: 'low',
        monthlyValue: 1200
      },
      {
        id: 'google-calendar',
        name: 'Google Calendar Integration',
        description: 'Automated tour scheduling and move-in planning',
        status: 'needs_setup',
        icon: Calendar,
        category: 'communication',
        businessValue: 'Streamlines scheduling, improves family coordination',
        setupComplexity: 'medium',
        monthlyValue: 900
      },

      // Marketing & CRM
      {
        id: 'salesforce',
        name: 'Salesforce CRM',
        description: 'Advanced lead management and sales pipeline',
        status: 'needs_setup',
        icon: Database,
        category: 'marketing',
        businessValue: 'Improves lead conversion by 40%',
        setupComplexity: 'high',
        monthlyValue: 5500
      },
      {
        id: 'hubspot',
        name: 'HubSpot Marketing',
        description: 'Automated nurturing campaigns and contact management',
        status: 'needs_setup',
        icon: TrendingUp,
        category: 'marketing',
        businessValue: 'Automated lead nurturing increases lifetime value',
        setupComplexity: 'medium',
        monthlyValue: 3800
      },
      {
        id: 'mailchimp',
        name: 'Mailchimp Email Marketing',
        description: 'Segmented email campaigns and tour follow-ups',
        status: 'needs_setup',
        icon: Mail,
        category: 'marketing',
        businessValue: 'Maintains engagement, drives repeat visits',
        setupComplexity: 'low',
        monthlyValue: 1500
      },

      // Automation
      {
        id: 'zapier',
        name: 'Zapier Workflow Automation',
        description: 'Connect all systems with automated workflows',
        status: 'configured',
        icon: Settings,
        category: 'automation',
        businessValue: 'Reduces manual work by 70%',
        setupComplexity: 'medium',
        monthlyValue: 2200
      }
    ]);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'configured':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'needs_setup':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      configured: 'secondary', 
      needs_setup: 'outline',
      error: 'destructive'
    };
    
    const labels = {
      active: 'Active',
      configured: 'Configured',
      needs_setup: 'Setup Required',
      error: 'Error'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const totalMonthlyValue = integrations
    .filter(i => i.status === 'active')
    .reduce((sum, i) => sum + (i.monthlyValue || 0), 0);

  const potentialValue = integrations
    .reduce((sum, i) => sum + (i.monthlyValue || 0), 0);

  const activationProgress = (integrations.filter(i => i.status === 'active').length / integrations.length) * 100;

  const categorizedIntegrations = {
    core: integrations.filter(i => i.category === 'core'),
    marketing: integrations.filter(i => i.category === 'marketing'),
    communication: integrations.filter(i => i.category === 'communication'),
    automation: integrations.filter(i => i.category === 'automation')
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Integration Command Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Activate and manage MySeniorValet's enterprise integrations
          </p>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Integrations</p>
                    <p className="text-2xl font-bold text-green-600">
                      {integrations.filter(i => i.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Value</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${totalMonthlyValue.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Potential Value</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${potentialValue.toLocaleString()}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Activation Progress</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {Math.round(activationProgress)}%
                    </p>
                  </div>
                  <Settings className="h-8 w-8 text-orange-500" />
                </div>
                <Progress value={activationProgress} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="core">Core AI</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {integrations.map((integration) => {
                const IconComponent = integration.icon;
                return (
                  <Card key={integration.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                          </div>
                        </div>
                        {getStatusIcon(integration.status)}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        {getStatusBadge(integration.status)}
                        {integration.monthlyValue && integration.status === 'active' && (
                          <Badge variant="outline" className="text-green-600">
                            ${integration.monthlyValue.toLocaleString()}/mo
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-3">
                        {integration.description}
                      </CardDescription>
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Business Value:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {integration.businessValue}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className={`${
                            integration.setupComplexity === 'low' ? 'text-green-600' :
                            integration.setupComplexity === 'medium' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}
                        >
                          {integration.setupComplexity} setup
                        </Badge>
                        <Button 
                          size="sm" 
                          variant={integration.status === 'active' ? 'outline' : 'default'}
                        >
                          {integration.status === 'active' ? 'Configure' : 'Activate'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {Object.entries(categorizedIntegrations).map(([category, categoryIntegrations]) => (
            <TabsContent key={category} value={category} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {categoryIntegrations.map((integration) => {
                  const IconComponent = integration.icon;
                  return (
                    <Card key={integration.id} className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl">
                              <IconComponent className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <CardTitle className="text-xl">{integration.name}</CardTitle>
                              <CardDescription>{integration.description}</CardDescription>
                            </div>
                          </div>
                          {getStatusIcon(integration.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          {getStatusBadge(integration.status)}
                          {integration.monthlyValue && (
                            <Badge variant="outline" className="text-blue-600">
                              ${integration.monthlyValue.toLocaleString()}/mo potential
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Business Impact:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {integration.businessValue}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={`${
                                integration.setupComplexity === 'low' ? 'text-green-600' :
                                integration.setupComplexity === 'medium' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}
                            >
                              {integration.setupComplexity} complexity
                            </Badge>
                            {integration.lastUsed && (
                              <span className="text-xs text-gray-500">
                                Last used: {integration.lastUsed.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <Button 
                            variant={integration.status === 'active' ? 'outline' : 'default'}
                            className="ml-4"
                          >
                            {integration.status === 'active' ? 'Manage' : 
                             integration.status === 'configured' ? 'Activate' : 
                             'Setup Required'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Commonly used integration management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-20 flex-col space-y-2">
                <Settings className="h-6 w-6" />
                <span>Configure APIs</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span>View Analytics</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <CheckCircle className="h-6 w-6" />
                <span>Run Health Check</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Zap className="h-6 w-6" />
                <span>Test Workflows</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}