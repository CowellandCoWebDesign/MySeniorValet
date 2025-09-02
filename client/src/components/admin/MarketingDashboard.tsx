import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Mail, Users, Video, Share2, TrendingUp, Calendar,
  Play, Pause, Send, Target, DollarSign, Eye,
  Hash, MessageSquare, Heart, BarChart3, Clock,
  CheckCircle, XCircle, AlertCircle, PlusCircle,
  Settings, Filter, Download, Upload, RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface MarketingDashboardProps {
  communityId: number;
}

export function MarketingDashboard({ communityId }: MarketingDashboardProps) {
  const { toast } = useToast();
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [newEmailCampaign, setNewEmailCampaign] = useState({
    name: '',
    subject: '',
    recipientSegment: 'all',
    htmlContent: '',
    scheduledAt: ''
  });

  // ==================== QUERIES ====================
  
  // Fetch email campaigns
  const { data: emailCampaigns = [], refetch: refetchEmailCampaigns } = useQuery({
    queryKey: ['/api/marketing/campaigns/email', communityId],
    queryFn: () => apiRequest('GET', `/api/marketing/campaigns/email?communityId=${communityId}`)
  });

  // Fetch workflows
  const { data: workflows = [], refetch: refetchWorkflows } = useQuery({
    queryKey: ['/api/marketing/workflows', communityId],
    queryFn: () => apiRequest('GET', `/api/marketing/workflows?communityId=${communityId}`)
  });

  // Fetch virtual tours
  const { data: virtualTours = [], refetch: refetchTours } = useQuery({
    queryKey: ['/api/marketing/tours', communityId],
    queryFn: () => apiRequest('GET', `/api/marketing/tours?communityId=${communityId}`)
  });

  // Fetch social media posts
  const { data: socialPosts = [], refetch: refetchSocialPosts } = useQuery({
    queryKey: ['/api/marketing/social-media/posts', communityId],
    queryFn: () => apiRequest('GET', `/api/marketing/social-media/posts?communityId=${communityId}`)
  });

  // Fetch marketing leads
  const { data: leads = [], refetch: refetchLeads } = useQuery({
    queryKey: ['/api/marketing/leads', communityId],
    queryFn: () => apiRequest('GET', `/api/marketing/leads?communityId=${communityId}`)
  });

  // Fetch ROI metrics
  const { data: roiData, refetch: refetchROI } = useQuery({
    queryKey: ['/api/marketing/roi', communityId],
    queryFn: () => apiRequest('GET', `/api/marketing/roi?communityId=${communityId}`)
  });

  // ==================== MUTATIONS ====================

  // Create email campaign
  const createEmailCampaignMutation = useMutation({
    mutationFn: (campaignData: any) => 
      apiRequest('POST', '/api/marketing/campaigns/email', {
        ...campaignData,
        communityId
      }),
    onSuccess: () => {
      toast({ title: 'Email campaign created successfully' });
      refetchEmailCampaigns();
      setNewEmailCampaign({
        name: '',
        subject: '',
        recipientSegment: 'all',
        htmlContent: '',
        scheduledAt: ''
      });
    },
    onError: () => {
      toast({ title: 'Failed to create email campaign', variant: 'destructive' });
    }
  });

  // Send email campaign
  const sendEmailCampaignMutation = useMutation({
    mutationFn: (campaignId: number) => 
      apiRequest('POST', `/api/marketing/campaigns/email/${campaignId}/send`),
    onSuccess: () => {
      toast({ title: 'Email campaign sent successfully' });
      refetchEmailCampaigns();
    },
    onError: () => {
      toast({ title: 'Failed to send email campaign', variant: 'destructive' });
    }
  });

  // ==================== COMPONENTS ====================

  // Email Campaigns Tab
  const EmailCampaignsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Email Campaigns</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Email Campaign</DialogTitle>
              <DialogDescription>Design and schedule your email marketing campaign</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  value={newEmailCampaign.name}
                  onChange={(e) => setNewEmailCampaign({ ...newEmailCampaign, name: e.target.value })}
                  placeholder="Summer Newsletter"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={newEmailCampaign.subject}
                  onChange={(e) => setNewEmailCampaign({ ...newEmailCampaign, subject: e.target.value })}
                  placeholder="Exciting updates from our community!"
                />
              </div>
              <div>
                <Label htmlFor="segment">Recipient Segment</Label>
                <Select
                  value={newEmailCampaign.recipientSegment}
                  onValueChange={(value) => setNewEmailCampaign({ ...newEmailCampaign, recipientSegment: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contacts</SelectItem>
                    <SelectItem value="leads">Leads Only</SelectItem>
                    <SelectItem value="families">Families</SelectItem>
                    <SelectItem value="prospects">Prospects</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content">Email Content (HTML)</Label>
                <Textarea
                  id="content"
                  value={newEmailCampaign.htmlContent}
                  onChange={(e) => setNewEmailCampaign({ ...newEmailCampaign, htmlContent: e.target.value })}
                  placeholder="<h1>Welcome!</h1><p>Your email content here...</p>"
                  rows={8}
                />
              </div>
              <div>
                <Label htmlFor="schedule">Schedule Send</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={newEmailCampaign.scheduledAt}
                  onChange={(e) => setNewEmailCampaign({ ...newEmailCampaign, scheduledAt: e.target.value })}
                />
              </div>
              <Button 
                onClick={() => createEmailCampaignMutation.mutate(newEmailCampaign)}
                className="w-full"
              >
                Create Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {emailCampaigns.map((campaign: any) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{campaign.name}</CardTitle>
                  <CardDescription>{campaign.subject}</CardDescription>
                </div>
                <Badge variant={
                  campaign.status === 'sent' ? 'default' :
                  campaign.status === 'scheduled' ? 'secondary' :
                  campaign.status === 'draft' ? 'outline' : 'destructive'
                }>
                  {campaign.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {campaign.recipientSegment}
                  </span>
                  {campaign.metrics?.opens && (
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {campaign.metrics.opens} opens
                    </span>
                  )}
                  {campaign.metrics?.clicks && (
                    <span className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {campaign.metrics.clicks} clicks
                    </span>
                  )}
                </div>
                {campaign.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => sendEmailCampaignMutation.mutate(campaign.id)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Lead Workflows Tab
  const LeadWorkflowsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lead Nurturing Workflows</h3>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>

      <div className="grid gap-4">
        {workflows.map((workflow: any) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{workflow.name}</CardTitle>
                  <CardDescription>{workflow.description}</CardDescription>
                </div>
                <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                  {workflow.isActive ? 'Active' : 'Paused'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Trigger: {workflow.triggerType}</span>
                <span>Steps: {workflow.steps?.length || 0}</span>
                <span>Enrolled: {workflow.metrics?.enrolled || 0}</span>
                <span>Completed: {workflow.metrics?.completed || 0}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Virtual Tours Tab
  const VirtualToursTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Virtual Tours</h3>
        <Button>
          <Video className="h-4 w-4 mr-2" />
          Add Tour
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {virtualTours.map((tour: any) => (
          <Card key={tour.id}>
            <CardHeader>
              <CardTitle className="text-base">{tour.title}</CardTitle>
              <Badge variant="outline">{tour.tourType}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tour.thumbnailUrl && (
                  <img 
                    src={tour.thumbnailUrl} 
                    alt={tour.title}
                    className="w-full h-32 object-cover rounded"
                  />
                )}
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {tour.viewCount} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {Math.floor((tour.avgViewDuration || 0) / 60)}m avg
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Social Media Tab
  const SocialMediaTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Social Media Scheduler</h3>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Post
        </Button>
      </div>

      <div className="grid gap-4">
        {socialPosts.map((post: any) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  {post.platforms?.map((platform: string) => (
                    <Badge key={platform} variant="outline">
                      {platform}
                    </Badge>
                  ))}
                </div>
                <Badge variant={
                  post.status === 'published' ? 'default' :
                  post.status === 'scheduled' ? 'secondary' : 'outline'
                }>
                  {post.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">{post.content}</p>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Scheduled: {new Date(post.scheduledAt).toLocaleString()}</span>
                {post.engagement && (
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.engagement.likes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {post.engagement.comments || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      {post.engagement.shares || 0}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // ROI Tracking Tab
  const ROITrackingTab = () => {
    const totals = roiData?.totals || {
      spend: 0,
      revenue: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      roi: 0,
      costPerClick: 0,
      costPerConversion: 0,
      conversionRate: 0
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">ROI Tracking Dashboard</h3>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Spend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totals.spend.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Revenue Generated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${totals.revenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>ROI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totals.roi.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Conversion Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totals.conversionRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Impressions</p>
                <p className="text-xl font-semibold">{totals.impressions.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clicks</p>
                <p className="text-xl font-semibold">{totals.clicks.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-xl font-semibold">{totals.conversions.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost Per Click</p>
                <p className="text-xl font-semibold">${totals.costPerClick.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost Per Conversion</p>
                <p className="text-xl font-semibold">${totals.costPerConversion.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                <p className="text-xl font-semibold">
                  ${totals.conversions > 0 ? (totals.revenue / totals.conversions).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Leads Management Tab
  const LeadsManagementTab = () => {
    const leadsByStage = {
      new: leads.filter((l: any) => l.stage === 'new').length,
      contacted: leads.filter((l: any) => l.stage === 'contacted').length,
      qualified: leads.filter((l: any) => l.stage === 'qualified').length,
      tour_scheduled: leads.filter((l: any) => l.stage === 'tour_scheduled').length,
      converted: leads.filter((l: any) => l.stage === 'converted').length,
      lost: leads.filter((l: any) => l.stage === 'lost').length
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Lead Management</h3>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Import Leads
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>New</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadsByStage.new}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Contacted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadsByStage.contacted}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Qualified</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadsByStage.qualified}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tour Scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadsByStage.tour_scheduled}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Converted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{leadsByStage.converted}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Lost</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{leadsByStage.lost}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leads.slice(0, 10).map((lead: any) => (
                <div key={lead.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{lead.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{lead.source}</Badge>
                    <Badge>{lead.stage}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Marketing Enhancement Dashboard</h2>
          <p className="text-muted-foreground">Phase 5b Week 4: Complete Marketing Automation Suite</p>
        </div>
        <Button onClick={() => {
          refetchEmailCampaigns();
          refetchWorkflows();
          refetchTours();
          refetchSocialPosts();
          refetchLeads();
          refetchROI();
          toast({ title: 'Dashboard refreshed' });
        }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh All
        </Button>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="campaigns">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Target className="h-4 w-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="tours">
            <Video className="h-4 w-4 mr-2" />
            Tours
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="h-4 w-4 mr-2" />
            Social
          </TabsTrigger>
          <TabsTrigger value="leads">
            <Users className="h-4 w-4 mr-2" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="roi">
            <TrendingUp className="h-4 w-4 mr-2" />
            ROI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <EmailCampaignsTab />
        </TabsContent>

        <TabsContent value="workflows">
          <LeadWorkflowsTab />
        </TabsContent>

        <TabsContent value="tours">
          <VirtualToursTab />
        </TabsContent>

        <TabsContent value="social">
          <SocialMediaTab />
        </TabsContent>

        <TabsContent value="leads">
          <LeadsManagementTab />
        </TabsContent>

        <TabsContent value="roi">
          <ROITrackingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}