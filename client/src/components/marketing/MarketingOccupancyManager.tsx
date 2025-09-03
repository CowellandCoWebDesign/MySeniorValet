import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Calendar, Users, TrendingUp, Home, Phone, Mail, Clock, DollarSign, Target, UserPlus, Building, MapPin, Eye, FileText, CheckCircle, XCircle, AlertCircle, ChevronRight, Filter, Download, Send, Star, MessageSquare, Percent, BarChart3, Activity, CalendarDays, ArrowUpRight, ArrowDownRight, Camera } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface MarketingOccupancyManagerProps {
  communityId: string;
  viewMode?: 'admin' | 'family';
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
}

// Tier feature restrictions
const tierFeatures = {
  basic: {
    maxLeads: 50,
    maxTours: 20,
    hasAnalytics: false,
    hasCampaigns: false,
    hasAutomation: false
  },
  premium: {
    maxLeads: 500,
    maxTours: 200,
    hasAnalytics: true,
    hasCampaigns: true,
    hasAutomation: false
  },
  enterprise: {
    maxLeads: Infinity,
    maxTours: Infinity,
    hasAnalytics: true,
    hasCampaigns: true,
    hasAutomation: true
  }
};

const MarketingOccupancyManager: React.FC<MarketingOccupancyManagerProps> = ({
  communityId,
  viewMode = 'admin',
  subscriptionTier = 'basic'
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const features = tierFeatures[subscriptionTier];
  
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const [showTourDialog, setShowTourDialog] = useState(false);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('leads');

  // Fetch marketing data
  const { data: marketingData } = useQuery({
    queryKey: [`/api/marketing/${communityId}/dashboard`],
    enabled: viewMode === 'admin'
  });

  // Fetch available units for families
  const { data: availableUnits } = useQuery({
    queryKey: [`/api/marketing/${communityId}/available-units`],
    enabled: viewMode === 'family'
  });

  // Create new lead
  const createLeadMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', `/api/marketing/${communityId}/leads`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/marketing/${communityId}/dashboard`] });
      toast({ title: 'Lead created successfully' });
      setShowNewLeadDialog(false);
    }
  });

  // Schedule tour
  const scheduleTourMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', `/api/marketing/${communityId}/tours`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/marketing/${communityId}/dashboard`] });
      toast({ title: 'Tour scheduled successfully' });
      setShowTourDialog(false);
    }
  });

  // Update unit status
  const updateUnitMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PUT', `/api/marketing/${communityId}/units/${data.unitId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/marketing/${communityId}/dashboard`] });
      toast({ title: 'Unit updated successfully' });
    }
  });

  if (viewMode === 'family') {
    // Family View - Available Rooms & Tours
    return (
      <div className="space-y-6">
        {/* Available Units Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableUnits?.units?.map((unit: any) => (
            <Card key={unit.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{unit.name}</CardTitle>
                    <CardDescription>{unit.type}</CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Available</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {unit.imageUrl && (
                  <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">{unit.squareFeet} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Floor:</span>
                    <span className="font-medium">{unit.floor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly:</span>
                    <span className="font-semibold text-green-600">${unit.price}</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {unit.features?.map((feature: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setShowTourDialog(true)}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Schedule Tour
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Virtual Tour
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tour Request Dialog */}
        <Dialog open={showTourDialog} onOpenChange={setShowTourDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule a Tour</DialogTitle>
              <DialogDescription>
                We'd love to show you around! Fill out the form below and we'll confirm your tour.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input type="tel" placeholder="(555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label>Preferred Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Preferred Time</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9am">9:00 AM</SelectItem>
                    <SelectItem value="10am">10:00 AM</SelectItem>
                    <SelectItem value="11am">11:00 AM</SelectItem>
                    <SelectItem value="2pm">2:00 PM</SelectItem>
                    <SelectItem value="3pm">3:00 PM</SelectItem>
                    <SelectItem value="4pm">4:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tour Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tour type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-Person Tour</SelectItem>
                    <SelectItem value="virtual">Virtual Tour (Zoom)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Questions or Special Requests</Label>
                <Textarea placeholder="Tell us about your needs..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTourDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast({ title: 'Tour request submitted!', description: 'We\'ll contact you within 24 hours to confirm.' });
                setShowTourDialog(false);
              }}>
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Waitlist Section */}
        {availableUnits?.units?.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Join Our Waitlist
              </CardTitle>
              <CardDescription>
                We're currently at full occupancy, but spots do become available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Average wait time: 2-3 months • Current waitlist: 12 families
                </AlertDescription>
              </Alert>
              <Button className="w-full mt-4">
                <UserPlus className="w-4 h-4 mr-2" />
                Join Waitlist
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Admin View - Full Marketing & Occupancy Management
  return (
    <div className="space-y-6">
      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold">
                  {marketingData?.occupancy?.rate || '92'}%
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +2.1% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Leads</p>
                <p className="text-2xl font-bold">
                  {marketingData?.leads?.active || '47'}
                </p>
                <p className="text-xs text-amber-600 flex items-center mt-1">
                  <Activity className="w-3 h-3 mr-1" />
                  12 hot leads
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tours This Week</p>
                <p className="text-2xl font-bold">
                  {marketingData?.tours?.thisWeek || '8'}
                </p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  3 today
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {marketingData?.conversion?.rate || '24'}%
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Above industry avg
                </p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="tours">Tours</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Lead Pipeline</h3>
              <Badge variant="outline">
                {marketingData?.leads?.total || 0} / {features.maxLeads} leads
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                size="sm"
                onClick={() => setShowNewLeadDialog(true)}
                disabled={marketingData?.leads?.total >= features.maxLeads}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                New Lead
              </Button>
            </div>
          </div>

          {/* Lead Pipeline Stages */}
          <div className="grid grid-cols-5 gap-4">
            {['New', 'Contacted', 'Tour Scheduled', 'Application', 'Move-In Ready'].map((stage, idx) => (
              <Card key={stage} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{stage}</h4>
                    <Badge variant="secondary">{(marketingData?.leads?.byStage?.[idx] || 0)}</Badge>
                  </div>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {marketingData?.leads?.list?.filter((l: any) => l.stage === stage).map((lead: any) => (
                        <Card 
                          key={lead.id} 
                          className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.phone}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline" className="text-xs">
                                {lead.source}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {lead.daysInStage}d
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tours Tab */}
        <TabsContent value="tours" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tour Schedule</h3>
            <Button size="sm" onClick={() => setShowTourDialog(true)}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Tour
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Today's Tours */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Today's Tours</CardTitle>
                <CardDescription>
                  {marketingData?.tours?.today?.length || 0} scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {marketingData?.tours?.today?.map((tour: any) => (
                      <div key={tour.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{tour.time}</p>
                            <p className="text-sm">{tour.name}</p>
                          </div>
                          <Badge variant={tour.type === 'in-person' ? 'default' : 'secondary'}>
                            {tour.type}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="xs" variant="outline">
                            <Phone className="w-3 h-3" />
                          </Button>
                          <Button size="xs" variant="outline">
                            <Mail className="w-3 h-3" />
                          </Button>
                          <Button size="xs" variant="outline">
                            <MessageSquare className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Upcoming Tours */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">This Week</CardTitle>
                <CardDescription>
                  {marketingData?.tours?.thisWeek || 0} tours scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                    <div key={day} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                      <span className="text-sm font-medium">{day}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="min-w-[20px] justify-center">
                          {marketingData?.tours?.byDay?.[day] || 0}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tour Performance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tour Performance</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Show Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-20" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Conversion</span>
                    <div className="flex items-center gap-2">
                      <Progress value={32} className="w-20" />
                      <span className="text-sm font-medium">32%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Follow-ups</span>
                    <span className="text-sm font-medium">3.2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Close Time</span>
                    <span className="text-sm font-medium">7 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Occupancy Tab */}
        <TabsContent value="occupancy" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Unit Management</h3>
            <div className="flex gap-2">
              <Badge className="bg-green-100 text-green-700">
                Available: {marketingData?.units?.available || 8}
              </Badge>
              <Badge className="bg-blue-100 text-blue-700">
                Occupied: {marketingData?.units?.occupied || 92}
              </Badge>
              <Badge className="bg-amber-100 text-amber-700">
                Reserved: {marketingData?.units?.reserved || 3}
              </Badge>
            </div>
          </div>

          {/* Floor Plan Grid */}
          <div className="grid grid-cols-4 gap-4">
            {marketingData?.units?.list?.map((unit: any) => (
              <Card 
                key={unit.id}
                className={`p-4 cursor-pointer transition-all ${
                  unit.status === 'available' ? 'border-green-500 hover:shadow-lg' :
                  unit.status === 'reserved' ? 'border-amber-500' :
                  'border-gray-300 opacity-75'
                }`}
                onClick={() => setSelectedUnit(unit)}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{unit.number}</span>
                    <Badge variant={
                      unit.status === 'available' ? 'success' :
                      unit.status === 'reserved' ? 'warning' :
                      'secondary'
                    }>
                      {unit.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{unit.type}</p>
                    <p>{unit.squareFeet} sq ft</p>
                    <p className="font-medium text-foreground">${unit.price}/mo</p>
                  </div>
                  {unit.moveInDate && (
                    <p className="text-xs text-muted-foreground">
                      Move-in: {unit.moveInDate}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Upcoming Move-ins/Move-outs */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  Upcoming Move-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketingData?.moveIns?.map((move: any) => (
                    <div key={move.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{move.resident}</p>
                        <p className="text-xs text-muted-foreground">Unit {move.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{move.date}</p>
                        <Badge variant="outline" className="text-xs">
                          {move.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                  Planned Move-outs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketingData?.moveOuts?.map((move: any) => (
                    <div key={move.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{move.resident}</p>
                        <p className="text-xs text-muted-foreground">Unit {move.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{move.date}</p>
                        <Badge variant="outline" className="text-xs">
                          {move.reason}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          {!features.hasCampaigns ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Marketing Campaigns</h3>
                <p className="text-muted-foreground mb-4">
                  Upgrade to Premium to access marketing campaigns and automation
                </p>
                <Button>Upgrade to Premium</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Marketing Campaigns</h3>
                <Button size="sm" onClick={() => setShowCampaignDialog(true)}>
                  <Target className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketingData?.campaigns?.map((campaign: any) => (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{campaign.name}</CardTitle>
                          <CardDescription>{campaign.type}</CardDescription>
                        </div>
                        <Badge variant={campaign.status === 'active' ? 'success' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sent:</span>
                          <span className="font-medium">{campaign.sent}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Opens:</span>
                          <span className="font-medium">{campaign.openRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Clicks:</span>
                          <span className="font-medium">{campaign.clickRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Conversions:</span>
                          <span className="font-medium text-green-600">{campaign.conversions}</span>
                        </div>
                        <Progress value={campaign.progress} className="mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Referral Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Referral Sources</CardTitle>
                  <CardDescription>Where your leads are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {marketingData?.referralSources?.map((source: any) => (
                      <div key={source.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${source.color}`} />
                          <span className="font-medium">{source.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={source.percentage} className="w-24" />
                          <span className="text-sm font-medium min-w-[50px] text-right">
                            {source.count} ({source.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {!features.hasAnalytics ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Marketing Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Upgrade to Premium to access detailed analytics and insights
                </p>
                <Button>Upgrade to Premium</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Lead Conversion Funnel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { stage: 'Website Visitors', value: 2450 },
                        { stage: 'Inquiries', value: 312 },
                        { stage: 'Tours Scheduled', value: 89 },
                        { stage: 'Tours Completed', value: 67 },
                        { stage: 'Applications', value: 24 },
                        { stage: 'Move-ins', value: 18 }
                      ].map((item, idx) => (
                        <div key={item.stage}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">{item.stage}</span>
                            <span className="font-medium">{item.value}</span>
                          </div>
                          <Progress 
                            value={(item.value / 2450) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Average Lead Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Response Time</span>
                        <Badge variant="success">2.3 hours</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Follow-ups</span>
                        <Badge variant="secondary">4.1 avg</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Days to Tour</span>
                        <Badge variant="secondary">3.7 days</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Close Rate</span>
                        <Badge variant="success">24%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Avg Deal Size</span>
                        <Badge variant="secondary">$4,250/mo</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Marketing ROI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Monthly Spend</span>
                          <span className="font-medium">$3,200</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">New Move-ins</span>
                          <span className="font-medium">4</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Revenue Generated</span>
                          <span className="font-medium text-green-600">$17,000</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">ROI</span>
                          <span className="font-bold text-green-600 text-lg">431%</span>
                        </div>
                        <Progress value={100} className="h-3 bg-green-100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lead Source Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Lead Source Performance</CardTitle>
                  <CardDescription>Conversion rates by source</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { source: 'Website', leads: 142, tours: 45, conversions: 12, rate: 26.7 },
                      { source: 'Referrals', leads: 87, tours: 38, conversions: 15, rate: 39.5 },
                      { source: 'Google Ads', leads: 63, tours: 18, conversions: 4, rate: 22.2 },
                      { source: 'Social Media', leads: 41, tours: 11, conversions: 2, rate: 18.2 },
                      { source: 'Events', leads: 23, tours: 9, conversions: 3, rate: 33.3 }
                    ].map(item => (
                      <div key={item.source} className="grid grid-cols-5 gap-4 items-center p-2 hover:bg-muted/50 rounded">
                        <span className="font-medium">{item.source}</span>
                        <span className="text-sm text-center">{item.leads} leads</span>
                        <span className="text-sm text-center">{item.tours} tours</span>
                        <span className="text-sm text-center">{item.conversions} move-ins</span>
                        <div className="flex items-center gap-2">
                          <Progress value={item.rate} className="flex-1" />
                          <span className="text-sm font-medium min-w-[45px]">{item.rate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* New Lead Dialog */}
      <Dialog open={showNewLeadDialog} onOpenChange={setShowNewLeadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Enter the prospect's information to start the sales process
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input placeholder="John" />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input placeholder="Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" placeholder="(555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label>Lead Source</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="google">Google Ads</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Interest Level</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Any additional information..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewLeadDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast({ title: 'Lead created successfully' });
              setShowNewLeadDialog(false);
            }}>
              Create Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketingOccupancyManager;