import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, FileText } from "lucide-react";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function Accessibility() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader 
        title="Accessibility" 
        subtitle="Our commitment to digital accessibility"
      />
      
      {/* Skip to main content link for accessibility */}
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
            Accessibility Commitment
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            MySeniorValet is committed to ensuring digital accessibility for people with disabilities. 
            We continually improve the user experience for everyone.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" aria-hidden="true" />
                Our Standards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>MySeniorValet strives to conform to WCAG 2.2 Level AA standards, including:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Keyboard navigation support</li>
                <li>Screen reader compatibility</li>
                <li>High contrast color schemes</li>
                <li>Alternative text for images</li>
                <li>Focus indicators for interactive elements</li>
                <li>Semantic HTML structure</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accessibility Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Current accessibility features include:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Descriptive link text and button labels</li>
                <li>Proper heading structure (H1-H6)</li>
                <li>Alt text for all informative images</li>
                <li>Form labels and error descriptions</li>
                <li>Color contrast ratio of 4.5:1 or higher</li>
                <li>Responsive design for various devices</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Request Accessibility Accommodations</CardTitle>
            <CardDescription>
              If you encounter accessibility barriers or need assistance, please contact us.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-1" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-gray-600">hello@myseniorvalet.com</p>
                  <p className="text-sm text-gray-500 mt-1">
                    We aim to respond within 2 business days
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-blue-600 mt-1" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-gray-600">1-855-MY-VALET (1-855-698-2538)</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Monday - Friday, 9 AM - 5 PM PT
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">When contacting us, please include:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Description of the accessibility barrier</li>
                <li>• The page or feature where you encountered the issue</li>
                <li>• Your preferred method of accommodation</li>
                <li>• Any assistive technology you're using</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Ongoing Efforts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              We're continuously working to improve accessibility across MySeniorValet:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Regular accessibility audits using automated and manual testing</li>
              <li>Training our development team on accessibility best practices</li>
              <li>User testing with people who use assistive technologies</li>
              <li>Following Web Content Accessibility Guidelines (WCAG) 2.2</li>
              <li>Incorporating accessibility considerations into our design process</li>
            </ul>
            
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Last updated:</strong> January 2025 | 
                <strong> Next review:</strong> April 2025
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}