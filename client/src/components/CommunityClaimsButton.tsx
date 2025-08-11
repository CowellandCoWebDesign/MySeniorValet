import React, { useState } from 'react';
import { useMutation, useQuery, queryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, Building, CheckCircle, Clock, AlertCircle, 
  FileText, Upload, User, Mail, Phone, Briefcase, Info
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface CommunityClaimsButtonProps {
  communityId: number;
  communityName: string;
  isClaimed?: boolean;
  isVerified?: boolean;
}

const claimSchema = z.object({
  claimerName: z.string().min(2, 'Name must be at least 2 characters'),
  claimerEmail: z.string().email('Invalid email address'),
  claimerPhone: z.string().optional(),
  position: z.string().min(2, 'Position is required'),
  companyName: z.string().optional(),
  businessLicenseNumber: z.string().optional(),
  businessAddress: z.string().optional(),
  reasonForClaim: z.string().min(10, 'Please provide more details (minimum 10 characters)'),
  additionalNotes: z.string().optional()
});

type ClaimFormData = z.infer<typeof claimSchema>;

export function CommunityClaimsButton({ 
  communityId, 
  communityName, 
  isClaimed = false, 
  isVerified = false 
}: CommunityClaimsButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [claimId, setClaimId] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      claimerName: '',
      claimerEmail: '',
      claimerPhone: '',
      position: '',
      companyName: '',
      businessLicenseNumber: '',
      businessAddress: '',
      reasonForClaim: '',
      additionalNotes: ''
    }
  });

  // Check verification badge status
  const { data: verificationStatus } = useQuery({
    queryKey: [`/api/communities/${communityId}/verification-badge`],
    enabled: !!communityId,
  });

  // Submit claim mutation
  const submitClaim = useMutation({
    mutationFn: async (data: ClaimFormData) => {
      return await apiRequest('POST', '/api/claims/initiate', {
        communityId,
        ...data
      });
    },
    onSuccess: (response) => {
      setClaimId(response.data.claimId);
      toast({
        title: "Claim Submitted Successfully",
        description: "You will receive a verification email shortly. Please check your inbox.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/verification-badge`] });
    },
    onError: (error: any) => {
      toast({
        title: "Claim Submission Failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (data: ClaimFormData) => {
    submitClaim.mutate(data);
  };

  // Check claim status if we have a claimId
  const { data: claimStatus } = useQuery({
    queryKey: [`/api/claims/status/${claimId}`],
    enabled: !!claimId,
  });

  if (verificationStatus?.data?.hasVerification && verificationStatus?.data?.badge) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <CheckCircle className="w-4 h-4 text-green-600" />
        Verified Community
      </Button>
    );
  }

  if (isClaimed && !isVerified) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Clock className="w-4 h-4 text-yellow-600" />
        Claim Pending
      </Button>
    );
  }

  return (
    <>
      <Button 
        onClick={() => setIsDialogOpen(true)}
        variant="outline"
        className="gap-2 border-primary hover:bg-primary/10"
      >
        <Shield className="w-4 h-4" />
        Claim This Community
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Building className="w-6 h-6" />
              Claim {communityName}
            </DialogTitle>
            <DialogDescription>
              Verify your ownership or management of this community to unlock premium features
            </DialogDescription>
          </DialogHeader>

          {!claimId ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Benefits Card */}
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      Benefits of Claiming Your Community
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Update pricing and availability in real-time</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Add photos, virtual tours, and promotional content</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Respond to reviews and messages directly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Access analytics and lead notifications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Display verified badge on your listing</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="claimerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
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
                            <Input type="email" placeholder="john@community.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="claimerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
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
                          <FormLabel>Your Position/Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="Executive Director" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Business Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company/Organization Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Senior Living Management LLC" {...field} />
                          </FormControl>
                          <FormDescription>
                            If different from community name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessLicenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business License Number</FormLabel>
                          <FormControl>
                            <Input placeholder="BL-123456" {...field} />
                          </FormControl>
                          <FormDescription>
                            Optional but speeds up verification
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="businessAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, City, State 12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Verification Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Verification Details
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="reasonForClaim"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Claim *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please explain your relationship to this community and why you're authorized to manage this listing..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Provide details about your authority to manage this listing
                        </FormDescription>
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
                            placeholder="Any additional information that might help verify your claim..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Verification Process Info */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Verification Process:</strong>
                    <ol className="mt-2 space-y-1 text-sm">
                      <li>1. Submit this claim form</li>
                      <li>2. Verify your email address</li>
                      <li>3. Upload supporting documents (business license, utility bill, etc.)</li>
                      <li>4. Our team reviews within 24-48 hours</li>
                      <li>5. Receive approval and access to manage your listing</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitClaim.isPending}
                    className="gap-2"
                  >
                    {submitClaim.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Submit Claim
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            // Claim Status Display
            <div className="space-y-4">
              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong>Claim Submitted Successfully!</strong>
                  <p className="mt-1">
                    Claim ID: #{claimId}
                  </p>
                  <p className="mt-2 text-sm">
                    Please check your email for verification instructions. You can track your claim status here.
                  </p>
                </AlertDescription>
              </Alert>

              {claimStatus?.data && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3">Claim Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant={
                          claimStatus.data.claim.status === 'Approved' ? 'default' :
                          claimStatus.data.claim.status === 'Pending' ? 'secondary' :
                          claimStatus.data.claim.status === 'Under Review' ? 'outline' :
                          'destructive'
                        }>
                          {claimStatus.data.claim.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Community</span>
                        <span className="text-sm font-medium">{claimStatus.data.community.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Submitted</span>
                        <span className="text-sm">{new Date(claimStatus.data.claim.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Activity Timeline */}
                    {claimStatus.data.activities && claimStatus.data.activities.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-3">Activity Timeline</h4>
                        <div className="space-y-2">
                          {claimStatus.data.activities.map((activity: any, index: number) => (
                            <div key={index} className="flex items-start gap-3 text-sm">
                              <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                              <div className="flex-1">
                                <p className="font-medium">{activity.action.replace('_', ' ').toUpperCase()}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(activity.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}