import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, Phone, Calendar, ArrowRight, FileText, TrendingUp, Users, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function VendorWelcome() {
  const [, setLocation] = useLocation();
  const [, params] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const paymentIntent = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
  const redirectStatus = searchParams.get('redirect_status');

  const { data: vendorInfo, isLoading } = useQuery({
    queryKey: ['/api/vendor-registration-status'],
    enabled: !!paymentIntent,
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/vendor-registration-status', {
        paymentIntent,
        paymentIntentClientSecret
      });
      return response.json();
    }
  });

  if (redirectStatus !== 'succeeded') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Payment Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't process your payment. Please try again or contact support.
            </p>
            <div className="space-y-3">
              <Button onClick={() => setLocation('/vendor-signup')} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => setLocation('/')} className="w-full">
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Welcome to MySeniorValet Partners!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Your registration is complete. Here's what happens next:
          </p>
        </div>

        {/* Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Check Your Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We've sent a welcome email to {vendorInfo?.email} with:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Your vendor dashboard login details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Quick start guide</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Best practices for your listing</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Within 24 Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our team will review and activate your listing:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Profile verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Service area confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Listing optimization tips</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Plan Summary */}
        {vendorInfo && (
          <Card className="mb-12">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Subscription</CardTitle>
                <Badge className="bg-purple-600 text-white">
                  {vendorInfo.planType} Plan
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Business Name</p>
                  <p className="font-semibold">{vendorInfo.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Billing</p>
                  <p className="font-semibold">${vendorInfo.monthlyAmount}/month</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Vendor Resources</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Marketing materials, guides, and best practices
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Access Resources
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Track views, leads, and performance metrics
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Partner Community</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Connect with other verified partners
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Join Community
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={() => setLocation('/vendor/dashboard')}
          >
            <Shield className="w-5 h-5 mr-2" />
            Go to Vendor Dashboard
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => setLocation('/')}
          >
            Return to Homepage
          </Button>
        </div>

        {/* Support Footer */}
        <div className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            Need help? Contact our vendor support team:
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="mailto:vendors@myseniorvalet.com" className="flex items-center gap-1 hover:text-purple-600">
              <Mail className="w-4 h-4" />
              vendors@myseniorvalet.com
            </a>
            <span className="text-gray-400">|</span>
            <a href="tel:1-800-VENDORS" className="flex items-center gap-1 hover:text-purple-600">
              <Phone className="w-4 h-4" />
              1-800-VENDORS
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}