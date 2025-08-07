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

// Pricing plans - OFFICIAL VENDOR PRICING (3 TIERS ONLY)
const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic Listing',
    price: 99,
    features: [
      'Public listing in vendor directory',
      'Region-limited to 1 zip cluster',
      'Name, phone, category, description',
      'Optional $25 verified badge',
      'User reviews allowed',
      'Affiliate link support (if provided)'
    ]
  },
  {
    id: 'featured',
    name: 'Featured Vendor',
    price: 249,
    badge: 'Most Popular',
    features: [
      'Everything in Basic, plus:',
      'Coverage across 5 regions',
      'Upload logo, brand colors, CTA button',
      'Basic analytics (views, clicks, leads)',
      'Post vendor promos',
      'Featured placement in vendor carousels',
      'Must have affiliate link for "Approved" badge'
    ]
  },
  {
    id: 'national',
    name: 'National Partner',
    price: 499,
    features: [
      'Everything in Featured, plus:',
      'Nationwide visibility (no geo cap)',
      'Banner rotation in major discovery areas',
      'Concierge system priority & routing',
      'AI-generated lead summaries + scoring',
      'Optional API or CSV lead passback',
      'Dedicated vendor microsite',
      'Quarterly performance report',
      'Optional vendor success call'
    ]
  }
];

// Removed CheckoutForm - using Stripe Checkout Sessions instead

export default function VendorSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>('featured');
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
      
      // Store vendor data in session storage
      sessionStorage.setItem('vendorSignupData', JSON.stringify(data));
      
      // Navigate to mobile payment page
      setLocation(`/vendor-mobile-payment/${productId}`);
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
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Join thousands of trusted vendors serving senior communities across North America
          </p>
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
            <h2 className="text-3xl font-bold mb-2">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">No hidden fees. Cancel anytime. All plans include immediate activation.</p>
            <div className="mt-4 inline-flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full">
              <Sparkle className="w-4 h-4 mr-2" />
              <span className="font-medium">Limited Time: First month 50% off!</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  selectedPlan === plan.id 
                    ? 'ring-2 ring-purple-600 shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => {
                  setSelectedPlan(plan.id);
                  form.setValue('planType', plan.id as any);
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
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-gray-600 dark:text-gray-400 ml-1">/month</span>
                    </div>
                    {plan.id === 'featured' && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">Save $178/year with annual billing</p>
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
            ))}
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
            Questions? Contact us at hello@myseniorvalet.com
          </p>
        </div>
      </div>
    </div>
  );
}