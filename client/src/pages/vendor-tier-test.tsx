import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NavigationHeader } from '@/components/NavigationHeader';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Gem, 
  Crown, 
  DollarSign, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
  BarChart,
  Target,
  Rocket,
  TestTube,
  Play,
  CreditCard,
  Building2
} from 'lucide-react';

// Vendor tier configurations
const vendorTiers = {
  basic: {
    id: 'basic',
    name: 'Basic Listing',
    price: 99,
    icon: Shield,
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-300 dark:border-gray-700',
    features: [
      'Business profile page',
      'Contact information display',
      'Service listings',
      'Basic search placement',
      'Customer inquiries',
      'Monthly performance report'
    ],
    limitations: [
      'No priority placement',
      'No analytics dashboard',
      'No featured badge',
      'Standard support only'
    ]
  },
  featured: {
    id: 'featured',
    name: 'Featured Partner',
    price: 249,
    icon: Gem,
    color: 'from-blue-500 to-purple-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    borderColor: 'border-blue-400 dark:border-blue-600',
    features: [
      'Everything in Basic',
      '💎 Featured badge on listings',
      'Priority search placement',
      'Performance analytics dashboard',
      'Lead tracking & management',
      'Promotional opportunities',
      'Priority support',
      'Monthly strategy calls',
      'Social media promotion'
    ],
    limitations: [
      'Regional visibility only',
      'Limited promotional campaigns'
    ]
  },
  national: {
    id: 'national',
    name: 'National Partner',
    price: 499,
    icon: Crown,
    color: 'from-yellow-500 to-amber-600',
    bgColor: 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900',
    borderColor: 'border-yellow-400 dark:border-yellow-600',
    features: [
      'Everything in Featured',
      '👑 Premium placement everywhere',
      'Custom vendor microsite',
      'Advanced analytics & insights',
      'Dedicated success manager',
      'Custom marketing campaigns',
      'API access (Coming Soon)',
      'White-glove onboarding',
      'Quarterly business reviews',
      'Co-branded content opportunities',
      'Trade show representation',
      'National directory listing'
    ],
    limitations: []
  }
};

// Test vendor data generator
const generateTestVendorData = (tier: string) => ({
  businessName: `Test ${tier.charAt(0).toUpperCase() + tier.slice(1)} Vendor ${Date.now()}`,
  businessType: 'company',
  contactName: 'John Smith',
  email: `test-${tier}@myseniorvalet.com`,
  phone: '555-0100',
  city: 'Miami',
  state: 'FL',
  website: 'https://example.com',
  description: `Test ${tier} vendor for MySeniorValet platform testing`,
  serviceAreas: 'Miami, Fort Lauderdale, West Palm Beach',
  category: 'Home Care Services',
  planType: tier
});

export default function VendorTierTest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  const handleQuickTest = async (tier: string) => {
    setIsProcessing(tier);
    const testData = generateTestVendorData(tier);
    
    try {
      // Map tier to product ID
      const productIdMap: Record<string, string> = {
        'basic': 'basic-vendor',
        'featured': 'featured-vendor',
        'national': 'national-partner'
      };
      
      // Store vendor data in session
      sessionStorage.setItem('vendorSignupData', JSON.stringify(testData));
      
      toast({
        title: "Starting Test",
        description: `Testing ${vendorTiers[tier as keyof typeof vendorTiers].name} tier flow`,
      });

      // Redirect to payment page with correct product ID
      setTimeout(() => {
        const productId = productIdMap[tier] || tier;
        setLocation(`/vendor-mobile-payment/${productId}`);
      }, 1000);
      
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: "Test Failed",
        description: "Error starting vendor tier test",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDirectPaymentTest = async (tier: string) => {
    setIsProcessing(`payment-${tier}`);
    
    try {
      const testData = generateTestVendorData(tier);
      
      // Create test payment intent using the correct endpoint
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tier,
          type: 'vendor',
          metadata: {
            ...testData,
            productName: vendorTiers[tier as keyof typeof vendorTiers].name,
            productId: tier
          }
        })
      });

      const data = await response.json();
      
      if (data.clientSecret) {
        // Store vendor data for the payment flow
        sessionStorage.setItem('vendorSignupData', JSON.stringify(testData));
        
        toast({
          title: "Payment Intent Created",
          description: `Test payment ready for ${vendorTiers[tier as keyof typeof vendorTiers].name}`,
        });
        
        // For direct test, create a vendor immediately
        const vendorResponse = await fetch('/api/vendors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...testData,
            subscriptionTier: tier,
            stripePaymentIntentId: `pi_test_${tier}_${Date.now()}`
          })
        });

        if (vendorResponse.ok) {
          const vendorData = await vendorResponse.json();
          
          setTestResults(prev => [...prev, {
            tier,
            success: true,
            vendorId: vendorData.vendor?.id || 'test',
            timestamp: new Date().toLocaleTimeString()
          }]);

          toast({
            title: "Test Vendor Created",
            description: `${vendorTiers[tier as keyof typeof vendorTiers].name} vendor created successfully`,
          });

          if (vendorData.vendor?.id) {
            setTimeout(() => {
              setLocation(`/vendor-onboarding-wizard/${vendorData.vendor.id}`);
            }, 2000);
          }
        }
      }
    } catch (error) {
      console.error('Payment test error:', error);
      toast({
        title: "Payment Test Failed",
        description: "Error processing test payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader 
        title="Vendor Tier Testing Dashboard" 
        subtitle="Test all vendor subscription tiers"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Card */}
        <Card className="mb-8 border-purple-200 dark:border-purple-800">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <TestTube className="w-6 h-6 text-purple-600" />
                  Vendor Tier Testing Suite
                </CardTitle>
                <CardDescription className="mt-2">
                  Test the complete vendor onboarding flow for each subscription tier
                </CardDescription>
              </div>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Test Mode
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Test Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <strong>Quick Test:</strong> Simulates the complete flow from signup → payment → onboarding wizard
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <strong>Direct Payment:</strong> Tests payment processing and vendor creation directly
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                <div>
                  <strong>Test Payment IDs:</strong> Use format <code>pi_test_tier_timestamp</code> for testing
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tier Testing Cards */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Tiers</TabsTrigger>
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="national">National</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(vendorTiers).map(([key, tier]) => {
                const Icon = tier.icon;
                return (
                  <Card key={key} className={`border-2 ${tier.borderColor} overflow-hidden`}>
                    <div className={`h-2 bg-gradient-to-r ${tier.color}`} />
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-12 h-12 rounded-full ${tier.bgColor} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </div>
                        <Badge className={tier.bgColor}>
                          ${tier.price}/mo
                        </Badge>
                      </div>
                      <CardTitle>{tier.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Key Features:</h4>
                        <ul className="text-xs space-y-1">
                          {tier.features.slice(0, 4).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {tier.features.length > 4 && (
                            <li className="text-gray-500 pl-4">+{tier.features.length - 4} more features</li>
                          )}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <Button
                          onClick={() => handleQuickTest(key)}
                          disabled={isProcessing === key}
                          className="w-full"
                          variant="default"
                        >
                          {isProcessing === key ? (
                            <>Processing...</>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Quick Test Flow
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleDirectPaymentTest(key)}
                          disabled={isProcessing === `payment-${key}`}
                          className="w-full"
                          variant="outline"
                        >
                          {isProcessing === `payment-${key}` ? (
                            <>Processing...</>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Direct Payment Test
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Individual tier tabs */}
          {Object.entries(vendorTiers).map(([key, tier]) => {
            const Icon = tier.icon;
            return (
              <TabsContent key={key} value={key}>
                <Card className={`border-2 ${tier.borderColor}`}>
                  <div className={`h-3 bg-gradient-to-r ${tier.color}`} />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full ${tier.bgColor} flex items-center justify-center`}>
                          <Icon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{tier.name}</CardTitle>
                          <CardDescription>
                            ${tier.price}/month subscription tier
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="font-semibold mb-4">Included Features</h3>
                        <ul className="space-y-2">
                          {tier.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {tier.limitations.length > 0 && (
                          <>
                            <h3 className="font-semibold mt-6 mb-4">Limitations</h3>
                            <ul className="space-y-2">
                              {tier.limitations.map((limitation, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-gray-400">•</span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">{limitation}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold mb-4">Test This Tier</h3>
                        <div className="space-y-4">
                          <Card className="bg-gray-50 dark:bg-gray-800">
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2">Test Flow Steps:</h4>
                              <ol className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                                <li>1. Click "Start Full Test" below</li>
                                <li>2. Review vendor signup form (pre-filled)</li>
                                <li>3. Complete payment (test mode)</li>
                                <li>4. Go through onboarding wizard</li>
                                <li>5. View final vendor profile</li>
                              </ol>
                            </CardContent>
                          </Card>

                          <Button
                            onClick={() => handleQuickTest(key)}
                            disabled={isProcessing === key}
                            className={`w-full bg-gradient-to-r ${tier.color} hover:opacity-90`}
                            size="lg"
                          >
                            {isProcessing === key ? (
                              <>Processing Test...</>
                            ) : (
                              <>
                                <Rocket className="w-5 h-5 mr-2" />
                                Start Full Test - {tier.name}
                              </>
                            )}
                          </Button>

                          <Button
                            onClick={() => handleDirectPaymentTest(key)}
                            disabled={isProcessing === `payment-${key}`}
                            variant="outline"
                            className="w-full"
                          >
                            {isProcessing === `payment-${key}` ? (
                              <>Processing...</>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Test Payment Only
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {testResults.map((result, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`w-5 h-5 ${result.success ? 'text-green-600' : 'text-red-600'}`} />
                      <span className="font-medium">
                        {vendorTiers[result.tier as keyof typeof vendorTiers].name}
                      </span>
                      <Badge variant="outline">
                        Vendor ID: {result.vendorId}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <Card className="mt-8 border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => setLocation('/vendor-signup')}
                className="justify-start"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Vendor Signup Page
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation('/vendor-marketplace')}
                className="justify-start"
              >
                <Users className="w-4 h-4 mr-2" />
                Vendor Marketplace
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation('/financial-dashboard')}
                className="justify-start"
              >
                <BarChart className="w-4 h-4 mr-2" />
                Financial Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}