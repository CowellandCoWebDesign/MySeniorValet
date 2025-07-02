import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Eye, UserX, Download, Mail } from "lucide-react";

export default function Privacy() {
  const [doNotSell, setDoNotSell] = useState(false);

  useEffect(() => {
    // Load preference from localStorage
    const saved = localStorage.getItem('doNotSell');
    if (saved === 'true') {
      setDoNotSell(true);
    }
  }, []);

  const handleDoNotSellToggle = (checked: boolean) => {
    setDoNotSell(checked);
    localStorage.setItem('doNotSell', checked.toString());
    
    // TODO: Implement actual ad blocking logic
    if (checked) {
      // Hide display ads
      const ads = document.querySelectorAll('.display-ad, [data-ad]');
      ads.forEach(ad => {
        (ad as HTMLElement).style.display = 'none';
      });
    } else {
      // Show display ads
      const ads = document.querySelectorAll('.display-ad, [data-ad]');
      ads.forEach(ad => {
        (ad as HTMLElement).style.display = '';
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Skip to main content link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>

      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how TrueView collects, 
            uses, and protects your personal information.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: January 2025 | Effective: January 1, 2025
          </p>
        </div>

        {/* CPRA Compliance - Do Not Sell Toggle */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-blue-600" aria-hidden="true" />
              California Privacy Rights (CPRA)
            </CardTitle>
            <CardDescription>
              Control how your personal information is shared
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg">
              <div className="flex-1">
                <Label htmlFor="do-not-sell" className="text-base font-medium">
                  Do Not Sell or Share My Personal Information
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  This will opt you out of data sharing for advertising purposes and hide display ads.
                </p>
              </div>
              <Switch
                id="do-not-sell"
                checked={doNotSell}
                onCheckedChange={handleDoNotSellToggle}
                aria-describedby="do-not-sell-description"
              />
            </div>
            {doNotSell && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
                ✓ Your preference has been saved. We will not sell or share your personal information for advertising.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" aria-hidden="true" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Information You Provide:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Search queries and location preferences</li>
                  <li>Contact information when claiming community profiles</li>
                  <li>Feedback and reviews you submit</li>
                  <li>Account information if you create an account</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Information Automatically Collected:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Device information and browser type</li>
                  <li>IP address and approximate location</li>
                  <li>Pages visited and time spent on site</li>
                  <li>Referral sources and search terms</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" aria-hidden="true" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Provide personalized search results and recommendations</li>
                <li>Improve our services and user experience</li>
                <li>Communicate with you about your requests</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
                <li>Analyze usage patterns to enhance our platform</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>We do not sell your personal information.</strong></p>
              
              <div>
                <h3 className="font-semibold mb-2">We may share information with:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Service providers who help operate our platform</li>
                  <li>Senior living communities when you request contact</li>
                  <li>Legal authorities when required by law</li>
                  <li>Analytics providers for aggregated, non-personal data</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 font-medium">Important:</p>
                <p className="text-yellow-700 text-sm mt-1">
                  TrueView does not receive referral fees from senior living communities. 
                  We are an independent information platform.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Access & Control:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Request access to your data</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your account and data</li>
                    <li>Download your data</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">California Residents:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Opt-out of data sharing</li>
                    <li>Non-discrimination protection</li>
                    <li>Right to know categories of data</li>
                    <li>Right to limit sensitive data use</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">We protect your information using industry-standard security measures:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data</li>
                <li>Secure data storage and backup systems</li>
                <li>Employee training on data protection</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" aria-hidden="true" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                For privacy-related questions or to exercise your rights:
              </p>
              
              <div className="space-y-3">
                <div>
                  <strong>Email:</strong> privacy@trueview.com
                </div>
                <div>
                  <strong>Phone:</strong> 1-855-TRUE-VIEW (1-855-878-3834)
                </div>
                <div>
                  <strong>Mail:</strong><br />
                  TrueView Privacy Team<br />
                  123 Technology Way<br />
                  San Francisco, CA 94105
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download My Data
                </Button>
                <Button variant="outline">
                  Delete My Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Policy Updates</h2>
          <p className="text-gray-700 text-sm">
            We may update this privacy policy periodically. We'll notify you of significant 
            changes by email or through our website. Your continued use of TrueView after 
            such changes constitutes acceptance of the updated policy.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}