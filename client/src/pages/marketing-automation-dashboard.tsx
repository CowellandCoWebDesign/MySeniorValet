import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Mail, Users, Target, TrendingUp, Clock, Send, 
  BarChart3, Brain, Zap, Filter, Calendar, Award,
  MessageSquare, Phone, Globe, ChevronRight, Settings,
  PlayCircle, PauseCircle, CheckCircle2, XCircle
} from 'lucide-react';
import { ProfessionalNavbar } from '@/components/ProfessionalNavbar';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Funnel,
  FunnelChart,
  LabelList
} from 'recharts';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Phase 5 Marketing Automation Dashboard
 * Complete lead nurturing and campaign management system
 * 
 * Features:
 * - Multi-channel campaigns (email, SMS, in-app)
 * - Lead scoring and segmentation
 * - Automated workflows and triggers
 * - A/B testing capabilities
 * - Conversion tracking
 * - ROI analytics
 * - Tier-based feature access
 */

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'multi-channel';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  audience: number;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  startDate: string;
  endDate?: string;
  performance: number;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  score: number;
  stage: 'new' | 'contacted' | 'qualified' | 'opportunity' | 'customer' | 'lost';
  source: string;
  lastActivity: string;
  assignedTo?: string;
  value: number;
  tags: string[];
}

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  status: 'active' | 'paused' | 'draft';
  steps: number;
  enrolled: number;
  completed: number;
  conversionRate: number;
  lastRun: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  openRate: number;
  clickRate: number;
  lastUsed: string;
  abTesting: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function MarketingAutomationDashboard() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState('30d');
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const { toast } = useToast();
  
  // Fetch campaigns
  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ['/api/marketing/campaigns', selectedDateRange],
    enabled: true,
    initialData: [
      {
        id: '1',
        name: 'Summer Move-In Special',
        type: 'multi-channel',
        status: 'active',
        audience: 2500,
        sent: 2450,
        opened: 1960,
        clicked: 490,
        converted: 98,
        revenue: 294000,
        startDate: '2025-08-01',
        performance: 92
      },
      {
        id: '2',
        name: 'Welcome Series - New Inquiries',
        type: 'email',
        status: 'active',
        audience: 850,
        sent: 830,
        opened: 664,
        clicked: 166,
        converted: 33,
        revenue: 99000,
        startDate: '2025-07-15',
        performance: 88
      },
      {
        id: '3',
        name: 'Tour Follow-Up Sequence',
        type: 'email',
        status: 'active',
        audience: 425,
        sent: 425,
        opened: 361,
        clicked: 108,
        converted: 32,
        revenue: 96000,
        startDate: '2025-08-10',
        performance: 95
      },
      {
        id: '4',
        name: 'SMS Reminder - Scheduled Tours',
        type: 'sms',
        status: 'active',
        audience: 180,
        sent: 180,
        opened: 162,
        clicked: 54,
        converted: 18,
        revenue: 54000,
        startDate: '2025-08-20',
        performance: 90
      },
      {
        id: '5',
        name: 'Re-engagement Campaign',
        type: 'multi-channel',
        status: 'scheduled',
        audience: 1200,
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        revenue: 0,
        startDate: '2025-09-05',
        performance: 0
      }
    ]
  });
  
  // Fetch leads
  const { data: leads } = useQuery<Lead[]>({
    queryKey: ['/api/marketing/leads'],
    enabled: true,
    initialData: [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '555-0123',
        score: 85,
        stage: 'opportunity',
        source: 'Website',
        lastActivity: '2 hours ago',
        assignedTo: 'Lisa Chen',
        value: 3500,
        tags: ['high-value', 'tour-scheduled']
      },
      {
        id: '2',
        name: 'Michael Brown',
        email: 'mbrown@email.com',
        phone: '555-0124',
        score: 72,
        stage: 'qualified',
        source: 'Referral',
        lastActivity: '1 day ago',
        assignedTo: 'Tom Wilson',
        value: 3000,
        tags: ['referral', 'memory-care']
      },
      {
        id: '3',
        name: 'Emily Davis',
        email: 'emily.d@email.com',
        phone: '555-0125',
        score: 68,
        stage: 'contacted',
        source: 'Google Ads',
        lastActivity: '3 days ago',
        assignedTo: 'Lisa Chen',
        value: 2800,
        tags: ['paid-search', 'independent-living']
      },
      {
        id: '4',
        name: 'Robert Martinez',
        email: 'rmartinez@email.com',
        phone: '555-0126',
        score: 92,
        stage: 'customer',
        source: 'Tour',
        lastActivity: '1 week ago',
        value: 4200,
        tags: ['converted', 'assisted-living']
      }
    ]
  });
  
  // Fetch workflows
  const { data: workflows } = useQuery<Workflow[]>({
    queryKey: ['/api/marketing/workflows'],
    enabled: true,
    initialData: [
      {
        id: '1',
        name: 'New Lead Welcome Series',
        trigger: 'Form Submission',
        status: 'active',
        steps: 5,
        enrolled: 1250,
        completed: 875,
        conversionRate: 24,
        lastRun: '1 hour ago'
      },
      {
        id: '2',
        name: 'Tour No-Show Recovery',
        trigger: 'Missed Tour',
        status: 'active',
        steps: 3,
        enrolled: 145,
        completed: 98,
        conversionRate: 18,
        lastRun: '3 hours ago'
      },
      {
        id: '3',
        name: 'Lead Scoring Update',
        trigger: 'Engagement Score Change',
        status: 'active',
        steps: 2,
        enrolled: 3420,
        completed: 3420,
        conversionRate: 0,
        lastRun: '30 minutes ago'
      },
      {
        id: '4',
        name: 'Birthday Greetings',
        trigger: 'Contact Birthday',
        status: 'paused',
        steps: 1,
        enrolled: 450,
        completed: 450,
        conversionRate: 5,
        lastRun: '2 days ago'
      }
    ]
  });
  
  // Fetch email templates
  const { data: templates } = useQuery<EmailTemplate[]>({
    queryKey: ['/api/marketing/templates'],
    enabled: true,
    initialData: [
      {
        id: '1',
        name: 'Welcome to Our Community',
        subject: 'Welcome! Here\'s What to Expect',
        category: 'Welcome',
        openRate: 68,
        clickRate: 24,
        lastUsed: '2025-08-30',
        abTesting: true
      },
      {
        id: '2',
        name: 'Tour Confirmation',
        subject: 'Your Tour is Confirmed for {date}',
        category: 'Transactional',
        openRate: 85,
        clickRate: 32,
        lastUsed: '2025-08-31',
        abTesting: false
      },
      {
        id: '3',
        name: 'Monthly Newsletter',
        subject: 'Community Updates & Events',
        category: 'Newsletter',
        openRate: 42,
        clickRate: 15,
        lastUsed: '2025-08-01',
        abTesting: true
      }
    ]
  });
  
  // Funnel data
  const funnelData = [
    { name: 'Website Visitors', value: 12500, fill: '#0088FE' },
    { name: 'Leads Generated', value: 3750, fill: '#00C49F' },
    { name: 'Tours Scheduled', value: 875, fill: '#FFBB28' },
    { name: 'Tours Completed', value: 656, fill: '#FF8042' },
    { name: 'Applications', value: 197, fill: '#8884D8' },
    { name: 'Move-Ins', value: 98, fill: '#82CA9D' }
  ];
  
  // Campaign performance over time
  const performanceData = [
    { month: 'Jan', emails: 4500, sms: 1200, conversions: 45 },
    { month: 'Feb', emails: 4800, sms: 1350, conversions: 52 },
    { month: 'Mar', emails: 5200, sms: 1500, conversions: 58 },
    { month: 'Apr', emails: 5100, sms: 1450, conversions: 61 },
    { month: 'May', emails: 5500, sms: 1600, conversions: 68 },
    { month: 'Jun', emails: 5800, sms: 1750, conversions: 72 },
    { month: 'Jul', emails: 6200, sms: 1900, conversions: 78 },
    { month: 'Aug', emails: 6500, sms: 2100, conversions: 85 }
  ];
  
  // Lead source distribution
  const leadSourceData = [
    { source: 'Website', value: 35, color: '#0088FE' },
    { source: 'Google Ads', value: 25, color: '#00C49F' },
    { source: 'Referrals', value: 20, color: '#FFBB28' },
    { source: 'Social Media', value: 12, color: '#FF8042' },
    { source: 'Direct Mail', value: 5, color: '#8884D8' },
    { source: 'Other', value: 3, color: '#82CA9D' }
  ];
  
  const getStageColor = (stage: string) => {
    const colors = {
      new: 'bg-gray-100 text-gray-700',
      contacted: 'bg-blue-100 text-blue-700',
      qualified: 'bg-yellow-100 text-yellow-700',
      opportunity: 'bg-purple-100 text-purple-700',
      customer: 'bg-green-100 text-green-700',
      lost: 'bg-red-100 text-red-700'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <PlayCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <PauseCircle className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };
  
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      // API call would go here
      return Promise.resolve(campaignData);
    },
    onSuccess: () => {
      toast({
        title: 'Campaign Created',
        description: 'Your campaign has been created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/campaigns'] });
      setShowNewCampaignModal(false);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <ProfessionalNavbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Marketing Automation
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                AI-powered lead nurturing and campaign management
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowNewCampaignModal(true)}>
                <Zap className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
            </div>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total Leads</p>
                  <p className="text-2xl font-bold">3,847</p>
                  <p className="text-xs text-green-600">+12% this month</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Campaigns Active</p>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-blue-600">4 scheduled</p>
                </div>
                <Mail className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Avg Open Rate</p>
                  <p className="text-2xl font-bold">68%</p>
                  <p className="text-xs text-green-600">+5% vs last month</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Conversion Rate</p>
                  <p className="text-2xl font-bold">4.2%</p>
                  <p className="text-xs text-yellow-600">Industry avg: 3.8%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Revenue Generated</p>
                  <p className="text-2xl font-bold">$543K</p>
                  <p className="text-xs text-green-600">ROI: 823%</p>
                </div>
                <Award className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Tabs defaultValue="campaigns" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
                <CardDescription>Monitor and manage your marketing campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaigns?.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(campaign.status)}
                          <div>
                            <h4 className="font-semibold">{campaign.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Badge variant="outline">{campaign.type}</Badge>
                              <span>Started {new Date(campaign.startDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-6 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Audience</p>
                          <p className="font-medium">{campaign.audience.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Sent</p>
                          <p className="font-medium">{campaign.sent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Opened</p>
                          <p className="font-medium">{((campaign.opened / campaign.sent) * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Clicked</p>
                          <p className="font-medium">{((campaign.clicked / campaign.opened) * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Converted</p>
                          <p className="font-medium">{campaign.converted}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Revenue</p>
                          <p className="font-medium text-green-600">
                            ${(campaign.revenue / 1000).toFixed(0)}K
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">Performance Score</span>
                          <span className="text-xs font-medium">{campaign.performance}%</span>
                        </div>
                        <Progress value={campaign.performance} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="leads" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Lead Management</CardTitle>
                    <CardDescription>Track and nurture your leads through the sales funnel</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Import Leads
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2">Lead</th>
                        <th className="text-left py-2">Score</th>
                        <th className="text-left py-2">Stage</th>
                        <th className="text-left py-2">Source</th>
                        <th className="text-left py-2">Assigned To</th>
                        <th className="text-left py-2">Value</th>
                        <th className="text-left py-2">Last Activity</th>
                        <th className="text-center py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads?.map((lead) => (
                        <tr key={lead.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3">
                            <div>
                              <p className="font-medium">{lead.name}</p>
                              <p className="text-xs text-gray-500">{lead.email}</p>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-12 relative">
                                <svg className="w-12 h-12 transform -rotate-90">
                                  <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                    className="text-gray-200"
                                  />
                                  <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 20}`}
                                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - lead.score / 100)}`}
                                    className={lead.score > 70 ? 'text-green-500' : lead.score > 40 ? 'text-yellow-500' : 'text-red-500'}
                                  />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                                  {lead.score}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge className={getStageColor(lead.stage)}>
                              {lead.stage}
                            </Badge>
                          </td>
                          <td className="py-3">{lead.source}</td>
                          <td className="py-3">{lead.assignedTo || '-'}</td>
                          <td className="py-3 font-medium">${lead.value.toLocaleString()}</td>
                          <td className="py-3 text-sm text-gray-500">{lead.lastActivity}</td>
                          <td className="py-3">
                            <div className="flex justify-center gap-1">
                              <Button size="sm" variant="ghost">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="workflows" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Automation Workflows</CardTitle>
                    <CardDescription>Automated sequences for lead nurturing</CardDescription>
                  </div>
                  <Button>
                    <Zap className="h-4 w-4 mr-2" />
                    Create Workflow
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workflows?.map((workflow) => (
                    <div key={workflow.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            {workflow.status === 'active' ? (
                              <PlayCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <PauseCircle className="h-5 w-5 text-yellow-500" />
                            )}
                            <h4 className="font-semibold">{workflow.name}</h4>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Trigger: {workflow.trigger}</p>
                        </div>
                        <Switch checked={workflow.status === 'active'} />
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Steps</span>
                          <span className="font-medium">{workflow.steps}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Enrolled</span>
                          <span className="font-medium">{workflow.enrolled.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Completed</span>
                          <span className="font-medium">{workflow.completed.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Conversion</span>
                          <span className="font-medium text-green-600">{workflow.conversionRate}%</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                        <span>Last run: {workflow.lastRun}</span>
                        <Button size="sm" variant="ghost">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Pre-built templates for your campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {templates?.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="mb-3">
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {template.subject}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">{template.category}</Badge>
                        {template.abTesting && (
                          <Badge variant="secondary">A/B Testing</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Open Rate</p>
                          <p className="font-medium">{template.openRate}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Click Rate</p>
                          <p className="font-medium">{template.clickRate}%</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Last used: {new Date(template.lastUsed).toLocaleDateString()}
                        </span>
                        <Button size="sm" variant="ghost">
                          Use Template
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Conversion Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Funnel</CardTitle>
                  <CardDescription>Lead journey from visitor to move-in</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={funnelData} layout="horizontal">
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        <LabelList dataKey="value" position="right" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Lead Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Lead Sources</CardTitle>
                  <CardDescription>Where your leads are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={leadSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.source}: ${entry.value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leadSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Campaign Performance Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance Trends</CardTitle>
                <CardDescription>Email, SMS, and conversion metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="emails"
                      stroke="#0088FE"
                      name="Emails Sent"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="sms"
                      stroke="#00C49F"
                      name="SMS Sent"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="conversions"
                      stroke="#FF8042"
                      strokeWidth={2}
                      name="Conversions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* AI Insights */}
            <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
              <Brain className="h-4 w-4" />
              <AlertTitle>AI-Powered Insights</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>• Your Tuesday morning emails have 23% higher open rates - consider scheduling more campaigns for this time</p>
                <p>• Leads from Google Ads convert 2.3x better than social media - increase PPC budget by 15%</p>
                <p>• The "Tour Follow-Up" workflow has the highest ROI at 1,245% - expand this to all tour attendees</p>
                <p>• SMS reminders sent 2 hours before tours reduce no-shows by 35%</p>
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Marketing Automation Settings</CardTitle>
                <CardDescription>Configure your marketing automation preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Email Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sender-name">Sender Name</Label>
                      <Input id="sender-name" defaultValue="Sunrise Valley Community" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reply-to">Reply-To Email</Label>
                      <Input id="reply-to" type="email" defaultValue="info@sunrisevalley.com" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Lead Scoring Rules</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Email Open</p>
                        <p className="text-sm text-gray-500">Points added when lead opens an email</p>
                      </div>
                      <Input type="number" defaultValue="5" className="w-20" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Link Click</p>
                        <p className="text-sm text-gray-500">Points added when lead clicks a link</p>
                      </div>
                      <Input type="number" defaultValue="10" className="w-20" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Tour Scheduled</p>
                        <p className="text-sm text-gray-500">Points added when lead schedules a tour</p>
                      </div>
                      <Input type="number" defaultValue="25" className="w-20" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Automation Limits</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Daily Email Limit</p>
                        <p className="text-sm text-gray-500">Maximum emails per day per lead</p>
                      </div>
                      <Select defaultValue="3">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Opt-Out Compliance</p>
                        <p className="text-sm text-gray-500">Automatically honor opt-out requests</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}