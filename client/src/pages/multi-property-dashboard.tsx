import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Building2, Users, DollarSign, TrendingUp, Calendar, MapPin, Star, AlertCircle, ChevronRight, Settings, Download, Filter, Eye } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

/**
 * Multi-Property Dashboard
 * Flawless Execution: Complete enterprise dashboard for managing multiple communities
 * 
 * Features by Tier:
 * - Professional ($999): Manage up to 25 properties
 * - Premium ($1,999): Manage up to 100 properties
 * - Enterprise ($3,999): Unlimited properties with white-label options
 */

interface PropertyOverview {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  occupancyRate: number;
  totalUnits: number;
  availableUnits: number;
  monthlyRevenue: number;
  avgRent: number;
  rating: number;
  alerts: number;
  lastUpdated: Date;
  tier: string;
  features: {
    tours: number;
    reservations: number;
    leads: number;
  };
}

interface PortfolioMetrics {
  totalProperties: number;
  totalUnits: number;
  avgOccupancy: number;
  totalRevenue: number;
  monthlyGrowth: number;
  totalLeads: number;
  conversionRate: number;
  avgRating: number;
}

interface AccessInfo {
  hasAccess: boolean;
  tier: string;
  propertyLimit: number;
  features: {
    analytics: boolean;
    financials: boolean;
    operations: boolean;
    whiteLabel: boolean;
    apiAccess: boolean;
    customIntegrations: boolean;
  };
}

interface AnalyticsData {
  occupancyTrends?: any[];
  revenueByProperty?: any[];
  conversionFunnel?: any[];
  revenueBreakdown?: any[];
  financials?: {
    totalRevenue: number;
    recurringRevenue: number;
    oneTimeCharges: number;
    operatingExpenses: number;
    netIncome: number;
    ebitda: number;
    grossRevenue?: number;
    maintenanceCosts?: number;
    marketingSpend?: number;
  };
  maintenance?: {
    upcoming?: any[];
    history?: any[];
  };
  staffPerformance?: any[];
  compliance?: any[];
}

export function MultiPropertyDashboard() {
  const { toast } = useToast();
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);

  // Check access tier
  const { data: accessInfo } = useQuery<AccessInfo>({
    queryKey: ['/api/multi-property/access'],
    enabled: true
  });

  // Fetch portfolio overview
  const { data: portfolio, isLoading: portfolioLoading } = useQuery<PortfolioMetrics>({
    queryKey: ['/api/multi-property/portfolio'],
    enabled: !!accessInfo?.hasAccess
  });

  // Fetch properties
  const { data: properties, isLoading: propertiesLoading } = useQuery<PropertyOverview[]>({
    queryKey: ['/api/multi-property/properties'],
    enabled: !!accessInfo?.hasAccess
  });

  // Fetch analytics
  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ['/api/multi-property/analytics', selectedTimeRange],
    enabled: !!accessInfo?.hasAccess
  });

  // Export data mutation
  const exportData = useMutation({
    mutationFn: async (format: 'csv' | 'pdf' | 'excel') => {
      return apiRequest('POST', '/api/multi-property/export', { format });
    },
    onSuccess: (data) => {
      toast({
        title: 'Export Successful',
        description: `Your data has been exported as ${data.format}`
      });
      // Trigger download
      window.open(data.downloadUrl, '_blank');
    }
  });

  if (!accessInfo?.hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-orange-600 dark:text-orange-400">
                Multi-Property Dashboard
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Professional Management Tools for Portfolio Owners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Upgrade to Professional or Higher</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Manage multiple properties from a single dashboard with advanced analytics,
                  cross-property insights, and enterprise reporting tools.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Professional</CardTitle>
                      <div className="text-2xl font-bold text-blue-600">$999/mo</div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>✓ Manage up to 25 properties</li>
                        <li>✓ Advanced analytics</li>
                        <li>✓ Cross-property reporting</li>
                        <li>✓ Priority support</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Premium</CardTitle>
                      <div className="text-2xl font-bold text-purple-600">$1,999/mo</div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>✓ Manage up to 100 properties</li>
                        <li>✓ AI-powered insights</li>
                        <li>✓ Custom dashboards</li>
                        <li>✓ Dedicated account manager</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Enterprise</CardTitle>
                      <div className="text-2xl font-bold text-green-600">$3,999/mo</div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>✓ Unlimited properties</li>
                        <li>✓ White-label options</li>
                        <li>✓ API access</li>
                        <li>✓ Custom integrations</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 text-center">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                    onClick={() => window.location.href = '/pricing'}
                  >
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Portfolio metrics cards
  const metricsCards = [
    {
      title: 'Total Properties',
      value: portfolio?.totalProperties || 0,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+3 this month'
    },
    {
      title: 'Average Occupancy',
      value: `${portfolio?.avgOccupancy || 0}%`,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      progress: portfolio?.avgOccupancy || 0
    },
    {
      title: 'Monthly Revenue',
      value: `$${(portfolio?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: `${portfolio?.monthlyGrowth || 0}% growth`
    },
    {
      title: 'Total Leads',
      value: portfolio?.totalLeads || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      subtext: `${portfolio?.conversionRate || 0}% conversion`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Multi-Property Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Managing {portfolio?.totalProperties || 0} properties across {portfolio?.totalUnits || 0} units
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompareMode(!compareMode)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {compareMode ? 'Exit Compare' : 'Compare'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData.mutate('excel')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricsCards.map((metric, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  {metric.change && (
                    <Badge variant="secondary" className="text-xs">
                      {metric.change}
                    </Badge>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  
                  {metric.progress !== undefined && (
                    <Progress value={metric.progress} className="mt-3" />
                  )}
                  
                  {metric.subtext && (
                    <p className="text-xs text-gray-500 mt-2">{metric.subtext}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
          </TabsList>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <div className="grid gap-6">
              {properties?.map((property: PropertyOverview) => (
                <Card 
                  key={property.id}
                  className={`hover:shadow-lg transition-all cursor-pointer ${
                    compareMode && selectedForComparison.includes(property.id) 
                      ? 'ring-2 ring-blue-500' 
                      : ''
                  }`}
                  onClick={() => {
                    if (compareMode) {
                      setSelectedForComparison(prev =>
                        prev.includes(property.id)
                          ? prev.filter(id => id !== property.id)
                          : [...prev, property.id]
                      );
                    } else {
                      setSelectedProperty(property.id);
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{property.name}</h3>
                          <Badge variant={property.tier === 'premium' ? 'default' : 'secondary'}>
                            {property.tier}
                          </Badge>
                          {property.alerts > 0 && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {property.alerts}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <MapPin className="h-4 w-4" />
                          {property.address}, {property.city}, {property.state}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Occupancy</p>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold">{property.occupancyRate}%</span>
                              <Progress value={property.occupancyRate} className="w-16" />
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-500">Available Units</p>
                            <p className="text-lg font-semibold">
                              {property.availableUnits}/{property.totalUnits}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-500">Monthly Revenue</p>
                            <p className="text-lg font-semibold">
                              ${property.monthlyRevenue.toLocaleString()}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-500">Avg Rent</p>
                            <p className="text-lg font-semibold">
                              ${property.avgRent.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{property.rating.toFixed(1)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{property.features.tours} tours</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{property.features.reservations} reservations</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{property.features.leads} leads</span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 text-gray-400 ml-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {compareMode && selectedForComparison.length > 1 && (
              <div className="fixed bottom-6 right-6">
                <Button
                  size="lg"
                  className="shadow-lg"
                  onClick={() => {
                    window.location.href = `/compare?properties=${selectedForComparison.join(',')}`;
                  }}
                >
                  Compare {selectedForComparison.length} Properties
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Occupancy Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics?.occupancyTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="occupancy" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.revenueByProperty || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="property" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lead Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.conversionFunnel?.map((stage: any, index: number) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium">{stage.name}</div>
                      <div className="flex-1">
                        <Progress value={stage.percentage} className="h-8" />
                      </div>
                      <div className="w-20 text-right text-sm">
                        {stage.count} ({stage.percentage}%)
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics?.revenueBreakdown || []}
                        dataKey="value"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                      >
                        {analytics?.revenueBreakdown?.map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'][index % 4]} 
                          />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Gross Revenue</p>
                        <p className="text-2xl font-bold">
                          ${analytics?.financials?.grossRevenue?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Net Income</p>
                        <p className="text-2xl font-bold">
                          ${analytics?.financials?.netIncome?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Operating Expenses</span>
                        <span className="text-sm font-medium">
                          ${analytics?.financials?.operatingExpenses?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Maintenance Costs</span>
                        <span className="text-sm font-medium">
                          ${analytics?.financials?.maintenanceCosts?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Marketing Spend</span>
                        <span className="text-sm font-medium">
                          ${analytics?.financials?.marketingSpend?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between">
                        <span className="font-medium">EBITDA</span>
                        <span className="font-bold text-lg">
                          ${analytics?.financials?.ebitda?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.maintenance?.upcoming?.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">{item.property}</p>
                          <p className="text-sm text-gray-500">{item.task}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{format(new Date(item.date), 'MMM d')}</p>
                          <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>
                            {item.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Staff Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.staffPerformance?.map((staff: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {staff.initials}
                          </div>
                          <div>
                            <p className="font-medium">{staff.name}</p>
                            <p className="text-sm text-gray-500">{staff.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{staff.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {analytics?.compliance?.map((item: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.category}</span>
                        <Badge variant={item.status === 'compliant' ? 'secondary' : 'destructive'}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">Next review: {item.nextReview}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}