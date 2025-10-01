import { NavigationHeader } from "@/components/NavigationHeader";

export default function LegalNotice() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <NavigationHeader 
        title="Legal Notice"
        subtitle="Important information about using MySeniorValet"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Legal Notice
          </h1>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-200 mb-4">
              ⚠️ IMPORTANT: Free Platform for Families
            </h2>
            <p className="text-amber-800 dark:text-amber-300 text-lg leading-relaxed">
              MySeniorValet is a <strong>FREE PLATFORM FOR FAMILIES</strong> providing transparency 
              in senior care. We aggregate and display public information from verified sources 
              to help families make informed decisions, while facilitating connections with communities.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Platform Purpose & Limitations
            </h2>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-200 mb-3">
                📚 Free Tools & Transparent Information
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We aggregate publicly available information from government databases, official 
                sources, and verified public records. All data includes citations to original 
                sources for your verification.
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>HUD Housing Database for affordable senior housing</li>
                <li>CMS (Medicare/Medicaid) quality ratings and inspection reports</li>
                <li>State licensing databases for facility information</li>
                <li>Public health department records</li>
                <li>Official facility websites and published materials</li>
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-red-900 dark:text-red-200 mb-3">
                🚫 Not a Placement Agency
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We facilitate connections between families and communities but are <strong>NOT</strong> 
                a placement agency. We do not make recommendations or receive referral fees from 
                communities. All family features are completely FREE including research, tour scheduling, 
                emergency contacts, and collaboration tools.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>Important:</strong> Always verify information independently, visit facilities 
                in person, and consult with healthcare professionals, eldercare attorneys, and 
                financial advisors before making decisions.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Revenue Disclosure
            </h2>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                💰 How We Make Money (Full Transparency)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Community Listings
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Community listings appear without our receiving compensation unless explicitly 
                    marked as <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                    "Premium Partner"</span> or <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                    "Sponsored"</span>. We clearly label any paid placements.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Affiliate Partnerships
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    We may receive affiliate commissions from clearly marked partners:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
                    <li>Amazon (senior living products)</li>
                    <li>1-800-Flowers (gift delivery services)</li>
                  </ul>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Affiliate links are always clearly marked with appropriate disclosure.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    B2B Subscriptions
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Our primary revenue comes from B2B subscriptions:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
                    <li>Communities: Analytics and management tools</li>
                    <li>Healthcare Professionals: Enhanced directories</li>
                    <li>Vendors: Marketplace access and tools</li>
                  </ul>
                  <p className="text-green-700 dark:text-green-400 font-semibold mt-3">
                    ✅ We do NOT charge families any fees or commissions - ever
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Data Accuracy & Verification
            </h2>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-200 mb-3">
                🏆 The Golden Data Rule
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                <strong>"Authentic data wins every time."</strong> We believe in complete transparency 
                and data accuracy. Our multi-source verification process ensures:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Cross-referencing multiple government databases</li>
                <li>Regular updates from official sources</li>
                <li>Clear citation of all data sources</li>
                <li>Timestamp tracking for data freshness</li>
                <li>Community verification and correction processes</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Disclaimer of Warranties
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              MySeniorValet is provided "as is" without any warranties, express or implied. 
              We do not guarantee the accuracy, completeness, or timeliness of information, 
              despite our best efforts to maintain accurate data.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The platform is not a substitute for professional advice. Always consult with 
              qualified healthcare providers, legal advisors, and financial professionals 
              for decisions affecting health, legal matters, or finances.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              MySeniorValet, its affiliates, partners, and team members shall not be liable 
              for any direct, indirect, incidental, special, consequential, or punitive damages 
              resulting from your use of the platform, including but not limited to decisions 
              made based on information found on our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              User Responsibilities
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              By using MySeniorValet, you agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Use the platform for research and informational purposes only</li>
              <li>Independently verify all information before making decisions</li>
              <li>Visit facilities in person before making commitments</li>
              <li>Consult with appropriate professionals for advice</li>
              <li>Not rely solely on our platform for healthcare decisions</li>
              <li>Report any inaccuracies you discover to help improve our data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Intellectual Property
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              All content, features, and functionality on MySeniorValet are owned by us 
              and are protected by international copyright, trademark, and other intellectual 
              property laws. Government data remains in the public domain as required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                For legal inquiries or concerns, please contact us:
              </p>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Email:</strong> admin@myseniorvalet.com</li>
                <li><strong>Legal Team:</strong> admin@myseniorvalet.com</li>
                <li><strong>Data Accuracy:</strong> admin@myseniorvalet.com</li>
              </ul>
            </div>
          </section>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <p className="text-green-800 dark:text-green-200 text-center font-semibold">
                ✅ By using MySeniorValet, you acknowledge that you have read, understood, 
                and agree to use our platform for research purposes only.
              </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6">
              This Legal Notice is effective as of August 7, 2025, and governs your use 
              of the MySeniorValet platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}