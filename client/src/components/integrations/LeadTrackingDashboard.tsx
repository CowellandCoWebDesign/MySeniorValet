import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { 
  Users, TrendingUp, UserPlus, Phone, Mail, Calendar, Clock,
  ChevronRight, Filter, Download, Upload, Search, DollarSign,
  Target, Activity, BarChart3, PieChart, AlertCircle, CheckCircle,
  MessageSquare, FileText, Settings, RefreshCw, Plus, Edit, Trash2,
  ArrowUp, ArrowDown, Minus, Star, Home, Heart, Brain, Zap
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LeadTrackingDashboardProps {
  communityId: number;
  tierLevel: 'professional' | 'premium' | 'enterprise';
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'tour_scheduled' | 'tour_completed' | 'application' | 'closed_won' | 'closed_lost';
  priority: 'high' | 'medium' | 'low';
  careLevel: string;
  budget: { min: number; max: number };
  moveInTimeline: string;
  lastContact: Date;
  nextFollowUp: Date;
  assignedTo: string;
  notes: string;
  score: number;
  createdAt: Date;
  tourDate?: Date;
  conversionProbability: number;
}

const LEAD_STATUSES = [
  { value: 'new', label: 'New Lead', color: 'bg-blue-500' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
  { value: 'qualified', label: 'Qualified', color: 'bg-purple-500' },
  { value: 'tour_scheduled', label: 'Tour Scheduled', color: 'bg-orange-500' },
  { value: 'tour_completed', label: 'Tour Completed', color: 'bg-indigo-500' },
  { value: 'application', label: 'Application', color: 'bg-pink-500' },
  { value: 'closed_won', label: 'Closed Won', color: 'bg-green-500' },
  { value: 'closed_lost', label: 'Closed Lost', color: 'bg-gray-500' }
];

export function LeadTrackingDashboard({ communityId, tierLevel }: LeadTrackingDashboardProps) {
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddLeadDialog, setShowAddLeadDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'website',
    careLevel: 'assisted_living',
    budgetMin: '',
    budgetMax: '',
    moveInTimeline: '1-3 months',
    notes: ''
  });

  // Fetch leads data
  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: [`/api/communities/${communityId}/leads`],
  });

  // Fetch lead analytics
  const { data: analytics } = useQuery({
    queryKey: [`/api/communities/${communityId}/leads/analytics`],
  });

  // Add new lead mutation
  const addLeadMutation = useMutation({
    mutationFn: async (leadData: any) => {
      return await apiRequest('POST', `/api/communities/${communityId}/leads`, leadData);
    },
    onSuccess: () => {
      toast({
        title: "Lead Added",
        description: "New lead has been added to your pipeline",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/leads`] });
      setShowAddLeadDialog(false);
      resetLeadForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Lead",
        description: error.message || "Error adding new lead",
        variant: "destructive",
      });
    }
  });

  // Update lead status mutation
  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      return await apiRequest('PATCH', `/api/communities/${communityId}/leads/${leadId}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Lead Updated",
        description: "Lead status has been updated",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/leads`] });
    }
  });

  // Sync with Salesforce mutation
  const syncSalesforceMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/salesforce/leads/sync`, { communityId });
    },
    onSuccess: (data) => {
      toast({
        title: "Salesforce Sync Complete",
        description: `Synced ${data.synced} leads with Salesforce`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/leads`] });
    }
  });

  const resetLeadForm = () => {
    setLeadForm({
      name: '',
      email: '',
      phone: '',
      source: 'website',
      careLevel: 'assisted_living',
      budgetMin: '',
      budgetMax: '',
      moveInTimeline: '1-3 months',
      notes: ''
    });
  };

  const leads = leadsData?.leads || [];
  const filteredLeads = leads.filter((lead: Lead) => {
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate pipeline metrics
  const pipelineMetrics = {
    totalLeads: leads.length,
    newLeads: leads.filter((l: Lead) => l.status === 'new').length,
    qualifiedLeads: leads.filter((l: Lead) => l.status === 'qualified').length,
    toursScheduled: leads.filter((l: Lead) => l.status === 'tour_scheduled').length,
    conversions: leads.filter((l: Lead) => l.status === 'closed_won').length,
    conversionRate: leads.length > 0 ? 
      (leads.filter((l: Lead) => l.status === 'closed_won').length / leads.length * 100).toFixed(1) : 0,
    avgTimeToClose: analytics?.avgTimeToClose || 0,
    pipelineValue: leads.reduce((sum: number, lead: Lead) => 
      sum + (lead.budget.max * lead.conversionProbability / 100), 0)
  };

  // Prepare chart data
  const stageData = LEAD_STATUSES.map(status => ({
    name: status.label,
    value: leads.filter((l: Lead) => l.status === status.value).length
  }));

  const sourceData = analytics?.leadSources || [];
  const conversionTrend = analytics?.conversionTrend || [];

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Lead Tracking & Pipeline Management
              </CardTitle>
              <CardDescription>
                Track and convert leads through your sales pipeline
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => syncSalesforceMutation.mutate()}
                disabled={syncSalesforceMutation.isPending}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncSalesforceMutation.isPending ? 'animate-spin' : ''}`} />
                Sync Salesforce
              </Button>
              <Button onClick={() => setShowAddLeadDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{pipelineMetrics.totalLeads}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +12% this month
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tours Scheduled</p>
                <p className="text-2xl font-bold">{pipelineMetrics.toursScheduled}</p>
                <p className="text-xs text-gray-500 mt-1">This week</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{pipelineMetrics.conversionRate}%</p>
                <Progress value={Number(pipelineMetrics.conversionRate)} className="mt-2 h-1" />
              </div>
              <Target className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pipeline Value</p>
                <p className="text-2xl font-bold">
                  ${Math.round(pipelineMetrics.pipelineValue).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Potential revenue</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Pipeline Kanban View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lead Pipeline</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {LEAD_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <div className="flex gap-4 pb-4">
              {LEAD_STATUSES.map(status => (
                <div key={status.value} className="flex-1 min-w-[250px]">
                  <div className={`${status.color} text-white px-3 py-2 rounded-t-lg`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{status.label}</span>
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {leads.filter((l: Lead) => l.status === status.value).length}
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-b-lg p-2 min-h-[300px]">
                    {filteredLeads
                      .filter((lead: Lead) => lead.status === status.value)
                      .map((lead: Lead) => (
                        <div
                          key={lead.id}
                          className="bg-white dark:bg-gray-700 rounded-lg p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm">{lead.name}</h4>
                            <Badge 
                              variant={lead.priority === 'high' ? 'destructive' : 
                                      lead.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {lead.priority}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Home className="w-3 h-3" />
                              {lead.careLevel}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${lead.budget.min}-${lead.budget.max}/mo
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lead.moveInTimeline}
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Activity className="w-3 h-3 text-green-600" />
                              <span className="text-xs">{lead.score}% match</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {differenceInDays(new Date(), new Date(lead.createdAt))}d ago
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Analytics Section */}
      {tierLevel !== 'professional' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPie>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sourceData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={conversionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="leads" stroke="#3B82F6" name="Leads" />
                  <Line type="monotone" dataKey="conversions" stroke="#10B981" name="Conversions" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Lead Dialog */}
      <Dialog open={showAddLeadDialog} onOpenChange={setShowAddLeadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Enter the lead's information to add them to your pipeline
            </DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                placeholder="John Smith"
                value={leadForm.name}
                onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={leadForm.email}
                onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                type="tel"
                placeholder="(555) 123-4567"
                value={leadForm.phone}
                onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
              />
            </div>
            <div>
              <Label>Lead Source</Label>
              <Select value={leadForm.source} onValueChange={(v) => setLeadForm({...leadForm, source: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="tour">Walk-in Tour</SelectItem>
                  <SelectItem value="event">Community Event</SelectItem>
                  <SelectItem value="online_ad">Online Advertising</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Care Level Needed</Label>
              <Select value={leadForm.careLevel} onValueChange={(v) => setLeadForm({...leadForm, careLevel: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent_living">Independent Living</SelectItem>
                  <SelectItem value="assisted_living">Assisted Living</SelectItem>
                  <SelectItem value="memory_care">Memory Care</SelectItem>
                  <SelectItem value="skilled_nursing">Skilled Nursing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Move-in Timeline</Label>
              <Select value={leadForm.moveInTimeline} onValueChange={(v) => setLeadForm({...leadForm, moveInTimeline: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="1 month">Within 1 month</SelectItem>
                  <SelectItem value="1-3 months">1-3 months</SelectItem>
                  <SelectItem value="3-6 months">3-6 months</SelectItem>
                  <SelectItem value="6+ months">6+ months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Budget Range (Monthly)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={leadForm.budgetMin}
                  onChange={(e) => setLeadForm({...leadForm, budgetMin: e.target.value})}
                />
                <span>to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={leadForm.budgetMax}
                  onChange={(e) => setLeadForm({...leadForm, budgetMax: e.target.value})}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any additional information..."
                value={leadForm.notes}
                onChange={(e) => setLeadForm({...leadForm, notes: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              className="flex-1"
              onClick={() => addLeadMutation.mutate(leadForm)}
              disabled={!leadForm.name || !leadForm.email}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
            <Button variant="outline" onClick={() => setShowAddLeadDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}