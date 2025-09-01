// Consolidated Phase 5 Enterprise Tab Components for Admin Mega Dashboard
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building2, Users, Shield, Heart, Brain, Activity, Clock,
  CheckCircle2, AlertCircle, TrendingUp, Calendar, Wrench,
  Utensils, Car, Target, MessageSquare, Phone, Mail
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Import the detailed Financial Analytics component
export { FinancialAnalyticsTab } from './FinancialAnalyticsTab';

// Compliance Management Tab
export function ComplianceTab() {
  const { data: complianceData, isLoading } = useQuery({
    queryKey: ['/api/operations/compliance']
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!complianceData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>Compliance data is currently unavailable.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceData.overallScore}%</div>
            <Progress value={complianceData.overallScore} className="mt-2 h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceData.certifications}</div>
            <p className="text-xs text-muted-foreground">All up to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Audit Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceData.audits.completed}</div>
            <p className="text-xs text-orange-600">{complianceData.audits.upcoming} upcoming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{complianceData.violations}</div>
            <p className="text-xs text-muted-foreground">Clean record</p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Compliance Status</AlertTitle>
        <AlertDescription>
          All {complianceData.stateRegulations} state regulations are being met. Next audit scheduled for September 15, 2025.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Marketing Automation Tab
export function MarketingTab() {
  const { data: marketingData, isLoading } = useQuery({
    queryKey: ['/api/operations/marketing']
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!marketingData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>Marketing data is currently unavailable.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingData.campaigns.active}</div>
            <p className="text-xs text-muted-foreground">{marketingData.campaigns.scheduled} scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingData.leads.total.toLocaleString()}</div>
            <p className="text-xs text-green-600">{marketingData.leads.qualified} qualified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Email Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((marketingData.emailStats.opened / marketingData.emailStats.sent) * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Open rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingData.conversionRate}%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +3.2% this month
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Active marketing campaigns and their metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['Summer Special', 'Memory Care Focus', 'Virtual Tour Promo', 'Referral Program', 'Holiday Campaign'].map((campaign, idx) => (
              <div key={campaign} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{campaign}</p>
                  <p className="text-sm text-muted-foreground">
                    {[1842, 923, 567, 445, 234][idx]} leads • {[26, 31, 22, 45, 18][idx]}% conversion
                  </p>
                </div>
                <Badge variant={idx === 0 ? 'default' : 'secondary'}>
                  {idx === 0 ? 'Active' : 'Scheduled'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Resident Portal Tab
export function ResidentPortalTab() {
  const { data: residentData, isLoading } = useQuery({
    queryKey: ['/api/operations/residents']
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!residentData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>Resident data is currently unavailable.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Residents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{residentData.totalResidents}</div>
            <p className="text-xs text-muted-foreground">94% occupancy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Family Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{residentData.familyAccounts}</div>
            <p className="text-xs text-green-600">{residentData.activePortalUsers} active this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{residentData.messagesThisWeek}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portal Activity</CardTitle>
          <CardDescription>Recent family portal interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {[
                { family: 'Thompson Family', action: 'Viewed care plan', time: '2 hours ago', icon: Brain },
                { family: 'Johnson Family', action: 'Scheduled video call', time: '3 hours ago', icon: Phone },
                { family: 'Martinez Family', action: 'Updated emergency contacts', time: '5 hours ago', icon: Shield },
                { family: 'Davis Family', action: 'Sent message to nurse', time: '6 hours ago', icon: Mail },
                { family: 'Wilson Family', action: 'Viewed health records', time: '8 hours ago', icon: Activity },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                  <activity.icon className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.family}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Operations Management Tab
export function OperationsTab() {
  const { data: operationsData, isLoading } = useQuery({
    queryKey: ['/api/operations/dashboard']
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!operationsData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>Operations data is currently unavailable.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Staff Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operationsData.staff.onDuty}/{operationsData.staff.scheduled}
            </div>
            <p className="text-xs text-yellow-600">{operationsData.staff.callOffs} call-offs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operationsData.maintenance.pending}</div>
            <p className="text-xs text-orange-600">{operationsData.maintenance.inProgress} in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Meals Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operationsData.meals.served}</div>
            <p className="text-xs text-muted-foreground">{operationsData.meals.special} special diets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Transport</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operationsData.transport.scheduled}</div>
            <p className="text-xs text-green-600">{operationsData.transport.completed} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{operationsData.inventory.optimal}</div>
            <p className="text-xs text-orange-600">{operationsData.inventory.lowStock} low stock</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Maintenance Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { title: 'AC Unit - Room 203', priority: 'high', status: 'in-progress' },
                { title: 'Leaking Faucet - 115', priority: 'medium', status: 'pending' },
                { title: 'Light Bulbs - Hallway', priority: 'low', status: 'pending' },
              ].map((request, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-sm font-medium">{request.title}</p>
                    <Badge variant={request.priority === 'high' ? 'destructive' : 'secondary'} className="mt-1">
                      {request.priority}
                    </Badge>
                  </div>
                  <Badge variant={request.status === 'in-progress' ? 'default' : 'outline'}>
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { time: '10:00 AM', event: 'Medical Transport - St. Mary\'s', icon: Car },
                { time: '11:00 AM', event: 'Activities - Music Therapy', icon: Activity },
                { time: '12:00 PM', event: 'Lunch Service', icon: Utensils },
                { time: '2:00 PM', event: 'Staff Meeting', icon: Users },
                { time: '3:00 PM', event: 'Shift Change', icon: Clock },
              ].map((schedule, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                  <schedule.icon className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{schedule.event}</p>
                    <p className="text-xs text-muted-foreground">{schedule.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}