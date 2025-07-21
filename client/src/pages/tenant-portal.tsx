import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { 
  Home,
  CreditCard,
  Calendar,
  FileText,
  MessageSquare,
  Package,
  Truck,
  Users,
  Heart,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Download,
  Upload,
  ExternalLink,
  Info
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function TenantPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentType, setPaymentType] = useState<'deposit' | 'moveIn' | 'rent'>('rent');
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);

  // Fetch tenant's lease information
  const { data: leaseInfo } = useQuery({
    queryKey: ['/api/tenant/lease'],
    enabled: !!user,
  });

  // Fetch payment history
  const { data: paymentHistory } = useQuery({
    queryKey: ['/api/tenant/payments'],
    enabled: !!user,
  });

  // Fetch upcoming payments
  const { data: upcomingPayments } = useQuery({
    queryKey: ['/api/tenant/payments/upcoming'],
    enabled: !!user,
  });

  // Fetch move-in checklist
  const { data: moveInChecklist } = useQuery({
    queryKey: ['/api/tenant/move-in-checklist'],
    enabled: !!user,
  });

  const handlePayment = (type: 'deposit' | 'moveIn' | 'rent', amount: number) => {
    setPaymentType(type);
    setShowPaymentDialog(true);
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit': return 'Security Deposit';
      case 'moveIn': return 'Move-in Costs';
      case 'rent': return 'Monthly Rent';
      default: return type;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Access Your Tenant Portal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to access your lease information, make payments, and manage your residency.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Sign In</Link>
            </Button>
            <p className="text-sm text-center text-gray-500">
              New resident? Contact your community manager for portal access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Your Tenant Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your residency, payments, and communications in one place
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePayment('rent', leaseInfo?.monthlyRent || 0)}>
            <CardContent className="p-6">
              <CreditCard className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-semibold mb-1">Pay Rent</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Next due: {leaseInfo?.nextRentDue || 'Not set'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <MessageSquare className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-semibold mb-1">Contact Manager</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get help or report issues
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <FileText className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-semibold mb-1">Documents</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lease & important docs
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <Calendar className="w-8 h-8 text-orange-600 mb-2" />
              <h3 className="font-semibold mb-1">Schedule Tour</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For family & friends
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="lease">Lease</TabsTrigger>
            <TabsTrigger value="moveIn">Move-In</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Lease Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your Lease Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Community</p>
                    <p className="font-semibold">{leaseInfo?.communityName || 'Sunset Gardens'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Unit</p>
                    <p className="font-semibold">{leaseInfo?.unitNumber || '205A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lease Term</p>
                    <p className="font-semibold">
                      {leaseInfo?.leaseStart || '01/01/2025'} - {leaseInfo?.leaseEnd || '12/31/2025'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Rent</p>
                    <p className="font-semibold text-2xl">${leaseInfo?.monthlyRent || '3,500'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingPayments?.length > 0 ? upcomingPayments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">{getPaymentTypeLabel(payment.type)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Due: {format(new Date(payment.dueDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">${payment.amount.toLocaleString()}</p>
                        <Button 
                          size="sm" 
                          onClick={() => handlePayment(payment.type, payment.amount)}
                        >
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">All payments are up to date!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            {/* Payment Options */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Center</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100">Secure Payment Processing</p>
                      <p className="text-blue-700 dark:text-blue-300">
                        All payments are processed securely through our trusted payment partners. 
                        MySeniorValet never holds or touches your funds - they go directly to your community.
                        A small transaction fee of 2.9% + $0.30 applies to cover processing costs.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-2 hover:border-blue-500 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Home className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <h4 className="font-semibold mb-1">Security Deposit</h4>
                      <p className="text-2xl font-bold mb-2">${leaseInfo?.depositAmount || '7,000'}</p>
                      <Badge variant={leaseInfo?.depositPaid ? "default" : "secondary"}>
                        {leaseInfo?.depositPaid ? "Paid" : "Due"}
                      </Badge>
                      {!leaseInfo?.depositPaid && (
                        <Button 
                          className="w-full mt-4" 
                          onClick={() => handlePayment('deposit', leaseInfo?.depositAmount || 7000)}
                        >
                          Pay Deposit
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-green-500 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Package className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <h4 className="font-semibold mb-1">Move-In Costs</h4>
                      <p className="text-2xl font-bold mb-2">${leaseInfo?.moveInCosts || '1,500'}</p>
                      <Badge variant={leaseInfo?.moveInPaid ? "default" : "secondary"}>
                        {leaseInfo?.moveInPaid ? "Paid" : "Due"}
                      </Badge>
                      {!leaseInfo?.moveInPaid && (
                        <Button 
                          className="w-full mt-4" 
                          variant="outline"
                          onClick={() => handlePayment('moveIn', leaseInfo?.moveInCosts || 1500)}
                        >
                          Pay Move-In
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-purple-500 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <CreditCard className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <h4 className="font-semibold mb-1">Monthly Rent</h4>
                      <p className="text-2xl font-bold mb-2">${leaseInfo?.monthlyRent || '3,500'}</p>
                      <Badge>Due Monthly</Badge>
                      <Button 
                        className="w-full mt-4"
                        onClick={() => handlePayment('rent', leaseInfo?.monthlyRent || 3500)}
                      >
                        Pay Rent
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {paymentHistory?.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">{getPaymentTypeLabel(payment.type)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(payment.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${payment.amount.toLocaleString()}</p>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Receipt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moveIn" className="space-y-6">
            {/* Move-In Coordinator */}
            <Card>
              <CardHeader>
                <CardTitle>Move-In Coordination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Users className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-900 dark:text-green-100">Vendor Network</p>
                      <p className="text-green-700 dark:text-green-300">
                        We connect you with trusted moving companies, furniture suppliers, and setup services.
                        Each vendor is vetted and offers special rates for our residents.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Move-In Services */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Truck className="w-6 h-6 text-blue-600" />
                        <h4 className="font-semibold">Moving Services</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Professional movers specializing in senior relocations
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Browse Movers
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Package className="w-6 h-6 text-purple-600" />
                        <h4 className="font-semibold">Furniture & Setup</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Furniture rental and room setup services
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        View Options
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Move-In Checklist */}
                <div>
                  <h4 className="font-semibold mb-3">Your Move-In Checklist</h4>
                  <div className="space-y-2">
                    {moveInChecklist?.map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        {item.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={item.completed ? 'line-through text-gray-500' : ''}>
                          {item.task}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            {/* Connected Services */}
            <Card>
              <CardHeader>
                <CardTitle>Community Services Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Access exclusive services and vendors that serve your community
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="hover:shadow-md cursor-pointer">
                    <CardContent className="p-4">
                      <Heart className="w-8 h-8 text-red-600 mb-2" />
                      <h4 className="font-semibold mb-1">Healthcare Partners</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Local doctors, specialists, and pharmacies
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md cursor-pointer">
                    <CardContent className="p-4">
                      <Truck className="w-8 h-8 text-blue-600 mb-2" />
                      <h4 className="font-semibold mb-1">Transportation</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Medical transport and ride services
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md cursor-pointer">
                    <CardContent className="p-4">
                      <Users className="w-8 h-8 text-green-600 mb-2" />
                      <h4 className="font-semibold mb-1">Personal Services</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Housekeeping, laundry, and meal delivery
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            {/* Community Hub */}
            <Card>
              <CardHeader>
                <CardTitle>Community Connection Hub</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Connect with neighbors, join activities, and stay informed
                </p>
                
                <div className="space-y-4">
                  <Card className="bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Upcoming Events</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Friday Bingo Night</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Jan 24, 7:00 PM</p>
                          </div>
                          <Button size="sm">RSVP</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Family Portal</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Invite family members to stay connected with your care
                      </p>
                      <Button variant="outline" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        Invite Family
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Secure Payment Processing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm">
              <p className="font-medium mb-1">Payment Security</p>
              <p className="text-xs">
                Your payment will be processed securely through our payment partner.
                MySeniorValet does not store or handle your payment information.
              </p>
            </div>
            
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                You will be redirected to our secure payment partner
              </p>
              <p className="text-2xl font-bold">
                ${paymentType === 'deposit' ? '7,000' : paymentType === 'moveIn' ? '1,500' : '3,500'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                + Processing fee (2.9% + $0.30)
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1">
                <ExternalLink className="w-4 h-4 mr-2" />
                Continue to Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}