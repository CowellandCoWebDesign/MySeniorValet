import React, { useState } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Crown, CheckCircle, ArrowLeft, Mail, Phone, Building, User, FileText, Upload, DollarSign, Home, Camera, Sparkles, Shield, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { LoadingMascot } from "@/components/mascot";
import type { Community } from '@shared/schema';

export default function ClaimCommunity() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [claimForm, setClaimForm] = useState({
    fullName: '',
    title: '',
    email: '',
    phone: '',
    communityRole: '',
    verificationDocument: null as File | null,
    message: ''
  });

  // Fetch community data
  const { data: community, isLoading } = useQuery<Community>({
    queryKey: ['/api/communities', id],
    enabled: !!id,
  });

  // Submit claim request
  const claimMutation = useMutation({
    mutationFn: async (data: typeof claimForm) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(key, value);
        }
      });
      formData.append('communityId', id!);
      
      const response = await fetch('/api/communities/claim', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit claim request');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Claim Request Submitted!",
        description: "We'll review your request and contact you within 24 hours.",
      });
      setLocation(`/community/${id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit claim request. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <LoadingMascot message="Loading community information..." />;
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Community Not Found</h1>
          <Link href="/communities">
            <Button variant="outline">Browse Communities</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    claimMutation.mutate(claimForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/community/${id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
            </Button>
          </Link>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <Crown className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Claim Your Community Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Verified community profiles get 3x more qualified inquiries. Take control of your listing and attract the right residents.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Community Info Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2 text-blue-600" />
                  Community Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{community.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {community.address}, {community.city}, {community.state} {community.zipCode}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Benefits of Claiming:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Update pricing & availability in real-time</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Upload high-quality photos</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Manage amenities & services</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Respond to reviews & messages</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Priority placement in search results</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Claim Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Community Claim Form</CardTitle>
                <CardDescription>
                  Please provide verification that you are authorized to manage this community profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Contact Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={claimForm.fullName}
                          onChange={(e) => setClaimForm(prev => ({ ...prev, fullName: e.target.value }))}
                          required
                          placeholder="Your full name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="title">Job Title *</Label>
                        <Input
                          id="title"
                          value={claimForm.title}
                          onChange={(e) => setClaimForm(prev => ({ ...prev, title: e.target.value }))}
                          required
                          placeholder="e.g., Community Manager, Sales Director"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Business Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={claimForm.email}
                          onChange={(e) => setClaimForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                          placeholder="your.email@community.com"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={claimForm.phone}
                          onChange={(e) => setClaimForm(prev => ({ ...prev, phone: e.target.value }))}
                          required
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Role & Verification */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Verification
                    </h3>
                    
                    <div>
                      <Label htmlFor="communityRole">Your Role at the Community *</Label>
                      <Input
                        id="communityRole"
                        value={claimForm.communityRole}
                        onChange={(e) => setClaimForm(prev => ({ ...prev, communityRole: e.target.value }))}
                        required
                        placeholder="e.g., Executive Director, Regional Manager, Owner"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="verificationDocument">Verification Document</Label>
                      <div className="mt-1">
                        <Input
                          id="verificationDocument"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setClaimForm(prev => ({ ...prev, verificationDocument: file }));
                          }}
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Upload business card, employee ID, or letterhead to verify your role (optional but speeds up verification)
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Additional Information
                    </h3>
                    
                    <div>
                      <Label htmlFor="message">Message (Optional)</Label>
                      <Textarea
                        id="message"
                        value={claimForm.message}
                        onChange={(e) => setClaimForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Any additional information about your request or community updates you'd like to make..."
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Submit Section */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">What Happens Next?</h4>
                    </div>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 mb-4">
                      <li>• We'll review your claim within 24 hours</li>
                      <li>• You'll receive login credentials via email</li>
                      <li>• Start updating your profile immediately after verification</li>
                    </ul>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        type="submit" 
                        disabled={claimMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                      >
                        {claimMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Crown className="w-4 h-4 mr-2" />
                            Submit Claim Request
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => window.open('mailto:hello@myseniorvalet.com?subject=Community Claim Question', '_blank')}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Questions?
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}