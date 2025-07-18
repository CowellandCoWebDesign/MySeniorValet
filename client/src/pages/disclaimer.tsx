import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, Info, FileText } from "lucide-react";

export default function Disclaimer() {
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
            Disclaimer
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Important information about the use and limitations of TrueView's services and content.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: January 2025
          </p>
        </div>

        <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                Important Notice
              </h2>
              <p className="text-yellow-700">
                TrueView provides publicly available information only and does not collect referral fees. 
                The information provided is for educational and informational purposes only and should not 
                be considered as professional advice.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" aria-hidden="true" />
                No Professional Advice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2">
                  TrueView does not provide:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-red-700">
                  <li><strong>Medical advice</strong> - Consult healthcare professionals for medical decisions</li>
                  <li><strong>Legal advice</strong> - Contact qualified attorneys for legal matters</li>
                  <li><strong>Financial advice</strong> - Seek certified financial advisors for financial planning</li>
                  <li><strong>Placement services</strong> - We are not a licensed placement agency</li>
                </ul>
              </div>
              
              <p className="text-gray-700">
                All information on TrueView is provided for general informational purposes only. 
                You should consult with appropriate professionals before making any decisions 
                regarding senior care placement, medical treatment, or financial planning.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" aria-hidden="true" />
                Information Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                While we strive to provide accurate and current information, TrueView makes no 
                representations or warranties about:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>The accuracy, completeness, or reliability of any information</li>
                <li>The availability of services or facilities at any given time</li>
                <li>Current pricing, which may change without notice</li>
                <li>The quality of care or services provided by any community</li>
                <li>Compliance with local, state, or federal regulations</li>
              </ul>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Verification Required:</strong> All information should be independently 
                  verified directly with the senior living communities before making any decisions.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" aria-hidden="true" />
                Independent Platform
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">We Are:</h3>
                  <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
                    <li>An independent information platform</li>
                    <li>Committed to transparency</li>
                    <li>Focused on providing public information</li>
                    <li>Free to use for consumers</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-2">We Are Not:</h3>
                  <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
                    <li>A licensed placement agency</li>
                    <li>Receiving referral fees</li>
                    <li>Endorsed by any communities</li>
                    <li>Responsible for placement decisions</li>
                  </ul>
                </div>
              </div>

              <p className="text-gray-700 text-sm">
                MySeniorValet operates independently from all senior living communities listed on our platform. 
                We do not have financial relationships with these communities that would influence our 
                information presentation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                MySeniorValet aggregates information from various sources, including:
              </p>
              
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Public records and government databases</li>
                <li>User-submitted reviews and ratings</li>
                <li>Community websites and marketing materials</li>
                <li>Third-party review platforms (Google, Yelp, etc.)</li>
              </ul>

              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-700 text-sm">
                  <strong>Third-Party Disclaimer:</strong> We are not responsible for the accuracy 
                  or content of third-party sources. External links are provided for convenience 
                  and do not constitute endorsement.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Users of TrueView are responsible for:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Conducting their own due diligence before making decisions</li>
                <li>Verifying all information independently with communities</li>
                <li>Consulting with appropriate professionals (medical, legal, financial)</li>
                <li>Visiting and evaluating communities in person</li>
                <li>Reading and understanding community contracts and policies</li>
                <li>Ensuring suitability for specific care needs</li>
              </ul>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-amber-800 text-sm">
                  <strong>Important:</strong> The decision to move to or engage with any senior 
                  living community is yours alone. TrueView cannot and does not make recommendations 
                  about the suitability of any community for your specific needs.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                TrueView, its officers, directors, employees, and agents shall not be liable for:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Any decisions made based on information from our platform</li>
                <li>The quality of care or services at any community</li>
                <li>Financial losses related to community selection</li>
                <li>Inaccurate or outdated information</li>
                <li>Technical issues or service interruptions</li>
                <li>Actions of third-party communities or service providers</li>
              </ul>

              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-red-800 text-sm font-medium">
                  Use of this platform is at your own risk. TrueView provides information 
                  "as is" without warranties of any kind.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Situations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">Emergency Notice</h3>
                    <p className="text-red-700 text-sm">
                      TrueView is not an emergency service. In case of medical emergencies, 
                      call 911 immediately. For urgent care needs, contact healthcare providers 
                      or emergency services directly.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact for Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                If you have questions about this disclaimer or our services:
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