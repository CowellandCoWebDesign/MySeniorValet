import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavigationHeader } from "@/components/NavigationHeader";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Shield, Clock, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DmcaNotice() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    communityId: '',
    serviceId: '',
    contentType: '',
    contentUrl: '',
    claimantName: '',
    claimantEmail: '',
    claimantPhone: '',
    claimDescription: '',
    copyrightInfo: '',
    signature: ''
  });

  const dmcaMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/dmca/submit', data),
    onSuccess: (response) => {
      toast({
        title: "DMCA Notice Received",
        description: `Your takedown notice has been submitted. Reference: ${response.referenceNumber}`,
      });
      // Reset form
      setFormData({
        communityId: '',
        serviceId: '',
        contentType: '',
        contentUrl: '',
        claimantName: '',
        claimantEmail: '',
        claimantPhone: '',
        claimDescription: '',
        copyrightInfo: '',
        signature: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting DMCA notice",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.claimantName || !formData.claimantEmail || !formData.contentType || 
        !formData.claimDescription || !formData.signature) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields marked with *",
        variant: "destructive",
      });
      return;
    }

    // Validate description length
    if (formData.claimDescription.length < 50) {
      toast({
        title: "Description too short",
        description: "Please provide a detailed description (minimum 50 characters)",
        variant: "destructive",
      });
      return;
    }

    // Convert IDs to numbers if provided
    const submitData = {
      ...formData,
      communityId: formData.communityId ? parseInt(formData.communityId) : undefined,
      serviceId: formData.serviceId ? parseInt(formData.serviceId) : undefined
    };

    dmcaMutation.mutate(submitData);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader 
        title="DMCA Takedown Notice" 
        subtitle="Copyright infringement reporting"
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Information Banner */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  DMCA Safe Harbor Compliance
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                  MySeniorValet operates under DMCA safe harbor provisions. We respect intellectual property rights 
                  and will respond promptly to valid takedown notices.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-blue-700 dark:text-blue-300">
                    <Clock className="w-4 h-4 mr-2" />
                    Response within 24 hours
                  </div>
                  <div className="flex items-center text-blue-700 dark:text-blue-300">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Immediate content removal
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DMCA Notice Form */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Submit DMCA Takedown Notice
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Content Identification Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  1. Identify the Content
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Community ID (if applicable)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      placeholder="e.g., 12345"
                      value={formData.communityId}
                      onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
                      disabled={dmcaMutation.isPending}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Service/Vendor ID (if applicable)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      placeholder="e.g., 67890"
                      value={formData.serviceId}
                      onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                      disabled={dmcaMutation.isPending}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content Type *
                  </label>
                  <Select
                    value={formData.contentType}
                    onValueChange={(value) => setFormData({ ...formData, contentType: value })}
                    disabled={dmcaMutation.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select the type of content" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photo">Photograph/Image</SelectItem>
                      <SelectItem value="description">Text/Description</SelectItem>
                      <SelectItem value="logo">Logo/Brand Mark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content URL (if available)
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="https://example.com/image.jpg"
                    value={formData.contentUrl}
                    onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                    disabled={dmcaMutation.isPending}
                  />
                </div>
              </div>

              {/* Claimant Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  2. Your Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Your legal name"
                    value={formData.claimantName}
                    onChange={(e) => setFormData({ ...formData, claimantName: e.target.value })}
                    disabled={dmcaMutation.isPending}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      placeholder="your@email.com"
                      value={formData.claimantEmail}
                      onChange={(e) => setFormData({ ...formData, claimantEmail: e.target.value })}
                      disabled={dmcaMutation.isPending}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      placeholder="(555) 123-4567"
                      value={formData.claimantPhone}
                      onChange={(e) => setFormData({ ...formData, claimantPhone: e.target.value })}
                      disabled={dmcaMutation.isPending}
                    />
                  </div>
                </div>
              </div>

              {/* Claim Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  3. Copyright Claim Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Detailed Description of Infringement * (minimum 50 characters)
                  </label>
                  <textarea
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Please provide a detailed description of the copyrighted work and how it is being infringed..."
                    value={formData.claimDescription}
                    onChange={(e) => setFormData({ ...formData, claimDescription: e.target.value })}
                    disabled={dmcaMutation.isPending}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formData.claimDescription.length}/50 characters minimum
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Copyright Registration Info (if available)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Registration number or other copyright information"
                    value={formData.copyrightInfo}
                    onChange={(e) => setFormData({ ...formData, copyrightInfo: e.target.value })}
                    disabled={dmcaMutation.isPending}
                  />
                </div>
              </div>

              {/* Legal Statements */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-semibold mb-2">Required Legal Statements:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>I have a good faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law</li>
                      <li>The information in this notice is accurate</li>
                      <li>Under penalty of perjury, I am authorized to act on behalf of the copyright owner</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Electronic Signature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Electronic Signature * (Type your full name)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Your full legal name as electronic signature"
                  value={formData.signature}
                  onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                  disabled={dmcaMutation.isPending}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  By typing your name, you certify that all information provided is accurate under penalty of perjury
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  disabled={dmcaMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={dmcaMutation.isPending}
                >
                  {dmcaMutation.isPending ? 'Submitting...' : 'Submit DMCA Notice'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="mt-8 bg-gray-50 dark:bg-gray-800">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              What Happens Next?
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>We'll review your notice within 24 hours</li>
              <li>If valid, the content will be removed immediately</li>
              <li>You'll receive a confirmation email with a reference number</li>
              <li>The content provider may submit a counter-notice within 14 days</li>
              <li>If no counter-notice is received, the content remains removed</li>
            </ol>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Alternative Contact:</strong> You can also email DMCA notices directly to{' '}
                <a href="mailto:dmca@myseniorvalet.com" className="underline">
                  dmca@myseniorvalet.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}