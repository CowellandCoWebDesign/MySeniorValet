import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Smartphone, 
  Users, 
  Video, 
  DollarSign, 
  Calendar,
  MessageSquare,
  Heart,
  Activity,
  Bell,
  Settings,
  Camera,
  Phone,
  AlertCircle,
  Clock,
  User,
  Mail,
  ChevronRight,
  PieChart,
  TrendingUp,
  TrendingDown,
  FileText,
  Download
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ResidentMobileApp } from './ResidentMobileApp';
import { FamilyCommunicationPortal } from './FamilyCommunicationPortal';
import { VideoCallingInterface } from './VideoCallingInterface';
import { BudgetPlanningDashboard } from './BudgetPlanningDashboard';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ResidentFamilyDashboardProps {
  communityId: number;
}

export function ResidentFamilyDashboard({ communityId }: ResidentFamilyDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Fetch resident profiles
  const { data: residents = [], isLoading: loadingResidents } = useQuery({
    queryKey: [`/api/resident-family/communities/${communityId}/residents`],
    enabled: !!communityId
  });

  // Fetch family messages count
  const { data: messageStats } = useQuery({
    queryKey: [`/api/resident-family/messages/stats`, communityId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/resident-family/messages?communityId=${communityId}`);
      const messages = await response.json();
      const unread = messages.filter((m: any) => m.status === 'sent').length;
      return { total: messages.length, unread };
    },
    enabled: !!communityId
  });

  // Fetch video calls
  const { data: videoCalls = [] } = useQuery({
    queryKey: [`/api/resident-family/communities/${communityId}/video-calls`],
    enabled: !!communityId
  });

  // Fetch budget plans
  const { data: budgetPlans = [] } = useQuery({
    queryKey: [`/api/resident-family/communities/${communityId}/budgets`],
    enabled: !!communityId
  });

  const activeResidents = residents.filter((r: any) => r.status === 'active').length;
  const upcomingCalls = videoCalls.filter((c: any) => c.status === 'scheduled').length;
  const activeBudget = budgetPlans.find((b: any) => b.status === 'active');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resident & Family Portal</h2>
          <p className="text-muted-foreground">
            Comprehensive management for resident care and family communication
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Add Resident
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">
            <Activity className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="mobile-app">
            <Smartphone className="mr-2 h-4 w-4" />
            Mobile App
          </TabsTrigger>
          <TabsTrigger value="family-portal">
            <MessageSquare className="mr-2 h-4 w-4" />
            Family Portal
          </TabsTrigger>
          <TabsTrigger value="video-calling">
            <Video className="mr-2 h-4 w-4" />
            Video Calls
          </TabsTrigger>
          <TabsTrigger value="budget-planning">
            <DollarSign className="mr-2 h-4 w-4" />
            Budget Planning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Residents</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeResidents}</div>
                <p className="text-xs text-muted-foreground">
                  {residents.length} total profiles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{messageStats?.unread || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {messageStats?.total || 0} total messages
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Scheduled Calls</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingCalls}</div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeBudget ? 'Active' : 'No Budget'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeBudget ? `FY ${activeBudget.fiscalYear}` : 'Create budget plan'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>Latest family communications</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start space-x-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">Family Update</p>
                          <p className="text-sm text-muted-foreground">
                            New message from John's family about upcoming visit
                          </p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                        <Badge variant="secondary">Unread</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Video Calls</CardTitle>
                <CardDescription>Scheduled family visits</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start space-x-4">
                        <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-2">
                          <Video className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">Smith Family Call</p>
                          <p className="text-sm text-muted-foreground">
                            Weekly check-in with resident Mary Smith
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Tomorrow at 2:00 PM
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Join
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Smartphone className="h-5 w-5 mb-2" />
                  <span className="text-xs">Setup Mobile</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <MessageSquare className="h-5 w-5 mb-2" />
                  <span className="text-xs">Send Message</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Video className="h-5 w-5 mb-2" />
                  <span className="text-xs">Schedule Call</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-5 w-5 mb-2" />
                  <span className="text-xs">Create Budget</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile-app">
          <ResidentMobileApp 
            communityId={communityId} 
            residents={residents}
          />
        </TabsContent>

        <TabsContent value="family-portal">
          <FamilyCommunicationPortal 
            communityId={communityId}
          />
        </TabsContent>

        <TabsContent value="video-calling">
          <VideoCallingInterface 
            communityId={communityId}
          />
        </TabsContent>

        <TabsContent value="budget-planning">
          <BudgetPlanningDashboard 
            communityId={communityId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}