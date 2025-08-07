import { useState } from "react";
import { useStripe, useElements, PaymentElement, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  DollarSign,
  Building,
  Users,
  ArrowRight,
  Lock,
  Zap,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Initialize Stripe
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

interface PaymentFormProps {
  communityId: number;
  communityName: string;
  paymentType: 'tour' | 'application' | 'deposit' | 'document';
  amount: number;
  description: string;
  onSuccess?: () => void;
}

function PaymentForm({ communityId, communityName, paymentType, amount, description, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Create payment intent when component mounts
  useState(() => {
    apiRequest("POST", "/api/payments/create-intent", {
      communityId,
      paymentType,
      amount: 195, // $1.95 in cents
      metadata: {
        communityName,
        description,
        originalAmount: amount
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        }
      })
      .catch(error => {
        toast({
          title: "Payment Setup Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
      });
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast({
        title: "Payment Successful",
        description: "Your transaction has been processed successfully.",
      });
      
      // Record successful transaction
      await apiRequest("POST", "/api/payments/record-transaction", {
        paymentIntentId: paymentIntent.id,
        communityId,
        paymentType,
        amount: 195,
        status: 'completed'
      });

      if (onSuccess) {
        onSuccess();
      }
      
      setIsProcessing(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Transaction Details</h4>
        <div className="space-y-1 text-sm">
          <p>Community: <span className="font-medium">{communityName}</span></p>
          <p>Service: <span className="font-medium">{description}</span></p>
          <p>Processing Fee: <span className="font-bold text-primary">$1.95</span></p>
        </div>
      </div>

      <PaymentElement 
        options={{
          layout: "tabs",
          paymentMethodOrder: ['card']
        }}
      />

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Pay $1.95 Processing Fee
          </>
        )}
      </Button>

      <div className="flex items-start space-x-2 text-xs text-gray-600 dark:text-gray-400">
        <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          Your payment is secure and encrypted. MySeniorValet charges a flat $1.95 processing fee to connect you with {communityName}.
        </p>
      </div>
    </form>
  );
}

export default function PaymentProcessing() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Payment Processing Center
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Secure transaction processing with flat $1.95 fee per connection
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="process">Process Payment</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span>How Our Payment System Works</span>
              </CardTitle>
              <CardDescription>
                Simple, transparent pricing for connecting families with communities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <Zap className="h-8 w-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Flat Fee Model
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    $1.95 per transaction - no hidden costs or percentage fees
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <Shield className="h-8 w-8 text-green-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Secure Processing
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Bank-level encryption powered by Stripe
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <Users className="h-8 w-8 text-purple-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Direct Connection
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Instantly connect with community representatives
                  </p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> MySeniorValet only charges a processing fee to facilitate connections. 
                  We never handle deposits, rent, or care costs - those are paid directly to the community.
                </AlertDescription>
              </Alert>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  What You Can Pay For:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Schedule Tours</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Book in-person visits with instant confirmation
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Submit Applications</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Fast-track your application process
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Request Documents</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get contracts and agreements quickly
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Priority Support</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Direct line to community staff
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Process a Payment</CardTitle>
              <CardDescription>
                Complete your transaction with our secure payment system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stripePromise ? (
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    communityId={1}
                    communityName="Sunrise Senior Living"
                    paymentType="tour"
                    amount={195}
                    description="Schedule a community tour"
                  />
                </Elements>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Payment processing is not configured. Please add your Stripe API key.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View your recent payments and connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No transactions yet</p>
                <p className="text-sm mt-2">Your payment history will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}