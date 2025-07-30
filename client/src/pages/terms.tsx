import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Scale, AlertTriangle, Users, Shield } from "lucide-react";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader 
        title="Terms of Service" 
        subtitle="Our platform usage terms and conditions"
      />
      
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
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Please read these terms carefully before using MySeniorValet. By accessing 
            our platform, you agree to these terms and conditions.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: January 2025 | Effective: January 1, 2025
          </p>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" aria-hidden="true" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                By accessing and using MySeniorValet ("the Service"), you accept and agree to be bound by 
                the terms and provision of this agreement. If you do not agree to abide by the above, 
                please do not use this service.
              </p>
              <p>
                These Terms of Service apply to all users of the website, including without limitation 
                users who are browsers, vendors, customers, merchants, and/or contributors of content.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" aria-hidden="true" />
                Service Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                MySeniorValet is an informational platform that provides:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Search and discovery tools for senior living communities</li>
                <li>Publicly available information about facilities and services</li>
                <li>User reviews and community ratings</li>
                <li>Educational resources about senior care options</li>
              </ul>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium">Important:</p>
                <p className="text-blue-700 text-sm mt-1">
                  MySeniorValet is not a licensed placement agency and does not receive referral fees. 
                  We provide information only - all placement decisions are between you and the communities.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" aria-hidden="true" />
                Founder Ownership & Platform Independence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium mb-3">Founder Ownership Statement:</p>
                <p className="text-blue-700 text-sm mb-3">
                  MySeniorValet is an independent platform solely founded, developed, and operated by Scott Cowell. 
                  The platform was created entirely on personal time, without the use of any company-owned 
                  systems, confidential materials, employee collaboration, or proprietary intellectual property.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-medium mb-3">Platform Independence:</p>
                <p className="text-green-700 text-sm mb-3">
                  MySeniorValet is not affiliated with, endorsed by, or developed on behalf of any senior living 
                  brand, operator, management company, parent organization, or affiliated entity — including 
                  but not limited to Discovery Senior Living, Provincial Senior Living, Atria Senior Living, 
                  Brookdale Senior Living, Sunrise Senior Living, Holiday by Atria, or any national, regional, 
                  or local senior housing provider or partner.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-800 font-medium mb-3">Rights & Ownership:</p>
                <p className="text-gray-700 text-sm">
                  No operator, employer, or entity outside of Scott Cowell holds any ownership, control, or 
                  development rights in the platform, unless such a relationship is explicitly established 
                  through a future written agreement. All rights — past, present, and future — are retained 
                  by Scott Cowell as the sole creator and founder.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" aria-hidden="true" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">You agree to:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Provide accurate information when using our services</li>
                  <li>Use the platform only for lawful purposes</li>
                  <li>Respect the privacy and rights of other users</li>
                  <li>Not attempt to interfere with or disrupt the service</li>
                  <li>Verify all information independently before making decisions</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Prohibited activities include:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Submitting false or misleading information</li>
                  <li>Attempting to access unauthorized areas of the platform</li>
                  <li>Using automated tools to extract data without permission</li>
                  <li>Posting inappropriate or offensive content</li>
                  <li>Violating any applicable laws or regulations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                While we strive to provide accurate and up-to-date information, MySeniorValet makes no 
                warranties about the completeness, reliability, or accuracy of the information provided.
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Community information is sourced from public records and user submissions</li>
                <li>Availability, pricing, and services may change without notice</li>
                <li>Users should verify all information directly with communities</li>
                <li>We are not responsible for decisions made based on our information</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                The MySeniorValet platform, including its design, features, and content, is protected by 
                intellectual property laws.
              </p>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">Our Content:</h3>
                  <p className="text-gray-700 text-sm">
                    MySeniorValet owns or has rights to all platform content, including text, graphics, 
                    logos, and software. You may not reproduce or distribute this content without permission.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold">User Content:</h3>
                  <p className="text-gray-700 text-sm">
                    By submitting content (reviews, comments, etc.), you grant MySeniorValet a license to 
                    use, display, and distribute that content on our platform.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                MySeniorValet provides information "as is" without warranties of any kind.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">We are not liable for:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Decisions made based on information from our platform</li>
                    <li>Interactions or transactions with senior living communities</li>
                    <li>Technical issues or service interruptions</li>
                    <li>Third-party content or links</li>
                    <li>Loss of data or unauthorized access to your account</li>
                  </ul>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-800 font-medium">Maximum Liability:</p>
                  <p className="text-red-700 text-sm mt-1">
                    Our total liability to you for any claims shall not exceed $100 or the amount 
                    you paid to use our services, whichever is greater.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy and Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Your privacy is important to us. Please review our Privacy Policy for details on 
                how we collect, use, and protect your information.
              </p>
              
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>We collect only necessary information to provide our services</li>
                <li>We do not sell personal information to third parties</li>
                <li>You have rights to access, correct, and delete your data</li>
                <li>We use industry-standard security measures</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                We reserve the right to terminate or suspend access to our service immediately, 
                without prior notice, for conduct that we believe violates these Terms of Service.
              </p>
              
              <p className="text-gray-700">
                Upon termination, your right to use the service will cease immediately. 
                Provisions that should survive termination will remain in effect.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                We reserve the right to modify these terms at any time. Changes will be effective 
                when posted on this page with an updated revision date.
              </p>
              
              <p className="text-gray-700">
                Your continued use of MySeniorValet after any changes constitutes acceptance of the 
                new terms. We encourage you to review these terms periodically.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              
              <div className="space-y-2">
                <div><strong>Email:</strong> legal@myseniorvalet.com</div>
                <div><strong>Phone:</strong> 1-855-MY-VALET (1-855-698-2538)</div>
                <div>
                  <strong>Mail:</strong><br />
                  MySeniorValet Legal Department<br />
                  123 Technology Way<br />
                  San Francisco, CA 94105
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}