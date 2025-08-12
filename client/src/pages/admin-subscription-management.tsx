import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "wouter";
import { 
  CreditCard, TrendingUp, Users, DollarSign, AlertTriangle,
  CheckCircle, XCircle, Clock, Settings, Download, Upload,
  BarChart3, Zap, Crown, Shield, Star, Package, RefreshCw,
  Calculator, Receipt, UserCheck, UserX, Activity, Filter,
  Mail, Phone, Building, Calendar, ArrowUpRight, ArrowDownRight,
  Eye, Edit, Trash2, Copy, Search, ChevronDown, ChevronRight,
  AlertCircle, Info, Sparkles, Gauge, Target, PieChart
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  trialDays: number;
  status: 'active' | 'archived';
  subscribers: number;
  mrr: number;
}

interface CommunitySubscription {
  id: number;
  communityId: number;
  communityName: string;
  planId: string;
  planName: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
  startDate: string;
  totalPaid: number;
  paymentMethod: string;
  lastInvoiceStatus: string;
  contactEmail: string;
  contactPhone: string;
}

interface SubscriptionMetrics {
  totalMrr: number;
  totalArr: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  churnRate: number;
  growthRate: number;
  avgRevenuePerUser: number;
  lifetimeValue: number;
  mrrGrowth: number;
  netRevenue: number;
  refunds: number;
  disputes: number;
}

interface PaymentHistory {
  id: string;
  communityId: number;
  communityName: string;
  amount: number;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  date: string;
  paymentMethod: string;
  invoiceUrl?: string;
  receiptUrl?: string;
}

export default function AdminSubscriptionManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<number[]>([]);
  
  // Check super admin access
  const userRole = (user as any)?.role || '';
  const isSuperAdmin = userRole === 'super_admin';
  
  if (!user || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              This page is restricted to super administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/"}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch subscription metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<SubscriptionMetrics>({
    queryKey: ["/api/admin/subscriptions/metrics"],
  });

  // Fetch subscription plans
  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/admin/subscriptions/plans"],
  });

  // Fetch all community subscriptions
  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery<CommunitySubscription[]>({
    queryKey: ["/api/admin/subscriptions/all"],
  });

  // Fetch payment history
  const { data: paymentHistory } = useQuery<PaymentHistory[]>({
    queryKey: ["/api/admin/subscriptions/payment-history"],
  });

  // Update subscription plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async (data: { planId: string; updates: Partial<SubscriptionPlan> }) => {
      return apiRequest("PUT", `/api/admin/subscriptions/plans/${data.planId}`, data.updates);
    },
    onSuccess: () => {
      toast({ title: "Plan updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions/plans"] });
    },
    onError: () => {
      toast({ title: "Failed to update plan", variant: "destructive" });
    }
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: number) => {
      return apiRequest("POST", `/api/admin/subscriptions/${subscriptionId}/cancel`);
    },
    onSuccess: () => {
      toast({ title: "Subscription canceled" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions/all"] });
    }
  });

  // Apply discount mutation
  const applyDiscountMutation = useMutation({
    mutationFn: async (data: { subscriptionId: number; discountPercent: number }) => {
      return apiRequest("POST", `/api/admin/subscriptions/${data.subscriptionId}/discount`, { 
        percent: data.discountPercent 
      });
    },
    onSuccess: () => {
      toast({ title: "Discount applied successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions/all"] });
    }
  });

  // Filter subscriptions
  const filteredSubscriptions = subscriptions?.filter(sub => {
    const matchesSearch = sub.communityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sub.contactEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || sub.status === selectedStatus;
    const matchesPlan = !selectedPlan || sub.planId === selectedPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Calculate additional metrics
  const calculateChurnMetrics = () => {
    if (!subscriptions) return { monthlyChurn: 0, canceledThisMonth: 0, atRisk: 0 };
    
    const canceledThisMonth = subscriptions.filter(s => 
      s.status === 'canceled' && 
      new Date(s.currentPeriodEnd).getMonth() === new Date().getMonth()
    ).length;
    
    const atRisk = subscriptions.filter(s => 
      s.cancelAtPeriodEnd || s.status === 'past_due'
    ).length;
    
    const monthlyChurn = subscriptions.length > 0 
      ? (canceledThisMonth / subscriptions.length) * 100 
      : 0;
    
    return { monthlyChurn, canceledThisMonth, atRisk };
  };

  const churnMetrics = calculateChurnMetrics();

  // Bulk action handlers
  const handleBulkUpgrade = async () => {
    // Implementation for bulk upgrade
    toast({ title: `Upgrading ${selectedSubscriptions.length} subscriptions...` });
  };

  const handleBulkCancel = async () => {
    // Implementation for bulk cancel
    toast({ title: `Canceling ${selectedSubscriptions.length} subscriptions...` });
  };

  const handleExportData = () => {
    // Implementation for data export
    toast({ title: "Exporting subscription data..." });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader 
        title="Admin Subscription Management" 
        subtitle="Complete control over platform subscriptions and revenue"
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Recurring</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${metrics?.totalMrr?.toLocaleString() || '0'}
                  </p>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+{metrics?.mrrGrowth || 0}%</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics?.activeSubscriptions || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {metrics?.trialSubscriptions || 0} in trial
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {churnMetrics.monthlyChurn.toFixed(1)}%
                  </p>
                  <p className="text-sm text-orange-600 mt-1">
                    {churnMetrics.atRisk} at risk
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Revenue/User</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${metrics?.avgRevenuePerUser?.toFixed(2) || '0'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    LTV: ${metrics?.lifetimeValue?.toFixed(0) || '0'}
                  </p>
                </div>
                <Calculator className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    +{metrics?.growthRate?.toFixed(1) || '0'}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Month over month
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-4xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly recurring revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <BarChart3 className="w-12 h-12" />
                    <span className="ml-2">Revenue chart visualization</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Subscriptions
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleExportData}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Bulk Email
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Receipt className="w-4 h-4 mr-2" />
                    Generate Reports
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Webhook Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Plan Distribution */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Plan Distribution</CardTitle>
                  <CardDescription>Subscription breakdown by plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plans?.map(plan => {
                      const percentage = subscriptions 
                        ? (subscriptions.filter(s => s.planId === plan.id).length / subscriptions.length) * 100
                        : 0;
                      return (
                        <div key={plan.id}>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{plan.name}</span>
                            <span className="text-sm text-gray-600">
                              {plan.subscribers} subscribers (${plan.mrr?.toLocaleString()} MRR)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* At-Risk Subscriptions */}
              <Card>
                <CardHeader>
                  <CardTitle>At-Risk Subscriptions</CardTitle>
                  <CardDescription>Requires immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subscriptions?.filter(s => s.status === 'past_due' || s.cancelAtPeriodEnd)
                      .slice(0, 5)
                      .map(sub => (
                        <div key={sub.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{sub.communityName}</p>
                            <p className="text-xs text-gray-500">{sub.status}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Phone className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>All Subscriptions</CardTitle>
                    <CardDescription>Manage and monitor all community subscriptions</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={showBulkActions ? "default" : "outline"}
                      onClick={() => setShowBulkActions(!showBulkActions)}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Bulk Actions
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by community or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trialing">Trialing</SelectItem>
                      <SelectItem value="past_due">Past Due</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Plans</SelectItem>
                      {plans?.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bulk Actions Bar */}
                {showBulkActions && selectedSubscriptions.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {selectedSubscriptions.length} subscriptions selected
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleBulkUpgrade}>
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                          Bulk Upgrade
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4 mr-1" />
                          Send Email
                        </Button>
                        <Button size="sm" variant="destructive" onClick={handleBulkCancel}>
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subscriptions Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {showBulkActions && (
                          <TableHead className="w-12">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSubscriptions(filteredSubscriptions?.map(s => s.id) || []);
                                } else {
                                  setSelectedSubscriptions([]);
                                }
                              }}
                            />
                          </TableHead>
                        )}
                        <TableHead>Community</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Next Billing</TableHead>
                        <TableHead>Total Paid</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscriptions?.map((subscription) => (
                        <TableRow key={subscription.id}>
                          {showBulkActions && (
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedSubscriptions.includes(subscription.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSubscriptions([...selectedSubscriptions, subscription.id]);
                                  } else {
                                    setSelectedSubscriptions(selectedSubscriptions.filter(id => id !== subscription.id));
                                  }
                                }}
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <div>
                              <p className="font-medium">{subscription.communityName}</p>
                              <p className="text-sm text-gray-500">{subscription.contactEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{subscription.planName}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={subscription.status === 'active' ? 'default' : 
                                      subscription.status === 'past_due' ? 'destructive' : 
                                      'secondary'}
                            >
                              {subscription.status}
                            </Badge>
                            {subscription.cancelAtPeriodEnd && (
                              <Badge variant="outline" className="ml-2">
                                <XCircle className="w-3 h-3 mr-1" />
                                Canceling
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>${subscription.amount / 100}/mo</TableCell>
                          <TableCell>{format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>${subscription.totalPaid / 100}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => cancelSubscriptionMutation.mutate(subscription.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {plans?.map(plan => (
                <Card key={plan.id} className={plan.status === 'archived' ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>
                          ${plan.price / 100}/{plan.interval}
                        </CardDescription>
                      </div>
                      <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                        {plan.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Features:</p>
                        <ul className="text-sm space-y-1">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Subscribers</p>
                          <p className="font-bold">{plan.subscribers}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">MRR</p>
                          <p className="font-bold">${plan.mrr.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Trial Days</p>
                          <p className="font-bold">{plan.trialDays}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="w-3 h-3 mr-1" />
                          Clone
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add New Plan Card */}
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <Zap className="w-12 h-12 text-gray-400 mb-4" />
                  <Button variant="outline">
                    Add New Plan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Complete transaction history and payment management</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Community</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory?.slice(0, 10).map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{format(new Date(payment.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{payment.communityName}</TableCell>
                        <TableCell>${payment.amount / 100}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={payment.status === 'succeeded' ? 'default' : 
                                    payment.status === 'failed' ? 'destructive' : 
                                    'secondary'}
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {payment.invoiceUrl && (
                              <Button size="sm" variant="ghost">
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                            {payment.status === 'succeeded' && (
                              <Button size="sm" variant="ghost">
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Churn Analysis</CardTitle>
                  <CardDescription>Understanding subscription cancellations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Monthly Churn Rate</span>
                      <span className="font-bold">{churnMetrics.monthlyChurn.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Canceled This Month</span>
                      <span className="font-bold">{churnMetrics.canceledThisMonth}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>At Risk</span>
                      <span className="font-bold text-orange-600">{churnMetrics.atRisk}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cohort Analysis</CardTitle>
                  <CardDescription>Retention by signup month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-gray-400">
                    <PieChart className="w-12 h-12" />
                    <span className="ml-2">Cohort visualization</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Forecasting</CardTitle>
                  <CardDescription>Projected MRR for next 3 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Next Month</span>
                        <span className="font-bold">${((metrics?.totalMrr || 0) * 1.05).toFixed(0)}</span>
                      </div>
                      <Progress value={70} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>2 Months</span>
                        <span className="font-bold">${((metrics?.totalMrr || 0) * 1.10).toFixed(0)}</span>
                      </div>
                      <Progress value={85} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>3 Months</span>
                        <span className="font-bold">${((metrics?.totalMrr || 0) * 1.15).toFixed(0)}</span>
                      </div>
                      <Progress value={95} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversion Funnel</CardTitle>
                  <CardDescription>From trial to paid conversion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Trial Started</span>
                      <span className="font-bold">100%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Trial Completed</span>
                      <span className="font-bold">68%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Converted to Paid</span>
                      <span className="font-bold text-green-600">42%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Still Active (90 days)</span>
                      <span className="font-bold text-blue-600">38%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stripe Configuration</CardTitle>
                  <CardDescription>Payment gateway settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Webhook Endpoint</Label>
                    <Input value="https://myseniorvalet.com/api/webhooks/stripe" readOnly />
                  </div>
                  <div>
                    <Label>Test Mode</Label>
                    <Switch />
                  </div>
                  <Button>Update Webhook</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Automated email settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Welcome Email</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Payment Failed</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Subscription Canceled</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Trial Ending</Label>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax Settings</CardTitle>
                  <CardDescription>Configure tax collection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Automatic Tax Collection</Label>
                    <Switch />
                  </div>
                  <div>
                    <Label>Default Tax Rate</Label>
                    <Input type="number" placeholder="8.5" />
                  </div>
                  <Button>Save Tax Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dunning Management</CardTitle>
                  <CardDescription>Failed payment recovery</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Retry Attempts</Label>
                    <Select defaultValue="3">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                        <SelectItem value="7">7 attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Days Between Retries</Label>
                    <Input type="number" defaultValue="3" />
                  </div>
                  <Button>Update Dunning Rules</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}