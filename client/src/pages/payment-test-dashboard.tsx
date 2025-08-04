import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Store,
  DollarSign,
  ArrowRight,
  Sparkles,
  Crown,
  Star,
  ShoppingBag,
  Globe,
  Shield
} from 'lucide-react';

interface TierTest {
  id: string;
  name: string;
  price: number;
  type: 'community' | 'vendor';
  description: string;
  icon: React.ReactNode;
  color: string;
}

const communityTiers: TierTest[] = [
  {
    id: 'standard',
    name: 'Standard',
    price: 149,
    type: 'community',
    description: 'Essential features for community listings',
    icon: <Shield className="w-6 h-6" />,
    color: 'blue'
  },
  {
    id: 'featured',
    name: 'Featured',
    price: 249,
    type: 'community',
    description: 'Enhanced visibility and marketing tools',
    icon: <Star className="w-6 h-6" />,
    color: 'purple'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 349,
    type: 'community',
    description: 'Complete platform access with all features',
    icon: <Crown className="w-6 h-6" />,
    color: 'amber'
  }
];

const vendorTiers: TierTest[] = [
  {
    id: 'basic-vendor',
    name: 'Basic Listing',
    price: 99,
    type: 'vendor',
    description: 'Regional visibility for service providers',
    icon: <ShoppingBag className="w-6 h-6" />,
    color: 'gray'
  },
  {
    id: 'featured-vendor',
    name: 'Featured Vendor',
    price: 249,
    type: 'vendor',
    description: 'Multi-region coverage with analytics',
    icon: <Store className="w-6 h-6" />,
    color: 'blue'
  },
  {
    id: 'national-partner',
    name: 'National Partner',
    price: 499,
    type: 'vendor',
    description: 'Nationwide reach with premium features',
    icon: <Globe className="w-6 h-6" />,
    color: 'purple'
  }
];

export default function PaymentTestDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [testResults, setTestResults] = useState<Record<string, 'idle' | 'testing' | 'success' | 'failed'>>({});

  const testPaymentFlow = async (tier: TierTest) => {
    setTestResults(prev => ({ ...prev, [tier.id]: 'testing' }));
    
    try {
      // Simulate the actual payment flow
      if (tier.type === 'community') {
        // Store data and navigate to payment page
        sessionStorage.setItem('communityUpgradeData', JSON.stringify({
          productId: tier.id,
          planName: tier.name,
          isNewCommunity: false,
          communityId: 'test-community-123',
          communityName: 'Test Community'
        }));
        
        toast({
          title: `Testing ${tier.name} Community Tier`,
          description: `Redirecting to payment page for $${tier.price}/month...`,
        });
        
        setTimeout(() => {
          setLocation(`/community-mobile-payment/${tier.id}`);
        }, 1000);
      } else {
        // Store vendor data and navigate
        sessionStorage.setItem('vendorSignupData', JSON.stringify({
          businessName: 'Test Vendor Business',
          contactName: 'Test Contact',
          email: 'test@vendor.com',
          phone: '555-1234',
          businessType: 'Moving Services',
          description: 'Test vendor for payment flow testing',
          serviceAreas: 'Test Region',
          planType: tier.id.replace('-vendor', '').replace('national-partner', 'national')
        }));
        
        toast({
          title: `Testing ${tier.name} Vendor Tier`,
          description: `Redirecting to payment page for $${tier.price}/month...`,
        });
        
        setTimeout(() => {
          setLocation(`/vendor-mobile-payment/${tier.id}`);
        }, 1000);
      }
      
      setTestResults(prev => ({ ...prev, [tier.id]: 'success' }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [tier.id]: 'failed' }));
      toast({
        title: "Test Failed",
        description: `Error testing ${tier.name}: ${error}`,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'testing':
        return <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-400" />;
    }
  };

  const TierCard = ({ tier }: { tier: TierTest }) => (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`absolute top-0 left-0 w-full h-1 bg-${tier.color}-500`} />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${tier.color}-100 dark:bg-${tier.color}-900/20 text-${tier.color}-600`}>
              {tier.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
            </div>
          </div>
          {getStatusIcon(testResults[tier.id])}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">${tier.price}</span>
            <span className="text-sm text-gray-500">/month</span>
          </div>
          <Button 
            onClick={() => testPaymentFlow(tier)}
            className="w-full"
            disabled={testResults[tier.id] === 'testing'}
          >
            {testResults[tier.id] === 'testing' ? 'Testing...' : 'Test Payment Flow'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-4 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Payment Testing Dashboard
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Test All Payment Tiers</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Click any tier to test the complete payment flow with Stripe
          </p>
        </div>

        <Tabs defaultValue="community" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Community Tiers
            </TabsTrigger>
            <TabsTrigger value="vendor" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Vendor Tiers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="community">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {communityTiers.map(tier => (
                <TierCard key={tier.id} tier={tier} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vendor">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vendorTiers.map(tier => (
                <TierCard key={tier.id} tier={tier} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payment Flow Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Community Flow:</strong> Portal → Select Tier → Payment Element → Success</p>
            <p><strong>Vendor Flow:</strong> Signup → Select Tier → Payment Element → Success</p>
            <p><strong>Upgrade Flow:</strong> Dashboard → Upgrade Button → Tier Selection → Payment</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
              All payments use Stripe's secure Payment Element with PCI compliance
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}