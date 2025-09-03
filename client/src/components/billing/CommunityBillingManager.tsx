import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  DollarSign, 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Receipt,
  Users,
  Building,
  Send,
  Plus,
  Filter,
  Search,
  BarChart3,
  PieChart,
  RefreshCw,
  Settings,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Printer,
  Archive
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface CommunityBillingManagerProps {
  communityId: number;
  tier: string;
}

export default function CommunityBillingManager({ communityId, tier }: CommunityBillingManagerProps) {
  const [selectedResident, setSelectedResident] = useState<string>('');
  const [billingPeriod, setBillingPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  // Fetch comprehensive billing data
  const { data: billingData, isLoading } = useQuery({
    queryKey: [`/api/billing/community/${communityId}`, billingPeriod],
    queryFn: async () => {
      // This would connect to the real API
      return {
        summary: {
          totalRevenue: 425000,
          totalCollected: 395000,
          totalOutstanding: 30000,
          collectionRate: 92.9,
          avgDaysToPayment: 8,
          totalResidents: 85,
          occupancyRate: 94.4
        },
        residents: [
          {
            id: 'R001',
            name: 'John Smith',
            room: '204A',
            monthlyRate: 4200,
            balance: 0,
            status: 'current',
            autopay: true,
            lastPayment: '2025-08-15',
            nextDue: '2025-09-01'
          },
          {
            id: 'R002',
            name: 'Mary Johnson',
            room: '107',
            monthlyRate: 5500,
            balance: 5500,
            status: 'pending',
            autopay: false,
            lastPayment: '2025-07-15',
            nextDue: '2025-09-01'
          },
          {
            id: 'R003',
            name: 'Robert Brown',
            room: '312',
            monthlyRate: 3800,
            balance: 7600,
            status: 'overdue',
            autopay: false,
            lastPayment: '2025-06-10',
            nextDue: '2025-07-01'
          }
        ],
        invoices: [
          {
            id: 'INV-2025-001',
            residentId: 'R001',
            residentName: 'John Smith',
            amount: 4200,
            status: 'paid',
            issueDate: '2025-08-01',
            dueDate: '2025-08-15',
            paidDate: '2025-08-10'
          },
          {
            id: 'INV-2025-002',
            residentId: 'R002',
            residentName: 'Mary Johnson',
            amount: 5500,
            status: 'sent',
            issueDate: '2025-08-01',
            dueDate: '2025-09-01',
            paidDate: null
          }
        ],
        revenueChart: [
          { month: 'Jan', revenue: 395000, collected: 380000 },
          { month: 'Feb', revenue: 402000, collected: 395000 },
          { month: 'Mar', revenue: 408000, collected: 400000 },
          { month: 'Apr', revenue: 415000, collected: 405000 },
          { month: 'May', revenue: 420000, collected: 410000 },
          { month: 'Jun', revenue: 425000, collected: 395000 }
        ],
        paymentMethods: [
          { method: 'Auto-pay', count: 65, percentage: 76 },
          { method: 'Credit Card', count: 12, percentage: 14 },
          { method: 'Check', count: 8, percentage: 10 }
        ],
        agingReport: [
          { category: 'Current', amount: 395000, percentage: 87 },
          { category: '1-30 Days', amount: 20000, percentage: 4 },
          { category: '31-60 Days', amount: 7000, percentage: 2 },
          { category: '60+ Days', amount: 3000, percentage: 1 }
        ]
      };
    }
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/billing/invoices', data);
    },
    onSuccess: () => {
      toast({
        title: "Invoice Created",
        description: "The invoice has been created and sent to the resident",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/billing/community/${communityId}`] });
    }
  });

  // Send reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: async (residentId: string) => {
      return apiRequest('POST', `/api/billing/send-reminder/${residentId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Reminder Sent",
        description: "Payment reminder has been sent to the resident",
      });
    }
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter residents based on status
  const filteredResidents = billingData?.residents.filter(resident => {
    if (filterStatus === 'all') return true;
    return resident.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header with Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${billingData?.summary.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {billingData?.summary.totalResidents} residents
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Collected</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${billingData?.summary.totalCollected.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {billingData?.summary.collectionRate}% collection rate
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ${billingData?.summary.totalOutstanding.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {billingData?.summary.avgDaysToPayment} avg days to pay
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Occupancy</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {billingData?.summary.occupancyRate}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {billingData?.summary.totalResidents} of 90 beds
                </p>
              </div>
              <Building className="h-8 w-8 text-purple-600 dark:text-purple-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Management Tabs */}
      <Tabs defaultValue="residents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="residents">Residents</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Residents Tab */}
        <TabsContent value="residents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Resident Billing Status</CardTitle>
                  <CardDescription>Manage billing for all residents</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="current">Current</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Invoice
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredResidents?.map((resident) => (
                  <div key={resident.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-semibold">{resident.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Room {resident.room} • ${resident.monthlyRate}/month
                            </p>
                          </div>
                          {resident.autopay && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              Auto-pay
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Balance: <span className={`font-semibold ${resident.balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                              ${resident.balance.toLocaleString()}
                            </span>
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            Last Payment: {new Date(resident.lastPayment).toLocaleDateString()}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            Next Due: {new Date(resident.nextDue).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            resident.status === 'current' ? 'default' : 
                            resident.status === 'pending' ? 'secondary' : 
                            'destructive'
                          }
                        >
                          {resident.status}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => sendReminderMutation.mutate(resident.id)}
                          disabled={resident.status === 'current'}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Remind
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Invoice Management</CardTitle>
                  <CardDescription>Create and manage all invoices</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Send className="mr-2 h-4 w-4" />
                    Send All
                  </Button>
                  <Button variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Batch
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {billingData?.invoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{invoice.id}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {invoice.residentName} • ${invoice.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Issued: {new Date(invoice.issueDate).toLocaleDateString()} • 
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.status}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={billingData?.revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Billed" />
                    <Line type="monotone" dataKey="collected" stroke="#10B981" name="Collected" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RePieChart>
                    <Pie
                      data={billingData?.paymentMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.method}: ${entry.percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {billingData?.paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Aging Report */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Accounts Receivable Aging</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={billingData?.agingReport}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="amount" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>Configure billing preferences and automation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Invoice Generation Day</Label>
                    <Select defaultValue="1">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st of Month</SelectItem>
                        <SelectItem value="15">15th of Month</SelectItem>
                        <SelectItem value="last">Last Day of Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Payment Due Days</Label>
                    <Input type="number" defaultValue="15" />
                    <p className="text-xs text-gray-500 mt-1">Days after invoice generation</p>
                  </div>

                  <div>
                    <Label>Late Fee Percentage</Label>
                    <Input type="number" defaultValue="5" />
                    <p className="text-xs text-gray-500 mt-1">Applied after grace period</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Auto-generate Invoices</Label>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automatically create invoices on the specified day
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Send Reminders</Label>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Send automatic payment reminders
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Family Portal Access</Label>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Families can view and pay bills online
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate and download financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Monthly Revenue Report</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Detailed revenue breakdown for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Accounts Receivable</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Outstanding balances and aging report
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Payment History</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        All payments received this month
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Year-End Summary</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Annual financial summary and tax reports
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Family Access Notice */}
      <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <span className="font-semibold">Family Transparency Enabled:</span> All billing information is automatically accessible to authorized family members through their Family Portal. They can view statements, make payments, and track financial history in real-time.
        </AlertDescription>
      </Alert>
    </div>
  );
}