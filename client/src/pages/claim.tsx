import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Building, CheckCircle, AlertCircle, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Header } from '@/components/header';

const claimFormSchema = z.object({
  claimerName: z.string().min(2, 'Name must be at least 2 characters'),
  claimerEmail: z.string().email('Please enter a valid email'),
  claimerPhone: z.string().min(10, 'Please enter a valid phone number'),
  position: z.string().min(2, 'Position must be at least 2 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  businessLicenseNumber: z.string().optional(),
  businessAddress: z.string().min(5, 'Business address must be at least 5 characters'),
  reasonForClaim: z.enum(['Owner', 'Administrator', 'Marketing Director', 'General Manager', 'Other']),
  additionalNotes: z.string().optional()
});

type ClaimFormData = z.infer<typeof claimFormSchema>;

interface ClaimCheckResponse {
  canClaim: boolean;
  isClaimed: boolean;
  hasPendingClaim: boolean;
  userHasClaim: boolean;
  community: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
  };
}

export default function ClaimCommunity() {
  const [, params] = useRoute('/claim/:communityId');
  const [, location] = useRoute('/community-claim');
  // Support both routes - with and without communityId
  const communityId = params?.communityId ? parseInt(params.communityId) : null;
  const isNewCommunity = location ? true : false;
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [claimId, setClaimId] = useState<number | null>(null);

  const form = useForm<ClaimFormData>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      claimerName: '',
      claimerEmail: '',
      claimerPhone: '',
      position: '',
      companyName: '',
      businessLicenseNumber: '',
      businessAddress: '',
      reasonForClaim: 'Owner',
      additionalNotes: ''
    }
  });

  // Check if community can be claimed
  const { data: claimCheck, isLoading: checkLoading } = useQuery<ClaimCheckResponse>({
    queryKey: ['/api/claims/check', communityId],
    enabled: !!communityId && !isNewCommunity,
    retry: false
  });

  // Submit claim mutation
  const submitClaim = useMutation({
    mutationFn: async (data: ClaimFormData) => {
      if (!communityId) throw new Error('Community ID is required');
      
      const response = await apiRequest('POST', '/api/claims/submit', {
        ...data,
        communityId
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      setIsSubmitted(true);
      setClaimId(data.claimId);
      toast({
        title: "Claim Submitted Successfully",
        description: "We'll review your claim within 1-2 business days and contact you with updates.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Submit Claim",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  });

  // Submit new community mutation
  const submitNewCommunity = useMutation({
    mutationFn: async (data: ClaimFormData) => {
      const response = await apiRequest('POST', '/api/payments/claim-free-tier', {
        ...data,
        isNewCommunity: true
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      setIsSubmitted(true);
      setClaimId(data.communityId);
      toast({
        title: "Free Tier Activated!",
        description: "Your community has been created with a free verified listing.",
      });
      // Redirect to community dashboard after a short delay
      setTimeout(() => {
        window.location.href = `/community-dashboard/${data.communityId}`;
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Community",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ClaimFormData) => {
    submitClaim.mutate(data);
  };

  // If it's a new community claim, skip the check and go straight to form
  if (isNewCommunity) {

    if (isSubmitted) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Community Created Successfully!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Your free verified listing has been activated. Redirecting to your dashboard...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-6 w-6" />
                Create Your Free Community Listing
              </CardTitle>
              <CardDescription>
                Complete this form to activate your free verified listing on MySeniorValet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => submitNewCommunity.mutate(data))} className="space-y-6">
                  {/* Form fields here - same as existing form */}
                  <FormField
                    control={form.control}
                    name="claimerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="claimerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          We'll use this email to verify your claim and send updates
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="claimerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Position/Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Executive Director" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Community Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Sunrise Senior Living" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Community Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, City, State 12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reasonForClaim"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Owner">Owner</SelectItem>
                            <SelectItem value="Administrator">Administrator</SelectItem>
                            <SelectItem value="Marketing Director">Marketing Director</SelectItem>
                            <SelectItem value="General Manager">General Manager</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={submitNewCommunity.isPending}
                    >
                      {submitNewCommunity.isPending ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Creating Community...
                        </>
                      ) : (
                        'Create Free Listing'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!communityId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Invalid Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                No community specified for claiming. Please navigate to a community page and click "Claim This Community".
              </p>
              <Link to="/search">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Search
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (checkLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Checking claim eligibility...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (claimCheck && !claimCheck.canClaim) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Community Cannot Be Claimed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-2">
                    {claimCheck.community?.name}
                  </h3>
                  <p className="text-amber-700 text-sm">
                    {claimCheck.community?.address}, {claimCheck.community?.city}, {claimCheck.community?.state}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {claimCheck.isClaimed && (
                    <p className="text-gray-600">
                      ✓ This community has already been claimed by its owner.
                    </p>
                  )}
                  
                  {claimCheck.hasPendingClaim && (
                    <p className="text-gray-600">
                      ⏳ This community has a pending claim under review.
                    </p>
                  )}
                  
                  {claimCheck.userHasClaim && (
                    <p className="text-gray-600">
                      📋 You have already submitted a claim for this community.
                    </p>
                  )}
                </div>
                
                <div className="pt-4">
                  <Link to={`/community/${communityId}`}>
                    <Button variant="outline" className="mr-3">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Community
                    </Button>
                  </Link>
                  
                  <Link to="/search">
                    <Button>
                      Search Other Communities
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Claim Submitted Successfully
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">
                    {claimCheck?.community?.name}
                  </h3>
                  <p className="text-green-700 text-sm">
                    Claim ID: #{claimId}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">What happens next?</p>
                      <p className="text-sm text-gray-600">
                        Our team will review your claim within 1-2 business days. We'll verify your information and contact you with updates.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">After approval</p>
                      <p className="text-sm text-gray-600">
                        You'll receive access to manage your community's profile, update information, and respond to reviews.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Link to="/dashboard">
                    <Button className="mr-3">
                      View My Claims
                    </Button>
                  </Link>
                  
                  <Link to="/search">
                    <Button variant="outline">
                      Continue Searching
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Ownership Claim</CardTitle>
            </CardHeader>
            <CardContent>
              {claimCheck?.community && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-1">
                  {claimCheck.community.name}
                </h3>
                <p className="text-blue-800 text-sm">
                  {claimCheck.community.address}, {claimCheck.community.city}, {claimCheck.community.state}
                </p>
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="claimerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John Smith" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="claimerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="john@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="claimerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="(555) 123-4567" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Position *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Administrator" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company/Organization Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Senior Living Solutions LLC" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="businessLicenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business License Number (if applicable)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Optional" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="businessAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Address *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123 Main St, City, State 12345" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reasonForClaim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Claim *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Owner">Owner</SelectItem>
                          <SelectItem value="Administrator">Administrator</SelectItem>
                          <SelectItem value="Marketing Director">Marketing Director</SelectItem>
                          <SelectItem value="General Manager">General Manager</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder="Any additional information that helps verify your claim..."
                        />
                      </FormControl>
                      <FormDescription>
                        Optional: Provide any additional context or documentation references
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4 border-t">
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={submitClaim.isPending}
                      className="flex-1"
                    >
                      {submitClaim.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit Claim'
                      )}
                    </Button>
                    
                    <Link to={`/community/${communityId}`}>
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  );
}