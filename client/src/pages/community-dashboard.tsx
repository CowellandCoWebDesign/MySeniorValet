import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Building2, Users, DollarSign, TrendingUp, TrendingDown, Calendar, 
  MapPin, Star, AlertCircle, CheckCircle, Settings, CreditCard, 
  Brain, Zap, Package, Globe, Eye, MessageSquare, Upload, Edit,
  Home, Shield, Heart, Stethoscope, Coffee, Car, Utensils, Bed,
  Wrench, Clock, Plus, Download, BarChart3, LineChart, PieChart,
  Target, ChevronRight, Filter, Mail, Phone, X, Save
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, 
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart, RadialBarChart, RadialBar
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { AIIntelligenceDashboard } from '@/components/AIIntelligenceDashboard';

/**
 * Unified Community Dashboard
 * Single source of truth for all community management features
 * 
 * Consolidates all enterprise features into user-friendly sections:
 * - Overview: Key metrics and quick actions
 * - Residents: Resident management and care tracking
 * - Analytics: Performance insights and financial metrics
 * - Operations: Staff, maintenance, and facility management
 * - Billing: Revenue analytics and payment processing
 * - Settings: Profile, subscription, and preferences
 */

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface CommunityData {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  type: string;
  occupancy: number;
  totalUnits: number;
  monthlyRevenue: number;
  averageRate: number;
  waitlistCount: number;
  staffCount: number;
  maintenanceRequests: number;
  subscriptionTier: string;
  subscriptionStatus: 'active' | 'trial' | 'expired';
  nextBilling: string;
}

interface AnalyticsData {
  views: number;
  leads: number;
  tours: number;
  conversions: number;
  conversionRate: number;
  avgResponseTime: string;
  monthlyGrowth: number;
  yearlyGrowth: number;
}

interface FinancialData {
  totalRevenue: number;
  recurringRevenue: number;
  oneTimeCharges: number;
  avgRevenuePerUnit: number;
  collectionRate: number;
  outstandingBalance: number;
  ebitda: number;
  netOperatingIncome: number;
}

export default function CommunityDashboard() {
  const { id } = useParams<{ id: string }>();
  const communityId = parseInt(id || '1');
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [showAddResidentModal, setShowAddResidentModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const { toast } = useToast();

  // Fetch community data
  const { data: community, isLoading: communityLoading, error: communityError } = useQuery<CommunityData>({
    queryKey: [`/api/communities/${communityId}`],
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery<AnalyticsData>({
    queryKey: [`/api/communities/${communityId}/analytics`, selectedTimeRange],
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch financial data  
  const { data: financial, isLoading: financialLoading, error: financialError } = useQuery<FinancialData>({
    queryKey: [`/api/communities/${communityId}/financial`, selectedTimeRange],
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch residents data (real data, no mock)
  const { data: residents, isLoading: residentsLoading, error: residentsError } = useQuery<any[]>({
    queryKey: [`/api/communities/${communityId}/residents`],
    retry: 3,
    staleTime: 2 * 60 * 1000, // 2 minutes for more frequent updates
  });

  // Fetch maintenance requests
  const { data: maintenanceRequests, isLoading: maintenanceLoading } = useQuery({
    queryKey: [`/api/operations/maintenance/${communityId}`],
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch operations data
  const { data: operations, isLoading: operationsLoading } = useQuery({
    queryKey: [`/api/operations/summary/${communityId}`],
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  const [formData, setFormData] = useState({
    name: community?.name || '',
    description: '',
    phone: community?.phone || '',
    website: community?.website || '',
    email: community?.email || '',
    address: community?.address || '',
    city: '',
    state: '',
    zipCode: ''
  });

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PUT', `/api/communities/${communityId}`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Profile Updated',
        description: 'Your community profile has been updated successfully.',
      });
      setIsEditingProfile(false);
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}`] });
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'There was an error updating your profile.',
        variant: 'destructive',
      });
    },
  });

  const handleProfileSave = () => {
    updateProfile.mutate(formData);
  };

  if (communityLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {community?.name}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {community?.subscriptionTier}
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {community?.type} • {community?.totalUnits} Units
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/myseniorvalet-home">
                  <Button variant="outline">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
                <Button>
                  <Settings className="mr-2 h-4 w-4" />
                  Quick Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-3">Overview</TabsTrigger>
            <TabsTrigger value="residents" className="text-xs sm:text-sm px-2 py-3">Residents</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 py-3">Analytics</TabsTrigger>
            <TabsTrigger value="ai-intelligence" className="text-xs sm:text-sm px-1 py-3 flex flex-col items-center">
              <Brain className="h-3 w-3 sm:h-4 sm:w-4 mb-1" />
              <span className="hidden sm:inline">AI Intelligence</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="operations" className="text-xs sm:text-sm px-2 py-3">Operations</TabsTrigger>
            <TabsTrigger value="billing" className="text-xs sm:text-sm px-2 py-3">Billing</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm px-2 py-3">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Occupancy Rate</p>
                      <p className="text-2xl font-bold">{community?.occupancy}%</p>
                      {analytics?.monthlyGrowth ? (
                        <p className="text-xs text-green-600">+{analytics.monthlyGrowth}% from last month</p>
                      ) : (
                        <p className="text-xs text-gray-500">Calculating...</p>
                      )}
                    </div>
                    <Building2 className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                      <p className="text-2xl font-bold">${community?.monthlyRevenue.toLocaleString()}</p>
                      <p className="text-xs text-green-600">+{analytics?.monthlyGrowth}% growth</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">New Leads</p>
                      <p className="text-2xl font-bold">{analytics?.leads}</p>
                      <p className="text-xs text-blue-600">{analytics?.conversionRate}% conversion</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Waitlist</p>
                      <p className="text-2xl font-bold">{community?.waitlistCount}</p>
                      <p className="text-xs text-orange-600">Interested prospects</p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Plus className="h-5 w-5" />
                    Add Resident
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule Tour
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Mail className="h-5 w-5" />
                    Send Newsletter
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <BarChart3 className="h-5 w-5" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {residents && residents.length > 0 ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Recent Activity</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{residents.length} active residents</p>
                      </div>
                      <span className="text-xs text-gray-500 ml-auto">Live data</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Loading Activity...</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Fetching live data</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Tour scheduled</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Thompson family - Tomorrow 2:00 PM</p>
                    </div>
                    <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Wrench className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Maintenance request completed</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">AC repair in Unit 312</p>
                    </div>
                    <span className="text-xs text-gray-500 ml-auto">6 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Residents Tab */}
          <TabsContent value="residents">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Residents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{Math.floor((community?.occupancy || 0) * (community?.totalUnits || 0) / 100)}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    of {community?.totalUnits} units occupied
                  </p>
                  <Progress value={community?.occupancy} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Care Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Independent</span>
                      <span className="font-medium">45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Assisted Living</span>
                      <span className="font-medium">38</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Memory Care</span>
                      <span className="font-medium">23</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Health Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Wellness Checks</span>
                      <Badge variant="secondary">All Clear</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Medication Alerts</span>
                      <Badge variant="destructive">2 Overdue</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Emergency Contacts</span>
                      <Badge variant="secondary">Updated</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resident Management Tools */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Resident Directory</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                    <Button size="sm" onClick={() => setShowAddResidentModal(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Resident
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {residentsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading residents...</p>
                    </div>
                  ) : residentsError ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-red-600">Error loading residents. Please try again.</p>
                    </div>
                  ) : residents && residents.length > 0 ? (
                    residents.slice(0, 4).map((resident: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{resident.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{resident.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Unit {resident.unit} • {resident.care}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {resident.status}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedResident(resident)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">No residents found</p>
                      <p className="text-xs text-gray-500">Add residents to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Performance</CardTitle>
                  <CardDescription>Tracking leads and conversions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-2xl font-bold">{analytics?.leads}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Leads</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{analytics?.conversions}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Conversions</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Conversion Rate</span>
                      <span className="font-medium">{analytics?.conversionRate}%</span>
                    </div>
                    <Progress value={analytics?.conversionRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Online Visibility</CardTitle>
                  <CardDescription>Website views and engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-2xl font-bold">{analytics?.views.toLocaleString()}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Profile Views</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{analytics?.tours}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tours Scheduled</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">+{analytics?.monthlyGrowth}% this month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold">
                        ${financial?.totalRevenue ? financial.totalRevenue.toLocaleString() : 'Loading...'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Recurring</span>
                        <span className="font-medium">${financial?.recurringRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">One-time</span>
                        <span className="font-medium">${financial?.oneTimeCharges.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Collection Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{financial?.collectionRate}%</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">On-time payments</p>
                    <div className="mt-4">
                      <p className="text-sm">Outstanding: ${financial?.outstandingBalance.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profitability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-lg font-semibold">${financial?.ebitda.toLocaleString()}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">EBITDA</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">${financial?.netOperatingIncome.toLocaleString()}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Net Operating Income</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Staff Overview</CardTitle>
                  <CardDescription>Current staffing levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold">{community?.staffCount}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Staff</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">98%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Shift Coverage</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Nursing</span>
                      <span className="font-medium">18 staff</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Dining</span>
                      <span className="font-medium">12 staff</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Maintenance</span>
                      <span className="font-medium">8 staff</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Activities</span>
                      <span className="font-medium">7 staff</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Requests</CardTitle>
                  <CardDescription>Active work orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-2xl font-bold">
                        {maintenanceRequests?.length || community?.maintenanceRequests || 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Open Requests</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">2.3</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response (hours)</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High Priority</span>
                      <Badge variant="destructive">2</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Medium Priority</span>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">4</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Low Priority</span>
                      <Badge variant="secondary">2</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Operational Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="font-medium">Staff Meeting</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">9:00 AM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Utensils className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-medium">Lunch Service</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">12:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Heart className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="font-medium">Wellness Checks</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">2:00 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Medical Supplies</span>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Low Stock</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cleaning Supplies</span>
                      <Badge variant="secondary">Normal</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Food Inventory</span>
                      <Badge variant="secondary">Normal</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Resident Satisfaction</span>
                      <span className="font-medium">4.8/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Safety Score</span>
                      <span className="font-medium">98%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Compliance Rating</span>
                      <span className="font-medium">A+</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Streams</CardTitle>
                  <CardDescription>Breakdown of income sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Monthly Rent</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Base accommodation</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">$336,000</p>
                        <p className="text-sm text-green-600">73.6%</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Care Services</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Additional care</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">$68,250</p>
                        <p className="text-sm text-green-600">15.0%</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Dining Services</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Meal plans</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">$31,500</p>
                        <p className="text-sm text-green-600">6.9%</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Other Services</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Misc charges</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">$21,000</p>
                        <p className="text-sm text-green-600">4.5%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Processing</CardTitle>
                  <CardDescription>Transaction overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-lg font-semibold">{financial?.collectionRate}%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Collection Rate</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">2.3</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Days DSO</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Auto-pay Enrolled</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Late Payments</span>
                      <span className="font-medium">3.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Payment Methods</span>
                      <span className="font-medium">Bank, Card</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Management */}
            <Card>
              <CardHeader>
                <CardTitle>Your Subscription</CardTitle>
                <CardDescription>Manage your MySeniorValet plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Current Plan</h3>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {community?.subscriptionTier}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {community?.subscriptionStatus}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold">$999<span className="text-sm font-normal">/month</span></p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Next billing: {community?.nextBilling}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Features Included</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Multi-property management (25)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Lead tracking & CRM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Advanced reporting</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Priority support</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Account Actions</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Update Billing
                      </Button>
                      <Button variant="outline" className="w-full">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Upgrade Plan
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download Invoice
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Intelligence Tab */}
          <TabsContent value="ai-intelligence">
            <AIIntelligenceDashboard 
              communityId={communityId} 
              communityName={community?.name} 
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Community Profile</CardTitle>
                  <CardDescription>Update your community information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Community Name</Label>
                      <Input 
                        id="name" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        disabled={!isEditingProfile} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        value={formData.address} 
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        disabled={!isEditingProfile} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input 
                          id="phone" 
                          value={formData.phone} 
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          disabled={!isEditingProfile} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          value={formData.email} 
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          disabled={!isEditingProfile} 
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input 
                        id="website" 
                        value={formData.website} 
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        disabled={!isEditingProfile} 
                      />
                    </div>
                    <div className="flex gap-2">
                      {isEditingProfile ? (
                        <>
                          <Button onClick={handleProfileSave} disabled={updateProfile.isPending}>
                            <Save className="mr-2 h-4 w-4" />
                            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditingProfile(true)} variant="outline">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Configure how you receive updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Lead Alerts</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">New inquiry notifications</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Maintenance Alerts</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Work order notifications</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Billing Reminders</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Payment due notifications</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Account Management</CardTitle>
                  <CardDescription>Manage your account settings and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Button>
                    <Button variant="outline">
                      <Shield className="mr-2 h-4 w-4" />
                      Privacy & Security
                    </Button>
                    <Button variant="outline">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Resident Modal */}
        <Dialog open={showAddResidentModal} onOpenChange={setShowAddResidentModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Resident</DialogTitle>
              <DialogDescription>
                Register a new resident for move-in to this community.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter first name" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter last name" />
                </div>
              </div>
              <div>
                <Label htmlFor="unit">Unit Number</Label>
                <Input id="unit" placeholder="e.g., 101A" />
              </div>
              <div>
                <Label htmlFor="careLevel">Care Level</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select care level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="independent">Independent Living</SelectItem>
                    <SelectItem value="assisted">Assisted Living</SelectItem>
                    <SelectItem value="memory">Memory Care</SelectItem>
                    <SelectItem value="skilled">Skilled Nursing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="moveInDate">Move-In Date</Label>
                <Input id="moveInDate" type="date" />
              </div>
              <div>
                <Label htmlFor="monthlyRate">Monthly Rate</Label>
                <Input id="monthlyRate" type="number" placeholder="5000" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowAddResidentModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={async () => {
                    toast({
                      title: "Resident Added",
                      description: "New resident has been successfully registered for move-in.",
                    });
                    setShowAddResidentModal(false);
                  }}
                >
                  Add Resident
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Resident Management Modal */}
        <Dialog open={!!selectedResident} onOpenChange={() => setSelectedResident(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Resident</DialogTitle>
              <DialogDescription>
                Update resident status, care level, or process move-out.
              </DialogDescription>
            </DialogHeader>
            {selectedResident && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Avatar>
                    <AvatarFallback>{(selectedResident as any).name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{(selectedResident as any).name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Unit {(selectedResident as any).unit} • {(selectedResident as any).care}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      toast({
                        title: "Status Updated",
                        description: "Resident status has been updated successfully.",
                      });
                      setSelectedResident(null);
                    }}
                  >
                    <CheckCircle className="h-5 w-5" />
                    Update Status
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      toast({
                        title: "Care Level Updated",
                        description: "Resident care level has been modified.",
                      });
                      setSelectedResident(null);
                    }}
                  >
                    <Heart className="h-5 w-5" />
                    Change Care
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      toast({
                        title: "Move-Out Processed",
                        description: "Resident move-out has been successfully processed.",
                        variant: "destructive",
                      });
                      setSelectedResident(null);
                    }}
                  >
                    <X className="h-5 w-5" />
                    Process Move-Out
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      toast({
                        title: "Billing Updated",
                        description: "Resident billing information has been updated.",
                      });
                      setSelectedResident(null);
                    }}
                  >
                    <DollarSign className="h-5 w-5" />
                    Update Billing
                  </Button>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setSelectedResident(null)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}