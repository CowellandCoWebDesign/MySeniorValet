import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, Building, Shield, Users, MessageSquare } from "lucide-react";

export default function Claim() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    communityName: "",
    contactName: "",
    title: "",
    email: "",
    phone: "",
    licenseNumber: "",
    message: "",
    agreeToTerms: false,
  });

  const claimMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // In a real app, this would create a claim request
      return apiRequest("POST", "/api/claims", data);
    },
    onSuccess: () => {
      toast({
        title: "Claim Request Submitted",
        description: "We'll review your claim and contact you within 2 business days.",
      });
      // Reset form
      setFormData({
        communityName: "",
        contactName: "",
        title: "",
        email: "",
        phone: "",
        licenseNumber: "",
        message: "",
        agreeToTerms: false,
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    claimMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="gradient-hero py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
            Claim Your Community Profile
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Take control of your community's online presence and showcase your commitment to transparency.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Verify Ownership</h3>
              <p className="text-sm text-gray-600 text-center">
                Prove you represent the senior living community
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Update Information</h3>
              <p className="text-sm text-gray-600 text-center">
                Keep your community data accurate and current
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Connect with Families</h3>
              <p className="text-sm text-gray-600 text-center">
                Respond to inquiries and showcase your services
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Claim Form */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Benefits Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Benefits of Claiming</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Real-time Updates</h4>
                      <p className="text-sm text-gray-600">Update your information instantly</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Direct Communication</h4>
                      <p className="text-sm text-gray-600">Respond to family inquiries directly</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Transparency Badge</h4>
                      <p className="text-sm text-gray-600">Show your commitment to transparency</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Analytics Dashboard</h4>
                      <p className="text-sm text-gray-600">Track profile views and inquiries</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Priority Support</h4>
                      <p className="text-sm text-gray-600">Get dedicated customer support</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Claim Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Claim Request Form</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="communityName">Community Name *</Label>
                        <Input
                          id="communityName"
                          value={formData.communityName}
                          onChange={(e) => handleInputChange('communityName', e.target.value)}
                          placeholder="Enter your community name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="licenseNumber">License Number *</Label>
                        <Input
                          id="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                          placeholder="Your state license number"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="contactName">Your Full Name *</Label>
                        <Input
                          id="contactName"
                          value={formData.contactName}
                          onChange={(e) => handleInputChange('contactName', e.target.value)}
                          placeholder="First and last name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="title">Your Title/Position *</Label>
                        <Select value={formData.title} onValueChange={(value) => handleInputChange('title', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="administrator">Administrator</SelectItem>
                            <SelectItem value="director">Executive Director</SelectItem>
                            <SelectItem value="manager">General Manager</SelectItem>
                            <SelectItem value="marketing">Marketing Director</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="email">Business Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your@community.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="(555) 123-4567"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Additional Information</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Tell us about your community and why you'd like to claim this profile..."
                        rows={4}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Optional: Share any additional context that would help us verify your claim.
                      </p>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange('agreeToTerms', !!checked)}
                      />
                      <Label htmlFor="agreeToTerms" className="text-sm leading-5">
                        I agree to the{" "}
                        <a href="#" className="text-primary hover:underline">Terms of Service</a>{" "}
                        and{" "}
                        <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                        I confirm that I am authorized to represent this senior living community and that the information provided is accurate.
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={claimMutation.isPending}
                    >
                      {claimMutation.isPending ? "Submitting..." : "Submit Claim Request"}
                    </Button>

                    <div className="text-center text-sm text-gray-500">
                      <p>
                        Our team will review your claim within 2 business days and contact you with next steps.
                        Questions? Email us at{" "}
                        <a href="mailto:claims@trueview.com" className="text-primary hover:underline">
                          claims@trueview.com
                        </a>
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
