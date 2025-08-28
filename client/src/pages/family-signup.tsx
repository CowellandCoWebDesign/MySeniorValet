import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  ArrowLeft, 
  Heart, 
  Shield, 
  Search, 
  Star, 
  Users, 
  CheckCircle,
  Sparkles,
  Lock,
  Gift
} from 'lucide-react';

// Form validation schema
const familySignupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  zipCode: z.string().min(5, 'Please enter a valid ZIP code'),
  careNeeded: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  }),
  newsletter: z.boolean().optional()
});

type FamilySignupForm = z.infer<typeof familySignupSchema>;

export default function FamilySignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FamilySignupForm>({
    resolver: zodResolver(familySignupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      zipCode: '',
      careNeeded: '',
      agreeTerms: false,
      newsletter: true
    }
  });

  const onSubmit = async (data: FamilySignupForm) => {
    try {
      setIsSubmitting(true);
      
      // Store family signup data
      sessionStorage.setItem('familySignupData', JSON.stringify(data));
      
      // Create account via API
      await apiRequest('POST', '/api/family/signup', data);
      
      toast({
        title: "Welcome to MySeniorValet! 🎉",
        description: "Your free account has been created. You now have full access to all platform features.",
      });
      
      // Redirect to home or dashboard
      setTimeout(() => {
        setLocation('/');
      }, 2000);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
            <Heart className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Families Are ALWAYS Free
          </h1>
          
          <p className="text-2xl text-gray-700 dark:text-gray-300 mb-4">
            Full access. No credit card. No hidden fees. Ever.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-4 py-2 text-lg">
              <CheckCircle className="w-4 h-4 mr-2" />
              100% Free Forever
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-4 py-2 text-lg">
              <Shield className="w-4 h-4 mr-2" />
              No Credit Card Required
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-4 py-2 text-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              All Features Included
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Features Card */}
          <Card className="border-2 border-green-500">
            <CardHeader>
              <CardTitle className="text-2xl text-green-700 dark:text-green-300">
                What You Get - 100% Free
              </CardTitle>
              <CardDescription>
                Complete platform access with no limitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Search className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">AI-Powered Search (The Kraken)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Multi-AI orchestration with Claude, ChatGPT, and Perplexity
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Star className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Save & Compare Communities</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Build lists, compare options, share with family members
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Tour Scheduling (TourMate™)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Schedule tours directly with communities
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Verified Pricing & Availability</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Real pricing, no paywalls, HUD verified data
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Gift className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Care Spectrum Education</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Complete guide from Independent to Memory Care
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signup Form */}
          <Card className="border-2 border-purple-500">
            <CardHeader>
              <CardTitle className="text-2xl">Create Your Free Account</CardTitle>
              <CardDescription>
                Takes less than 60 seconds - no payment info needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Jane Smith" />
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
                          <Input {...field} type="email" placeholder="jane@example.com" />
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
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="(555) 123-4567" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="90210" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="agreeTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the{' '}
                            <a href="/terms" className="text-blue-600 hover:underline">
                              Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="/privacy" className="text-blue-600 hover:underline">
                              Privacy Policy
                            </a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newsletter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Send me helpful tips and updates (you can unsubscribe anytime)
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create My Free Account'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Promise */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold">Our Privacy Promise</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We never sell your data. We never share your information without permission. 
            Your privacy is protected by enterprise-grade security. You're in complete control.
          </p>
        </div>
      </div>
    </div>
  );
}