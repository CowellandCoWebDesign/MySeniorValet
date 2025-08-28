import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
// Removed Stripe Elements imports - using Checkout Sessions instead
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle, Shield, TrendingUp, Users2, ArrowLeft, CreditCard, Building2, Mail, Phone, Globe, FileText, DollarSign, Sparkle } from 'lucide-react';

// Stripe Checkout Sessions will be used instead of embedded forms

// Form validation schema
const vendorSignupSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  website: z.string().url('Invalid website URL (must include https://)').min(1, 'Website is required for verification'),
  businessType: z.string().min(1, 'Please select a business type'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  serviceAreas: z.string().min(2, 'Please specify your service areas'),
  planType: z.enum(['basic', 'featured', 'national'])
});

type VendorSignupForm = z.infer<typeof vendorSignupSchema>;

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  badge: string | null;
  comingSoon?: boolean;
  features: string[];
}

// Pricing plans - NEW VENDOR TIER SYSTEM
const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic Tier',
    price: 99,
    badge: null,
    features: [
      'Enhanced vendor listing',
      '5 qualified leads per month',
      'Service area targeting',
      'Basic company profile',
      'Contact information display',
      'Service categories',
      'Standard search visibility',
      'Email support'
    ]
  },
  {
    id: 'featured',
    name: 'Featured Tier',
    price: 399,
    badge: 'Most Popular',
    features: [
      'Everything in Basic, plus:',
      'Featured vendor placement',
      '25 qualified leads per month',
      'Priority support & analytics',
      'Custom landing page',
      'Advanced lead scoring',
      'Company logo & branding',
      'Promotional campaigns',
      'Phone support'
    ]
  },
  {
    id: 'national',
    name: 'National Partner',
    price: 999,
    badge: 'Coming Soon',
    comingSoon: true,
    features: [
      'Everything in Featured, plus:',
      'Unlimited leads nationwide',
      'API integration access',
      'Dedicated account manager',
      'Custom integrations',
      'White-label options',
      'Quarterly business reviews',
      'Priority routing in AI system',
      'International expansion ready'
    ]
  }
];

// Removed CheckoutForm - using Stripe Checkout Sessions instead

export default function VendorSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>('featured');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isFirstTimeCustomer, setIsFirstTimeCustomer] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VendorSignupForm>({
    resolver: zodResolver(vendorSignupSchema),
    defaultValues: {
      businessName: '',
      contactName: '',
      email: '',
      phone: '',
      website: '',
      businessType: '',
      description: '',
      serviceAreas: '',
      planType: 'featured'
    }
  });

  const onSubmit = async (data: VendorSignupForm) => {
    try {
      setIsSubmitting(true);
      
      // Map plan types to product IDs
      const productIdMap: Record<string, string> = {
        'basic': 'basic-vendor',
        'featured': 'featured-vendor',
        'national': 'national-partner'
      };
      
      const productId = productIdMap[data.planType];
      if (!productId) {
        throw new Error('Invalid plan selected');
      }
      
      // Store vendor data with billing preferences in session storage
      sessionStorage.setItem('vendorSignupData', JSON.stringify({
        ...data,
        billingCycle,
        applyPromo: isFirstTimeCustomer,
      }));
      
      // Navigate to mobile payment page with billing params
      const params = new URLSearchParams({
        billingCycle,
        promo: isFirstTimeCustomer ? 'true' : 'false'
      });
      setLocation(`/vendor-mobile-payment/${productId}?${params.toString()}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  // Using Stripe Checkout Sessions - no embedded payment form needed

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Become a MySeniorValet Partner
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Join thousands of trusted vendors serving senior communities across North America
          </p>
          
          {/* Prominent Promotional Banner */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-xl max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="flex items-center gap-3">
                <Sparkle className="w-8 h-8 animate-pulse" />
                <div>
                  <p className="text-2xl font-bold">Limited Time Offer!</p>
                  <p className="text-lg">50% OFF Your First Month</p>
                </div>
              </div>
              <div className="h-16 w-px bg-white/30 hidden md:block" />
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">Save Even More!</p>
                  <p className="text-lg">20% OFF Annual Plans</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/30">
              <p className="text-lg font-semibold">🚀 INTRODUCTORY PRICING - Take advantage now!</p>
              <p className="text-sm">More plans may come soon • Check back for updates</p>
            </div>
          </div>
        </div>

        {/* Impact Statistics Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 mb-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <h3 className="text-4xl font-bold mb-2">34,171</h3>
              <p className="text-lg">Senior Communities</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">1M+</h3>
              <p className="text-lg">Monthly Searches</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">250K</h3>
              <p className="text-lg">Active Families</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">92%</h3>
              <p className="text-lg">Customer Satisfaction</p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg">Instant Visibility</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Get discovered by families actively searching for services in your area
              </p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg">Revenue Growth</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Average 40% increase in qualified leads within 90 days
              </p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg">Trust & Credibility</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Verified badge shows families you're a trusted partner
              </p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Users2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg">Perfect Matches</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                AI-powered matching connects you with ideal customers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plans */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Powerful State & National Coverage</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Reach seniors across entire states or nationwide. Instant activation, no setup fees.</p>
            
            {/* Promotional Badges */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3 items-center justify-center">
              {isFirstTimeCustomer && (
                <div className="inline-flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full">
                  <Sparkle className="w-4 h-4 mr-2" />
                  <span className="font-medium">Limited Time: First month 50% off!</span>
                </div>
              )}
              <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="font-medium">Save 20% with annual billing!</span>
              </div>
            </div>
            
            {/* Billing Cycle Toggle */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <span className={`text-lg font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  billingCycle === 'annual' ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-lg font-medium ${billingCycle === 'annual' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                Annual
                <Badge className="ml-2 bg-green-600 text-white">Save 20%</Badge>
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => {
              // Calculate displayed price based on billing cycle and promotions
              let displayPrice = plan.price;
              let originalPrice = plan.price;
              let savingsText = '';
              
              if (billingCycle === 'annual') {
                // Annual pricing: 20% off (pay 80% of full annual price)
                const annualPrice = plan.price * 12 * 0.8; // 20% off
                displayPrice = Math.round(annualPrice / 12); // Show monthly equivalent
                const savings = (plan.price * 12) - annualPrice;
                savingsText = `Save $${Math.round(savings)} per year`;
              }
              
              if (isFirstTimeCustomer && billingCycle === 'monthly') {
                // First month 50% off for monthly billing
                originalPrice = plan.price;
                displayPrice = Math.round(plan.price / 2);
              }
              
              return (
                <Card 
                  key={plan.id}
                  className={`transition-all ${
                    plan.comingSoon 
                      ? 'opacity-75 cursor-not-allowed' 
                      : `cursor-pointer ${
                          selectedPlan === plan.id 
                            ? 'ring-2 ring-purple-600 shadow-lg' 
                            : 'hover:shadow-md'
                        }`
                  }`}
                  onClick={() => {
                    if (!plan.comingSoon) {
                      setSelectedPlan(plan.id);
                      form.setValue('planType', plan.id as any);
                    }
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{plan.name}</CardTitle>
                      {plan.badge && (
                        <Badge className="bg-purple-600 text-white">
                          {plan.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4">
                      {isFirstTimeCustomer && billingCycle === 'monthly' && (
                        <div className="mb-2">
                          <span className="text-sm line-through text-gray-500">${originalPrice}</span>
                          <Badge className="ml-2 bg-green-600 text-white text-xs">50% OFF</Badge>
                        </div>
                      )}
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold">${displayPrice}</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">
                          /{billingCycle === 'annual' ? 'month' : 'month'}
                        </span>
                      </div>
                      {billingCycle === 'annual' && (
                        <div className="mt-2">
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {savingsText}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Billed annually at ${Math.round(plan.price * 12 * 0.8)}
                          </p>
                        </div>
                      )}
                      {isFirstTimeCustomer && billingCycle === 'monthly' && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          First month only, then ${plan.price}/month
                        </p>
                      )}
                    </div>
                  </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Signup Form */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Registration</CardTitle>
            <CardDescription>
              Fill out the form below to get started. Your listing will be active immediately after payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input {...field} className="pl-10" placeholder="Your Business Name" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John Doe" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input {...field} type="email" className="pl-10" placeholder="contact@business.com" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input {...field} type="tel" className="pl-10" placeholder="(555) 123-4567" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input {...field} className="pl-10" placeholder="https://yourbusiness.com" required />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Required for verification and customer access
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pharmacy">Pharmacy</SelectItem>
                            <SelectItem value="medical-supplies">Medical Supplies</SelectItem>
                            <SelectItem value="home-care">Home Care Services</SelectItem>
                            <SelectItem value="transportation">Transportation</SelectItem>
                            <SelectItem value="grocery-delivery">Grocery Delivery</SelectItem>
                            <SelectItem value="moving-services">Moving Services</SelectItem>
                            <SelectItem value="legal-services">Legal Services</SelectItem>
                            <SelectItem value="financial-services">Financial Services</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="serviceAreas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Areas</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., California, Texas, Florida" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={4}
                          placeholder="Tell us about your business and the services you provide to seniors..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Selected Plan: <span className="font-semibold">{pricingPlans.find(p => p.id === selectedPlan)?.name}</span>
                  </div>
                  <Button type="submit" size="lg" className="min-w-[200px]" disabled={isSubmitting}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Trust Section */}
        <div className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            <Shield className="w-4 h-4 inline mr-1" />
            Secure payment processing by Stripe
          </p>
          <p>
            Questions? Contact our partner support team at billing@myseniorvalet.com
          </p>
        </div>
      </div>
    </div>
  );
}