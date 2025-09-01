// Phase 5b: Billing & Financial Management Dashboard
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  DollarSign,
  FileText,
  TrendingUp,
  Calendar,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  BarChart3,
  PieChart,
  Receipt,
  Users,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface BillingDashboardProps {
  communityId: number;
}

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

export function BillingDashboard({ communityId }: BillingDashboardProps) {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Fetch invoices
  const { data: invoicesData, isLoading: loadingInvoices } = useQuery({
    queryKey: ['/api/billing/invoices', communityId, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      return apiRequest('GET', `/api/billing/invoices/${communityId}?${params}`);
    }
  });

  // Fetch billing schedules
  const { data: schedulesData } = useQuery({
    queryKey: ['/api/billing/billing-schedules', communityId],
    queryFn: () => apiRequest('GET', `/api/billing/billing-schedules/${communityId}`)
  });

  // Fetch accounts receivable
  const { data: arData } = useQuery({
    queryKey: ['/api/billing/accounts-receivable', communityId],
    queryFn: () => apiRequest('GET', `/api/billing/accounts-receivable/${communityId}`)
  });

  // Fetch revenue summary
  const { data: revenueData } = useQuery({
    queryKey: ['/api/billing/revenue-summary', communityId],
    queryFn: () => apiRequest('GET', `/api/billing/revenue-summary/${communityId}`)
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: (invoiceData: any) => 
      apiRequest('POST', '/api/billing/invoices', invoiceData),
    onSuccess: () => {
      toast({
        title: "Invoice Created",
        description: "New invoice has been created successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/invoices'] });
    }
  });

  // Update invoice status mutation
  const updateInvoiceStatus = useMutation({
    mutationFn: ({ invoiceId, status }: { invoiceId: number; status: string }) =>
      apiRequest('PATCH', `/api/billing/invoices/${invoiceId}/status`, { status }),
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Invoice status has been updated."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/invoices'] });
    }
  });

  // Process payment mutation
  const processPayment = useMutation({
    mutationFn: ({ invoiceId, amount }: { invoiceId: number; amount: number }) =>
      apiRequest('POST', `/api/billing/invoices/${invoiceId}/pay`, { 
        amount,
        paymentMethodId: 'pm_card_visa' // Mock payment method
      }),
    onSuccess: () => {
      toast({
        title: "Payment Processed",
        description: "Payment has been processed successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/accounts-receivable'] });
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      paid: { variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
      sent: { variant: 'secondary', icon: <Send className="w-3 h-3" /> },
      overdue: { variant: 'destructive', icon: <AlertCircle className="w-3 h-3" /> },
      draft: { variant: 'outline', icon: <Clock className="w-3 h-3" /> },
      partial: { variant: 'secondary', icon: <DollarSign className="w-3 h-3" /> }
    };
    
    const config = variants[status] || variants.draft;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <h3 className="text-2xl font-bold">
                  ${revenueData?.currentMonth?.projected?.toLocaleString() || '0'}
                </h3>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +12% from last month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <h3 className="text-2xl font-bold">
                  ${arData?.totalOutstanding?.toLocaleString() || '0'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {arData?.accounts?.length || 0} accounts
                </p>
              </div>
              <Receipt className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <h3 className="text-2xl font-bold">
                  {revenueData?.collectionRate || 0}%
                </h3>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="w-3 h-3" />
                  Above target
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Schedules</p>
                <h3 className="text-2xl font-bold">
                  {schedulesData?.schedules?.filter((s: any) => s.status === 'active').length || 0}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Auto-billing enabled
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="schedules">Billing Schedules</TabsTrigger>
          <TabsTrigger value="receivables">Accounts Receivable</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>Manage and track all invoices</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => createInvoiceMutation.mutate({ communityId })}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Invoice
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoicesData?.invoices?.map((invoice: any) => (
                  <div key={invoice.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{invoice.invoiceNumber}</h4>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {invoice.billingName} • {invoice.billingEmail}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xl font-bold">
                          ${parseFloat(invoice.totalAmount).toLocaleString()}
                        </p>
                        {invoice.balanceDue > 0 && (
                          <p className="text-sm text-orange-600">
                            Balance: ${parseFloat(invoice.balanceDue).toLocaleString()}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                          {invoice.status === 'draft' && (
                            <Button 
                              size="sm"
                              onClick={() => updateInvoiceStatus.mutate({ 
                                invoiceId: invoice.id, 
                                status: 'sent' 
                              })}
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Send
                            </Button>
                          )}
                          {invoice.status === 'sent' && (
                            <Button 
                              size="sm"
                              variant="default"
                              onClick={() => processPayment.mutate({ 
                                invoiceId: invoice.id, 
                                amount: parseFloat(invoice.balanceDue) 
                              })}
                            >
                              <CreditCard className="w-3 h-3 mr-1" />
                              Record Payment
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!invoicesData?.invoices || invoicesData.invoices.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No invoices found. Create your first invoice to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Billing Schedules</CardTitle>
                  <CardDescription>Automated recurring billing configurations</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedulesData?.schedules?.map((schedule: any) => (
                  <div key={schedule.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{schedule.name}</h4>
                          <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'}>
                            {schedule.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Frequency: {schedule.frequency} • Day {schedule.billingDay}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Next billing: {new Date(schedule.nextBillingDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xl font-bold">
                          ${parseFloat(schedule.baseAmount).toLocaleString()}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {schedule.autoSend && (
                            <Badge variant="outline">
                              <Send className="w-3 h-3 mr-1" />
                              Auto-send
                            </Badge>
                          )}
                          {schedule.autoCharge && (
                            <Badge variant="outline">
                              <CreditCard className="w-3 h-3 mr-1" />
                              Auto-charge
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounts Receivable Tab */}
        <TabsContent value="receivables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable Aging</CardTitle>
              <CardDescription>Outstanding balances by aging period</CardDescription>
            </CardHeader>
            <CardContent>
              {arData?.agingReport && (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={arData.agingReport.labels.map((label: string, i: number) => ({
                      name: label,
                      amount: arData.agingReport.values[i]
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Bar dataKey="amount" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              <div className="mt-6 space-y-3">
                <h4 className="font-semibold">Account Details</h4>
                {arData?.accounts?.map((account: any) => (
                  <div key={account.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{account.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          Account: {account.accountNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          ${account.currentBalance.toLocaleString()}
                        </p>
                        <Badge variant={account.status === 'current' ? 'default' : 'destructive'}>
                          {account.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Profit & Loss</h4>
                    <p className="text-sm text-muted-foreground">Income statement</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Balance Sheet</h4>
                    <p className="text-sm text-muted-foreground">Assets & liabilities</p>
                  </div>
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Cash Flow</h4>
                    <p className="text-sm text-muted-foreground">Cash movements</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueData?.monthlyTrend && (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueData?.revenueByType && (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={Object.entries(revenueData.revenueByType).map(([key, value]) => ({
                            name: key.replace(/([A-Z])/g, ' $1').trim(),
                            value
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.keys(revenueData.revenueByType).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Collection Rate</span>
                  <span className="font-bold">{revenueData?.collectionRate || 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Days to Payment</span>
                  <span className="font-bold">{revenueData?.averageDaysToPayment || 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">YTD Revenue</span>
                  <span className="font-bold">
                    ${revenueData?.yearToDate?.collected?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">YTD Outstanding</span>
                  <span className="font-bold text-orange-600">
                    ${revenueData?.yearToDate?.outstanding?.toLocaleString() || '0'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}